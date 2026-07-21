import Anthropic from "@anthropic-ai/sdk";
import { buildFallbackQuiz } from "./fallback-quiz";
import type { ChatSignals, QuizQuestion, Relationship } from "./types";

/**
 * Server-side quiz generation. Receives only the minimized signals extracted
 * in the browser (never the raw chat) and asks Claude to write the quiz.
 * Falls back to a deterministic template quiz when no API key is configured.
 */

const TONE: Record<Relationship, string> = {
  partner:
    "Warm-teasing and a touch nostalgic. Playful jabs are fine, but the undertone is affection — this quiz is a love letter disguised as a roast.",
  friend:
    "Maximum roast, inside-joke energy. Cheeky and savage about chat *behavior* (triple-texting, leaving people on read, essay-length messages) — never about appearance or character.",
  family:
    "Light and warm. Dial the roast way down — gentle, wholesome humor the whole family can enjoy. No edgy jokes.",
  group:
    "Maximum roast, inside-joke energy for a friend group. Call out chat dynamics (who lurks, who spams, who never answers) — always affectionate, never mean about a person's looks or character.",
};

const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Short punchy quiz title in the chat's language, sentence case",
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
            description: "Exactly 4 answer options",
          },
          correctIndex: {
            type: "integer",
            description: "Index (0-3) of the correct option",
          },
          spice: {
            type: "string",
            description:
              "One-line playful comment revealed after answering, referencing the real stat behind the question",
          },
        },
        required: ["question", "options", "correctIndex", "spice"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "questions"],
  additionalProperties: false,
} as const;

function buildPrompt(signals: ChatSignals, relationship: Relationship): string {
  const lang =
    signals.language === "he"
      ? "Hebrew"
      : signals.language === "mixed"
        ? "the dominant language of the snippets (mixed Hebrew/English chat — match how they actually write)"
        : "English";

  return `You are the quiz writer for Yapped, an app that turns a WhatsApp chat into a trivia game friends play against each other.

Below is a JSON object of statistics and a few short quotes extracted from a real WhatsApp chat. This is everything you know about the chat — you never saw the full conversation.

<chat_signals>
${JSON.stringify(signals, null, 2)}
</chat_signals>

Relationship type: ${relationship}
Tone: ${TONE[relationship]}

Write a multiple-choice trivia quiz of exactly 10 questions about this chat, in ${lang}.

Rules:
- Every question's correct answer MUST be directly derivable from the signals above. Never invent facts. If a stat isn't in the data, don't ask about it.
- Good question types: who sends more/longer messages, who starts conversations, who triple-texts, most-used emoji, what time of day the chat is alive, busiest month, total message count, longest daily streak, who said a specific quote, distinctive words someone overuses.
- 4 options per question, exactly one correct. Make wrong options genuinely plausible (real participant names, believable numbers in the right ballpark, similar emojis).
- Vary correctIndex across questions — don't cluster answers on the same position.
- For number questions, format numbers with thousands separators and keep distractors within ~0.5x–3x of the truth.
- The "spice" line lands the joke: reference the actual number or behavior. Roast the chat behavior, never a person's appearance or character.
- Participant names must be written exactly as they appear in the signals.
- Sentence case everywhere. No corporate filler. Emoji only as occasional punchline punctuation.`;
}

export interface GeneratedQuiz {
  title: string;
  questions: QuizQuestion[];
  usedFallback: boolean;
}

function validateQuestions(raw: unknown): { title: string; questions: QuizQuestion[] } | null {
  const data = raw as { title?: unknown; questions?: unknown };
  if (typeof data?.title !== "string" || !Array.isArray(data.questions)) return null;
  const questions: QuizQuestion[] = [];
  for (const q of data.questions as Array<Record<string, unknown>>) {
    if (
      typeof q?.question !== "string" ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.options.every((o) => typeof o === "string") ||
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    ) {
      continue;
    }
    questions.push({
      question: q.question,
      options: q.options as string[],
      correctIndex: q.correctIndex,
      spice: typeof q.spice === "string" ? q.spice : undefined,
    });
  }
  if (questions.length < 5) return null;
  return { title: data.title, questions: questions.slice(0, 12) };
}

export async function generateQuiz(
  signals: ChatSignals,
  relationship: Relationship
): Promise<GeneratedQuiz> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("[yapped] ANTHROPIC_API_KEY not set — using template quiz generator");
    return { ...buildFallbackQuiz(signals, relationship), usedFallback: true };
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: {
        format: { type: "json_schema", schema: QUIZ_SCHEMA },
      },
      messages: [{ role: "user", content: buildPrompt(signals, relationship) }],
    });

    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("empty model response");
    const parsed = validateQuestions(JSON.parse(text));
    if (!parsed) throw new Error("model response failed validation");
    return { ...parsed, usedFallback: false };
  } catch (err) {
    console.error("[yapped] AI generation failed, falling back to template quiz:", err);
    return { ...buildFallbackQuiz(signals, relationship), usedFallback: true };
  }
}

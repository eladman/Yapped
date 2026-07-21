import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/generate";
import { newAdminToken, newId, newSlug } from "@/lib/ids";
import { getStore } from "@/lib/store";
import type { ChatSignals, QuizRecord, Relationship } from "@/lib/types";

export const maxDuration = 120; // AI generation can take a while

const RELATIONSHIPS: Relationship[] = ["partner", "friend", "family", "group"];

/**
 * POST /api/quiz — create a quiz from browser-extracted signals.
 * The request body contains ONLY minimized signals, never raw chat text.
 */
export async function POST(req: NextRequest) {
  let body: { signals?: ChatSignals; relationship?: Relationship };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { signals, relationship } = body;
  if (!signals || !relationship || !RELATIONSHIPS.includes(relationship)) {
    return NextResponse.json({ error: "Missing signals or relationship" }, { status: 400 });
  }
  if (!Array.isArray(signals.participants) || signals.participants.length < 2) {
    return NextResponse.json(
      { error: "Need at least 2 participants in the chat" },
      { status: 400 }
    );
  }
  if (!signals.totalMessages || signals.totalMessages < 30) {
    return NextResponse.json(
      { error: "This chat is too short to make a good quiz (need at least ~30 messages)" },
      { status: 400 }
    );
  }

  const generated = await generateQuiz(signals, relationship);

  const quiz: QuizRecord = {
    id: newId(),
    createdAt: new Date().toISOString(),
    relationship,
    language: signals.language,
    status: "preview",
    shareSlug: newSlug(),
    adminToken: newAdminToken(),
    title: generated.title,
    questions: generated.questions,
    stats: {
      totalMessages: signals.totalMessages,
      firstDate: signals.firstDate,
      lastDate: signals.lastDate,
      topEmojis: signals.topEmojis.slice(0, 3),
    },
    priceAgorot: 1900,
  };

  await getStore().createQuiz(quiz);

  // Preview response: first 3 questions only, no correct answers exposed.
  return NextResponse.json({
    adminToken: quiz.adminToken,
    title: quiz.title,
    totalQuestions: quiz.questions.length,
    priceAgorot: quiz.priceAgorot,
    usedFallback: generated.usedFallback,
    previewQuestions: quiz.questions.slice(0, 3).map((q) => ({
      question: q.question,
      options: q.options,
    })),
  });
}

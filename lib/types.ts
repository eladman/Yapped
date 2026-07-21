export type Relationship = "partner" | "friend" | "family" | "group";

export type QuizStatus = "preview" | "paid";

/** One parsed chat message. Exists only in the browser — never sent to the server. */
export interface ParsedMessage {
  ts: number; // epoch ms
  sender: string;
  text: string;
}

export interface ParticipantSignals {
  name: string;
  messageCount: number;
  avgWordsPerMessage: number;
  emojiCount: number;
  topEmojis: string[];
  /** distinctive frequent words (stopwords removed) */
  topWords: string[];
  /** how often this person opens a conversation after a 6h+ silence */
  conversationStarts: number;
  /** times this person sent 3+ messages in a row (double/triple-texting) */
  burstCount: number;
  longestMessageChars: number;
  firstMessage: { month: string; snippet: string } | null;
}

export interface ChatSignals {
  language: "he" | "en" | "mixed";
  participants: ParticipantSignals[];
  totalMessages: number;
  firstDate: string; // YYYY-MM-DD
  lastDate: string; // YYYY-MM-DD
  activeDays: number;
  busiestMonth: { month: string; count: number };
  busiestHour: number; // 0-23
  busiestWeekday: number; // 0=Sunday
  hourBuckets: { night: number; morning: number; afternoon: number; evening: number };
  longestStreakDays: number;
  longestSilenceDays: number;
  laughterCount: number;
  topEmojis: string[];
  /** Short, memorable quotes — the only raw text that leaves the device. Max ~12, each ≤110 chars. */
  snippets: { sender: string; month: string; text: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0-3
  /** one-line roast/comment revealed after answering */
  spice?: string;
}

export interface QuizRecord {
  id: string;
  createdAt: string;
  relationship: Relationship;
  language: "he" | "en" | "mixed";
  status: QuizStatus;
  shareSlug: string;
  adminToken: string;
  title: string;
  questions: QuizQuestion[];
  /** non-sensitive fun stats shown on results page */
  stats: {
    totalMessages: number;
    firstDate: string;
    lastDate: string;
    topEmojis: string[];
  };
  priceAgorot: number;
}

export interface PlayerRecord {
  id: string;
  quizId: string;
  name: string;
  answers: number[] | null;
  score: number | null;
  completedAt: string | null;
}

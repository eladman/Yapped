import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { track } from "@/lib/track";

/**
 * GET /api/quiz/[slug] — the play payload for invited players.
 * Questions are returned WITHOUT correct answers; scoring happens server-side.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const store = getStore();
  const quiz = await store.getQuizBySlug(slug);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  if (quiz.status !== "paid") {
    return NextResponse.json({ error: "This quiz hasn't been unlocked yet" }, { status: 403 });
  }

  const players = await store.getPlayers(quiz.id);

  track("quiz_viewed", { req, quizId: quiz.id });

  return NextResponse.json({
    title: quiz.title,
    relationship: quiz.relationship,
    language: quiz.language,
    stats: quiz.stats,
    questions: quiz.questions.map((q) => ({ question: q.question, options: q.options })),
    finishedPlayers: players
      .filter((p) => p.completedAt)
      .map((p) => ({ name: p.name })),
  });
}

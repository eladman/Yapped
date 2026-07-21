import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verdictFor } from "@/lib/verdicts";

/**
 * GET /api/quiz/[slug]/results?p=<playerId>
 * Full results: leaderboard, per-question breakdown (who answered what),
 * and the requesting player's verdict. Only available to players who have
 * finished (a valid playerId for this quiz is required) — so nobody can use
 * the results endpoint as an answer key before playing.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const playerId = req.nextUrl.searchParams.get("p");
  if (!playerId) return NextResponse.json({ error: "Missing player id" }, { status: 400 });

  const store = getStore();
  const quiz = await store.getQuizBySlug(slug);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const me = await store.getPlayer(playerId);
  if (!me || me.quizId !== quiz.id || !me.completedAt) {
    return NextResponse.json({ error: "Finish the quiz to see results" }, { status: 403 });
  }

  const players = (await store.getPlayers(quiz.id)).filter((p) => p.completedAt);
  const leaderboard = players
    .map((p) => ({ id: p.id, name: p.name, score: p.score ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const breakdown = quiz.questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    spice: q.spice ?? null,
    myAnswer: me.answers?.[i] ?? null,
    answers: players.map((p) => ({ name: p.name, answer: p.answers?.[i] ?? null })),
  }));

  return NextResponse.json({
    title: quiz.title,
    relationship: quiz.relationship,
    language: quiz.language,
    stats: quiz.stats,
    me: {
      id: me.id,
      name: me.name,
      score: me.score ?? 0,
      total: quiz.questions.length,
      verdict: verdictFor(quiz.relationship, me.score ?? 0, quiz.questions.length),
    },
    leaderboard,
    breakdown,
  });
}

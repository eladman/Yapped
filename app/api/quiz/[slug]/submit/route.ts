import { NextRequest, NextResponse } from "next/server";
import { newId } from "@/lib/ids";
import { getStore } from "@/lib/store";
import { track } from "@/lib/track";
import type { PlayerRecord } from "@/lib/types";

/**
 * POST /api/quiz/[slug]/submit — a player submits their answers.
 * Body: { name: string, answers: number[] }
 * Scoring is server-side; the correct answers never reach the client pre-submit.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const store = getStore();
  const quiz = await store.getQuizBySlug(slug);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  if (quiz.status !== "paid") {
    return NextResponse.json({ error: "This quiz hasn't been unlocked yet" }, { status: 403 });
  }

  let body: { name?: string; answers?: number[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 40);
  const answers = body.answers;
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (
    !Array.isArray(answers) ||
    answers.length !== quiz.questions.length ||
    !answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3)
  ) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  const score = answers.reduce(
    (acc, a, i) => acc + (a === quiz.questions[i].correctIndex ? 1 : 0),
    0
  );

  const player: PlayerRecord = {
    id: newId(),
    quizId: quiz.id,
    name,
    answers,
    score,
    completedAt: new Date().toISOString(),
  };
  await store.createPlayer(player);

  track("player_submitted", {
    req,
    quizId: quiz.id,
    props: { score, total: quiz.questions.length },
  });

  return NextResponse.json({ playerId: player.id, score, total: quiz.questions.length });
}

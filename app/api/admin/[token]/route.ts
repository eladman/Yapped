import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

/**
 * GET /api/admin/[token] — creator dashboard data, keyed by the secret admin token.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const store = getStore();
  const quiz = await store.getQuizByAdminToken(token);
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const players = (await store.getPlayers(quiz.id)).filter((p) => p.completedAt);

  return NextResponse.json({
    title: quiz.title,
    status: quiz.status,
    relationship: quiz.relationship,
    shareSlug: quiz.status === "paid" ? quiz.shareSlug : null,
    priceAgorot: quiz.priceAgorot,
    totalQuestions: quiz.questions.length,
    previewQuestions: quiz.questions.slice(0, 3).map((q) => ({
      question: q.question,
      options: q.options,
    })),
    leaderboard: players
      .map((p) => ({ name: p.name, score: p.score ?? 0 }))
      .sort((a, b) => b.score - a.score),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@/lib/payments";
import { getStore } from "@/lib/store";

/**
 * POST /api/admin/[token]/unlock — the "payment" step.
 * Currently a stub provider (see lib/payments.ts): unlocks immediately.
 * With a real provider this returns a checkout URL and the status flip moves
 * to the provider webhook.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const store = getStore();
  const quiz = await store.getQuizByAdminToken(token);
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (quiz.status === "paid") {
    return NextResponse.json({ status: "paid", shareSlug: quiz.shareSlug });
  }

  const checkout = await createCheckout(quiz.id);
  if (checkout.kind === "redirect") {
    return NextResponse.json({ status: "redirect", url: checkout.url });
  }

  await store.setQuizStatus(quiz.id, "paid");
  return NextResponse.json({ status: "paid", shareSlug: quiz.shareSlug });
}

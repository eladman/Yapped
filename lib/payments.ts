/**
 * Payment provider abstraction.
 *
 * ⚠️ STUB IMPLEMENTATION (per MVP decision): checkout always succeeds and the
 * quiz is unlocked immediately. Wire a real provider (Lemon Squeezy / Paddle /
 * Stripe — see PRD §7/§9 open decision) behind this same interface later:
 * `createCheckout` should return a hosted checkout URL, and the unlock should
 * move into the provider's webhook handler instead of happening inline.
 */

export interface CheckoutResult {
  /** "unlocked" for the stub; a real provider returns "redirect" + url */
  kind: "unlocked" | "redirect";
  url?: string;
}

export async function createCheckout(_quizId: string): Promise<CheckoutResult> {
  return { kind: "unlocked" };
}

import { after, type NextRequest } from "next/server";
import { clientIp, hashIp } from "./request";
import { getSupabaseClient } from "./store";

/**
 * Server-side product analytics: one row in the events table per interesting
 * action. The insert runs via after(), i.e. once the response has been sent,
 * so tracking never adds latency — and it never throws, so a broken analytics
 * table can't take down the product.
 *
 * Without Supabase (local dev) events just go to the console.
 */

export type EventName =
  | "quiz_created"
  | "quiz_rate_limited"
  | "quiz_unlocked"
  | "quiz_viewed"
  | "player_submitted";

export function track(
  event: EventName,
  opts: { req?: NextRequest; quizId?: string; props?: Record<string, unknown> } = {}
): void {
  const ipHash = opts.req ? hashIp(clientIp(opts.req)) : null;
  const client = getSupabaseClient();
  if (!client) {
    console.log(`[yapped] event: ${event}`, { quizId: opts.quizId, ...opts.props });
    return;
  }
  after(async () => {
    const { error } = await client.from("events").insert({
      event,
      quiz_id: opts.quizId ?? null,
      ip_hash: ipHash,
      props: opts.props ?? {},
    });
    if (error) console.error(`[yapped] track(${event}) failed:`, error.message);
  });
}

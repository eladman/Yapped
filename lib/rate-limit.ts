import { hashIp } from "./request";
import { getSupabaseClient } from "./store";

/**
 * Fixed-window rate limiting for quiz generation — the only endpoint that
 * spends AI budget. Two buckets:
 *   1. per-IP per hour (stops one person hammering the endpoint)
 *   2. global per day (stops distributed abuse from draining the budget)
 *
 * Backed by the rate_limits table + bump_rate_limit() SQL function
 * (supabase/schema.sql). Without Supabase env vars it falls back to an
 * in-memory counter — dev only, resets per serverless instance.
 *
 * Fails OPEN on storage errors: quiz creation stays available, and the
 * provider-side hard budget cap is the last line of defense on spend.
 */

const IP_PER_HOUR = intEnv("RATE_LIMIT_IP_PER_HOUR", 5);
const GLOBAL_PER_DAY = intEnv("RATE_LIMIT_GLOBAL_PER_DAY", 100);

const HOUR_S = 3600;
const DAY_S = 86_400;

function intEnv(name: string, fallback: number): number {
  const n = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export type RateLimitResult = { ok: true } | { ok: false; scope: "ip" | "global" };

/* ---------------- in-memory dev fallback ---------------- */

const g = globalThis as unknown as {
  __yappedRate?: Map<string, { start: number; count: number }>;
};

function memBump(key: string, windowSeconds: number, max: number): boolean {
  const map = (g.__yappedRate ??= new Map());
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now - entry.start >= windowSeconds * 1000) {
    map.set(key, { start: now, count: 1 });
    return 1 <= max;
  }
  entry.count += 1;
  return entry.count <= max;
}

/* ---------------- supabase-backed bump ---------------- */

async function sbBump(key: string, windowSeconds: number, max: number): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return memBump(key, windowSeconds, max);
  const { data, error } = await client.rpc("bump_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max: max,
  });
  if (error) throw new Error(`bump_rate_limit: ${error.message}`);
  return data === true;
}

/**
 * Count one quiz-generation attempt against both buckets.
 * Denied-by-IP requests never consume the global budget.
 */
export async function bumpQuizRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    if (!(await sbBump(`quiz:ip:${hashIp(ip)}`, HOUR_S, IP_PER_HOUR))) {
      return { ok: false, scope: "ip" };
    }
    if (!(await sbBump("quiz:global", DAY_S, GLOBAL_PER_DAY))) {
      return { ok: false, scope: "global" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[yapped] rate limit check failed — allowing request (fail open):", err);
    return { ok: true };
  }
}

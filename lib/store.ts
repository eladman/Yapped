import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { PlayerRecord, QuizRecord, QuizStatus } from "./types";

/**
 * Server-side storage. All DB access goes through these functions using the
 * Supabase service-role key — RLS on the tables is deny-all, so the anon key
 * can never read quiz answers directly.
 *
 * When Supabase env vars are missing (local dev before setup), falls back to an
 * in-memory store so the whole flow works out of the box. Data is lost on
 * server restart — dev only.
 */

interface Store {
  createQuiz(q: QuizRecord): Promise<void>;
  getQuizBySlug(slug: string): Promise<QuizRecord | null>;
  getQuizByAdminToken(token: string): Promise<QuizRecord | null>;
  setQuizStatus(id: string, status: QuizStatus): Promise<void>;
  createPlayer(p: PlayerRecord): Promise<void>;
  getPlayers(quizId: string): Promise<PlayerRecord[]>;
  getPlayer(id: string): Promise<PlayerRecord | null>;
}

/* ---------------- in-memory dev store ---------------- */

const g = globalThis as unknown as {
  __yappedMem?: { quizzes: Map<string, QuizRecord>; players: Map<string, PlayerRecord> };
};

function memStore(): Store {
  if (!g.__yappedMem) {
    g.__yappedMem = { quizzes: new Map(), players: new Map() };
  }
  const db = g.__yappedMem;
  return {
    async createQuiz(q) {
      db.quizzes.set(q.id, q);
    },
    async getQuizBySlug(slug) {
      return [...db.quizzes.values()].find((q) => q.shareSlug === slug) ?? null;
    },
    async getQuizByAdminToken(token) {
      return [...db.quizzes.values()].find((q) => q.adminToken === token) ?? null;
    },
    async setQuizStatus(id, status) {
      const q = db.quizzes.get(id);
      if (q) q.status = status;
    },
    async createPlayer(p) {
      db.players.set(p.id, p);
    },
    async getPlayers(quizId) {
      return [...db.players.values()].filter((p) => p.quizId === quizId);
    },
    async getPlayer(id) {
      return db.players.get(id) ?? null;
    },
  };
}

/* ---------------- supabase store ---------------- */

type QuizRow = {
  id: string;
  created_at: string;
  relationship: QuizRecord["relationship"];
  language: QuizRecord["language"];
  status: QuizStatus;
  share_slug: string;
  admin_token: string;
  title: string;
  questions: QuizRecord["questions"];
  stats: QuizRecord["stats"];
  price_agorot: number;
};

type PlayerRow = {
  id: string;
  quiz_id: string;
  name: string;
  answers: number[] | null;
  score: number | null;
  completed_at: string | null;
};

function quizFromRow(r: QuizRow): QuizRecord {
  return {
    id: r.id,
    createdAt: r.created_at,
    relationship: r.relationship,
    language: r.language,
    status: r.status,
    shareSlug: r.share_slug,
    adminToken: r.admin_token,
    title: r.title,
    questions: r.questions,
    stats: r.stats,
    priceAgorot: r.price_agorot,
  };
}

function playerFromRow(r: PlayerRow): PlayerRecord {
  return {
    id: r.id,
    quizId: r.quiz_id,
    name: r.name,
    answers: r.answers,
    score: r.score,
    completedAt: r.completed_at,
  };
}

function supabaseStore(client: SupabaseClient): Store {
  return {
    async createQuiz(q) {
      const { error } = await client.from("quizzes").insert({
        id: q.id,
        relationship: q.relationship,
        language: q.language,
        status: q.status,
        share_slug: q.shareSlug,
        admin_token: q.adminToken,
        title: q.title,
        questions: q.questions,
        stats: q.stats,
        price_agorot: q.priceAgorot,
      });
      if (error) throw new Error(`createQuiz: ${error.message}`);
    },
    async getQuizBySlug(slug) {
      const { data, error } = await client
        .from("quizzes")
        .select("*")
        .eq("share_slug", slug)
        .maybeSingle();
      if (error) throw new Error(`getQuizBySlug: ${error.message}`);
      return data ? quizFromRow(data as QuizRow) : null;
    },
    async getQuizByAdminToken(token) {
      const { data, error } = await client
        .from("quizzes")
        .select("*")
        .eq("admin_token", token)
        .maybeSingle();
      if (error) throw new Error(`getQuizByAdminToken: ${error.message}`);
      return data ? quizFromRow(data as QuizRow) : null;
    },
    async setQuizStatus(id, status) {
      const { error } = await client.from("quizzes").update({ status }).eq("id", id);
      if (error) throw new Error(`setQuizStatus: ${error.message}`);
    },
    async createPlayer(p) {
      const { error } = await client.from("players").insert({
        id: p.id,
        quiz_id: p.quizId,
        name: p.name,
        answers: p.answers,
        score: p.score,
        completed_at: p.completedAt,
      });
      if (error) throw new Error(`createPlayer: ${error.message}`);
    },
    async getPlayers(quizId) {
      const { data, error } = await client
        .from("players")
        .select("*")
        .eq("quiz_id", quizId)
        .order("completed_at", { ascending: true });
      if (error) throw new Error(`getPlayers: ${error.message}`);
      return (data as PlayerRow[]).map(playerFromRow);
    },
    async getPlayer(id) {
      const { data, error } = await client
        .from("players")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`getPlayer: ${error.message}`);
      return data ? playerFromRow(data as PlayerRow) : null;
    },
  };
}

let cached: Store | null = null;
let cachedClient: SupabaseClient | null | undefined;

/** Service-role Supabase client, or null when env vars are missing (dev). */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cachedClient = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cachedClient;
}

export function getStore(): Store {
  if (cached) return cached;
  const client = getSupabaseClient();
  if (client) {
    cached = supabaseStore(client);
  } else {
    console.warn(
      "[yapped] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — using in-memory store (dev only, data lost on restart)"
    );
    cached = memStore();
  }
  return cached;
}

export function isMemoryStore(): boolean {
  return !(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

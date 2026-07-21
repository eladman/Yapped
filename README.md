# yapped.

Turn your WhatsApp chat into a savage, shareable trivia game. MVP build — see
`docs/Yapped_prd.md` (product) and `docs/Yapped_design_system.md` (design).

## How it works

1. **Create** (`/create`) — the creator uploads a WhatsApp export (`.txt`/`.zip`).
   The file is parsed **entirely in the browser** (iOS + Android formats, Hebrew +
   English). Only minimized signals — message counts, timing patterns, top
   emojis/words, and up to 12 short quotes — are sent to the server. The raw chat
   never leaves the device and there is no DB column that could store it.
2. **Generate** — a server route sends the signals to an LLM (OpenAI
   `gpt-5.4-mini` by default when `OPENAI_API_KEY` is set, or Claude
   `claude-opus-4-8` with `ANTHROPIC_API_KEY`; structured JSON output either
   way) which writes ~10 multiple-choice questions in the chat's language, with
   tone by relationship type. No key? A deterministic stats-based generator
   kicks in so the flow still works.
3. **Tease → pay → share** — the creator sees 3 preview questions, "pays" ₪19
   (stub provider — see `lib/payments.ts`), and gets a share link (`/q/<slug>`)
   plus a private creator dashboard (`/a/<token>`).
4. **Play** — invited players play free, are scored server-side, and land on a
   results page with a leaderboard, per-question breakdown, and a downloadable
   share card (the viral loop) watermarked `yapped.app`.

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in what you have (both optional for dev)
npm run dev
```

- **Database**: create a Supabase project, run `supabase/schema.sql` in the SQL
  editor, and set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. Until then the
  app uses an in-memory store (dev only; data lost on restart).
- **AI**: set `OPENAI_API_KEY` (model via `OPENAI_MODEL`, default
  `gpt-5.4-mini`) or `ANTHROPIC_API_KEY` for AI-written quizzes; otherwise the
  template generator is used (marked in the UI).
- **Payments**: currently a stub that unlocks immediately. Swap in Lemon
  Squeezy / Paddle / Stripe behind the interface in `lib/payments.ts` +
  `app/api/admin/[token]/unlock/route.ts`.

## Map

| Path | What |
|---|---|
| `lib/parser.ts`, `lib/signals.ts`, `lib/read-export.ts` | Browser-only chat parsing + signal extraction |
| `lib/generate.ts`, `lib/fallback-quiz.ts` | Server-side quiz generation (Claude + fallback) |
| `lib/store.ts` | Supabase (service-role, RLS deny-all) or in-memory store |
| `app/api/quiz/*` | Create, play payload, submit, results |
| `app/api/admin/*` | Creator dashboard + unlock (stub payment) |
| `app/create`, `app/q/[slug]`, `app/q/[slug]/results`, `app/a/[token]` | The four screens |
| `supabase/schema.sql` | Run once in Supabase |

## Deliberate privacy constraints (do not undo)

- Raw chat text is never sent to the server — parsing is client-side.
- The DB schema has no place to put chat text.
- RLS is deny-all; every read/write goes through server routes.
- Share cards always carry the `yapped.app` watermark; no WhatsApp green or
  checkmark imagery anywhere; "Not affiliated with WhatsApp or Meta" in the footer.

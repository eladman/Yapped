# PRD: Yapped

**Product:** Yapped — turn your WhatsApp group chat into a savage, shareable trivia game
**Owner:** Elad
**Status:** v1 (finalized draft)
**Type:** Side project / fast build
**Date:** July 2026

---

## 1. One-liner

Upload your exported WhatsApp chat, pick who it's for (partner, friend, family, group), and get a shareable multiplayer multiple-choice trivia quiz built by AI from your real conversation. Pay once per quiz; the people you send it to play free.

## 2. Problem / Opportunity

People have years of WhatsApp history with the people closest to them, and it's just sitting there unused. There's a strong emotional + social hook in "how well do you *actually* know our chat" — already validated by the birthday project built for May, which got organic positive reactions from her friends with zero prompting. This is a low-cost-to-try, high-shareability product with natural viral and gifting moments (birthdays, anniversaries, Valentine's, "friendiversaries," group-chat milestones).

Framed honestly: this is a **novelty product with real viral bones**, not a habit-forming platform. The build should be fast and the growth loop (sharing the results card) is the core mechanic, not retention.

## 3. Goals

- Ship a working, payable product fast (days-to-weeks, not a quarter)
- Validate willingness to pay via a one-time purchase per quiz
- Validate that the multiplayer "together" mechanic drives sharing/virality
- Stay legally clean on WhatsApp data handling

**Non-goals (v1):**
- Retention / habit loops beyond one-time or occasion-based use
- Native mobile app (web-first)
- Any storage of chat content beyond the generation window

## 4. User Flow

1. **Export** — User exports their WhatsApp chat manually via WhatsApp's built-in "Export Chat" feature (without media, as a .txt/.zip). This keeps us entirely outside WhatsApp's API and ToS — the user does the export themselves; we never touch WhatsApp's systems.
2. **Upload** — User uploads the exported file to the Yapped web app.
3. **Categorize** — User selects relationship type: **Romantic partner / Friend / Family / Friend group**. This sets the tone and question style the AI uses (partner → warm-teasing; friend group → maximum roast; family → light and warm).
4. **Generate** — Backend parses the chat, extracts a minimized set of quiz-relevant signals (see §6), and sends them to the AI model to generate a multiple-choice trivia quiz.
5. **Pay** — One-time payment to unlock/generate the final quiz and get the shareable link. Teased-then-paywalled (preview, then pay to unlock the link).
6. **Share & play** — Creator gets a unique link to send to the other participant(s). Everyone plays the same quiz independently, then sees scores, comparisons, and a leaderboard.
7. **Delete** — The original chat export and any raw extracted text are deleted from our servers immediately after quiz generation. Only the generated quiz object (questions + answers, no raw chat text) is retained for the play session.

## 5. Core Feature: "Together" Mode (multiplayer)

- Creator generates the quiz and gets a unique shareable link.
- Link is shared with the other participant(s). **Supports both 1:1 (partner/friend) and group play (friend group/family)** — player count is variable, not fixed at 2.
- All players answer the same set of multiple-choice questions independently.
- Results screen shows: individual scores, a **leaderboard for group play**, where answers matched vs diverged, and a shareable results card (image) for stories/social — this is the primary viral loop.
- Consider a "reveal" delay mechanic (all players must finish before results unlock) so nobody just checks the answer key.
- Group play needs a lightweight "who's joined / who's finished" state (e.g. "waiting on 2 of 5"). **Open decision:** full group support in v1, or ship 1:1 first and fast-follow with groups once the core loop is validated.

## 6. Data Handling & Legal (critical path — do not skip)

This is what makes or breaks the product's legality and needs a real answer before launch, not just before scale:

- **No WhatsApp API or scraping.** Users self-export via WhatsApp's native feature. We never authenticate against or pull data from WhatsApp's systems — this is the key fact keeping us outside Meta's platform ToS.
- **Processing:** the chat file is parsed to extract quiz-relevant signals only — message counts, dates, first-mentions, keyword/emoji frequency, timing patterns, etc. Prefer in-memory processing.
- **Storage:** raw chat text is **never persisted** to disk/DB. Process in memory, generate quiz, discard. Log the deletion event for auditability. The data model must not make accidental retention easy.
- **Third-party AI call:** minimize what's sent to the model — extracted facts/snippets needed to write questions, not the full raw chat. Privacy policy must state this data isn't retained by us or used for training.
- **Action items (get a real, even quick/cheap, legal read on):**
  - (a) WhatsApp/Meta ToS exposure.
  - (b) Israeli / GDPR-adjacent privacy obligations — **specifically the second-person issue**: you're processing the messages of the *other* chat participant(s), who didn't personally upload the file or consent themselves. This is worth a specific legal look even in the "we delete everything" version.
- **ToS / Privacy Policy:** explicit, plain-language "we don't store your chats" up front — this is a trust/conversion lever as much as a legal one.
- **Disclaimer:** "Not affiliated with WhatsApp or Meta" present in the footer. No WhatsApp green or checkmark imagery anywhere (trademark/implied-endorsement avoidance).

## 7. Monetization

- **One-time payment per quiz generated.** The creator pays; players who receive the link play **free**. Free players are the acquisition channel — never gate them.
- Payment pattern: preview/tease the generated quiz, then paywall the shareable link.
- **Price point: ₪19 placeholder** — sits in impulse-buy territory, which is right for a share-driven product. Given near-zero marginal cost (no storage, no WhatsApp costs, just the AI generation call), there's room to experiment. **Open decision:** validate the exact price against comparable "wrapped"-style novelty apps before locking.

## 8. Quiz Content Design

Multiple-choice questions generated from real chat signals:
- "Who said [X phrase] first?"
- "In what month did we first talk about [topic]?"
- "How many times did we say '[recurring word/emoji]'?"
- "Who sends longer messages?"
- "What time of day do we text most?"
- "Guess the year we first talked about [milestone topic — a trip, a job, etc.]"

**Tone shifts by relationship type** selected in step 3: partner → warm/nostalgic; friend group → funny/roast-y; family → warm/light. The meanness is always affectionate — roast the chat behavior, never the person's appearance or character.

## 9. Tech Stack & Architecture

**Web-first, no native app in v1.** The recommended stack aligns with the team's existing tooling (Vercel + Supabase + Claude API):

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Serverless/edge functions host the AI call; deploys to Vercel with no friction |
| Hosting | **Vercel** | Already in use |
| Styling | **Tailwind CSS** | Wired to the design-system tokens as CSS variables (`--yap-pink`, etc.) — see the design system doc |
| Database / Auth | **Supabase (Postgres)** | Stores quiz objects, play sessions, scores, payment status. **RLS enforced from day one.** Never stores raw chat |
| AI | **Claude API** | Called from a Vercel serverless function; API key stays server-side, never in the browser |
| Payments | **Merchant-of-record (Lemon Squeezy / Paddle)** *or* **Stripe** | See §7 and open decision below |

### Key architectural principle: parse the chat client-side

Read and parse the uploaded `.txt` export **in the browser** (`FileReader`), extract the quiz-relevant signals there, and send **only the minimized signals** to the serverless function that calls Claude.

- The raw chat **never touches the server or Supabase** — upgrading the privacy promise from "we delete it after" to "it never leaves your device."
- This also substantially reduces the second-person privacy exposure (§6b), since the other participant's raw messages aren't transmitted anywhere.
- Supabase stores only: the generated quiz object (questions + answers), play sessions, per-player scores, and payment status. Never chat text. This should be enforced structurally — there's simply no table/column for raw chat.

### Payments note
Stripe supports ILS and integrates cleanly with Next.js. However, for a low-price novelty product likely sold to buyers **outside Israel**, a merchant-of-record (Lemon Squeezy or Paddle) collects and remits VAT/sales tax globally on your behalf, removing a real compliance headache for a slightly higher fee. **Recommended: merchant-of-record**, unless launching Israel-only first (then Stripe is fine). *Open decision.*

### Other constraints
- **No persistent chat storage** — a hard architectural constraint, not just a policy. Don't build a data model that makes retaining chats possible.
- **Share/results page must look good enough to screenshot** — the single most important UI investment, since the growth loop depends on it. Every share card carries a `yapped.app` watermark.

## 10. Open Questions / Decisions to make

- **Price point** — confirm ₪19 (or other) against a quick scan of comparable apps.
- **Group support in v1** — full multiplayer at launch, or 1:1 first with groups as a fast-follow?
- **Regenerate option** — allow a re-roll if the first AI quiz is weak? Included, or does it cost again?
- **Existing competitors** — quick search for anyone already doing this exact thing before investing real build time.
- **Entity** — keep Yapped fully separate from 5ED from day one (recommended, given 5ED's incorporation is already in motion) vs. under the 5ED umbrella.
- **Payment provider** — merchant-of-record (Lemon Squeezy / Paddle, handles global VAT) vs. Stripe (simpler if Israel-only at first). See §9.

## 11. Success Metrics (v1, informal)

- # of quizzes generated
- # of quizzes where **all** invited players completed (i.e. the viral loop actually fired)
- # of results cards shared
- Revenue
- Repeat usage (same user, second quiz) — the key signal of whether this has legs beyond one-off novelty
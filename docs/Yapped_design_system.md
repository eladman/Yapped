# Yapped — Brand & Design System

**For:** the coding agent building the Yapped web app
**Direction:** 03 · Signal (startup-AI, gender-neutral)
**Status:** v3 — supersedes Direction 02 · Soft Yap (romantic iOS) and Direction 01 · Neon Yap
**How to use this file:** This is the single source of truth for how Yapped looks, feels, and reads. Follow the tokens exactly. When a decision isn't covered here, default to the principles in §1 rather than inventing a new style.

---

## 1. Brand in one breath

Yapped turns a WhatsApp chat into a shareable, AI-written trivia game. The brand is **startup-AI, precise, and gender-neutral** — a cool porcelain canvas (light, the default) or a deep near-black one (dark, behind a user toggle), an electric violet→pink→cyan spectrum used as *the* accent system, geometric display type, and monospace details that signal "a real engine parsed your chat." The wit lives in the copy; the visuals stay technical and premium.

**Personality:** a confident AI product with a sense of humor. Sharp, atmospheric, never sterile — and never gendered. Pink survives from the old brand as **one note in the spectrum**, never the theme.

**Three non-negotiable principles:**
1. **Screenshot-first.** The results/share card is the most important surface in the product. Design everything else in service of it.
2. **Never WhatsApp green.** We deliberately avoid Meta's visual language (green, the checkmarks) to stay clear of implied endorsement or trademark problems.
3. **Privacy is a design element, not fine print.** "We never store your chats" appears prominently, near the primary CTA — it's our biggest conversion lever and a legal necessity.

---

## 2. Color & theming

Yapped is **light by default with a dark theme behind a user toggle**. The toggle sets `data-theme="dark"` on `<html>` (persisted in `localStorage["yap-theme"]`; a `?theme=dark|light` URL param also applies + persists — used for QA/demos). All tokens are semantic CSS vars that flip per theme; components never hardcode theme colors — **except the share card, which is theme-fixed (§5)**.

### Semantic tokens (light → dark)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f4f5f8` | `#08080c` | Page background (cool porcelain / near-black — never pure white or `#000`) |
| `--panel` | `#ffffff` | `#101017` | Card surface |
| `--panel-2` | `#f7f8fb` | `#14141c` | Nested/secondary surface, option rows |
| `--glass` / `--glass-2` | white alphas | white alphas (4–7%) | Frosted surfaces (nav, badges, secondary buttons) |
| `--line` / `--line-2` | ink alphas 9/15% | white alphas 8/14% | Hairline borders |
| `--fg` … `--fg-4` | `#14151d → #a2a4b4` | `#f3f3f6 → #5b5c69` | 4-step ink scale |
| `--violet` | `#6d54f0` | `#8b7bff` | Primary accent (links-ish, checks, focus, winner) |
| `--pink` | `#e5388f` | `#f2559d` | Brand pink — one note of the spectrum, errors/highlights |
| `--cyan` | `#2f9fe0` | `#52c7ff` | Live/status accent |
| `--ok` | `#1e9e6a` | `#5fd6a0` | "You got it" confirmation only |
| `--grad` | violet→pink→cyan `linear-gradient(100deg, …)` | same, brighter stops | THE signature. Gradient keyword, wordmark dot, progress fill, selected borders, badge pips |
| `--btn-bg` / `--btn-fg` | ink / white | near-white / near-black | Primary CTA pill (always the highest-contrast surface on the page) |

### The atmosphere
Every screen sits on fixed layers (in `layout.tsx`): an aurora wash (`.bg-base` — violet/cyan/pink radials over `--bg`), a faint engineering grid fading from the top (`.bg-grid`), three slow-drifting color blobs (`.blob-1/2/3`), and a grain overlay (`.grain`). All var-driven, both themes.

### Rules
- **Primary CTAs are `--btn-bg` pills** (ink in light, white in dark). The gradient is never a button fill.
- The gradient is reserved for: the accent word in a heading (`.grad-text`), the wordmark dot, progress fill, selected-state borders, badge/eyebrow pips, the pricing-card frame, and the share-card frame. Don't spray it.
- `--pink` alone is for errors and small highlights; `--violet` is the workhorse accent; `--cyan` marks "live" status. Never body text in an accent color.
- No `--ok` green outside the "you got it" confirmation.
- **`.grad-text` (background-clip: text) is banned inside the share card** (html2canvas can't render it).

---

## 3. Typography

**Three voices — geometric display, humanist body, monospace signal:**

- **Display:** **Space Grotesk** (`--font-grotesk`, via `next/font`) through the `.display` class — weight 600, tracking `-0.028em`. Headlines, scores, stat numbers, quiz questions.
- **Body/UI:** **Inter** (`--font-inter`) — the default body font. Hebrew content falls back to the system stack (declared in the font-family chain).
- **Signal:** **JetBrains Mono** (`--font-jbmono`, Tailwind `font-mono`) — eyebrows, badges, stats labels, timestamps, disclaimers, the terminal, "live" chrome. The mono details are what make it feel like an AI product.

| Use | Style | Size (mobile) |
|---|---|---|
| Hero headline | `.display` | 42px (64px desktop) |
| Section heading | `.display` | 30px (38px desktop) |
| Quiz question | `.display` | 25px |
| Accent word in a heading | `.grad-text` inside the `.display` | inherits |
| Body | Inter 400 | 14–16px (16px minimum on inputs) |
| Eyebrow | `.eyebrow` — mono 500, 11px, UPPERCASE, tracking 0.22em, `--fg-3`, gradient dash `::before` | 11px |
| Badge | `.badge` — glass pill, mono uppercase, gradient pip | 11px |
| Caption / meta | mono 400 | 10.5–12.5px |

### Rules
- **Wordmark:** lowercase `yapped` in **Space Grotesk 600** with a **gradient dot** (`.wordmark` + `.wordmark-dot`). Never title-case or all-caps, never the old serif.
- **No serif anywhere.** The emotional device is now the gradient keyword: **at most one `.grad-text` phrase per screen section.**
- Eyebrows (mono uppercase with the gradient dash) introduce sections and cards — a signature element.
- Sentence case for all UI copy and buttons. UPPERCASE is reserved for eyebrows/badges (mono only).

---

## 4. Layout & shape

- **Marketing surfaces (home) are wide** — `max-w-5xl` sections. **Flow surfaces (create, play, results, admin) stay a focused `max-w-md` column.**
- **Corner radius:** `999px` pills, `28px` hero/pricing frames (`--radius-lg`), `22px` cards (`--radius-card`), `16px` inputs (`--radius-nested`), `14px` option rows/chips (`--radius-chip`).
- **Buttons are pills.** Primary = `--btn-bg` fill, weight 600, spring press (`scale(0.96)` on `:active`), violet glow on hover. Secondary = frosted glass pill with `--line-2` hairline. **Exactly one primary CTA per screen state.**
- **Header:** floating frosted pill (`.nav-pill`), sticky — wordmark left, anchor links center (desktop), **theme toggle + mini primary CTA** right.
- **Cards:** `--panel` with hairline `--line` + soft shadow (`.card`); glass variant `.card-glass`. Selected/answer rows use the **gradient-border trick** (`.answer-option.selected`): two-layer background, `border: 1px solid transparent`.
- **Motion:** staggered `.rise .d1–.d5` load-ins, drifting blobs, pulsing `.aura` while generating, blinking `.term-cursor`, spring press everywhere. All gated behind `prefers-reduced-motion`.

---

## 5. Signature components

### The share / results card (most important surface)
- Structure: `.sc-frame` (violet→pink→cyan gradient, radius 24, padding 2px) wrapping `.sc-card` (white, radius 22) — the gradient ring **is** the brand frame.
- Inside: `.sc-eyebrow` (mono `THE VERDICT` with gradient dash), giant `.display` score (`/10` in `.sc-faint`), verdict line in `.sc-verdict` rose `#c73b80`, hairline `.sc-divider`, leaderboard rows (rank mono, winner in `.sc-win` violet), footer meta + **`yapped.app` watermark in mono** — every card carries it; it's the growth loop.
- **The card is theme-FIXED:** identical in light and dark (it's a brand artifact, and captures must be deterministic). Only `.sc-*` classes with literal hex inside.
- **html2canvas constraints (binding):** inside the card use ONLY literal hex/rgba + plain linear/radial gradients — no theme vars that flip, no Tailwind default-palette colors (oklch), no slash-opacity utilities (color-mix), no `backdrop-filter`, no `mask-image`, **no `.grad-text`/background-clip:text**. Download uses `backgroundColor: null` and strips `.rise/.d1–.d5` in `onclone` (cloned documents restart entrance animations and would capture at opacity 0).

### The terminal (`.terminal`)
A dark code surface **in both themes** (`#0d0e15`, fixed) — bar with dots + mono title, body log with colored spans (`.tk` cyan, `.tp` violet, `.tpink` pink, `.tok` green, `.tl` gray) and a gradient `.term-cursor`. The "an engine actually ran" proof on the home page.

### Badge (`.badge`) & eyebrow (`.eyebrow`)
Glass pill with glowing gradient pip / mono uppercase line with gradient dash. These two carry most of the brand outside the hero.

### Answer option (`.answer-option`)
`--panel-2` rounded-14 row; selected = gradient border + `--fg` text + faint violet glow. Used for quiz options and the vibe picker (with `.chk-on/.chk-off` check circles).
**Gotcha:** `.answer-option` is unlayered CSS (`display: block`) and beats Tailwind layout utilities on the same element — put flex layouts on an inner `<span>`.

### Progress bar
6px pill track, fill = `--grad`.

### Theme toggle (`.theme-toggle`)
Glass circle button; sun/moon icons swapped **by CSS** on `html[data-theme]` (no React state → no hydration mismatch). The no-flash script in `layout.tsx` runs as the first body child.

---

## 6. Voice & copy

Warm, sly, internet-native. Short. Confident-technical, never corporate. The roast lives inside the quiz content (scaled by relationship type), while UI chrome stays charming.

**Tone shifts by relationship type:**
- **Romantic partner** → warm-teasing, a touch nostalgic
- **Friend / friend group** → maximum roast, inside-joke energy
- **Family** → light and warm, dial the roast way down

**Do:**
- "How well do they *really* know the group chat?"
- "Send the link. Let the leaderboard talk."
- "Some chats deserve a leaderboard."
- Mono microcopy for system states ("runs on-device · we never store your chats").
- Emoji sparingly, as punctuation for a joke (👀 💀), never decoratively everywhere.

**Don't:**
- Corporate filler ("seamless", "unlock your potential", "empower").
- Exclamation marks on system/status copy.
- Mean or appearance-based jokes — roast the chat behavior, not the person.
- Title Case. Ever.

---

## 7. Critical product/UX constraints (binding, not just style)

1. **Never persist raw chat text.** Parse the export in the browser; only extracted signals leave the device. The data model must not make retention possible.
2. **The privacy promise is visible.** "We never store your chats" appears near the primary upload CTA with a lock icon. UI, not a buried policy link.
3. **Footer disclaimer:** "Not affiliated with WhatsApp or Meta." Always present.
4. **No WhatsApp green anywhere**, no WhatsApp logo/checkmark imagery — even decoratively.
5. **Minimize what's sent to the AI** — signals and short quotes, never the full chat.
6. **Payment pattern:** tease the quiz, paywall the share link (₪19 one-time). Creator pays once; players always play free.
7. **Inputs are ≥16px font-size** (prevents iOS focus-zoom). RTL: quiz titles/questions/options set `dir` from quiz language.
8. **Light is the default theme.** Dark is user-opt-in only — never auto-switch from OS preference.

---

## 8. Quick token reference (drop-in)

See `app/globals.css` for the canonical implementation (light `:root` + `html[data-theme="dark"]` overrides + `@theme inline` Tailwind mapping + component classes).

```
Fonts (next/font, layout.tsx):
  Display:  Space Grotesk  → --font-grotesk  (.display, .wordmark)
  Body:     Inter          → --font-inter    (default)
  Signal:   JetBrains Mono → --font-jbmono   (font-mono, .eyebrow, .badge, terminal)

Tailwind color utilities (from @theme inline):
  bg / panel / panel-2 / line / line-2 / fg / fg-2 / fg-3 / fg-4
  violet / pink / cyan / ok

Radii: pill 999 · lg 28 · card 22 · nested 16 · chip 14

Theme switch: html[data-theme="dark"] ← ThemeToggle (components/theme-toggle.tsx)
  persisted: localStorage["yap-theme"] · QA param: ?theme=dark|light
```

---

## 9. On brand vs off brand

| On brand | Off brand |
|---|---|
| Cool porcelain light / near-black dark, aurora + grid + grain | Warm cream, pure white `#fff` or pure black `#000` page bg |
| `--btn-bg` pill CTAs (ink↔white per theme) | Gradient or pink button fills |
| One `.grad-text` word per section heading | Serif italic anywhere; gradient text sprayed everywhere |
| Mono eyebrows/badges/meta with gradient pips | Sans-serif UPPERCASE labels; decorative emoji chrome |
| Panels with hairlines + soft shadows; gradient borders for selection | Hard gray shadows, heavy borders, neon glows on everything |
| lowercase Space-Grotesk `yapped` + gradient dot | `Yapped` / `YAPPED`, serif wordmark, plain pink dot |
| Theme-fixed, watermarked, html2canvas-safe share card | Share card that flips with the theme or uses blur/oklch/gradient-text |
| Violet as workhorse accent; pink as one note; cyan for live | Pink-dominant anything; any green that isn't the tiny "got it" check; WhatsApp visual language |

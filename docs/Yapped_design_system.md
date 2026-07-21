# Yapped — Brand & Design System

**For:** the coding agent building the Yapped web app
**Direction:** 02 · Soft Yap (romantic iOS)
**Status:** v2 — supersedes Direction 01 · Neon Yap (dark/pink)
**How to use this file:** This is the single source of truth for how Yapped looks, feels, and reads. Follow the tokens exactly. When a decision isn't covered here, default to the principles in §1 rather than inventing a new style.

---

## 1. Brand in one breath

Yapped turns a WhatsApp chat into a beautiful, shareable trivia game. The brand is **soft, romantic, iOS-native, and built for the screenshot** — a warm cream canvas washed with pink and lavender, frosted glass cards, ink-black pill buttons, and a serif italic reserved for the emotional beats. The wit lives in the copy; the visuals stay tender.

**Personality:** a premium Apple-design-mindset app with a romantic soul. Dreamy, airy, precise. Not childish, not corporate, not neon.

**Three non-negotiable principles:**
1. **Screenshot-first.** The results/share card is the most important surface in the product. Design everything else in service of it.
2. **Never WhatsApp green.** We deliberately avoid Meta's visual language (green, the checkmarks) to stay clear of implied endorsement or trademark problems.
3. **Privacy is a design element, not fine print.** "We never store your chats" appears prominently, near the primary CTA — it's our biggest conversion lever and a legal necessity.

---

## 2. Color

Committed brand colors. Yapped is a **light-themed product in both light and dark OS modes** — these tokens never invert. Do not wire them to a theme switch (`color-scheme: light` is set on `html`).

### Core palette

| Token | Value | Role |
|---|---|---|
| `--yap-bg` | `#faf6f4` | Warm cream base background |
| `--yap-surface` | `#ffffff` | Solid card surface |
| `--yap-glass` | `rgba(255,255,255,0.62)` | Frosted glass card fill (with backdrop-blur) |
| `--yap-glass-strong` | `rgba(255,255,255,0.84)` | Stronger glass: chips, secondary buttons |
| `--yap-border` | `rgba(33,26,38,0.07)` | Default hairline border |
| `--yap-border-strong` | `rgba(33,26,38,0.14)` | Emphasized border, inputs |
| `--yap-pink` | `#f2559d` | Brand pink — selected states, the wordmark dot, highlights |
| `--yap-rose` | `#c73b80` | Deep rose — eyebrows, accent text (AA-safe on cream) |
| `--yap-pink-soft` | `#fbe3ef` | Pink-tinted fills: selected options, badges |
| `--yap-pink-border` | `#f4c6dd` | Border for pink-tinted elements |
| `--yap-lavender` | `#b79df0` | Gradient partner only (progress bar, atmosphere) |
| `--yap-green` | `#3f8e63` | "You got it" confirmation text only |

### Text (ink scale)

| Token | Value | Role |
|---|---|---|
| `--yap-ink` | `#211c26` | Primary text, primary buttons |
| `--yap-ink-2` | `#5d5566` | Body / secondary |
| `--yap-ink-3` | `#948b9e` | Muted, captions |
| `--yap-ink-4` | `#bcb4c5` | Hints, disclaimers, watermark |

### The atmosphere

Every screen sits on a fixed gradient wash: radial blooms of pink `rgba(244,186,214,…)`, lavender `rgba(210,196,243,…)`, and peach `rgba(250,214,192,…)` over the cream base, plus two slowly drifting blob layers (`.atmosphere`, `.atmo-blob` in globals.css). Content floats above it on glass and white cards.

### Rules
- **Primary CTAs are ink-black pills with white text** (the iOS reference pattern). Pink is never a button fill — it's the accent for selection, eyebrows, and emotional highlights.
- Rose (`--yap-rose`) for small accent text; pink (`--yap-pink`) for larger/graphic uses. Never body text in pink.
- Soft diffuse shadows (`--yap-shadow-soft/float`) are the depth system — warm-tinted, never gray/harsh.
- Gradients are allowed only as: the atmosphere, the progress bar fill, and the share-card wash. Buttons and cards stay flat.

---

## 3. Typography

**Two voices: iOS sans for everything, serif italic for the emotional word.**

- **UI sans:** the system SF stack — `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Real SF on iPhone (the primary device), native feel everywhere. Zero font payload.
- **Romantic accent:** **Instrument Serif** (Google Fonts, weight 400 + italic), loaded via `next/font` as `--font-romantic`. Used through the `.romantic` class.

| Use | Style | Size (mobile) | Notes |
|---|---|---|---|
| Hero headline | sans 700, `.display` | 40px | tracking `-0.035em`, leading ~1.06 |
| Section heading | sans 700, `.display` | 26px | |
| Quiz question | sans 700, `.display` | 25px | big and confident — the question is the fun |
| Emotional accent | `.romantic` (serif italic) | inherits (1.08em) | one word or phrase per heading, usually in `text-rose` |
| Body | sans 400 | 14–16px | 16px minimum on inputs (blocks iOS focus-zoom) |
| Eyebrow | sans 600 | 11px | UPPERCASE, tracking `0.14em`, rose |
| Caption / footer | sans 400 | 11–13px | ink-3 / ink-4 |

### Rules
- **Wordmark:** lowercase `yapped` in **Instrument Serif italic** with an upright **pink** period. The serif italic wordmark is the brand's romantic signature. Never title-case or all-caps.
- The serif italic is a spice: **at most one romantic phrase per screen section.** It marks emotion (the verdict line, "really", "group therapy"), never UI chrome.
- Eyebrow labels (small uppercase rose lines) introduce sections and cards — a signature element.
- Sentence case for all UI copy and buttons. UPPERCASE is reserved for eyebrows.

---

## 4. Layout & shape

- **Phone canvas.** All content lives in a centered `max-w-md` column — the app is designed for the phone screen first; on desktop it reads as an intentional narrow canvas over the atmosphere.
- **Corner radius:** `999px` pills for buttons/chips/header, `28px` cards, `20px` nested, `18px` options/inputs, `14px` small chips.
- **Buttons are pills.** Primary = ink fill, white text, weight 600, `padding 14px 28px`, spring press (`scale(0.96)` on `:active`). Secondary = frosted glass pill with hairline border.
- **Exactly one primary (ink) CTA per screen state.**
- **Header:** a floating frosted-glass pill, sticky at the top — wordmark left, mini ink CTA right.
- **Cards:** white or frosted glass with hairline borders + soft warm shadows. iOS grouped-list pattern (rows with hairline dividers inside one card) for step lists and leaderboards.
- **Motion:** staggered load-in reveals (`.rise .d1–.d5` — fade + 14px rise, ~0.7s spring ease), drifting atmosphere blobs, pulsing `.aura` for the generating state, spring press on all buttons. All gated behind `prefers-reduced-motion`.

---

## 5. Signature components

### The share / results card (most important surface)
- Container: `.share-card-bg` (cream→lilac→peach linear gradient), `28px` radius, `1px solid var(--yap-pink-border)`, `overflow-hidden`.
- Two alpha-fading radial blooms (pink top-right, lavender bottom-left) — **alpha gradients only, they must blend over the card gradient.**
- Eyebrow in rose (`THE VERDICT`), giant sans-700 score (the `/10` in ink-4), verdict line in **serif italic** (`.romantic`, ink-2).
- Hairline divider (`--yap-pink-border`), then leaderboard rows: name ink-3, score `.display` (winner in rose).
- Bottom-right watermark: `yapped.app` in Instrument Serif italic, ink-4, ~12px. **Every share card carries it** — it's the growth loop.
- **html2canvas constraints (binding):** inside the card use ONLY token vars / hex / rgba — no Tailwind default-palette colors (oklch), no slash-opacity utilities (color-mix), no `backdrop-filter`, no `mask-image`. The download handler strips `.rise` animation classes in `onclone` (cloned documents restart entrance animations and would capture at opacity 0).

### Number badges (how-it-works steps)
`34px` circle, `--yap-pink-soft` background, rose number at weight 700.

### Eyebrow chip
Frosted glass pill (`--yap-glass-strong`, white hairline, soft shadow, backdrop-blur) with a 6px pink dot before rose uppercase text — the "• Pinned" pattern.

### Answer option
`.answer-option` — white rounded-18 row with soft shadow; selected = pink-soft fill, pink border, rose text, weight 600. Used for quiz options and the vibe picker (vibe rows add emoji + a pink check circle).
**Gotcha:** `.answer-option` is unlayered CSS (`display: block`) and beats Tailwind layout utilities on the same element — put flex layouts on an inner `<span>`, not on the option itself.

### Progress bar
6px pill track (`rgba(33,26,38,0.08)`), fill `linear-gradient(90deg, --yap-pink, --yap-lavender)`.

---

## 6. Voice & copy

Warm, sly, internet-native. Short. The wit stays; the aggression is gone — no "savage", no "weaponized". The roast lives inside the quiz content (scaled by relationship type), while UI chrome stays charming.

**Tone shifts by relationship type:**
- **Romantic partner** → warm-teasing, a touch nostalgic
- **Friend / friend group** → maximum roast, inside-joke energy
- **Family** → light and warm, dial the roast way down

**Do:**
- "How well do they *really* know your chat?"
- "Send the link. Let the leaderboard talk."
- "Some chats deserve a trophy."
- Emoji sparingly, as punctuation for a joke (👀 💗 💀), never decoratively everywhere.

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
6. **Payment pattern:** tease the quiz, paywall the share link. Creator pays once; players always play free.
7. **Inputs are ≥16px font-size** (prevents iOS focus-zoom). RTL: quiz titles/questions/options set `dir` from quiz language.

---

## 8. Quick token reference (drop-in)

See `app/globals.css` for the canonical implementation (tokens + `@theme inline` Tailwind mapping + component classes).

```css
:root {
  --yap-bg: #faf6f4;
  --yap-surface: #ffffff;
  --yap-glass: rgba(255, 255, 255, 0.62);
  --yap-glass-strong: rgba(255, 255, 255, 0.84);
  --yap-border: rgba(33, 26, 38, 0.07);
  --yap-border-strong: rgba(33, 26, 38, 0.14);
  --yap-ink: #211c26;
  --yap-ink-2: #5d5566;
  --yap-ink-3: #948b9e;
  --yap-ink-4: #bcb4c5;
  --yap-pink: #f2559d;
  --yap-rose: #c73b80;
  --yap-pink-soft: #fbe3ef;
  --yap-pink-border: #f4c6dd;
  --yap-lavender: #b79df0;
  --yap-green: #3f8e63;
  --yap-radius-card: 28px;
  --yap-radius-nested: 20px;
  --yap-radius-chip: 14px;
  --yap-radius-pill: 999px;
}
```

```
Fonts:
  UI:      system SF stack (-apple-system … sans-serif), weights 400/600/700
  Accent:  Instrument Serif 400 italic (next/font, --font-romantic) via .romantic
Assets:
  /hero-bloom.jpg — dreamy blurred orchid (landing hero backdrop only;
  the share card uses pure alpha gradients so html2canvas renders it faithfully)
```

---

## 9. On brand vs off brand

| On brand | Off brand |
|---|---|
| Warm cream + pink-lavender atmosphere | Dark theme, neon accents, pure white `#fff` page bg |
| Ink pill CTAs, white text | Pink/gradient button fills |
| Serif italic for one emotional phrase | Serif everywhere, or none at all |
| Frosted glass + hairline + soft warm shadow | Hard gray shadows, heavy borders |
| lowercase serif-italic `yapped.` with pink dot | `Yapped` / `YAPPED`, sans wordmark |
| Witty-warm copy ("let the leaderboard talk") | "Savage/weaponized" aggression or corporate polish |
| Watermarked share card, html2canvas-safe | Share card with blur/oklch/animations that break the download |
| Pink `#f2559d` / rose `#c73b80` accents | Any green that isn't the tiny "got it" check; WhatsApp visual language |

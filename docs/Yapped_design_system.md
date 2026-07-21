# Yapped — Brand & Design System

**For:** the coding agent building the Yapped web app
**Direction:** 01 · Neon Yap (pink accent)
**Status:** v1
**How to use this file:** This is the single source of truth for how Yapped looks, feels, and reads. Follow the tokens exactly. When a decision isn't covered here, default to the principles in §1 rather than inventing a new style.

---

## 1. Brand in one breath

Yapped turns a WhatsApp group chat into a savage, shareable trivia game. The brand is **loud, playful, a little chaotic, and built for the screenshot.** Every screen should look good the moment it lands in someone's Instagram story — because that's how the next user finds us.

**Personality:** premium party-game energy. Not a utility app, not childish. Think a well-designed board-game box with a Gen-Z internet voice.

**Three non-negotiable principles:**
1. **Screenshot-first.** The results/share card is the most important surface in the product. Design everything else in service of it.
2. **Never WhatsApp green.** We deliberately avoid Meta's visual language (green, the checkmarks) to stay clear of implied endorsement or trademark problems. Our accent is hot pink.
3. **Privacy is a design element, not fine print.** "We never store your chats" appears prominently, near the primary CTA — it's our biggest conversion lever and a legal necessity.

---

## 2. Color

Committed brand colors. These are **hardcoded and do not invert** — Yapped is a dark-themed product in both light and dark OS modes. Do not wire these to a theme switch.

### Core palette

| Token | Hex | Role |
|---|---|---|
| `--yap-bg` | `#0A0A0F` | Primary background (near-black) |
| `--yap-surface` | `#12121A` | Card / raised surface |
| `--yap-surface-2` | `#161620` | Elevated card, inputs |
| `--yap-border` | `#1F1F29` | Default hairline border |
| `--yap-border-strong` | `#2A2A35` | Emphasized border, outline buttons |
| `--yap-pink` | `#FF3D8D` | **Primary accent.** CTAs, highlights, the wordmark dot |
| `--yap-pink-dim` | `#1A0C12` | Pink-tinted background chips/badges |
| `--yap-pink-border` | `#3D1526` | Border for pink-tinted chips |
| `--yap-lime` | `#B9FF3D` | Secondary accent — used *very* sparingly for a single contrast pop |
| `--yap-cream` | `#F4F4F0` | Off-white for large surfaces if ever needed |

### Text

| Token | Hex | Role |
|---|---|---|
| `--yap-text` | `#FFFFFF` | Primary text |
| `--yap-text-2` | `#C9C9D4` | Body / secondary |
| `--yap-text-3` | `#8A8A99` | Muted, captions, labels |
| `--yap-text-4` | `#5A5A68` | Hints, disclaimers, footer, watermark |

### Rules
- **On pink (`#FF3D8D`), text is always `#0A0A0F`** (the near-black). Never white text on pink — it dulls the punch. (Pink-on-near-black passes contrast comfortably, unlike the purple option we tested.)
- Pink is the **only** primary accent. Lime is a rare spice — at most one lime element per screen, and only when you want a jolt of contrast. Most screens use pink alone.
- No gradients as a brand element. The one exception: a very subtle vertical `#161620 → #12121A` on the hero share-card. Everything else is flat.
- Never pure `#000000` — the background is `#0A0A0F`, which reads warmer and less harsh.

---

## 3. Typography

**One typeface family, two weights doing all the work.** Use a bold, characterful grotesque sans. Recommended: **Space Grotesk** for both display and body (free, on Google Fonts), or **Clash Display** for display + **Inter** for body if you want a more ownable headline face. Pick one and install it from the start.

| Use | Weight | Size (desktop) | Notes |
|---|---|---|---|
| Hero headline | 800 | 40–48px | Tight leading (~1.0), letter-spacing `-0.03em` |
| Section heading | 800 | 20–22px | letter-spacing `-0.02em` |
| Quiz question | 800 | 24–28px | Big and confident — the question is the fun |
| Body | 400 | 14–15px | line-height 1.6 |
| Label / eyebrow | 500 | 11px | UPPERCASE, letter-spacing `0.12–0.14em`, pink |
| Caption / footer | 400 | 11–12px | `--yap-text-3` or `-4` |

### Rules
- **Wordmark:** always lowercase `yapped` with a **pink** period. Display weight (800). The lowercase is load-bearing — it carries the casual/chaotic tone. Never title-case or all-caps the wordmark in body contexts.
- Eyebrow labels (small UPPERCASE pink lines above section headers) are a signature element — use them to introduce sections and cards.
- Sentence case for all UI copy and buttons. UPPERCASE is reserved for eyebrow labels only.
- Two display weights only: 400 and 800. (500 is fine for small UI labels/buttons.)

---

## 4. Layout & shape

- **Corner radius:** `999px` for buttons/pills and CTAs, `16px` for cards and major containers, `14px` for nested cards, `9px` for small chips/number badges.
- **Buttons are pills.** Primary = pink fill, near-black text, weight 500, `padding: 12–13px 24–26px`, radius `999px`, often with a trailing `→`. Secondary = transparent, `1px solid var(--yap-border-strong)`, `--yap-text-2` text.
- **Exactly one primary (pink) CTA per screen.** Everything else uses the outline/secondary style.
- **Spacing:** generous. Section padding `38–44px` vertical on desktop. Card internal padding `16–24px`. Gaps between cards `12px`.
- **Borders:** `1px solid var(--yap-border)` default — thin and subtle. Cards separate from the near-black background via these hairlines, not shadows.
- **No drop shadows** as a primary depth tool — depth comes from surface-lightness steps (`bg → surface → surface-2`) plus hairline borders.

---

## 5. Signature components

### The share / results card (most important surface)
- Container: `--yap-surface-2` (or the one allowed subtle gradient), `16px` radius, `1px solid var(--yap-border-strong)`.
- Eyebrow label in pink (e.g. `THE VERDICT`, `YOUR RESULTS`).
- Giant score in display 800 (e.g. `8/10` — the `/10` in `--yap-text-4`).
- One line of roast-y verdict copy.
- Hairline divider, then per-player rows: name left (`--yap-text-3`), score right (winner's score in **pink**). For group play, render as a leaderboard.
- Bottom-right watermark: `yapped.app` in `--yap-text-4`, tiny (9px). **Every share card must carry this watermark** — it's the growth loop.

### Number badges (how-it-works steps)
`34px` square, `9px` radius, `--yap-pink-dim` background, pink `#FF3D8D` number in weight 800.

### Eyebrow chip
Inline-block, `--yap-pink-dim` bg, `1px solid var(--yap-pink-border)`, pink text, `6px 14px` padding, `999px` radius, 11px UPPERCASE with wide letter-spacing.

### Primary CTA
Pink pill, near-black text, weight 500, trailing `→`. One per screen.

---

## 6. Voice & copy

Conversational, cheeky, internet-native. Short. A little roast-y — but affectionate, never actually cruel.

**Tone shifts by relationship type** (the category the user selects):
- **Romantic partner** → warm-teasing, a touch nostalgic
- **Friend / friend group** → maximum roast, inside-joke energy
- **Family** → light and warm, dial the roast way down

**Do:**
- "How well do you *actually* know your people?"
- "You know Maya better than she knows you 👀"
- "Who was really paying attention?"
- Emoji sparingly, as punctuation for a joke (👀 💀 🫠), never decoratively everywhere.

**Don't:**
- Corporate filler ("seamless", "unlock", "empower", "leverage").
- Exclamation marks on system/status copy.
- Mean or appearance-based jokes — roast the chat behavior, not the person.
- Title Case. Ever.

---

## 7. Critical product/UX constraints (binding, not just style)

These come from the legal/privacy requirements and are as binding as the visual tokens:

1. **Never persist raw chat text.** Process the uploaded export in memory, generate the quiz, discard. The data model must not make accidental retention easy. Log the deletion event.
2. **The privacy promise is visible.** "We never store your chats — processed once, then deleted" appears near the primary upload CTA, with a lock icon. UI, not a buried policy link.
3. **Footer disclaimer:** "Not affiliated with WhatsApp or Meta." Always present.
4. **No WhatsApp green anywhere**, and no WhatsApp logo/checkmark imagery — even decoratively.
5. **Minimize what's sent to the AI.** Send extracted signals/snippets needed to write questions, not the entire raw chat; state in the privacy copy that this data isn't retained or used for training.
6. **Payment pattern:** tease the generated quiz, then paywall the shareable link (one-time payment per quiz; creator pays, players play free). Free players are the acquisition channel — never gate them.

---

## 8. Quick token reference (drop-in)

```css
:root {
  --yap-bg: #0A0A0F;
  --yap-surface: #12121A;
  --yap-surface-2: #161620;
  --yap-border: #1F1F29;
  --yap-border-strong: #2A2A35;
  --yap-pink: #FF3D8D;
  --yap-pink-dim: #1A0C12;
  --yap-pink-border: #3D1526;
  --yap-lime: #B9FF3D;
  --yap-cream: #F4F4F0;
  --yap-text: #FFFFFF;
  --yap-text-2: #C9C9D4;
  --yap-text-3: #8A8A99;
  --yap-text-4: #5A5A68;

  --yap-radius-pill: 999px;
  --yap-radius-card: 16px;
  --yap-radius-nested: 14px;
  --yap-radius-chip: 9px;
}
```

```
Fonts:
  Display: Space Grotesk (or Clash Display) — weight 800
  Body:    Space Grotesk / Inter — weights 400, 500
Accent text/fill color: #FF3D8D  (near-black #0A0A0F text sits on top)
```

---

## 9. On brand vs off brand

| On brand | Off brand |
|---|---|
| Near-black bg, one pink accent | Multiple bright accents competing |
| lowercase `yapped.` wordmark, pink dot | `Yapped` / `YAPPED` in body |
| Roast-y, short copy | Polished corporate marketing voice |
| Privacy promise front and center | Privacy buried in a footer link |
| Pill CTAs, hairline borders, flat | Rounded-rect buttons, drop shadows, gradients |
| Watermarked share card | Share card with no yapped.app mark |
| Pink `#FF3D8D`, near-black text on it | White text on pink; any green that isn't the rare lime spice |
| WhatsApp green / checkmarks nowhere | WhatsApp visual language anywhere |
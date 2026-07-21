import type { ParsedMessage } from "./types";

/**
 * WhatsApp chat export parser. Runs ONLY in the browser — the raw chat
 * never leaves the user's device (see PRD §6 / §9).
 *
 * Handles both export layouts, in English and Hebrew locales:
 *   iOS:     "[31/12/2023, 23:59:59] Name: message"   (often with U+200E/U+200F marks)
 *   Android: "31/12/2023, 23:59 - Name: message"
 *            "12/31/23, 11:59 PM - Name: message"
 *            "31.12.23, 23:59 - Name: message"
 */

const LINE_RE =
  /^[‎‏﻿\s]*\[?(\d{1,2})[./](\d{1,2})[./](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([APap])\.?[Mm]\.?)?\]?\s*(?:-\s*)?(.*)$/;

const MEDIA_MARKERS = [
  "<media omitted>",
  "image omitted",
  "video omitted",
  "audio omitted",
  "sticker omitted",
  "gif omitted",
  "document omitted",
  "contact card omitted",
  "media omitted",
  "this message was deleted",
  "you deleted this message",
  "null",
  "הושמט", // covers התמונה הושמטה, סרטון הושמט, וכו'
  "הושמטה",
  "הודעה זו נמחקה",
  "מחקת הודעה זו",
  "כרטיס איש קשר",
];

const SYSTEM_MARKERS = [
  "end-to-end encrypted",
  "messages and calls are end-to-end",
  "מוצפנות מקצה לקצה",
  "created group",
  "added you",
  "changed the subject",
  "changed this group's icon",
  "joined using this group's invite link",
  "left",
  "צירף/ה אותך",
  "יצר/ה את הקבוצה",
];

function looksLikeMedia(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[‎‏]/g, "");
  if (t.length === 0) return true;
  return MEDIA_MARKERS.some((m) => t === m || (t.length < 60 && t.includes(m)));
}

function looksLikeSystem(text: string): boolean {
  const t = text.toLowerCase();
  return SYSTEM_MARKERS.some((m) => t.includes(m));
}

interface RawLine {
  a: number; // first date number
  b: number; // second date number
  year: number;
  hour: number;
  minute: number;
  ampm: string | null;
  rest: string;
}

export interface ParseResult {
  messages: ParsedMessage[];
  participants: string[];
  skippedLines: number;
}

export function parseWhatsAppExport(raw: string): ParseResult {
  const lines = raw.split(/\r?\n/);
  const rawLines: RawLine[] = [];
  let skippedLines = 0;

  // First pass: match timestamped lines, append continuations to the previous message.
  for (const line of lines) {
    const m = LINE_RE.exec(line);
    if (m && m[8] !== undefined) {
      rawLines.push({
        a: parseInt(m[1], 10),
        b: parseInt(m[2], 10),
        year: parseInt(m[3], 10),
        hour: parseInt(m[4], 10),
        minute: parseInt(m[5], 10),
        ampm: m[7] ? m[7].toLowerCase() : null,
        rest: m[8],
      });
    } else if (rawLines.length > 0) {
      // continuation of a multi-line message
      rawLines[rawLines.length - 1].rest += "\n" + line;
    } else {
      skippedLines++;
    }
  }

  // Detect date order: DD/MM (default, Israel/most of world) vs MM/DD (US).
  let ddFirst = true;
  const anyFirstOver12 = rawLines.some((l) => l.a > 12);
  const anySecondOver12 = rawLines.some((l) => l.b > 12);
  if (!anyFirstOver12 && anySecondOver12) ddFirst = false;

  const messages: ParsedMessage[] = [];
  const participantCounts = new Map<string, number>();

  for (const l of rawLines) {
    // Split "Name: message" on the first ": " — lines without it are system messages.
    const rest = l.rest.replace(/^[‎‏]+/, "");
    const sep = rest.indexOf(": ");
    if (sep <= 0) {
      skippedLines++;
      continue;
    }
    const sender = rest.slice(0, sep).replace(/[‎‏]/g, "").trim();
    const text = rest.slice(sep + 2).trim();

    if (sender.length === 0 || sender.length > 60) {
      skippedLines++;
      continue;
    }
    if (looksLikeMedia(text) || looksLikeSystem(text)) {
      skippedLines++;
      continue;
    }

    const day = ddFirst ? l.a : l.b;
    const month = ddFirst ? l.b : l.a;
    const year = l.year < 100 ? 2000 + l.year : l.year;
    let hour = l.hour;
    if (l.ampm === "p" && hour < 12) hour += 12;
    if (l.ampm === "a" && hour === 12) hour = 0;

    const ts = new Date(year, month - 1, day, hour, l.minute).getTime();
    if (isNaN(ts)) {
      skippedLines++;
      continue;
    }

    messages.push({ ts, sender, text });
    participantCounts.set(sender, (participantCounts.get(sender) ?? 0) + 1);
  }

  // Participants sorted by message count; drop obvious noise senders (<3 messages
  // in big group exports are often phone numbers of people who left).
  const participants = [...participantCounts.entries()]
    .sort((x, y) => y[1] - x[1])
    .map(([name]) => name);

  return { messages, participants, skippedLines };
}

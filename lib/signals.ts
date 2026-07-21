import type { ChatSignals, ParsedMessage, ParticipantSignals } from "./types";

/**
 * Turns parsed messages into the minimized signal set that is allowed to leave
 * the device (PRD §6: stats + a handful of short snippets, never the full chat).
 */

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

const STOPWORDS_EN = new Set(
  `the a an and or but if then so to of in on at for with is are was were be been am i you he she it we they me him her us them my your his its our their this that these those not no yes ok okay do does did done have has had will would can could should just like get got go going know think really very too also there here what when where who why how all some any more most much lol haha yeah yep nah hmm oh ah wow omg im dont cant its thats youre ill ive id well right now good time one two u ur`.split(
    /\s+/
  )
);

const STOPWORDS_HE = new Set(
  `של את זה על לא כן אני אתה את היא הוא אנחנו הם אתם מה איך למה מתי איפה מי כל יש אין רק גם אבל אז כי אם או עם בלי יותר פחות טוב רע כבר עוד פה שם היה היתה יהיה הזה הזאת אולי צריך אפשר בסדר נו וואי חח חחח חחחח אה או קיי אוקיי תודה סבבה יאללה יאלה ביי היי הי שלום בוקר ערב לילה אחלה מלא ממש הכי לי לך לו לה לנו להם שלי שלך שלו שלה שלנו שלהם אותי אותך אותו אותה אותנו אותם וגם אנא נראה רוצה יודע יודעת חושב חושבת`.split(
    /\s+/
  )
);

const LAUGH_RE = /(חח+|ha(ha)+|lo+l|😂|🤣|💀)/gi;

function extractEmojis(text: string): string[] {
  return text.match(EMOJI_RE) ?? [];
}

function words(text: string): string[] {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(EMOJI_RE, " ")
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter((w) => w.length >= 2);
}

function isStopword(w: string): boolean {
  return STOPWORDS_EN.has(w) || STOPWORDS_HE.has(w) || /^\d+$/.test(w) || /^ח+$/.test(w);
}

function topN<K>(map: Map<K, number>, n: number): K[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function detectLanguage(messages: ParsedMessage[]): "he" | "en" | "mixed" {
  let he = 0;
  let latin = 0;
  for (const m of messages) {
    for (const ch of m.text) {
      if (ch >= "֐" && ch <= "׿") he++;
      else if (/[a-zA-Z]/.test(ch)) latin++;
    }
  }
  const total = he + latin;
  if (total === 0) return "en";
  const heRatio = he / total;
  if (heRatio > 0.75) return "he";
  if (heRatio < 0.25) return "en";
  return "mixed";
}

const SIX_HOURS = 6 * 60 * 60 * 1000;

export function extractSignals(messages: ParsedMessage[], maxParticipants = 8): ChatSignals {
  const sorted = [...messages].sort((a, b) => a.ts - b.ts);

  // Keep only the most-active participants (group exports can contain dozens).
  const countBySender = new Map<string, number>();
  for (const m of sorted) countBySender.set(m.sender, (countBySender.get(m.sender) ?? 0) + 1);
  const keep = new Set(topN(countBySender, maxParticipants));
  const msgs = sorted.filter((m) => keep.has(m.sender));

  const perSender = new Map<
    string,
    {
      count: number;
      wordTotal: number;
      emojiCount: number;
      emojis: Map<string, number>;
      words: Map<string, number>;
      starts: number;
      bursts: number;
      longest: number;
      first: ParsedMessage | null;
    }
  >();
  for (const name of keep) {
    perSender.set(name, {
      count: 0,
      wordTotal: 0,
      emojiCount: 0,
      emojis: new Map(),
      words: new Map(),
      starts: 0,
      bursts: 0,
      longest: 0,
      first: null,
    });
  }

  const emojiTotals = new Map<string, number>();
  const monthCounts = new Map<string, number>();
  const hourCounts = new Array(24).fill(0);
  const weekdayCounts = new Array(7).fill(0);
  const daySet = new Set<string>();
  let laughterCount = 0;

  let prev: ParsedMessage | null = null;
  let runSender = "";
  let runLength = 0;
  let longestSilence = 0;

  for (const m of msgs) {
    const s = perSender.get(m.sender)!;
    s.count++;
    const ws = words(m.text);
    s.wordTotal += ws.length;
    for (const w of ws) {
      if (!isStopword(w)) s.words.set(w, (s.words.get(w) ?? 0) + 1);
    }
    const ems = extractEmojis(m.text);
    s.emojiCount += ems.length;
    for (const e of ems) {
      s.emojis.set(e, (s.emojis.get(e) ?? 0) + 1);
      emojiTotals.set(e, (emojiTotals.get(e) ?? 0) + 1);
    }
    if (m.text.length > s.longest) s.longest = m.text.length;
    if (!s.first) s.first = m;

    laughterCount += (m.text.match(LAUGH_RE) ?? []).length;

    const d = new Date(m.ts);
    hourCounts[d.getHours()]++;
    weekdayCounts[d.getDay()]++;
    monthCounts.set(monthKey(m.ts), (monthCounts.get(monthKey(m.ts)) ?? 0) + 1);
    daySet.add(dayKey(m.ts));

    if (prev) {
      const gap = m.ts - prev.ts;
      if (gap > SIX_HOURS) s.starts++;
      if (gap > longestSilence) longestSilence = gap;
    } else {
      s.starts++;
    }

    if (m.sender === runSender) {
      runLength++;
      if (runLength === 3) s.bursts++;
    } else {
      runSender = m.sender;
      runLength = 1;
    }
    prev = m;
  }

  // Longest daily streak
  const sortedDays = [...daySet].sort();
  let streak = 0;
  let bestStreak = 0;
  let prevDay: string | null = null;
  for (const day of sortedDays) {
    if (prevDay) {
      const diff =
        (new Date(day).getTime() - new Date(prevDay).getTime()) / (24 * 60 * 60 * 1000);
      streak = diff === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    if (streak > bestStreak) bestStreak = streak;
    prevDay = day;
  }

  const participants: ParticipantSignals[] = [...perSender.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, s]) => ({
      name,
      messageCount: s.count,
      avgWordsPerMessage: s.count ? Math.round((s.wordTotal / s.count) * 10) / 10 : 0,
      emojiCount: s.emojiCount,
      topEmojis: topN(s.emojis, 5),
      topWords: topN(s.words, 8),
      conversationStarts: s.starts,
      burstCount: s.bursts,
      longestMessageChars: s.longest,
      firstMessage: s.first
        ? { month: monthKey(s.first.ts), snippet: s.first.text.slice(0, 100) }
        : null,
    }));

  const busiestMonthKey = topN(monthCounts, 1)[0] ?? monthKey(Date.now());
  const busiestHour = hourCounts.indexOf(Math.max(...hourCounts));
  const busiestWeekday = weekdayCounts.indexOf(Math.max(...weekdayCounts));

  const hourBuckets = {
    night: hourCounts.slice(0, 6).reduce((a: number, b: number) => a + b, 0),
    morning: hourCounts.slice(6, 12).reduce((a: number, b: number) => a + b, 0),
    afternoon: hourCounts.slice(12, 18).reduce((a: number, b: number) => a + b, 0),
    evening: hourCounts.slice(18, 24).reduce((a: number, b: number) => a + b, 0),
  };

  return {
    language: detectLanguage(msgs),
    participants,
    totalMessages: msgs.length,
    firstDate: msgs.length ? dayKey(msgs[0].ts) : "",
    lastDate: msgs.length ? dayKey(msgs[msgs.length - 1].ts) : "",
    activeDays: daySet.size,
    busiestMonth: { month: busiestMonthKey, count: monthCounts.get(busiestMonthKey) ?? 0 },
    busiestHour,
    busiestWeekday,
    hourBuckets,
    longestStreakDays: bestStreak,
    longestSilenceDays: Math.round(longestSilence / (24 * 60 * 60 * 1000)),
    laughterCount,
    topEmojis: topN(emojiTotals, 6),
    snippets: pickSnippets(msgs),
  };
}

/**
 * Picks up to 12 short, memorable quotes. This is the only raw chat text that
 * leaves the device, deliberately capped in count and length.
 */
function pickSnippets(msgs: ParsedMessage[]): ChatSignals["snippets"] {
  const candidates = msgs.filter((m) => {
    const t = m.text;
    if (t.length < 12 || t.length > 110) return false;
    if (/https?:\/\//.test(t)) return false;
    // exclude anything that looks like sensitive data
    if (/\d{6,}/.test(t)) return false;
    return true;
  });

  const scored = candidates.map((m) => {
    let score = 0;
    score += (m.text.match(EMOJI_RE) ?? []).length * 2;
    score += (m.text.match(/[!?]/g) ?? []).length;
    if (m.text === m.text.toUpperCase() && /[A-Z]/.test(m.text)) score += 3;
    score += (m.text.match(LAUGH_RE) ?? []).length;
    score += Math.min(m.text.length / 40, 2);
    return { m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Spread across senders: round-robin from each sender's best quotes.
  const bySender = new Map<string, ParsedMessage[]>();
  for (const { m } of scored) {
    const arr = bySender.get(m.sender) ?? [];
    if (arr.length < 4) arr.push(m);
    bySender.set(m.sender, arr);
  }
  const picked: ParsedMessage[] = [];
  let round = 0;
  while (picked.length < 12) {
    let added = false;
    for (const arr of bySender.values()) {
      if (arr[round] && picked.length < 12) {
        picked.push(arr[round]);
        added = true;
      }
    }
    if (!added) break;
    round++;
  }

  return picked.map((m) => ({ sender: m.sender, month: monthKey(m.ts), text: m.text }));
}

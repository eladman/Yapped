import type { ChatSignals, QuizQuestion, Relationship } from "./types";

/**
 * Deterministic quiz generator used when ANTHROPIC_API_KEY is not configured
 * (or the AI call fails). Builds questions purely from the extracted stats so
 * the whole product flow works without any external call.
 */

function shuffleWithCorrect(correct: string, distractors: string[], seed: number) {
  const options = [correct, ...distractors.filter((d) => d !== correct)].slice(0, 4);
  while (options.length < 4) options.push(options[options.length - 1] + " ");
  // simple deterministic shuffle
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed * 31 + i * 17) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { options: arr, correctIndex: arr.indexOf(correct) };
}

function numberDistractors(n: number): string[] {
  const variants = [
    Math.max(1, Math.round(n * 0.55)),
    Math.round(n * 1.6),
    Math.round(n * 2.4),
  ];
  return variants.map((v) => v.toLocaleString());
}

function formatMonth(month: string, he: boolean): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString(he ? "he-IL" : "en-US", { month: "long", year: "numeric" });
}

export function buildFallbackQuiz(
  signals: ChatSignals,
  relationship: Relationship
): { title: string; questions: QuizQuestion[] } {
  const he = signals.language === "he";
  const names = signals.participants.map((p) => p.name);
  const qs: QuizQuestion[] = [];
  const two = names.length >= 2;

  const nameOptions = (correct: string, seed: number) => {
    const pool = names.length >= 4 ? names : [...names, he ? "אף אחד" : "No one", he ? "שניהם" : "Both of us"];
    return shuffleWithCorrect(correct, pool.filter((n) => n !== correct).slice(0, 3), seed);
  };

  // 1. Who sends more messages
  if (two) {
    const top = [...signals.participants].sort((a, b) => b.messageCount - a.messageCount)[0];
    const { options, correctIndex } = nameOptions(top.name, 1);
    qs.push({
      question: he ? "מי שולח/ת הכי הרבה הודעות?" : "Who sends the most messages?",
      options,
      correctIndex,
      spice: he
        ? `${top.name} עם ${top.messageCount.toLocaleString()} הודעות. אין תחרות בכלל`
        : `${top.name} with ${top.messageCount.toLocaleString()} messages. It wasn't even close`,
    });
  }

  // 2. Who writes longer messages
  if (two) {
    const top = [...signals.participants].sort(
      (a, b) => b.avgWordsPerMessage - a.avgWordsPerMessage
    )[0];
    const { options, correctIndex } = nameOptions(top.name, 2);
    qs.push({
      question: he ? "מי כותב/ת את ההודעות הכי ארוכות?" : "Who writes the longest messages?",
      options,
      correctIndex,
      spice: he
        ? `${top.name}, בממוצע ${top.avgWordsPerMessage} מילים להודעה. רומן שלם`
        : `${top.name}, averaging ${top.avgWordsPerMessage} words per message. A novelist`,
    });
  }

  // 3. Total messages
  {
    const correct = signals.totalMessages.toLocaleString();
    const { options, correctIndex } = shuffleWithCorrect(
      correct,
      numberDistractors(signals.totalMessages),
      3
    );
    qs.push({
      question: he
        ? "כמה הודעות נשלחו בצ'אט הזה בסך הכל?"
        : "How many messages have been sent in this chat, total?",
      options,
      correctIndex,
    });
  }

  // 4. Time of day
  {
    const buckets = signals.hourBuckets;
    const entries: [string, number, string, string][] = [
      ["night", buckets.night, "Late night (12am–6am)", "לילה מאוחר (00:00–06:00)"],
      ["morning", buckets.morning, "Morning (6am–12pm)", "בוקר (06:00–12:00)"],
      ["afternoon", buckets.afternoon, "Afternoon (12pm–6pm)", "צהריים (12:00–18:00)"],
      ["evening", buckets.evening, "Evening (6pm–12am)", "ערב (18:00–00:00)"],
    ];
    const best = [...entries].sort((a, b) => b[1] - a[1])[0];
    const options = entries.map((e) => (he ? e[3] : e[2]));
    qs.push({
      question: he ? "מתי הצ'אט הזה הכי פעיל?" : "When is this chat most active?",
      options,
      correctIndex: entries.indexOf(best),
    });
  }

  // 5. Top emoji
  if (signals.topEmojis.length >= 1) {
    const correct = signals.topEmojis[0];
    const fillers = ["😂", "❤️", "🙏", "😭", "🔥", "👍", "🤣", "💀"].filter(
      (e) => e !== correct
    );
    const distractors = [...signals.topEmojis.slice(1), ...fillers].slice(0, 3);
    const { options, correctIndex } = shuffleWithCorrect(correct, distractors, 5);
    qs.push({
      question: he ? "מה האימוג'י הכי נפוץ בצ'אט?" : "What's the most used emoji in this chat?",
      options,
      correctIndex,
    });
  }

  // 6. Who starts conversations
  if (two) {
    const top = [...signals.participants].sort(
      (a, b) => b.conversationStarts - a.conversationStarts
    )[0];
    const { options, correctIndex } = nameOptions(top.name, 6);
    qs.push({
      question: he
        ? "מי בדרך כלל פותח/ת את השיחה אחרי שקט ארוך?"
        : "Who usually breaks the silence and texts first?",
      options,
      correctIndex,
      spice: he ? "מישהו פה עושה את כל העבודה" : "Someone's doing all the heavy lifting here",
    });
  }

  // 7. Busiest month
  if (signals.busiestMonth.count > 0) {
    const correct = formatMonth(signals.busiestMonth.month, he);
    const [y, m] = signals.busiestMonth.month.split("-").map(Number);
    const others = [-3, 4, 9].map((off) => {
      const d = new Date(y, m - 1 + off, 1);
      return formatMonth(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        he
      );
    });
    const { options, correctIndex } = shuffleWithCorrect(correct, others, 7);
    qs.push({
      question: he
        ? "באיזה חודש הצ'אט היה הכי מטורף?"
        : "Which month was this chat at its absolute peak?",
      options,
      correctIndex,
      spice: he
        ? `${signals.busiestMonth.count.toLocaleString()} הודעות בחודש אחד`
        : `${signals.busiestMonth.count.toLocaleString()} messages in a single month`,
    });
  }

  // 8. Who double-texts
  if (two) {
    const top = [...signals.participants].sort((a, b) => b.burstCount - a.burstCount)[0];
    const { options, correctIndex } = nameOptions(top.name, 8);
    qs.push({
      question: he
        ? "מי הכי אשם/ה בשליחת שלוש הודעות ברצף?"
        : "Who is most guilty of the triple-text?",
      options,
      correctIndex,
      spice: he ? "לנשום זה חשוב" : "Breathing between messages is free, you know",
    });
  }

  // 9. Snippet question
  const snip = signals.snippets.find((s) => s.text.length >= 15);
  if (snip && two) {
    const { options, correctIndex } = nameOptions(snip.sender, 9);
    qs.push({
      question: he ? `מי כתב/ה: "${snip.text}"?` : `Who sent this: "${snip.text}"?`,
      options,
      correctIndex,
    });
  }

  // 10. Longest streak
  if (signals.longestStreakDays >= 3) {
    const correct = String(signals.longestStreakDays);
    const { options, correctIndex } = shuffleWithCorrect(
      correct,
      numberDistractors(signals.longestStreakDays),
      10
    );
    qs.push({
      question: he
        ? "כמה ימים ברצף דיברתם בלי לפספס יום?"
        : "What's the longest streak of consecutive days you've talked?",
      options,
      correctIndex,
    });
  }

  const titles: Record<Relationship, [string, string]> = {
    partner: ["How well do you actually know us?", "כמה טוב אתם באמת מכירים אותנו?"],
    friend: ["How well do you actually know this chat?", "כמה טוב אתם באמת מכירים את הצ'אט?"],
    family: ["The family chat quiz", "החידון של הצ'אט המשפחתי"],
    group: ["Who was actually paying attention?", "מי באמת שם לב מה קורה פה?"],
  };

  return { title: titles[relationship][he ? 1 : 0], questions: qs.slice(0, 10) };
}

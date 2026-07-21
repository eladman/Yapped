"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Results {
  title: string;
  relationship: string;
  language: string;
  stats: { totalMessages: number; firstDate: string; lastDate: string; topEmojis: string[] };
  me: { id: string; name: string; score: number; total: number; verdict: string };
  leaderboard: { id: string; name: string; score: number }[];
  breakdown: {
    question: string;
    options: string[];
    correctIndex: number;
    spice: string | null;
    myAnswer: number | null;
    answers: { name: string; answer: number | null }[];
  }[];
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<p className="py-24 text-center text-ink-3">loading…</p>}>
      <ResultsInner />
    </Suspense>
  );
}

function ResultsInner() {
  const { slug } = useParams<{ slug: string }>();
  const playerId = useSearchParams().get("p");
  const [data, setData] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playerId) {
      setError("Missing player — play the quiz first");
      return;
    }
    fetch(`/api/quiz/${slug}/results?p=${playerId}`)
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Couldn't load results");
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [slug, playerId]);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0f",
        scale: 3,
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "yapped-results.png";
      a.click();
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="display text-2xl">Hold on</h1>
        <p className="mt-3 text-ink-3">{error}</p>
        <Link href={`/q/${slug}`} className="btn-primary mt-6">
          play the quiz <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }
  if (!data) return <p className="py-24 text-center text-ink-3">tallying the damage…</p>;

  const rtl = data.language === "he";
  const winner = data.leaderboard[0];

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12">
      {/* THE share card */}
      <div ref={cardRef} className="share-card-bg rounded-[16px] border border-line-strong p-7">
        <span className="eyebrow">the verdict</span>
        <div className="mt-4 flex items-end gap-1">
          <span className="display text-6xl">{data.me.score}</span>
          <span className="display pb-1 text-2xl text-ink-4">/{data.me.total}</span>
        </div>
        <p className="mt-3 text-lg text-ink-2">{data.me.verdict}</p>

        <div className="mt-6 border-t border-line pt-4">
          {data.leaderboard.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between py-1.5">
              <span className="flex items-center gap-2 text-sm text-ink-3">
                <span className="w-5 text-ink-4">{i + 1}</span>
                {p.name}
                {p.id === data.me.id && <span className="text-ink-4">(you)</span>}
              </span>
              <span
                className={`display text-lg ${p.id === winner?.id ? "text-pink" : "text-ink-2"}`}
              >
                {p.score}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-ink-4">
            {data.stats.totalMessages.toLocaleString()} messages of history{" "}
            {data.stats.topEmojis.join("")}
          </span>
          <span className="text-[9px] text-ink-4">yapped.app</span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="btn-primary" onClick={downloadCard} disabled={saving}>
          {saving ? "rendering…" : "download results card"} <span aria-hidden>↓</span>
        </button>
        <Link href="/create" className="btn-secondary">
          make one for your chat
        </Link>
      </div>

      {/* waiting-on hint for group play */}
      {data.leaderboard.length === 1 && (
        <p className="mt-5 text-sm text-ink-3">
          You&apos;re first in — send the link around and check back for the leaderboard 👀
        </p>
      )}

      {/* Per-question breakdown */}
      <section className="mt-12">
        <span className="eyebrow">where you matched · where you diverged</span>
        <div className="mt-4 flex flex-col gap-3">
          {data.breakdown.map((q, i) => {
            const right = q.myAnswer === q.correctIndex;
            return (
              <div key={i} className="card p-5" dir={rtl ? "rtl" : "ltr"}>
                <div className="flex items-start justify-between gap-3" dir="ltr">
                  <span className="eyebrow">q{i + 1}</span>
                  <span className={`text-sm ${right ? "text-lime" : "text-ink-4"}`}>
                    {right ? "✓ you got it" : "✗ missed it"}
                  </span>
                </div>
                <p className="display mt-2 text-lg">{q.question}</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {q.options.map((o, j) => {
                    const isCorrect = j === q.correctIndex;
                    const mine = j === q.myAnswer;
                    const others = q.answers.filter((a) => a.answer === j && a.name);
                    return (
                      <div
                        key={j}
                        className={`flex items-center justify-between rounded-[9px] border px-3 py-2 text-sm ${
                          isCorrect
                            ? "border-pink-border bg-pink-dim text-pink"
                            : mine
                              ? "border-line-strong text-ink-2"
                              : "border-line text-ink-4"
                        }`}
                      >
                        <span>
                          {o}
                          {isCorrect && " ✓"}
                        </span>
                        {others.length > 0 && (
                          <span className="text-[11px] text-ink-4" dir="ltr">
                            {others.map((a) => a.name).join(", ")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {q.spice && <p className="mt-3 text-[13px] text-ink-3">{q.spice}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

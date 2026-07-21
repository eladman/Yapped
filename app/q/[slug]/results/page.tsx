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
        backgroundColor: "#faf6f4",
        scale: 3,
        // The clone re-runs entrance animations, capturing everything at
        // opacity 0 — strip them so the card renders in its settled state.
        onclone: (doc) => {
          doc.querySelectorAll(".rise").forEach((el) => {
            el.classList.remove("rise", "d1", "d2", "d3", "d4", "d5");
          });
        },
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
        <h1 className="display text-[24px]">Hold on</h1>
        <p className="mt-3 text-[14px] text-ink-3">{error}</p>
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
    <div className="mx-auto w-full max-w-md px-5 py-10">
      {/* THE share card — keep everything inside html2canvas-safe:
          no backdrop-filter, no Tailwind default-palette colors, only token vars/hex. */}
      <div
        ref={cardRef}
        className="share-card-bg rise d1 relative overflow-hidden rounded-[28px] border border-pink-border p-7"
      >
        <div
          aria-hidden
          className="absolute -right-20 -top-24 h-72 w-72 bg-[radial-gradient(closest-side,rgba(244,178,211,0.5),rgba(244,178,211,0))]"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-16 h-64 w-64 bg-[radial-gradient(closest-side,rgba(208,192,242,0.42),rgba(208,192,242,0))]"
        />

        <div className="relative">
          <span className="eyebrow">the verdict</span>
          <div className="mt-4 flex items-end gap-1.5">
            <span className="display text-[64px] leading-none">{data.me.score}</span>
            <span className="display pb-1.5 text-[24px] text-ink-4">/{data.me.total}</span>
          </div>
          <p className="romantic mt-3 text-[22px] text-ink-2">{data.me.verdict}</p>

          <div className="mt-6 border-t border-pink-border pt-4">
            {data.leaderboard.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-[14px] text-ink-3">
                  <span className="w-5 text-ink-4">{i + 1}</span>
                  {p.name}
                  {p.id === data.me.id && <span className="text-ink-4">(you)</span>}
                </span>
                <span
                  className={`display text-[18px] ${
                    p.id === winner?.id ? "text-rose" : "text-ink-2"
                  }`}
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
            <span className="romantic text-[12px] text-ink-4">yapped.app</span>
          </div>
        </div>
      </div>

      <div className="rise d2 mt-5 flex flex-col gap-3">
        <button className="btn-primary" onClick={downloadCard} disabled={saving}>
          {saving ? "rendering…" : "download results card"} <span aria-hidden>↓</span>
        </button>
        <Link href="/create" className="btn-secondary">
          make one for your chat
        </Link>
      </div>

      {/* waiting-on hint for group play */}
      {data.leaderboard.length === 1 && (
        <p className="rise d3 mt-5 text-center text-[13.5px] text-ink-3">
          You&apos;re first in — send the link around and check back for the leaderboard 👀
        </p>
      )}

      {/* Per-question breakdown */}
      <section className="rise d3 mt-12">
        <div className="text-center">
          <span className="eyebrow">where you matched · where you diverged</span>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {data.breakdown.map((q, i) => {
            const right = q.myAnswer === q.correctIndex;
            return (
              <div key={i} className="card p-5" dir={rtl ? "rtl" : "ltr"}>
                <div className="flex items-start justify-between gap-3" dir="ltr">
                  <span className="eyebrow">q{i + 1}</span>
                  <span
                    className={`text-[13px] font-medium ${right ? "text-green" : "text-ink-4"}`}
                  >
                    {right ? "✓ you got it" : "✗ missed it"}
                  </span>
                </div>
                <p className="display mt-2 text-[17px]">{q.question}</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {q.options.map((o, j) => {
                    const isCorrect = j === q.correctIndex;
                    const mine = j === q.myAnswer;
                    const others = q.answers.filter((a) => a.answer === j && a.name);
                    return (
                      <div
                        key={j}
                        className={`flex items-center justify-between rounded-chip border px-3 py-2 text-[14px] ${
                          isCorrect
                            ? "border-pink-border bg-pink-soft text-rose"
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

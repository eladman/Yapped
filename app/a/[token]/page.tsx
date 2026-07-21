"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AdminData {
  title: string;
  status: "preview" | "paid";
  relationship: string;
  shareSlug: string | null;
  priceAgorot: number;
  totalQuestions: number;
  previewQuestions: { question: string; options: string[] }[];
  leaderboard: { name: string; score: number }[];
}

export default function AdminPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/admin/${token}`)
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Not found");
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const unlock = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/${token}/unlock`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Unlock failed");
      if (d.status === "redirect" && d.url) {
        window.location.href = d.url;
        return;
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unlock failed");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="display text-2xl">Nothing here</h1>
        <p className="mt-3 text-ink-3">{error}</p>
      </div>
    );
  }
  if (!data) return <p className="py-24 text-center text-ink-3">loading…</p>;

  const shareUrl =
    data.shareSlug && typeof window !== "undefined"
      ? `${window.location.origin}/q/${data.shareSlug}`
      : null;

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12">
      <span className="eyebrow">creator dashboard</span>
      <h1 className="display mt-2 text-3xl">{data.title}</h1>
      <p className="mt-2 text-sm text-ink-3">
        {data.totalQuestions} questions ·{" "}
        {data.status === "paid" ? "unlocked ✓" : "not unlocked yet"}
      </p>

      {data.status === "preview" && (
        <div className="card-elevated mt-6 p-6">
          <h2 className="font-medium">Unlock the share link</h2>
          <p className="mt-1 text-sm text-ink-3">
            One-time ₪{(data.priceAgorot / 100).toFixed(0)}. Everyone you send it to plays
            free.
          </p>
          <button className="btn-primary mt-4" onClick={unlock} disabled={busy}>
            unlock now <span aria-hidden>→</span>
          </button>
        </div>
      )}

      {shareUrl && (
        <div className="card-elevated mt-6 flex items-center justify-between gap-3 p-3 pl-5">
          <span className="truncate text-sm text-ink-2">{shareUrl}</span>
          <button
            className="btn-primary shrink-0 !px-5 !py-2.5 text-sm"
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? "copied ✓" : "copy link"}
          </button>
        </div>
      )}

      <section className="mt-10">
        <span className="eyebrow">leaderboard</span>
        {data.leaderboard.length === 0 ? (
          <p className="mt-3 text-sm text-ink-3">
            Nobody has played yet.{" "}
            {data.status === "paid"
              ? "Send the link and refresh — scores show up here live."
              : "Unlock the link to start the game."}
          </p>
        ) : (
          <div className="card mt-3 p-5">
            {data.leaderboard.map((p, i) => (
              <div key={`${p.name}-${i}`} className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-sm text-ink-3">
                  <span className="w-5 text-ink-4">{i + 1}</span>
                  {p.name}
                </span>
                <span className={`display text-lg ${i === 0 ? "text-pink" : "text-ink-2"}`}>
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        )}
        <button className="btn-secondary mt-4 !px-5 !py-2 text-sm" onClick={load}>
          refresh
        </button>
      </section>

      <section className="mt-10">
        <span className="eyebrow">preview</span>
        <div className="mt-3 flex flex-col gap-3">
          {data.previewQuestions.map((q, i) => (
            <div key={i} className="card p-4">
              <p className="font-medium">{q.question}</p>
              <p className="mt-1 text-[13px] text-ink-4">{q.options.join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-[13px] text-ink-4">
        Keep this page&apos;s URL private — anyone with it can manage the quiz.{" "}
        <Link className="underline" href="/create">
          Make another quiz →
        </Link>
      </p>
    </div>
  );
}

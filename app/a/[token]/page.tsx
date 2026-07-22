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
        <h1 className="display text-[24px]">Nothing here</h1>
        <p className="mt-3 text-[14px] text-fg-3">{error}</p>
      </div>
    );
  }
  if (!data)
    return <p className="py-24 text-center font-mono text-[14px] text-fg-3">loading…</p>;

  const shareUrl =
    data.shareSlug && typeof window !== "undefined"
      ? `${window.location.origin}/q/${data.shareSlug}`
      : null;

  return (
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <span className="eyebrow rise d1">creator dashboard</span>
      <h1 className="display rise d2 mt-3 text-[28px]">{data.title}</h1>
      <p className="rise d2 mt-2 font-mono text-[12.5px] text-fg-3">
        {data.totalQuestions} questions ·{" "}
        {data.status === "paid" ? "unlocked ✓" : "not unlocked yet"}
      </p>

      {data.status === "preview" && (
        <div className="card rise d3 mt-6 p-6 text-center">
          <h2 className="text-[15px] font-semibold">Unlock the share link</h2>
          <p className="mt-1 text-[13.5px] text-fg-3">
            One-time ₪{(data.priceAgorot / 100).toFixed(0)}. Everyone you send it to plays
            free.
          </p>
          <button className="btn-primary mt-4 w-full" onClick={unlock} disabled={busy}>
            unlock now <span aria-hidden>→</span>
          </button>
        </div>
      )}

      {shareUrl && (
        <div className="card-glass rise d3 mt-6 flex items-center justify-between gap-3 !rounded-full p-2 pl-5">
          <span className="truncate text-[14px] text-fg-2">{shareUrl}</span>
          <button
            className="btn-primary shrink-0 !px-5 !py-2.5 !text-[14px]"
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

      <section className="rise d4 mt-10">
        <span className="eyebrow">leaderboard</span>
        {data.leaderboard.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-fg-3">
            Nobody has played yet.{" "}
            {data.status === "paid"
              ? "Send the link and refresh — scores show up here live."
              : "Unlock the link to start the game."}
          </p>
        ) : (
          <div className="card mt-3 px-5 py-3">
            {data.leaderboard.map((p, i) => (
              <div key={`${p.name}-${i}`} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-[14px] text-fg-3">
                  <span className="w-5 font-mono text-[12px] text-fg-4">{i + 1}</span>
                  {p.name}
                </span>
                <span
                  className={`display text-[18px] ${i === 0 ? "text-violet" : "text-fg-2"}`}
                >
                  {p.score}
                </span>
              </div>
            ))}
          </div>
        )}
        <button className="btn-secondary mt-4 !px-5 !py-2 !text-[14px]" onClick={load}>
          refresh
        </button>
      </section>

      <section className="rise d5 mt-10">
        <span className="eyebrow">preview</span>
        <div className="mt-3 flex flex-col gap-3">
          {data.previewQuestions.map((q, i) => (
            <div key={i} className="card p-5">
              <p className="text-[15px] font-semibold">{q.question}</p>
              <p className="mt-1 text-[13px] text-fg-4">{q.options.join(" · ")}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-[12.5px] text-fg-4">
        Keep this page&apos;s URL private — anyone with it can manage the quiz.{" "}
        <Link className="underline" href="/create">
          Make another quiz →
        </Link>
      </p>
    </div>
  );
}

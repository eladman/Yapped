"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { parseWhatsAppExport, type ParseResult } from "@/lib/parser";
import { extractSignals } from "@/lib/signals";
import { readExportFile } from "@/lib/read-export";
import type { ChatSignals, Relationship } from "@/lib/types";

type Step = "upload" | "confirm" | "generating" | "preview" | "share";

interface PreviewData {
  adminToken: string;
  title: string;
  totalQuestions: number;
  priceAgorot: number;
  usedFallback: boolean;
  previewQuestions: { question: string; options: string[] }[];
}

const RELATIONSHIPS: { key: Relationship; label: string; hint: string }[] = [
  { key: "partner", label: "Romantic partner", hint: "warm-teasing, a little nostalgic" },
  { key: "friend", label: "Friend", hint: "maximum roast" },
  { key: "family", label: "Family", hint: "light and warm" },
  { key: "group", label: "Friend group", hint: "inside-joke energy, leaderboard chaos" },
];

export default function CreatePage() {
  const [step, setStep] = useState<Step>("upload");
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [signals, setSignals] = useState<ChatSignals | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const text = await readExportFile(file);
      const result = parseWhatsAppExport(text);
      if (result.messages.length < 30) {
        setError(
          "Couldn't find enough messages in that file. Make sure it's a WhatsApp chat export (.txt or .zip, exported without media)."
        );
        return;
      }
      setParsed(result);
      setSignals(extractSignals(result.messages));
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file");
    }
  }, []);

  const generate = useCallback(async () => {
    if (!signals || !relationship) return;
    setBusy(true);
    setError(null);
    setStep("generating");
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals, relationship }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setPreview(data);
      // remember the admin link on this device
      try {
        const mine = JSON.parse(localStorage.getItem("yapped_quizzes") ?? "[]");
        mine.push({ adminToken: data.adminToken, title: data.title, at: Date.now() });
        localStorage.setItem("yapped_quizzes", JSON.stringify(mine));
      } catch {}
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("confirm");
    } finally {
      setBusy(false);
    }
  }, [signals, relationship]);

  const unlock = useCallback(async () => {
    if (!preview) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/${preview.adminToken}/unlock`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unlock failed");
      if (data.status === "redirect" && data.url) {
        window.location.href = data.url;
        return;
      }
      setShareSlug(data.shareSlug);
      setStep("share");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unlock failed");
    } finally {
      setBusy(false);
    }
  }, [preview]);

  const yearsSpan = useMemo(() => {
    if (!signals) return "";
    const ms = new Date(signals.lastDate).getTime() - new Date(signals.firstDate).getTime();
    const years = ms / (365 * 24 * 60 * 60 * 1000);
    if (years >= 1) return `${Math.round(years * 10) / 10} years`;
    const months = Math.max(1, Math.round(ms / (30 * 24 * 60 * 60 * 1000)));
    return `${months} month${months > 1 ? "s" : ""}`;
  }, [signals]);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      {step === "upload" && (
        <section>
          <span className="eyebrow">step 1 · upload</span>
          <h1 className="display mt-2 text-3xl">Drop your chat export here</h1>
          <p className="mt-3 text-ink-3">
            In WhatsApp: open the chat → ⋮ (or the contact name) → More → Export chat →{" "}
            <strong className="text-ink-2">without media</strong>. Then upload the .txt or .zip.
          </p>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInput.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`card mt-8 flex cursor-pointer flex-col items-center gap-3 px-6 py-14 text-center transition-colors ${
              dragOver ? "border-pink" : "hover:border-line-strong"
            }`}
          >
            <span className="text-3xl" aria-hidden>
              📥
            </span>
            <p className="font-medium">Drag the export here, or tap to choose a file</p>
            <p className="text-sm text-ink-4">.txt or .zip · exported without media</p>
            <input
              ref={fileInput}
              type="file"
              accept=".txt,.zip,text/plain,application/zip"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
            <span className="text-pink">🔒</span>
            Your chat is analyzed in your browser. The raw messages never leave your device —
            not to us, not to anyone.
          </p>
          {error && <ErrorLine text={error} />}
        </section>
      )}

      {step === "confirm" && signals && parsed && (
        <section>
          <span className="eyebrow">step 2 · who&apos;s this for?</span>
          <h1 className="display mt-2 text-3xl">Found it. This chat has history.</h1>

          <div className="card mt-6 grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <Stat label="messages" value={signals.totalMessages.toLocaleString()} />
            <Stat label="people" value={String(signals.participants.length)} />
            <Stat label="time span" value={yearsSpan} />
            <Stat label="active days" value={signals.activeDays.toLocaleString()} />
          </div>
          <p className="mt-3 text-sm text-ink-3">
            Between {signals.participants.map((p) => p.name).join(", ")}
          </p>

          <h2 className="mt-8 font-medium">Pick the vibe</h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {RELATIONSHIPS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRelationship(r.key)}
                className={`rounded-[14px] border px-4 py-3.5 text-left transition-colors ${
                  relationship === r.key
                    ? "border-pink-border bg-pink-dim"
                    : "border-line bg-surface hover:border-line-strong"
                }`}
              >
                <span className={relationship === r.key ? "text-pink" : ""}>{r.label}</span>
                <span className="mt-0.5 block text-[13px] text-ink-4">{r.hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button className="btn-primary" disabled={!relationship || busy} onClick={generate}>
              generate my quiz <span aria-hidden>→</span>
            </button>
            <button className="btn-secondary" onClick={() => setStep("upload")}>
              different chat
            </button>
          </div>
          <p className="mt-4 text-[13px] text-ink-4">
            Only stats and a few short quotes are sent to write the questions — never the full
            chat. Nothing is kept after generation.
          </p>
          {error && <ErrorLine text={error} />}
        </section>
      )}

      {step === "generating" && (
        <section className="flex flex-col items-center py-24 text-center">
          <span className="eyebrow-chip animate-pulse">reading the receipts</span>
          <h1 className="display mt-6 text-3xl">Writing your quiz…</h1>
          <p className="mt-3 max-w-sm text-ink-3">
            Digging through {signals?.totalMessages.toLocaleString()} messages of history. This
            takes a moment.
          </p>
        </section>
      )}

      {step === "preview" && preview && (
        <section>
          <span className="eyebrow">step 3 · the tease</span>
          <h1 className="display mt-2 text-3xl">{preview.title}</h1>
          <p className="mt-3 text-ink-3">
            {preview.totalQuestions} questions, built from your actual chat. Here&apos;s a
            taste:
          </p>
          {preview.usedFallback && (
            <p className="mt-2 text-[13px] text-ink-4">
              (Generated in stats-only mode — set ANTHROPIC_API_KEY for the full AI-written
              version.)
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            {preview.previewQuestions.map((q, i) => (
              <div key={i} className="card p-5">
                <span className="eyebrow">question {i + 1}</span>
                <p className="display mt-2 text-xl">{q.question}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((o) => (
                    <div
                      key={o}
                      className="rounded-[14px] border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink-2"
                    >
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* locked remainder */}
            <div className="card-elevated relative overflow-hidden p-5">
              <div className="pointer-events-none select-none blur-[6px]">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <p className="display text-xl">Who said &quot;██████ ███ █████&quot;?</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {["██████", "████", "███████", "█████"].map((o, j) => (
                        <div
                          key={j}
                          className="rounded-[14px] border border-line px-3.5 py-2.5 text-sm text-ink-4"
                        >
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40">
                <p className="font-medium">
                  {preview.totalQuestions - preview.previewQuestions.length} more questions
                  behind the link
                </p>
                <button className="btn-primary" onClick={unlock} disabled={busy}>
                  unlock &amp; get share link · ₪{(preview.priceAgorot / 100).toFixed(0)}{" "}
                  <span aria-hidden>→</span>
                </button>
                <p className="text-[12px] text-ink-3">
                  one-time. everyone you send it to plays free
                </p>
              </div>
            </div>
          </div>
          {error && <ErrorLine text={error} />}
        </section>
      )}

      {step === "share" && preview && shareSlug && (
        <section className="text-center">
          <span className="eyebrow-chip">it&apos;s live</span>
          <h1 className="display mt-6 text-3xl">Send this link. Watch them sweat.</h1>

          <ShareLink url={`${origin}/q/${shareSlug}`} />

          <p className="mt-6 text-sm text-ink-3">
            Everyone plays free, then the leaderboard does the talking.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href={`/q/${shareSlug}`} className="btn-primary">
              play it yourself <span aria-hidden>→</span>
            </a>
            <a href={`/a/${preview.adminToken}`} className="btn-secondary">
              creator dashboard
            </a>
          </div>
          <p className="mt-6 text-[13px] text-ink-4">
            Bookmark the dashboard link — it&apos;s your private key to watch scores roll in.
          </p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="display text-2xl">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-[0.13em] text-ink-4">{label}</div>
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return <p className="mt-4 text-sm text-pink">{text}</p>;
}

function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card-elevated mx-auto mt-8 flex max-w-md items-center justify-between gap-3 p-3 pl-5">
      <span className="truncate text-sm text-ink-2">{url}</span>
      <button
        className="btn-primary shrink-0 !px-5 !py-2.5 text-sm"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "copied ✓" : "copy link"}
      </button>
    </div>
  );
}

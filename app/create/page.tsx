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

const RELATIONSHIPS: { key: Relationship; emoji: string; label: string; hint: string }[] = [
  { key: "partner", emoji: "💗", label: "Romantic partner", hint: "warm-teasing, a little nostalgic" },
  { key: "friend", emoji: "😏", label: "Friend", hint: "maximum roast" },
  { key: "family", emoji: "🏡", label: "Family", hint: "light and warm" },
  { key: "group", emoji: "🎉", label: "Friend group", hint: "inside-joke energy, leaderboard chaos" },
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
    <div className="mx-auto w-full max-w-md px-5 py-10">
      {step === "upload" && (
        <section>
          <span className="eyebrow rise d1">step 1 · upload</span>
          <h1 className="display rise d2 mt-2 text-[30px]">
            Drop your chat <span className="romantic text-rose">export</span> here
          </h1>
          <p className="rise d3 mt-3 text-[14px] text-ink-3">
            In WhatsApp: open the chat → ⋮ (or the contact name) → More → Export chat →{" "}
            <strong className="font-semibold text-ink-2">without media</strong>. Then upload
            the .txt or .zip.
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
            className={`rise d4 mt-8 flex cursor-pointer flex-col items-center gap-4 rounded-card border-2 border-dashed px-6 py-14 text-center shadow-[var(--yap-shadow-soft)] transition-colors ${
              dragOver ? "border-pink bg-pink-soft" : "border-pink-border bg-white/75"
            }`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-soft text-rose">
              <ArrowDownIcon />
            </span>
            <p className="text-[15px] font-semibold">Tap to choose your export</p>
            <p className="-mt-2 text-[13px] text-ink-4">.txt or .zip · exported without media</p>
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

          <p className="rise d5 mt-5 flex items-start gap-2 text-[13px] text-ink-3">
            <span className="mt-0.5 text-rose">
              <LockIcon />
            </span>
            Your chat is analyzed in your browser. The raw messages never leave your device —
            not to us, not to anyone.
          </p>
          {error && <ErrorLine text={error} />}
        </section>
      )}

      {step === "confirm" && signals && parsed && (
        <section>
          <span className="eyebrow rise d1">step 2 · who&apos;s this for?</span>
          <h1 className="display rise d2 mt-2 text-[30px]">
            Found it. This chat has <span className="romantic text-rose">history</span>.
          </h1>

          <div className="card-glass rise d3 mt-6 grid grid-cols-2 gap-x-4 gap-y-5 p-6">
            <Stat label="messages" value={signals.totalMessages.toLocaleString()} />
            <Stat label="people" value={String(signals.participants.length)} />
            <Stat label="time span" value={yearsSpan} />
            <Stat label="active days" value={signals.activeDays.toLocaleString()} />
          </div>
          <p className="rise d3 mt-3 text-[13px] text-ink-3">
            Between {signals.participants.map((p) => p.name).join(", ")}
          </p>

          <h2 className="rise d4 mt-8 text-[15px] font-semibold">Pick the vibe</h2>
          <div className="rise d4 mt-3 flex flex-col gap-2.5">
            {RELATIONSHIPS.map((r) => {
              const active = relationship === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRelationship(r.key)}
                  className={`answer-option ${active ? "selected" : ""}`}
                >
                  <span className="flex items-center gap-3.5">
                    <span className="text-[20px]" aria-hidden>
                      {r.emoji}
                    </span>
                    <span className="flex-1">
                      <span className={`block text-[15px] ${active ? "" : "text-ink"}`}>
                        {r.label}
                      </span>
                      <span className="mt-0.5 block text-[12.5px] font-normal text-ink-4">
                        {r.hint}
                      </span>
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] transition-colors ${
                        active
                          ? "border-pink bg-pink text-white"
                          : "border-line-strong bg-white text-transparent"
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rise d5 mt-8 flex flex-col gap-3">
            <button className="btn-primary" disabled={!relationship || busy} onClick={generate}>
              generate my quiz <span aria-hidden>→</span>
            </button>
            <button className="btn-secondary" onClick={() => setStep("upload")}>
              different chat
            </button>
          </div>
          <p className="mt-4 text-center text-[12.5px] text-ink-4">
            Only stats and a few short quotes are sent to write the questions — never the full
            chat. Nothing is kept after generation.
          </p>
          {error && <ErrorLine text={error} />}
        </section>
      )}

      {step === "generating" && (
        <section className="relative flex flex-col items-center py-24 text-center">
          <div className="aura absolute top-10 h-52 w-52" aria-hidden />
          <span className="eyebrow-chip relative animate-pulse">reading the receipts</span>
          <h1 className="display relative mt-8 text-[30px]">
            Writing your <span className="romantic text-rose">quiz</span>…
          </h1>
          <p className="relative mt-3 max-w-sm text-[14px] text-ink-3">
            Digging through {signals?.totalMessages.toLocaleString()} messages of history. This
            takes a moment.
          </p>
        </section>
      )}

      {step === "preview" && preview && (
        <section>
          <span className="eyebrow rise d1">step 3 · the tease</span>
          <h1 className="display rise d2 mt-2 text-[28px]">{preview.title}</h1>
          <p className="rise d3 mt-3 text-[14px] text-ink-3">
            {preview.totalQuestions} questions, built from your actual chat. Here&apos;s a
            taste:
          </p>
          {preview.usedFallback && (
            <p className="rise d3 mt-2 text-[12.5px] text-ink-4">
              (Generated in stats-only mode — set ANTHROPIC_API_KEY for the full AI-written
              version.)
            </p>
          )}

          <div className="rise d4 mt-6 flex flex-col gap-3">
            {preview.previewQuestions.map((q, i) => (
              <div key={i} className="card p-5">
                <span className="eyebrow">question {i + 1}</span>
                <p className="display mt-2 text-[19px]">{q.question}</p>
                <div className="mt-3 flex flex-col gap-2">
                  {q.options.map((o) => (
                    <div
                      key={o}
                      className="rounded-chip border border-line bg-bg px-3.5 py-2.5 text-[14px] text-ink-2"
                    >
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* locked remainder */}
            <div className="card relative overflow-hidden p-5">
              <div className="pointer-events-none select-none blur-[6px]">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <p className="display text-[19px]">Who said &quot;██████ ███ █████&quot;?</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {["██████", "████"].map((o, j) => (
                        <div
                          key={j}
                          className="rounded-chip border border-line px-3.5 py-2.5 text-[14px] text-ink-4"
                        >
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/55 px-6 text-center backdrop-blur-[7px]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-soft text-rose">
                  <LockIcon size={16} />
                </span>
                <p className="text-[15px] font-semibold">
                  {preview.totalQuestions - preview.previewQuestions.length} more questions
                  behind the link
                </p>
                <button className="btn-primary" onClick={unlock} disabled={busy}>
                  unlock &amp; get the link · ₪{(preview.priceAgorot / 100).toFixed(0)}{" "}
                  <span aria-hidden>→</span>
                </button>
                <p className="text-[12.5px] text-ink-3">
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
          <div className="rise d1 flex justify-center">
            <span className="eyebrow-chip">it&apos;s live</span>
          </div>
          <h1 className="display rise d2 mt-6 text-[30px]">
            Send the link.{" "}
            <span className="romantic text-rose">Let the leaderboard talk.</span>
          </h1>

          <div className="rise d3">
            <ShareLink url={`${origin}/q/${shareSlug}`} />
          </div>

          <p className="rise d4 mt-6 text-[13.5px] text-ink-3">
            Everyone plays free — scores roll in as they finish.
          </p>

          <div className="rise d5 mt-8 flex flex-col items-center gap-3">
            <a href={`/q/${shareSlug}`} className="btn-primary w-full max-w-[280px]">
              play it yourself <span aria-hidden>→</span>
            </a>
            <a href={`/a/${preview.adminToken}`} className="btn-secondary w-full max-w-[280px]">
              creator dashboard
            </a>
          </div>
          <p className="mt-6 text-[12.5px] text-ink-4">
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
      <div className="display text-[24px]">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-4">{label}</div>
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return <p className="mt-4 text-[14px] font-medium text-rose">{text}</p>;
}

function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card-glass mx-auto mt-8 flex max-w-md items-center justify-between gap-3 rounded-full p-2 pl-5">
      <span className="truncate text-[14px] text-ink-2">{url}</span>
      <button
        className="btn-primary shrink-0 !px-5 !py-2.5 !text-[14px]"
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

function LockIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v13m0 0l-5.5-5.5M12 17l5.5-5.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

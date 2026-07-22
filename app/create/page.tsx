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
  /** edited display names, keyed by the original detected name */
  const [names, setNames] = useState<Record<string, string>>({});
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
      const sig = extractSignals(result.messages);
      setParsed(result);
      setSignals(sig);
      // seed the name editor with each detected participant's name
      setNames(Object.fromEntries(sig.participants.map((p) => [p.name, p.name])));
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
      // apply the user's name edits everywhere a name appears in the signals,
      // so the quiz refers to each person the way the creator wants.
      const displayName = (orig: string) => names[orig]?.trim() || orig;
      const renamed: ChatSignals = {
        ...signals,
        participants: signals.participants.map((p) => ({ ...p, name: displayName(p.name) })),
        snippets: signals.snippets.map((s) => ({ ...s, sender: displayName(s.sender) })),
      };
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signals: renamed, relationship }),
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
  }, [signals, relationship, names]);

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
          <h1 className="display rise d2 mt-3 text-[30px]">
            Drop your chat <span className="grad-text">export</span> here
          </h1>
          <p className="rise d3 mt-3 text-[14px] text-fg-3">
            In WhatsApp: open the chat → ⋮ (or the contact name) → More → Export chat →{" "}
            <strong className="font-semibold text-fg-2">without media</strong>. Then upload
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
            className={`rise d4 mt-8 flex cursor-pointer flex-col items-center gap-4 rounded-card border-2 border-dashed px-6 py-14 text-center shadow-[var(--shadow-soft)] transition-colors ${
              dragOver ? "border-violet bg-violet/5" : "border-line-2 bg-panel"
            }`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-panel-2 text-violet">
              <ArrowDownIcon />
            </span>
            <p className="text-[15px] font-semibold">Tap to choose your export</p>
            <p className="-mt-2 font-mono text-[12px] text-fg-4">
              .txt or .zip · exported without media
            </p>
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

          <p className="rise d5 mt-5 flex items-start gap-2 text-[13px] text-fg-3">
            <span className="mt-0.5 text-violet">
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
          <h1 className="display rise d2 mt-3 text-[30px]">
            Found it. This chat has <span className="grad-text">history</span>.
          </h1>

          <div className="card rise d3 mt-6 grid grid-cols-2 gap-x-4 gap-y-5 p-6">
            <Stat label="messages" value={signals.totalMessages.toLocaleString()} />
            <Stat label="people" value={String(signals.participants.length)} />
            <Stat label="time span" value={yearsSpan} />
            <Stat label="active days" value={signals.activeDays.toLocaleString()} />
          </div>
          <h2 className="rise d3 mt-8 text-[15px] font-semibold">Name the players</h2>
          <p className="rise d3 mt-1 text-[13px] text-fg-3">
            These names show up throughout the quiz. Change them to whatever the players will
            recognize.
          </p>
          <div className="rise d3 mt-3 flex flex-col gap-3">
            {signals.participants.map((p) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-fg-4">
                    detected · {p.name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-fg-4">
                    {p.messageCount.toLocaleString()} msgs
                  </span>
                </div>
                <input
                  className="field"
                  value={names[p.name] ?? p.name}
                  placeholder={p.name}
                  maxLength={40}
                  onChange={(e) =>
                    setNames((prev) => ({ ...prev, [p.name]: e.target.value }))
                  }
                  aria-label={`Name for ${p.name}`}
                />
              </div>
            ))}
          </div>

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
                      <span className="block text-[15px] text-fg">{r.label}</span>
                      <span className="mt-0.5 block text-[12.5px] font-normal text-fg-4">
                        {r.hint}
                      </span>
                    </span>
                    <span className={`chk ${active ? "chk-on" : "chk-off"}`} aria-hidden>
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
          <p className="mt-4 text-center text-[12.5px] text-fg-4">
            Only stats and a few short quotes are sent to write the questions — never the full
            chat. Nothing is kept after generation.
          </p>
          {error && <ErrorLine text={error} />}
        </section>
      )}

      {step === "generating" && (
        <section className="relative flex flex-col items-center py-24 text-center">
          <div className="aura absolute top-10 h-52 w-52" aria-hidden />
          <span className="badge relative animate-pulse">reading the receipts</span>
          <h1 className="display relative mt-8 text-[30px]">
            Writing your <span className="grad-text">quiz</span>…
          </h1>
          <p className="relative mt-3 max-w-sm text-[14px] text-fg-3">
            Digging through {signals?.totalMessages.toLocaleString()} messages of history. This
            takes a moment.
          </p>
        </section>
      )}

      {step === "preview" && preview && (
        <section>
          <span className="eyebrow rise d1">step 3 · the tease</span>
          <h1 className="display rise d2 mt-3 text-[28px]">{preview.title}</h1>
          <p className="rise d3 mt-3 text-[14px] text-fg-3">
            {preview.totalQuestions} questions, built from your actual chat. Here&apos;s a
            taste:
          </p>
          {preview.usedFallback && (
            <p className="rise d3 mt-2 font-mono text-[12px] text-fg-4">
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
                      className="rounded-chip border border-line bg-panel-2 px-3.5 py-2.5 text-[14px] text-fg-2"
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
                          className="rounded-chip border border-line px-3.5 py-2.5 text-[14px] text-fg-4"
                        >
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="veil absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel-2 text-violet">
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
                <p className="text-[12.5px] text-fg-3">
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
            <span className="badge">it&apos;s live</span>
          </div>
          <h1 className="display rise d2 mt-6 text-[30px]">
            Send the link. <span className="grad-text">Let the leaderboard talk.</span>
          </h1>

          <div className="rise d3">
            <ShareLink url={`${origin}/q/${shareSlug}`} />
          </div>

          <p className="rise d4 mt-6 text-[13.5px] text-fg-3">
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
          <p className="mt-6 text-[12.5px] text-fg-4">
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
      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-3">
        {label}
      </div>
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return <p className="mt-4 text-[14px] font-medium text-pink">{text}</p>;
}

function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card-glass mx-auto mt-8 flex max-w-md items-center justify-between gap-3 !rounded-full p-2 pl-5">
      <span className="truncate text-[14px] text-fg-2">{url}</span>
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

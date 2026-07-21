"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface PlayQuiz {
  title: string;
  relationship: string;
  language: string;
  stats: { totalMessages: number; firstDate: string; lastDate: string };
  questions: { question: string; options: string[] }[];
  finishedPlayers: { name: string }[];
}

type Phase = "loading" | "locked" | "missing" | "intro" | "playing" | "submitting";

export default function PlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<PlayQuiz | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/quiz/${slug}`)
      .then(async (res) => {
        if (res.status === 404) return setPhase("missing");
        if (res.status === 403) return setPhase("locked");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setQuiz(data);
        setPhase("intro");
      })
      .catch(() => setPhase("missing"));
  }, [slug]);

  const submit = useCallback(
    async (finalAnswers: number[]) => {
      setPhase("submitting");
      try {
        const res = await fetch(`/api/quiz/${slug}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, answers: finalAnswers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Submit failed");
        router.push(`/q/${slug}/results?p=${data.playerId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
        setPhase("playing");
      }
    },
    [slug, name, router]
  );

  const choose = (i: number) => {
    if (picked !== null || !quiz) return;
    setPicked(i);
    const next = [...answers, i];
    setAnswers(next);
    setTimeout(() => {
      setPicked(null);
      if (next.length >= quiz.questions.length) {
        submit(next);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 350);
  };

  if (phase === "loading") {
    return <Center><p className="text-ink-3">loading…</p></Center>;
  }
  if (phase === "missing") {
    return (
      <Center>
        <h1 className="display text-3xl">Quiz not found</h1>
        <p className="mt-3 text-ink-3">That link doesn&apos;t go anywhere. Double-check it?</p>
      </Center>
    );
  }
  if (phase === "locked") {
    return (
      <Center>
        <span className="eyebrow-chip">not unlocked yet</span>
        <h1 className="display mt-5 text-3xl">This quiz is still cooking</h1>
        <p className="mt-3 max-w-sm text-ink-3">
          The person who made it hasn&apos;t unlocked the link yet. Nudge them.
        </p>
      </Center>
    );
  }
  if (!quiz) return null;

  const rtl = quiz.language === "he";

  if (phase === "intro") {
    return (
      <Center>
        <span className="eyebrow-chip">you&apos;ve been challenged</span>
        <h1 className="display mt-5 max-w-lg text-3xl" dir={rtl ? "rtl" : "ltr"}>
          {quiz.title}
        </h1>
        <p className="mt-3 text-ink-3">
          {quiz.questions.length} questions about a chat with{" "}
          {quiz.stats.totalMessages.toLocaleString()} messages. No pressure.
        </p>
        {quiz.finishedPlayers.length > 0 && (
          <p className="mt-2 text-sm text-ink-4">
            already played: {quiz.finishedPlayers.map((p) => p.name).join(", ")}
          </p>
        )}
        <form
          className="mt-8 flex w-full max-w-sm flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setPhase("playing");
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            maxLength={40}
            className="rounded-full border border-line-strong bg-surface-2 px-5 py-3 text-center outline-none placeholder:text-ink-4 focus:border-pink"
          />
          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            start <span aria-hidden>→</span>
          </button>
        </form>
      </Center>
    );
  }

  const q = quiz.questions[current];
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-12">
      <div className="flex items-center justify-between">
        <span className="eyebrow">
          question {current + 1} of {quiz.questions.length}
        </span>
        <span className="text-sm text-ink-4">{name}</span>
      </div>
      {/* progress */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-pink transition-all duration-300"
          style={{ width: `${((current + (picked !== null ? 1 : 0)) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <h1 className="display mt-8 text-2xl sm:text-[27px]" dir={rtl ? "rtl" : "ltr"}>
        {q.question}
      </h1>

      <div className="mt-6 flex flex-col gap-2.5" dir={rtl ? "rtl" : "ltr"}>
        {q.options.map((o, i) => (
          <button
            key={`${current}-${i}`}
            onClick={() => choose(i)}
            disabled={picked !== null || phase === "submitting"}
            className={`rounded-[14px] border px-4 py-3.5 text-start text-[15px] transition-colors ${
              picked === i
                ? "border-pink-border bg-pink-dim text-pink"
                : "border-line bg-surface text-ink-2 hover:border-line-strong"
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {phase === "submitting" && (
        <p className="mt-6 text-center text-sm text-ink-3">counting your points…</p>
      )}
      {error && <p className="mt-4 text-sm text-pink">{error}</p>}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center">
      {children}
    </div>
  );
}

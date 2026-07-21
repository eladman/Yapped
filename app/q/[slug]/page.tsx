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
    return (
      <Center>
        <p className="text-ink-3">loading…</p>
      </Center>
    );
  }
  if (phase === "missing") {
    return (
      <Center>
        <h1 className="display text-[28px]">Quiz not found</h1>
        <p className="mt-3 text-[14px] text-ink-3">
          That link doesn&apos;t go anywhere. Double-check it?
        </p>
      </Center>
    );
  }
  if (phase === "locked") {
    return (
      <Center>
        <span className="eyebrow-chip">not unlocked yet</span>
        <h1 className="display mt-6 text-[28px]">
          This quiz is still <span className="romantic text-rose">cooking</span>
        </h1>
        <p className="mt-3 max-w-sm text-[14px] text-ink-3">
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
        <div className="rise d1">
          <span className="eyebrow-chip">you&apos;ve been challenged</span>
        </div>
        <h1
          className="display rise d2 mt-6 max-w-md text-[30px]"
          dir={rtl ? "rtl" : "ltr"}
        >
          {quiz.title}
        </h1>
        <p className="rise d3 mt-3 text-[14px] text-ink-3">
          {quiz.questions.length} questions about a chat with{" "}
          {quiz.stats.totalMessages.toLocaleString()} messages. No pressure.
        </p>
        {quiz.finishedPlayers.length > 0 && (
          <p className="rise d3 mt-2 text-[13px] text-ink-4">
            already played: {quiz.finishedPlayers.map((p) => p.name).join(", ")}
          </p>
        )}
        <form
          className="rise d4 mt-8 flex w-full max-w-sm flex-col gap-3"
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
            className="field text-center"
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
    <div className="mx-auto w-full max-w-md px-5 py-10">
      <div className="flex items-center justify-between">
        <span className="eyebrow">
          question {current + 1} of {quiz.questions.length}
        </span>
        <span className="text-[13px] text-ink-4">{name}</span>
      </div>
      {/* progress */}
      <div className="progress-track mt-3">
        <div
          className="progress-fill"
          style={{
            width: `${((current + (picked !== null ? 1 : 0)) / quiz.questions.length) * 100}%`,
          }}
        />
      </div>

      <h1 className="display mt-9 text-[25px]" dir={rtl ? "rtl" : "ltr"}>
        {q.question}
      </h1>

      <div className="mt-7 flex flex-col gap-2.5" dir={rtl ? "rtl" : "ltr"}>
        {q.options.map((o, i) => (
          <button
            key={`${current}-${i}`}
            onClick={() => choose(i)}
            disabled={picked !== null || phase === "submitting"}
            className={`answer-option ${picked === i ? "selected" : ""}`}
          >
            {o}
          </button>
        ))}
      </div>

      {phase === "submitting" && (
        <p className="mt-6 text-center text-[14px] text-ink-3">counting your points…</p>
      )}
      {error && <p className="mt-4 text-[14px] font-medium text-rose">{error}</p>}
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-24 text-center">
      {children}
    </div>
  );
}

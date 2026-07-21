import Link from "next/link";

const STEPS = [
  {
    n: "1",
    title: "Export your chat",
    body: "In WhatsApp: chat → ⋮ → More → Export chat → without media. You do the export — we never touch WhatsApp.",
  },
  {
    n: "2",
    title: "Upload it here",
    body: "Your chat is read and analyzed right in your browser. The raw messages never leave your device.",
  },
  {
    n: "3",
    title: "Get your quiz",
    body: "AI turns your real chat stats and inside jokes into a multiple-choice trivia quiz with a tone that fits — partner, friends, or family.",
  },
  {
    n: "4",
    title: "Send the link",
    body: "Everyone plays the same quiz free, then the leaderboard settles who was actually paying attention.",
  },
];

const SAMPLE_Q = {
  question: "Who is most guilty of the triple-text?",
  options: ["Maya", "Daniel", "Noa", "The chat fell silent"],
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5">
      {/* Hero */}
      <section className="flex flex-col items-start gap-6 py-16 sm:py-24">
        <span className="eyebrow-chip">your chat, weaponized</span>
        <h1 className="display max-w-2xl text-4xl sm:text-5xl">
          How well do your people <em className="not-italic text-pink">actually</em> know your
          chat?
        </h1>
        <p className="max-w-xl text-ink-2">
          Upload your exported WhatsApp chat and get a savage, shareable trivia quiz built from
          your real messages. You pay once — everyone you send it to plays free.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/create" className="btn-primary">
            make my quiz <span aria-hidden>→</span>
          </Link>
          <span className="flex items-center gap-2 text-[13px] text-ink-3">
            <LockIcon />
            we never store your chats — processed on your device, then gone
          </span>
        </div>
      </section>

      {/* Sample question card */}
      <section className="pb-16">
        <div className="card-elevated mx-auto max-w-md p-6">
          <span className="eyebrow">question 4 of 10</span>
          <p className="display mt-3 text-2xl">{SAMPLE_Q.question}</p>
          <div className="mt-5 flex flex-col gap-2.5">
            {SAMPLE_Q.options.map((o, i) => (
              <div
                key={o}
                className={`rounded-[14px] border px-4 py-3 text-[15px] ${
                  i === 1
                    ? "border-pink-border bg-pink-dim text-pink"
                    : "border-line bg-surface text-ink-2"
                }`}
              >
                {o}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[13px] text-ink-4">
            Breathing between messages is free, you know 💀
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-16">
        <span className="eyebrow">how it works</span>
        <h2 className="display mt-2 text-2xl">From group chat to group therapy in 3 minutes</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="card flex gap-4 p-5">
              <div className="num-badge">{s.n}</div>
              <div>
                <h3 className="font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-3">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="pb-20">
        <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-1 text-pink">
              <LockIcon />
            </span>
            <div>
              <h3 className="font-medium">Privacy isn&apos;t fine print here</h3>
              <p className="mt-1 max-w-xl text-sm text-ink-3">
                Your chat file is parsed in your browser and never uploaded. Only anonymous-ish
                stats and a few short quotes are used to write the questions, then discarded. We
                keep the finished quiz — never your conversation.
              </p>
            </div>
          </div>
          <Link href="/create" className="btn-primary shrink-0">
            let&apos;s go <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

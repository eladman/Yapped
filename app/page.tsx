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
    body: "AI turns your real chat stats and inside jokes into a trivia quiz with a tone that fits — partner, friends, or family.",
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
    <div className="mx-auto w-full max-w-md px-5">
      {/* Hero */}
      <section className="pt-10 text-center">
        <div className="rise d1 flex justify-center">
          <span className="eyebrow-chip">made from your real messages</span>
        </div>
        <h1 className="display rise d2 mt-6 text-[40px]">
          How well do they <span className="romantic text-rose">really</span> know your chat?
        </h1>
        <p className="rise d3 mx-auto mt-4 max-w-sm text-[15px] text-ink-2">
          Turn your exported WhatsApp chat into a beautiful little trivia game, written by AI
          from the way you actually talk. You pay once — everyone you send it to plays free.
        </p>
        <div className="rise d4 mt-7 flex flex-col items-center gap-4">
          <Link href="/create" className="btn-primary w-full max-w-[280px]">
            make my quiz <span aria-hidden>→</span>
          </Link>
          <span className="flex items-center gap-2 text-[13px] text-ink-3">
            <LockIcon />
            we never store your chats — it all happens on your device
          </span>
        </div>
      </section>

      {/* Sample question card */}
      <section className="pt-14 pb-6">
        <div className="rise d5 relative">
          <div
            aria-hidden
            className="absolute inset-0 -rotate-[4deg] scale-[0.97] rounded-card border border-white/70 bg-white/45"
          />
          <div
            aria-hidden
            className="absolute inset-0 rotate-[2.5deg] scale-[0.985] rounded-card border border-white/70 bg-white/60"
          />
          <div className="card-glass relative -rotate-1 p-6">
            <span className="eyebrow">question 4 of 10</span>
            <p className="display mt-3 text-[22px]">{SAMPLE_Q.question}</p>
            <div className="mt-5 flex flex-col gap-2.5">
              {SAMPLE_Q.options.map((o, i) => (
                <div
                  key={o}
                  className={`answer-option !cursor-default !shadow-none ${i === 1 ? "selected" : ""}`}
                >
                  {o}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-ink-3">
              Breathing between messages is free, you know 👀
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pt-10 pb-4">
        <div className="text-center">
          <span className="eyebrow">how it works</span>
          <h2 className="display mt-2 text-[26px]">
            From group chat to <span className="romantic text-rose">group therapy</span> in
            three minutes
          </h2>
        </div>
        <div className="card mt-7 divide-y divide-line">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-4 p-5">
              <div className="num-badge">{s.n}</div>
              <div>
                <h3 className="text-[15px] font-semibold">{s.title}</h3>
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-3">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="pt-8 pb-6">
        <div className="card-glass flex flex-col items-center gap-4 p-6 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-soft text-rose">
            <LockIcon size={18} />
          </span>
          <div>
            <h3 className="text-[15px] font-semibold">Privacy isn&apos;t fine print here</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">
              Your chat file is parsed in your browser and never uploaded. Only stats and a few
              short quotes are used to write the questions, then discarded. We keep the
              finished quiz — never your conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pt-10 pb-14 text-center">
        <p className="romantic text-[26px] text-ink-2">Some chats deserve a trophy.</p>
        <Link href="/create" className="btn-primary mt-6 w-full max-w-[280px]">
          let&apos;s go <span aria-hidden>→</span>
        </Link>
      </section>
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

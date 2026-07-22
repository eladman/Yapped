import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Export the chat",
    body: "In WhatsApp: chat → ⋮ → More → Export chat → without media. You do the export — we never touch WhatsApp.",
    icon: <ExportIcon />,
  },
  {
    n: "02",
    title: "Parse on-device",
    body: "The file is read and analyzed right in your browser. The raw messages never leave your device.",
    icon: <ChipIcon />,
  },
  {
    n: "03",
    title: "AI writes the quiz",
    body: "The model turns your real stats and inside jokes into ten questions, with a tone that fits — partner, friends, or family.",
    icon: <SparkIcon />,
  },
  {
    n: "04",
    title: "Send the link",
    body: "Everyone plays the same quiz free. The leaderboard settles who was actually paying attention.",
    icon: <TrophyIcon />,
  },
];

const SAMPLE_Q = {
  question: "Who is most guilty of the triple-text?",
  options: ["Maya", "Daniel", "Noa", "The chat fell silent"],
};

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      {/* Hero */}
      <section className="pt-14 text-center sm:pt-24">
        <div className="rise d1 flex justify-center">
          <span className="badge">ai-generated from your real chat</span>
        </div>
        <h1 className="display rise d2 mx-auto mt-7 max-w-[14ch] text-[42px] sm:text-[64px]">
          How well do they <span className="grad-text">really</span> know the
          group chat?
        </h1>
        <p className="rise d3 mx-auto mt-6 max-w-[44ch] text-[16px] leading-relaxed text-fg-2 sm:text-[18px]">
          Yapped reads your exported WhatsApp chat — right in your browser — and
          turns the way you actually talk into a shareable trivia game. You pay
          once. Everyone you send it to plays free.
        </p>
        <div className="rise d4 mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/create" className="btn-primary">
            make my quiz <ArrowIcon />
          </Link>
          <a href="#how" className="btn-secondary">
            see how it works
          </a>
        </div>
        <p className="rise d4 mt-6 flex items-center justify-center gap-2 font-mono text-[12.5px] tracking-wide text-fg-3">
          <span className="text-violet">
            <LockIcon />
          </span>
          runs on-device · we never store your chats
        </p>

        {/* Stat strip */}
        <div className="rise d5 mt-12 flex flex-wrap justify-center border-y border-line">
          <Stat n="10" nGrad label="questions per quiz" />
          <Stat n="~3 min" label="chat → leaderboard" />
          <Stat n="0" nGrad label="chats stored" />
        </div>

        {/* Product showcase */}
        <div className="rise d5 relative mx-auto mt-16 mb-10 flex max-w-[420px] justify-center sm:mb-2">
          <div
            aria-hidden
            className="absolute inset-x-[10%] -inset-y-[6%] rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--grad)" }}
          />
          <div className="relative w-full">
            <div className="card p-6 text-start shadow-[var(--shadow-float)]">
              <div className="flex items-center justify-between font-mono text-[11px] tracking-wide text-fg-3">
                <span>yapped · the maya group</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-cyan"
                    aria-hidden
                  />
                  question 04 / 10
                </span>
              </div>
              <div className="progress-track mt-4">
                <div className="progress-fill" style={{ width: "42%" }} />
              </div>
              <p className="display mt-5 text-[21px]">{SAMPLE_Q.question}</p>
              <div className="mt-4 flex flex-col gap-2.5">
                {SAMPLE_Q.options.map((o, i) => (
                  <div
                    key={o}
                    className={`answer-option !cursor-default ${i === 1 ? "selected" : ""}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      {o}
                      <span
                        className={`chk ${i === 1 ? "chk-on" : "chk-off"} !h-5 !w-5`}
                        aria-hidden
                      >
                        {i === 1 ? "✓" : ""}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-[11.5px] text-fg-3">
                {"//"} breathing between messages is free, you know
              </p>
            </div>

            {/* floating verdict chip */}
            <div
              aria-hidden
              className="card absolute -bottom-8 right-1 z-10 w-[190px] p-4 text-start shadow-[var(--shadow-float)] sm:-right-7 sm:bottom-8 sm:w-[210px]"
            >
              <span className="eyebrow !text-[10px]">the verdict</span>
              <ChipRow rank="1" name="Noa" score="9/10" win />
              <ChipRow rank="2" name="Daniel" score="7/10" />
              <ChipRow rank="3" name="Maya" score="4/10" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <span className="eyebrow">how it works</span>
          <h2 className="display mt-4 text-[30px] sm:text-[38px]">
            From export to leaderboard in about three minutes.
          </h2>
          <p className="mt-4 text-[16px] text-fg-2">
            Four steps. No app to install, no account to hand over your chat to.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="card p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="font-mono text-[11px] tracking-widest text-fg-3">
                {s.n}
              </div>
              <div className="mt-4 mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel-2 text-fg">
                {s.icon}
              </div>
              <h3 className="text-[16px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-fg-3">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Under the hood */}
      <section id="tech" className="scroll-mt-24 py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">under the hood</span>
            <h2 className="display mt-4 text-[30px] sm:text-[38px]">
              An AI that actually read the chat.
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-fg-2">
              Yapped doesn&apos;t ship your conversation to a server. It
              extracts <em>signals</em> on your device — who talks most, the
              running jokes, the peak-chaos hours — and hands only those to the
              model.
            </p>
            <div className="mt-8 flex flex-col gap-5">
              <Feature
                icon={<WaveIcon />}
                title="Signals, not transcripts"
                body="Stats and a few short quotes leave your browser — never the full chat."
              />
              <Feature
                icon={<DialIcon />}
                title="Tone-aware generation"
                body="The roast dial scales with the relationship — spicy for friends, gentle for family."
              />
              <Feature
                icon={<GlobeIcon />}
                title="English & Hebrew"
                body="Questions come back in the language your chat actually speaks."
              />
            </div>
          </div>

          <div className="terminal" aria-hidden>
            <div className="term-bar">
              <span className="term-dots">
                <i />
                <i />
                <i />
              </span>
              <span>yapped-engine · parsing</span>
            </div>
            <div className="term-body">
              <div className="tl">$ yapped parse chat-export.txt</div>
              <div>
                <span className="tk">✓ messages</span> 1,204 parsed{" "}
                <span className="tl">(on-device)</span>
              </div>
              <div>
                <span className="tk">✓ people</span> 3 participants
              </div>
              <div>
                <span className="tk">✓ signals</span> 47 inside jokes, 6 peak
                hours
              </div>
              <div>
                <span className="tpink">↑ sent</span> stats + 12 short quotes{" "}
                <span className="tl">→ model</span>
              </div>
              <div>
                <span className="tp">◇ model</span> generating 10 questions…
              </div>
              <div>
                <span className="tok">✓ ready</span> quiz built · raw chat
                discarded
                <span className="term-cursor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <span className="eyebrow">privacy by design</span>
          <h2 className="display mt-4 text-[30px] sm:text-[38px]">
            It never leaves your device.
          </h2>
          <p className="mt-4 text-[16px] text-fg-2">
            Privacy isn&apos;t buried in a policy here — it&apos;s the
            architecture. Here&apos;s exactly where the line sits.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="card p-7">
            <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-widest text-violet">
              <LockIcon /> your browser
            </span>
            <h3 className="mt-4 text-[19px] font-semibold">Stays with you</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <PrivacyItem yes text="Reads and parses the export file" />
              <PrivacyItem yes text="Extracts stats and inside jokes" />
              <PrivacyItem
                yes
                text="Holds your raw messages, then forgets them"
              />
            </ul>
          </div>
          <div className="card bg-panel-2 p-7">
            <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-widest text-fg-4">
              <ServerIcon /> our servers
            </span>
            <h3 className="mt-4 text-[19px] font-semibold text-fg-2">
              Never see
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <PrivacyItem text="Your raw conversation" />
              <PrivacyItem text="The full message history" />
              <PrivacyItem text="Anything after the quiz is written" />
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <span className="eyebrow">pricing</span>
          <h2 className="display mt-4 text-[30px] sm:text-[38px]">
            One price. The whole group plays free.
          </h2>
          <p className="mt-4 text-[16px] text-fg-2">
            The creator pays once to unlock the share link. Every player you
            send it to joins for nothing.
          </p>
        </div>
        <div className="mt-12 flex justify-center">
          <div
            className="w-full max-w-[440px] rounded-[24px] p-[1.5px]"
            style={{ background: "var(--grad)" }}
          >
            <div className="rounded-[22.5px] bg-panel p-8 text-center shadow-[var(--glow)]">
              <div className="font-mono text-[11px] uppercase tracking-widest text-fg-3">
                one quiz · pay once
              </div>
              <div className="display mt-2 text-[52px]">₪19</div>
              <ul className="mt-5 mb-7 flex flex-col gap-3 text-start">
                <PriceItem text="10 AI-written questions from your chat" />
                <PriceItem text="Unlimited players, one shared link" />
                <PriceItem text="Live leaderboard + shareable results card" />
                <PriceItem text="Your chat, never stored" />
              </ul>
              <Link href="/create" className="btn-primary w-full">
                make my quiz <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Finale */}
      <section className="pb-20 pt-10 sm:pb-28">
        <div className="card relative overflow-hidden p-10 text-center sm:p-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] blur-2xl"
            style={{ background: "var(--grad)" }}
          />
          <div className="relative">
            <span className="eyebrow">ready when you are</span>
            <h2 className="display mx-auto mt-4 max-w-[18ch] text-[32px] sm:text-[44px]">
              Some chats deserve a <span className="grad-text">leaderboard</span>
              .
            </h2>
            <p className="mx-auto mt-4 max-w-[40ch] text-[16px] text-fg-2">
              Turn the last year of your group chat into the only trivia game
              where your people are the answers.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/create" className="btn-primary">
                make my quiz <ArrowIcon />
              </Link>
              <a href="#how" className="btn-secondary">
                see how it works
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- small pieces ---------- */

function Stat({
  n,
  label,
  nGrad = false,
}: {
  n: string;
  label: string;
  nGrad?: boolean;
}) {
  return (
    <div className="min-w-[150px] flex-1 border-line px-5 py-5 text-center [&+&]:border-s">
      <div className={`display text-[24px] ${nGrad ? "grad-text" : ""}`}>
        {n}
      </div>
      <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-3">
        {label}
      </div>
    </div>
  );
}

function ChipRow({
  rank,
  name,
  score,
  win = false,
}: {
  rank: string;
  name: string;
  score: string;
  win?: boolean;
}) {
  return (
    <div className="mt-2.5 flex items-center justify-between text-[13.5px]">
      <span
        className={`flex items-center gap-2 ${win ? "font-semibold text-fg" : "text-fg-2"}`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md font-mono text-[10.5px] ${
            win ? "text-white" : "bg-panel-2 text-fg-3"
          }`}
          style={win ? { background: "var(--grad)" } : undefined}
        >
          {rank}
        </span>
        {name}
      </span>
      <span className="font-mono text-fg">{score}</span>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="card flex h-9 w-9 flex-none items-center justify-center !rounded-xl text-violet">
        {icon}
      </span>
      <div>
        <h4 className="text-[15px] font-semibold">{title}</h4>
        <p className="mt-0.5 text-[13.5px] text-fg-3">{body}</p>
      </div>
    </div>
  );
}

function PrivacyItem({ text, yes = false }: { text: string; yes?: boolean }) {
  return (
    <li
      className={`flex items-start gap-2.5 text-[14px] ${yes ? "text-fg-2" : "text-fg-4"}`}
    >
      <span className={`mt-0.5 ${yes ? "text-violet" : "text-fg-4"}`}>
        {yes ? <CheckIcon /> : <XIcon />}
      </span>
      {text}
    </li>
  );
}

function PriceItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[14.5px] text-fg-2">
      <span className="text-violet">
        <CheckIcon />
      </span>
      {text}
    </li>
  );
}

/* ---------- icons ---------- */

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9z" />
      <path d="M4 9H2M22 9h-2M4 15H2M22 15h-2M9 4V2M15 4V2M9 22v-2M15 22v-2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" />
      <path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9H4a2 2 0 0 1 0-4h2M18 9h2a2 2 0 0 0 0-4h-2M6 5h12v4a6 6 0 0 1-12 0z" />
      <path d="M9 19h6M10 15v4M14 15v4" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  );
}

function DialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M18 18l-2.5-2.5M6 18l2.5-2.5M18 6l-2.5 2.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  );
}

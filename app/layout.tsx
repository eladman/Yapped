import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const jbmono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "yapped. — turn your chat into a little game",
  description:
    "Upload your exported WhatsApp chat and get a shareable, AI-written trivia quiz your people play against each other. We never store your chats.",
};

export const viewport: Viewport = {
  themeColor: "#f4f5f8",
};

/* Runs before first paint (first child of <body>) so the saved theme applies
   without a flash. Light is the default; dark is opt-in via the toggle.
   `?theme=dark|light` also works — handy for QA and shareable demos. */
const THEME_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search).get("theme");var t=q==="dark"||q==="light"?q:localStorage.getItem("yap-theme");if(q)localStorage.setItem("yap-theme",q);if(t==="dark")document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${jbmono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

        <div className="bg-base" aria-hidden />
        <div className="bg-grid" aria-hidden />
        <div className="blob blob-1" aria-hidden />
        <div className="blob blob-2" aria-hidden />
        <div className="blob blob-3" aria-hidden />
        <div className="grain" aria-hidden />

        <header className="sticky top-0 z-40 px-4 pt-3.5">
          <div className="nav-pill mx-auto flex w-full max-w-5xl items-center justify-between gap-4 py-2 pl-5 pr-2">
            <Link href="/" aria-label="yapped home" className="pb-0.5">
              <Wordmark className="text-[21px]" />
            </Link>
            <nav className="hidden items-center gap-6 md:flex" aria-label="primary">
              <Link href="/#how" className="text-[13.5px] font-medium text-fg-2 transition-colors hover:text-fg">
                how it works
              </Link>
              <Link href="/#tech" className="text-[13.5px] font-medium text-fg-2 transition-colors hover:text-fg">
                the tech
              </Link>
              <Link href="/#privacy" className="text-[13.5px] font-medium text-fg-2 transition-colors hover:text-fg">
                privacy
              </Link>
              <Link href="/#pricing" className="text-[13.5px] font-medium text-fg-2 transition-colors hover:text-fg">
                pricing
              </Link>
            </nav>
            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <Link
                href="/create"
                className="btn-primary !px-4 !py-2 !text-[13px] !shadow-none"
              >
                make a quiz
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line px-5 pb-10 pt-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2 text-center">
            <Wordmark className="text-[17px] opacity-70" />
            <span className="font-mono text-[11px] tracking-wide text-fg-4">
              we never store your chats — processed once, then gone.
            </span>
            <span className="font-mono text-[11px] tracking-wide text-fg-4">
              Not affiliated with WhatsApp or Meta.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}

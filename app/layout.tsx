import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "yapped. — turn your chat into a trivia game",
  description:
    "Upload your exported WhatsApp chat and get a savage, shareable trivia quiz your friends play against each other. We never store your chats.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" aria-label="yapped home">
              <Wordmark />
            </Link>
            <Link href="/create" className="btn-secondary !py-2 !px-5 text-sm">
              make a quiz
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-6 text-[12px] text-ink-4 sm:flex-row sm:items-center sm:justify-between">
            <span>
              yapped<span className="text-pink">.</span> — we never store your chats. Processed
              once, then gone.
            </span>
            <span>Not affiliated with WhatsApp or Meta.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import "./globals.css";

const romantic = Instrument_Serif({
  variable: "--font-romantic",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "yapped. — turn your chat into a little game",
  description:
    "Upload your exported WhatsApp chat and get a beautiful, shareable trivia quiz your people play against each other. We never store your chats.",
};

export const viewport: Viewport = {
  themeColor: "#faf6f4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${romantic.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <div className="atmosphere" aria-hidden />
        <div className="atmo-blob -top-[20vmax] -left-[15vmax]" aria-hidden />
        <div className="atmo-blob atmo-blob-2 -bottom-[22vmax] -right-[18vmax]" aria-hidden />

        <header className="sticky top-0 z-40 px-4 pt-3">
          <div className="card-glass mx-auto flex w-full max-w-md items-center justify-between rounded-full py-2 pl-5 pr-2">
            <Link href="/" aria-label="yapped home" className="pb-0.5">
              <Wordmark className="text-[22px]" />
            </Link>
            <Link
              href="/create"
              className="btn-primary !px-4 !py-2 !text-[13px] !shadow-none"
            >
              make a quiz
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="px-5 pb-10 pt-6">
          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1.5 text-center text-[12px] text-ink-4">
            <Wordmark className="text-[17px] opacity-60" />
            <span>we never store your chats — processed once, then gone.</span>
            <span>Not affiliated with WhatsApp or Meta.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

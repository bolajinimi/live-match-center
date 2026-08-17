import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SocketProvider } from "@/contexts/SocketContext";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Live Match Center",
  description: "Real-time football scores, match events, and chat.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-canvas font-sans antialiased">
        <SocketProvider>
          <header className="sticky top-0 z-20 border-b border-border bg-canvas/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                  ⚽
                </span>
                <span className="text-[15px] font-semibold tracking-tight text-ink">
                  Live Match Center
                </span>
              </Link>
              <ConnectionBadge />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        </SocketProvider>
      </body>
    </html>
  );
}

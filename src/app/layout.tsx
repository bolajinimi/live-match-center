import type { Metadata } from "next";
import Link from "next/link";
import { SocketProvider } from "@/contexts/SocketContext";
import { ConnectionBadge } from "@/components/ui/ConnectionBadge";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Match Center",
  description: "Real-time football scores, match events, and chat.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SocketProvider>
          <header className="border-b border-white/10">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-lg font-bold text-white">
                Live Match Center
              </Link>
              <ConnectionBadge />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </SocketProvider>
      </body>
    </html>
  );
}

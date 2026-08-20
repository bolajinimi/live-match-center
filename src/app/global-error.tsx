"use client";

// Catches errors thrown by the root layout itself (e.g. SocketProvider init)
// that no route-level error.tsx can see, since those all render *inside*
// the layout. This file replaces the entire document when triggered, so it
// supplies its own <html>/<body> and re-imports global styles directly.
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-canvas px-4 font-sans antialiased">
        <div className="w-full max-w-sm rounded-2xl border border-live/30 bg-live-soft p-8 text-center">
          <p className="mb-4 text-sm text-ink">
            <span className="font-semibold text-live">Something went wrong.</span>{" "}
            <span className="text-ink-muted">{error.message}</span>
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-live-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-live-solid-hover"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

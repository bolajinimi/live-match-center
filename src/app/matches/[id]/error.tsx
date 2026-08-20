"use client";

export default function MatchError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-live/30 bg-live-soft p-8 text-center">
      <p className="mb-4 text-sm text-ink">
        <span className="font-semibold text-live">Couldn&apos;t load this match.</span>{" "}
        <span className="text-ink-muted">{error.message}</span>
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-live-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-live-solid-hover"
      >
        Try again
      </button>
    </div>
  );
}

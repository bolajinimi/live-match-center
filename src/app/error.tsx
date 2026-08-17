"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="mb-3 text-sm text-red-300">Couldn&apos;t load matches: {error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
      >
        Try again
      </button>
    </div>
  );
}

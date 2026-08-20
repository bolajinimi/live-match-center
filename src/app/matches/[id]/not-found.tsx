import Link from "next/link";

export default function MatchNotFound() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-10 text-center">
      <p className="mb-3 text-2xl">🔍</p>
      <p className="mb-4 text-sm text-ink-muted">Match not found.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
      >
        ← Back to all matches
      </Link>
    </div>
  );
}

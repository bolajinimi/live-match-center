import Link from "next/link";

export default function MatchNotFound() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
      <p className="mb-3 text-slate-300">Match not found.</p>
      <Link href="/" className="text-sm text-blue-400 hover:underline">
        ← Back to all matches
      </Link>
    </div>
  );
}

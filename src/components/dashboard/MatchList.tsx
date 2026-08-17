"use client";

import { useMatches } from "@/hooks/useMatches";
import { isLiveStatus, type Match } from "@/types/match";
import { MatchCard } from "./MatchCard";

export function MatchList({ initialMatches }: { initialMatches: Match[] }) {
  const { matches, error } = useMatches(initialMatches);

  const live = matches.filter((m) => isLiveStatus(m.status));
  const upcoming = matches.filter((m) => m.status === "NOT_STARTED");
  const finished = matches.filter((m) => m.status === "FULL_TIME");

  if (matches.length === 0 && !error) {
    return <p className="text-sm text-slate-400">No matches right now. Check back shortly.</p>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Couldn&apos;t refresh matches: {error}
        </p>
      )}

      <MatchSection title="Live" matches={live} />
      <MatchSection title="Upcoming" matches={upcoming} />
      <MatchSection title="Finished" matches={finished} />
    </div>
  );
}

function MatchSection({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

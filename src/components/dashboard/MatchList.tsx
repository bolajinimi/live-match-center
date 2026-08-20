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
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center">
        <p className="text-sm text-ink-muted">No matches right now. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {error && (
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          Couldn&apos;t refresh matches: {error}
        </p>
      )}

      <MatchSection title="Live" matches={live} accent="live" />
      <MatchSection title="Upcoming" matches={upcoming} />
      <MatchSection title="Finished" matches={finished} />
    </div>
  );
}

function MatchSection({
  title,
  matches,
  accent,
}: {
  title: string;
  matches: Match[];
  accent?: "live";
}) {
  if (matches.length === 0) return null;

  return (
    <section>
      <div className="mb-3.5 flex items-center gap-2">
        {accent === "live" && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
          </span>
        )}
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-faint">
          {matches.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

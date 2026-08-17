"use client";

import { useMatchDetail } from "@/hooks/useMatchDetail";
import type { MatchDetail } from "@/types/match";
import { ScoreHeader } from "./ScoreHeader";
import { Timeline } from "./Timeline";
import { StatsPanel } from "./StatsPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";

export function MatchDetailView({ matchId, initialMatch }: { matchId: string; initialMatch: MatchDetail }) {
  const { match, error } = useMatchDetail(matchId, initialMatch);

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          {error}
        </p>
      )}

      <ScoreHeader match={match} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Timeline</h2>
          <Timeline events={match.events} />
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Statistics</h2>
          <StatsPanel statistics={match.statistics} />
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Match Chat</h2>
        <ChatPanel matchId={matchId} />
      </section>
    </div>
  );
}

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
        <p className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">{error}</p>
      )}

      <ScoreHeader match={match} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Timeline">
          <Timeline events={match.events} />
        </Panel>
        <Panel title="Statistics">
          <StatsPanel statistics={match.statistics} />
        </Panel>
      </div>

      <Panel title="Match Chat">
        <ChatPanel matchId={matchId} />
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">{title}</h2>
      {children}
    </section>
  );
}

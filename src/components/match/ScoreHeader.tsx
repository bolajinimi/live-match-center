import { StatusBadge } from "@/components/dashboard/StatusBadge";
import type { MatchDetail } from "@/types/match";

export function ScoreHeader({ match }: { match: MatchDetail }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="mb-4 flex justify-center">
        <StatusBadge status={match.status} minute={match.minute} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <TeamBlock name={match.homeTeam.name} shortName={match.homeTeam.shortName} align="right" />
        <div className="flex items-center gap-3 text-4xl font-bold tabular-nums text-white">
          <span>{match.homeScore}</span>
          <span className="text-slate-600">-</span>
          <span>{match.awayScore}</span>
        </div>
        <TeamBlock name={match.awayTeam.name} shortName={match.awayTeam.shortName} align="left" />
      </div>
    </div>
  );
}

function TeamBlock({
  name,
  shortName,
  align,
}: {
  name: string;
  shortName: string;
  align: "left" | "right";
}) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end text-right" : "items-start text-left"}`}>
      <span className="text-lg font-semibold text-white">{name}</span>
      <span className="text-xs text-slate-500">{shortName}</span>
    </div>
  );
}

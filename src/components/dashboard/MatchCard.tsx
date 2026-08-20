import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { isLiveStatus, type Match } from "@/types/match";
import { formatShortDate } from "@/lib/format";

export function MatchCard({ match }: { match: Match }) {
  const live = isLiveStatus(match.status);
  const finished = match.status === "FULL_TIME";

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`group relative block overflow-hidden rounded-2xl border bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-hover hover:shadow-card-hover ${
        live ? "border-live/30" : "border-border"
      }`}
    >
      {live && <span className="absolute inset-y-0 left-0 w-0.5 bg-live" aria-hidden />}

      <div className="mb-4 flex items-center justify-between">
        <StatusBadge status={match.status} minute={match.minute} />
        <span className="text-xs text-ink-faint">{formatShortDate(match.startTime)}</span>
      </div>

      <div className="space-y-3">
        <TeamRow team={match.homeTeam} score={match.homeScore} winning={finished && match.homeScore > match.awayScore} />
        <TeamRow team={match.awayTeam} score={match.awayScore} winning={finished && match.awayScore > match.homeScore} />
      </div>
    </Link>
  );
}

function TeamRow({
  team,
  score,
  winning,
}: {
  team: { name: string; shortName: string };
  score: number;
  winning: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <TeamAvatar name={team.name} shortName={team.shortName} size="sm" />
        <span className={`truncate text-sm ${winning ? "font-semibold text-ink" : "font-medium text-ink"}`}>
          {team.name}
        </span>
      </div>
      <span className={`text-lg font-bold tabular-nums ${winning ? "text-ink" : "text-ink-muted"}`}>{score}</span>
    </div>
  );
}

import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { isLiveStatus, type Match } from "@/types/match";

export function MatchCard({ match }: { match: Match }) {
  const live = isLiveStatus(match.status);

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`block rounded-xl border p-4 transition hover:border-white/20 hover:bg-white/[0.04] ${
        live ? "border-red-500/30 bg-red-500/[0.03]" : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <StatusBadge status={match.status} minute={match.minute} />
        <span className="text-xs text-slate-500">
          {new Date(match.startTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      <div className="space-y-2">
        <TeamRow name={match.homeTeam.name} score={match.homeScore} />
        <TeamRow name={match.awayTeam.name} score={match.awayScore} />
      </div>
    </Link>
  );
}

function TeamRow({ name, score }: { name: string; score: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="truncate text-sm font-medium text-slate-200">{name}</span>
      <span className="ml-3 text-lg font-bold tabular-nums text-white">{score}</span>
    </div>
  );
}

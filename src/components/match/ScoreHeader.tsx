import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import type { MatchDetail } from "@/types/match";
import { formatKickoff } from "@/lib/format";

export function ScoreHeader({ match }: { match: MatchDetail }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ background: "radial-gradient(600px circle at 50% 0%, var(--accent), transparent 60%)" }}
        aria-hidden
      />

      <div className="relative mb-6 flex justify-center">
        <StatusBadge status={match.status} minute={match.minute} />
      </div>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <TeamBlock name={match.homeTeam.name} shortName={match.homeTeam.shortName} align="right" />
        <div
          className="flex items-center gap-2.5 text-3xl font-bold tabular-nums text-ink sm:gap-4 sm:text-5xl"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Score: ${match.homeTeam.shortName} ${match.homeScore}, ${match.awayTeam.shortName} ${match.awayScore}`}
        >
          <span aria-hidden>{match.homeScore}</span>
          <span className="text-ink-faint" aria-hidden>
            -
          </span>
          <span aria-hidden>{match.awayScore}</span>
        </div>
        <TeamBlock name={match.awayTeam.name} shortName={match.awayTeam.shortName} align="left" />
      </div>

      <p className="relative mt-6 text-center text-xs text-ink-faint">Kickoff {formatKickoff(match.startTime)}</p>
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
  const isRight = align === "right";
  return (
    <div className={`flex items-center gap-3 ${isRight ? "flex-row-reverse text-right" : "text-left"}`}>
      <TeamAvatar name={name} shortName={shortName} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink sm:text-base">{name}</p>
        <p className="text-xs text-ink-faint">{shortName}</p>
      </div>
    </div>
  );
}

import type { MatchStatistics } from "@/types/match";

const ROWS: { key: keyof MatchStatistics; label: string }[] = [
  { key: "possession", label: "Possession %" },
  { key: "shots", label: "Shots" },
  { key: "shotsOnTarget", label: "Shots on Target" },
  { key: "corners", label: "Corners" },
  { key: "fouls", label: "Fouls" },
  { key: "yellowCards", label: "Yellow Cards" },
  { key: "redCards", label: "Red Cards" },
];

export function StatsPanel({ statistics }: { statistics: MatchStatistics }) {
  return (
    <div className="space-y-5">
      {ROWS.map(({ key, label }) => (
        <StatRow key={key} label={label} home={statistics[key].home} away={statistics[key].away} />
      ))}
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  const homePct = (home / total) * 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="w-8 font-semibold tabular-nums text-ink">{home}</span>
        <span className="text-ink-faint">{label}</span>
        <span className="w-8 text-right font-semibold tabular-nums text-ink">{away}</span>
      </div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-surface-hover">
        <div className="rounded-full bg-accent transition-[width] duration-500" style={{ width: `${homePct}%` }} />
        <div
          className="rounded-full bg-ink-faint/60 transition-[width] duration-500"
          style={{ width: `${100 - homePct}%` }}
        />
      </div>
    </div>
  );
}

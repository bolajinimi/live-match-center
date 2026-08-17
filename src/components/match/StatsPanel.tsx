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
    <div className="space-y-4">
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
      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
        <span className="tabular-nums">{home}</span>
        <span>{label}</span>
        <span className="tabular-nums">{away}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="bg-blue-500" style={{ width: `${homePct}%` }} />
        <div className="bg-slate-500" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  );
}

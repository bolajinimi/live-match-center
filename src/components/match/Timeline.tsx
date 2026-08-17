import type { MatchEvent, MatchEventType } from "@/types/match";

const EVENT_ICON: Record<MatchEventType, string> = {
  GOAL: "⚽",
  YELLOW_CARD: "🟨",
  RED_CARD: "🟥",
  SUBSTITUTION: "🔄",
  FOUL: "🚫",
  SHOT: "🎯",
};

export function Timeline({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No events yet.</p>;
  }

  // Newest first for a "live ticker" feel.
  const sorted = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <ol className="space-y-3">
      {sorted.map((event) => (
        <li key={`${event.id}-${event.minute}`} className="flex gap-3">
          <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-500">
            {event.minute}&apos;
          </span>
          <span className="text-lg leading-none">{EVENT_ICON[event.type] ?? "•"}</span>
          <div className="min-w-0">
            <p className="text-sm text-slate-200">{event.description}</p>
            {event.assistPlayer && (
              <p className="text-xs text-slate-500">Assist: {event.assistPlayer}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

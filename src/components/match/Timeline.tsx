import type { MatchEvent, MatchEventType } from "@/types/match";

const EVENT_STYLE: Record<MatchEventType, { icon: string; className: string }> = {
  GOAL: { icon: "⚽", className: "bg-success/15 text-success ring-success/30" },
  YELLOW_CARD: { icon: "🟨", className: "bg-warning/15 text-warning ring-warning/30" },
  RED_CARD: { icon: "🟥", className: "bg-live-soft text-live ring-live/30" },
  SUBSTITUTION: { icon: "🔄", className: "bg-accent-soft text-accent ring-accent/30" },
  FOUL: { icon: "🚫", className: "bg-surface-hover text-ink-muted ring-border-strong" },
  SHOT: { icon: "🎯", className: "bg-surface-hover text-ink-muted ring-border-strong" },
};

export function Timeline({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-faint">No events yet.</p>;
  }

  // Newest first for a live-ticker feel.
  const sorted = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <ol className="relative" aria-live="polite" aria-relevant="additions">
      <div className="absolute left-1/2 top-1 bottom-1 w-px -translate-x-1/2 bg-border" aria-hidden />
      {sorted.map((event) => (
        <TimelineRow key={`${event.id}-${event.minute}`} event={event} />
      ))}
    </ol>
  );
}

function TimelineRow({ event }: { event: MatchEvent }) {
  const style = EVENT_STYLE[event.type] ?? { icon: "•", className: "bg-surface-hover text-ink-muted ring-border" };
  const isHome = event.team === "home";

  return (
    <li className="relative grid grid-cols-[1fr_auto_1fr] items-start gap-3 py-2.5">
      <div className={isHome ? "text-right" : ""}>{isHome && <EventCard event={event} style={style} align="right" />}</div>

      <div className="flex flex-col items-center pt-0.5">
        <span
          className={`z-10 flex h-7 w-7 items-center justify-center rounded-full text-sm ring-1 ${style.className}`}
        >
          {style.icon}
        </span>
        <span className="mt-1 text-[10px] font-medium tabular-nums text-ink-faint">{event.minute}&apos;</span>
      </div>

      <div>{!isHome && <EventCard event={event} style={style} align="left" />}</div>
    </li>
  );
}

function EventCard({
  event,
  align,
}: {
  event: MatchEvent;
  style: { icon: string; className: string };
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="text-sm leading-snug text-ink">{event.description}</p>
      {event.assistPlayer && <p className="mt-0.5 text-xs text-ink-faint">Assist: {event.assistPlayer}</p>}
    </div>
  );
}

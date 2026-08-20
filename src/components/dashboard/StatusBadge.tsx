import { isLiveStatus, type MatchStatus } from "@/types/match";

const LABEL: Record<MatchStatus, string> = {
  NOT_STARTED: "Upcoming",
  FIRST_HALF: "1st Half",
  HALF_TIME: "Half-time",
  SECOND_HALF: "2nd Half",
  FULL_TIME: "Full-time",
};

export function StatusBadge({ status, minute }: { status: MatchStatus; minute: number }) {
  const live = isLiveStatus(status);

  if (live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live-soft px-2.5 py-1 text-xs font-semibold tabular-nums text-live">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
        </span>
        {status === "HALF_TIME" ? "HT" : `${minute}'`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-ink-muted">
      {LABEL[status]}
    </span>
  );
}

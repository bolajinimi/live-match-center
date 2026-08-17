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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        {status === "HALF_TIME" ? "HT" : `${minute}'`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400">
      {LABEL[status]}
    </span>
  );
}

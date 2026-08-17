"use client";

import { useSocket } from "@/contexts/SocketContext";

const LABEL: Record<string, string> = {
  connected: "Live",
  connecting: "Connecting",
  reconnecting: "Reconnecting",
  disconnected: "Offline",
};

const DOT_CLASS: Record<string, string> = {
  connected: "bg-success",
  connecting: "bg-warning animate-pulse",
  reconnecting: "bg-warning animate-pulse",
  disconnected: "bg-live",
};

export function ConnectionBadge() {
  const { status } = useSocket();

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted"
      title={`WebSocket: ${status}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[status]}`} />
      {LABEL[status]}
    </div>
  );
}

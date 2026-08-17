"use client";

import { useSocket } from "@/contexts/SocketContext";

const LABEL: Record<string, string> = {
  connected: "Live",
  connecting: "Connecting…",
  reconnecting: "Reconnecting…",
  disconnected: "Offline",
};

const DOT_CLASS: Record<string, string> = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-400 animate-pulse",
  reconnecting: "bg-amber-400 animate-pulse",
  disconnected: "bg-red-500",
};

export function ConnectionBadge() {
  const { status } = useSocket();

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300"
      title={`WebSocket: ${status}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[status]}`} />
      {LABEL[status]}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMatches } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";
import type { Match } from "@/types/match";

const POLL_INTERVAL_MS = 30_000;

/**
 * Drives the dashboard list. Real-time score/status changes arrive over the
 * socket for matches we're subscribed to; a low-frequency REST poll runs
 * alongside it purely to notice matches that start or finish (the API has
 * no "match created" socket event), so the list itself stays fresh even if
 * a push event is missed.
 */
export function useMatches(initialMatches: Match[]) {
  const { socket, status } = useSocket();
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [error, setError] = useState<string | null>(null);
  const subscribedIds = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const fresh = await getMatches();
      setMatches(fresh);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
    }
  }, []);

  // Poll as a safety net for matches starting/finishing.
  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Keep socket subscriptions in sync with whatever matches are on screen.
  useEffect(() => {
    if (!socket) return;
    const currentIds = new Set(matches.map((m) => m.id));

    for (const id of currentIds) {
      if (!subscribedIds.current.has(id)) {
        socket.emit("subscribe_match", { matchId: id });
        subscribedIds.current.add(id);
      }
    }
    for (const id of subscribedIds.current) {
      if (!currentIds.has(id)) {
        socket.emit("unsubscribe_match", { matchId: id });
        subscribedIds.current.delete(id);
      }
    }
  }, [socket, matches]);

  // Re-subscribe to everything currently on screen after a reconnect.
  useEffect(() => {
    if (!socket || status !== "connected") return;
    for (const id of subscribedIds.current) {
      socket.emit("subscribe_match", { matchId: id });
    }
  }, [socket, status]);

  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdate = (payload: { matchId: string; homeScore: number; awayScore: number }) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === payload.matchId
            ? { ...m, homeScore: payload.homeScore, awayScore: payload.awayScore }
            : m,
        ),
      );
    };

    const handleStatusChange = (payload: { matchId: string; status: Match["status"]; minute: number }) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === payload.matchId ? { ...m, status: payload.status, minute: payload.minute } : m,
        ),
      );
    };

    socket.on("score_update", handleScoreUpdate);
    socket.on("status_change", handleStatusChange);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("status_change", handleStatusChange);
    };
  }, [socket]);

  // Clean up subscriptions on unmount. Deliberately reads subscribedIds.current
  // at cleanup time (not a snapshot) so it unsubscribes from whatever is
  // actually subscribed at that moment.
  useEffect(() => {
    return () => {
      if (!socket) return;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      for (const id of subscribedIds.current) {
        socket.emit("unsubscribe_match", { matchId: id });
      }
      subscribedIds.current.clear();
    };
  }, [socket]);

  return { matches, error, refresh };
}

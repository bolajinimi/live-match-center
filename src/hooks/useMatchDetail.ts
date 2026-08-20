"use client";

import { useEffect, useRef, useState } from "react";
import { getMatchById } from "@/lib/api";
import { useSocket } from "@/contexts/SocketContext";
import type { MatchDetail, MatchEvent } from "@/types/match";
import type { MatchEventPayload } from "@/types/socket";

function eventKey(e: Pick<MatchEvent, "type" | "minute" | "player" | "timestamp">) {
  return `${e.type}-${e.minute}-${e.player}-${e.timestamp}`;
}

/**
 * Drives the match detail view: score, timeline, and statistics all update
 * live from the socket. On reconnect we refetch the full match over REST
 * rather than trust the socket to replay everything we missed while offline.
 */
export function useMatchDetail(matchId: string, initialMatch: MatchDetail) {
  const { socket, status } = useSocket();
  const [match, setMatch] = useState<MatchDetail>(initialMatch);
  const [error, setError] = useState<string | null>(null);
  const seenEventKeys = useRef<Set<string>>(new Set(initialMatch.events.map(eventKey)));
  const wasDisconnected = useRef(false);

  // Subscribe/unsubscribe to this match's room.
  useEffect(() => {
    if (!socket) return;
    socket.emit("subscribe_match", { matchId });
    return () => {
      socket.emit("unsubscribe_match", { matchId });
    };
  }, [socket, matchId]);

  // Resync full state from REST after a reconnect (covers anything missed offline).
  useEffect(() => {
    if (!socket) return;

    if (status !== "connected") {
      wasDisconnected.current = true;
      return;
    }
    if (!wasDisconnected.current) return; // first connect already has initialMatch

    wasDisconnected.current = false;
    socket.emit("subscribe_match", { matchId });
    getMatchById(matchId)
      .then((fresh) => {
        setMatch(fresh);
        seenEventKeys.current = new Set(fresh.events.map(eventKey));
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to resync match"));
  }, [socket, status, matchId]);

  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdate = (payload: { matchId: string; homeScore: number; awayScore: number }) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) => ({ ...prev, homeScore: payload.homeScore, awayScore: payload.awayScore }));
    };

    const handleMatchEvent = (payload: MatchEventPayload) => {
      if (payload.matchId !== matchId) return;
      const key = eventKey(payload);
      if (seenEventKeys.current.has(key)) return; // dedupe (reconnect races, etc.)
      seenEventKeys.current.add(key);
      const event: MatchEvent = { ...payload, id: payload.id ?? key };
      setMatch((prev) => ({ ...prev, events: [...prev.events, event].sort((a, b) => a.minute - b.minute) }));
    };

    const handleStatsUpdate = (payload: { matchId: string; statistics: MatchDetail["statistics"] }) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) => ({ ...prev, statistics: payload.statistics }));
    };

    const handleStatusChange = (payload: { matchId: string; status: MatchDetail["status"]; minute: number }) => {
      if (payload.matchId !== matchId) return;
      setMatch((prev) => ({ ...prev, status: payload.status, minute: payload.minute }));
    };

    socket.on("score_update", handleScoreUpdate);
    socket.on("match_event", handleMatchEvent);
    socket.on("stats_update", handleStatsUpdate);
    socket.on("status_change", handleStatusChange);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("match_event", handleMatchEvent);
      socket.off("stats_update", handleStatsUpdate);
      socket.off("status_change", handleStatusChange);
    };
  }, [socket, matchId]);

  return { match, error };
}

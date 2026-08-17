"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ConnectionStatus,
  ServerToClientEvents,
} from "@/types/socket";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: AppSocket | null;
  status: ConnectionStatus;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, status: "disconnected" });

/**
 * One Socket.IO connection is created for the whole app (not per-page) and
 * shared via context. Individual features (match subscriptions, chat rooms)
 * layer their own subscribe/unsubscribe lifecycle on top via hooks — see
 * useMatchSubscription / useChat.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useMemo<AppSocket | null>(() => {
    if (!WS_URL) {
      console.error("NEXT_PUBLIC_WS_URL is not set. Copy .env.example to .env.local.");
      return null;
    }
    return io(WS_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ["websocket", "polling"],
    });
    // Created once per app lifetime (client-side singleton for this provider instance).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");
    const handleReconnectAttempt = () => setStatus("reconnecting");
    const handleConnectError = () => setStatus("reconnecting");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleConnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleConnect);
      socket.off("connect_error", handleConnectError);
    };
  }, [socket]);

  // Tear down the connection when the whole app unmounts (e.g. HMR/navigation away).
  useEffect(() => {
    return () => {
      socket?.close();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket, status }), [socket, status]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

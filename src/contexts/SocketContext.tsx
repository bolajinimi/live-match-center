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
 * useMatches / useMatchDetail / useChat.
 *
 * Creation + teardown live in a single effect (not split across a useMemo +
 * a separate cleanup effect) so React 18 Strict Mode's dev-only
 * mount→cleanup→mount double-invoke stays correct: it closes and fully
 * recreates one coherent socket instead of closing a socket that a
 * memoized value elsewhere still thinks is alive.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    if (!WS_URL) {
      console.error("NEXT_PUBLIC_WS_URL is not set. Copy .env.example to .env.local.");
      return;
    }

    const s: AppSocket = io(WS_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ["websocket", "polling"],
    });

    setStatus("connecting");
    setSocket(s);

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");
    const handleReconnectAttempt = () => setStatus("reconnecting");
    const handleConnectError = () => setStatus("reconnecting");

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.io.on("reconnect_attempt", handleReconnectAttempt);
    s.io.on("reconnect", handleConnect);
    s.on("connect_error", handleConnectError);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.io.off("reconnect_attempt", handleReconnectAttempt);
      s.io.off("reconnect", handleConnect);
      s.off("connect_error", handleConnectError);
      s.close();
    };
  }, []);

  const value = useMemo(() => ({ socket, status }), [socket, status]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

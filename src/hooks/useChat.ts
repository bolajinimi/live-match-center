"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import type { ChatMessage, LocalUser, TypingUser } from "@/types/chat";
import type { ChatMessagePayload } from "@/types/socket";

const MESSAGE_MAX_LENGTH = 500;
const TYPING_STOP_DELAY_MS = 2000;

export function useChat(matchId: string, user: LocalUser | null) {
  const { socket, status } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  // Join the room once we have a socket + identity, leave on unmount/change.
  useEffect(() => {
    if (!socket || !user || status !== "connected") return;

    socket.emit("join_chat", { matchId, userId: user.userId, username: user.username });

    return () => {
      socket.emit("leave_chat", { matchId, userId: user.userId });
    };
  }, [socket, matchId, user, status]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (payload: ChatMessagePayload) => {
      if (payload.matchId !== matchId) return;
      const message: ChatMessage = { ...payload, id: payload.id ?? `${payload.userId}-${payload.timestamp}` };
      setMessages((prev) => [...prev, message]);
    };

    const handleTyping = (payload: { matchId: string; userId: string; username: string; isTyping: boolean }) => {
      if (payload.matchId !== matchId || payload.userId === user?.userId) return;
      setTypingUsers((prev) => {
        const withoutUser = prev.filter((u) => u.userId !== payload.userId);
        return payload.isTyping
          ? [...withoutUser, { userId: payload.userId, username: payload.username }]
          : withoutUser;
      });
    };

    const handleUserLeft = (payload: { matchId: string; userId: string }) => {
      if (payload.matchId !== matchId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
    };

    const handleError = (payload: { code: string; message: string }) => {
      setChatError(payload.message);
    };

    socket.on("chat_message", handleChatMessage);
    socket.on("typing_indicator", handleTyping);
    socket.on("user_left", handleUserLeft);
    socket.on("error", handleError);

    return () => {
      socket.off("chat_message", handleChatMessage);
      socket.off("typing_indicator", handleTyping);
      socket.off("user_left", handleUserLeft);
      socket.off("error", handleError);
    };
  }, [socket, matchId, user?.userId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket || !user) return;
      const trimmed = text.trim().slice(0, MESSAGE_MAX_LENGTH);
      if (!trimmed) return;
      socket.emit("send_message", {
        matchId,
        userId: user.userId,
        username: user.username,
        message: trimmed,
      });
    },
    [socket, matchId, user],
  );

  const notifyTyping = useCallback(() => {
    if (!socket || !user) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing_start", { matchId, userId: user.userId, username: user.username });
    }

    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit("typing_stop", { matchId, userId: user.userId });
    }, TYPING_STOP_DELAY_MS);
  }, [socket, matchId, user]);

  useEffect(() => {
    return () => {
      if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    };
  }, []);

  return { messages, typingUsers, sendMessage, notifyTyping, chatError, maxLength: MESSAGE_MAX_LENGTH };
}

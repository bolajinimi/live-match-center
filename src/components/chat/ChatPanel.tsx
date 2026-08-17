"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useLocalUser } from "@/hooks/useLocalUser";
import { useSocket } from "@/contexts/SocketContext";

export function ChatPanel({ matchId }: { matchId: string }) {
  const { user, hydrated, setUsername } = useLocalUser();

  if (!hydrated) return null;

  return user ? (
    <ChatRoom matchId={matchId} userId={user.userId} username={user.username} />
  ) : (
    <UsernamePrompt onSubmit={setUsername} />
  );
}

function UsernamePrompt({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(name);
      }}
      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
    >
      <p className="mb-2 text-sm text-slate-300">Pick a username to join the chat.</p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          placeholder="Username"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Join
        </button>
      </div>
    </form>
  );
}

function ChatRoom({ matchId, userId, username }: { matchId: string; userId: string; username: string }) {
  const { status } = useSocket();
  const { messages, typingUsers, sendMessage, notifyTyping, chatError, maxLength } = useChat(matchId, {
    userId,
    username,
  });
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <div className="flex h-[28rem] flex-col rounded-xl border border-white/10 bg-white/[0.02]">
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet — say hello.</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.userId === userId ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                msg.userId === userId ? "bg-blue-600 text-white" : "bg-white/10 text-slate-100"
              }`}
            >
              {msg.userId !== userId && (
                <span className="mr-1.5 text-xs font-semibold text-slate-400">{msg.username}</span>
              )}
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <div className="min-h-[1.25rem] px-4 text-xs text-slate-500">
        {typingUsers.length > 0 &&
          `${typingUsers.map((u) => u.username).join(", ")} ${typingUsers.length === 1 ? "is" : "are"} typing…`}
      </div>

      {chatError && <div className="px-4 pb-1 text-xs text-red-400">{chatError}</div>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            notifyTyping();
          }}
          maxLength={maxLength}
          disabled={status !== "connected"}
          placeholder={status === "connected" ? "Send a message…" : "Reconnecting…"}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!draft.trim() || status !== "connected"}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

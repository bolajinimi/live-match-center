"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useLocalUser } from "@/hooks/useLocalUser";
import { useSocket } from "@/contexts/SocketContext";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

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
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-lg">💬</span>
      <div>
        <p className="text-sm font-medium text-ink">Join the conversation</p>
        <p className="mt-0.5 text-xs text-ink-faint">Pick a username to start chatting.</p>
      </div>
      <div className="flex w-full max-w-xs gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          placeholder="Username"
          autoFocus
          className="min-w-0 flex-1 rounded-full border border-border bg-surface-hover px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded-full bg-accent-solid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-40"
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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typingUsers.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  const remaining = maxLength - draft.length;
  const nearLimit = remaining <= 40;

  return (
    <div className="flex h-[28rem] flex-col overflow-hidden rounded-xl border border-border bg-canvas/40">
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="scroll-thin flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-ink-faint">No messages yet — say hello 👋</p>
        )}
        {messages.map((msg, i) => {
          const own = msg.userId === userId;
          const prev = messages[i - 1];
          const showMeta = !prev || prev.userId !== msg.userId;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${own ? "flex-row-reverse" : ""}`}>
              {!own && (
                <div className={showMeta ? "opacity-100" : "opacity-0"}>
                  <InitialsAvatar name={msg.username} size={26} />
                </div>
              )}
              <div className={`flex max-w-[75%] flex-col ${own ? "items-end" : "items-start"}`}>
                {showMeta && !own && (
                  <span className="mb-1 px-1 text-xs font-medium text-ink-muted">{msg.username}</span>
                )}
                <div
                  className={`px-3.5 py-2 text-sm leading-snug ${
                    own
                      ? "rounded-2xl rounded-br-md bg-accent-solid text-white"
                      : "rounded-2xl rounded-bl-md border border-border bg-surface text-ink"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <span className="flex gap-0.5 rounded-full border border-border bg-surface px-2.5 py-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint" />
            </span>
            <span className="text-xs text-ink-faint">
              {typingUsers.map((u) => u.username).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
            </span>
          </div>
        )}
      </div>

      {chatError && (
        <div className="border-t border-live/20 bg-live-soft px-4 py-1.5 text-xs text-live">{chatError}</div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            notifyTyping();
          }}
          maxLength={maxLength}
          disabled={status !== "connected"}
          placeholder={status === "connected" ? "Send a message…" : "Reconnecting…"}
          className="min-w-0 flex-1 rounded-full border border-border bg-surface-hover px-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
        {nearLimit && (
          <span className={`text-xs tabular-nums ${remaining < 0 ? "text-live" : "text-ink-faint"}`}>
            {remaining}
          </span>
        )}
        <button
          type="submit"
          disabled={!draft.trim() || status !== "connected"}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-solid text-white transition-colors hover:bg-accent-solid-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12L20 4L14 20L11 13L4 12Z" fill="currentColor" />
    </svg>
  );
}

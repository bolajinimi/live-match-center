"use client";

import { useEffect, useState } from "react";
import type { LocalUser } from "@/types/chat";

const STORAGE_KEY = "lmc_user";

function loadUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

function saveUser(user: LocalUser) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Minimal client-side identity for chat: a persisted userId (uuid) plus a
 * username the visitor picks themselves. No auth backend required per spec.
 */
export function useLocalUser() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadUser());
    setHydrated(true);
  }, []);

  const setUsername = (username: string) => {
    const trimmed = username.trim().slice(0, 32);
    if (!trimmed) return;
    const next: LocalUser = {
      userId: user?.userId ?? crypto.randomUUID(),
      username: trimmed,
    };
    setUser(next);
    saveUser(next);
  };

  return { user, hydrated, setUsername };
}

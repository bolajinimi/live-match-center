import type { Match, MatchDetail } from "@/types/match";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  // Fail loudly at build/runtime rather than silently hitting a relative path.
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local.");
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiFailure {
  success: false;
  error?: { code?: string; message?: string };
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
    // Live sports data — never let Next's fetch cache serve stale scores.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText} (${path})`);
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message ?? `API returned success: false for ${path}`);
  }
  return json.data;
}

export async function getMatches(): Promise<Match[]> {
  const data = await apiFetch<{ matches: Match[]; total: number }>("/api/matches");
  return data.matches;
}

export async function getLiveMatches(): Promise<Match[]> {
  const data = await apiFetch<{ matches: Match[]; total: number }>("/api/matches/live");
  return data.matches;
}

export async function getMatchById(id: string): Promise<MatchDetail> {
  return apiFetch<MatchDetail>(`/api/matches/${id}`);
}

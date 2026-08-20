// Deterministic accent color for a given string (team name, username, ...)
// so the same entity gets a consistent color across the app. Each shade is
// picked to clear 4.5:1 contrast against the white initials rendered on top
// of it (the original, brighter palette ran as low as 2:1 for some hues).
const PALETTE = [
  "#1d4ed8",
  "#15803d",
  "#b45309",
  "#be185d",
  "#0e7490",
  "#7e22ce",
  "#dc2626",
  "#4d7c0f",
];

export function colorFor(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

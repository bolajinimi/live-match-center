// Locale/timezone-pinned date formatting.
//
// These components render during SSR (in Node, using whatever locale/timezone
// the server host happens to have) and again on the client during hydration
// (using the visitor's own locale/timezone). Passing `undefined` to
// toLocaleDateString/toLocaleString lets each environment pick its own
// default, so the two renders can produce different strings — which React
// flags as a hydration mismatch in production. Pinning an explicit locale and
// timeZone here makes the output identical everywhere, at the cost of always
// showing UTC rather than the viewer's local time zone.

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatKickoff(iso: string): string {
  const formatted = new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${formatted} UTC`;
}

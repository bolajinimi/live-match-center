// Shared site identity, used anywhere metadata needs to agree with itself:
// layout.tsx (title/OG/twitter tags), manifest.ts (PWA name), and
// opengraph-image.tsx (the rendered share-preview image).
export const TITLE = "Live Match Center";
export const DESCRIPTION = "Real-time football scores, match events, and chat.";

// Set NEXT_PUBLIC_SITE_URL once deployed (see .env.example) so absolute URLs
// in metadata/OG tags/robots.txt/sitemap point at the real domain instead of
// localhost. Falls back to localhost, and also falls back (rather than
// throwing) if the env var is ever set to something that isn't a valid
// absolute URL — a bad value here would otherwise crash the whole app at
// layout evaluation.
const DEFAULT_SITE_URL = "http://localhost:3000";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return DEFAULT_SITE_URL;
  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    console.error(
      `NEXT_PUBLIC_SITE_URL is set to an invalid URL ("${raw}") — falling back to ${DEFAULT_SITE_URL}.`,
    );
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

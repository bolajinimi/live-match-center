import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Individual match pages aren't listed here: they're live, ephemeral fixtures
// (created and torn down continuously) rather than stable, indexable content.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "always", priority: 1 }];
}

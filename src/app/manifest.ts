import type { MetadataRoute } from "next";
import { DESCRIPTION, TITLE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: TITLE,
    short_name: "Match Center",
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0d12",
    theme_color: "#0a0d12",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  };
}

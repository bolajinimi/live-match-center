import { ImageResponse } from "next/og";
import { DESCRIPTION, TITLE } from "@/lib/site";

export const runtime = "edge";
export const alt = TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0d12",
          backgroundImage: "radial-gradient(900px circle at 50% 0%, rgba(79,127,255,0.18), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 96,
            width: 96,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            background: "#4f7fff",
            fontSize: 52,
            marginBottom: 32,
          }}
        >
          ⚽
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#f4f6f8" }}>{TITLE}</div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 28, color: "#9aa4b2" }}>{DESCRIPTION}</div>
      </div>
    ),
    { ...size },
  );
}

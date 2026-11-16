import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Zelthia: health guidance and medicine stock near you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const icon = await readFile(join(process.cwd(), "public/icons/icon-512.png"));
  const src = `data:image/png;base64,${icon.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: "#0d3b35",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <img src={src} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>Zelthia</div>
          <div style={{ fontSize: 40, lineHeight: 1.25, color: "#cfeee0", maxWidth: 640 }}>
            Health guidance that knows your history. Medicine in stock near you.
          </div>
        </div>
      </div>
    ),
    size,
  );
}

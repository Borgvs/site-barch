/**
 * icon.tsx — favicon dinâmico via next/og.
 * 32×32 com o símbolo "B" sólido.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0A0A0A",
          color: "#FCFBF7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.04em",
          borderRadius: 4,
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}

/**
 * apple-icon.tsx — Apple touch icon 180×180.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0A0A0A",
          color: "#FCFBF7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 124,
          fontWeight: 700,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}

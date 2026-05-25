/**
 * apple-icon.tsx — Apple touch icon 180×180 com símbolo Barch real.
 * Path SVG vem do símbolo b estilizado da identidade Barch.
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="124"
          height="124"
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M195,105h-27.03c-41.59,0-77.38,14.61-107.08,43.72-17.09,16.75-45.89,4.63-45.89-19.3v-51.43c0-34.7,28.3-63,63-63h27c49.7,0,90,40.29,90,90,0,30.12-14.8,56.79-37.53,73.13-22.63,16.27-37.26,36.05-45.18,59.24-3.88,11.35-2.19,22.82,4.79,32.58,6.98,9.75,17.29,15.06,29.28,15.06h48.64c49.7,0,90-40.3,90-90s-40.29-90-90-90"
            fill="#D0CBC3"
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

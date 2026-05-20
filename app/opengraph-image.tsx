/**
 * opengraph-image.tsx — OG dinâmico cinematográfico.
 *
 * Background: residência blue-hour (FLUX AI) + dark overlay.
 * Tipografia editorial sobreposta — Inter weight 500.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Barch · Construir sem ruído";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  // Carrega imagem do hero como base64 a partir do public
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://barch.com.br";
  let bgDataUrl = "";
  try {
    const res = await fetch(`${baseUrl}/hero/hero-blue-hour.webp`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      bgDataUrl = `data:image/webp;base64,${b64}`;
    }
  } catch {
    bgDataUrl = "";
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 80px",
          background: "#0A0A0A",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
          color: "#FCFBF7",
          ...(bgDataUrl
            ? {
                backgroundImage: `url(${bgDataUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 50%, rgba(10,10,10,0.80) 100%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "#FCFBF7",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A0A0A",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#FCFBF7",
            }}
          >
            Barch
          </div>
        </div>

        {/* Centro · headline editorial */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(252,251,247,0.70)",
              fontWeight: 500,
            }}
          >
            Venture builder arquitetônica
          </div>
          <div
            style={{
              fontSize: 124,
              lineHeight: 0.92,
              letterSpacing: "-0.04em",
              fontWeight: 500,
              color: "#FCFBF7",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Construir</span>
            <span
              style={{
                color: "rgba(252,251,247,0.65)",
                fontStyle: "italic",
                fontWeight: 300,
              }}
            >
              sem ruído.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "rgba(252,251,247,0.70)",
              letterSpacing: "0.04em",
            }}
          >
            barch.com.br
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(252,251,247,0.50)",
              fontWeight: 500,
            }}
          >
            Arquitetura · obra · operação
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

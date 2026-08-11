/**
 * opengraph-image.tsx — cartão editorial tipográfico.
 *
 * DETERMINÍSTICO por decisão: a versão anterior buscava o hero .webp em runtime
 * e o embutia como background no satori — que não rasteriza webp — e o stream
 * abortava DEPOIS do 200: produção servia image/png com corpo de 0 bytes e todo
 * compartilhamento (WhatsApp/LinkedIn) saía sem card. Sem fetch, sem falha.
 */

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Barch · Construir sem ruído";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
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
          background:
            "radial-gradient(ellipse 120% 90% at 50% -10%, #2B2D31 0%, #1A1B1E 55%, #101114 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#FCFBF7",
        }}
      >
        {/* Header · marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "#FCFBF7",
              borderRadius: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#101114",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            b
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#FCFBF7",
            }}
          >
            Barch
          </div>
        </div>

        {/* Centro · headline editorial */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(252,251,247,0.72)",
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 9999,
                background: "#9C7259",
              }}
            />
            Venture builder arquitetônica
          </div>
          <div
            style={{
              fontSize: 126,
              lineHeight: 0.94,
              letterSpacing: "-0.045em",
              fontWeight: 600,
              color: "#FCFBF7",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Construir</span>
            <span style={{ color: "rgba(252,251,247,0.55)" }}>sem ruído.</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(252,251,247,0.14)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 15,
              color: "rgba(252,251,247,0.72)",
              letterSpacing: "0.04em",
            }}
          >
            barch.com.br
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(252,251,247,0.52)",
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

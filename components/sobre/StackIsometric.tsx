"use client";

/**
 * StackIsometric — A stack venture builder em axonometria.
 *
 * As 3 verticais canônicas (LOCVS · BIMARCH · BARCH) representadas como
 * 3 camadas axonométricas reais, cada uma com:
 *  - código (WHY/HOW/WHAT)
 *  - nome
 *  - tagline
 *  - posição vertical na stack
 *
 * Hover sobre uma camada eleva-a sutilmente em Y (separação) e realça com
 * borda clay + glow. Demais camadas escurecem (focus mode).
 *
 * Reverse side-by-side com texto editorial à direita.
 */

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

interface Layer {
  code: "WHY" | "HOW" | "WHAT";
  name: string;
  tagline: string;
  y: number; // posição y no SVG
  color: string;
}

const layers: Layer[] = [
  {
    code: "WHAT",
    name: "BARCH",
    tagline: "Build Beyond · venture builder.",
    y: 70,
    color: "#9C7259", // clay
  },
  {
    code: "HOW",
    name: "BIMARCH",
    tagline: "Beyond Information Modeling.",
    y: 130,
    color: "#5C6770", // charcoal-ish
  },
  {
    code: "WHY",
    name: "LOCVS",
    tagline: "Human-Centered Spatial Intelligence.",
    y: 190,
    color: "#1A1B1E", // anthraDeep
  },
];

// Forma do prism axonométrico: rhombus com altura visual
function prism(cx: number, cy: number, w: number, h: number, depth: number) {
  // Topo: rhombus
  const topPath = `M ${cx} ${cy - h / 2} L ${cx + w} ${cy} L ${cx} ${cy + h / 2} L ${cx - w} ${cy} Z`;
  // Face direita: paralelogramo
  const rightPath = `M ${cx + w} ${cy} L ${cx + w} ${cy + depth} L ${cx} ${cy + h / 2 + depth} L ${cx} ${cy + h / 2} Z`;
  // Face esquerda
  const leftPath = `M ${cx - w} ${cy} L ${cx - w} ${cy + depth} L ${cx} ${cy + h / 2 + depth} L ${cx} ${cy + h / 2} Z`;
  return { topPath, rightPath, leftPath };
}

export function StackIsometric() {
  const [active, setActive] = useState<Layer["code"] | null>(null);
  const reduce = useReducedMotion();
  // WebKit não dispara IO em filhos de SVG (os prismas ficavam invisíveis
  // no Safari) — observer no <svg> raiz, filhos via animate
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(svgRef, { once: true, margin: "-80px" });

  return (
    <section
      aria-label="A stack venture builder · LOCVS · BIMARCH · BARCH"
      className="relative py-section sm:py-sectionLg"
    >
      <div className="container-page">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
          {/* Diagrama · esquerda */}
          <div className="relative order-2 lg:order-1">
            <svg
              ref={svgRef}
              viewBox="0 0 320 280"
              className="w-full h-full max-w-[480px] mx-auto"
              role="img"
              aria-label="Stack isométrica das 3 verticais"
            >
              <defs>
                {layers.map((l) => (
                  <linearGradient
                    key={`grad-${l.code}`}
                    id={`stackGrad-${l.code}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={l.color} stopOpacity="0.95" />
                    <stop offset="100%" stopColor={l.color} stopOpacity="0.75" />
                  </linearGradient>
                ))}
              </defs>

              {/* Camadas de baixo para cima (LOCVS → BIMARCH → BARCH) */}
              {[...layers].reverse().map((layer, i) => {
                const isActive = active === layer.code;
                const isDimmed = active !== null && active !== layer.code;
                const lift = isActive ? -8 : 0;
                const cx = 160;
                const w = 90;
                const h = 36;
                const depth = 16;
                const cy = layer.y + lift;
                const { topPath, rightPath, leftPath } = prism(
                  cx,
                  cy,
                  w,
                  h,
                  depth,
                );

                return (
                  <motion.g
                    key={layer.code}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 24, scale: 0.96 }
                    }
                    animate={
                      inView
                        ? reduce
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, scale: 1 }
                        : reduce
                          ? { opacity: 0 }
                          : { opacity: 0, y: 24, scale: 0.96 }
                    }
                    transition={{
                      duration: DURATION.slow,
                      ease: EASE.out,
                      delay: 0.18 + i * 0.18,
                    }}
                    onMouseEnter={() => setActive(layer.code)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(layer.code)}
                    onBlur={() => setActive(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Camada ${layer.name} · ${layer.code}`}
                    style={{
                      cursor: "pointer",
                      transition: "filter 400ms ease",
                      filter: isDimmed
                        ? "brightness(0.55) saturate(0.65)"
                        : "none",
                    }}
                  >
                    {/* Face direita */}
                    <path
                      d={rightPath}
                      fill={layer.color}
                      opacity="0.65"
                      stroke="rgba(242,242,242,0.10)"
                      strokeWidth="0.6"
                      style={{
                        transition: "all 400ms ease",
                      }}
                    />
                    {/* Face esquerda · mais escura */}
                    <path
                      d={leftPath}
                      fill={layer.color}
                      opacity="0.5"
                      stroke="rgba(242,242,242,0.10)"
                      strokeWidth="0.6"
                      style={{
                        transition: "all 400ms ease",
                      }}
                    />
                    {/* Topo · gradient */}
                    <path
                      d={topPath}
                      fill={`url(#stackGrad-${layer.code})`}
                      stroke={
                        isActive ? "#FFFFFF" : "rgba(242,242,242,0.18)"
                      }
                      strokeWidth={isActive ? "1.2" : "0.6"}
                      style={{ transition: "all 400ms ease" }}
                    />

                    {/* Glow accent quando ativa */}
                    {isActive && (
                      <motion.path
                        d={topPath}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.55 }}
                        transition={{ duration: DURATION.fast }}
                        style={{ filter: "blur(4px)" }}
                      />
                    )}

                    {/* Label · sobre o topo */}
                    <text
                      x={cx}
                      y={cy + 3}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="800"
                      fill="rgba(255,255,255,0.92)"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      style={{
                        pointerEvents: "none",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {layer.name}
                    </text>
                    <text
                      x={cx}
                      y={cy + 16}
                      textAnchor="middle"
                      fontSize="7"
                      fill="rgba(255,255,255,0.65)"
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      style={{
                        pointerEvents: "none",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                      }}
                    >
                      {layer.code}
                    </text>
                  </motion.g>
                );
              })}

              {/* Conectores verticais entre camadas · linhas pontilhadas */}
              {[100, 160].map((y, i) => (
                <motion.line
                  key={i}
                  x1="160"
                  y1={y}
                  x2="160"
                  y2={y + 30}
                  stroke="rgba(156,114,89,0.30)"
                  strokeWidth="0.6"
                  strokeDasharray="2 3"
                  initial={reduce ? { opacity: 0 } : { pathLength: 0 }}
                  animate={
                    inView
                      ? reduce
                        ? { opacity: 1 }
                        : { pathLength: 1 }
                      : reduce
                        ? { opacity: 0 }
                        : { pathLength: 0 }
                  }
                  transition={{
                    duration: DURATION.slow,
                    delay: 0.7 + i * 0.15,
                    ease: EASE.out,
                  }}
                />
              ))}

              {/* Marca lateral · indicador da hierarquia Sinek */}
              <text
                x="14"
                y="80"
                fontSize="8"
                fill="rgba(242,242,242,0.40)"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
              >
                Entrega
              </text>
              <text
                x="14"
                y="140"
                fontSize="8"
                fill="rgba(242,242,242,0.40)"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
              >
                Método
              </text>
              <text
                x="14"
                y="200"
                fontSize="8"
                fill="rgba(242,242,242,0.40)"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
              >
                Tese
              </text>
            </svg>

            {/* Caption */}
            <p className="text-center mt-6 text-[10.5px] tracking-[0.28em] uppercase text-paper/45 font-medium">
              Same stack · same thesis
            </p>
          </div>

          {/* Texto editorial · direita */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: DURATION.base, ease: EASE.out }}
              className="text-[11px] tracking-[0.32em] uppercase text-paper/70 font-medium mb-6"
            >
              A stack · composição
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.08,
              }}
              className="font-display leading-[1.0] tracking-[-0.028em] mb-8"
              style={{
                fontWeight: 900,
                fontSize: "clamp(36px, 5.6vw, 68px)",
              }}
            >
              <span className="text-glass-light">Arquitetura</span>{" "}
              <span className="block mt-1" style={{ color: "#9C7259" }}>
                como sistema vivo.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.16,
              }}
              className="text-body-lg text-paper/70 leading-[1.6] mb-5 max-w-xl"
            >
              Três verticais. Mesma tese. Cada uma é uma camada operacional do
              mesmo organismo:{" "}
              <span className="text-paper/95 font-medium">
                tese, método, entrega.
              </span>
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.24,
              }}
              className="text-body text-paper/65 leading-[1.65] max-w-xl mb-10"
            >
              Não é tecnologia colada à arquitetura. É arquitetura repensada
              desde a base como infraestrutura — modelo BIM, dados de obra,
              leitura espacial do cliente, operação contínua.
            </motion.p>

            {/* Lista das 3 camadas · linkando ao hover do SVG */}
            <ul className="space-y-3 max-w-md">
              {layers.map((l) => (
                <li
                  key={l.code}
                  onMouseEnter={() => setActive(l.code)}
                  onMouseLeave={() => setActive(null)}
                  className={`group flex items-baseline gap-4 py-2 cursor-default transition-colors ${
                    active === l.code ? "text-paper" : "text-paper/65"
                  }`}
                >
                  <span
                    className="font-mono text-[10.5px] tracking-[0.20em] text-paper/40 group-hover:text-[#9C7259] transition-colors"
                    style={{ minWidth: "44px" }}
                  >
                    {l.code}
                  </span>
                  <span
                    className="font-display text-[18px] sm:text-[22px] leading-tight"
                    style={{ fontWeight: 800 }}
                  >
                    {l.name}
                  </span>
                  <span className="text-[12.5px] text-paper/70 leading-tight">
                    · {l.tagline}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

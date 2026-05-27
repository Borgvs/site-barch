"use client";

/**
 * VBATriangle — Protocolo Verdade · Beleza · Ato.
 *
 * Diagrama interativo:
 *  - Triângulo SVG com 3 vértices clicáveis (V · B · A)
 *  - Centro pulsa "operar no centro" — coração do protocolo
 *  - Hover/active em vértice destaca + revela descrição lateral
 *  - Linhas perimetrais com strokeDasharray animado (entrada in-view)
 *  - Wrapper em glass-stage (palco macOS)
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

type Vertex = "V" | "B" | "A";

interface Layer {
  letter: Vertex;
  title: string;
  body: string;
}

const layers: Layer[] = [
  {
    letter: "V",
    title: "Verdade",
    body: "Dados, critérios e decisões técnicas que sustentam o que afirmamos. Sem evidência, não vai.",
  },
  {
    letter: "B",
    title: "Beleza",
    body: "A narrativa que traduz a verdade em experiência humana. Sem ela, técnica vira jargão.",
  },
  {
    letter: "A",
    title: "Ato",
    body: "Como se realiza. Etapas, responsáveis, prazos, riscos. Promessa precisa de chão.",
  },
];

// Posições dos vértices no SVG viewBox 400×360
const VERTEX: Record<Vertex, { x: number; y: number }> = {
  V: { x: 200, y: 50 },
  B: { x: 60, y: 290 },
  A: { x: 340, y: 290 },
};

export function VBATriangle() {
  const [active, setActive] = useState<Vertex>("V");
  const reduce = useReducedMotion();

  const activeLayer = layers.find((l) => l.letter === active) ?? layers[0];

  return (
    <section
      aria-label="Protocolo Verdade-Beleza-Ato"
      className="relative py-section sm:py-sectionLg"
    >
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DURATION.slow, ease: EASE.out }}
          className="glass-stage px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24"
        >
          {/* Header */}
          <div className="text-center mb-14 sm:mb-16 max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6">
              Protocolo · operacional
            </p>
            <h2
              className="font-display leading-[1.0] tracking-[-0.028em] mb-7"
              style={{
                fontWeight: 900,
                fontSize: "clamp(34px, 5.2vw, 64px)",
              }}
            >
              <span className="text-glass-light">Verdade · Beleza · Ato.</span>
            </h2>
            <p className="text-body text-paper/65 leading-[1.6]">
              Toda comunicação relevante carrega três camadas. Nem uma a menos.
              Operamos sempre no centro do triângulo.
            </p>
          </div>

          {/* Diagrama interativo */}
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
            {/* Triângulo SVG */}
            <div className="relative aspect-square max-w-[480px] mx-auto w-full">
              <svg
                viewBox="0 0 400 360"
                className="w-full h-full"
                aria-label="Diagrama do protocolo Verdade-Beleza-Ato"
                role="img"
              >
                <defs>
                  <radialGradient id="vbaCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#9C7259" stopOpacity="0.55" />
                    <stop offset="60%" stopColor="#9C7259" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#9C7259" stopOpacity="0" />
                  </radialGradient>
                  <filter id="vbaSoft" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                  </filter>
                </defs>

                {/* Triângulo · arestas */}
                {(["V-B", "B-A", "A-V"] as const).map((edge, i) => {
                  const [from, to] = edge.split("-") as [Vertex, Vertex];
                  const x1 = VERTEX[from].x;
                  const y1 = VERTEX[from].y;
                  const x2 = VERTEX[to].x;
                  const y2 = VERTEX[to].y;
                  return (
                    <motion.line
                      key={edge}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(242,242,242,0.30)"
                      strokeWidth="1.2"
                      strokeDasharray="6 5"
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { pathLength: 0, opacity: 0 }
                      }
                      whileInView={
                        reduce
                          ? { opacity: 1 }
                          : { pathLength: 1, opacity: 1 }
                      }
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{
                        duration: DURATION.contemplative,
                        ease: EASE.out,
                        delay: 0.2 + i * 0.18,
                      }}
                    />
                  );
                })}

                {/* Centro · halo pulsante */}
                <motion.circle
                  cx="200"
                  cy="210"
                  r="64"
                  fill="url(#vbaCenterGlow)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: DURATION.slow,
                    ease: EASE.out,
                    delay: 0.8,
                  }}
                >
                  {!reduce && (
                    <animate
                      attributeName="r"
                      values="56;72;56"
                      dur="3.6s"
                      repeatCount="indefinite"
                    />
                  )}
                </motion.circle>

                {/* Centro · ponto */}
                <motion.circle
                  cx="200"
                  cy="210"
                  r="4"
                  fill="#9C7259"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: DURATION.fast,
                    ease: EASE.spring,
                    delay: 0.9,
                  }}
                />
                <text
                  x="200"
                  y="245"
                  textAnchor="middle"
                  fontSize="10"
                  letterSpacing="0.18em"
                  fill="rgba(242,242,242,0.55)"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  style={{ textTransform: "uppercase" }}
                >
                  Centro
                </text>

                {/* Vértices · botões */}
                {layers.map((layer) => {
                  const pos = VERTEX[layer.letter];
                  const isActive = active === layer.letter;
                  return (
                    <g
                      key={layer.letter}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setActive(layer.letter)}
                      onFocus={() => setActive(layer.letter)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Camada ${layer.title}`}
                      aria-pressed={isActive}
                    >
                      {/* Halo */}
                      <motion.circle
                        r={isActive ? 44 : 30}
                        fill={isActive ? "rgba(156,114,89,0.18)" : "rgba(242,242,242,0.04)"}
                        animate={{
                          r: isActive ? 44 : 30,
                          fill: isActive
                            ? "rgba(156,114,89,0.18)"
                            : "rgba(242,242,242,0.04)",
                        }}
                        transition={{ duration: DURATION.fast, ease: EASE.out }}
                      />
                      {/* Anel */}
                      <motion.circle
                        r="28"
                        fill="none"
                        stroke={isActive ? "#9C7259" : "rgba(242,242,242,0.30)"}
                        strokeWidth={isActive ? "1.5" : "1"}
                        animate={{
                          stroke: isActive
                            ? "#9C7259"
                            : "rgba(242,242,242,0.30)",
                          strokeWidth: isActive ? 1.5 : 1,
                        }}
                        transition={{ duration: DURATION.fast }}
                      />
                      {/* Disco interno */}
                      <motion.circle
                        r="22"
                        fill={isActive ? "rgba(156,114,89,0.32)" : "rgba(20,21,24,0.78)"}
                        animate={{
                          fill: isActive
                            ? "rgba(156,114,89,0.32)"
                            : "rgba(20,21,24,0.78)",
                        }}
                        transition={{ duration: DURATION.fast }}
                      />
                      {/* Letra */}
                      <text
                        textAnchor="middle"
                        y="6"
                        fontSize="18"
                        fontWeight="800"
                        fill={isActive ? "#FFFFFF" : "rgba(242,242,242,0.78)"}
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                        style={{ pointerEvents: "none" }}
                      >
                        {layer.letter}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Painel descritivo · trocas com fade */}
            <div className="lg:pl-4">
              <motion.div
                key={activeLayer.letter}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.fast, ease: EASE.out }}
              >
                <p className="text-[11px] tracking-[0.28em] uppercase text-paper/45 font-medium mb-4">
                  Camada {activeLayer.letter}
                </p>
                <h3
                  className="font-display leading-[1.0] tracking-[-0.024em] mb-5"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(28px, 4vw, 48px)",
                    color: "#9C7259",
                  }}
                >
                  {activeLayer.title}.
                </h3>
                <p className="text-body-lg text-paper/75 leading-[1.6] max-w-xl">
                  {activeLayer.body}
                </p>
              </motion.div>

              {/* Tabs · alternar camada */}
              <div className="mt-10 flex items-center gap-2 flex-wrap">
                {layers.map((l) => (
                  <button
                    key={l.letter}
                    type="button"
                    onClick={() => setActive(l.letter)}
                    onMouseEnter={() => setActive(l.letter)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11.5px] transition-colors ${
                      active === l.letter
                        ? "bg-[#9C7259]/[0.20] text-paper border-[#9C7259]/50"
                        : "bg-paper/[0.04] text-paper/55 border-paper/[0.10] hover:border-paper/25"
                    }`}
                    aria-pressed={active === l.letter}
                  >
                    <span className="font-mono text-[10px] opacity-65">
                      {l.letter}
                    </span>
                    {l.title}
                  </button>
                ))}
              </div>

              <p className="mt-10 text-[12px] text-paper/45 leading-relaxed max-w-md">
                Beleza sem Verdade = marketing vazio. Verdade sem Beleza =
                mecânico. Ambos sem Ato = promessa sem chão.{" "}
                <span className="text-paper/75">Operamos no centro.</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

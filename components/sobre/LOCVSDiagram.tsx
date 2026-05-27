"use client";

/**
 * LOCVSDiagram — Human-Centered Spatial Intelligence.
 *
 * Diagrama psico-espacial:
 *  - "Eu" no centro com glass-dark + ring clay
 *  - 4 anéis concêntricos animados em pulse (opacity)
 *  - 6 arquétipos em órbita lenta (rotação contínua)
 *  - Linhas de conexão pontilhadas entre arquétipo e centro
 *  - Parallax leve · texto e visual com velocidades distintas
 *
 * Side-by-side editorial com texto.
 */

import { motion, useReducedMotion } from "framer-motion";
import { EASE, DURATION, useParallax } from "@/lib/motion";

interface Archetype {
  label: string;
  // posição em radianos (ângulo na órbita inicial)
  angle: number;
  // raio (qual anel)
  ring: number;
}

const archetypes: Archetype[] = [
  { label: "fortaleza", angle: 0, ring: 95 },
  { label: "ninho", angle: Math.PI / 3, ring: 70 },
  { label: "palco", angle: (2 * Math.PI) / 3, ring: 100 },
  { label: "atelier", angle: Math.PI, ring: 78 },
  { label: "estação", angle: (4 * Math.PI) / 3, ring: 92 },
  { label: "santuário", angle: (5 * Math.PI) / 3, ring: 68 },
];

export function LOCVSDiagram() {
  const diagramRef = useParallax<HTMLDivElement>(0.18);
  const reduce = useReducedMotion();

  return (
    <section
      id="locvs"
      aria-label="LOCVS · Human-Centered Spatial Intelligence"
      className="relative py-section sm:py-sectionLg"
    >
      <div className="container-page">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Texto editorial · esquerda */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: DURATION.base, ease: EASE.out }}
              className="text-[11px] tracking-[0.32em] uppercase text-paper/70 font-medium mb-6"
            >
              Diagnóstico · psico-espacial
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
              <span className="text-glass-light">LOCVS.</span>{" "}
              <span
                className="block mt-2"
                style={{
                  color: "#9C7259",
                  fontSize: "0.62em",
                  fontWeight: 800,
                  letterSpacing: "-0.022em",
                }}
              >
                Human-Centered Spatial Intelligence.
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
              Trabalhamos com um diagnóstico próprio que combina neurociência
              espacial, fenomenologia e perfil de uso para mapear como cada
              pessoa{" "}
              <span className="text-paper/95 italic font-medium">
                efetivamente
              </span>{" "}
              habita.
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
              className="text-body text-paper/65 leading-[1.65] max-w-xl"
            >
              É o que separa o que a pessoa diz que quer do que ela vai precisar
              quando estiver morando ali. Três eixos. Seis arquétipos. Um match
              com a propriedade e o arquiteto.
            </motion.p>

            {/* Métricas inline · tipográficas */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.32,
              }}
              className="mt-10 flex items-baseline gap-8 sm:gap-12 flex-wrap"
            >
              <Metric value="88%" label="assertividade · 500+ testes" />
              <Metric value="3" label="eixos psico-espaciais" />
              <Metric value="6" label="arquétipos canônicos" />
            </motion.div>
          </div>

          {/* Diagrama · direita */}
          <div
            ref={diagramRef}
            className="relative aspect-square max-w-[520px] mx-auto w-full"
          >
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full"
              aria-hidden
            >
              <defs>
                <radialGradient id="locvsCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#9C7259" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#9C7259" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#9C7259" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="locvsCoreGrad" cx="50%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="100%" stopColor="rgba(20,21,24,0.95)" />
                </radialGradient>
              </defs>

              {/* Anéis concêntricos · pulse em opacity */}
              {[110, 90, 70, 50, 30].map((r, i) => (
                <motion.circle
                  key={r}
                  cx="120"
                  cy="120"
                  r={r}
                  fill="none"
                  stroke="rgba(242,242,242,0.35)"
                  strokeWidth={i === 0 ? "1" : "0.6"}
                  strokeDasharray={i === 0 ? "none" : "2 4"}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{
                    opacity: 1 - i * 0.12,
                    scale: 1,
                  }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: DURATION.slow,
                    ease: EASE.out,
                    delay: 0.2 + i * 0.1,
                  }}
                >
                  {!reduce && (
                    <animate
                      attributeName="opacity"
                      values={`${1 - i * 0.12};${0.5 - i * 0.08};${1 - i * 0.12}`}
                      dur={`${4 + i * 0.6}s`}
                      repeatCount="indefinite"
                    />
                  )}
                </motion.circle>
              ))}

              {/* Halo central · clay */}
              <circle cx="120" cy="120" r="40" fill="url(#locvsCenterGlow)" />

              {/* Linhas radiais para arquétipos · pontilhadas */}
              {archetypes.map((a, i) => {
                const x = 120 + Math.cos(a.angle) * a.ring;
                const y = 120 + Math.sin(a.angle) * a.ring;
                return (
                  <motion.line
                    key={i}
                    x1="120"
                    y1="120"
                    x2={x}
                    y2={y}
                    stroke="rgba(156,114,89,0.30)"
                    strokeWidth="0.6"
                    strokeDasharray="1.5 2"
                    initial={reduce ? { opacity: 0 } : { pathLength: 0 }}
                    whileInView={reduce ? { opacity: 1 } : { pathLength: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      duration: DURATION.contemplative,
                      ease: EASE.out,
                      delay: 0.6 + i * 0.08,
                    }}
                  />
                );
              })}

              {/* Órbita rotacional dos arquétipos */}
              <g style={{ transformOrigin: "120px 120px" }}>
                <motion.g
                  animate={reduce ? {} : { rotate: 360 }}
                  transition={
                    reduce
                      ? {}
                      : {
                          duration: 120,
                          ease: "linear",
                          repeat: Infinity,
                        }
                  }
                  style={{ transformOrigin: "120px 120px" }}
                >
                  {archetypes.map((a, i) => {
                    const x = 120 + Math.cos(a.angle) * a.ring;
                    const y = 120 + Math.sin(a.angle) * a.ring;
                    return (
                      <motion.g
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: DURATION.base,
                          ease: EASE.spring,
                          delay: 0.9 + i * 0.07,
                        }}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#9C7259"
                          stroke="rgba(242,242,242,0.55)"
                          strokeWidth="0.6"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="2"
                          fill="rgba(255,255,255,0.85)"
                        />
                      </motion.g>
                    );
                  })}
                </motion.g>
              </g>

              {/* Núcleo · "eu" */}
              <motion.g
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION.base,
                  ease: EASE.spring,
                  delay: 0.4,
                }}
                style={{ transformOrigin: "120px 120px" }}
              >
                <circle
                  cx="120"
                  cy="120"
                  r="14"
                  fill="url(#locvsCoreGrad)"
                  stroke="#9C7259"
                  strokeWidth="1.2"
                />
                <text
                  x="120"
                  y="124"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#FFFFFF"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight="700"
                  style={{ letterSpacing: "0.04em" }}
                >
                  eu
                </text>
              </motion.g>
            </svg>

            {/* Labels orbitais · texto cuidado, não dentro do SVG para acessibilidade */}
            <ul className="sr-only">
              {archetypes.map((a) => (
                <li key={a.label}>{a.label}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-[#9C7259]/40 pl-4">
      <p
        className="font-display text-paper tnum leading-none"
        style={{ fontSize: "clamp(28px, 3.6vw, 40px)", fontWeight: 800 }}
      >
        {value}
      </p>
      <p className="text-[10.5px] tracking-[0.22em] uppercase text-paper/70 font-medium mt-2">
        {label}
      </p>
    </div>
  );
}

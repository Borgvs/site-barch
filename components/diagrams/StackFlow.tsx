"use client";

/**
 * StackFlow v2 — diagrama compacto Data → Intelligence → Architecture → Platform.
 *
 * v2 melhoramentos:
 *  - Spacing reduzido (era 800x200, agora 720x180)
 *  - Nós maiores (r 32→42) com label integrada DENTRO do círculo
 *  - Conector mais espesso (1→1.5px) e setas maiores · cor clay
 *  - Sub-label "operação" abaixo do nó (era separada em grid embaixo)
 *  - Mais compacto · visualmente entendível em 1 leitura
 */

import { motion } from "framer-motion";

const nodes = [
  {
    id: "data",
    label: "Data",
    sublabel: "Sinal espacial real",
    icon: "circle",
  },
  {
    id: "intel",
    label: "Intelligence",
    sublabel: "Classifica · gera brief",
    icon: "hexagon",
  },
  {
    id: "arch",
    label: "Architecture",
    sublabel: "Projeto · viabilidade",
    icon: "diamond",
  },
  {
    id: "platform",
    label: "Platform",
    sublabel: "Obra · asset · investidor",
    icon: "ring",
  },
];

const CLAY = "#9C7259";
const PAPER_85 = "rgba(242, 242, 242, 0.85)";
const PAPER_55 = "rgba(242, 242, 242, 0.55)";
const PAPER_30 = "rgba(242, 242, 242, 0.30)";

export function StackFlow() {
  return (
    <motion.svg
      viewBox="0 0 720 220"
      className="w-full h-auto max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      aria-label="Stack operacional Barch · Data → Intelligence → Architecture → Platform"
    >
      {/* Linhas conectoras · pulsam na entrada · stroke clay tênue */}
      {[0, 1, 2].map((i) => {
        const x1 = 130 + i * 175;
        const x2 = 220 + i * 175;
        return (
          <motion.line
            key={`line-${i}`}
            x1={x1}
            y1={90}
            x2={x2}
            y2={90}
            stroke={CLAY}
            strokeOpacity={0.5}
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              pathLength: { duration: 0.9, ease: "easeInOut", delay: 0.25 + i * 0.16 },
              opacity: { duration: 0.4, delay: 0.25 + i * 0.16 },
            }}
          />
        );
      })}

      {/* Setas no fim de cada linha · clay sólido */}
      {[0, 1, 2].map((i) => {
        const x = 220 + i * 175;
        return (
          <motion.path
            key={`arrow-${i}`}
            d={`M ${x - 6} 84 L ${x + 2} 90 L ${x - 6} 96`}
            fill="none"
            stroke={CLAY}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0, x: -4 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.16 }}
          />
        );
      })}

      {/* 4 nós com label integrada */}
      {nodes.map((node, i) => {
        const cx = 100 + i * 175;
        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.55,
              ease: [0.32, 0.72, 0, 1],
              delay: 0.1 + i * 0.16,
            }}
          >
            {/* Círculo externo (glow ring) */}
            <circle cx={cx} cy={90} r={42} fill="none" stroke={PAPER_30} strokeWidth={1} />
            {/* Anel intermediário */}
            <circle cx={cx} cy={90} r={32} fill="rgba(60, 64, 70, 0.45)" stroke={PAPER_85} strokeWidth={1} />

            {/* Ícone central · varia por nó */}
            {node.icon === "circle" && (
              <circle cx={cx} cy={90} r={9} fill={PAPER_85} />
            )}
            {node.icon === "hexagon" && (
              <polygon
                points={`${cx},80 ${cx + 8},85 ${cx + 8},95 ${cx},100 ${cx - 8},95 ${cx - 8},85`}
                fill={PAPER_85}
              />
            )}
            {node.icon === "diamond" && (
              <polygon
                points={`${cx},78 ${cx + 11},90 ${cx},102 ${cx - 11},90`}
                fill={PAPER_85}
              />
            )}
            {node.icon === "ring" && (
              <>
                <circle cx={cx} cy={90} r={11} fill="none" stroke={PAPER_85} strokeWidth={2.5} />
                <circle cx={cx} cy={90} r={4} fill={CLAY} />
              </>
            )}

            {/* Label principal · BLACK 700 logo abaixo do círculo */}
            <text
              x={cx}
              y={158}
              textAnchor="middle"
              fill={PAPER_85}
              fontSize="13"
              fontWeight="700"
              letterSpacing="0.5"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {node.label}
            </text>

            {/* Sub-label · descrição da operação */}
            <text
              x={cx}
              y={178}
              textAnchor="middle"
              fill={PAPER_55}
              fontSize="10"
              fontWeight="400"
              letterSpacing="0.5"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {node.sublabel}
            </text>

            {/* Numeração 01/02/03/04 acima do círculo · clay */}
            <text
              x={cx}
              y={32}
              textAnchor="middle"
              fill={CLAY}
              fontSize="10"
              fontWeight="500"
              letterSpacing="2"
              style={{
                fontFamily: "ui-monospace, SF Mono, Menlo, monospace",
                textTransform: "uppercase",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
}

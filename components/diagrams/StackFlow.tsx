"use client";

/**
 * StackFlow — diagrama SVG animado do ciclo Data → Intelligence → Architecture → Platform.
 *
 * Conceito visual: 4 círculos conectados por linhas animadas que pulsam,
 * indicando fluxo de dados/inteligência/arquitetura. Cada nó tem um pequeno
 * label e ícone abstrato. Anima na entrada via framer-motion.
 *
 * Critério Barch:
 *  - SVG vetorial nativo (sem dependência externa)
 *  - Cores da paleta v9.5 (anthra · paper/85 · accent)
 *  - Linha fina · curva precisa · sem ornamento
 *  - Pulse subtle (não infinito por longa duração — só na entrada)
 */

import { motion } from "framer-motion";

const nodes = [
  { id: "data", label: "Data", icon: "circle" },
  { id: "intel", label: "Intelligence", icon: "hexagon" },
  { id: "arch", label: "Architecture", icon: "diamond" },
  { id: "platform", label: "Platform", icon: "ring" },
];

export function StackFlow() {
  return (
    <motion.svg
      viewBox="0 0 800 200"
      className="w-full h-auto max-w-3xl mx-auto"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      aria-label="Stack operacional Barch · ciclo Data, Intelligence, Architecture, Platform"
    >
      {/* Linhas conectoras · pulsam na entrada */}
      {[0, 1, 2].map((i) => {
        const x1 = 130 + i * 200;
        const x2 = 270 + i * 200;
        return (
          <motion.line
            key={`line-${i}`}
            x1={x1}
            y1={100}
            x2={x2}
            y2={100}
            stroke="rgba(242, 242, 242, 0.25)"
            strokeWidth={1}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              pathLength: { duration: 0.9, ease: "easeInOut", delay: 0.3 + i * 0.18 },
              opacity: { duration: 0.4, delay: 0.3 + i * 0.18 },
            }}
          />
        );
      })}

      {/* Setas pequenas no meio das linhas */}
      {[0, 1, 2].map((i) => {
        const x = 200 + i * 200;
        return (
          <motion.path
            key={`arrow-${i}`}
            d={`M ${x - 4} 96 L ${x + 4} 100 L ${x - 4} 104`}
            fill="none"
            stroke="#9C7259"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.18 }}
          />
        );
      })}

      {/* 4 nós · um por camada */}
      {nodes.map((node, i) => {
        const cx = 100 + i * 200;
        return (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.6,
              ease: [0.32, 0.72, 0, 1],
              delay: 0.15 + i * 0.18,
            }}
          >
            {/* Circle outer glow */}
            <circle
              cx={cx}
              cy={100}
              r={32}
              fill="none"
              stroke="rgba(242, 242, 242, 0.10)"
              strokeWidth={1}
            />
            {/* Inner shape varies per node */}
            {node.icon === "circle" && (
              <circle cx={cx} cy={100} r={8} fill="rgba(242, 242, 242, 0.85)" />
            )}
            {node.icon === "hexagon" && (
              <polygon
                points={`${cx},92 ${cx + 7},96 ${cx + 7},104 ${cx},108 ${cx - 7},104 ${cx - 7},96`}
                fill="rgba(242, 242, 242, 0.85)"
              />
            )}
            {node.icon === "diamond" && (
              <polygon
                points={`${cx},90 ${cx + 9},100 ${cx},110 ${cx - 9},100`}
                fill="rgba(242, 242, 242, 0.85)"
              />
            )}
            {node.icon === "ring" && (
              <>
                <circle cx={cx} cy={100} r={10} fill="none" stroke="rgba(242, 242, 242, 0.85)" strokeWidth={2.5} />
                <circle cx={cx} cy={100} r={3} fill="#9C7259" />
              </>
            )}
            {/* Label */}
            <text
              x={cx}
              y={158}
              textAnchor="middle"
              fill="rgba(242, 242, 242, 0.85)"
              fontSize="11"
              fontWeight="500"
              letterSpacing="2"
              style={{ textTransform: "uppercase", fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {node.label}
            </text>
          </motion.g>
        );
      })}
    </motion.svg>
  );
}

"use client";

/**
 * LayerIcon — ícone simbólico vetorial para cada camada da Plataforma.
 *
 * 4 variantes minimalistas:
 *  - canteiro: grid + linha (ortogonal · representando malha estrutural)
 *  - gestao: 3 barras horizontais (dashboard · cronograma)
 *  - investidor: monitor com data point (portal remoto)
 *  - asset: círculo concêntrico (modelo 7D ativo)
 *
 * Critério: precisão geométrica · stroke 1.5px · sem preenchimento · accent
 * subtle (apenas no ponto-foco de cada).
 */

import { motion } from "framer-motion";

type IconKind = "canteiro" | "gestao" | "investidor" | "asset";

interface Props {
  kind: IconKind;
  size?: number;
  className?: string;
}

export function LayerIcon({ kind, size = 56, className = "" }: Props) {
  const stroke = "rgba(242, 242, 242, 0.85)";
  const accent = "#C45911";

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      aria-hidden
    >
      {kind === "canteiro" && (
        <>
          {/* Grid 3x3 + ponto ativo no canto inferior direito */}
          {[16, 32, 48].map((x) => (
            <line key={`v-${x}`} x1={x} y1={12} x2={x} y2={52} stroke={stroke} strokeWidth={1.2} />
          ))}
          {[16, 32, 48].map((y) => (
            <line key={`h-${y}`} x1={12} y1={y} x2={52} y2={y} stroke={stroke} strokeWidth={1.2} />
          ))}
          <rect x={10} y={10} width={44} height={44} stroke={stroke} strokeWidth={1.5} />
          <circle cx={48} cy={48} r={3} fill={accent} />
        </>
      )}

      {kind === "gestao" && (
        <>
          {/* Frame de dashboard + 3 barras (cronograma) */}
          <rect x={10} y={14} width={44} height={36} stroke={stroke} strokeWidth={1.5} rx={2} />
          <line x1={16} y1={26} x2={42} y2={26} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={16} y1={34} x2={48} y2={34} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={16} y1={42} x2={36} y2={42} stroke={accent} strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {kind === "investidor" && (
        <>
          {/* Monitor com gráfico de linha ascendente */}
          <rect x={8} y={14} width={48} height={34} stroke={stroke} strokeWidth={1.5} rx={2} />
          <line x1={26} y1={54} x2={38} y2={54} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={32} y1={48} x2={32} y2={54} stroke={stroke} strokeWidth={1.5} />
          <polyline
            points="14,40 22,34 30,36 38,28 46,24 52,20"
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={52} cy={20} r={2.5} fill={accent} />
        </>
      )}

      {kind === "asset" && (
        <>
          {/* Círculos concêntricos · modelo 7D ativo */}
          <circle cx={32} cy={32} r={22} stroke={stroke} strokeWidth={1.5} />
          <circle cx={32} cy={32} r={14} stroke={stroke} strokeWidth={1.2} opacity={0.7} />
          <circle cx={32} cy={32} r={6} stroke={stroke} strokeWidth={1} opacity={0.45} />
          <circle cx={32} cy={32} r={2} fill={accent} />
          {/* Pequenos pontos orbitais */}
          <circle cx={54} cy={32} r={1.5} fill={stroke} />
          <circle cx={32} cy={10} r={1.5} fill={stroke} />
          <circle cx={10} cy={32} r={1.5} fill={stroke} />
          <circle cx={32} cy={54} r={1.5} fill={stroke} />
        </>
      )}
    </motion.svg>
  );
}

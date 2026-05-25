"use client";

/**
 * ProblemIcon — 6 ícones SVG minimalistas para os 6 problemas do mercado.
 *
 * Cada ilustração materializa visualmente o conceito do problema:
 *  - fragmentacao: 5 linhas paralelas desconectadas (5 agendas)
 *  - opacidade: ondas obscurecidas, ponto de informação fora de alcance
 *  - adjetivos: palavras-chave repetidas em layers (genérico)
 *  - casa-produto: caixa retangular com tag de preço (commodity)
 *  - cronograma: timeline com gap (promessa quebrada)
 *  - legado: monolito reduzido a poeira (manchete que se apaga)
 *
 * Estilo:
 *  - SVG stroke 1.5px
 *  - paper/85 base · clay #9C7259 no ponto-foco
 *  - 64x64 viewBox
 *  - framer-motion entrance + microinteração no hover (via parent)
 */

import { motion } from "framer-motion";

type ProblemKind =
  | "fragmentacao"
  | "opacidade"
  | "adjetivos"
  | "casa-produto"
  | "cronograma"
  | "legado";

interface Props {
  kind: ProblemKind;
  size?: number;
  className?: string;
}

const STROKE = "rgba(242, 242, 242, 0.85)";
const STROKE_DIM = "rgba(242, 242, 242, 0.40)";
const CLAY = "#9C7259";

export function ProblemIcon({ kind, size = 64, className = "" }: Props) {
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
      {kind === "fragmentacao" && (
        <>
          {/* 5 linhas paralelas curtas com deslocamento horizontal (não-alinhadas) */}
          <line x1={8} y1={16} x2={28} y2={16} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={20} y1={24} x2={48} y2={24} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={14} y1={32} x2={40} y2={32} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={26} y1={40} x2={56} y2={40} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={10} y1={48} x2={36} y2={48} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          {/* Ponto clay indicando o vão · onde o conflito mora */}
          <circle cx={45} cy={32} r={2} fill={CLAY} />
        </>
      )}

      {kind === "opacidade" && (
        <>
          {/* Cortina com 4 ondas + ponto oculto atrás */}
          <path
            d="M 10 18 Q 18 14 26 18 T 42 18 T 58 18"
            stroke={STROKE}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 10 28 Q 18 24 26 28 T 42 28 T 58 28"
            stroke={STROKE_DIM}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 10 38 Q 18 34 26 38 T 42 38 T 58 38"
            stroke={STROKE_DIM}
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Ponto-fato escondido atrás · clay */}
          <circle cx={42} cy={48} r={2.5} fill={CLAY} />
          <line x1={42} y1={48} x2={42} y2={56} stroke={CLAY} strokeWidth={1.2} strokeLinecap="round" />
        </>
      )}

      {kind === "adjetivos" && (
        <>
          {/* 4 retângulos sobrepostos · letras-fantasma (paper/40 stack) */}
          <rect x={10} y={14} width={36} height={6} rx={1} stroke={STROKE_DIM} strokeWidth={1.2} />
          <rect x={14} y={22} width={36} height={6} rx={1} stroke={STROKE_DIM} strokeWidth={1.2} />
          <rect x={18} y={30} width={36} height={6} rx={1} stroke={STROKE_DIM} strokeWidth={1.2} />
          {/* Um retângulo destacado · clay · o adjetivo que falta sustentar */}
          <rect x={12} y={42} width={40} height={8} rx={1.5} stroke={CLAY} strokeWidth={1.8} />
          <line x1={18} y1={46} x2={28} y2={46} stroke={CLAY} strokeWidth={1.5} strokeLinecap="round" />
        </>
      )}

      {kind === "casa-produto" && (
        <>
          {/* Caixa retangular básica · 2 janelas idênticas · etiqueta clay */}
          <rect x={12} y={20} width={40} height={28} stroke={STROKE} strokeWidth={1.5} />
          <line x1={12} y1={20} x2={32} y2={8} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={32} y1={8} x2={52} y2={20} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <rect x={18} y={28} width={8} height={8} stroke={STROKE_DIM} strokeWidth={1.2} />
          <rect x={38} y={28} width={8} height={8} stroke={STROKE_DIM} strokeWidth={1.2} />
          {/* Etiqueta de preço · commodity */}
          <circle cx={50} cy={50} r={6} stroke={CLAY} strokeWidth={1.5} fill="rgba(156, 114, 89, 0.10)" />
          <text
            x={50}
            y={53}
            textAnchor="middle"
            fontSize="6"
            fill={CLAY}
            fontFamily="ui-monospace, SF Mono, monospace"
            fontWeight={700}
          >
            $
          </text>
        </>
      )}

      {kind === "cronograma" && (
        <>
          {/* Timeline horizontal · 4 marcos · ponto clay no gap (atraso) */}
          <line x1={8} y1={32} x2={20} y2={32} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          {/* Gap visualizado · linha tracejada clay */}
          <line
            x1={22}
            y1={32}
            x2={36}
            y2={32}
            stroke={CLAY}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          <line x1={38} y1={32} x2={56} y2={32} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          {/* Marcos verticais */}
          <line x1={8} y1={26} x2={8} y2={38} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={22} y1={26} x2={22} y2={38} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={36} y1={26} x2={36} y2={38} stroke={CLAY} strokeWidth={1.8} strokeLinecap="round" />
          <line x1={56} y1={26} x2={56} y2={38} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          {/* Sublabels: planejado vs real */}
          <text x={8} y={22} textAnchor="middle" fontSize="6" fill={STROKE_DIM} fontFamily="ui-monospace, monospace">P</text>
          <text x={36} y={22} textAnchor="middle" fontSize="6" fill={CLAY} fontFamily="ui-monospace, monospace" fontWeight={700}>X</text>
          <text x={56} y={48} textAnchor="middle" fontSize="6" fill={STROKE_DIM} fontFamily="ui-monospace, monospace">R</text>
        </>
      )}

      {kind === "legado" && (
        <>
          {/* Monumento alto que vai virando poeira da base · dispersão */}
          <line x1={32} y1={8} x2={32} y2={32} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={28} y1={8} x2={28} y2={32} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={36} y1={8} x2={36} y2={32} stroke={STROKE} strokeWidth={1.5} strokeLinecap="round" />
          {/* Base se quebra em partículas */}
          <line x1={30} y1={36} x2={34} y2={36} stroke={STROKE_DIM} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={26} y1={40} x2={30} y2={40} stroke={STROKE_DIM} strokeWidth={1.2} strokeLinecap="round" />
          <line x1={38} y1={40} x2={42} y2={40} stroke={STROKE_DIM} strokeWidth={1.2} strokeLinecap="round" />
          {/* Pontos de "poeira" · partículas dispersas */}
          <circle cx={22} cy={46} r={1} fill={STROKE_DIM} />
          <circle cx={28} cy={48} r={0.8} fill={STROKE_DIM} />
          <circle cx={34} cy={50} r={1.2} fill={STROKE_DIM} />
          <circle cx={40} cy={48} r={0.8} fill={STROKE_DIM} />
          <circle cx={46} cy={46} r={1} fill={STROKE_DIM} />
          {/* Estrela clay · referencial cultural que perdura */}
          <circle cx={32} cy={56} r={2.5} fill={CLAY} />
        </>
      )}
    </motion.svg>
  );
}

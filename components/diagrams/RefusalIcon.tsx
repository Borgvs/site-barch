"use client";

/**
 * RefusalIcon — 4 vetores simbólicos para as Recusas do Manifesto.
 *
 * Cada ícone materializa visualmente a recusa específica:
 *  - generico: 3 cópias idênticas + 1 destacada (única autêntica)
 *  - fragmentacao: peças soltas convergindo em um centro (integração)
 *  - opacidade: véu/cortina abrindo · revela ponto interno
 *  - espetaculo: spotlight cortado · holofote silenciado
 *
 * Estética: stroke 1.5px paper/85 · acento clay nos pontos-foco.
 * Ícone X usa paper sobre paper (contexto: Manifesto = paper bg).
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type RefusalKind = "generico" | "fragmentacao" | "opacidade" | "espetaculo";

interface Props {
  kind: RefusalKind;
  size?: number;
  className?: string;
}

const INK = "rgba(10, 11, 14, 0.85)";
const INK_DIM = "rgba(10, 11, 14, 0.32)";
const CLAY = "#9C7259";

export function RefusalIcon({ kind, size = 56, className = "" }: Props) {
  // WebKit não dispara IO em filhos de SVG — observer no raiz, filhos via
  // `animate` gated pelo inView (mesma cura do StackFlow).
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
      aria-hidden
    >
      {kind === "generico" && (
        <>
          {/* 3 retângulos idênticos sobrepostos (cópias) + 1 único destacado em clay */}
          <rect x={10} y={12} width={28} height={8} rx={1} stroke={INK_DIM} strokeWidth={1.4} />
          <rect x={14} y={22} width={28} height={8} rx={1} stroke={INK_DIM} strokeWidth={1.4} />
          <rect x={18} y={32} width={28} height={8} rx={1} stroke={INK_DIM} strokeWidth={1.4} />
          {/* O autêntico · clay sólido */}
          <motion.rect
            x={12}
            y={44}
            width={40}
            height={10}
            rx={1.5}
            stroke={CLAY}
            strokeWidth={2}
            fill="rgba(156, 114, 89, 0.08)"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          />
          <circle cx={20} cy={49} r={1.8} fill={CLAY} />
        </>
      )}

      {kind === "fragmentacao" && (
        <>
          {/* 5 peças dispersas convergindo a um centro · setas internas */}
          {/* Centro */}
          <circle cx={32} cy={32} r={5} stroke={CLAY} strokeWidth={2} fill="rgba(156, 114, 89, 0.10)" />
          {/* 4 peças em volta · cada uma com seta apontando para o centro */}
          {/* Top */}
          <motion.g
            initial={{ y: -4, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: -4, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <rect x={26} y={6} width={12} height={6} rx={1} stroke={INK} strokeWidth={1.4} />
            <line x1={32} y1={14} x2={32} y2={24} stroke={INK_DIM} strokeWidth={1} strokeDasharray="1 2" />
          </motion.g>
          {/* Right */}
          <motion.g
            initial={{ x: 4, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 4, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
          >
            <rect x={50} y={26} width={6} height={12} rx={1} stroke={INK} strokeWidth={1.4} />
            <line x1={48} y1={32} x2={40} y2={32} stroke={INK_DIM} strokeWidth={1} strokeDasharray="1 2" />
          </motion.g>
          {/* Bottom */}
          <motion.g
            initial={{ y: 4, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 4, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
          >
            <rect x={26} y={52} width={12} height={6} rx={1} stroke={INK} strokeWidth={1.4} />
            <line x1={32} y1={50} x2={32} y2={40} stroke={INK_DIM} strokeWidth={1} strokeDasharray="1 2" />
          </motion.g>
          {/* Left */}
          <motion.g
            initial={{ x: -4, opacity: 0 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: -4, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.44 }}
          >
            <rect x={8} y={26} width={6} height={12} rx={1} stroke={INK} strokeWidth={1.4} />
            <line x1={16} y1={32} x2={24} y2={32} stroke={INK_DIM} strokeWidth={1} strokeDasharray="1 2" />
          </motion.g>
        </>
      )}

      {kind === "opacidade" && (
        <>
          {/* Cortina abrindo · 2 metades + olho revelado no centro */}
          {/* Metade esquerda da cortina */}
          <motion.path
            d="M 14 10 L 14 54 L 26 50 L 26 14 Z"
            stroke={INK}
            strokeWidth={1.4}
            fill="rgba(10, 11, 14, 0.05)"
            initial={{ x: 4 }}
            animate={inView ? { x: 0 } : { x: 4 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          />
          {/* Metade direita */}
          <motion.path
            d="M 50 10 L 50 54 L 38 50 L 38 14 Z"
            stroke={INK}
            strokeWidth={1.4}
            fill="rgba(10, 11, 14, 0.05)"
            initial={{ x: -4 }}
            animate={inView ? { x: 0 } : { x: -4 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          />
          {/* Olho revelado no centro · forma de amêndoa */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            <path
              d="M 26 32 Q 32 24 38 32 Q 32 40 26 32 Z"
              stroke={CLAY}
              strokeWidth={1.6}
              fill="none"
            />
            <circle cx={32} cy={32} r={2.5} fill={CLAY} />
          </motion.g>
        </>
      )}

      {kind === "espetaculo" && (
        <>
          {/* Cone de holofote silenciado · linha que corta o feixe */}
          {/* Cone (feixe) */}
          <motion.path
            d="M 32 8 L 50 50 L 14 50 Z"
            stroke={INK_DIM}
            strokeWidth={1.4}
            fill="rgba(10, 11, 14, 0.04)"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          />
          {/* Fonte (lâmpada) · pequeno círculo no topo */}
          <circle cx={32} cy={8} r={3} stroke={INK} strokeWidth={1.5} fill="rgba(10, 11, 14, 0.05)" />
          {/* Slash em clay · "silenciar/recusar" — atravessa o cone */}
          <motion.line
            x1={12}
            y1={56}
            x2={52}
            y2={6}
            stroke={CLAY}
            strokeWidth={2.2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
        </>
      )}
    </motion.svg>
  );
}

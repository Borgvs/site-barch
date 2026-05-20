"use client";

/**
 * Reveal — wrapper que aplica fade-up apple-tier quando entra na viewport.
 *
 * Uso:
 *   <Reveal>
 *     <h2>Título</h2>
 *   </Reveal>
 *
 *   <Reveal delay={0.1}>
 *     <p>Subtítulo</p>
 *   </Reveal>
 *
 * Respeita prefers-reduced-motion — apenas fade, sem translate.
 */

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { DURATION, DISTANCE, EASE } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  /** Distância de translateY inicial. Default: 20px. */
  distance?: number;
  /** Direção do movimento. */
  direction?: "up" | "down" | "left" | "right";
  /** Trigger margin — distância antes de aparecer (em px). */
  rootMargin?: string;
  /** Classe wrapper. */
  className?: string;
  /** Renderiza como elemento específico. Default: div. */
  as?: keyof typeof motionElements;
}

const motionElements = {
  div: motion.div,
  span: motion.span,
  section: motion.section,
  article: motion.article,
  p: motion.p,
} as const;

export function Reveal({
  children,
  delay = 0,
  distance = DISTANCE.lg,
  direction = "up",
  rootMargin = "0px 0px -80px 0px",
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motionElements[as];

  const fromX =
    direction === "left" ? -distance : direction === "right" ? distance : 0;
  const fromY =
    direction === "up" ? distance : direction === "down" ? -distance : 0;

  return (
    <Component
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: fromX, y: fromY }}
      whileInView={
        reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }
      }
      viewport={{ once: true, margin: rootMargin }}
      transition={{
        duration: DURATION.base,
        ease: EASE.out,
        delay,
      }}
    >
      {children}
    </Component>
  );
}

"use client";

/**
 * PhaseLabel — Crossfade entre as 6 fases com BLACK + gradient.
 *
 * Aplica a linguagem visual das últimas diretrizes:
 *  - Tipografia BLACK (fontWeight 900)
 *  - Text gradient moving para destaque
 *  - Sub-label em glass-pill-dark
 *  - Linha animada com origin-left scale
 *  - Apple-curve cubic-bezier(0.16, 1, 0.3, 1)
 */

import { AnimatePresence, motion } from "framer-motion";
import { getActivePhase } from "@/lib/construction-config";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PhaseLabel({ progress }: { progress: number }) {
  const phase = getActivePhase(progress);

  return (
    <div className="absolute left-6 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase.id}
          initial={{ opacity: 0, x: -16, filter: "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: 16, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="select-none"
        >
          {/* Sub-label como glass pill */}
          <div className="mb-5">
            <span className="glass-pill-dark" style={{ fontSize: 10.5, letterSpacing: "0.32em", textTransform: "uppercase" }}>
              {phase.sub}
            </span>
          </div>

          {/* Headline BLACK com gradient text */}
          <h2
            className="font-display text-gradient-moving leading-[0.92] tracking-[-0.04em]"
            style={{
              fontSize: "clamp(48px, 9vw, 120px)",
              fontWeight: 900,
            }}
          >
            {phase.label}
          </h2>

          {/* Linha animada */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
            className="mt-6 h-px w-16 origin-left bg-paper/70"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

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
import { getActivePhase, PHASES } from "@/lib/construction-config";

const EASE = [0.16, 1, 0.3, 1] as const;

export function PhaseLabel({ progress }: { progress: number }) {
  const phase = getActivePhase(progress);
  const phaseIndex = PHASES.findIndex((p) => p.id === phase.id);
  const total = PHASES.length;

  return (
    <div className="absolute left-6 sm:left-10 lg:left-16 top-1/2 -translate-y-1/2">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="select-none"
        >
          {/* Sub-label como glass pill */}
          <div className="mb-5">
            <span
              className="glass-pill-dark"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(252,251,247,0.98)",
              }}
            >
              {phase.sub}
            </span>
          </div>

          {/* Headline BLACK com paper sólido (sem gradient animado para evitar borra) */}
          <h2
            className="font-display text-paper leading-[0.92] tracking-[-0.04em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]"
            style={{
              fontSize: "clamp(48px, 9vw, 120px)",
              fontWeight: 900,
            }}
          >
            {phase.label}
          </h2>

          {/* Linha animada + counter de fase (0X / 06) inline · narrativa de série */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.18 }}
            className="mt-6 flex items-center gap-3"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
              className="h-px w-16 origin-left bg-paper/85"
            />
            <span
              className="font-mono text-[10px] tracking-[0.32em] uppercase text-paper/70 tnum"
              style={{ fontWeight: 500 }}
            >
              {String(phaseIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

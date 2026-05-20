"use client";

/**
 * ScrollHint — pista de "role para construir" nos primeiros 5%.
 *
 * Glass pill dark + barra animada pulsando.
 */

import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ScrollHint({ progress }: { progress: number }) {
  const show = progress < 0.05;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 select-none"
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-8 w-px bg-paper/55"
            />
            <span
              className="glass-pill-dark"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              Role para construir
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

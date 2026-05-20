"use client";

/**
 * FinalCTA — aparece nos últimos 6% (HABITAR).
 *
 * Tipografia BLACK + gradient + glass CTA button.
 */

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FinalCTA({ progress }: { progress: number }) {
  const show = progress >= 0.94;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 1.0, ease: EASE }}
          className="absolute bottom-16 right-6 sm:right-10 lg:right-16 max-w-sm"
        >
          <div className="flex flex-col items-end gap-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="font-display text-paper text-[20px] sm:text-[24px] leading-[1.15] tracking-[-0.025em] text-right max-w-[300px]"
              style={{ fontWeight: 700 }}
            >
              <span className="text-gradient-moving">A casa termina aqui.</span>
              <br />
              <span className="text-paper/55 italic font-light">
                A conversa começa agora.
              </span>
            </motion.p>
            <Link
              href="/#contato"
              className="glass-cta-ghost pointer-events-auto group"
            >
              <span>Agendar conversa</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

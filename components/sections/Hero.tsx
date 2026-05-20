"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

/**
 * Hero · OrbAI-coded + calibração content-curation
 * Abre com lockup gigante. Subtitle não-genérico (passa Teste do Intercambiável).
 * Destino antes de mecanismo (Tracy 90/10).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-32 sm:pt-44 sm:pb-40">
      <div className="absolute inset-0 bg-radial-rings pointer-events-none" aria-hidden />

      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden>
        <div className="w-[600px] h-[600px] rounded-full border border-rule/60 animate-pulse-ring" />
        <div className="absolute inset-0 m-auto w-[400px] h-[400px] rounded-full border border-rule/40 animate-pulse-ring" style={{ animationDelay: "1.3s" }} />
      </div>

      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-12"
        >
          <span className="eyebrow-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-warn">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            VENTURE BUILDER ARQUITETÔNICA E URBANA
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 sm:gap-6 mb-10"
        >
          <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex-shrink-0">
            <Logo variant="symbol" tone="dark" size="xl" priority className="w-full h-full" />
          </div>
          <h1 className="font-display text-display-2xl sm:text-[112px] lg:text-[140px] leading-[0.9] tracking-[-0.04em] text-ink font-medium">
            Barch
          </h1>
        </motion.div>

        {/* Subtitle · destino antes de mecanismo · zero termos genéricos */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-body-lg text-charcoal text-center max-w-2xl mx-auto leading-[1.55] mb-10"
        >
          Quem decide construir hoje precisa de mais do que projeto bonito.
          Precisa de um sistema que articule arquitetura, obra e operação{" "}
          <span className="text-ink font-medium">no mesmo eixo de decisão.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/#contato" className="btn-ink">
            Agendar conversa
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </Link>
          <a
            href="https://painel.barch.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Portal do cliente
          </a>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

/**
 * Hero · OrbAI-coded
 * Eyebrow chip · lockup gigante símbolo+nome · subtitle · 2 CTAs
 * Background: rings concêntricos sutis pulsing
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-32 sm:pt-44 sm:pb-40">
      {/* Radial rings background · assinatura visual OrbAI */}
      <div className="absolute inset-0 bg-radial-rings pointer-events-none" aria-hidden />

      {/* Pulse ring sutil atrás do lockup */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden>
        <div className="w-[600px] h-[600px] rounded-full border border-rule/60 animate-pulse-ring" />
        <div className="absolute inset-0 m-auto w-[400px] h-[400px] rounded-full border border-rule/40 animate-pulse-ring" style={{ animationDelay: "1.3s" }} />
      </div>

      <div className="container-page relative">
        {/* Eyebrow chip */}
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

        {/* Lockup gigante: símbolo + nome */}
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

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-body-lg text-charcoal text-center max-w-xl mx-auto leading-[1.55] mb-10"
        >
          Arquitetura, BIM e IA aplicados como sistema único.{" "}
          <span className="text-ink font-medium">Não seguimos tendências — criamos referenciais.</span>
        </motion.p>

        {/* CTAs */}
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
          <Link href="/projetos" className="btn-ghost">
            Ver projetos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

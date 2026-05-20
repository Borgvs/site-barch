"use client";

/**
 * Contact — CTA final em superfície escura (contraste com o resto do site).
 *
 * Refinements Apple-tier:
 *  - Card preto fullscreen-feel com radial rings sutis
 *  - Status dot pulsante (signal de "disponível")
 *  - CTAs magnéticos com ícones que se animam
 *  - Tipografia maior, mais respirável
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { MagneticLink } from "@/components/system/MagneticLink";

export function Contact() {
  return (
    <section
      id="contato"
      className="relative py-section sm:py-sectionLg bg-paper"
    >
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: DURATION.slow, ease: EASE.out }}
          className="relative overflow-hidden bg-ink rounded-glass"
        >
          {/* Radial rings decorativos */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            aria-hidden
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-[640px] h-[640px] rounded-full border border-paperPure/[0.06]" />
              <div className="absolute inset-0 m-auto w-[440px] h-[440px] rounded-full border border-paperPure/[0.08]" />
              <div className="absolute inset-0 m-auto w-[260px] h-[260px] rounded-full border border-paperPure/[0.12]" />
              <div className="absolute inset-0 m-auto w-[120px] h-[120px] rounded-full border border-paperPure/[0.18]" />
            </div>
          </div>

          {/* Grain layer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative z-10 p-12 sm:p-20 lg:p-24 text-center">
            {/* Status chip */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.15,
              }}
              className="glass-pill-dark mb-10"
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warn opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warn" />
              </span>
              Aceitamos projeto · 2026
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.slow,
                ease: EASE.out,
                delay: 0.22,
              }}
              className="font-display text-display-xl sm:text-[80px] lg:text-[96px] text-paperPure mb-7 leading-[0.94] tracking-[-0.03em] max-w-3xl mx-auto"
            >
              Construir
              <br />
              <span className="text-paperPure/60">sem ruído.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.3,
              }}
              className="text-body-lg text-paperPure/70 max-w-lg mx-auto leading-[1.55] mb-12"
            >
              45 minutos. Sem custo. Saímos da conversa sabendo se faz sentido
              seguir.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.38,
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticLink
                href="mailto:contato@barch.com.br?subject=Conversa%20inicial"
                className="group inline-flex items-center gap-3 h-12 px-7 rounded-full bg-paperPure text-ink text-[13px] tracking-[0.04em] font-medium transition-all duration-300 hover:bg-soft hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(252,251,247,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-paperPure focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                ariaLabel="Agendar conversa inicial por e-mail"
                strength={0.28}
                radius={90}
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
              </MagneticLink>

              <MagneticLink
                href="https://wa.me/5500000000000"
                external
                className="glass-cta-ghost group"
                strength={0.25}
                radius={85}
                ariaLabel="Conversar por WhatsApp"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z" />
                </svg>
                <span>WhatsApp</span>
              </MagneticLink>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.5,
              }}
              className="text-[11px] tracking-[0.28em] uppercase text-paperPure/40 mt-14 font-medium"
            >
              contato@barch.com.br · Resposta em 48h úteis
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

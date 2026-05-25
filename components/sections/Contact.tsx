"use client";

/**
 * Contact — fechamento editorial · ocupa a seção inteira · sem card · integrado.
 *
 * Critério: o conteúdo (status chip · headline · subhead · CTAs · email)
 * vive direto sobre o fundo anthra do body, com radial rings como ornamento
 * full-bleed (não confinados a um card). Estrutura editorial, não pitch box.
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { MagneticLink } from "@/components/system/MagneticLink";

export function Contact() {
  return (
    <section
      id="contato"
      className="relative overflow-hidden py-section sm:py-sectionLg"
    >
      {/* Radial rings full-bleed · ornamento ambiente · não confinados a card */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center"
        aria-hidden
      >
        <div className="relative">
          <div className="w-[900px] h-[900px] rounded-full border border-paper/[0.04]" />
          <div className="absolute inset-0 m-auto w-[640px] h-[640px] rounded-full border border-paper/[0.06]" />
          <div className="absolute inset-0 m-auto w-[440px] h-[440px] rounded-full border border-paper/[0.08]" />
          <div className="absolute inset-0 m-auto w-[260px] h-[260px] rounded-full border border-paper/[0.10]" />
          <div className="absolute inset-0 m-auto w-[120px] h-[120px] rounded-full border border-paper/[0.14]" />
        </div>
      </div>

      {/* Grain layer full-bleed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />

      <div className="container-page relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.16 }}
          className="font-display mb-8 leading-[0.92] tracking-[-0.034em]"
          style={{
            fontWeight: 900,
            fontSize: "clamp(56px, 11vw, 140px)",
          }}
        >
          <span className="text-glass-light">Construir</span>
          <br />
          <span className="text-paper/55">sem ruído.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.24 }}
          className="text-body-lg text-paper/75 max-w-xl mx-auto leading-[1.55] mb-14"
        >
          45 minutos. Sem custo. Saímos da conversa sabendo se faz sentido
          seguir.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.32 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticLink
            href="mailto:contato@barch.com.br?subject=Conversa%20inicial"
            className="group inline-flex items-center gap-3 h-12 px-7 rounded-full bg-paper text-anthraDeep text-[13px] tracking-[0.04em] font-medium transition-all duration-300 hover:bg-paperPure hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(242,242,242,0.30)] focus:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-anthra"
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
          transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.44 }}
          className="text-[11px] tracking-[0.28em] uppercase text-paper/40 mt-16 sm:mt-20 font-medium"
        >
          contato@barch.com.br · Resposta em 48h úteis
        </motion.p>
      </div>
    </section>
  );
}

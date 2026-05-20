"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Contact() {
  return (
    <section id="contato" className="relative py-section sm:py-sectionLg">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden text-center bg-ink rounded-glass p-12 sm:p-20"
        >
          <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-[500px] h-[500px] rounded-full border border-paperPure/10" />
              <div className="absolute inset-0 m-auto w-[340px] h-[340px] rounded-full border border-paperPure/15" />
              <div className="absolute inset-0 m-auto w-[200px] h-[200px] rounded-full border border-paperPure/20" />
            </div>
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-eyebrow uppercase font-medium text-paperPure/70 border border-paperPure/15 bg-paperPure/5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
              CONVERSA INICIAL
            </span>
            <h2 className="font-display text-display-xl sm:text-display-2xl text-paperPure mb-6 leading-[0.98] tracking-tight max-w-2xl mx-auto">
              Se você quer construir sem ruído,
              <br />
              <span className="text-paperPure/60">vamos conversar.</span>
            </h2>
            <p className="text-body-lg text-paperPure/70 max-w-xl mx-auto leading-relaxed mb-10">
              45 minutos. Sem custo. Saímos da conversa sabendo se faz sentido seguir.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="mailto:contato@barch.com.br?subject=Conversa%20inicial"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-pill bg-paperPure text-ink text-[14px] font-medium transition-all duration-250 ease-apple hover:scale-[1.02] active:scale-[0.98]"
              >
                Agendar conversa
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Link>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-pill border border-paperPure/20 bg-transparent text-paperPure text-[14px] font-medium transition-all duration-250 ease-apple hover:border-paperPure/40 hover:bg-paperPure/5 active:scale-[0.98]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z" />
                </svg>
                WhatsApp
              </a>
            </div>

            <p className="text-caption text-paperPure/40 mt-10">
              contato@barch.com.br · Resposta em até 48h úteis
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

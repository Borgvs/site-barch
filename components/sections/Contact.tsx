"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Contact + CTA final · padrão LanderOS "What you still waiting"
 */
export function Contact() {
  return (
    <section id="contato" className="relative py-section">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="glass-deep rounded-glass relative overflow-hidden p-10 sm:p-16 lg:p-24 text-center"
        >
          {/* Ambient terracotta wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(162, 58, 31, 0.10), transparent 70%)",
            }}
          />

          <div className="relative z-10">
            <span className="eyebrow-chip eyebrow-chip-warn mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
              VAMOS COMEÇAR
            </span>
            <h2 className="font-display text-display-xl sm:text-display-2xl text-ink leading-[1] mb-6 max-w-3xl mx-auto">
              Seu próximo projeto{" "}
              <span className="italic text-gradient-warn">não vai ser genérico</span>.
            </h2>
            <p className="text-body-lg text-charcoal max-w-2xl mx-auto leading-relaxed mb-10">
              Conversa inicial sem custo. Levamos as ferramentas, o repertório
              e o método — você traz a intenção, o terreno, a restrição. Em 45
              minutos, sabemos se faz sentido seguir juntos.
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <span className="tag-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ok">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                CAU A68944-0
              </span>
              <span className="tag-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ok">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                </svg>
                BIM ISO 19650
              </span>
              <span className="tag-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ok">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
                </svg>
                20+ anos de prática
              </span>
            </div>

            {/* CTA dupla */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="mailto:contato@barch.com.br?subject=Conversa%20inicial%20Barch" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 8l9 6 9-6M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M3 8l9-5 9 5" />
                </svg>
                Agendar conversa
              </Link>
              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607z" />
                </svg>
                WhatsApp
              </a>
            </div>

            <p className="text-caption text-muted2 mt-10">
              contato@barch.com.br · Resposta em até 48h úteis
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const channels = [
  {
    title: "Curva S em tempo real",
    body: "Físico planejado e medido lado a lado, atualizado a cada visita técnica.",
  },
  {
    title: "Vistorias 360°",
    body: "O canteiro inteiro navegável de qualquer cidade. A obra deixa de ser foto.",
  },
  {
    title: "Decisões em aberto",
    body: "Cada decisão pendente com opção recomendada, critério e prazo declarado.",
  },
  {
    title: "Diário e medições",
    body: "Registro diário do canteiro, materiais recebidos e medições assinadas.",
  },
];

export function Portal() {
  return (
    <section id="portal" className="relative py-section sm:py-sectionLg bg-softer">
      <div className="container-page">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          <div>
            <div className="mb-6">
              <span className="eyebrow-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                PORTAL DO CLIENTE
              </span>
            </div>
            <h2 className="font-display text-display-xl sm:text-display-2xl text-ink leading-[0.98] tracking-tight mb-6">
              Cada obra tem seu painel.
            </h2>
            <p className="text-body-lg text-charcoal leading-relaxed mb-8 max-w-xl">
              Cliente, gestor de projeto e equipe de campo acessam o mesmo dado,
              ao mesmo tempo. Sem versão para impressionar — só o que importa
              para decidir.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://painel.barch.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink"
              >
                Acessar painel
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
              <span className="text-body-sm text-muted">
                painel.barch.com.br
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {channels.map((c, i) => (
              <motion.article
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="card-base p-5"
              >
                <h3 className="font-display text-display-sm text-ink leading-tight mb-2">
                  {c.title}
                </h3>
                <p className="text-body-sm text-charcoal leading-relaxed">
                  {c.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

interface Step {
  num: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Escuta Estratégica",
    body:
      "Diagnóstico SAPP psicoarquitetônico, leitura do terreno, mapeamento de restrições e desejos. O briefing real emerge de escuta deliberada.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Projeto Integrado",
    body:
      "BIM coordenado (ISO 19650), análises ambientais Autodesk Forma, otimização paramétrica Finch 3D. Técnica reduz ruído.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        <path d="M3 9h18M9 3v18M9 9h6v6" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Execução com Clareza",
    body:
      "Canteiro Barch com protocolos vivos, diário digital, vistorias 360°, curva S em tempo real. Cliente acompanha tudo pelo painel.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l18-18M9 21V9h12M3 9h6M3 15h3" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Operação e Legado",
    body:
      "Handover com Dossiê de Entrega, walk-through interpretativo, APO em 30/90/180/365 dias. Cliente vira referência.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
      </svg>
    ),
  },
];

interface Tag {
  label: string;
  icon: React.ReactNode;
}

const tags: Tag[] = [
  {
    label: "BIM Coordenado",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    label: "Diário Digital",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 2h6l2 4H7zM5 6h14v15a1 1 0 01-1 1H6a1 1 0 01-1-1z" /></svg>,
  },
  {
    label: "Vistorias 360°",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12c4 4 14 4 18 0M3 12c4-4 14-4 18 0M12 3v18" /></svg>,
  },
  {
    label: "Curva S Ao Vivo",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17c4-2 7-12 18-12" /></svg>,
  },
  {
    label: "SAPP Diagnóstico",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" /></svg>,
  },
];

export function Process() {
  return (
    <section id="processo" className="relative py-section sm:py-sectionLg">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <span className="eyebrow-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-charcoal">
                <path d="M3 12l4-4 4 4 6-6 4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              PROCESSO
            </span>
          </div>
          <h2 className="font-display text-display-xl sm:text-display-2xl text-ink mb-5 leading-[0.98] tracking-tight">
            Simples & Escalável
          </h2>
          <p className="text-body text-charcoal max-w-xl mx-auto leading-relaxed">
            Quatro núcleos, uma única coerência. Da escuta ao legado.
          </p>
        </div>

        {/* 4 cards · 2x2 em desktop */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-12 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.article
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="card-base card-hover p-8 relative group"
            >
              {/* Ícone bloco preto */}
              <div className="w-11 h-11 rounded-cardSm bg-ink flex items-center justify-center text-paperPure mb-6 transition-transform duration-400 ease-apple group-hover:scale-105">
                {step.icon}
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-eyebrow uppercase tracking-wider text-muted2 font-medium tnum">
                  {step.num}
                </span>
                <h3 className="font-display text-display-sm text-ink leading-tight">
                  {step.title}
                </h3>
              </div>
              <p className="text-body-sm text-charcoal leading-relaxed">
                {step.body}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Tags · pills sutis */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {tags.map((t, i) => (
            <motion.span
              key={t.label}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="pill-tag"
            >
              <span className="text-muted">{t.icon}</span>
              {t.label}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

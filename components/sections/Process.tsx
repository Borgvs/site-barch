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
      "Diagnóstico SAPP psicoarquitetônico, leitura do terreno, mapeamento de restrições e desejos. O briefing real emerge de escuta deliberada — não do que o cliente diz que quer.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Projeto Integrado",
    body:
      "BIM coordenado (Bimarch, ISO 19650), análises ambientais Autodesk Forma, otimização paramétrica Finch 3D, visualização Veras + Enscape. Técnica reduz ruído — não gera espetáculo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18M9 9h6v6" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Execução com Clareza",
    body:
      "Canteiro Barch com protocolos vivos (MAN-002), diário digital, vistorias 360°, curva S em tempo real. Cliente acompanha tudo pelo painel — transparência proativa, não relatório-vitrine.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l18-18M9 21V9h12M3 9h6M3 15h3" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Operação e Legado",
    body:
      "Handover com Dossiê de Entrega, walk-through interpretativo, APO em 30/90/180/365 dias. O encerramento é transição — o cliente vira referência, não detrator silencioso.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
      </svg>
    ),
  },
];

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "20+", label: "anos de prática" },
  { value: "6", label: "tipologias dominadas" },
  { value: "100%", label: "BIM Bimarch" },
];

export function Process() {
  return (
    <section id="processo" className="relative py-section">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="flex justify-center mb-5">
            <span className="eyebrow-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-warn">
                <path d="M3 12l4-4 4 4 6-6 4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              PROCESSO
            </span>
          </div>
          <h2 className="font-display text-display-lg sm:text-display-xl text-ink mb-5 leading-[1.05] max-w-3xl mx-auto">
            Quatro núcleos.
            <br />
            <span className="italic text-charcoal">Uma única coerência.</span>
          </h2>
          <p className="text-body-lg text-charcoal max-w-2xl mx-auto leading-relaxed">
            Da escuta ao legado, todo projeto Barch passa pelos mesmos quatro
            núcleos — o que muda é a profundidade. O método é o que torna o
            resultado impossível de reproduzir.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {steps.map((step, i) => (
            <motion.article
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass rounded-glass p-7 hover-lift relative group"
            >
              {/* Número grande no canto */}
              <span className="absolute top-5 right-6 text-caption tnum text-muted2 font-semibold">
                {step.num}
              </span>
              {/* Icon */}
              <div className="w-11 h-11 rounded-card bg-paperPure border border-rule/50 flex items-center justify-center text-warn mb-6 transition-transform duration-400 ease-apple group-hover:scale-105">
                {step.icon}
              </div>
              <h3 className="font-display text-display-sm text-ink mb-3 leading-snug">
                {step.title}
              </h3>
              <p className="text-body-sm text-charcoal leading-relaxed">
                {step.body}
              </p>
            </motion.article>
          ))}
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-display-lg text-gradient-warn tnum leading-none mb-2">
                {s.value}
              </div>
              <p className="text-body-sm text-muted2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

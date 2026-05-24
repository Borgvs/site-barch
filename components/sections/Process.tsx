"use client";

/**
 * Process — Quatro tempos do método Barch.
 *
 * Refinements Apple-tier:
 *  - Timeline visual implícita: número grande, linha horizontal que cresce no hover
 *  - Cards minimalistas, sem shadow agressiva — só rule sutil
 *  - Eyebrow chip refinado
 *  - Tags com hover state subtle
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { Tilt } from "@/components/system/Tilt";

interface Step {
  num: string;
  title: string;
  body: string;
  signal: string;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Escuta antes da forma",
    body: "Diagnóstico do terreno, do cotidiano e do que o cliente ainda não conseguiu pôr em palavras. O projeto real nasce desse mapeamento — não do que se diz na primeira reunião.",
    signal: "Diagnóstico SAPP · 2-4 semanas",
  },
  {
    num: "02",
    title: "Projeto que conversa entre si",
    body: "Arquitetura, estrutura, instalações e custo cabem no mesmo modelo. Conflito que aparece na tela custa horas. Conflito no canteiro custa semanas e contratos.",
    signal: "BIM coordenado · ISO 19650",
  },
  {
    num: "03",
    title: "Obra acompanhada ao vivo",
    body: "Cronograma, decisões em aberto, medições e vistorias 360° no mesmo painel. O cliente vê o que está sob controle e o que ainda não está — sem maquiagem.",
    signal: "Painel de acompanhamento",
  },
  {
    num: "04",
    title: "Entrega que continua",
    body: "Handover formal, manual de uso, acompanhamento técnico nos doze meses seguintes. A relação não termina na chave — começa nela.",
    signal: "Pós-obra 12 meses",
  },
];

const tags = [
  "Diário de obra digital",
  "Vistorias 360°",
  "Curva S ao vivo",
  "Decisões com critério",
  "Painel do cliente",
];

export function Process() {
  return (
    <section
      id="processo"
      className="relative py-section sm:py-sectionLg bg-paper"
    >
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-6"
          >
            Método
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: DURATION.base,
              ease: EASE.out,
              delay: 0.08,
            }}
            className="font-display text-display-xl sm:text-display-2xl text-ink mb-6 leading-[0.94] tracking-[-0.028em]"
            style={{ fontWeight: 900 }}
          >
            Quatro problemas.
            <br />
            <span className="text-muted2">Uma única lógica.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: DURATION.base,
              ease: EASE.out,
              delay: 0.16,
            }}
            className="text-body-lg text-charcoal max-w-xl mx-auto leading-relaxed"
          >
            Cada fase nasce de um problema que o mercado prefere não nomear.
            Da escuta ao pós-entrega, o método é o que torna o resultado
            impossível de reproduzir.
          </motion.p>
        </div>

        {/* Steps grid · glass cards com 3D tilt */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid sm:grid-cols-2 gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: DURATION.slow,
                  delay: i * 0.08,
                  ease: EASE.out,
                }}
              >
                <Tilt max={6} scale={1.012}>
                  <article className="glass-card group relative p-9 sm:p-10 lg:p-12 h-full overflow-hidden">
                    {/* Número grande tipográfico com gradient */}
                    <div className="flex items-baseline justify-between mb-8">
                      <span
                        className="font-display text-[68px] sm:text-[80px] leading-none tnum tracking-[-0.05em] transition-all duration-500"
                        style={{
                          fontWeight: 900,
                          background:
                            "linear-gradient(180deg, rgba(10,10,10,0.10) 0%, rgba(10,10,10,0.32) 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                        aria-hidden
                      >
                        {step.num}
                      </span>
                      <div
                        className="h-px w-12 bg-ink/20 transition-all duration-500 group-hover:w-24 group-hover:bg-ink"
                        aria-hidden
                      />
                    </div>

                    <h3
                      className="font-display text-display-sm sm:text-[26px] leading-[1.16] tracking-[-0.02em] mb-4 text-gradient-ink"
                      style={{ fontWeight: 700 }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-body-sm text-charcoal leading-[1.65] mb-6">
                      {step.body}
                    </p>
                    <p className="text-[10.5px] tracking-[0.28em] uppercase text-muted2 font-medium">
                      {step.signal}
                    </p>
                  </article>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DURATION.base, ease: EASE.out }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          {tags.map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: DURATION.fast,
                delay: i * 0.05,
                ease: EASE.out,
              }}
              className="glass-pill cursor-default"
              style={{ fontSize: 11.5 }}
            >
              {label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

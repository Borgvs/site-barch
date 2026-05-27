"use client";

/**
 * Pilares — 5 princípios inegociáveis em linha editorial vertical Apple-tier.
 *
 * Substitui o grid 2-col raso por uma sequência tipográfica monumental:
 *  - Numeração 01–05 como elemento gráfico (não decorativo)
 *  - Título display + body curto
 *  - Linha vertical clay no hover
 *  - Separadores horizontais com scaleX in-view
 *  - Background da seção com noise ultrasutil
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

interface Pilar {
  title: string;
  body: string;
  emphasis: string;
}

const pilares: Pilar[] = [
  {
    title: "Arquitetura é força cultural",
    body: "O que se constrói molda comportamento, economia e cidade.",
    emphasis: "Não é decoração da paisagem — é a paisagem.",
  },
  {
    title: "Estética é ética do cuidado",
    body: "Processo, canteiro e detalhe são manifestação moral.",
    emphasis: "A coerência precisa atravessar tudo, ou não existe.",
  },
  {
    title: "Técnica reduz ruído",
    body: "Ferramenta entra para antecipar erro e gerar clareza.",
    emphasis: "Quando vira espetáculo, recusamos.",
  },
  {
    title: "Mercado é campo estratégico",
    body: "Não seguimos tendência.",
    emphasis: "Cada projeto é a tese de algo que ainda não existia.",
  },
  {
    title: "Recusa ao genérico",
    body: "Se a proposta funciona para qualquer empresa em qualquer cidade,",
    emphasis: "não pertence à Barch.",
  },
];

export function Pilares() {
  return (
    <section
      aria-label="Cinco princípios inegociáveis"
      className="relative py-section sm:py-sectionLg"
    >
      <div className="container-page">
        {/* Header */}
        <div className="max-w-3xl mb-20 sm:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-paper/70 font-medium mb-6"
          >
            Cinco princípios · inegociáveis
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
            className="font-display leading-[0.98] tracking-[-0.028em]"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 6.5vw, 80px)",
            }}
          >
            <span className="text-glass-light">O que orienta</span>{" "}
            <span style={{ color: "#9C7259" }}>toda decisão.</span>
          </motion.h2>
        </div>

        {/* Pilares · lista editorial vertical */}
        <div className="border-t border-paper/[0.10]">
          {pilares.map((p, i) => (
            <PilarRow key={p.title} pilar={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PilarRow({ pilar, index }: { pilar: Pilar; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: DURATION.base,
        ease: EASE.out,
        delay: index * 0.06,
      }}
      className="group relative border-b border-paper/[0.10] py-10 sm:py-14 transition-colors duration-500"
    >
      {/* Linha vertical clay · aparece on hover */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-px bg-[#9C7259] origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700 ease-out"
      />

      <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-6 sm:gap-12 items-start pl-4 sm:pl-8">
        {/* Numeração monumental */}
        <div className="relative">
          <span
            className="font-display tnum block leading-none text-paper/30 group-hover:text-[#9C7259] transition-colors duration-500"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 5.5vw, 64px)",
              letterSpacing: "-0.04em",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="block mt-2 text-[10px] tracking-[0.28em] uppercase text-paper/35 font-medium">
            Princípio
          </span>
        </div>

        {/* Conteúdo */}
        <div className="max-w-3xl">
          <h3
            className="font-display text-paper leading-[1.02] tracking-[-0.024em] mb-5"
            style={{
              fontWeight: 800,
              fontSize: "clamp(24px, 3.4vw, 40px)",
            }}
          >
            {pilar.title}.
          </h3>
          <p className="text-body-lg text-paper/70 leading-[1.55]">
            {pilar.body}{" "}
            <span className="text-paper/95 font-medium">{pilar.emphasis}</span>
          </p>
        </div>
      </div>
    </motion.article>
  );
}

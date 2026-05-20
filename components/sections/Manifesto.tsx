"use client";

/**
 * Manifesto — Quatro princípios + cláusula interna de autocrítica.
 *
 * Refinements Apple-tier:
 *  - Pillars com letra inicial gigante como elemento tipográfico
 *  - Linhas horizontais separadoras minimalistas
 *  - Cláusula final com peso tipográfico de fechamento
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

const pillars = [
  {
    word: "Autêntica",
    body: "Cada projeto responde ao lugar, ao programa e à gente que o vai habitar. Reprodução não cabe.",
  },
  {
    word: "Visionária",
    body: "A restrição não é obstáculo: é dado de entrada. É nela que mora a diferença entre repetir e construir.",
  },
  {
    word: "Sofisticada",
    body: "Sofisticação aqui é restrição escolhida. Menos elementos, mais decisão por trás de cada um.",
  },
  {
    word: "Inovadora",
    body: "Tecnologia entra para reduzir ruído e antecipar erro. Quando aparece como espetáculo, recusamos.",
  },
];

export function Manifesto() {
  return (
    <section className="relative py-section sm:py-sectionLg bg-softer">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-6"
          >
            Manifesto
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
            className="font-display text-display-xl sm:text-display-2xl text-ink mb-6 leading-[0.96] tracking-[-0.025em]"
          >
            Quatro princípios.
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
            Nada que entregamos passa sem o crivo destes quatro.
          </motion.p>
        </div>

        {/* Pillars com letra inicial tipográfica */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="space-y-px bg-rule">
            {pillars.map((p, i) => (
              <motion.article
                key={p.word}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: DURATION.base,
                  delay: i * 0.07,
                  ease: EASE.out,
                }}
                className="group relative bg-softer hover:bg-paper transition-colors duration-500 p-7 sm:p-10"
              >
                <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <span className="font-display text-[40px] sm:text-[52px] leading-none text-ink/15 tracking-[-0.04em] transition-colors duration-500 group-hover:text-ink font-medium">
                      {p.word[0]}
                    </span>
                    <span className="font-mono text-[9.5px] text-muted2 tracking-wider tnum">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-display text-display-md sm:text-[32px] text-ink mb-3 leading-[1.08] tracking-[-0.025em]">
                      {p.word}.
                    </h3>
                    <p className="text-body text-charcoal leading-[1.65] max-w-2xl">
                      {p.body}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Cláusula final de autocrítica */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.slow,
            ease: EASE.out,
            delay: 0.2,
          }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION.contemplative,
              ease: EASE.out,
              delay: 0.3,
            }}
            className="h-px w-16 bg-ink mx-auto mb-10 origin-center"
          />
          <p className="font-display text-display-md sm:text-display-lg text-ink leading-[1.16] tracking-[-0.022em]">
            Se trocar Barch por outra empresa e a frase ainda fizer sentido,
            <br />
            <span className="text-muted2">a frase está vazia.</span>
          </p>
          <p className="text-[10.5px] tracking-[0.32em] uppercase text-muted2 mt-8 font-medium">
            Cláusula interna · autocrítica permanente
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}

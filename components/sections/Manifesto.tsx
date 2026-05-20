"use client";

import { motion } from "framer-motion";

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
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <span className="eyebrow-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              MANIFESTO
            </span>
          </div>
          <h2 className="font-display text-display-xl sm:text-display-2xl text-ink mb-5 leading-[0.98] tracking-tight">
            Quatro princípios.
          </h2>
          <p className="text-body text-charcoal max-w-xl mx-auto leading-relaxed">
            Nada que entregamos passa sem o crivo destes quatro.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto mb-20">
          {pillars.map((p, i) => (
            <motion.div
              key={p.word}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="card-base card-hover p-8"
            >
              <p className="font-display text-display-md text-ink mb-2 leading-tight tracking-tight">
                {p.word}.
              </p>
              <p className="text-body-sm text-charcoal leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="font-display text-display-md sm:text-display-lg text-ink leading-[1.18] tracking-tight">
            Se trocar Barch por outra empresa e a frase ainda fizer sentido,
            <br />
            <span className="text-muted">a frase está vazia.</span>
          </p>
          <p className="text-caption text-muted2 uppercase tracking-wider mt-6">
            Cláusula interna de autocrítica
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}

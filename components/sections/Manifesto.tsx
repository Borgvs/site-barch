"use client";

import { motion } from "framer-motion";

const pillars = [
  { word: "Autêntica", body: "Recusa o mimetismo. Cada projeto é resposta, não reprodução." },
  { word: "Visionária", body: "Lê o futuro nas restrições do presente. Antecipa erro." },
  { word: "Sofisticada", body: "Sofisticação é restrição escolhida. Não excesso — síntese." },
  { word: "Inovadora", body: "Técnica como redução de ruído. BIM e IA como meio." },
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
            Não negociamos esses quatro. Tudo o que entregamos passa por eles antes.
          </p>
        </div>

        {/* 4 pilares · grid 2x2 com cards off-white */}
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

        {/* Cláusula final · pull quote menor */}
        <motion.blockquote
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="font-display text-display-md sm:text-display-lg text-ink leading-[1.18] tracking-tight">
            Se trocar Barch por qualquer empresa, ainda faz sentido?
            <br />
            <span className="text-muted">Se sim, refazemos.</span>
          </p>
          <p className="text-caption text-muted2 uppercase tracking-wider mt-6">
            Cláusula de autocrítica · MAN-001
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}

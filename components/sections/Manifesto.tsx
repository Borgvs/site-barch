"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    word: "Autêntica",
    body: "Recusa o mimetismo comercial. Cada projeto é uma resposta — não uma reprodução.",
  },
  {
    word: "Visionária",
    body: "Lê o futuro nas restrições do presente. Antecipa erro e expande possibilidade.",
  },
  {
    word: "Sofisticada",
    body: "Sofisticação é restrição escolhida. Não excesso — síntese.",
  },
  {
    word: "Inovadora",
    body: "Técnica como redução de ruído. BIM, IA e digital twin como meio — nunca espetáculo.",
  },
];

export function Manifesto() {
  return (
    <section className="relative py-section overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(162, 58, 31, 0.06), transparent 70%)",
        }}
      />

      <div className="container-tight relative">
        <div className="text-center mb-16">
          <span className="eyebrow-chip mb-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-warn">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            MANIFESTO
          </span>
          <h2 className="font-display text-display-lg sm:text-display-xl text-ink leading-[1.05] mb-5">
            Arquitetura é{" "}
            <span className="italic text-gradient-warn">força cultural</span>.
          </h2>
          <p className="text-body-lg text-charcoal max-w-2xl mx-auto leading-relaxed">
            Espaços moldam comportamento, economia e cidade. Todo projeto é
            avaliado também pelo que gera fora dos seus limites — pelo cuidado
            no detalhe, pela ética do processo, pelo legado que deixa.
          </p>
        </div>

        {/* Pilares · arquétipo Criador */}
        <div className="grid md:grid-cols-2 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.word}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="glass-deep rounded-glass p-8 hover-lift"
            >
              <p className="font-display text-display-md text-gradient-warn mb-3 italic leading-tight">
                {p.word}.
              </p>
              <p className="text-body text-charcoal leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Cláusula de autocrítica · quote destacado */}
        <motion.blockquote
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 text-center max-w-3xl mx-auto"
        >
          <p className="font-display text-display-md sm:text-display-lg text-ink italic leading-[1.2]">
            &ldquo;Se trocarmos Barch por qualquer empresa, ainda faz sentido?
            <br />
            <span className="text-gradient-warn">Se sim, está genérico.</span>&rdquo;
          </p>
          <p className="text-caption text-muted2 uppercase tracking-wider mt-5">
            Cláusula de autocrítica · MAN-001
          </p>
        </motion.blockquote>
      </div>
    </section>
  );
}

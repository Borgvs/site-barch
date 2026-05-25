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
import { RefusalIcon } from "@/components/diagrams/RefusalIcon";

// Manifesto Build Beyond · cap. 10 do Playbook Barch
// Quatro recusas que materializam a tese venture builder.
type RefusalKind = "generico" | "fragmentacao" | "opacidade" | "espetaculo";

const pillars: { word: string; body: string; kind: RefusalKind }[] = [
  {
    word: "Recusa ao genérico",
    kind: "generico",
    body: "Recusa a tratar arquitetura como embalagem de produto imobiliário. Cada projeto responde ao lugar, ao programa e à pessoa real.",
  },
  {
    word: "Recusa à fragmentação",
    kind: "fragmentacao",
    body: "Recusa a separar projeto, obra, financiamento e morar como agendas distintas. A Barch existe para fechar o ciclo que ninguém fecha.",
  },
  {
    word: "Recusa à opacidade",
    kind: "opacidade",
    body: "Transparência como produto, não como promessa. Investidor vê a obra em tempo real. Cliente recebe ativo digital. Construtor opera com critério auditável.",
  },
  {
    word: "Recusa ao espetáculo",
    kind: "espetaculo",
    body: "Tecnologia entra para reduzir ruído e antecipar erro — não para virar palavra-chave de apresentação. O projeto é o que importa. O resto, viabilizador.",
  },
];

export function Manifesto() {
  return (
    <section
      className="relative section-paper-island"
      data-nav-light="true"
    >
      <div className="container-page">
        {/* Header · v10.5.2 · headline redesenhada com hierarquia tipográfica
            visível em 3 níveis (100% / 78% / 105%) · max-w aumentado para
            ocupar o frame · espaço entre linhas controlado por margin individual */}
        <div className="text-center mb-20 sm:mb-24 max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-8"
          >
            Manifesto · Build Beyond
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
            className="font-display mb-10 leading-[0.92] tracking-[-0.032em]"
            style={{
              fontWeight: 900,
              fontSize: "clamp(54px, 11vw, 112px)",
            }}
          >
            {/* Linha 1 · "Build Beyond" 100% · glass-fill dark monumental */}
            <span className="block text-glass-dark">Build Beyond</span>
            {/* Linha 2 · "não é slogan." 78% · muted2 · respira do título principal */}
            <span
              className="block text-muted2 mt-2 sm:mt-3"
              style={{ fontSize: "0.78em", fontWeight: 800, letterSpacing: "-0.022em" }}
            >
              não é slogan.
            </span>
            {/* Linha 3 · "É mandato." 105% · clay · ponto final assertivo */}
            <span
              className="block mt-1 sm:mt-2"
              style={{
                color: "#9C7259",
                fontSize: "1.05em",
                letterSpacing: "-0.034em",
              }}
            >
              É mandato.
            </span>
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
            className="text-body-lg text-charcoal max-w-2xl mx-auto leading-relaxed"
          >
            Construir além do que o mercado aceita como suficiente.{" "}
            <span className="text-ink font-medium">
              Além do genérico. Além da fragmentação. Além do que se vende sem
              critério.
            </span>{" "}
            A BARCH nasceu de prática arquitetônica consolidada e de quatro recusas.
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
                  <div className="flex flex-col items-center gap-3 pt-1 min-w-[60px]">
                    <RefusalIcon
                      kind={p.kind}
                      size={56}
                      className="opacity-85 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <span className="font-mono text-[9.5px] text-muted2 tracking-wider tnum">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="pt-2">
                    <h3
                      className="font-display text-display-md sm:text-[32px] text-ink mb-3 leading-[1.04] tracking-[-0.028em]"
                      style={{ fontWeight: 900 }}
                    >
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
            className="h-px w-16 bg-ink mx-auto mb-12 origin-center"
          />
          {/* Headline final · "Build Beyond" em glass-dark + duas linhas estruturadas
              com hierarquia tipográfica clara · clay no destaque-chave */}
          <h3
            className="font-display leading-[0.96] tracking-[-0.028em] mb-2"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 7vw, 88px)",
            }}
          >
            <span className="text-glass-dark">Build Beyond.</span>
          </h3>
          <p
            className="font-display leading-[1.05] tracking-[-0.022em] mt-6"
            style={{
              fontWeight: 800,
              fontSize: "clamp(22px, 3.2vw, 40px)",
            }}
          >
            <span className="text-ink/85">O que existe</span>{" "}
            <span className="text-muted2">não é suficiente.</span>
          </p>
          {/* Fechamento operativo · método, não promessa */}
          <div className="mt-14 inline-flex flex-col items-center gap-3">
            <span className="h-px w-10 bg-ink/30" aria-hidden />
            <p
              className="font-display text-ink leading-tight tracking-[-0.018em]"
              style={{ fontWeight: 700, fontSize: "clamp(18px, 2.2vw, 28px)" }}
            >
              <span style={{ color: "#9C7259" }}>O método</span>{" "}
              <span className="text-ink">é a resposta.</span>
            </p>
            <p className="text-[10.5px] tracking-[0.32em] uppercase text-muted2 mt-2 font-medium">
              Não a promessa
            </p>
          </div>
        </motion.blockquote>
      </div>
    </section>
  );
}

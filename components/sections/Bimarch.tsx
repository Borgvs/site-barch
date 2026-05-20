"use client";

/**
 * Bimarch — BIM em obra · linguagem institucional sem códigos de manual.
 *
 * Refinements Apple-tier:
 *  - Headline em três tempos com pause tipográfica
 *  - Cards de ferramentas: número index + nome + role + detail, linha que cresce no hover
 *  - Princípios em colunas com linha vertical conectora
 *  - Eyebrow refinado, sem chip pesado
 */

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { Tilt } from "@/components/system/Tilt";

// Three.js model — lazy load para não pesar o bundle inicial
const BimModel3D = dynamic(
  () => import("./BimModel3D").then((m) => ({ default: m.BimModel3D })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-ink animate-pulse" aria-hidden />
    ),
  },
);

const tools = [
  {
    name: "Autodesk Docs",
    role: "Ambiente único",
    detail:
      "Toda decisão técnica versionada e acessível ao GP, ao engenheiro residente e ao cliente — pelo mesmo endereço, ao mesmo tempo.",
  },
  {
    name: "ConstructIN",
    role: "Modelo no canteiro",
    detail:
      "O detalhe técnico aprovado chega ao mestre de obras pelo celular. O canteiro deixa de ser ilha; vira ponto vivo do modelo.",
  },
  {
    name: "Solibri",
    role: "Validação automática",
    detail:
      "Centenas de verificações automáticas a cada entrega. Conflito que aparece no modelo custa horas. No canteiro, custa contratos.",
  },
  {
    name: "eCustos + Prevision",
    role: "Quantitativo e prazo",
    detail:
      "Quantitativos extraídos diretamente do modelo. Cronograma físico-financeiro acoplado ao avanço real da obra.",
  },
];

const principles = [
  {
    title: "BIM é forma de pensar.",
    body: "O cliente não escolhe Barch por causa do software que usamos. Escolhe porque o método elimina retrabalho antes da execução começar.",
  },
  {
    title: "Coordenação antes da concretagem.",
    body: "Cada disciplina conversa com a outra no modelo federado. Quando a estrutura sobe, a hidráulica e a elétrica já se conhecem.",
  },
  {
    title: "Transparência sem vitrine.",
    body: "O cliente acompanha o que está sob controle e o que ainda não está. Sem maquiagem de relatório, sem surpresa de canteiro.",
  },
];

export function Bimarch() {
  return (
    <section
      id="bim"
      className="relative py-section sm:py-sectionLg bg-softer"
    >
      <div className="container-page">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-6"
          >
            BIM em obra · Bimarch
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
            className="font-display text-display-xl sm:text-display-2xl text-ink leading-[0.96] tracking-[-0.025em] mb-7"
          >
            O modelo vive
            <br />
            no canteiro —
            <br />
            <span className="text-muted2">não fica no escritório.</span>
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
            className="text-body-lg text-charcoal leading-[1.55] max-w-2xl"
          >
            Bimarch é o braço técnico da Barch. O que para a maior parte do
            mercado é entregável de projeto, para nós é{" "}
            <span className="text-ink font-medium">
              instrumento vivo de coordenação
            </span>
            : do primeiro estudo de massas ao último relatório de pós-ocupação.
          </motion.p>
        </div>

        {/* Visual hero da seção · modelo 3D BIM interativo (Three.js) */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.slow,
            ease: EASE.out,
            delay: 0.1,
          }}
          className="relative mb-24 rounded-cardSm overflow-hidden bg-ink"
        >
          <div className="aspect-[16/8] relative">
            <BimModel3D className="absolute inset-0" />
            {/* Titulo overlay no topo */}
            <div className="absolute top-5 left-6 z-10 pointer-events-none">
              <p className="text-[10.5px] tracking-[0.32em] uppercase text-paper/65 font-medium mb-1">
                Modelo federado · corte axonométrico
              </p>
              <p className="text-[15px] text-paper/95 leading-tight font-medium max-w-md">
                Arquitetura, estrutural, hidráulica e elétrica em uma única
                fonte
              </p>
            </div>
          </div>
        </motion.figure>

        {/* Ferramentas — grid 1px gap (revelando paper como divisor) */}
        <div className="mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-8"
          >
            Stack operacional
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {tools.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 22, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: DURATION.slow,
                  delay: i * 0.07,
                  ease: EASE.out,
                }}
              >
                <Tilt max={8} scale={1.02}>
                  <article className="glass-card group relative p-7 lg:p-8 h-full">
                    <div className="flex items-baseline justify-between mb-6">
                      <span
                        className="font-display text-[36px] leading-none tnum tracking-[-0.04em]"
                        style={{
                          fontWeight: 900,
                          background:
                            "linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.38) 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="h-px w-6 bg-ink/20 transition-all duration-500 group-hover:w-12 group-hover:bg-ink" />
                    </div>
                    <h3
                      className="font-display text-[18px] sm:text-[20px] leading-tight mb-1.5 tracking-[-0.02em] text-gradient-ink"
                      style={{ fontWeight: 700 }}
                    >
                      {t.name}
                    </h3>
                    <p className="text-[10.5px] tracking-[0.28em] uppercase text-muted2 font-medium mb-4">
                      {t.role}
                    </p>
                    <p className="text-body-sm text-charcoal leading-[1.65]">
                      {t.detail}
                    </p>
                  </article>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Princípios — duas colunas com linhas verticais */}
        <div className="grid lg:grid-cols-[1fr_1.45fr] gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
          >
            <p className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-6">
              Como BIM aterrissa
            </p>
            <h3 className="font-display text-display-lg text-ink leading-[1.02] tracking-[-0.025em]">
              Três decisões
              <br />
              que parecem técnicas.
              <br />
              <span className="text-muted2">São culturais.</span>
            </h3>
          </motion.div>

          <div className="space-y-10 lg:space-y-12">
            {principles.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: DURATION.base,
                  delay: i * 0.08,
                  ease: EASE.out,
                }}
                className="group relative pl-8 border-l border-rule transition-colors duration-500 hover:border-ink/50"
              >
                <div
                  aria-hidden
                  className="absolute left-0 top-0 h-0 w-px bg-ink transition-all duration-700 group-hover:h-full"
                />
                <h4 className="font-display text-[22px] sm:text-[26px] text-ink leading-[1.18] tracking-[-0.018em] mb-3">
                  {p.title}
                </h4>
                <p className="text-body text-charcoal leading-[1.65]">
                  {p.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

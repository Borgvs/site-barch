"use client";

/**
 * Ecossistema — A tese venture builder em três instâncias operacionais.
 *
 * Estrutura Sinek (WHY → HOW → WHAT):
 *   LOCVS = WHY (a tese fundacional · Spatial Intelligence)
 *   BIMARCH = HOW (a metodologia operacional · BIM 3D-7D)
 *   BARCH = WHAT (a entrega final · Design & Build · venture builder)
 *
 * Linguagem: cap. 2 do Playbook BARCH. Frase-gatilho institucional:
 *   "Same stack, same thesis."
 *
 * Visual:
 *  - Três cards monumentais lado-a-lado (lg+) / empilhados (sm/md)
 *  - Cada card: code (W/H/W) · vertical name BLACK 900 · tagline · 1 metric concreta · CTA
 *  - Glass-card-anthra com hover state que destaca card ativo
 *  - Stack diagram embaixo (Data → Intelligence → Architecture → Platform)
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { EASE, DURATION } from "@/lib/motion";

interface Vertical {
  code: "WHY" | "HOW" | "WHAT";
  name: string;
  tagline: string;
  description: string;
  metric: { value: string; label: string };
  status: string;
  cta: { label: string; href: string };
}

const verticals: Vertical[] = [
  {
    code: "WHY",
    name: "Locvs",
    tagline: "Spatial Intelligence for inhabitants.",
    description:
      "O instrumento que mede a quarta camada do real estate: o match entre o espaço e a pessoa que vive nele. Diagnóstico psico-espacial em 3 eixos. 6 perfis arquetípicos. Match com propriedades e arquitetos certificados.",
    metric: { value: "88%", label: "assertividade · 500+ testes Prolific" },
    status: "Pré-Seed · validação Chatterjee (Penn) + Pallasmaa",
    cta: { label: "Descubra seu perfil", href: "/locvs" },
  },
  {
    code: "HOW",
    name: "Bimarch",
    tagline: "Beyond Information Modeling.",
    description:
      "Plataforma de coordenação BIM + digital twin + IA aplicada à construção. Reconciliação entre projeto e canteiro. Cinco dimensões integradas: geometria · tempo · custo · análise · operação.",
    metric: { value: "3D → 7D", label: "framework MARK internacional" },
    status: "6 anos · portfolio multinacional · ISO 19650",
    cta: { label: "Veja como funciona", href: "/bimarch" },
  },
  {
    code: "WHAT",
    name: "Barch",
    tagline: "Build Beyond.",
    description:
      "Venture builder arquitetônica. Holding-mãe que detém propriedade intelectual e cap table dos verticals. Design & Build Solutions integrado (projeto + obra na mesma stack). A prática arquitetônica como R&D vivo.",
    metric: { value: "22 anos", label: "de canteiro, projeto e operação" },
    status: "Sole founder · 100% Gustavo Alonso Borges",
    cta: { label: "Conheça o ecossistema", href: "#plataforma" },
  },
];

const stackLayers = [
  { label: "Data", op: "LOCVS coleta o sinal espacial real" },
  { label: "Intelligence", op: "LOCVS processa · classifica · gera brief" },
  { label: "Architecture", op: "BARCH entrega projeto · BIMARCH garante viabilidade" },
  { label: "Platform", op: "Integra obra, asset, investidor em tempo real" },
];

export function Ecossistema() {
  return (
    <section
      id="ecossistema"
      className="relative bg-anthra py-section sm:py-sectionLg overflow-hidden scroll-mt-24"
      aria-label="Ecossistema · LOCVS · BIMARCH · BARCH"
    >
      <div className="container-page">
        {/* Header editorial */}
        <div className="text-center mb-20 sm:mb-24 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6"
          >
            Ecossistema · venture builder arquitetônica
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.08 }}
            className="font-display text-paper mb-8 leading-[0.92] tracking-[-0.034em]"
            style={{ fontWeight: 900, fontSize: "clamp(42px, 9vw, 84px)" }}
          >
            Same stack.
            <br />
            <span className="text-paper/55">Same thesis.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.16 }}
            className="text-body-lg text-paper/85 max-w-2xl mx-auto leading-relaxed"
          >
            Não são marcas paralelas competindo pelo holofote. São{" "}
            <span className="text-paper font-medium">
              uma tese em três instâncias operacionais
            </span>
            . LOCVS é o porquê. BIMARCH é o como. BARCH é o que se entrega.
          </motion.p>
        </div>

        {/* 3 cards Sinek lado-a-lado */}
        <div className="max-w-7xl mx-auto mb-24">
          <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
            {verticals.map((v, i) => (
              <motion.article
                key={v.code}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: DURATION.slow,
                  delay: i * 0.12,
                  ease: EASE.out,
                }}
                className="glass-card-anthra group relative p-8 sm:p-10 flex flex-col h-full"
              >
                {/* Code chip (WHY/HOW/WHAT) */}
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-[10.5px] tracking-[0.32em] uppercase text-accent font-medium">
                    {v.code}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider tnum text-paper/40">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                </div>

                {/* Vertical name · BLACK 900 monumental */}
                <h3
                  className="font-display text-paper leading-[0.92] tracking-[-0.028em] mb-3"
                  style={{
                    fontWeight: 900,
                    fontSize: "clamp(40px, 5.5vw, 64px)",
                  }}
                >
                  {v.name}
                </h3>

                {/* Tagline · paper/85 italic */}
                <p className="text-[15px] sm:text-[16px] text-paper/85 italic font-light leading-snug mb-6">
                  {v.tagline}
                </p>

                {/* Description · paper/75 */}
                <p className="text-body-sm text-paper/75 leading-[1.65] mb-8">
                  {v.description}
                </p>

                {/* Metric + status (push to bottom) */}
                <div className="mt-auto space-y-4">
                  <div className="flex items-baseline gap-3 pb-4 border-b border-paper/10">
                    <span
                      className="font-display text-paper leading-none tnum tracking-[-0.04em]"
                      style={{ fontWeight: 800, fontSize: "32px" }}
                    >
                      {v.metric.value}
                    </span>
                    <span className="text-[11px] text-paper/55 leading-tight">
                      {v.metric.label}
                    </span>
                  </div>
                  <p className="text-[10.5px] tracking-[0.18em] uppercase text-paper/45 font-medium">
                    {v.status}
                  </p>

                  <Link
                    href={v.cta.href}
                    className="group/cta inline-flex items-center gap-2 mt-4 text-[12px] text-paper hover:text-accent transition-colors duration-500"
                  >
                    <span className="border-b border-paper/40 group-hover/cta:border-accent pb-0.5 transition-colors duration-500">
                      {v.cta.label}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5"
                      aria-hidden
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Stack diagram — Data → Intelligence → Architecture → Platform */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium text-center mb-10">
            Stack operacional · ciclo completo
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-paper/10 rounded-cardSm overflow-hidden">
            {stackLayers.map((layer, i) => (
              <div
                key={layer.label}
                className="bg-anthra hover:bg-anthraMuted transition-colors duration-500 p-6 sm:p-7 flex flex-col"
              >
                <span className="font-mono text-[10px] tracking-wider tnum text-accent mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4
                  className="font-display text-paper text-[20px] sm:text-[22px] leading-tight tracking-[-0.02em] mb-3"
                  style={{ fontWeight: 700 }}
                >
                  {layer.label}
                </h4>
                <p className="text-[12px] text-paper/65 leading-relaxed">
                  {layer.op}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[12px] sm:text-[13px] text-paper/55 italic text-center mt-8 max-w-3xl mx-auto">
            Cotality e CoStar têm dados. Fei-Fei Li e World Labs têm intelligence
            para máquinas. Nenhum competidor entrega arquitetura no mesmo stack.
            <span className="text-paper/85"> A Barch fecha o ciclo.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

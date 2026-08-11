"use client";

/**
 * Composição — A tese venture builder em três instâncias operacionais.
 *
 * Substitui a antiga Ecossistema.tsx. "Ecossistema" foi banido do vocabulário
 * Barch como termo de integração — genérico demais e diluído pelo mercado.
 * Aqui chamamos de Composição (arquitetônico · ato de compor o stack),
 * complementado por vocabulário variado: stack · organismo · holding · tese.
 *
 * Estrutura Sinek (WHY → HOW → WHAT):
 *   LOCVS = WHY (a tese fundacional · Human-Centered Spatial Intelligence)
 *   BIMARCH = HOW (a metodologia operacional · BIM 3D-7D)
 *   BARCH = WHAT (a entrega final · Design & Build · venture builder)
 *
 * Linguagem: cap. 2 do Playbook BARCH. Frase-gatilho institucional:
 *   "Same stack, same thesis."
 *
 * Visual v10.5:
 *  - Wrapper macro em .glass-stage (palco de vidro Apple Sequoia-style)
 *  - Padding generoso · quase nos limites do frame
 *  - 3 cards monumentais lado-a-lado (lg+) / empilhados (sm/md)
 *  - StackFlow ao fim · diagrama compacto Data → Intelligence → Architecture → Platform
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { EASE, DURATION } from "@/lib/motion";
import { StackFlow } from "@/components/diagrams/StackFlow";

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
    tagline: "Human-Centered Spatial Intelligence.",
    description:
      "O instrumento que mede a quarta camada do real estate: o match entre espaço e pessoa. Diagnóstico psico-espacial em 3 eixos. 6 perfis arquetípicos. Match com propriedades e arquitetos certificados.",
    metric: { value: "88%", label: "assertividade · 500+ testes Prolific" },
    status: "Choose by how you live, not by what you see",
    // /locvs ainda não existe — até a landing nascer, o CTA leva à conversa
    cta: { label: "Descubra seu perfil", href: "/#contato" },
  },
  {
    code: "HOW",
    name: "Bimarch",
    tagline: "Beyond Information Modeling.",
    description:
      "Plataforma de coordenação BIM + digital twin + IA aplicada à construção. Reconciliação entre projeto e canteiro. Cinco dimensões integradas: geometria · tempo · custo · análise · operação.",
    metric: { value: "3D → 7D", label: "framework MARK internacional" },
    status: "6 anos · portfólio multinacional · ISO 19650",
    // /bimarch ainda não existe — idem
    cta: { label: "Veja como funciona", href: "/#contato" },
  },
  {
    code: "WHAT",
    name: "Barch",
    tagline: "Build Beyond.",
    description:
      "Venture builder arquitetônica. Design & Build Solutions integrado — projeto e obra na mesma stack. A prática arquitetônica continua como laboratório vivo · gera novos verticals quando a tese justifica.",
    metric: { value: "End-to-end", label: "do diagnóstico ao asset pós-entrega" },
    status: "Holding-mãe institucional · stack arquitetônica integrada",
    cta: { label: "Conheça a plataforma", href: "#plataforma" },
  },
];

export function Composicao() {
  return (
    <section
      id="composicao"
      className="relative py-section sm:py-sectionLg overflow-hidden scroll-mt-24"
      aria-label="Composição da venture builder · LOCVS · BIMARCH · BARCH"
    >
      <div className="container-page">
        {/* Glass stage wrapper · palco macOS quase nos limites do frame.
            Tudo da seção vive dentro · cria destaque e separa do fluxo. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DURATION.slow, ease: EASE.out }}
          className="glass-stage px-6 sm:px-10 lg:px-14 py-20 sm:py-24 lg:py-28"
        >
          {/* Header editorial */}
          <div className="text-center mb-20 sm:mb-24 max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.1 }}
              className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6"
            >
              Composição · venture builder arquitetônica
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.18 }}
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
              transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.26 }}
              className="text-body-lg text-paper/85 max-w-2xl mx-auto leading-relaxed"
            >
              Não são três marcas disputando a mesma vitrine. São{" "}
              <span className="text-paper font-medium">
                uma tese em três frentes
              </span>
              . LOCVS é o porquê. BIMARCH é o como. BARCH é o que se entrega.
            </motion.p>
          </div>

          {/* 3 cards Sinek lado-a-lado · auto-rows-fr garante altura uniforme */}
          <div className="max-w-7xl mx-auto mb-24">
            <div className="grid lg:grid-cols-3 gap-5 lg:gap-6 lg:auto-rows-fr">
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
            <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium text-center mb-8">
              Stack operacional · ciclo completo
            </p>
            {/* Diagrama vetorial animado com labels integradas
                Data → Intelligence → Architecture → Platform */}
            <StackFlow />
            <p className="text-[12px] sm:text-[13px] text-paper/55 italic text-center mt-8 max-w-3xl mx-auto">
              Quatro camadas, um único organismo. O sinal que sai da pessoa chega
              à decisão construtiva.{" "}
              <span className="text-paper/85">
                A Barch fecha o ciclo do real estate de ponta a ponta.
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

/**
 * Problema — Ponte editorial entre o Hero (casa nascendo) e a Tese (manifesto).
 *
 * Função narrativa: antes de mostrar o que a Barch entrega, nomear com clareza
 * os problemas reais que o mercado de construção de alto padrão produz e que
 * nenhum agente isolado consegue resolver sozinho.
 *
 * Cada item segue a forma:
 *   Eyebrow do problema (sintoma visível para o cliente)
 *   Heading do problema (a verdade que ninguém diz, em BLACK monumental)
 *   Parágrafo curto (o porquê estrutural — não a culpa de fulano)
 *
 * Tipografia BLACK 900 com massa cinematográfica, paleta paper / ink.
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { ProblemIcon } from "@/components/diagrams/ProblemIcon";

type ProblemIconKind =
  | "fragmentacao"
  | "opacidade"
  | "adjetivos"
  | "casa-produto"
  | "cronograma"
  | "legado";

interface Problema {
  num: string;
  eyebrow: string;
  heading: string;
  bodyA: string;
  bodyB: string;
  icon: ProblemIconKind;
}

const problemas: Problema[] = [
  {
    num: "01",
    icon: "fragmentacao",
    eyebrow: "Fragmentação",
    heading: "Cinco agendas. Uma só obra.",
    bodyA:
      "Arquiteto, construtora, engenheiro residente, paisagista e interiores quase sempre entram como ilhas — cada um com cronograma, ferramenta e prestação de contas próprios.",
    bodyB:
      "O conflito entre essas agendas vira retrabalho, aditivo e tempo perdido. Quem paga a conta é o cliente.",
  },
  {
    num: "02",
    icon: "opacidade",
    eyebrow: "Opacidade",
    heading: "A obra que ninguém vê.",
    bodyA:
      "O hábito do canteiro é avisar quando o problema já virou fato. Atraso descoberto depois que aconteceu. Custo extra depois de gasto. Mudança de escopo sem volta.",
    bodyB:
      "A confiança que se perde nesse silêncio é o custo mais caro — e o mais invisível.",
  },
  {
    num: "03",
    icon: "adjetivos",
    eyebrow: "Adjetivos vazios",
    heading: "Premium é só uma palavra.",
    bodyA:
      "Premium, exclusivo, inovador, sofisticado — o vocabulário do alto padrão se gastou. Quando todo mundo promete o mesmo, ninguém entrega nada específico.",
    bodyB:
      "Sem critério declarado, decisão técnica vira gosto pessoal — e o cliente fica refém de quem está no controle.",
  },
  {
    num: "04",
    icon: "casa-produto",
    eyebrow: "Casa-produto",
    heading: "Catálogo não é projeto.",
    bodyA:
      "Boa parte do mercado projeta a casa como se fosse produto de prateleira: planta repetida, fachada que vende, ornamento que distrai do que importa.",
    bodyB:
      "Casa boa responde ao lugar, ao programa real e à passagem do tempo. Não cabe em catálogo.",
  },
  {
    num: "05",
    icon: "cronograma",
    eyebrow: "Cronograma de ficção",
    heading: "Promessa não é prazo.",
    bodyA:
      "Cronograma vendido na assinatura raramente sobrevive ao terceiro mês de obra. Atraso na estrutura empurra o acabamento, que empurra a entrega, que empurra a vida do cliente.",
    bodyB:
      "Erro descoberto no canteiro custa contrato. Descoberto antes da concretagem, custa horas.",
  },
  {
    num: "06",
    icon: "legado",
    eyebrow: "Ausência de legado",
    heading: "Foto bonita não é referência.",
    bodyA:
      "Projeto desenhado para virar post some quando o feed esquece. Falta densidade para o que se constrói durar como referência.",
    bodyB:
      "Construir referência — e não só metro quadrado entregue — é decisão tomada antes do primeiro traço, não depois da inauguração.",
  },
];

export function Problema() {
  return (
    <section
      id="diagnostico"
      className="relative py-section sm:py-sectionLg overflow-hidden scroll-mt-24"
      aria-label="Diagnóstico · o que o mercado produz"
    >
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-20 sm:mb-24 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6"
          >
            Diagnóstico
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: DURATION.slow,
              ease: EASE.out,
              delay: 0.08,
            }}
            className="font-display text-paper mb-6 leading-[0.92] tracking-[-0.034em]"
            style={{
              fontWeight: 900,
              fontSize: "clamp(42px, 9vw, 84px)",
            }}
          >
            Seis problemas
            <br />
            que o mercado
            <br />
            <span className="text-paper/55">prefere não nomear.</span>
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
            className="text-body-lg text-paper/85 max-w-xl mx-auto leading-relaxed"
          >
            A Barch não nasceu para ser mais um agente da cadeia. Nasceu para
            corrigir, de saída, o que essa cadeia produz quando cada um opera
            isolado.
          </motion.p>
        </div>

        {/* Grid de problemas — 6 cards numerados, dois por linha */}
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-x-10 sm:gap-x-14 lg:gap-x-20 gap-y-14 sm:gap-y-20">
            {problemas.map((p, i) => (
              <motion.article
                key={p.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: DURATION.slow,
                  delay: (i % 2) * 0.08,
                  ease: EASE.out,
                }}
                className="group relative"
              >
                {/* Ícone vetorial animado · número + linha horizontal
                    Cada problema tem ilustração SVG que materializa o conceito */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-5">
                    <ProblemIcon
                      kind={p.icon}
                      size={48}
                      className="shrink-0 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <span
                      className="font-display text-[44px] sm:text-[56px] leading-none tnum tracking-[-0.04em] transition-all duration-700"
                      style={{
                        fontWeight: 900,
                        background:
                          "linear-gradient(180deg, rgba(242,242,242,0.10) 0%, rgba(242,242,242,0.32) 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                      aria-hidden
                    >
                      {p.num}
                    </span>
                  </div>
                  <div
                    className="h-px w-14 bg-paper/25 transition-all duration-700 ease-out-expo group-hover:w-32 group-hover:bg-paper"
                    aria-hidden
                  />
                </div>

                <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-4 transition-colors duration-500 group-hover:text-paper">
                  {p.eyebrow}
                </p>

                {/* Heading com underline animado na primeira frase relevante */}
                <h3
                  className="relative font-display text-[28px] sm:text-[34px] lg:text-[38px] text-paper leading-[1.02] tracking-[-0.028em] mb-5"
                  style={{ fontWeight: 900 }}
                >
                  <span className="relative inline-block">
                    {p.heading}
                    <span
                      aria-hidden
                      className="absolute left-0 bottom-[-0.08em] h-[2px] w-0 bg-paper transition-[width] duration-[800ms] ease-out-expo group-hover:w-full"
                    />
                  </span>
                </h3>

                <p className="text-body text-paper/85 leading-[1.65] mb-3 transition-colors duration-500 group-hover:text-paper">
                  {p.bodyA}
                </p>
                <p className="text-body text-paper/85/85 leading-[1.65] italic transition-colors duration-500 group-hover:text-paper/85">
                  {p.bodyB}
                </p>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Footer editorial — frase de fechamento da seção que prepara o Manifesto */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.slow,
            ease: EASE.out,
            delay: 0.2,
          }}
          className="mt-24 sm:mt-32 max-w-3xl mx-auto text-center"
        >
          <div className="h-px w-16 bg-paper/40 mx-auto mb-8" aria-hidden />
          <p
            className="font-display text-display-md sm:text-display-lg text-paper leading-[1.08] tracking-[-0.028em]"
            style={{ fontWeight: 900 }}
          >
            Nenhum desses problemas é técnico.
            <br />
            <span className="text-paper/55">Todos são culturais.</span>
          </p>
          <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 mt-8 font-medium">
            É por isso que a resposta não é uma ferramenta. É um método.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

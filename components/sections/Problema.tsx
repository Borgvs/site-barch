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

interface Problema {
  num: string;
  eyebrow: string;
  heading: string;
  bodyA: string;
  bodyB: string;
}

const problemas: Problema[] = [
  {
    num: "01",
    eyebrow: "Fragmentação",
    heading: "Cinco agendas. Uma só obra.",
    bodyA:
      "Arquiteto, construtora, engenheiro residente, paisagista e interiores costumam estar contratados como ilhas — cada um com cronograma, ferramenta e prestação de contas próprios.",
    bodyB:
      "O conflito que mora entre essas agendas é o que o cliente paga em retrabalho, aditivo e tempo.",
  },
  {
    num: "02",
    eyebrow: "Opacidade",
    heading: "A obra que ninguém vê.",
    bodyA:
      "A regra clássica do canteiro é informar quando o problema vira fato. O cliente descobre o atraso quando ele já aconteceu, o custo extra quando já foi gasto, a mudança de escopo quando já não há volta.",
    bodyB:
      "A confiança erodida nesse silêncio é um custo invisível — e o maior.",
  },
  {
    num: "03",
    eyebrow: "Adjetivos vazios",
    heading: "Premium é só uma palavra.",
    bodyA:
      "Premium, exclusivo, inovador, sofisticado — o vocabulário do alto padrão se gastou ao ponto de não dizer nada. Quando todo mundo promete o mesmo, o critério desaparece.",
    bodyB:
      "Sem critério declarado, decisão técnica vira aposta e o cliente fica refém do gosto de quem está no controle.",
  },
  {
    num: "04",
    eyebrow: "Casa-produto",
    heading: "Embalagem onde devia haver ecossistema.",
    bodyA:
      "A maior parte do mercado projeta a casa como embalagem do produto imobiliário: planta repetida, fachada que vende, ornamento que distrai do que importa.",
    bodyB:
      "A casa-como-ecossistema responde ao lugar, ao programa real e à passagem do tempo. Reprodução não cabe.",
  },
  {
    num: "05",
    eyebrow: "Cronograma de ficção",
    heading: "Promessa não é prazo.",
    bodyA:
      "Cronograma vendido na assinatura raramente sobrevive ao terceiro mês de obra. Atraso na estrutura empurra o acabamento, que empurra a entrega, que empurra a vida do cliente.",
    bodyB:
      "Quando o erro é descoberto no canteiro, custa contratos. Quando é descoberto antes da concretagem, custa horas.",
  },
  {
    num: "06",
    eyebrow: "Ausência de legado",
    heading: "Manchete não é referencial.",
    bodyA:
      "Projeto que existe para virar reportagem morre quando a reportagem se apaga. Falta densidade conceitual para o que se constrói durar como referência.",
    bodyB:
      "Construir referencial cultural — não só metragem entregue — é uma decisão tomada antes do primeiro traço, não depois da última inauguração.",
  },
];

export function Problema() {
  return (
    <section
      id="diagnostico"
      className="relative bg-paper py-section sm:py-sectionLg overflow-hidden scroll-mt-24"
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
            className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-6"
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
            className="font-display text-ink mb-6 leading-[0.92] tracking-[-0.034em]"
            style={{
              fontWeight: 900,
              fontSize: "clamp(42px, 9vw, 84px)",
            }}
          >
            Seis problemas
            <br />
            que o mercado
            <br />
            <span className="text-muted2">prefere não nomear.</span>
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
            A Barch não foi fundada para ser mais um agente da cadeia. Foi
            fundada para corrigir, de saída, o que essa cadeia produz quando
            cada agente opera isolado.
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
                {/* Linha horizontal superior (gesto editorial)
                    + número que escurece no hover */}
                <div className="flex items-baseline justify-between mb-6 sm:mb-8">
                  <span
                    className="font-display text-[44px] sm:text-[56px] leading-none tnum tracking-[-0.04em] transition-all duration-700"
                    style={{
                      fontWeight: 900,
                      background:
                        "linear-gradient(180deg, rgba(10,10,10,0.10) 0%, rgba(10,10,10,0.32) 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    aria-hidden
                  >
                    {p.num}
                  </span>
                  <div
                    className="h-px w-14 bg-ink/25 transition-all duration-700 ease-out-expo group-hover:w-32 group-hover:bg-ink"
                    aria-hidden
                  />
                </div>

                <p className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-4 transition-colors duration-500 group-hover:text-ink">
                  {p.eyebrow}
                </p>

                {/* Heading com underline animado na primeira frase relevante */}
                <h3
                  className="relative font-display text-[28px] sm:text-[34px] lg:text-[38px] text-ink leading-[1.02] tracking-[-0.028em] mb-5"
                  style={{ fontWeight: 900 }}
                >
                  <span className="relative inline-block">
                    {p.heading}
                    <span
                      aria-hidden
                      className="absolute left-0 bottom-[-0.08em] h-[2px] w-0 bg-ink transition-[width] duration-[800ms] ease-out-expo group-hover:w-full"
                    />
                  </span>
                </h3>

                <p className="text-body text-charcoal leading-[1.65] mb-3 transition-colors duration-500 group-hover:text-ink">
                  {p.bodyA}
                </p>
                <p className="text-body text-charcoal/85 leading-[1.65] italic transition-colors duration-500 group-hover:text-charcoal">
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
          <div className="h-px w-16 bg-ink/40 mx-auto mb-8" aria-hidden />
          <p
            className="font-display text-display-md sm:text-display-lg text-ink leading-[1.08] tracking-[-0.028em]"
            style={{ fontWeight: 900 }}
          >
            Nenhum desses problemas é técnico.
            <br />
            <span className="text-muted2">Todos são culturais.</span>
          </p>
          <p className="text-[11px] tracking-[0.32em] uppercase text-muted2 mt-8 font-medium">
            É por isso que a resposta não é uma ferramenta. É um método.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

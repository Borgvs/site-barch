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

const problemas = [
  {
    name: "Decisão única",
    role: "Acesso compartilhado",
    detail:
      "Toda decisão técnica versionada e acessível a quem decide, projeta e executa — pelo mesmo endereço, ao mesmo tempo. Nenhuma versão paralela rodando em paralelo.",
  },
  {
    name: "Detalhe no bolso",
    role: "Quem executa, vê",
    detail:
      "O detalhe aprovado chega ao mestre de obras pelo celular. O canteiro deixa de ser ilha e vira ponto vivo do projeto. Erro de leitura cai a zero.",
  },
  {
    name: "Erro antecipado",
    role: "Antes da concretagem",
    detail:
      "Centenas de verificações automáticas a cada entrega. Conflito que aparece no projeto custa horas. Conflito no canteiro custa contratos.",
  },
  {
    name: "Orçamento amarrado",
    role: "Ao avanço real",
    detail:
      "Quantitativos extraídos direto do projeto. Cronograma físico-financeiro acoplado ao que está sendo executado — não ao que foi prometido.",
  },
];

const principles = [
  {
    title: "Tecnologia como antídoto, não como espetáculo.",
    body: "O cliente não escolhe Barch pelas ferramentas que usamos. Escolhe porque o método elimina retrabalho antes da execução começar — e o resultado aparece no prazo, no custo e no cuidado.",
  },
  {
    title: "Coordenação antes da concretagem.",
    body: "Cada disciplina conversa com a outra no projeto único. Quando a estrutura sobe, a hidráulica e a elétrica já se conhecem. Quando o acabamento entra, ninguém quebra o que está pronto.",
  },
  {
    title: "Transparência sem vitrine.",
    body: "O cliente acompanha o que está sob controle e o que ainda não está. Sem maquiagem de relatório, sem surpresa de canteiro, sem a indústria milenar do esconder.",
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
            Obra em tempo real
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
            className="font-display text-ink leading-[0.94] tracking-[-0.028em] mb-7"
            style={{
              fontWeight: 900,
              fontSize: "clamp(42px, 9vw, 84px)",
            }}
          >
            A obra
            <br />
            que não esconde
            <br />
            <span className="text-muted2">nada.</span>
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
            Quem contrata obra sabe a regra do silêncio: o cliente descobre o
            problema tarde, o cronograma vira ficção, e o custo escala. A Barch
            inverteu o jogo: cada disciplina, cada decisão e cada medição vive
            num projeto único — visível,{" "}
            <span className="text-ink font-medium">verificado antes da concretagem</span>{" "}
            e acoplado ao que de fato está sendo executado.
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
                Projeto único · todas as disciplinas
              </p>
              <p className="text-[15px] text-paper/95 leading-tight font-medium max-w-md">
                Arquitetura, estrutura, instalações e custo conversando antes
                da execução começar
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
            Quatro problemas resolvidos
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {problemas.map((t, i) => (
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
              Decisões aparentemente técnicas
            </p>
            <h3
              className="font-display text-display-lg text-ink leading-[0.98] tracking-[-0.028em]"
              style={{ fontWeight: 900 }}
            >
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

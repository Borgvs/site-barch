"use client";

/**
 * Plataforma — As 4 camadas da plataforma proprietária Barch.
 *
 * Estrutura cap. 3 do Playbook BARCH:
 *   1. Canteiro (Builder + equipe em campo)
 *   2. Gestão (BARCH como GP)
 *   3. Investidor (Portal UHNW + capital calls + walkthrough BIM)
 *   4. Asset Pós-Entrega (Morador + manutenção preditiva + 7D)
 *
 * Analogia âncora: "A XP do real estate." Transparência como produto.
 *
 * Visual:
 *  - 4 camadas empilhadas verticalmente em desktop (uma por vez ganha foco)
 *  - Cada camada com ícone diagramático · nome · função · metric · audiência
 *  - Glass-card-anthra com hover state que ilumina a camada ativa
 *  - Linha vertical conectando as 4 (gesto de "stack")
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { LayerIcon } from "@/components/diagrams/LayerIcon";

interface Layer {
  num: string;
  name: string;
  audience: string;
  headline: string;
  body: string;
  bullets: string[];
  metric: { value: string; label: string };
  icon: "canteiro" | "gestao" | "investidor" | "asset";
}

const layers: Layer[] = [
  {
    num: "01",
    name: "Canteiro",
    icon: "canteiro",
    audience: "Builder · equipe em campo",
    headline: "O canteiro deixa de ser caixa-preta.",
    body:
      "Tablets em obra com modelo 4D atualizado diariamente. Captura 360° semanal georreferenciada. Computer vision detecta atraso ou desvio antes de virar problema.",
    bullets: [
      "Modelo 4D em tablet, atualizado a cada visita",
      "Vistorias 360° georreferenciadas semanais",
      "Computer vision flagra desvio antes do impacto",
    ],
    metric: { value: "Diário", label: "stream contínuo de dados" },
  },
  {
    num: "02",
    name: "Gestão",
    icon: "gestao",
    audience: "BARCH como GP · ops",
    headline: "Cronograma, custo e risco em sistema único.",
    body:
      "O que hoje vive disperso em Excel, WhatsApp e PDF passa a viver em sistema único. Agentes de IA monitoram desvios, alertam riscos e sugerem ações corretivas.",
    bullets: [
      "Cronograma físico-financeiro acoplado ao modelo",
      "Capital calls, permits, contratos versionados",
      "Agentes IA monitorando · alertando · sugerindo",
    ],
    metric: { value: "Único", label: "dashboard de controle estratégico" },
  },
  {
    num: "03",
    name: "Investidor",
    icon: "investidor",
    audience: "UHNW · LP · family office",
    headline: "Transparência sem promessa, com prova.",
    body:
      "O investidor que aporta vê a obra pelo celular, de qualquer lugar do mundo. Milestones contratuais com base auditável. Assistente IA gera relatórios sob demanda.",
    bullets: [
      "Drone semanal · walkthrough BIM · status capital calls",
      "Milestones contratuais auditáveis em tempo real",
      "Assistente IA · respostas instantâneas, relatórios on-demand",
    ],
    metric: { value: "Remota", label: "captação UHNW com transparência total" },
  },
  {
    num: "04",
    name: "Asset",
    icon: "asset",
    audience: "Morador · facility · síndico",
    headline: "O ativo continua vivo depois da chave.",
    body:
      "Modelo 7D entregue como ativo digital do imóvel. Manutenção preditiva. Manuais georreferenciados. Garantia rastreável. Agentes IA para facility management.",
    bullets: [
      "Modelo 7D · ativo digital do imóvel · 12 meses pós-obra",
      "Manutenção preditiva · alertas preventivos",
      "Comunicação com síndico, garantia, manuais",
    ],
    metric: { value: "Contínuo", label: "ciclo de vida vivo no sistema" },
  },
];

export function Plataforma() {
  return (
    <section
      id="plataforma"
      className="relative surface-anthra-cool py-section sm:py-sectionLg overflow-hidden scroll-mt-24"
      aria-label="Plataforma · 4 camadas da plataforma proprietária Barch"
    >
      <div className="container-page">
        {/* Header */}
        <div className="max-w-3xl mb-20 sm:mb-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6"
          >
            Plataforma proprietária · 4 camadas
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.08 }}
            className="font-display text-paper mb-8 leading-[0.92] tracking-[-0.034em]"
            style={{ fontWeight: 900, fontSize: "clamp(42px, 9vw, 84px)" }}
          >
            Cada tijolo,
            <br />
            <span className="text-paper/55">auditável.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.16 }}
            className="text-body-lg text-paper/85 leading-[1.55] max-w-2xl"
          >
            A plataforma proprietária Barch é sistema nativo, construído de
            dentro de 22 anos de prática. Quatro camadas integradas — uma por
            audiência —{" "}
            <span className="text-paper font-medium">
              cada disciplina conversando, cada decisão versionada, cada
              entrega rastreável
            </span>
            .
          </motion.p>
        </div>

        {/* 4 camadas empilhadas */}
        <div className="max-w-6xl mx-auto space-y-5">
          {layers.map((layer, i) => (
            <motion.article
              key={layer.num}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: DURATION.slow,
                delay: i * 0.08,
                ease: EASE.out,
              }}
              className="glass-card-anthra group relative p-8 sm:p-10 lg:p-12"
            >
              <div className="grid lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-10 items-start">
                {/* Esquerda: ícone vetorial + número + nome */}
                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                  <div className="flex items-center gap-4">
                    <LayerIcon kind={layer.icon} size={48} className="shrink-0" />
                    <span
                      className="font-display text-paper/30 leading-none tnum tracking-[-0.04em] transition-colors duration-500 group-hover:text-accent"
                      style={{
                        fontWeight: 900,
                        fontSize: "clamp(40px, 5vw, 56px)",
                      }}
                    >
                      {layer.num}
                    </span>
                  </div>
                  <h3
                    className="font-display text-paper leading-tight tracking-[-0.02em]"
                    style={{
                      fontWeight: 800,
                      fontSize: "clamp(24px, 3vw, 32px)",
                    }}
                  >
                    {layer.name}
                  </h3>
                  <p className="text-[10.5px] tracking-[0.18em] uppercase text-paper/45 font-medium">
                    {layer.audience}
                  </p>
                </div>

                {/* Centro: headline + body + bullets */}
                <div>
                  <h4
                    className="font-display text-paper text-[20px] sm:text-[24px] leading-[1.2] tracking-[-0.02em] mb-4"
                    style={{ fontWeight: 700 }}
                  >
                    {layer.headline}
                  </h4>
                  <p className="text-body-sm text-paper/75 leading-[1.65] mb-5">
                    {layer.body}
                  </p>
                  <ul className="space-y-2">
                    {layer.bullets.map((b, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-[12.5px] text-paper/65 leading-relaxed"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1 w-1 rounded-full bg-accent shrink-0"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direita: metric */}
                <div className="lg:text-right lg:min-w-[180px]">
                  <span
                    className="block font-display text-paper leading-none tnum tracking-[-0.02em]"
                    style={{
                      fontWeight: 800,
                      fontSize: "clamp(24px, 3vw, 32px)",
                    }}
                  >
                    {layer.metric.value}
                  </span>
                  <p className="text-[11px] text-paper/55 mt-2 lg:max-w-[160px] lg:ml-auto leading-snug">
                    {layer.metric.label}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Fechamento editorial · full section · sem card · integrado ao fluxo */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DURATION.contemplative, ease: EASE.out }}
          className="mt-32 sm:mt-40"
        >
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.1 }}
            className="font-display text-paper leading-[0.96] tracking-[-0.034em] max-w-5xl"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 7vw, 96px)",
            }}
          >
            Construir
            <br />
            <span className="text-paper/55">sem ruído</span>
            <span style={{ color: "#C45911" }}>.</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.25 }}
            className="text-body-lg text-paper/75 leading-[1.55] mt-10 max-w-2xl"
          >
            A plataforma é onde projeto, obra, capital e habitante se
            reencontram — em tempo real, com critério auditável, sem versão
            paralela rodando em paralelo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.35 }}
            className="mt-12"
          >
            <a
              href="https://painel.barch.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-build-beyond inline-flex"
            >
              <span>Acessar a plataforma</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

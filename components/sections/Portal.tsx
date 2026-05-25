"use client";

/**
 * Portal — Acesso ao painel do cliente.
 *
 * Refinements Apple-tier:
 *  - Mockup tipográfico minimalista no lugar do grid de cards
 *  - CTA magnético com seta animada
 *  - Tipografia mais respirável
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { MagneticLink } from "@/components/system/MagneticLink";
import { Tilt } from "@/components/system/Tilt";

const channels = [
  {
    title: "Curva S em tempo real",
    body: "Físico planejado e medido lado a lado, atualizado a cada visita.",
  },
  {
    title: "Vistorias 360°",
    body: "O canteiro inteiro navegável de qualquer cidade.",
  },
  {
    title: "Decisões em aberto",
    body: "Cada pendência com opção recomendada, critério e prazo.",
  },
  {
    title: "Diário e medições",
    body: "Registro diário, materiais recebidos e medições assinadas.",
  },
];

export function Portal() {
  return (
    <section
      id="portal"
      className="relative py-section sm:py-sectionLg bg-navy"
    >
      <div className="container-page">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-14 lg:gap-24 items-start">
          {/* Esquerda: headline + CTA */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: DURATION.base, ease: EASE.out }}
              className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6"
            >
              Portal do cliente
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
              className="font-display text-paper leading-[0.94] tracking-[-0.028em] mb-7"
              style={{
                fontWeight: 900,
                fontSize: "clamp(42px, 9vw, 84px)",
              }}
            >
              Cada obra
              <br />
              tem seu painel.
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
              className="text-body-lg text-paper/85 leading-[1.55] mb-10 max-w-xl"
            >
              Cliente, gestor de projeto e equipe de campo acessam o mesmo dado,
              ao mesmo tempo. Sem versão para impressionar — só o que importa
              para decidir, com critério e cronograma visível.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: DURATION.base,
                ease: EASE.out,
                delay: 0.24,
              }}
              className="flex flex-wrap items-center gap-5"
            >
              <MagneticLink
                href="https://painel.barch.com.br"
                external
                className="glass-cta group"
                strength={0.28}
                radius={95}
                ariaLabel="Acessar painel do cliente Barch"
              >
                <span>Acessar painel</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </MagneticLink>
              <span className="text-[11.5px] tracking-[0.04em] text-muted font-mono">
                painel.barch.com.br
              </span>
            </motion.div>
          </div>

          {/* Direita: glass card grid 2x2 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: DURATION.slow,
              ease: EASE.out,
              delay: 0.15,
            }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {channels.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION.base,
                  delay: 0.2 + i * 0.07,
                  ease: EASE.out,
                }}
              >
                <Tilt max={6} scale={1.02}>
                  <article className="glass-card group p-6 lg:p-7 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[10px] text-paper/55 tnum tracking-wider">
                        /{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ok" />
                      </span>
                    </div>
                    <h3
                      className="font-display text-[18px] leading-tight mb-2 tracking-[-0.02em] text-gradient-ink"
                      style={{ fontWeight: 700 }}
                    >
                      {c.title}
                    </h3>
                    <p className="text-[12.5px] text-paper/85 leading-[1.55]">
                      {c.body}
                    </p>
                  </article>
                </Tilt>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

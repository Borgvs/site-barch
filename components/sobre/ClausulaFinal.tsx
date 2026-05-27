"use client";

/**
 * ClausulaFinal — fechamento do Manifesto.
 *
 * Linguagem visual idêntica ao fechamento do Manifesto na home:
 *  - Glass-dark headline com hierarquia 3 níveis
 *  - Linha de fechamento scaleX
 *  - CTA magnético "Agendar conversa" com seta animada
 *
 * Faz a ponte de volta para conversão (rota /#contato).
 */

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";
import { MagneticLink } from "@/components/system/MagneticLink";

export function ClausulaFinal() {
  return (
    <section
      aria-label="Fechamento · agendar conversa"
      className="relative py-section sm:py-sectionLg"
    >
      <div className="container-tight text-center">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.contemplative,
            ease: EASE.out,
          }}
          className="h-px w-16 bg-paper/40 mx-auto mb-12 origin-center"
        />

        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.slow,
            ease: EASE.out,
            delay: 0.1,
          }}
          className="font-display leading-[0.96] tracking-[-0.028em] mb-3"
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 7vw, 88px)",
          }}
        >
          <span className="text-glass-dark">Build Beyond.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.base,
            ease: EASE.out,
            delay: 0.22,
          }}
          className="font-display leading-[1.05] tracking-[-0.022em] mt-6 mb-10"
          style={{
            fontWeight: 800,
            fontSize: "clamp(20px, 2.8vw, 36px)",
          }}
        >
          <span className="text-paper/85">Se você quer construir</span>{" "}
          <span className="text-muted2">sem ruído,</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.base,
            ease: EASE.out,
            delay: 0.34,
          }}
          className="inline-flex flex-col items-center gap-6"
        >
          <p
            className="font-display text-paper leading-tight tracking-[-0.018em]"
            style={{ fontWeight: 700, fontSize: "clamp(18px, 2.2vw, 26px)" }}
          >
            <span style={{ color: "#9C7259" }}>vamos conversar.</span>
          </p>

          <MagneticLink
            href="/#contato"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-paper text-anthraDeep font-medium text-[13.5px] tracking-tight transition-colors hover:bg-[#9C7259] hover:text-paper"
            strength={0.28}
            radius={120}
          >
            <span>Agendar conversa</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden
              className="transition-transform duration-500 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </MagneticLink>

          <p className="text-[10.5px] tracking-[0.32em] uppercase text-paper/45 mt-4 font-medium">
            O método · não a promessa
          </p>
        </motion.div>
      </div>
    </section>
  );
}

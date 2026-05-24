"use client";

/**
 * Visao — seção editorial cinematográfica.
 *
 * Aproveita o trabalho do HeroCinematic (image + Ken Burns + tipografia)
 * mas como SEÇÃO INTERNA do site, não como Hero. Usa hero-golden-hour
 * (mais "diurno") para diferenciar do HeroConstruction principal.
 *
 * Aparece entre PullQuote e Process — pausa visual densa antes do método.
 */

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

export function Visao() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1.0, 1.04]);

  return (
    <section
      ref={ref}
      className="relative h-[80vh] w-full overflow-hidden bg-ink"
      aria-label="Visão · projeto-tese"
    >
      {/* Imagem com parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y: imageY, scale: imageScale }}
      >
        <Image
          src="/hero/hero-golden-hour.webp"
          alt="Residência ao crepúsculo · projeto-tese Barch"
          fill
          quality={88}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Gradient dark overlay para legibilidade do texto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Conteúdo editorial — alinhado à esquerda */}
      <div className="relative z-10 h-full container-page flex items-center">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="glass-pill-dark mb-8"
            style={{
              fontSize: 11,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-warn" />
            Visão · obra-tese
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: DURATION.slow, ease: EASE.out, delay: 0.1 }}
            className="font-display text-paper leading-[0.92] tracking-[-0.04em] mb-8"
            style={{
              fontSize: "clamp(44px, 7vw, 96px)",
              fontWeight: 900,
            }}
          >
            <span className="text-gradient-moving">A casa</span>
            <br />
            <span className="italic font-light text-paper/72">
              que vai habitar
            </span>
            <br />
            <span className="text-gradient-moving">precede a forma.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.25 }}
            className="text-[15px] sm:text-[17px] text-paper/72 leading-[1.55] max-w-[480px]"
          >
            Cada projeto Barch começa muito antes do papel — na escuta do lugar,
            do programa, e do que o cliente ainda não conseguiu pôr em palavras.
            A obra-tese atual responde com dois volumes em concreto board-formed,
            balanço de quatro metros sobre espelho d&apos;água, e luz como último
            material.
          </motion.p>

          {/* Stats em grid */}
          <motion.dl
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-6 max-w-md"
          >
            {[
              { v: "5 850", l: "m² construídos" },
              { v: "18", l: "meses obra" },
              { v: "06.27", l: "entrega prevista" },
            ].map((s) => (
              <div key={s.l}>
                <dt
                  className="font-display text-[28px] sm:text-[32px] leading-none text-paper tnum tracking-[-0.03em] mb-2"
                  style={{ fontWeight: 700 }}
                >
                  {s.v}
                </dt>
                <dd className="text-[10px] tracking-[0.28em] uppercase text-paper/50 font-medium">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      {/* Crédito no canto inferior direito · institucional, sem identificar cliente */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DURATION.base, ease: EASE.out, delay: 0.6 }}
        className="absolute bottom-8 right-8 z-10 text-right"
      >
        <p className="text-[10px] tracking-[0.32em] uppercase text-paper/40 font-medium font-mono">
          Projeto-tese · em execução
        </p>
        <p className="text-[10px] text-paper/30 font-mono tnum mt-1">
          Sul do Brasil · 2026
        </p>
      </motion.div>
    </section>
  );
}

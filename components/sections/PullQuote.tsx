"use client";

/**
 * PullQuote — Controlling idea com word-by-word reveal scroll-linked.
 *
 * Refinements Apple-tier:
 *  - Word reveal: opacity 0.18 → 1 + blur 2px → 0 conforme scroll
 *  - Linha vertical decorativa que cresce do topo
 *  - Quote marks discretos como elementos tipográficos, não como ornament
 *  - Atribuição minimalista, sem avatar — só nome + role + linha
 */

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { EASE, DURATION } from "@/lib/motion";

const PHRASE =
  "Quase tudo que se constrói hoje sobrevive como forma e perde como sentido. A Barch existe para inverter essa equação — cada projeto é a articulação de um ecossistema, não a embalagem de um produto imobiliário.";

export function PullQuote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.88", "start 0.20"],
  });

  // Linha vertical lateral cresce com scroll
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  // Parallax sutil no background image
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const bgOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.06, 0.12, 0.06],
  );

  const words = PHRASE.split(" ");

  return (
    <section
      ref={ref}
      className="relative bg-softer py-section sm:py-sectionLg overflow-hidden"
      aria-label="Tese fundadora"
    >
      {/* Background sutil: interior em parallax · opacity baixa */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY, opacity: bgOpacity }}
      >
        <Image
          src="/hero/interior-living.webp"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-softer/40" />
      </motion.div>

      <div className="container-tight relative">
        {/* Linha vertical decorativa esquerda */}
        <div
          aria-hidden
          className="absolute left-0 top-0 hidden lg:block"
          style={{ height: "100%" }}
        >
          <motion.div
            className="w-px bg-ink/30"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: DURATION.base, ease: EASE.out }}
          className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium text-center mb-10"
        >
          Tese
        </motion.p>

        <blockquote className="relative">
          <p
            className="font-display text-display-md sm:text-display-lg leading-[1.10] tracking-[-0.028em] text-ink text-center max-w-3xl mx-auto"
            style={{ fontWeight: 900 }}
          >
            <span
              aria-hidden
              className="inline-block mr-1 text-muted2/40 align-top translate-y-[0.05em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              “
            </span>
            {words.map((word, i) => (
              <Word
                key={`${word}-${i}`}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
              >
                {word}
              </Word>
            ))}
            <span
              aria-hidden
              className="inline text-muted2/40 align-top translate-y-[0.05em]"
            >
              ”
            </span>
          </p>
        </blockquote>

        {/* Atribuição minimalista */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: DURATION.base,
            ease: EASE.out,
            delay: 0.3,
          }}
          className="flex flex-col items-center gap-3 mt-16"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: DURATION.slow,
              ease: EASE.out,
              delay: 0.4,
            }}
            className="h-px w-10 bg-ink/40 origin-center"
          />
          <p className="text-[13px] font-medium text-ink tracking-tight">
            Gustavo Alonso Borges
          </p>
          <p className="text-[11px] tracking-[0.28em] uppercase text-muted2 font-medium">
            Fundador · Arquiteto Urbanista
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  const filter = useTransform(progress, range, ["blur(2.5px)", "blur(0px)"]);
  return (
    <motion.span
      style={{ opacity, filter, willChange: "opacity, filter" }}
      className="inline-block mr-[0.22em]"
    >
      {children}
    </motion.span>
  );
}

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * PullQuote · controlling idea com chave de leitura.
 * Texto reveladio progressivo conforme scroll.
 * Concreto > abstrato: começa com observação, fecha com tese.
 */

const PHRASE =
  "Quase tudo que se constrói hoje sobrevive como forma e perde como sentido. A Barch existe para inverter essa equação: cada projeto é a articulação de um ecossistema — não a embalagem de um produto imobiliário.";

export function PullQuote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.25"],
  });

  const words = PHRASE.split(" ");

  return (
    <section
      ref={ref}
      className="relative bg-softer py-section sm:py-sectionLg overflow-hidden"
    >
      <div className="container-tight relative">
        <p className="font-display text-display-md sm:text-display-lg leading-[1.18] tracking-tight text-ink text-center max-w-3xl mx-auto">
          {words.map((word, i) => (
            <Word
              key={`${word}-${i}`}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
            >
              {word}
            </Word>
          ))}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-3 mt-14"
        >
          <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-paperPure font-display text-[15px] font-semibold shadow-elev-2">
            G
          </div>
          <div className="text-left">
            <p className="text-body-sm font-medium text-ink leading-tight">
              Gustavo Alonso Borges
            </p>
            <p className="text-caption text-muted">Fundador · Arquiteto Urbanista</p>
          </div>
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
  const opacity = useTransform(progress, range, [0.18, 1]);
  const filter = useTransform(progress, range, ["blur(2px)", "blur(0px)"]);
  return (
    <motion.span
      style={{ opacity, filter }}
      className="inline-block mr-[0.22em]"
    >
      {children}
    </motion.span>
  );
}

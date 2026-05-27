"use client";

/**
 * HeroSobre — entrada editorial do Manifesto.
 *
 * Linguagem:
 *  - Anthra body (idêntico ao home v9.5)
 *  - Hierarquia tipográfica 3 níveis (Manifesto-style)
 *  - Glass-fill BLACK + muted2 + clay no destaque-chave
 *  - Background com 2 clay glow orbs em parallax lento
 *  - Reveal sequencial Apple-tier
 *  - Eyebrow tracking expandido (matching home grammar)
 */

import { useParallax } from "@/lib/motion";

export function HeroSobre() {
  const orbARef = useParallax<HTMLDivElement>(0.35);
  const orbBRef = useParallax<HTMLDivElement>(-0.25);

  return (
    <section
      aria-label="Manifesto · entrada"
      className="relative pt-36 sm:pt-44 pb-20 sm:pb-28 overflow-hidden"
    >
      {/* Background · clay glow orbs em parallax · decoração sutil */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          ref={orbARef}
          className="absolute"
          style={{
            top: "8%",
            left: "8%",
            width: "560px",
            height: "560px",
            background:
              "radial-gradient(circle at center, rgba(156,114,89,0.20) 0%, rgba(156,114,89,0.07) 35%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          ref={orbBRef}
          className="absolute"
          style={{
            top: "20%",
            right: "5%",
            width: "440px",
            height: "440px",
            background:
              "radial-gradient(circle at center, rgba(242,242,242,0.06) 0%, transparent 65%)",
            filter: "blur(30px)",
          }}
        />
        {/* Faint grid texture · ancora o anthra */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container-page">
        <div className="max-w-5xl">
          <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-8 animate-fade-in-up">
            Manifesto · O que orienta
          </p>

          <h1
            className="font-display leading-[0.92] tracking-[-0.032em] mb-10 animate-fade-in-up"
            style={{
              fontWeight: 900,
              fontSize: "clamp(48px, 9vw, 112px)",
              animationDelay: "0.08s",
            }}
          >
            <span className="block text-glass-light">Não somos</span>
            <span
              className="block text-muted2 mt-2 sm:mt-3"
              style={{
                fontSize: "0.86em",
                fontWeight: 800,
                letterSpacing: "-0.024em",
              }}
            >
              um escritório.
            </span>
            <span
              className="block mt-2 sm:mt-3"
              style={{
                color: "#9C7259",
                fontSize: "1.04em",
                letterSpacing: "-0.034em",
              }}
            >
              Somos um sistema.
            </span>
          </h1>

          <p
            className="text-body-lg text-paper/70 leading-[1.6] max-w-2xl animate-fade-in-up"
            style={{ animationDelay: "0.18s" }}
          >
            A separação entre quem concebe, quem financia e quem executa é o que
            produz a mediocridade que toma conta do ambiente construído.{" "}
            <span className="text-paper/95 font-medium">
              A Barch existe porque essa fragmentação precisa acabar.
            </span>
          </p>

          {/* Linha de fechamento do hero */}
          <div
            className="mt-16 h-px w-24 bg-paper/30 animate-fade-in-up"
            style={{ animationDelay: "0.32s" }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

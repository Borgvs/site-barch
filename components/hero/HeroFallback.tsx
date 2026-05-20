"use client";

/**
 * HeroFallback — Hero estático elegante.
 *
 * Quando entra em jogo:
 *  - prefers-reduced-motion: reduce
 *  - viewport < 1024px (mobile/tablet)
 *  - GPU fraca / WebGL software
 *  - SSR / first paint enquanto a cena 3D não carrega
 *
 * Usa hero-blue-hour como background + tipografia editorial sobreposta.
 * Mantém o WOW sem custo de motion.
 */

import Image from "next/image";
import Link from "next/link";

interface HeroFallbackProps {
  initial?: boolean;
}

export function HeroFallback({ initial = false }: HeroFallbackProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ink text-paper flex items-center">
      {/* Background image */}
      <Image
        src="/hero/hero-blue-hour.webp"
        alt="Residência ao crepúsculo · projeto Barch"
        fill
        priority
        quality={88}
        sizes="100vw"
        className="object-cover"
      />

      {/* Gradient + vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Conteúdo */}
      <div className="container-page relative z-10 pt-28 pb-12 sm:pt-36 sm:pb-16">
        {!initial && (
          <span
            className="glass-pill-dark mb-8"
            style={{
              fontSize: 10.5,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-warn" />
            Venture builder arquitetônica
          </span>
        )}

        <h1
          className="font-display leading-[0.9] tracking-[-0.045em] mb-7"
          style={{
            fontSize: "clamp(48px, 11vw, 140px)",
            fontWeight: 900,
          }}
        >
          <span className="text-gradient-moving">Construir</span>
          <br />
          <span className="italic font-light text-paper/72">sem ruído.</span>
        </h1>

        <p className="text-[15px] sm:text-[17px] text-paper/70 leading-[1.55] max-w-[520px] mb-10">
          Projetamos, construímos e operamos residências e empreendimentos
          como um sistema único. Concepção, obra e gestão sob a mesma lógica.
        </p>

        {!initial && (
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/#contato" className="glass-cta group">
              <span>Agendar conversa</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://painel.barch.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-cta-ghost"
            >
              Portal do cliente
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

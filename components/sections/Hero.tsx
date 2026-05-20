"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Hero · LanderOS structure, identidade Barch.
 * Eyebrow chip · H1 grande serif · subtitle · CTA pill · ilustração 3D iso
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
      {/* Ambient warm glow no topo */}
      <div
        className="absolute inset-x-0 top-0 h-[80%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(162, 58, 31, 0.10), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="container-page relative">
        {/* Eyebrow chip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-7"
        >
          <span className="eyebrow-chip eyebrow-chip-warn">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            Venture Builder Arquitetônica e Urbana
          </span>
        </motion.div>

        {/* H1 — Fraunces serif, dramaticamente grande */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-display text-display-xl sm:text-display-2xl lg:text-display-3xl text-center text-ink mb-6 leading-[0.95] tracking-tight max-w-5xl mx-auto"
        >
          A liberdade de criar.
          <br />
          <span className="text-gradient-warn italic">A ousadia de transformar.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-body-lg text-charcoal text-center max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Projetamos, construímos e operamos empreendimentos como ecossistemas
          culturais, econômicos e espaciais integrados. Não seguimos tendências —
          criamos referenciais de valor.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.55,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20"
        >
          <Link href="/#contato" className="btn-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Agendar conversa
          </Link>
          <Link href="/#processo" className="btn-ghost">
            Conhecer o processo →
          </Link>
        </motion.div>

        {/* Ilustração: símbolo Barch como composição 3D simbólica */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.2,
            delay: 0.75,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative max-w-3xl mx-auto"
        >
          <HeroIllustration />
        </motion.div>

        {/* Trust strip */}
        <div className="mt-20 text-center">
          <p className="eyebrow mb-6">
            Repertório de atuação
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-charcoal text-body-sm font-medium opacity-60">
            <span>Airports</span>
            <span className="text-rule">·</span>
            <span>Institucional</span>
            <span className="text-rule">·</span>
            <span>Universidades de Música</span>
            <span className="text-rule">·</span>
            <span>Corporativo</span>
            <span className="text-rule">·</span>
            <span>Industrial</span>
            <span className="text-rule">·</span>
            <span>Alto Padrão</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Ilustração 3D simbólica · 4 blocos isométricos cremes flutuantes,
 * cada um com um glifo arquitetônico (símbolo Barch, planta, alçado, BIM).
 * Equivalente Barch dos cubos do LanderOS.
 */
function HeroIllustration() {
  return (
    <div className="relative aspect-[16/9] max-h-[500px] flex items-center justify-center">
      {/* Plataforma sombra elíptica */}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[60%] h-12 rounded-[50%] opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(14,14,14,0.4), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* 4 blocos isométricos */}
      <div className="relative w-full max-w-md flex items-end justify-center gap-3">
        <IsoBlock delay={0} y={20} icon="symbol" />
        <IsoBlock delay={0.15} y={0} icon="plan" highlight />
        <IsoBlock delay={0.3} y={30} icon="bim" />
        <IsoBlock delay={0.45} y={10} icon="elevation" />
      </div>
    </div>
  );
}

function IsoBlock({
  delay,
  y,
  icon,
  highlight,
}: {
  delay: number;
  y: number;
  icon: "symbol" | "plan" | "bim" | "elevation";
  highlight?: boolean;
}) {
  const icons: Record<typeof icon, React.ReactNode> = {
    symbol: (
      <svg viewBox="0 0 32 32" className="w-9 h-9">
        <circle cx="16" cy="16" r="14" fill={highlight ? "#A23A1F" : "#0e0e0e"} />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#FCFBF7"
          fontFamily="Inter, sans-serif"
        >
          b
        </text>
      </svg>
    ),
    plan: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="4" width="24" height="24" rx="2" />
        <path d="M4 14h24M14 4v24M14 14h6v8" />
      </svg>
    ),
    bim: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M16 4l12 6v12l-12 6L4 22V10z" />
        <path d="M16 4v28M4 10l12 6 12-6" />
      </svg>
    ),
    elevation: (
      <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 28h24M6 28V14l10-8 10 8v14M12 28v-8h8v8M14 14h4" />
      </svg>
    ),
  };

  return (
    <div
      className="relative animate-float"
      style={{
        animationDelay: `${delay}s`,
        transform: `translateY(${y}px)`,
      }}
    >
      {/* Top face */}
      <div
        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center"
        style={{
          background: highlight
            ? "linear-gradient(135deg, rgba(252,251,247,1) 0%, rgba(244, 216, 207, 0.4) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(247,245,238,0.9) 100%)",
          boxShadow: highlight
            ? "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(162,58,31,0.15), 0 24px 48px rgba(162,58,31,0.18)"
            : "inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 8px rgba(14,14,14,0.06), 0 20px 40px rgba(14,14,14,0.1)",
          transform: "rotateX(15deg) rotateY(-8deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={highlight ? "text-warn" : "text-charcoal"}
        >
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}

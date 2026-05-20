"use client";

import { motion } from "framer-motion";

/**
 * Stack · OrbAI-coded bento
 * "Why Choose Us" 3 cards com mockup interno cada
 * Off-white sólido, rounded XL, mockup visual no topo, título embaixo
 */
export function Stack() {
  return (
    <section id="stack" className="relative py-section sm:py-sectionLg">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <span className="eyebrow-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-charcoal">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
              </svg>
              BENEFÍCIOS
            </span>
          </div>
          <h2 className="font-display text-display-xl sm:text-display-2xl text-ink mb-5 leading-[0.98] tracking-tight">
            Por que Barch
          </h2>
          <p className="text-body text-charcoal max-w-xl mx-auto leading-relaxed">
            Plataforma própria + ofício humano: a única combinação que entrega clareza
            sem perder alma.
          </p>
        </div>

        {/* 3 cards bento */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mb-12">
          {/* Card 1 · Curva S real-time */}
          <BentoCard
            mockup={<CurvaSMockup />}
            title="Curva S ao Vivo"
            body="Cliente acompanha físico × planejado em tempo real pelo painel."
            delay={0}
          />

          {/* Card 2 · BIM + IA */}
          <BentoCard
            mockup={<BIMOrbitalMockup />}
            title="BIM × IA Integrados"
            body="Coordenação Revit + Forma + Solibri + 7 agentes Barch.OS."
            delay={0.08}
          />

          {/* Card 3 · Vistorias 360° */}
          <BentoCard
            mockup={<Tour360Mockup />}
            title="Canteiro Imersivo"
            body="Vistorias 360° Insta360 X5 navegáveis pelo cliente."
            delay={0.16}
          />
        </div>

        {/* Tag pills · padrões cobertos */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {[
            "Revit + Forma",
            "Solibri 70+ rules",
            "Finch 3D",
            "Pannellum 360°",
            "pgvector RAG",
            "Z-API WhatsApp",
          ].map((t) => (
            <span key={t} className="pill-tag">
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  mockup,
  title,
  body,
  delay = 0,
}: {
  mockup: React.ReactNode;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card-base card-hover overflow-hidden"
    >
      <div className="aspect-[5/4] bg-softer border-b border-rule/40 flex items-center justify-center p-8 relative overflow-hidden">
        {mockup}
      </div>
      <div className="p-7">
        <h3 className="font-display text-display-sm text-ink mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-body-sm text-charcoal leading-relaxed">{body}</p>
      </div>
    </motion.article>
  );
}

function CurvaSMockup() {
  return (
    <svg viewBox="0 0 240 160" className="w-full h-full max-w-[280px]">
      {/* Grid leve */}
      <defs>
        <pattern id="grid-curva" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" stroke="#e4e1d8" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>
      <rect width="240" height="160" fill="url(#grid-curva)" opacity="0.5" />
      {/* Eixos */}
      <line x1="20" y1="140" x2="220" y2="140" stroke="#bdbdb6" strokeWidth="1" />
      <line x1="20" y1="20" x2="20" y2="140" stroke="#bdbdb6" strokeWidth="1" />
      {/* Curva planejada */}
      <path
        d="M20 130 Q60 125 90 110 T160 50 T220 30"
        stroke="#9a9a93"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 3"
      />
      {/* Curva real */}
      <path
        d="M20 130 Q55 128 85 118 T140 80 T200 60"
        stroke="#0a0a0a"
        strokeWidth="2"
        fill="none"
      />
      {/* Pontos medições CAIXA */}
      {[60, 100, 140, 180].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={[125, 110, 80, 65][i]}
          r="3"
          fill="#A23A1F"
        />
      ))}
      {/* Label sutil */}
      <text x="120" y="155" textAnchor="middle" fontSize="9" fill="#9a9a93" fontFamily="Inter, sans-serif">
        físico × planejado
      </text>
    </svg>
  );
}

function BIMOrbitalMockup() {
  return (
    <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center">
      {/* Hub central · símbolo Barch */}
      <div className="absolute w-12 h-12 rounded-full bg-ink flex items-center justify-center text-paperPure font-display text-[18px] font-semibold z-10">
        b
      </div>
      {/* Órbitas */}
      {[44, 70, 96].map((r, oi) => (
        <div
          key={r}
          className="absolute rounded-full border border-rule/70"
          style={{
            width: r * 2,
            height: r * 2,
            animation: `spin-slow ${24 + oi * 6}s linear infinite ${oi % 2 ? "reverse" : "normal"}`,
          }}
        >
          {/* Dots na órbita */}
          {Array.from({ length: 3 + oi * 2 }).map((_, i, arr) => {
            const angle = (i / arr.length) * Math.PI * 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-charcoal/60"
                style={{
                  left: `calc(50% + ${x}px - 3px)`,
                  top: `calc(50% + ${y}px - 3px)`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Tour360Mockup() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full max-w-[240px]">
      <defs>
        <radialGradient id="sphere360" cx="42%" cy="38%">
          <stop offset="0%" stopColor="#FCFBF7" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </radialGradient>
      </defs>
      {/* Sphere */}
      <circle cx="100" cy="80" r="56" fill="url(#sphere360)" />
      {/* Meridianos */}
      {[25, 65, 105, 145].map((deg) => (
        <ellipse
          key={deg}
          cx="100"
          cy="80"
          rx="56"
          ry="16"
          fill="none"
          stroke="#FCFBF7"
          strokeWidth="0.6"
          opacity="0.45"
          transform={`rotate(${deg} 100 80)`}
        />
      ))}
      <ellipse cx="100" cy="80" rx="56" ry="56" fill="none" stroke="#FCFBF7" strokeWidth="0.7" opacity="0.55" />
      {/* Hotspot terracotta */}
      <circle cx="124" cy="68" r="4" fill="#A23A1F">
        <animate attributeName="r" values="3.5;5;3.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="78" cy="92" r="2.5" fill="#A23A1F" opacity="0.6" />
    </svg>
  );
}

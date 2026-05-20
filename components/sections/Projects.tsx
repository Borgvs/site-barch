"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Project {
  slug: string;
  name: string;
  year: string;
  typology: string;
  description: string;
  image?: string;
  isFeatured?: boolean;
}

const projects: Project[] = [
  {
    slug: "silva",
    name: "Residência Família Silva",
    year: "2026",
    typology: "Residencial Alto Padrão",
    description:
      "Casa unifamiliar com piscina, climatização VRF, elevador interno e financiamento CAIXA. Painel cliente em tempo real, BIM coordenado, vistorias 360° pela Insta360 X5.",
    isFeatured: true,
  },
  {
    slug: "airport-template",
    name: "Aeroporto · Estudo Conceitual",
    year: "2024",
    typology: "Infraestrutura Aeroportuária",
    description: "Projeto conceitual de terminal de passageiros.",
  },
  {
    slug: "music-uni",
    name: "Universidade de Música",
    year: "2022",
    typology: "Institucional · Cultural",
    description: "Estudo acústico e modulação espacial.",
  },
  {
    slug: "corp-hq",
    name: "Sede Corporativa Industrial",
    year: "2021",
    typology: "Corporativo · Industrial",
    description: "Galpão administrativo + plataforma fabril.",
  },
];

export function Projects() {
  const [activeSlug, setActiveSlug] = useState(projects[0].slug);
  const active = projects.find((p) => p.slug === activeSlug) ?? projects[0];

  return (
    <section id="projetos" className="relative py-section">
      <div className="container-page">
        {/* Header */}
        <div className="flex justify-center mb-5">
          <span className="eyebrow-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-warn">
              <path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5L12 14.5 7 17.2l1-5.5-4-3.9 5.5-.8z" />
            </svg>
            PROJETOS
          </span>
        </div>
        <h2 className="font-display text-display-lg sm:text-display-xl text-center text-ink mb-5 leading-[1.05] max-w-3xl mx-auto">
          Cada projeto é uma{" "}
          <span className="italic text-gradient-warn">resposta</span>.
        </h2>
        <p className="text-body-lg text-charcoal text-center max-w-2xl mx-auto leading-relaxed mb-16">
          Não temos estilo. Temos método. Cada obra responde ao seu lugar, sua
          gente, sua restrição — e isso é o que a torna impossível de copiar.
        </p>

        {/* Layout assimétrico: lista esquerda + featured direita */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 items-start">
          {/* Lista */}
          <div className="flex flex-col gap-2">
            {projects.map((p, i) => (
              <motion.button
                key={p.slug}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onMouseEnter={() => setActiveSlug(p.slug)}
                onFocus={() => setActiveSlug(p.slug)}
                type="button"
                className={cn(
                  "text-left rounded-glass px-6 py-5 transition-all duration-400 ease-apple focus-ring",
                  "flex items-center justify-between gap-4 group",
                  activeSlug === p.slug
                    ? "glass-deep shadow-elev-3 scale-[1.01]"
                    : "border border-transparent hover:border-rule/40 hover:bg-glass-100"
                )}
              >
                <div className="min-w-0">
                  <div
                    className={cn(
                      "font-display text-display-sm leading-tight mb-1 truncate transition-colors duration-250",
                      activeSlug === p.slug ? "text-ink" : "text-charcoal"
                    )}
                  >
                    {p.name}
                  </div>
                  <p className="text-caption text-muted2 uppercase tracking-wider">
                    {p.typology}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-body-sm tnum tabular-nums transition-colors duration-250",
                    activeSlug === p.slug ? "text-warn font-semibold" : "text-muted2"
                  )}
                >
                  {p.year}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Featured card */}
          <motion.div
            key={active.slug}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass-deep rounded-glass overflow-hidden relative"
          >
            {/* Imagem placeholder · arquitetura ambient gradient + símbolo */}
            <div
              className="aspect-[4/3] relative flex items-center justify-center overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #36454F 0%, #1a1a1a 60%, #0e0e0e 100%)",
              }}
            >
              {/* Padrão geométrico arquitetônico */}
              <svg
                viewBox="0 0 400 300"
                className="absolute inset-0 w-full h-full opacity-20"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <pattern id="grid-1" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0H0V40" stroke="#FCFBF7" strokeWidth="0.5" fill="none" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-1)" />
                <path
                  d="M50 250L100 200L150 220L200 100L250 180L300 140L350 200L400 160"
                  stroke="#A23A1F"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
              {/* Símbolo Barch como watermark */}
              <div className="relative z-10 text-paperPure/30 font-display text-[120px] font-bold leading-none">
                b
              </div>
              {active.isFeatured && (
                <span className="absolute top-5 left-5 z-20 chip glass !text-paperPure/90 !border-paperPure/20 px-3 py-1.5 rounded-pill text-eyebrow uppercase font-semibold tracking-wider">
                  Obra em andamento
                </span>
              )}
            </div>
            {/* Footer info sobre imagem */}
            <div className="p-8">
              <p className="eyebrow text-warn mb-3">{active.typology}</p>
              <h3 className="font-display text-display-md text-ink mb-3 leading-tight">
                {active.name}
              </h3>
              <p className="text-body text-charcoal leading-relaxed">
                {active.description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

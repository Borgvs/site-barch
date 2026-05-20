"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/projects";

// Mapeia os projetos compartilhados para o shape leve da home
const items = projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  year: p.year,
  typology: p.typology,
  description: p.scopeShort,
  isFeatured: p.isFeatured,
}));

export function Projects() {
  const [activeSlug, setActiveSlug] = useState(items[0].slug);
  const active = items.find((p) => p.slug === activeSlug) ?? items[0];

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
            {items.map((p, i) => (
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
              <p className="text-body text-charcoal leading-relaxed mb-5">
                {active.description}
              </p>
              <Link
                href={`/projetos/${active.slug}`}
                className="inline-flex items-center gap-2 text-body-sm font-semibold text-warn hover:text-warn2 transition-colors duration-250 focus-ring rounded-md"
              >
                Ver projeto completo →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* CTA · ver todos */}
        <div className="flex justify-center mt-12">
          <Link href="/projetos" className="btn-secondary">
            Ver repertório completo →
          </Link>
        </div>
      </div>
    </section>
  );
}

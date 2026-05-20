"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/lib/projects";

const items = projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  year: p.year,
  typology: p.typology,
  description: p.scopeShort,
  isFeatured: p.isFeatured,
}));

export function Projects() {
  return (
    <section id="projetos" className="relative py-section sm:py-sectionLg">
      <div className="container-page">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <span className="eyebrow-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-charcoal">
                <path d="M12 2l2.5 5 5.5.8-4 3.9 1 5.5L12 14.5 7 17.2l1-5.5-4-3.9 5.5-.8z" />
              </svg>
              PROJETOS
            </span>
          </div>
          <h2 className="font-display text-display-xl sm:text-display-2xl text-ink mb-5 leading-[0.98] tracking-tight">
            Cada projeto é resposta.
          </h2>
          <p className="text-body text-charcoal max-w-xl mx-auto leading-relaxed">
            Sem estilo, com método. Cada obra responde ao seu lugar, sua gente.
          </p>
        </div>

        {/* Lista vertical de projetos */}
        <div className="max-w-3xl mx-auto">
          {items.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <Link
                href={`/projetos/${p.slug}`}
                className="group flex items-center justify-between gap-6 py-6 border-b border-rule/60 hover:border-ink/30 transition-all duration-400 ease-apple focus-ring rounded-md px-2"
              >
                <div className="flex items-center gap-5 min-w-0">
                  <span className="text-eyebrow uppercase tracking-wider text-muted2 tnum w-12 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="font-display text-display-sm text-ink leading-tight mb-1 group-hover:text-warn transition-colors duration-250">
                      {p.name}
                    </div>
                    <p className="text-caption text-muted uppercase tracking-wider">
                      {p.typology}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-body-sm text-muted2 tnum hidden sm:block">
                    {p.year}
                  </span>
                  <span className="text-ink opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/projetos" className="btn-ghost">
            Ver repertório completo
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

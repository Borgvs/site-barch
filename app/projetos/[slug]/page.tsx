import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  getProjectBySlug,
  getAllProjectSlugs,
  projects,
  STATUS_LABELS,
} from "@/lib/projects";

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.scopeShort,
  };
}

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  // Próximo projeto (para nav inferior)
  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <Nav />
      <main className="pt-32 sm:pt-40 pb-section">
        {/* Breadcrumb */}
        <div className="container-page mb-10">
          <Link
            href="/projetos"
            className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-warn transition-colors duration-250 focus-ring rounded-md"
          >
            ← Repertório
          </Link>
        </div>

        {/* Hero do projeto */}
        <section className="container-tight mb-20">
          <div className="flex items-center flex-wrap gap-2 mb-7">
            <span className="eyebrow text-warn">{project.typology}</span>
            <span className="text-rule">·</span>
            <span className="eyebrow text-muted2 tnum">{project.year}</span>
            <span className="text-rule">·</span>
            <span
              className={
                "px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-[0.08em] " +
                (project.status === "em-andamento"
                  ? "bg-warn/10 text-warn border border-warn/20"
                  : "bg-charcoal/5 text-charcoal border border-charcoal/15")
              }
            >
              {STATUS_LABELS[project.status]}
            </span>
            {project.isConfidential && (
              <>
                <span className="text-rule">·</span>
                <span className="text-eyebrow uppercase tracking-wider text-muted">
                  sob NDA
                </span>
              </>
            )}
          </div>
          <h1 className="font-display text-display-xl sm:text-display-2xl text-ink leading-[0.98] tracking-tight mb-7">
            {project.name}
          </h1>
          <p className="text-body-lg text-charcoal leading-relaxed max-w-2xl">
            {project.scopeLong}
          </p>
        </section>

        {/* Imagem hero placeholder · gradient arquitetônico */}
        <section className="container-page mb-20">
          <div
            className="rounded-glass aspect-[16/8] sm:aspect-[16/7] relative overflow-hidden shadow-elev-4"
            style={{
              background:
                "linear-gradient(135deg, #36454F 0%, #1a1a1a 60%, #0e0e0e 100%)",
            }}
          >
            <svg
              viewBox="0 0 800 400"
              className="absolute inset-0 w-full h-full opacity-25"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern
                  id={`grid-${project.slug}`}
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M40 0H0V40"
                    stroke="#FCFBF7"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${project.slug})`} />
              <path
                d="M0 340L80 280L160 300L240 200L320 240L400 160L480 220L560 180L640 240L720 200L800 230"
                stroke="#A23A1F"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />
              <path
                d="M0 360L80 330L160 340L240 280L320 300L400 240L480 270L560 250L640 285L720 270L800 290"
                stroke="#FCFBF7"
                strokeWidth="1"
                strokeDasharray="4 4"
                fill="none"
                opacity="0.5"
              />
            </svg>
            <div className="absolute inset-0 flex items-end p-8 sm:p-12">
              <div className="font-display text-display-2xl sm:text-display-3xl text-paperPure/15 font-bold leading-none">
                b
              </div>
            </div>
            <div className="absolute top-6 right-6 chip-status chip-glass">
              {STATUS_LABELS[project.status]}
            </div>
          </div>
        </section>

        {/* Facts + Métricas */}
        <section className="container-page mb-20">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
            {/* Facts box */}
            <div className="glass rounded-glass p-8">
              <p className="eyebrow mb-6">Ficha</p>
              <dl className="space-y-4">
                {project.facts.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-baseline justify-between gap-4 pb-3 border-b border-rule/40 last:border-0 last:pb-0"
                  >
                    <dt className="text-body-sm text-muted">{f.label}</dt>
                    <dd className="text-body font-semibold text-ink text-right tnum">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Métricas · grid */}
            <div>
              <p className="eyebrow mb-6">Estado atual</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {project.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="glass-deep rounded-card p-6"
                  >
                    <p className="eyebrow text-muted2 mb-2.5">{m.label}</p>
                    <p className="font-display text-display-lg text-gradient-warn tnum leading-none">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chapters · narrativa do projeto */}
        <section className="container-tight mb-20">
          <p className="eyebrow mb-3">Camadas do projeto</p>
          <h2 className="font-display text-display-lg text-ink mb-12 max-w-2xl leading-[1.05]">
            Por dentro do que importa.
          </h2>
          <div className="space-y-12">
            {project.chapters.map((c, i) => (
              <article key={c.title} className="grid sm:grid-cols-[80px_1fr] gap-6 sm:gap-10">
                <span className="font-display text-display-md text-gradient-warn tnum leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-display-sm text-ink mb-3 leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-body text-charcoal leading-relaxed">
                    {c.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA + link painel se em andamento */}
        {project.status === "em-andamento" && project.slug === "silva" && (
          <section className="container-page mb-20">
            <div className="glass-deep rounded-glass p-10 sm:p-14 text-center relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(162, 58, 31, 0.08), transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <span className="eyebrow-chip eyebrow-chip-warn mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
                  ACOMPANHAMENTO AO VIVO
                </span>
                <h3 className="font-display text-display-lg text-ink mb-4 leading-tight">
                  Esta obra tem painel próprio.
                </h3>
                <p className="text-body text-charcoal max-w-xl mx-auto mb-7 leading-relaxed">
                  Curva S em tempo real, fotos do canteiro, decisões em aberto,
                  medições CAIXA. Acesso via login do cliente.
                </p>
                <a
                  href="https://painel.barch.com.br/obra/silva"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Abrir painel.barch.com.br ↗
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Nav inferior · próximo projeto */}
        <section className="container-page">
          <Link
            href={`/projetos/${next.slug}`}
            className="block group glass rounded-glass p-8 hover-lift focus-ring"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="eyebrow text-muted2 mb-2">Próximo projeto</p>
                <h3 className="font-display text-display-sm sm:text-display-md text-ink leading-tight group-hover:text-warn transition-colors duration-250">
                  {next.name}
                </h3>
                <p className="text-body-sm text-charcoal/70 mt-1">
                  {next.typology} · {next.year}
                </p>
              </div>
              <span className="text-display-md text-warn opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                →
              </span>
            </div>
          </Link>
        </section>
      </main>
      <Footer />

      <style>{`
        .chip-status {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 9999px;
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .chip-glass {
          background: rgba(252, 251, 247, 0.85);
          backdrop-filter: blur(8px);
          color: #0e0e0e;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
}

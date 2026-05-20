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
  return { title: project.name, description: project.scopeShort };
}

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <Nav />
      <main className="pt-28 sm:pt-36 pb-section">
        {/* Breadcrumb */}
        <div className="container-page mb-10">
          <Link
            href="/projetos"
            className="inline-flex items-center gap-2 text-body-sm text-muted hover:text-ink transition-colors duration-250 focus-ring rounded-md"
          >
            ← Repertório
          </Link>
        </div>

        {/* Hero do projeto */}
        <section className="container-tight mb-16">
          <div className="flex items-center flex-wrap gap-2 mb-7">
            <span className="eyebrow text-muted">{project.typology}</span>
            <span className="text-rule">·</span>
            <span className="eyebrow text-muted2 tnum">{project.year}</span>
            <span className="text-rule">·</span>
            <span
              className={
                project.status === "em-andamento"
                  ? "px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-[0.08em] bg-warn/10 text-warn border border-warn/20"
                  : "px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-[0.08em] bg-charcoal/5 text-charcoal border border-charcoal/15"
              }
            >
              {STATUS_LABELS[project.status]}
            </span>
            {project.isConfidential && (
              <>
                <span className="text-rule">·</span>
                <span className="text-eyebrow uppercase tracking-wider text-muted2">NDA</span>
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

        {/* Hero visual · gradient escuro com grid */}
        <section className="container-page mb-20">
          <div
            className="rounded-glass aspect-[16/8] sm:aspect-[16/7] relative overflow-hidden shadow-elev-4"
            style={{
              background: "linear-gradient(135deg, #36454F 0%, #1a1a1a 60%, #0a0a0a 100%)",
            }}
          >
            <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-25" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id={`grid-${project.slug}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" stroke="#FCFBF7" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${project.slug})`} />
              <path
                d="M0 340L80 280L160 300L240 200L320 240L400 160L480 220L560 180L640 240L720 200L800 230"
                stroke="#A23A1F"
                strokeWidth="2"
                fill="none"
                opacity="0.75"
              />
            </svg>
            <div className="absolute inset-0 flex items-end p-8 sm:p-12">
              <div className="font-display text-display-2xl sm:text-[160px] text-paperPure/15 font-semibold leading-none tracking-tighter">
                b
              </div>
            </div>
          </div>
        </section>

        {/* Facts + Métricas */}
        <section className="container-page mb-20">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16">
            <div className="card-base p-8">
              <p className="eyebrow mb-6">Ficha</p>
              <dl className="space-y-4">
                {project.facts.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-4 pb-3 border-b border-rule/60 last:border-0 last:pb-0">
                    <dt className="text-body-sm text-muted">{f.label}</dt>
                    <dd className="text-body font-medium text-ink text-right tnum">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="eyebrow mb-6">Estado atual</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {project.metrics.map((m) => (
                  <div key={m.label} className="card-base p-6">
                    <p className="eyebrow text-muted2 mb-2.5">{m.label}</p>
                    <p className="font-display text-display-lg text-ink tnum leading-none tracking-tight">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Chapters */}
        <section className="container-tight mb-20">
          <p className="eyebrow mb-3">Camadas do projeto</p>
          <h2 className="font-display text-display-lg text-ink mb-12 max-w-2xl leading-[1.05] tracking-tight">
            Por dentro do que importa.
          </h2>
          <div className="space-y-12">
            {project.chapters.map((c, i) => (
              <article key={c.title} className="grid sm:grid-cols-[80px_1fr] gap-6 sm:gap-10">
                <span className="font-display text-display-md text-muted2 tnum leading-none tracking-tight">
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

        {/* Painel link */}
        {project.status === "em-andamento" && project.slug === "silva" && (
          <section className="container-page mb-20">
            <div className="card-base p-10 sm:p-14 text-center">
              <span className="eyebrow-chip mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
                ACOMPANHAMENTO AO VIVO
              </span>
              <h3 className="font-display text-display-lg text-ink mb-4 leading-tight tracking-tight">
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
                className="btn-ink"
              >
                Abrir painel.barch.com.br
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </section>
        )}

        {/* Nav próximo */}
        <section className="container-page">
          <Link
            href={`/projetos/${next.slug}`}
            className="block group card-base card-hover p-8 focus-ring"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="eyebrow text-muted2 mb-2">Próximo projeto</p>
                <h3 className="font-display text-display-sm sm:text-display-md text-ink leading-tight tracking-tight group-hover:text-warn transition-colors duration-250">
                  {next.name}
                </h3>
                <p className="text-body-sm text-muted mt-1">
                  {next.typology} · {next.year}
                </p>
              </div>
              <span className="text-display-md text-ink opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                →
              </span>
            </div>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

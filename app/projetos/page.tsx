import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { projects, STATUS_LABELS } from "@/lib/projects";

export const metadata = {
  title: "Projetos",
  description:
    "Repertório Barch · residencial alto padrão, infraestrutura, cultural, corporativo.",
};

export default function ProjetosPage() {
  return (
    <>
      <Nav />
      <main className="pt-36 sm:pt-44 pb-section">
        {/* Header */}
        <section className="container-tight mb-20 text-center">
          <div className="flex justify-center mb-7">
            <span className="eyebrow-chip">
              <span className="w-1.5 h-1.5 rounded-full bg-warn" />
              REPERTÓRIO
            </span>
          </div>
          <h1 className="font-display text-display-xl sm:text-display-2xl text-ink mb-7 leading-[0.98] tracking-tight">
            Cada projeto é resposta.
          </h1>
          <p className="text-body-lg text-charcoal leading-relaxed max-w-2xl mx-auto">
            Sem estilo, com método. Cada obra responde ao seu lugar, sua gente,
            sua restrição.
          </p>
        </section>

        {/* Cards de projetos */}
        <section className="container-page">
          <div className="space-y-5 max-w-5xl mx-auto">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/projetos/${p.slug}`}
                className="block focus-ring rounded-card group"
              >
                <article
                  className="card-base card-hover p-8 sm:p-10 grid lg:grid-cols-[1.3fr_1fr] gap-8 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className="eyebrow text-muted">{p.typology}</span>
                      <span className="text-rule">·</span>
                      <span className="eyebrow text-muted2 tnum">{p.year}</span>
                      {p.isConfidential && (
                        <>
                          <span className="text-rule">·</span>
                          <span className="text-eyebrow uppercase tracking-wider text-muted2">
                            NDA
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-display-md sm:text-display-lg text-ink leading-tight mb-4 tracking-tight group-hover:text-warn transition-colors duration-300">
                      {p.name}
                    </h2>
                    <p className="text-body text-charcoal leading-relaxed mb-6 max-w-xl">
                      {p.scopeShort}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={
                          p.status === "em-andamento"
                            ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-[0.08em] bg-warn/10 text-warn border border-warn/20"
                            : "inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-semibold uppercase tracking-[0.08em] bg-charcoal/5 text-charcoal border border-charcoal/15"
                        }
                      >
                        <span
                          className={
                            p.status === "em-andamento"
                              ? "w-1.5 h-1.5 rounded-full bg-warn animate-pulse"
                              : "w-1.5 h-1.5 rounded-full bg-charcoal/40"
                          }
                        />
                        {STATUS_LABELS[p.status]}
                      </span>
                      <span className="text-body-sm text-muted2 group-hover:text-ink transition-colors duration-250">
                        Ver projeto →
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 self-center">
                    {p.facts.slice(0, 4).map((f) => (
                      <div
                        key={f.label}
                        className="bg-softer rounded-cardSm border border-rule/50 p-4"
                      >
                        <p className="eyebrow text-muted2 mb-1.5">{f.label}</p>
                        <p className="font-display text-display-sm text-ink leading-tight tnum tracking-tight">
                          {f.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <p className="text-center text-body-sm text-muted mt-16 max-w-xl mx-auto">
            Projetos sob NDA não detalhados publicamente. Repertório completo
            disponível mediante conversa inicial.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

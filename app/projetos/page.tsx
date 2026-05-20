import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { projects, STATUS_LABELS } from "@/lib/projects";

export const metadata = {
  title: "Projetos",
  description:
    "Repertório Barch · residencial alto padrão, infraestrutura, cultural, corporativo. Cada projeto é uma resposta — não uma reprodução.",
};

export default function ProjetosPage() {
  return (
    <>
      <Nav />
      <main className="pt-40 sm:pt-48 pb-section">
        {/* Header */}
        <section className="container-tight mb-20 text-center">
          <div className="flex justify-center mb-7">
            <span className="eyebrow-chip eyebrow-chip-warn">
              <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
              REPERTÓRIO
            </span>
          </div>
          <h1 className="font-display text-display-xl sm:text-display-2xl text-ink mb-7 leading-[0.98] tracking-tight">
            Cada projeto é{" "}
            <span className="italic text-gradient-warn">uma resposta</span>.
          </h1>
          <p className="text-body-lg text-charcoal leading-relaxed max-w-2xl mx-auto">
            Sem estilo, com método. Cada obra responde ao seu lugar, sua gente,
            sua restrição. Lista atualizada conforme entregas e estudos
            avançam.
          </p>
        </section>

        {/* Lista de projetos · cards grandes alternados */}
        <section className="container-page">
          <div className="space-y-5">
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                href={`/projetos/${p.slug}`}
                className="block focus-ring rounded-glass"
              >
                <article
                  className="glass-deep rounded-glass p-8 sm:p-10 grid lg:grid-cols-[1.3fr_1fr] gap-8 hover-lift relative overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Conteúdo */}
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                      <span className="eyebrow text-warn">{p.typology}</span>
                      <span className="text-rule">·</span>
                      <span className="eyebrow text-muted2 tnum">{p.year}</span>
                      {p.isConfidential && (
                        <>
                          <span className="text-rule">·</span>
                          <span className="text-eyebrow uppercase tracking-wider text-charcoal/60">
                            sob NDA
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="font-display text-display-md sm:text-display-lg text-ink leading-tight mb-4">
                      {p.name}
                    </h2>
                    <p className="text-body text-charcoal leading-relaxed mb-6 max-w-xl">
                      {p.scopeShort}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={
                          "chip-status " +
                          (p.status === "em-andamento"
                            ? "chip-warn-soft"
                            : "chip-neutral")
                        }
                      >
                        <span
                          className={
                            "w-1.5 h-1.5 rounded-full " +
                            (p.status === "em-andamento"
                              ? "bg-warn animate-pulse"
                              : "bg-charcoal/40")
                          }
                        />
                        {STATUS_LABELS[p.status]}
                      </span>
                      <span className="text-body-sm text-charcoal/60 group-hover:text-warn transition-colors duration-250">
                        Ver projeto →
                      </span>
                    </div>
                  </div>

                  {/* Mini-facts */}
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 self-center">
                    {p.facts.slice(0, 4).map((f) => (
                      <div
                        key={f.label}
                        className="bg-paperPure/60 backdrop-blur-sm rounded-card border border-rule/40 p-4"
                      >
                        <p className="eyebrow text-muted2 mb-1.5">{f.label}</p>
                        <p className="font-display text-display-sm text-ink leading-tight tnum">
                          {f.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Nota final */}
          <p className="text-center text-body-sm text-muted mt-16 max-w-xl mx-auto italic">
            Projetos sob NDA não detalhados publicamente. Repertório completo
            disponível mediante conversa inicial.
          </p>
        </section>
      </main>
      <Footer />

      <style>{`
        .chip-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .chip-warn-soft {
          background: rgba(162, 58, 31, 0.08);
          color: #A23A1F;
          border: 1px solid rgba(162, 58, 31, 0.18);
        }
        .chip-neutral {
          background: rgba(54, 69, 79, 0.06);
          color: #36454F;
          border: 1px solid rgba(54, 69, 79, 0.14);
        }
      `}</style>
    </>
  );
}

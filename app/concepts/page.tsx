import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Concepts",
  description:
    "Experimentos públicos da Barch: protótipos e vitrines em construção, fora do cânone do site e do painel.",
  openGraph: {
    title: "Concepts · Barch",
    description: "Experimentos públicos da Barch, fora do cânone.",
    url: "/concepts",
  },
};

type ConceptState = "experimento";

interface Concept {
  slug: string;
  name: string;
  line: string;
  date: string;
  state: ConceptState;
}

const STATE_LABEL: Record<ConceptState, string> = {
  experimento: "Experimento",
};

const concepts: Concept[] = [
  {
    slug: "terreno",
    name: "Terreno",
    line:
      "Análise padronizada de terreno: diagnóstico, potencial de uso e negócio, valor da terra, vistoria e metodologia.",
    date: "02/10/2026",
    state: "experimento",
  },
];

export default function ConceptsPage() {
  return (
    <>
      <Nav />
      <main
        data-nav-light="true"
        className="min-h-screen bg-paper px-6 pt-32 pb-section"
      >
        <div className="container-page">
          <header className="max-w-3xl mb-16 sm:mb-20">
            <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-8">
              Concepts · Experimentos
            </p>
            <h1 className="font-display text-display-2xl sm:text-display-3xl text-ink mb-8 leading-[0.94] tracking-[-0.03em]">
              O que está
              <br />
              <span className="text-muted2">em experimento.</span>
            </h1>
            <p className="text-body-lg text-charcoal leading-relaxed max-w-xl">
              Protótipos e vitrines públicas em construção. Nada aqui é
              diretriz: o que vale está no site e no painel.
            </p>
          </header>

          <ol className="border-t border-rule" aria-label="Concepts">
            {concepts.map((c, i) => (
              <li key={c.slug} className="border-b border-rule">
                <Link
                  href={`/concepts/${c.slug}`}
                  className="group grid grid-cols-[56px_1fr] sm:grid-cols-[96px_1fr_auto] gap-6 sm:gap-10 items-start py-8 sm:py-10 transition-colors duration-300"
                >
                  <span className="font-display tnum block leading-none text-muted2 group-hover:text-ink transition-colors duration-300 text-[32px] sm:text-[44px] font-black tracking-[-0.04em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="block min-w-0">
                    <span className="block font-display text-ink text-[26px] sm:text-[34px] leading-[1.02] tracking-[-0.024em] mb-3 font-black">
                      {c.name}
                    </span>
                    <span className="block text-charcoal leading-relaxed max-w-2xl">
                      {c.line}
                    </span>
                    <span className="mt-4 flex flex-wrap items-center gap-3 sm:hidden">
                      <ConceptMeta concept={c} />
                    </span>
                  </span>
                  <span className="hidden sm:flex flex-col items-end gap-3 pt-2">
                    <ConceptMeta concept={c} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-rule text-charcoal text-[12.5px] tracking-[0.15em] uppercase font-medium hover:border-ink hover:text-ink transition-colors duration-300"
            >
              Voltar para a home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ConceptMeta({ concept }: { concept: Concept }) {
  return (
    <>
      <span className="inline-flex items-center h-7 px-3 rounded-full border border-rule text-[10.5px] tracking-[0.2em] uppercase text-charcoal font-medium">
        {STATE_LABEL[concept.state]}
      </span>
      <span className="font-mono tnum text-[11px] tracking-[0.12em] text-muted2">
        {concept.date}
      </span>
    </>
  );
}

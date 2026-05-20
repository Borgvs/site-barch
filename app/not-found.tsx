import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-screen flex items-center justify-center bg-paper px-6 pt-32 pb-section">
        <div className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-8 tnum">
            Erro 404
          </p>
          <h1 className="font-display text-display-2xl sm:text-display-3xl text-ink mb-8 leading-[0.94] tracking-[-0.03em]">
            Essa página
            <br />
            <span className="text-muted2">não existe.</span>
          </h1>
          <p className="text-body-lg text-charcoal leading-relaxed mb-12 max-w-md mx-auto">
            Ou foi removida, ou nunca chegou a existir. Acontece. O caminho de
            volta está logo abaixo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 h-12 px-7 rounded-full bg-ink text-paperPure text-[12.5px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 hover:bg-ink2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
                aria-hidden
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar para a home
            </Link>
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-rule text-charcoal text-[12.5px] tracking-[0.15em] uppercase font-medium hover:border-ink hover:text-ink transition-colors duration-300"
            >
              Ler o manifesto
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

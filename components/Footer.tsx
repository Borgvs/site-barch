/**
 * Footer — minimalista, com 3 colunas + claim institucional.
 *
 * Refinements Apple-tier:
 *  - Hierarquia: claim grande à esquerda, links em 3 colunas
 *  - Hover state com underline animado nos links
 *  - CNPJ/CAU em mono tabular
 *  - Linha de assinatura na base
 */

import Link from "next/link";
import { Logo } from "./Logo";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Barch",
    links: [
      { label: "Manifesto", href: "/sobre" },
      { label: "Método", href: "/#processo" },
      { label: "BIM em obra", href: "/#bim" },
      { label: "Contato", href: "/#contato" },
    ],
  },
  {
    title: "Cliente",
    links: [
      {
        label: "Acessar painel",
        href: "https://painel.barch.com.br",
        external: true,
      },
      { label: "Como acompanhamos", href: "/#portal" },
    ],
  },
  {
    title: "Conexão",
    links: [
      {
        label: "LinkedIn",
        href: "https://linkedin.com/company/barch",
        external: true,
      },
      {
        label: "Instagram",
        href: "https://instagram.com/barch.arq",
        external: true,
      },
      { label: "E-mail", href: "mailto:contato@barch.com.br" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-rule/60 bg-paper">
      <div className="container-page py-20 sm:py-24">
        <div className="grid lg:grid-cols-[1.7fr_1fr_1fr_1fr] gap-12 lg:gap-10 mb-16 lg:mb-20">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-7 focus-ring rounded-md hover:opacity-70 transition-opacity duration-300"
            >
              <Logo variant="symbol" tone="dark" size="sm" />
              <span className="text-[16px] font-semibold tracking-[-0.01em] text-ink">
                Barch
              </span>
            </Link>
            <p className="text-[14.5px] text-charcoal max-w-sm leading-[1.62] mb-7">
              Articulamos arquitetura, obra e operação como um sistema único —
              não como serviços separados que se contradizem em cada etapa.
            </p>
            <div className="text-[11px] font-mono text-muted2 tnum leading-relaxed tracking-wider">
              CNPJ 55.060.650/0001-01
              <br />
              CREA/SP 2857205
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium mb-5">
                {col.title}
              </p>
              <ul className="space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href as never}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1.5 text-[13.5px] text-charcoal hover:text-ink transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-sm"
                    >
                      <span className="relative">
                        {l.label}
                        <span
                          aria-hidden
                          className="absolute -bottom-px left-0 right-0 h-px bg-ink/40 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                        />
                      </span>
                      {l.external && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          className="text-muted2 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden
                        >
                          <path d="M7 17L17 7M9 7h8v8" />
                        </svg>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-rule/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <p className="text-[12px] tracking-[0.04em] text-muted2 italic">
            Forma sem significado é cenário. Aqui forma é resposta.
          </p>
          <p className="text-[10.5px] tracking-[0.28em] uppercase text-muted2 font-mono tnum">
            © {new Date().getFullYear()} Barch
          </p>
        </div>
      </div>
    </footer>
  );
}

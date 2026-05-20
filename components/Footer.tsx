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
      { label: "Processo", href: "/#processo" },
      { label: "Projetos", href: "/#projetos" },
      { label: "Contato", href: "/#contato" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      {
        label: "Painel da obra",
        href: "https://painel.barch.com.br",
        external: true,
      },
      { label: "Barch.OS", href: "/#stack" },
      { label: "SAPP · Diagnóstico", href: "/sobre#sapp" },
      { label: "LOCVS", href: "/sobre#locvs" },
    ],
  },
  {
    title: "Conexão",
    links: [
      { label: "LinkedIn", href: "https://linkedin.com/company/barch", external: true },
      { label: "Instagram", href: "https://instagram.com/barch.arq", external: true },
      { label: "E-mail", href: "mailto:contato@barch.com.br" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-rule/40 mt-section">
      <div className="container-page py-16 sm:py-20">
        <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 lg:gap-8 mb-16">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-block mb-6 focus-ring rounded-md">
              <Logo variant="wordmark" tone="dark" size="md" />
            </Link>
            <p className="text-body text-charcoal max-w-sm leading-relaxed mb-6">
              Venture builder arquitetônica e urbana. Projeta, constrói e opera
              empreendimentos como ecossistemas culturais, econômicos e
              espaciais integrados.
            </p>
            <div className="text-caption text-muted2 leading-relaxed">
              CNPJ 55.060.650/0001-01<br />
              CAU A68944-0
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href as never}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="text-body-sm text-charcoal hover:text-warn transition-colors duration-250 focus-ring rounded"
                    >
                      {l.label}
                      {l.external && (
                        <span className="ml-1 text-[10px] text-muted2">↗</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="pt-8 border-t border-rule/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-caption text-muted2 italic">
            A liberdade de criar. A ousadia de transformar.
          </p>
          <p className="text-caption text-muted2 tnum">
            © {new Date().getFullYear()} Barch · Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}

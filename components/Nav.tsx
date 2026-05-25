"use client";

/**
 * Nav v9.5 · Venture builder · dark-first · anthracite
 *
 * Comportamento:
 *  - HIDDEN no início do hero (scroll 0 → 92% do hero)
 *  - Slide-in from top quando entra na fase HABITAR do hero (scroll ≥ 92%)
 *  - PERMANECE visível em todo o restante do site
 *  - Items horizontais sempre visíveis (sem overlay menu)
 *  - Wordmark "barch" sempre + items 5 horizontais + CTA painel
 *  - data-nav-dark detection mantida para tone adaptation
 *
 * Por quê:
 *  - Hero 500vh é gesto cinematográfico — nav competiria com narrativa
 *  - Habitar (fase 6/6) é o ponto onde o usuário "chegou em casa" — nav
 *    aparece para conduzir o resto da jornada (Ecossistema → Plataforma →
 *    Obra → Manifesto → Contato)
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface NavProps {
  /** Quando true, nav só aparece quando hero scroll ≥ 92% (fase Habitar) */
  hideUntilHabitar?: boolean;
}

const items = [
  { label: "Ecossistema", href: "/#ecossistema" },
  { label: "Plataforma", href: "/#plataforma" },
  { label: "Obra", href: "/#bim" },
  { label: "Manifesto", href: "/sobre" },
  { label: "Contato", href: "/#contato" },
];

export function Nav({ hideUntilHabitar = false }: NavProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(true);
  // visible: nav slide-in/out
  const [visible, setVisible] = useState(!hideUntilHabitar);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setScrolled(y > 16);

      // Visibility: se hideUntilHabitar, mostra apenas após cruzar 92% do hero
      // Hero é 500vh com pin. Fase Habitar começa em 92% → scrollY ≈ vh * 4.6
      if (hideUntilHabitar) {
        setVisible(y >= vh * 4.6);
      } else {
        setVisible(true);
      }

      // Tone detection: any [data-nav-dark="true"] overlapping nav band
      // Como o site é dark global, default é dark; só vira light em ilhas
      // paper (Manifesto)
      let lightOverride = false;
      const lightEls = document.querySelectorAll<HTMLElement>(
        '[data-nav-light="true"]',
      );
      for (const el of Array.from(lightEls)) {
        const r = el.getBoundingClientRect();
        if (r.top < 70 && r.bottom > 70) {
          lightOverride = true;
          break;
        }
      }
      setOnDark(!lightOverride);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hideUntilHabitar]);

  // SSR-stable values until mounted
  const isVisible = mounted ? visible : !hideUntilHabitar;
  const isScrolled = mounted ? scrolled : false;
  const dark = mounted ? onDark : true;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-[60] transition-all",
        "duration-[800ms] ease-out-expo",
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none",
        isVisible && isScrolled && dark
          ? "bg-anthra/65 backdrop-blur-2xl border-b border-paper/[0.06]"
          : isVisible && isScrolled && !dark
            ? "bg-paper/85 backdrop-blur-2xl border-b border-ruleLight"
            : "bg-transparent border-b border-transparent",
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      aria-hidden={!isVisible}
    >
      <div className="container-page py-4 sm:py-5 flex items-center justify-between gap-6">
        {/* Wordmark barch · permanente */}
        <Link
          href="/"
          className="group inline-flex items-center focus-ring rounded-md transition-opacity duration-300 hover:opacity-75"
          aria-label="Barch · venture builder arquitetônica · página inicial"
        >
          <Logo variant="wordmark" tone={dark ? "light" : "dark"} size="sm" />
        </Link>

        {/* Items horizontais sempre visíveis (quando nav visible) */}
        <nav
          className="hidden md:flex items-center gap-1 flex-1 justify-center"
          aria-label="Navegação principal"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative px-3.5 py-2 text-[13px] rounded-pill transition-colors duration-500",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-2",
                dark
                  ? "text-paper/85 hover:text-paper focus-visible:ring-paper focus-visible:ring-offset-anthra"
                  : "text-dark hover:text-anthraDeep focus-visible:ring-anthra focus-visible:ring-offset-paper",
              )}
            >
              <span>{item.label}</span>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3.5 -bottom-px h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
                  dark ? "bg-paper" : "bg-anthra",
                )}
              />
            </Link>
          ))}
        </nav>

        {/* CTA Acessar painel · sempre visível */}
        <a
          href="https://painel.barch.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className={dark ? "glass-pill-dark group" : "glass-pill group"}
          style={{ paddingTop: 10, paddingBottom: 10 }}
        >
          <span>Acessar painel</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          >
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </header>
  );
}

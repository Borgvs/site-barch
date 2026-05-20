"use client";

/**
 * Nav — Header fixo com wordmark "barch." adaptativo (full → line on scroll).
 *
 * - Sobre o hero (dark): wordmark light, links light, CTA glass-pill-dark
 * - Scrolled (após hero): wordmark line dark, links charcoal, CTA glass-cta
 * - Backdrop blur ativa só após scroll
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

interface NavProps {
  transparentOver?: "hero" | null;
}

const items = [
  { label: "Manifesto", href: "/sobre" },
  { label: "Método", href: "/#processo" },
  { label: "BIM em obra", href: "/#bim" },
  { label: "Portal", href: "/#portal" },
  { label: "Contato", href: "/#contato" },
];

export function Nav({ transparentOver = null }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(transparentOver === "hero");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);

      // Detecta "ainda sobre o hero" comparando scrollY com altura do hero.
      // HeroConstruction tem 500vh; consideramos "sobre hero" enquanto y
      // está abaixo de 470vh (94% — antes do final, mantém UX coerente).
      if (transparentOver === "hero") {
        const vh = window.innerHeight;
        setOverHero(y < vh * 4.7);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [transparentOver]);

  const onDark = overHero;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-700",
        scrolled && !onDark
          ? "bg-paper/70 backdrop-blur-2xl border-b border-rule/40"
          : scrolled && onDark
            ? "bg-ink/30 backdrop-blur-md border-b border-paper/[0.06]"
            : "bg-transparent border-b border-transparent",
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
    >
      <div className="container-page py-4 sm:py-5 flex items-center justify-between gap-4">
        {/* Wordmark — full quando topo, line quando rolado */}
        <Link
          href="/"
          className="group inline-flex items-center focus-ring rounded-md transition-opacity duration-300 hover:opacity-75"
          aria-label="barch · página inicial"
        >
          <Wordmark
            scrolled={scrolled}
            tone={onDark ? "light" : "dark"}
            size="md"
          />
        </Link>

        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Navegação principal"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative px-3.5 py-2 text-[13px] rounded-pill transition-colors duration-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-2",
                onDark
                  ? "text-paper/80 hover:text-paper focus-visible:ring-paper focus-visible:ring-offset-ink"
                  : "text-charcoal hover:text-ink focus-visible:ring-ink focus-visible:ring-offset-paper",
              )}
            >
              <span>{item.label}</span>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3.5 -bottom-px h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
                  onDark ? "bg-paper" : "bg-ink",
                )}
              />
            </Link>
          ))}
        </nav>

        <a
          href="https://painel.barch.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className={onDark ? "glass-pill-dark group" : "glass-pill group"}
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

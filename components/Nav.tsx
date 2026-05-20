"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const items: NavItem[] = [
  { label: "Manifesto", href: "/sobre" },
  { label: "Projetos", href: "/projetos" },
  { label: "Processo", href: "/#processo" },
  { label: "Stack", href: "/#stack" },
  { label: "Contato", href: "/#contato" },
];

/**
 * Nav · OrbAI-coded
 * Logo esquerda · items centrais · CTA pill preto direita
 * Fundo translúcido leve no scroll, sem pill flutuante
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-400 ease-apple",
        scrolled
          ? "bg-paper/85 backdrop-blur-xl border-b border-rule/60"
          : "bg-transparent"
      )}
    >
      <div className="container-page py-5 flex items-center justify-between gap-4">
        {/* Logo + nome */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-ring rounded-md hover:opacity-70 transition-opacity duration-250"
        >
          <Logo variant="symbol" tone="dark" size="sm" />
          <span className="text-[17px] font-semibold tracking-tight text-ink hidden xs:block sm:block">
            Barch
          </span>
        </Link>

        {/* Items centrais */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Principal">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-2 text-[14px] text-charcoal hover:text-ink rounded-pill transition-colors duration-250 focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA direita */}
        <Link
          href="/#contato"
          className="btn-ink !h-10 !px-4 !text-[13px]"
        >
          Agendar conversa
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

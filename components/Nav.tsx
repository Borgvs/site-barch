"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

// Itens institucionais — low profile sobre projetos
const items: NavItem[] = [
  { label: "Manifesto", href: "/sobre" },
  { label: "Método", href: "/#processo" },
  { label: "BIM em obra", href: "/#bim" },
  { label: "Portal", href: "/#portal" },
  { label: "Contato", href: "/#contato" },
];

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
        <Link
          href="/"
          className="flex items-center gap-2 focus-ring rounded-md hover:opacity-70 transition-opacity duration-250"
        >
          <Logo variant="symbol" tone="dark" size="sm" />
          <span className="text-[17px] font-semibold tracking-tight text-ink hidden sm:block">
            Barch
          </span>
        </Link>

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

        <a
          href="https://painel.barch.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ink !h-10 !px-4 !text-[13px]"
        >
          Acessar painel
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </a>
      </div>
    </header>
  );
}

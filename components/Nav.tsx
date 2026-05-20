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
  { label: "Processo", href: "/#processo" },
  { label: "Projetos", href: "/#projetos" },
  { label: "Stack", href: "/#stack" },
  { label: "Contato", href: "/#contato" },
];

/**
 * Nav · pill flutuante glass · padrão LanderOS adaptado Barch.
 * Aparece ancorado no topo, encolhe levemente após scroll.
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
        "fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-400 ease-apple",
        scrolled ? "pt-3" : "pt-6"
      )}
    >
      <nav
        className={cn(
          "glass-nav rounded-pill flex items-center gap-1 transition-all duration-400 ease-apple",
          scrolled ? "px-3 py-2 scale-95" : "px-4 py-2.5"
        )}
        aria-label="Principal"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 pr-3 pl-1 py-1 rounded-pill focus-ring hover:opacity-70 transition-opacity duration-250"
        >
          <Logo variant="symbol" tone="dark" size="xs" />
          <span className="text-body-sm font-semibold text-ink hidden sm:block">
            Barch
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1 border-l border-rule/60 pl-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-body-sm text-charcoal hover:text-ink rounded-pill hover:bg-ink/5 transition-all duration-250 focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/#contato"
          className="ml-1.5 btn-primary !h-9 !px-4 !text-[13px]"
        >
          Agendar conversa
        </Link>
      </nav>
    </header>
  );
}

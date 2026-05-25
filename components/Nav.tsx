"use client";

/**
 * Nav v9.4 · Venture builder · dark-first
 *
 * - Wordmark "barch" PERMANENTE (tone adapta: paper sobre dark, navy sobre paper)
 * - Menu items horizontais somem em scroll > 50vh com fade-out smooth
 * - Em troca aparece "menu" trigger discreto à direita
 * - Overlay fullscreen ao clicar: items em BLACK 900 60-80px + ações secundárias
 * - "Acessar painel" CTA sempre visível
 * - data-nav-dark detection mantida (sections opt-in para tone dark)
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface NavProps {
  transparentOver?: "hero" | null;
}

const items = [
  { label: "Ecossistema", href: "/#ecossistema" },
  { label: "Plataforma", href: "/#plataforma" },
  { label: "Obra", href: "/#bim" },
  { label: "Manifesto", href: "/sobre" },
  { label: "Contato", href: "/#contato" },
];

const secondaryItems = [
  { label: "Painel", href: "https://painel.barch.com.br", external: true },
  { label: "LinkedIn", href: "https://linkedin.com/in/gustavoalonsoborges", external: true },
  { label: "Instagram", href: "https://instagram.com/g.albor", external: true },
];

export function Nav({ transparentOver = null }: NavProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(transparentOver === "hero");
  const [pastFirstViewport, setPastFirstViewport] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setScrolled(y > 16);
      setPastFirstViewport(y > vh * 0.5);
      let dark = false;
      if (transparentOver === "hero") {
        dark = y < vh * 4.7;
      }
      if (!dark) {
        const darkEls = document.querySelectorAll<HTMLElement>(
          '[data-nav-dark="true"]',
        );
        for (const el of Array.from(darkEls)) {
          const r = el.getBoundingClientRect();
          if (r.top < 70 && r.bottom > 70) {
            dark = true;
            break;
          }
        }
      }
      setOverHero(dark);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [transparentOver]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ESC closes menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onDark = mounted ? overHero : transparentOver === "hero";
  const isScrolled = mounted ? scrolled : false;
  // Menu items horizontais ficam visíveis até 50vh, depois somem
  const showInlineMenu = mounted ? !pastFirstViewport : true;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-[60] transition-all duration-700",
          isScrolled && !onDark
            ? "bg-paper/85 backdrop-blur-2xl border-b border-ruleLight"
            : isScrolled && onDark
              ? "bg-navy/55 backdrop-blur-md border-b border-ruleDark"
              : "bg-transparent border-b border-transparent",
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        <div className="container-page py-4 sm:py-5 flex items-center justify-between gap-4">
          {/* Wordmark "barch" PERMANENTE · tone adapta */}
          <Link
            href="/"
            className="group inline-flex items-center focus-ring rounded-md transition-opacity duration-300 hover:opacity-75"
            aria-label="Barch · venture builder arquitetônica · página inicial"
          >
            <Logo variant="wordmark" tone={onDark ? "light" : "dark"} size="sm" />
          </Link>

          {/* Menu items horizontais (md+) — somem após 50vh com fade smooth */}
          <nav
            className={cn(
              "hidden md:flex items-center gap-1 transition-all duration-700",
              showInlineMenu
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-1 pointer-events-none",
            )}
            aria-label="Navegação principal"
            aria-hidden={!showInlineMenu}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative px-3.5 py-2 text-[13px] rounded-pill transition-colors duration-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-2",
                  onDark
                    ? "text-paper/85 hover:text-paper focus-visible:ring-paper focus-visible:ring-offset-navy"
                    : "text-dark hover:text-navy focus-visible:ring-navy focus-visible:ring-offset-paper",
                )}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3.5 -bottom-px h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
                    onDark ? "bg-paper" : "bg-navy",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Menu trigger · aparece quando inline menu sai */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              className={cn(
                "group inline-flex items-center gap-2.5 px-3 py-2 rounded-pill transition-all duration-500",
                showInlineMenu
                  ? "opacity-0 translate-x-1 pointer-events-none w-0 overflow-hidden"
                  : "opacity-100 translate-x-0 pointer-events-auto",
                onDark
                  ? "text-paper/85 hover:text-paper"
                  : "text-dark hover:text-navy",
              )}
            >
              <span className="text-[12px] tracking-[0.18em] uppercase font-medium">
                menu
              </span>
              <span className="flex flex-col gap-1" aria-hidden>
                <span
                  className={cn(
                    "h-px w-5 transition-colors duration-500",
                    onDark ? "bg-paper/85 group-hover:bg-paper" : "bg-dark group-hover:bg-navy",
                  )}
                />
                <span
                  className={cn(
                    "h-px w-5 transition-colors duration-500",
                    onDark ? "bg-paper/85 group-hover:bg-paper" : "bg-dark group-hover:bg-navy",
                  )}
                />
              </span>
            </button>

            {/* CTA Acessar painel · sempre visível */}
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
        </div>
      </header>

      {/* Menu overlay fullscreen */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[80] bg-navy-deep flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
          >
            {/* Header dentro do overlay · close button + wordmark espelhado */}
            <div className="container-page py-4 sm:py-5 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                aria-label="Barch · página inicial"
              >
                <Logo variant="wordmark" tone="light" size="sm" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="group inline-flex items-center gap-2.5 px-3 py-2 rounded-pill text-paper/85 hover:text-paper transition-colors duration-300"
              >
                <span className="text-[12px] tracking-[0.18em] uppercase font-medium">
                  fechar
                </span>
                <span className="relative w-5 h-5" aria-hidden>
                  <span className="absolute inset-0 m-auto h-px w-5 bg-paper/85 rotate-45 top-1/2" />
                  <span className="absolute inset-0 m-auto h-px w-5 bg-paper/85 -rotate-45 top-1/2" />
                </span>
              </button>
            </div>

            {/* Menu items · BLACK 900 monumentais */}
            <div className="flex-1 container-page flex flex-col justify-center">
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
                }}
                className="flex flex-col gap-3 sm:gap-4"
              >
                {items.map((item) => (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="group inline-block font-display text-paper leading-[0.94] tracking-[-0.028em] hover:text-accent transition-colors duration-300"
                      style={{
                        fontWeight: 900,
                        fontSize: "clamp(42px, 8vw, 96px)",
                      }}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className="inline-block ml-3 sm:ml-6 text-accent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out -translate-x-2 group-hover:translate-x-0"
                        style={{ fontSize: "0.4em", verticalAlign: "middle" }}
                      >
                        →
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Ações secundárias · linhas finas embaixo */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
                className="mt-16 sm:mt-20 pt-8 border-t border-ruleDark flex flex-wrap items-center gap-x-8 gap-y-4"
              >
                {secondaryItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="text-[12px] tracking-[0.18em] uppercase font-medium text-paper/65 hover:text-paper transition-colors duration-300"
                  >
                    {item.label}
                    {item.external && (
                      <span aria-hidden className="ml-1.5">↗</span>
                    )}
                  </a>
                ))}
                <span className="ml-auto text-[11px] tracking-[0.32em] uppercase text-paper/45 font-mono">
                  Build Beyond
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

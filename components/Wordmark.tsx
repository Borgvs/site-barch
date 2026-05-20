"use client";

/**
 * Wordmark — marca tipográfica "barch."
 *
 * Dois modos:
 *  - "full": wordmark sólido (font-black com gradient sutil)
 *  - "line": versão line/outline (apenas contorno) — usada quando scrollado
 *
 * Transição entre os dois é controlada pela prop `scrolled`, animada
 * com CSS variables + transition.
 */

import { cn } from "@/lib/utils";

interface WordmarkProps {
  /** Quando true, mostra versão "line" (contorno). */
  scrolled?: boolean;
  /** Tom: dark para fundos claros, light para fundos escuros. */
  tone?: "dark" | "light";
  /** Tamanho do wordmark. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Wordmark({
  scrolled = false,
  tone = "dark",
  size = "md",
  className,
}: WordmarkProps) {
  const sizeClass =
    size === "lg" ? "text-[28px]" : size === "md" ? "text-[22px]" : "text-[18px]";

  const lightStroke = scrolled
    ? "text-transparent"
    : "text-transparent bg-clip-text";

  return (
    <span
      className={cn(
        "relative inline-flex items-baseline select-none font-display",
        sizeClass,
        className,
      )}
      style={{
        fontWeight: scrolled ? 700 : 900,
        letterSpacing: "-0.045em",
        lineHeight: 1,
        transition:
          "letter-spacing 600ms cubic-bezier(0.32, 0.72, 0, 1), font-weight 600ms cubic-bezier(0.32, 0.72, 0, 1)",
      }}
      aria-label="barch"
    >
      {/* Versão sólida (full) — fica visível quando NÃO scrolled */}
      <span
        aria-hidden
        className="transition-opacity duration-500 ease-out-expo"
        style={{
          opacity: scrolled ? 0 : 1,
          position: scrolled ? "absolute" : "relative",
          inset: 0,
          background:
            tone === "light"
              ? "linear-gradient(180deg, #fcfbf7 0%, rgba(252,251,247,0.72) 100%)"
              : "linear-gradient(180deg, #0a0a0a 0%, #36454F 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        barch<span style={{ letterSpacing: 0 }}>.</span>
      </span>

      {/* Versão line/outline — fica visível quando scrolled */}
      <span
        aria-hidden
        className="transition-opacity duration-500 ease-out-expo"
        style={{
          opacity: scrolled ? 1 : 0,
          position: scrolled ? "relative" : "absolute",
          inset: 0,
          color: "transparent",
          WebkitTextStroke:
            tone === "light"
              ? "1.2px rgba(252,251,247,0.92)"
              : "1.2px rgba(10,10,10,0.92)",
        }}
      >
        barch<span style={{ letterSpacing: 0 }}>.</span>
      </span>

      {/* Versão "fantasma" para reservar largura (não visível) */}
      <span className="invisible" aria-hidden>
        barch.
      </span>
    </span>
  );
}

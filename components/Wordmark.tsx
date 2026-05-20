"use client";

/**
 * Wordmark — marca tipográfica "barch.".
 *
 * Modos:
 *  - scrolled=false: wordmark sólido em font-black com gradient
 *  - scrolled=true: wordmark em outline (text-stroke)
 *
 * Renderização limpa: ÚNICO span ativo por vez via crossfade,
 * outro fica `display:none` para evitar sobreposição visual.
 */

import { cn } from "@/lib/utils";

interface WordmarkProps {
  scrolled?: boolean;
  tone?: "dark" | "light";
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

  const solidStyle: React.CSSProperties = {
    background:
      tone === "light"
        ? "linear-gradient(180deg, #fcfbf7 0%, rgba(252,251,247,0.72) 100%)"
        : "linear-gradient(180deg, #0a0a0a 0%, #36454F 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  };

  const outlineStyle: React.CSSProperties = {
    color: "transparent",
    WebkitTextStroke:
      tone === "light"
        ? "1.2px rgba(252,251,247,0.92)"
        : "1.2px rgba(10,10,10,0.92)",
  };

  return (
    <span
      className={cn(
        "relative inline-flex items-baseline select-none font-display whitespace-nowrap",
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
      <span style={scrolled ? outlineStyle : solidStyle}>
        barch<span style={{ letterSpacing: 0 }}>.</span>
      </span>
    </span>
  );
}

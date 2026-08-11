"use client";

/**
 * MagneticLink — link com leve atração ao cursor (Apple style).
 *
 * O efeito magnético é aplicado em um wrapper <span>, não no <a> direto,
 * para simplificar tipos com next/link.
 */

import Link from "next/link";
import { type ReactNode } from "react";
import { useMagnetic } from "@/lib/motion";

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  strength?: number;
  radius?: number;
  onClick?: () => void;
  ariaLabel?: string;
}

export function MagneticLink({
  href,
  children,
  className,
  external = false,
  strength = 0.22,
  radius = 80,
  onClick,
  ariaLabel,
}: MagneticLinkProps) {
  const ref = useMagnetic<HTMLSpanElement>(strength, radius);

  const linkContent = (
    <span ref={ref} className="inline-block">
      {/* gap-3 replica o gap dos CTAs (.glass-cta-ghost usa 0.75rem) — o wrapper
          engolia o gap do <a> externo e o ícone colava no rótulo */}
      <span className="inline-flex items-center gap-3">{children}</span>
    </span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {linkContent}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {linkContent}
    </Link>
  );
}

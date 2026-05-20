"use client";

/**
 * SmoothScroll — Lenis provider integrado com GSAP ScrollTrigger.
 *
 * Estratégia:
 *  - Lenis controla o scroll nativo via wheel hijack
 *  - GSAP ScrollTrigger é atualizado a cada tick do Lenis para sincronizar
 *  - prefers-reduced-motion → desliga o smooth, scroll volta a ser nativo
 *
 * Wrapper deve envolver toda a página (em app/layout.tsx).
 */

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      smoothWheel: true,
    });

    // Sincroniza Lenis ↔ ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // GSAP usa requestAnimationFrame interno em sincronia
    gsap.ticker.lagSmoothing(0);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

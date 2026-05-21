"use client";

/**
 * SmoothScroll — Lenis + GSAP ScrollTrigger com SINGLE LOOP (padrão oficial).
 *
 * Fix BUG 4 da auditoria: Lenis e GSAP devem rodar no MESMO RAF loop, não
 * em dois loops independentes (que dessincronizam e quebram o progress
 * do ScrollTrigger, causando fases fora de ordem).
 *
 * Padrão oficial Lenis + GSAP:
 *   1. lenis.on("scroll", ScrollTrigger.update) — sincroniza scroll → ST
 *   2. gsap.ticker.add(time => lenis.raf(time * 1000)) — GSAP ticker
 *      controla o RAF do Lenis (sem requestAnimationFrame separado)
 *   3. gsap.ticker.lagSmoothing(0) — desliga lag smoothing do GSAP
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

    // 1. Sincroniza Lenis → ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // 2. GSAP ticker controla o RAF do Lenis — SINGLE LOOP
    const lenisRaf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisRaf);

    // 3. Desliga lag smoothing (Lenis já é smooth)
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenisRaf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

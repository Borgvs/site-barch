/**
 * lib/motion.ts — Tokens canônicos de movimento + hooks Apple-tier.
 *
 * Filosofia:
 *  - Easings curtas, nunca bouncy. Cubic-bezier(0.16, 1, 0.3, 1) é o padrão
 *    da Apple e do que estamos construindo aqui.
 *  - Distâncias curtas (4-20px) — gestos sutis, nunca dramáticos.
 *  - Durações entre 0.35s e 0.9s — qualquer coisa fora disso parece falha.
 *  - Sempre respeitar prefers-reduced-motion.
 */

import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";

/* -----------------------------------------------------------------------
 * Easings (cubic-bezier arrays para Framer Motion)
 * ---------------------------------------------------------------------- */

export const EASE = {
  /** Padrão Apple — entrada suave, saída com inércia. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Para elementos que devem desaparecer. */
  in: [0.7, 0, 0.84, 0] as const,
  /** Contemplativo — usado em transições longas (>= 0.6s). */
  inOut: [0.83, 0, 0.17, 1] as const,
  /** Para escala — leve "settle" no fim. */
  spring: [0.34, 1.56, 0.64, 1] as const,
} as const;

export const DURATION = {
  micro: 0.18,
  fast: 0.32,
  base: 0.56,
  slow: 0.88,
  contemplative: 1.2,
} as const;

/** Distâncias pequenas — Apple não move +30px nunca. */
export const DISTANCE = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
} as const;

/* -----------------------------------------------------------------------
 * usePrefersReducedMotion
 * ---------------------------------------------------------------------- */

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => setReduced(mq.matches);
    handle();
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);
  return reduced;
}

/* -----------------------------------------------------------------------
 * useInView — observer simples, dispara animação quando entra na viewport
 * ---------------------------------------------------------------------- */

export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit & { once?: boolean } = {},
): [RefObject<T | null>, boolean] {
  const {
    once = true,
    root = null,
    rootMargin = "0px 0px -80px 0px",
    threshold = 0.15,
  } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { root, rootMargin, threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once, root, rootMargin, threshold]);

  return [ref, inView];
}

/* -----------------------------------------------------------------------
 * useMagneticButton — botões/elementos puxados pelo cursor
 *
 * Aplica transform direto no elemento (evita re-render). Suave, com lerp.
 * O `strength` controla a intensidade (0.2 default — sutil).
 * ---------------------------------------------------------------------- */

export function useMagnetic<T extends HTMLElement>(
  strength: number = 0.25,
  radius: number = 90,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius * 2) {
        targetX = 0;
        targetY = 0;
        return;
      }
      const falloff = Math.max(0, 1 - dist / (radius * 2));
      targetX = dx * strength * falloff;
      targetY = dy * strength * falloff;
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [strength, radius]);

  return ref;
}

/* -----------------------------------------------------------------------
 * useParallax — translateY baseado no scroll relativo ao elemento
 *
 * `speed` em [-1, 1]. Negativo = move pra cima, positivo = pra baixo.
 * ---------------------------------------------------------------------- */

export function useParallax<T extends HTMLElement>(
  speed: number = 0.2,
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let target = 0;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Center of element relative to viewport center, normalized [-1, 1]
      const center = rect.top + rect.height / 2;
      const ratio = (center - vh / 2) / vh;
      target = -ratio * 60 * speed;
    };
    const onScroll = () => {
      compute();
    };
    const tick = () => {
      offsetRef.current += (target - offsetRef.current) * 0.12;
      el.style.transform = `translate3d(0, ${offsetRef.current.toFixed(2)}px, 0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafRef.current);
      el.style.transform = "";
    };
  }, [speed]);

  return ref;
}

/* -----------------------------------------------------------------------
 * useScrollProgress — retorna 0..1 do scroll dentro de um trigger element
 *
 * Útil para microanimações scroll-linked sem GSAP.
 * ---------------------------------------------------------------------- */

export function useScrollProgress<T extends HTMLElement>(): [
  RefObject<T | null>,
  MutableRefObject<number>,
] {
  const ref = useRef<T>(null);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      progressRef.current = Math.max(0, Math.min(1, passed / total));
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return [ref, progressRef];
}

/* -----------------------------------------------------------------------
 * Variants prontos para Framer Motion
 * ---------------------------------------------------------------------- */

export const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: DISTANCE.lg },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.base, ease: EASE.out },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: DURATION.base, ease: EASE.out },
    },
  },
  /** Stagger children — útil em listas */
  container: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  },
} as const;

"use client";

/**
 * FadeIn — bulletproof entrance animation via IntersectionObserver + CSS class.
 *
 * Por quê este componente existe (em vez de Reveal/whileInView via framer-motion):
 *  - framer-motion `animate` (não `whileInView`) é frágil no /sobre (bug maio 2026):
 *    opacity travava em 0 mesmo com animationPlayState=running.
 *  - Solução nativa: IntersectionObserver + classe CSS toggleada. Não depende de
 *    runtime JS de framer-motion. Browser controla a animação.
 *  - Como o estado inicial é renderizado server-side (opacity:0 via style inline)
 *    e o cliente toggla a classe `.is-visible` quando o IO dispara, o conteúdo
 *    aparece de forma confiável mesmo sob hidratação lenta.
 *
 * Uso:
 *   <FadeIn>...conteúdo...</FadeIn>
 *   <FadeIn delay={100} as="h1" className="font-display">Título</FadeIn>
 *   <FadeIn distance={8} duration={600}>Linha sutil</FadeIn>
 *
 * Para hero ABOVE THE FOLD passe `immediate` — entra direto no mount, sem
 * esperar interseção (necessário pq o elemento já está no viewport ao montar).
 */

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type FadeInTag = "div" | "p" | "h1" | "h2" | "h3" | "section" | "span";

interface FadeInProps {
  children: ReactNode;
  /** Delay em ms antes da animação começar. */
  delay?: number;
  /** Duração em ms. Default 900ms. */
  duration?: number;
  /** Translação Y inicial em px. Default 14. */
  distance?: number;
  /** Se true, anima logo no mount (ignora viewport). Use no hero. */
  immediate?: boolean;
  /** Tag HTML. Default "div". */
  as?: FadeInTag;
  className?: string;
  style?: CSSProperties;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 900,
  distance = 14,
  immediate = false,
  as = "div",
  className,
  style,
}: FadeInProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Respeitar reduced-motion: aparece direto.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    if (immediate) {
      // Pequeno timeout para garantir que o initial state foi pintado antes do toggle.
      const t = window.setTimeout(() => setVisible(true), 20);
      return () => window.clearTimeout(t);
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate]);

  const mergedStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    willChange: visible ? "auto" : "opacity, transform",
    ...style,
  };

  return createElement(
    as,
    { ref, className, style: mergedStyle },
    children,
  );
}

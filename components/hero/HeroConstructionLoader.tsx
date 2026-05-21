"use client";

/**
 * HeroConstructionLoader — wrapper client-only para o hero scroll-driven.
 *
 * Por que existe: o HeroConstruction depende inteiramente do browser
 * (GSAP ScrollTrigger, R3F WebGL, window.innerWidth, prefers-reduced-motion).
 * Renderizá-lo no servidor produz markup que NUNCA bate com o cliente —
 * gerando React #418 hydration mismatch que degrada a página inteira.
 *
 * Solução padrão Next.js 15 App Router: dynamic({ssr:false}) só é permitido
 * em Client Components. Este wrapper é o "use client" boundary que isola o
 * import dinâmico, mantendo app/page.tsx como Server Component.
 *
 * Resultado: server renderiza só <HeroFallback initial />, client carrega
 * a árvore real após mount. Hidratação limpa.
 */

import dynamic from "next/dynamic";
import { HeroFallback } from "./HeroFallback";

const HeroConstructionInner = dynamic(
  () =>
    import("./HeroConstruction").then((m) => ({ default: m.HeroConstruction })),
  {
    ssr: false,
    loading: () => <HeroFallback initial />,
  },
);

export function HeroConstructionLoader() {
  return <HeroConstructionInner />;
}

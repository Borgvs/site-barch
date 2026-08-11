"use client";

/**
 * HeroConstruction — Orchestrator do hero scroll-driven (dual-mode).
 *
 * Responsabilidades:
 *  1. Container 500vh com pin via GSAP ScrollTrigger
 *  2. Detectar manifest.json:
 *       - Existe → FRAME SEQUENCE (Kling 3.0, fotorealista)
 *       - Não existe → THREE.JS PROCEDURAL (estética CAD/maquete)
 *  3. Atualizar progressRef sem re-render React
 *  4. Overlay UI (PhaseLabel, MaterialAnnotations, ProgressBar, etc.)
 *  5. Fallback estático para reduced-motion / mobile / GPU fraca
 *  6. Cleanup robusto de ScrollTrigger no unmount
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCROLL_CONFIG } from "@/lib/construction-config";
import { loadManifest, type FramesManifest } from "@/lib/frames-manifest";
import { PhaseLabel } from "./PhaseLabel";
import { MaterialAnnotations } from "./MaterialAnnotations";
import { ProgressBar } from "./ProgressBar";
import { ScrollHint } from "./ScrollHint";
import { FinalCTA } from "./FinalCTA";
import { HeroFallback } from "./HeroFallback";
import { HeroFrameSequence } from "./HeroFrameSequence";

// R3F é pesado (~150 kB) — dynamic com ssr:false garante chunk separado
const ConstructionScene = dynamic(
  () =>
    import("./ConstructionScene").then((m) => ({
      default: m.ConstructionScene,
    })),
  {
    ssr: false,
    loading: () => <HeroFallback initial />,
  },
);

gsap.registerPlugin(ScrollTrigger);

/* -----------------------------------------------------------------------
 * Capabilities + frames detection
 * ---------------------------------------------------------------------- */

type RenderMode = "frames" | "procedural" | "fallback" | "loading";

function useHeroState() {
  const [state, setState] = useState<{
    mode: RenderMode;
    manifest: FramesManifest | null;
  }>({ mode: "loading", manifest: null });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let canceled = false;

    const decide = async () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isWideEnough =
        window.innerWidth >= SCROLL_CONFIG.desktopBreakpointPx;
      // WebGL probe — usado apenas se vamos cair no Three.js procedural
      const hasGoodGPU = (() => {
        try {
          const c = document.createElement("canvas");
          const gl =
            c.getContext("webgl2") ||
            (c.getContext("webgl") as WebGLRenderingContext | null);
          if (!gl) return false;
          const dbg = gl.getExtension("WEBGL_debug_renderer_info");
          if (!dbg) return true;
          const renderer = (gl.getParameter(
            dbg.UNMASKED_RENDERER_WEBGL,
          ) as string).toLowerCase();
          return !/swiftshader|llvmpipe|software/.test(renderer);
        } catch {
          return false;
        }
      })();

      if (prefersReducedMotion || !isWideEnough) {
        if (!canceled) setState({ mode: "fallback", manifest: null });
        return;
      }

      const manifest = await loadManifest();
      if (canceled) return;

      if (manifest) {
        setState({ mode: "frames", manifest });
      } else if (hasGoodGPU) {
        setState({ mode: "procedural", manifest: null });
      } else {
        setState({ mode: "fallback", manifest: null });
      }
    };

    decide();
    return () => {
      canceled = true;
    };
  }, []);

  return state;
}

/* -----------------------------------------------------------------------
 * HeroConstruction
 * ---------------------------------------------------------------------- */

export function HeroConstruction() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);

  const [progress, setProgress] = useState(0);
  const lastEmittedRef = useRef(0);

  const { mode, manifest } = useHeroState();
  const usesScrollDriver = mode === "frames" || mode === "procedural";

  /* -- GSAP ScrollTrigger setup -- */
  useEffect(() => {
    if (!usesScrollDriver) return;
    if (!containerRef.current || !stickyRef.current) return;

    const animState = { p: 0 };

    const ctx = gsap.context(() => {
      gsap.to(animState, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: SCROLL_CONFIG.scrub,
          pin: stickyRef.current,
          pinSpacing: false,
          anticipatePin: 1, // evita flash do Safari ao entrar no pin
          invalidateOnRefresh: true,
          onUpdate: (st) => {
            progressRef.current = st.progress;
            const delta = Math.abs(st.progress - lastEmittedRef.current);
            if (delta > 0.005 || st.progress === 0 || st.progress >= 0.999) {
              lastEmittedRef.current = st.progress;
              setProgress(st.progress);
            }
          },
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [usesScrollDriver]);

  /* -- Refresh on resize -- */
  useEffect(() => {
    if (!usesScrollDriver) return;
    const handle = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [usesScrollDriver]);

  /* -- Skip-link handler -- */
  const onSkip = useCallback(() => {
    const target = document.getElementById("conteudo");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* -- Render -- */
  if (mode === "loading") return <HeroFallback initial />;
  if (mode === "fallback") return <HeroFallback />;

  return (
    <section
      ref={containerRef}
      style={{ height: `${SCROLL_CONFIG.containerHeightVh}vh` }}
      className="relative w-full bg-ink text-paper"
      aria-label="Experiência de construção da residência"
    >
      {/* No modo frames/procedural o HeroFallback (que carrega o h1 visível)
          nunca renderiza — sem este h1 a home ficava sem h1 no desktop */}
      <h1 className="sr-only">
        Construir sem ruído — Barch, venture builder arquitetônica
      </h1>
      {/* Sticky viewport — pinado pelo GSAP · will-change para GPU compositing */}
      <div
        ref={stickyRef}
        className="absolute top-0 left-0 h-screen w-full overflow-hidden bg-ink"
        style={{ willChange: "transform" }}
      >
        {/* Driver: frame sequence (Kling) ou Three.js procedural */}
        {mode === "frames" && manifest ? (
          <HeroFrameSequence
            manifest={manifest}
            progressRef={progressRef}
          />
        ) : (
          <ConstructionScene progressRef={progressRef} />
        )}

        {/* Gradient overlay sutil — só onde os overlays UI precisam de legibilidade
            (topo para label + nav, base para CTA). Meio limpo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55"
        />

        {/* Vignette discreta — não obscurece o conteúdo central */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.40) 100%)",
          }}
        />

        {/* Grain overlay 6% */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
          }}
        />

        {/* Fade interno · base do hero canvas funde com anthra do body.
            Overlay sobre a animação (não faixa entre seções) · efeito de
            mesclagem na base · entrega sensação de continuidade. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(15,17,20,0.45) 35%, rgba(25,27,30,0.85) 70%, rgba(37,39,42,1) 100%)",
          }}
        />

        {/* Overlay UI */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <PhaseLabel progress={progress} />
          <MaterialAnnotations progress={progress} />
          <ProgressBar progress={progress} />
          <ScrollHint progress={progress} />
          <FinalCTA progress={progress} />

          {/* Skip-link como glass-pill-dark · só visível nos primeiros 30% do hero
              (ajuda de navegação inicial · some quando o usuário já engajou) */}
          <button
            type="button"
            onClick={onSkip}
            className="glass-pill-dark pointer-events-auto absolute right-6 top-28 z-20 cursor-pointer transition-opacity duration-700 ease-out"
            style={{
              fontSize: 10.5,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: progress < 0.3 ? 1 : 0,
              pointerEvents: progress < 0.3 ? "auto" : "none",
            }}
            aria-label="Ir direto para o conteúdo do site"
            aria-hidden={progress >= 0.3}
            tabIndex={progress >= 0.3 ? -1 : 0}
          >
            Ir para conteúdo ↓
          </button>
        </div>
      </div>
    </section>
  );
}

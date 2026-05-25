import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroConstructionLoader } from "@/components/hero/HeroConstructionLoader";
import { Problema } from "@/components/sections/Problema";
import { Ecossistema } from "@/components/sections/Ecossistema";
import { Plataforma } from "@/components/sections/Plataforma";
import { Bimarch } from "@/components/sections/Bimarch";
import { Manifesto } from "@/components/sections/Manifesto";
import { Contact } from "@/components/sections/Contact";

/**
 * Home v9.5 · Pitch deck navegável venture builder
 *
 * Narrativa (três atos, script-craft + playbook BARCH):
 *
 * Ato I — Setup (terreno conceitual):
 *   1. Hero (Terreno → Habitar) — gesto inaugural · 500vh pin
 *   2. Diagnóstico (Problema) — 6 problemas do mercado · abre venture builder
 *
 * Ato II — Confronto (a tese opera):
 *   3. Ecossistema (Sinek WHY/HOW/WHAT) — LOCVS · BIMARCH · BARCH · stack diagram
 *   4. Plataforma (4 camadas) — Canteiro · Gestão · Investidor · Asset · XP-style
 *   5. BIM scroll-driven (Bimarch) — Vertical Obras em operação ao vivo
 *
 * Ato III — Resolução:
 *   6. Manifesto Build Beyond — ilha de descanso (paper) com 4 recusas
 *   7. Contato — Decision Trigger CTA
 */

export default function HomePage() {
  return (
    <>
      <Nav hideUntilHabitar />
      <main>
        {/* Ato I.1 · HERO 3D IMERSIVO scroll-driven · 6 fases
            Terreno → Estrutura → Volume → Materialidade → Luz → Habitar
            Container 500vh com pin GSAP ScrollTrigger.
            Dual-mode: frame sequence Veo 3.1 ou Three.js procedural. */}
        <HeroConstructionLoader />

        <div id="conteudo">
          {/* Bridge suave hero → diagnóstico */}
          <div aria-hidden className="bridge-image-to-anthra" />

          {/* Ato I.2 · DIAGNÓSTICO
              6 problemas estruturais que abrem espaço para a tese venture
              builder. Sem nomear o problema, a Barch ficaria sem motivo. */}
          <Problema />

          {/* Bridge sutil anthra → anthraDeep (mudança de tom) */}
          <div aria-hidden className="bridge-anthra-to-deep" />

          {/* Ato II.1 · ECOSSISTEMA — Sinek WHY/HOW/WHAT
              LOCVS (WHY) · BIMARCH (HOW) · BARCH (WHAT)
              Same stack, same thesis. Stack diagram Data → Intelligence →
              Architecture → Platform. */}
          <Ecossistema />

          {/* Ato II.2 · PLATAFORMA — 4 camadas
              Canteiro · Gestão · Investidor · Asset. A XP do real estate.
              Decision Trigger CTA ao final. */}
          <Plataforma />

          {/* Ato II.3 · BIM SCROLL-DRIVEN
              Vertical Obras · BIMARCH em operação ao vivo (estudo de caso).
              400vh pin · 6 fases construtivas vista drone B0→B5. */}
          <Bimarch />

          {/* Bridge anthra → paper · entrada na ilha de descanso editorial */}
          <div aria-hidden className="bridge-anthra-to-paper" />

          {/* Ato III.1 · MANIFESTO BUILD BEYOND
              Ilha de descanso paper. 4 recusas que materializam a tese
              venture builder. Não é slogan. É mandato. */}
          <Manifesto />

          {/* Bridge paper → anthra · saída da ilha */}
          <div aria-hidden className="bridge-paper-to-anthra" />

          {/* Ato III.2 · CONTATO — Decision Trigger final */}
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}

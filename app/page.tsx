import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroConstructionLoader } from "@/components/hero/HeroConstructionLoader";
import { Problema } from "@/components/sections/Problema";
import { Composicao } from "@/components/sections/Composicao";
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
 *   3. Composição (Sinek WHY/HOW/WHAT) — LOCVS · BIMARCH · BARCH · stack diagram
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
          {/* Body bg permanente é anthra · seções fluem sem cortes.
              Manifesto é ILHA paper com self-fade interno (section-paper-island). */}

          {/* Ato I.2 · DIAGNÓSTICO */}
          <Problema />

          {/* Ato II.1 · COMPOSIÇÃO — WHY/HOW/WHAT + stack diagram animado · palco macOS */}
          <Composicao />

          {/* Ato II.2 · PLATAFORMA — 4 camadas com ícones vetoriais */}
          <Plataforma />

          {/* Ato II.3 · BIM SCROLL-DRIVEN — vertical Obras em operação */}
          <Bimarch />

          {/* Ato III.1 · MANIFESTO BUILD BEYOND — ilha paper self-fade */}
          <Manifesto />

          {/* Ato III.2 · CONTATO */}
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}

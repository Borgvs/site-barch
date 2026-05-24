import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroConstructionLoader } from "@/components/hero/HeroConstructionLoader";
import { Problema } from "@/components/sections/Problema";
import { PullQuote } from "@/components/sections/PullQuote";
import { Visao } from "@/components/sections/Visao";
import { Process } from "@/components/sections/Process";
import { Bimarch } from "@/components/sections/Bimarch";
import { Portal } from "@/components/sections/Portal";
import { Manifesto } from "@/components/sections/Manifesto";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Nav transparentOver="hero" />
      <main>
        {/* HERO 3D IMERSIVO scroll-driven — diretriz original Barch.
            6 fases narrativas: Terreno → Estrutura → Volume → Materialidade
            → Luz → Habitar. Container 500vh com pin GSAP ScrollTrigger.
            Dual-mode: Three.js procedural (default) ou frame sequence
            Kling se /public/frames/manifest.json existir. */}
        <HeroConstructionLoader />

        <div id="conteudo">
          {/* Problema · diagnóstico editorial.
              Ponte conceitual entre o hero (casa nascendo) e a tese (manifesto).
              Nomeia 6 problemas estruturais do mercado de construção de
              alto padrão. Sem nomear o problema, a Barch ficaria sem motivo. */}
          <Problema />

          <PullQuote />

          {/* Visão · pausa editorial cinematográfica antes do método. */}
          <Visao />

          <Process />
          <Bimarch />
          <Portal />
          <Manifesto />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}

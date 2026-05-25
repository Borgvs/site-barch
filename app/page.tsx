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
          {/* Hero (ink canvas) → Problema (navy) · bridge image-to-navy */}
          <div aria-hidden className="bridge-image-to-navy" />

          {/* Problema · diagnóstico editorial.
              Ponte conceitual entre o hero (casa nascendo) e a tese (manifesto).
              Nomeia 6 problemas estruturais que abrem espaço para a tese
              venture builder. Sem nomear o problema, a Barch ficaria sem motivo. */}
          <Problema />

          <PullQuote />

          {/* Visão · pausa editorial cinematográfica antes do método. */}
          <Visao />

          <Process />

          {/* Process (navy) → Bimarch wrap (softer) · ambos dark, sem bridge */}
          <Bimarch />

          <Portal />

          {/* Portal (navy) → Manifesto (paper · ilha de descanso) · bridge navy-to-paper */}
          <div aria-hidden className="bridge-navy-to-paper" />
          <Manifesto />
          {/* Manifesto (paper) → Contact (navy) · bridge paper-to-navy */}
          <div aria-hidden className="bridge-paper-to-navy" />

          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}

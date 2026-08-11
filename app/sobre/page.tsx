import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroSobre } from "@/components/sobre/HeroSobre";
import { Pilares } from "@/components/sobre/Pilares";
import { VBATriangle } from "@/components/sobre/VBATriangle";
import { LOCVSDiagram } from "@/components/sobre/LOCVSDiagram";
import { StackIsometric } from "@/components/sobre/StackIsometric";
import { ClausulaFinal } from "@/components/sobre/ClausulaFinal";

export const metadata = {
  title: "Manifesto",
  description:
    "O que a Barch é, o que recusa, o método que sustenta cada decisão. Cinco princípios inegociáveis, o protocolo Verdade-Beleza-Ato, e a stack venture builder.",
  // Sem este override a página herda og:title/og:url da HOME — compartilhar
  // o Manifesto atribuía o card à homepage
  openGraph: {
    title: "Manifesto · Barch",
    description:
      "O que a Barch é, o que recusa, o método que sustenta cada decisão.",
    url: "/sobre",
  },
};

/**
 * /sobre · Manifesto Barch v2 — dark-first editorial.
 *
 * Linguagem visual idêntica ao home v9.5:
 *  - Body anthra (#25272A)
 *  - Tipografia display BLACK gradient (glass-fill) + clay nos destaques
 *  - Reveal Apple-tier · MagneticLink · Tilt · Parallax sutil
 *  - Glass-stage no protocolo VBA · diagramas SVG animados
 *
 * Sequência narrativa (6 atos):
 *   I.   Hero · "Não somos escritório. Somos um sistema."
 *   II.  Cinco princípios · lista editorial vertical
 *   III. Protocolo VBA · diagrama interativo
 *   IV.  LOCVS · Human-Centered Spatial Intelligence (diagnóstico)
 *   V.   A Stack · LOCVS · BIMARCH · BARCH em axonometria
 *   VI.  Cláusula final · Build Beyond + CTA magnético
 */

export default function SobrePage() {
  return (
    <>
      <Nav />
      <main className="overflow-x-hidden">
        {/* Ato I · Hero editorial */}
        <HeroSobre />

        {/* Ato II · Cinco princípios inegociáveis */}
        <Pilares />

        {/* Ato III · Protocolo Verdade-Beleza-Ato (interativo) */}
        <VBATriangle />

        {/* Ato IV · LOCVS · diagnóstico psico-espacial */}
        <LOCVSDiagram />

        {/* Ato V · A stack venture builder */}
        <StackIsometric />

        {/* Ato VI · Cláusula final + CTA */}
        <ClausulaFinal />
      </main>
      <Footer />
    </>
  );
}

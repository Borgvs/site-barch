import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Sobre · Manifesto Barch",
  description:
    "Quem somos, no que acreditamos, e como traduzimos isso em método.",
};

const pillars = [
  {
    title: "Arquitetura é força cultural",
    body: "Espaços moldam comportamento, economia e cidade. Todo projeto é avaliado também pelo que gera fora dos seus limites.",
  },
  {
    title: "Estética é ética do cuidado",
    body: "Processo, canteiro, detalhe e clareza técnica são manifestações morais. A coerência é sistêmica — ou não existe.",
  },
  {
    title: "Técnica reduz ruído",
    body: "BIM, sistemas e frameworks existem para antecipar erro e gerar clareza. Tecnologia é meio, nunca fim.",
  },
  {
    title: "Mercado é campo estratégico",
    body: "Não seguimos tendências, criamos referenciais. Impacto urbano, simbólico e reputacional são variáveis econômicas reais.",
  },
  {
    title: "Rejeição ao genérico",
    body: "Se uma proposta funciona para qualquer empresa em qualquer cidade, não pertence à Barch.",
  },
];

export default function SobrePage() {
  return (
    <>
      <Nav />
      <main className="pt-36 sm:pt-44 pb-section">
        {/* Hero */}
        <section className="container-tight mb-24 text-center">
          <div className="flex justify-center mb-7">
            <span className="eyebrow-chip">
              <span className="w-1.5 h-1.5 rounded-full bg-warn" />
              MANIFESTO BARCH
            </span>
          </div>
          <h1 className="font-display text-display-xl sm:text-display-2xl text-ink mb-7 leading-[0.98] tracking-tight">
            Não somos um escritório.
            <br />
            <span className="text-muted">Somos um sistema.</span>
          </h1>
          <p className="text-body-lg text-charcoal leading-relaxed max-w-2xl mx-auto">
            A Barch é uma venture builder arquitetônica e urbana. Não é
            incorporadora, construtora nem escritório de arquitetura
            isoladamente — é todas essas coisas articuladas como sistema.
          </p>
        </section>

        {/* Pilares */}
        <section className="container-page mb-section">
          <p className="eyebrow text-center mb-3">Cinco princípios inegociáveis</p>
          <h2 className="font-display text-display-lg text-ink mb-12 max-w-3xl mx-auto text-center leading-[1.05] tracking-tight">
            O que orienta toda decisão.
          </h2>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {pillars.map((p, i) => (
              <article
                key={p.title}
                className="card-base card-hover p-8 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-display text-display-md text-muted2 tnum tracking-tight">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-display-sm text-ink leading-tight">
                    {p.title}
                  </h3>
                </div>
                <p className="text-body-sm text-charcoal leading-relaxed">{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Protocolo VBA */}
        <section className="container-tight mb-section">
          <div className="card-base p-10 sm:p-14">
            <p className="eyebrow mb-3">PROTOCOLO VBA</p>
            <h2 className="font-display text-display-lg text-ink mb-7 leading-[1.05] tracking-tight">
              Verdade · Beleza · Ato.
            </h2>
            <p className="text-body text-charcoal leading-relaxed mb-10 max-w-2xl">
              Toda comunicação relevante da Barch carrega três camadas. Operamos
              sempre no centro do triângulo.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              <VBALayer
                title="Verdade"
                body="Dados, critérios, decisões técnicas, evidência. O que é demonstrável."
              />
              <VBALayer
                title="Beleza"
                body="Metáfora ou narrativa que traduz a verdade para experiência humana."
              />
              <VBALayer
                title="Ato"
                body="Como se realiza. Etapas, responsáveis, métricas, riscos. Promessa com chão."
              />
            </div>
          </div>
        </section>

        {/* SAPP */}
        <section id="sapp" className="container-page mb-section">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="eyebrow mb-3">SAPP</p>
              <h2 className="font-display text-display-lg sm:text-display-xl text-ink leading-[1.02] mb-7 tracking-tight">
                Sistema de Avaliação Psicoarquitetônica Profunda.
              </h2>
              <p className="text-body-lg text-charcoal leading-relaxed mb-5">
                Diagnóstico que combina neurociência do espaço, fenomenologia
                aplicada e Big-Five-Espaço para mapear como cada cliente{" "}
                <em>efetivamente</em> habita.
              </p>
              <p className="text-body text-charcoal leading-relaxed">
                Aplicado antes da Proposta Comercial em todo projeto residencial.
              </p>
            </div>
            <div className="card-base aspect-square flex items-center justify-center bg-softer">
              <SAPPVisual />
            </div>
          </div>
        </section>

        {/* LOCVS */}
        <section id="locvs" className="container-page mb-section">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
            <div className="card-base aspect-square flex items-center justify-center bg-softer order-2 lg:order-1">
              <LOCVSVisual />
            </div>
            <div className="order-1 lg:order-2">
              <p className="eyebrow mb-3">LOCVS</p>
              <h2 className="font-display text-display-lg sm:text-display-xl text-ink leading-[1.02] mb-7 tracking-tight">
                Inteligência espacial centrada no humano.
              </h2>
              <p className="text-body-lg text-charcoal leading-relaxed mb-5">
                A categoria que criamos: PropTech + BIM + Digital Twin +
                psicoarquitetura. Arquitetura como sistema operacional.
              </p>
              <p className="text-body text-charcoal leading-relaxed">
                O painel Barch e o Barch.OS são as primeiras materializações
                operacionais de LOCVS.
              </p>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="container-tight">
          <div className="text-center py-12">
            <p className="font-display text-display-md sm:text-display-lg text-ink leading-[1.15] tracking-tight max-w-2xl mx-auto mb-7">
              Vamos conversar sobre o que pode nascer disso.
            </p>
            <Link href="/#contato" className="btn-ink">
              Agendar conversa
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function VBALayer({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-softer rounded-cardSm p-5 border border-rule/50">
      <p className="font-display text-display-sm text-ink mb-2 leading-tight">
        {title}.
      </p>
      <p className="text-body-sm text-charcoal leading-relaxed">{body}</p>
    </div>
  );
}

function SAPPVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-3/4 h-3/4">
      {[100, 75, 50, 30].map((r, i) => (
        <circle
          key={r}
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke={i === 0 ? "#0a0a0a" : "#bdbdb6"}
          strokeWidth={i === 0 ? 1.5 : 0.6}
          strokeDasharray={i > 0 ? "2 3" : ""}
          opacity={1 - i * 0.15}
        />
      ))}
      <circle cx="120" cy="120" r="12" fill="#0a0a0a" />
      <text x="120" y="125" textAnchor="middle" fontSize="10" fill="#FCFBF7" fontFamily="Inter, sans-serif" fontWeight="600">eu</text>
      {[{ x: 50, y: 120 }, { x: 190, y: 80 }, { x: 80, y: 190 }, { x: 195, y: 175 }].map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r="4" fill="#A23A1F" />
      ))}
    </svg>
  );
}

function LOCVSVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-3/4 h-3/4">
      {[
        { y: 175, c: "#0a0a0a" },
        { y: 135, c: "#36454F" },
        { y: 95, c: "#A23A1F" },
        { y: 55, c: "#C24A2A" },
      ].map((layer, i) => (
        <polygon
          key={i}
          points={`60,${layer.y} 120,${layer.y - 24} 180,${layer.y} 120,${layer.y + 24}`}
          fill={layer.c}
          opacity="0.92"
          stroke="#FCFBF7"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

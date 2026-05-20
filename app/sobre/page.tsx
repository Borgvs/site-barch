import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Sobre · Manifesto Barch",
  description:
    "Quem somos, no que acreditamos, e como traduzimos isso em método. Pilares, arquétipo, SAPP e LOCVS.",
};

export default function SobrePage() {
  return (
    <>
      <Nav />
      <main className="pt-40 sm:pt-48 pb-section">
        {/* Hero · Sobre */}
        <section className="container-tight mb-24">
          <span className="eyebrow-chip eyebrow-chip-warn mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
            MANIFESTO BARCH
          </span>
          <h1 className="font-display text-display-xl sm:text-display-2xl text-ink mb-7 leading-[0.98] tracking-tight">
            Não somos um escritório.
            <br />
            <span className="text-gradient-warn italic">Somos um sistema.</span>
          </h1>
          <p className="text-body-lg text-charcoal leading-relaxed max-w-2xl">
            A Barch é uma <strong>venture builder arquitetônica e urbana</strong>.
            Não é incorporadora, construtora nem escritório de arquitetura
            isoladamente — é todas essas coisas articuladas como sistema.
            Desenvolve empreendimentos, projetos e negócios como ecossistemas
            culturais, econômicos, espaciais e simbólicos integrados.
          </p>
        </section>

        {/* Pilares · 5 princípios inegociáveis */}
        <section className="container-page mb-section">
          <p className="eyebrow mb-3">Cinco princípios inegociáveis</p>
          <h2 className="font-display text-display-lg text-ink mb-12 max-w-3xl leading-[1.05]">
            O que orienta toda decisão que tomamos.
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <article
                key={p.title}
                className="glass rounded-glass p-8 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-display text-display-md text-gradient-warn tnum">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-display-sm text-ink leading-tight">
                    {p.title}
                  </h3>
                </div>
                <p className="text-body text-charcoal leading-relaxed">{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Protocolo VBA */}
        <section className="container-tight mb-section">
          <div className="glass-deep rounded-glass p-10 sm:p-14 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(162, 58, 31, 0.08), transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <p className="eyebrow text-warn mb-3">PROTOCOLO VBA</p>
              <h2 className="font-display text-display-lg text-ink mb-7 leading-[1.05]">
                Verdade · Beleza · Ato.
              </h2>
              <p className="text-body-lg text-charcoal leading-relaxed mb-10 max-w-2xl">
                Toda comunicação relevante da Barch carrega três camadas
                simultâneas. Operamos sempre no centro do triângulo.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                <VBALayer
                  title="Verdade"
                  body="Dados, critérios, decisões técnicas, evidência. O que é demonstrável."
                />
                <VBALayer
                  title="Beleza"
                  body="Metáfora ou narrativa que traduz a verdade para experiência humana — sem substituí-la."
                />
                <VBALayer
                  title="Ato"
                  body="Como se realiza. Etapas, responsáveis, métricas, riscos. Promessa com chão."
                />
              </div>
              <p className="text-body-sm text-muted mt-10 italic">
                Beleza sem Verdade = marketing vazio. Verdade sem Beleza =
                discurso mecânico. Ambos sem Ato = promessa sem chão.
              </p>
            </div>
          </div>
        </section>

        {/* SAPP */}
        <section id="sapp" className="container-page mb-section">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <p className="eyebrow mb-3">SAPP</p>
              <h2 className="font-display text-display-lg sm:text-display-xl text-ink leading-[1.05] mb-7">
                Sistema de Avaliação{" "}
                <span className="italic text-gradient-warn">Psicoarquitetônica</span> Profunda.
              </h2>
              <p className="text-body-lg text-charcoal leading-relaxed mb-5">
                Diagnóstico que combina neurociência do espaço, fenomenologia
                aplicada e Big-Five-Espaço para mapear como cada cliente
                <em> efetivamente</em> habita.
              </p>
              <p className="text-body text-charcoal leading-relaxed mb-7">
                Processamento neural hierárquico (prospect-refuge →
                coerência-complexidade → legibilidade-mistério), arquétipos
                espaciais e referencial Pallasmaa · Zumthor · Alexander ·
                Bachelard. Aplicado antes da Proposta Comercial em todo
                projeto residencial.
              </p>
              <Link href="/sobre#processo" className="btn-secondary">
                Como aplicamos →
              </Link>
            </div>
            <div className="glass rounded-glass p-8 aspect-square flex items-center justify-center relative overflow-hidden">
              <SAPPVisual />
            </div>
          </div>
        </section>

        {/* LOCVS */}
        <section id="locvs" className="container-page mb-section">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <div className="glass rounded-glass p-8 aspect-square flex items-center justify-center relative overflow-hidden order-2 lg:order-1">
              <LOCVSVisual />
            </div>
            <div className="order-1 lg:order-2">
              <p className="eyebrow mb-3">LOCVS</p>
              <h2 className="font-display text-display-lg sm:text-display-xl text-ink leading-[1.05] mb-7">
                Inteligência espacial{" "}
                <span className="italic text-gradient-warn">centrada no humano</span>.
              </h2>
              <p className="text-body-lg text-charcoal leading-relaxed mb-5">
                A categoria que criamos: PropTech + BIM + Digital Twin +
                psicoarquitetura. Não é &ldquo;tecnologia em arquitetura&rdquo; — é
                arquitetura como sistema operacional.
              </p>
              <p className="text-body text-charcoal leading-relaxed">
                O painel Barch e o Barch.OS são as primeiras materializações
                operacionais de LOCVS. Tecnologia que reduz ruído, devolve
                clareza, antecipa erro — sem nunca substituir o ofício humano.
              </p>
            </div>
          </div>
        </section>

        {/* Cláusula final */}
        <section className="container-tight">
          <blockquote className="text-center py-16">
            <p className="font-display text-display-md sm:text-display-lg text-ink italic leading-[1.2] mb-5 max-w-3xl mx-auto">
              &ldquo;Resistiria à crítica de arquitetos, investidores e
              construtores de alto nível interessados em verdade, coerência e
              resultado?&rdquo;
            </p>
            <p className="text-body text-charcoal max-w-xl mx-auto">
              Se não, refinamos. Antes de qualquer entrega.
            </p>
          </blockquote>
        </section>
      </main>
      <Footer />
    </>
  );
}

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

function VBALayer({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-paperPure/60 backdrop-blur-sm rounded-card p-5 border border-rule/40">
      <p className="font-display text-display-sm text-warn italic mb-2 leading-tight">
        {title}.
      </p>
      <p className="text-body-sm text-charcoal leading-relaxed">{body}</p>
    </div>
  );
}

function SAPPVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      <defs>
        <radialGradient id="sapp-grad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#A23A1F" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#A23A1F" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Camadas concêntricas representando processamento neural hierárquico */}
      <circle cx="120" cy="120" r="100" fill="url(#sapp-grad)" />
      {[100, 75, 50, 30].map((r, i) => (
        <circle
          key={r}
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke={i === 0 ? "#A23A1F" : "#36454F"}
          strokeWidth={i === 0 ? 1.5 : 0.6}
          strokeDasharray={i > 0 ? "2 3" : ""}
          opacity={1 - i * 0.2}
        />
      ))}
      {/* Nó central · cliente */}
      <circle cx="120" cy="120" r="14" fill="#0e0e0e" />
      <text
        x="120"
        y="126"
        textAnchor="middle"
        fontSize="11"
        fill="#FCFBF7"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
      >
        eu
      </text>
      {/* Marcadores nas camadas · dimensões */}
      {[
        { x: 50, y: 120, label: "prospect" },
        { x: 195, y: 80, label: "refúgio" },
        { x: 80, y: 195, label: "mistério" },
        { x: 190, y: 175, label: "legibilidade" },
      ].map((m) => (
        <g key={m.label}>
          <circle cx={m.x} cy={m.y} r="5" fill="#A23A1F" />
          <text
            x={m.x}
            y={m.y - 9}
            textAnchor="middle"
            fontSize="9"
            fill="#36454F"
            fontFamily="Inter, sans-serif"
            fontStyle="italic"
          >
            {m.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function LOCVSVisual() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      {/* Grid arquitetônica + camadas LOCVS */}
      <defs>
        <pattern id="locvs-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" stroke="#dcd9cf" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>
      <rect width="240" height="240" fill="url(#locvs-grid)" opacity="0.5" />
      {/* 4 camadas LOCVS · paralelogramo isométrico empilhado */}
      {[
        { y: 175, c: "#0e0e0e", lbl: "Espaço" },
        { y: 135, c: "#36454F", lbl: "Sistema" },
        { y: 95, c: "#A23A1F", lbl: "Cognição" },
        { y: 55, c: "#C24A2A", lbl: "Cliente" },
      ].map((layer) => (
        <g key={layer.lbl}>
          <polygon
            points={`60,${layer.y} 120,${layer.y - 24} 180,${layer.y} 120,${layer.y + 24}`}
            fill={layer.c}
            opacity="0.92"
            stroke="#FCFBF7"
            strokeWidth="1"
          />
          <text
            x="120"
            y={layer.y + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#FCFBF7"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            {layer.lbl}
          </text>
        </g>
      ))}
    </svg>
  );
}

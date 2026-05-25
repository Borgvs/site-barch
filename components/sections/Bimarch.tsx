"use client";

/**
 * Bimarch — Obra em tempo real.
 *
 * Estrutura (post-FGAA-BIM v1.0):
 *  1. Scroll-driven canvas pinado (400vh) mostrando a obra crescendo do
 *     terreno marcado (B0) até a casa pronta vista de drone (B5).
 *     Overlay técnico documental muda por camada.
 *  2. Editorial content abaixo: 4 problemas resolvidos + 3 decisões
 *     culturais (mantido da versão v9.2).
 *
 * O scroll-driven canvas usa o mesmo padrão arquitetural do hero:
 *  - GSAP ScrollTrigger.pin
 *  - Canvas-based frame sequence (200 frames webp)
 *  - progressRef compartilhado entre canvas e annotations overlay
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DURATION } from "@/lib/motion";
import { Tilt } from "@/components/system/Tilt";
import { BimFrameSequence } from "./BimFrameSequence";
import { BimLayerAnnotations } from "./BimLayerAnnotations";
import { BimTopOverlay } from "./BimTopOverlay";
import {
  loadBimManifest,
  type BimFramesManifest,
} from "@/lib/bim-frames-manifest";
import { BIM_LAYERS } from "@/lib/bim-layers-config";

gsap.registerPlugin(ScrollTrigger);

const problemas = [
  {
    name: "Decisão única",
    role: "Acesso compartilhado",
    detail:
      "Toda decisão técnica versionada e acessível a quem decide, projeta e executa — pelo mesmo endereço, ao mesmo tempo. Nenhuma versão paralela rodando em paralelo.",
  },
  {
    name: "Detalhe no bolso",
    role: "Quem executa, vê",
    detail:
      "O detalhe aprovado chega ao mestre de obras pelo celular. O canteiro deixa de ser ilha e vira ponto vivo do projeto. Erro de leitura cai a zero.",
  },
  {
    name: "Erro antecipado",
    role: "Antes da concretagem",
    detail:
      "Centenas de verificações automáticas a cada entrega. Conflito que aparece no projeto custa horas. Conflito no canteiro custa contratos.",
  },
  {
    name: "Orçamento amarrado",
    role: "Ao avanço real",
    detail:
      "Quantitativos extraídos direto do projeto. Cronograma físico-financeiro acoplado ao que está sendo executado — não ao que foi prometido.",
  },
];

const principles = [
  {
    title: "Tecnologia como antídoto, não como espetáculo.",
    body: "O cliente não escolhe Barch pelas ferramentas que usamos. Escolhe porque o método elimina retrabalho antes da execução começar — e o resultado aparece no prazo, no custo e no cuidado.",
  },
  {
    title: "Coordenação antes da concretagem.",
    body: "Cada disciplina conversa com a outra no projeto único. Quando a estrutura sobe, a hidráulica e a elétrica já se conhecem. Quando o acabamento entra, ninguém quebra o que está pronto.",
  },
  {
    title: "Transparência sem vitrine.",
    body: "O cliente acompanha o que está sob controle e o que ainda não está. Sem maquiagem de relatório, sem surpresa de canteiro, sem a indústria milenar do esconder.",
  },
];

/* -----------------------------------------------------------------------
 * Scroll-driven canvas section
 *
 * v10.5: timeline B0..B5 e status "Progresso BIM" agora vivem DENTRO do
 * canvas (via BimTopOverlay), no topo da animação · sincronizados com
 * progressRef do scroll. Antes a timeline ficava antes do canvas como
 * bloco estático separado — desconectada da animação real.
 * ---------------------------------------------------------------------- */

function BimScrollCanvas({ manifest }: { manifest: BimFramesManifest }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current || !stickyRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(
        { p: 0 },
        {
          p: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            pin: stickyRef.current,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              progressRef.current = st.progress;
            },
          },
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-ink text-paper"
      style={{ height: "400vh" }}
      aria-label="Obra em tempo real · vista drone das fases construtivas"
      data-nav-dark="true"
    >
      <div
        ref={stickyRef}
        className="absolute top-0 left-0 h-screen w-full overflow-hidden bg-ink"
        style={{ willChange: "transform" }}
      >
        <BimFrameSequence manifest={manifest} progressRef={progressRef} />

        {/* Timeline B0..B5 integrada ao topo do canvas · sincroniza com scroll */}
        <BimTopOverlay progressRef={progressRef} />

        {/* Gradient overlay topo e base para legibilidade do overlay técnico */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55"
        />

        {/* Vignette discreta */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.38) 100%)",
          }}
        />

        {/* Overlay técnico documental */}
        <BimLayerAnnotations progressRef={progressRef} />

        {/* Fade interno · base do canvas BIM funde com anthra do body.
            Não é faixa horizontal entre seções · é overlay sobre a animação
            que cria sensação de mesclagem com o fundo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh]"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(15,17,20,0.45) 35%, rgba(25,27,30,0.85) 70%, rgba(37,39,42,1) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Fallback mobile: carrossel horizontal das 6 anchors (B0..B5).
 *
 * Usado em <768px e reduced-motion. Preserva a narrativa construtiva
 * que o scroll-driven canvas entrega no desktop. Cada slide tem:
 *  - frame de anchor (frame index correspondente)
 *  - eyebrow + label + metric + client copy
 *  - paginação inferior (dots + label)
 *
 * Swipe nativo via scroll-snap horizontal — sem JS de gesture.
 * ---------------------------------------------------------------------- */

// Frame index aproximado de cada anchor B0..B5 sobre 200 frames totais.
// Início de cada range em bim-layers-config × 200, ajustado para o "meio" da fase.
const ANCHOR_FRAMES = [
  { code: "B0", frame: 1 },     // 0 → ~0.005
  { code: "B1", frame: 50 },    // 0.25
  { code: "B2", frame: 90 },    // 0.45
  { code: "B3", frame: 125 },   // 0.625
  { code: "B4", frame: 160 },   // 0.80
  { code: "B5", frame: 200 },   // 1.0
];

function BimMobileCarousel() {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Detecta slide ativo via scroll position
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      const idx = Math.round(el.scrollLeft / w);
      setActive(Math.max(0, Math.min(BIM_LAYERS.length - 1, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative w-full bg-ink text-paper">
      {/* Scroller horizontal com scroll-snap */}
      <div
        ref={scrollerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {BIM_LAYERS.map((layer, i) => {
          const anchor = ANCHOR_FRAMES[i];
          const padded = String(anchor.frame).padStart(4, "0");
          return (
            <article
              key={layer.code}
              className="snap-center shrink-0 w-full relative"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-ink">
                <img
                  src={`/bim-frames/frame_${padded}.webp?v=1.0`}
                  alt={`${layer.code} · ${layer.label}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/65" />
                <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
                  <div>
                    <p className="text-[9px] tracking-[0.32em] uppercase text-paper/65 font-medium font-mono mb-1">
                      Vista canteiro
                    </p>
                    <p
                      className="font-display text-[24px] text-paper leading-none tracking-[-0.02em]"
                      style={{ fontWeight: 900 }}
                    >
                      {layer.code}
                    </p>
                  </div>
                  <p className="font-mono text-[14px] text-paper leading-none tnum mt-1">
                    {String(i + 1).padStart(2, "0")}/{String(BIM_LAYERS.length).padStart(2, "0")}
                  </p>
                </div>
              </div>
              {/* Texto editorial abaixo do frame (mobile-friendly) */}
              <div className="px-5 py-6 bg-ink">
                <p className="text-[10px] tracking-[0.32em] uppercase text-paper/65 font-medium mb-3">
                  {layer.eyebrow}
                </p>
                <h3
                  className="font-display text-paper leading-[0.98] tracking-[-0.028em] mb-4"
                  style={{ fontWeight: 900, fontSize: "clamp(24px, 7vw, 36px)" }}
                >
                  {layer.label}
                </h3>
                <p className="text-[12px] text-paper/85 font-mono leading-relaxed mb-3">
                  {layer.metric}
                </p>
                <p className="text-[14px] text-paper/80 leading-[1.55] italic">
                  {layer.client}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Paginação · dots clicáveis */}
      <div className="bg-ink pb-8 pt-2 flex items-center justify-center gap-3">
        {BIM_LAYERS.map((layer, i) => (
          <button
            key={layer.code}
            onClick={() => goTo(i)}
            aria-label={`Ir para fase ${layer.code} · ${layer.label}`}
            className="group flex flex-col items-center gap-1.5 p-1"
          >
            <span
              className={`h-1 transition-all duration-500 ${
                active === i
                  ? "w-8 bg-navy"
                  : "w-4 bg-navy/25 group-hover:bg-navy/50"
              }`}
            />
            <span
              className={`font-mono text-[9px] tracking-wider transition-colors ${
                active === i ? "text-paper" : "text-paper/45"
              }`}
            >
              {layer.code}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Fallback estático original (kept as final fallback if both scroll &
 * carousel fail — e.g. reduced-motion AND no JS).
 * ---------------------------------------------------------------------- */

function BimStaticFallback() {
  return (
    <div className="relative w-full bg-ink text-paper overflow-hidden">
      <div className="aspect-[16/9] relative">
        <img
          src="/bim-frames/frame_0200.webp"
          alt="Obra em tempo real · vista drone da casa pronta · projeto-tese Barch"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
          <p className="text-[10px] tracking-[0.32em] uppercase text-paper/65 font-medium font-mono mb-1">
            Mesma obra · vista canteiro
          </p>
          <p
            className="font-display text-[28px] sm:text-[36px] text-paper leading-none tracking-[-0.02em]"
            style={{ fontWeight: 900 }}
          >
            B5
          </p>
        </div>
        <div className="absolute left-6 sm:left-10 right-6 sm:right-auto sm:max-w-[640px] bottom-12">
          <p className="text-[11px] tracking-[0.32em] uppercase text-paper/70 font-medium mb-3">
            Federado · entrega documentada
          </p>
          <h3
            className="font-display text-paper leading-[0.96] tracking-[-0.028em]"
            style={{ fontWeight: 900, fontSize: "clamp(28px, 5.5vw, 56px)" }}
          >
            A obra entregue continua viva no modelo.
          </h3>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------------
 * Wrapper · decide scroll-driven vs fallback
 * ---------------------------------------------------------------------- */

function BimVisual() {
  const [manifest, setManifest] = useState<BimFramesManifest | null>(null);
  const [mode, setMode] = useState<
    "loading" | "scroll" | "carousel" | "fallback"
  >("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isWideEnough = window.innerWidth >= 768;

    loadBimManifest().then((m) => {
      if (!m) {
        setMode("fallback");
        return;
      }
      setManifest(m);
      // Decision tree:
      //   Wide + motion OK → scroll-driven canvas
      //   Narrow OR reduced-motion → mobile carousel (6 anchors swipeable)
      //   No JS / no manifest → static B5
      if (!isWideEnough || prefersReducedMotion) {
        setMode("carousel");
      } else {
        setMode("scroll");
      }
    });
  }, []);

  if (mode === "loading") {
    return (
      <div
        className="relative w-full aspect-[16/9] bg-ink animate-pulse"
        aria-hidden
      />
    );
  }
  if (mode === "fallback" || !manifest) return <BimStaticFallback />;
  if (mode === "carousel") return <BimMobileCarousel />;
  return <BimScrollCanvas manifest={manifest} />;
}

/* -----------------------------------------------------------------------
 * Bimarch (main export)
 * ---------------------------------------------------------------------- */

export function Bimarch() {
  return (
    <section id="bim" className="relative bg-navyDeep">
      {/* Header editorial — antes do scroll canvas */}
      <div className="container-page py-section sm:py-sectionLg">
        <div className="mb-16 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6"
          >
            Processo BIM · obra em tempo real
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: DURATION.base,
              ease: EASE.out,
              delay: 0.08,
            }}
            className="font-display text-paper leading-[0.94] tracking-[-0.028em] mb-7"
            style={{
              fontWeight: 900,
              fontSize: "clamp(42px, 9vw, 84px)",
            }}
          >
            O BIM é
            <br />
            <span className="text-paper/55">o sistema operacional</span>
            <br />
            do empreendimento.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: DURATION.base,
              ease: EASE.out,
              delay: 0.16,
            }}
            className="text-body-lg text-paper/85 leading-[1.55] max-w-2xl"
          >
            Cada decisão técnica nasce no modelo, vive no canteiro e termina no
            ativo digital do imóvel.{" "}
            <span className="text-paper font-medium">
              Seis fases construtivas — do terreno marcado à entrega — todas com
              a mesma verificação técnica que o cliente acompanha pelo painel.
            </span>{" "}
            Sem maquiagem, sem versão paralela, sem o silêncio que esse mercado
            vende.
          </motion.p>
        </div>
        {/* v10.5 · Timeline B0..B5 migrou para o topo do canvas (BimTopOverlay),
            sincronizada com o scroll real da animação. */}
      </div>

      {/* Scroll-driven canvas — 400vh com pin */}
      <BimVisual />

      {/* Editorial reforço — 4 problemas resolvidos + 3 princípios */}
      <div className="container-page py-section sm:py-sectionLg">
        <div className="mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-8"
          >
            Quatro problemas resolvidos
          </motion.p>

          {/* v10.5 · auto-rows-fr no grid + h-full em cada nível garante alinhamento
              perfeito de todos os cards · alturas idênticas independente do
              tamanho do parágrafo `detail`. */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 items-stretch sm:auto-rows-fr">
            {problemas.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 22, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: DURATION.slow,
                  delay: i * 0.07,
                  ease: EASE.out,
                }}
                className="h-full"
              >
                <Tilt max={8} scale={1.02} className="h-full">
                  <article className="glass-card group relative p-7 lg:p-8 h-full flex flex-col">
                    <div className="flex items-baseline justify-between mb-6">
                      <span
                        className="font-display text-[36px] leading-none tnum tracking-[-0.04em]"
                        style={{
                          fontWeight: 900,
                          background:
                            "linear-gradient(180deg, rgba(242,242,242,0.12) 0%, rgba(242,242,242,0.38) 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="h-px w-6 bg-paper/20 transition-all duration-500 group-hover:w-12 group-hover:bg-paper" />
                    </div>
                    <h3
                      className="font-display text-[18px] sm:text-[20px] leading-tight mb-1.5 tracking-[-0.02em] text-gradient-ink"
                      style={{ fontWeight: 700 }}
                    >
                      {t.name}
                    </h3>
                    <p className="text-[10.5px] tracking-[0.28em] uppercase text-paper/55 font-medium mb-4 min-h-[2em]">
                      {t.role}
                    </p>
                    <p className="text-body-sm text-paper/85 leading-[1.65] flex-1">
                      {t.detail}
                    </p>
                  </article>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Princípios — três decisões culturais */}
        <div className="grid lg:grid-cols-[1fr_1.45fr] gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
          >
            <p className="text-[11px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-6">
              Decisões aparentemente técnicas
            </p>
            <h3
              className="font-display text-display-lg text-paper leading-[0.98] tracking-[-0.028em]"
              style={{ fontWeight: 900 }}
            >
              Três decisões
              <br />
              que parecem técnicas.
              <br />
              <span className="text-paper/55">São culturais.</span>
            </h3>
          </motion.div>

          <div className="space-y-10 lg:space-y-12">
            {principles.map((p, i) => (
              <motion.article
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: DURATION.base,
                  delay: i * 0.08,
                  ease: EASE.out,
                }}
                className="group relative pl-8 border-l border-ruleDark transition-colors duration-500 hover:border-ink/50"
              >
                <div
                  aria-hidden
                  className="absolute left-0 top-0 h-0 w-px bg-paper transition-all duration-700 group-hover:h-full"
                />
                <h4 className="font-display text-[22px] sm:text-[26px] text-paper leading-[1.18] tracking-[-0.018em] mb-3">
                  {p.title}
                </h4>
                <p className="text-body text-paper/85 leading-[1.65]">
                  {p.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

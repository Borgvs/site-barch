"use client";

/**
 * BimTopOverlay — Timeline B0..B5 + status "Progresso BIM" integrados ao
 * topo do canvas scroll-driven do Bimarch. v10.5.
 *
 * Substitui o bloco estático <BimPhasesTimeline /> que vivia antes do canvas
 * (desconectado do scroll real). Agora a timeline acompanha o progresso real
 * da animação · nó ativo destacado em clay sólido · nós passados em clay
 * leve · nós futuros em paper/25.
 *
 * Também substitui o chip "Mesma obra · vista canteiro" (top-left) e o
 * "Progresso BIM" (bottom-right) que existiam no BimLayerAnnotations — esses
 * agora vivem aqui, juntos, no topo, integrados à timeline.
 */

import {
  useEffect,
  useState,
  type MutableRefObject,
} from "react";
import {
  BIM_LAYERS,
  activeBimLayer,
  type BimLayer,
} from "@/lib/bim-layers-config";

interface Props {
  progressRef: MutableRefObject<number>;
}

export function BimTopOverlay({ progressRef }: Props) {
  const [layer, setLayer] = useState<BimLayer>(BIM_LAYERS[0]);
  const [progressDisplay, setProgressDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let lastCode = BIM_LAYERS[0].code;
    const tick = () => {
      const p = progressRef.current;
      const next = activeBimLayer(p);
      if (next.code !== lastCode) {
        setLayer(next);
        lastCode = next.code;
      }
      setProgressDisplay(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  const idx = BIM_LAYERS.findIndex((l) => l.code === layer.code);
  const totalLayers = BIM_LAYERS.length;
  // Trim trailing period from label for inline display next to code
  const phaseLabel = layer.label.replace(/\.$/, "");

  return (
    <div
      className="absolute top-0 inset-x-0 z-20 pointer-events-none"
      // Tabulado abaixo do nav (top-20 mobile, top-24 desktop · ~80-96px)
      style={{ paddingTop: "clamp(96px, 12vh, 128px)" }}
    >
      <div className="px-6 sm:px-10 max-w-6xl mx-auto">
        {/* Header row · code + label da fase + phase index */}
        <div className="flex items-end justify-between gap-6 mb-5">
          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-paper/55 font-medium font-mono mb-2">
              Progresso BIM · obra em tempo real
            </p>
            <div className="flex items-baseline gap-3 sm:gap-4 fade-in-key" key={layer.code}>
              <span
                className="font-display text-paper leading-none tracking-[-0.02em]"
                style={{ fontWeight: 900, fontSize: "clamp(28px, 4.4vw, 48px)" }}
              >
                {layer.code}
              </span>
              <span
                className="text-[13px] sm:text-[15px] text-paper/85 font-medium leading-tight"
                style={{ maxWidth: "min(60vw, 420px)" }}
              >
                {phaseLabel}
              </span>
            </div>
          </div>

          {/* Phase index N/06 */}
          <p
            className="font-mono text-[12px] sm:text-[13px] text-paper/65 tnum"
            style={{ fontWeight: 600 }}
          >
            {String(idx + 1).padStart(2, "0")} / {String(totalLayers).padStart(2, "0")}
          </p>
        </div>

        {/* Timeline horizontal · 6 nós conectados */}
        <div className="relative">
          {/* Linha base · paper/15 */}
          <div
            className="absolute top-[7px] left-0 right-0 h-px bg-paper/15"
            aria-hidden
          />
          {/* Linha de progresso real · clay · width = progress * 100% */}
          <div
            aria-hidden
            className="absolute top-[7px] left-0 h-px bg-accent origin-left transition-[width] duration-300 ease-out"
            style={{ width: `${Math.min(100, progressDisplay * 100)}%` }}
          />

          {/* 6 nós */}
          <div className="relative grid grid-cols-6 gap-1.5 sm:gap-3">
            {BIM_LAYERS.map((phase, i) => {
              const isActive = i === idx;
              const isPassed = i < idx;
              return (
                <div key={phase.code} className="flex flex-col items-start">
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      isActive
                        ? "h-[15px] w-[15px] bg-accent"
                        : isPassed
                          ? "h-[11px] w-[11px] mt-[2px] bg-accent/70"
                          : "h-[11px] w-[11px] mt-[2px] bg-paper/22"
                    }`}
                    aria-hidden
                    style={
                      isActive
                        ? { boxShadow: "0 0 0 4px rgba(156,114,89,0.22), 0 0 24px rgba(156,114,89,0.30)" }
                        : undefined
                    }
                  />
                  <span
                    className={`font-mono text-[9.5px] sm:text-[10px] tracking-[0.18em] tnum mt-2.5 transition-colors duration-500 ${
                      isActive
                        ? "text-paper"
                        : isPassed
                          ? "text-paper/65"
                          : "text-paper/40"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {phase.code}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSS local de fade-in para text key change */}
      <style jsx>{`
        .fade-in-key {
          animation: fadeInKey 0.55s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        @keyframes fadeInKey {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

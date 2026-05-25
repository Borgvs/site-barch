"use client";

/**
 * BimLayerAnnotations — overlay técnico documental que muda conforme a
 * camada BIM ativa no scroll. Mostra:
 *  - código + nome da fase (canto superior esquerdo)
 *  - eyebrow + label monumental (centro-esquerda)
 *  - metric técnica + frase cliente (canto inferior esquerdo)
 *  - índice de fase (1/6, 2/6...) e barra de progresso (lateral direita)
 *
 * Transições suaves via opacidade quando muda de camada.
 */

import { useEffect, useState, type MutableRefObject } from "react";
import {
  BIM_LAYERS,
  activeBimLayer,
  type BimLayer,
} from "@/lib/bim-layers-config";

interface Props {
  progressRef: MutableRefObject<number>;
}

export function BimLayerAnnotations({ progressRef }: Props) {
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

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Code chip · top-left */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
        <p className="text-[10px] tracking-[0.32em] uppercase text-paper/65 font-medium font-mono mb-1">
          Mesma obra · vista canteiro
        </p>
        <p
          className="font-display text-[28px] sm:text-[36px] text-paper leading-none tracking-[-0.02em]"
          style={{ fontWeight: 900 }}
        >
          {layer.code}
        </p>
      </div>

      {/* Phase index · top-right */}
      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 text-right">
        <p className="text-[10px] tracking-[0.32em] uppercase text-paper/65 font-medium font-mono mb-1">
          Fase
        </p>
        <p
          className="font-mono text-[18px] text-paper leading-none tnum"
          style={{ fontWeight: 600 }}
        >
          {String(idx + 1).padStart(2, "0")}/{String(totalLayers).padStart(2, "0")}
        </p>
      </div>

      {/* Heading central-left · grande, BLACK */}
      <div
        className="absolute left-6 sm:left-10 right-6 sm:right-auto sm:max-w-[640px]"
        style={{ top: "42%", transform: "translateY(-50%)" }}
        key={layer.code}
      >
        <p className="text-[11px] tracking-[0.32em] uppercase text-paper/70 font-medium mb-4 fade-in-soft">
          {layer.eyebrow}
        </p>
        <h3
          className="font-display text-paper leading-[0.96] tracking-[-0.028em] fade-in-soft"
          style={{
            fontWeight: 900,
            fontSize: "clamp(28px, 5.5vw, 56px)",
          }}
        >
          {layer.label}
        </h3>
      </div>

      {/* Metric + client copy · bottom-left */}
      <div
        className="absolute bottom-12 left-6 sm:bottom-16 sm:left-10 max-w-md"
        key={`bottom-${layer.code}`}
      >
        <div className="h-px w-12 bg-paper/45 mb-4 fade-in-soft" />
        <p className="text-[12px] tracking-[0.04em] text-paper/90 font-mono leading-relaxed mb-3 fade-in-soft">
          {layer.metric}
        </p>
        <p className="text-[14px] sm:text-[15px] text-paper/85 leading-[1.55] italic fade-in-soft">
          {layer.client}
        </p>
      </div>

      {/* Progress bar · lateral direita */}
      <div className="absolute bottom-12 right-6 sm:bottom-16 sm:right-10 flex flex-col items-end gap-2">
        <p className="text-[10px] tracking-[0.32em] uppercase text-paper/55 font-medium font-mono">
          Progresso BIM
        </p>
        <div className="h-px w-32 bg-paper/20 overflow-hidden">
          <div
            className="h-px bg-paper transition-[width] duration-150 ease-out"
            style={{ width: `${progressDisplay * 100}%` }}
          />
        </div>
      </div>

      {/* CSS local de fade-in para text key change */}
      <style jsx>{`
        .fade-in-soft {
          animation: fadeInSoft 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        @keyframes fadeInSoft {
          from {
            opacity: 0;
            transform: translateY(6px);
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

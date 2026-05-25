"use client";

/**
 * BimLayerAnnotations — overlay técnico documental que muda conforme a
 * camada BIM ativa no scroll. Mostra:
 *  - eyebrow + label monumental (centro-esquerda)
 *  - metric técnica + frase cliente (canto inferior esquerdo)
 *
 * v10.5: code chip top-left, phase index top-right e progress bar
 * bottom-right migraram para BimTopOverlay, integrados à timeline
 * B0..B5 no topo do canvas.
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
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Heading central-left · grande, BLACK (mais baixo agora · timeline no topo) */}
      <div
        className="absolute left-6 sm:left-10 right-6 sm:right-auto sm:max-w-[640px]"
        style={{ top: "52%", transform: "translateY(-50%)" }}
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
        className="absolute bottom-12 left-6 sm:bottom-16 sm:left-10 right-6 sm:right-auto sm:max-w-md"
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

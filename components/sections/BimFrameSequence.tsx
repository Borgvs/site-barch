"use client";

/**
 * BimFrameSequence — canvas-driven sequência de frames BIM (B0→B5).
 *
 * Estrutura paralela ao HeroFrameSequence, mas com particularidades:
 *  - Fundo do canvas claro (paper) para casar com o resto da seção
 *  - Loading state em paper, não em ink
 *  - Aspect cover, mesmo padrão DPR ≤ 2
 */

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  buildBimFramePath,
  type BimFramesManifest,
} from "@/lib/bim-frames-manifest";

interface Props {
  manifest: BimFramesManifest;
  progressRef: MutableRefObject<number>;
  onLoadProgress?: (percent: number) => void;
}

export function BimFrameSequence({
  manifest,
  progressRef,
  onLoadProgress,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastDrawnRef = useRef<number>(-1);
  const [loadedCount, setLoadedCount] = useState(0);
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  useEffect(() => {
    const total = manifest.count;
    const images: HTMLImageElement[] = new Array(total);
    let loaded = 0;
    let canceled = false;

    const onOne = (i: number) => {
      if (canceled) return;
      loaded++;
      setLoadedCount(loaded);
      onLoadProgress?.(loaded / total);
      if (i === 0) draw(0);
    };

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = buildBimFramePath(manifest, i);
        img.onload = () => {
          images[i] = img;
          onOne(i);
          resolve();
        };
        img.onerror = () => {
          onOne(i);
          resolve();
        };
      });

    const posters = [
      0,
      Math.floor(total * 0.2),
      Math.floor(total * 0.4),
      Math.floor(total * 0.6),
      Math.floor(total * 0.8),
      total - 1,
    ];
    Promise.all(posters.map(loadOne)).then(async () => {
      if (canceled) return;
      const indices = Array.from({ length: total }, (_, i) => i).filter(
        (i) => !posters.includes(i),
      );
      const pool = 8;
      const queue = indices.slice();
      const workers = Array.from({ length: pool }).map(async () => {
        while (queue.length && !canceled) {
          const idx = queue.shift();
          if (idx === undefined) break;
          await loadOne(idx);
        }
      });
      await Promise.all(workers);
      if (!canceled && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });

    imagesRef.current = images;
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest.count, manifest.prefix, manifest.extension, manifest.version]);

  useEffect(() => {
    const handle = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = Math.floor(window.innerWidth * dpr);
      c.height = Math.floor(window.innerHeight * dpr);
      c.style.width = "100%";
      c.style.height = "100%";
      draw(lastDrawnRef.current >= 0 ? lastDrawnRef.current : 0);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tick = () => {
      const total = manifest.count;
      const idx = Math.min(
        total - 1,
        Math.max(0, Math.round(progressRef.current * (total - 1))),
      );
      if (idx !== lastDrawnRef.current) draw(idx);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest.count]);

  function draw(index: number) {
    const c = canvasRef.current;
    const img = imagesRef.current[index];
    if (!c || !img || !img.complete) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    lastDrawnRef.current = index;

    const cw = c.width;
    const ch = c.height;
    const iw = img.naturalWidth || manifest.width;
    const ih = img.naturalHeight || manifest.height;
    const r = Math.max(cw / iw, ch / ih);
    const w = iw * r;
    const h = ih * r;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, x, y, w, h);
  }

  const percent = (loadedCount / manifest.count) * 100;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "#F7F5EE" }}
      />
      {percent < 12 && (
        <div
          aria-live="polite"
          className="absolute inset-0 z-30 flex items-center justify-center bg-softer/95 backdrop-blur-sm pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-32 bg-ink/15 overflow-hidden">
              <div
                className="h-px bg-ink transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(8, percent)}%` }}
              />
            </div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-muted2 font-medium">
              Carregando obra · {Math.round(percent)}%
            </p>
          </div>
        </div>
      )}
    </>
  );
}

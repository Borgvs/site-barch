"use client";

/**
 * HeroFrameSequence — Canvas-driven frame sequence (Kling 3.0 pipeline).
 *
 * Renderiza 240 (ou N) frames .webp em fullscreen canvas, controlados pelo
 * mesmo progressRef do orchestrator. Substitui ConstructionScene (Three.js)
 * quando /public/frames/manifest.json existe.
 *
 * Estratégia de preload:
 *  1. Primeiro frame imediato (blocking, ~50KB)
 *  2. Frames 0, 60, 120, 180, 239 carregados em paralelo (poster grid)
 *  3. Restante em background, throttled (8 concurrent)
 *  4. Mostra progress de loading no overlay
 *
 * Resize: redesenha o frame atual no resize, mantém aspect ratio cover.
 */

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  buildFramePath,
  type FramesManifest,
} from "@/lib/frames-manifest";

interface HeroFrameSequenceProps {
  manifest: FramesManifest;
  progressRef: MutableRefObject<number>;
  onLoadProgress?: (percent: number) => void;
}

export function HeroFrameSequence({
  manifest,
  progressRef,
  onLoadProgress,
}: HeroFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastDrawnRef = useRef<number>(-1);
  const [loadedCount, setLoadedCount] = useState(0);
  const dpr =
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

  /* -- Preload pipeline -- */
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
      // Quando o primeiro frame chega, desenha
      if (i === 0) draw(0);
    };

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = buildFramePath(manifest, i);
        img.onload = () => {
          images[i] = img;
          onOne(i);
          resolve();
        };
        img.onerror = () => {
          // Marca como "carregado" mesmo em erro para não travar o gate
          onOne(i);
          resolve();
        };
      });

    // 1) Poster grid — paralelo
    const posters = [0, Math.floor(total * 0.25), Math.floor(total * 0.5), Math.floor(total * 0.75), total - 1];
    Promise.all(posters.map(loadOne)).then(async () => {
      if (canceled) return;
      // 2) Restante em pool de 8 concurrent
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
    });

    imagesRef.current = images;
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest.count, manifest.prefix, manifest.extension, manifest.version]);

  /* -- Resize & initial draw -- */
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

  /* -- Frame draw loop via rAF — consome progressRef -- */
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

  /* -- Canvas draw (object-fit: cover) -- */
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
    // Cover fit
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
        style={{ background: "#FCFBF7" }}
      />
      {percent < 12 && (
        <div
          aria-live="polite"
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#FCFBF7]/95 backdrop-blur-sm pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-px w-32 bg-[#0A0A0A]/15 overflow-hidden">
              <div
                className="h-px bg-[#0A0A0A] transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(8, percent)}%` }}
              />
            </div>
            <p className="text-[11px] tracking-[0.32em] uppercase text-[#666] font-medium">
              Materializando · {Math.round(percent)}%
            </p>
          </div>
        </div>
      )}
    </>
  );
}

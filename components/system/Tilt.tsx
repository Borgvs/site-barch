"use client";

/**
 * Tilt — wrapper que aplica 3D perspective tilt no hover.
 *
 * Uso:
 *   <Tilt>
 *     <div className="glass-card">...</div>
 *   </Tilt>
 *
 * Adiciona spec highlight via CSS vars --shine-x/--shine-y que você pode
 * referenciar com `radial-gradient(circle at var(--shine-x) var(--shine-y), ...)`.
 */

import { useEffect, useRef, type ReactNode } from "react";

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** Máximo de rotação em graus. Default: 7. */
  max?: number;
  /** Escala no hover. Default: 1.015. */
  scale?: number;
  /** Habilita brilho que segue o cursor. Default: true. */
  glare?: boolean;
}

export function Tilt({
  children,
  className,
  max = 7,
  scale = 1.015,
  glare = true,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -max;
      const ry = ((x - cx) / cx) * max;
      el.style.transition = "transform 80ms ease";
      el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
      el.style.setProperty("--shine-x", `${(x / rect.width) * 100}%`);
      el.style.setProperty("--shine-y", `${(y / rect.height) * 100}%`);
    };
    const onLeave = () => {
      el.style.transition = "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "perspective(1200px) rotateX(0) rotateY(0) scale(1)";
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [max, scale]);

  return (
    <div
      ref={ref}
      className={`relative will-change-transform ${className ?? ""}`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle 240px at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255,255,255,0.18), transparent 60%)",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}

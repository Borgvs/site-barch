"use client";

/**
 * ProgressBar — barra vertical com fill, counter mono, marcadores de fase.
 *
 * Aplica linguagem dark: paper sobre ink, glass pill no counter.
 */

import { PHASES, getActivePhase } from "@/lib/construction-config";

export function ProgressBar({ progress }: { progress: number }) {
  const fillPercent = Math.max(0, Math.min(1, progress)) * 100;
  const activePhase = getActivePhase(progress);
  return (
    <div className="absolute bottom-10 left-6 sm:left-10 lg:left-16">
      <div className="flex flex-col items-start gap-3">
        <span
          className="glass-pill-dark font-mono tnum"
          style={{ fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase" }}
        >
          {String(Math.round(fillPercent)).padStart(2, "0")} / 100
        </span>
        <div className="flex items-stretch gap-3">
          <div
            className="relative h-28 w-px bg-paper/20"
            aria-hidden
          >
            <div
              className="absolute bottom-0 left-0 w-px bg-paper transition-[height] duration-300 ease-out"
              style={{
                height: `${fillPercent}%`,
                boxShadow: "0 0 12px rgba(252, 251, 247, 0.65)",
              }}
            />
            {PHASES.map((phase, i) => {
              if (i === 0) return null;
              const pct = phase.range[0] * 100;
              const active = progress >= phase.range[0];
              return (
                <div
                  key={phase.id}
                  className="absolute left-0 h-px transition-all duration-500"
                  style={{
                    bottom: `${pct}%`,
                    width: active ? "10px" : "5px",
                    background: active
                      ? "rgba(252, 251, 247, 0.95)"
                      : "rgba(252, 251, 247, 0.30)",
                    transform: "translateX(-2px)",
                  }}
                />
              );
            })}
          </div>
          {/* Phase labels coluna · só a ativa em destaque, demais em paper/30 */}
          <div className="relative h-28">
            {PHASES.map((phase) => {
              const pct = phase.range[0] * 100;
              const active = activePhase.id === phase.id;
              return (
                <span
                  key={phase.id}
                  className="absolute left-0 font-mono text-[9px] uppercase tracking-[0.28em] transition-all duration-500 whitespace-nowrap"
                  style={{
                    bottom: `calc(${pct}% - 4px)`,
                    color: active
                      ? "rgba(252, 251, 247, 0.95)"
                      : "rgba(252, 251, 247, 0.32)",
                    transform: active ? "translateX(0)" : "translateX(-2px)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {phase.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

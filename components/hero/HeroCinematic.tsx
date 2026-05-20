"use client";

/**
 * HeroCinematic — Hero editorial cinematográfico image-driven.
 *
 * Anima TUDO ao entrar e durante scroll:
 *  - Ken Burns na imagem (28s ultra-lento)
 *  - Word-split reveal no headline (cada palavra fade-up + blur-out)
 *  - Headline com gradient text animado (text-gradient-moving)
 *  - Canvas overlay com particle field sutil (WebGL-feel)
 *  - Parallax scroll-linked (imagem desce 14% · texto sobe -50px)
 *  - Magnetic CTAs (atração ao cursor)
 *  - Status pulsing dot
 *  - Scroll cue animado
 */

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE } from "@/lib/motion";
import { MagneticLink } from "@/components/system/MagneticLink";

type HeroVariant = "blue-hour" | "golden-hour";

interface HeroCinematicProps {
  variant?: HeroVariant;
}

const VARIANTS = {
  "blue-hour": {
    src: "/hero/hero-blue-hour.webp",
    alt: "Residência ao crepúsculo · projeto Barch",
    overlay: "bg-gradient-to-b from-black/35 via-black/15 to-black/75",
  },
  "golden-hour": {
    src: "/hero/hero-golden-hour.webp",
    alt: "Residência ao final da tarde · projeto Barch",
    overlay: "bg-gradient-to-b from-black/20 via-black/10 to-black/60",
  },
} as const;

export function HeroCinematic({ variant = "blue-hour" }: HeroCinematicProps) {
  const v = VARIANTS[variant];
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-ink text-paper"
      aria-label="Hero · entrada cinematográfica"
    >
      {/* Imagem + Ken Burns + parallax */}
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.0 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 32, ease: "linear" }}
        >
          <Image
            src={v.src}
            alt={v.alt}
            fill
            priority
            quality={88}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Gradient overlay dark */}
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${v.overlay}`}
        style={{ opacity: overlayOpacity }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Canvas particle field — WebGL feel via 2D canvas */}
      <ParticleField />

      {/* Grain layer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
        }}
      />

      {/* Conteúdo editorial */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-between"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Top · status glass-pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: EASE.out, delay: 0.4 }}
          className="container-page pt-32 sm:pt-36"
        >
          <span className="glass-pill-dark">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warn opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warn" />
            </span>
            <span style={{ letterSpacing: "0.28em", textTransform: "uppercase", fontSize: 10.5 }}>
              Venture builder arquitetônica · 2026
            </span>
          </span>
        </motion.div>

        {/* Centro · headline word-split + gradient */}
        <div className="container-page flex-1 flex items-center">
          <div className="max-w-5xl">
            <h1
              className="font-display leading-[0.88] tracking-[-0.045em] mb-2"
              style={{
                fontSize: "clamp(56px, 11vw, 160px)",
                fontWeight: 900,
              }}
            >
              <WordSplit text="Construir" delay={0.3} variant="solid" />
              <br />
              <WordSplit
                text="sem ruído."
                delay={0.7}
                variant="italic-fade"
              />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: EASE.out, delay: 1.4 }}
              className="mt-9 text-[15px] sm:text-[17px] text-paper/65 leading-[1.55] max-w-[520px]"
            >
              Projetamos, construímos e operamos residências e empreendimentos
              como um sistema único. Concepção, obra e gestão sob a mesma
              lógica — sem fragmentação, sem ruído.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE.out, delay: 1.7 }}
              className="mt-11 flex flex-wrap items-center gap-4"
            >
              <MagneticLink
                href="/#contato"
                className="glass-cta"
                strength={0.3}
                radius={100}
              >
                <span>Agendar conversa</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </MagneticLink>

              <MagneticLink
                href="/#processo"
                className="glass-cta-ghost"
                strength={0.25}
                radius={90}
              >
                <span>Conhecer o método</span>
              </MagneticLink>
            </motion.div>
          </div>
        </div>

        {/* Base · projeto referência + scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE.out, delay: 2.0 }}
          className="container-page pb-10 sm:pb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-paper/55 font-medium mb-1.5">
              Projeto-tese · residência Silva
            </p>
            <p className="text-[11px] text-paper/45 tracking-tight font-mono tnum">
              CURITIBA · 5 850 m² · ENTREGA 2027
            </p>
          </div>

          <div className="flex items-center gap-3 text-paper/55">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-7 w-px bg-paper/35"
            />
            <p className="text-[10.5px] tracking-[0.32em] uppercase font-medium">
              Role para o método
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* -----------------------------------------------------------------------
 * WordSplit — divide texto em palavras e anima cada uma com blur+fade-up
 * ---------------------------------------------------------------------- */

function WordSplit({
  text,
  delay = 0,
  variant = "solid",
}: {
  text: string;
  delay?: number;
  variant?: "solid" | "italic-fade";
}) {
  const words = text.split(" ");
  return (
    <span className="inline-flex flex-wrap gap-x-[0.18em]">
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1.1,
            ease: EASE.out,
            delay: delay + i * 0.08,
          }}
          className={
            variant === "italic-fade"
              ? "italic text-paper/72 font-light"
              : "text-gradient-moving"
          }
          style={{
            display: "inline-block",
            willChange: "transform, opacity, filter",
            ...(variant === "italic-fade" && { fontWeight: 300 }),
          }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

/* -----------------------------------------------------------------------
 * ParticleField — canvas 2D com pontos drifting (WebGL-feel sem custo)
 * ---------------------------------------------------------------------- */

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };
    resize();
    window.addEventListener("resize", resize);

    // Cria partículas
    const PARTICLE_COUNT = Math.min(
      80,
      Math.floor((window.innerWidth * window.innerHeight) / 22000),
    );
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const particles: P[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr,
      r: (Math.random() * 1.5 + 0.4) * dpr,
      a: Math.random() * 0.5 + 0.15,
    }));

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const onMouse = (e: MouseEvent) => {
      mouseX = e.clientX * dpr;
      mouseY = e.clientY * dpr;
    };
    window.addEventListener("mousemove", onMouse);

    let rafId = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse repel sutil
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        const repelRadius = 180 * dpr;
        if (dist < repelRadius) {
          const force = (1 - dist / repelRadius) * 0.4;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 251, 247, ${p.a})`;
        ctx.fill();
      }

      // Conexões entre partículas próximas
      ctx.strokeStyle = "rgba(252, 251, 247, 0.04)";
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 140 * dpr) {
            ctx.globalAlpha = (1 - d / (140 * dpr)) * 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    setReady(true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ opacity: ready ? 0.55 : 0, transition: "opacity 1.4s ease-out" }}
    />
  );
}

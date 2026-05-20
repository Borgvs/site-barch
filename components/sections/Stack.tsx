"use client";

import { motion } from "framer-motion";

/**
 * Stack · bento grid LanderOS adaptado para Barch.OS + BIM Bimarch.
 * Foco: tecnologia que reduz ruído, não que gera espetáculo (FWK-IA-001).
 */
export function Stack() {
  return (
    <section id="stack" className="relative py-section">
      <div className="container-page">
        {/* Header */}
        <div className="mb-14">
          <span className="eyebrow-chip mb-5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warn">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            BARCH.OS
          </span>
          <h2 className="font-display text-display-lg sm:text-display-xl text-ink leading-[1.05] max-w-3xl mb-5">
            Tecnologia como{" "}
            <span className="italic text-gradient-warn">redução de ruído</span>.
          </h2>
          <p className="text-body-lg text-charcoal max-w-2xl leading-relaxed">
            BIM coordenado, IA orquestrada, gemeo digital evolutivo e canteiro
            digitalizado. Nada pelo espetáculo — tudo para antecipar erro e gerar
            clareza ao cliente.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Card 1 · BIM Coordenado · 2 colunas */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-glass p-8 lg:p-10 lg:col-span-2 relative overflow-hidden hover-lift"
          >
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div>
                <p className="eyebrow text-warn mb-3">BIM · BIMARCH</p>
                <h3 className="font-display text-display-md text-ink mb-3 leading-tight">
                  Coordenação Total
                </h3>
                <p className="text-body text-charcoal leading-relaxed mb-5">
                  Revit + Autodesk Docs + Solibri + ConstructIN. ISO 19650,
                  70+ rulesets de validação, sincronização modelo-campo-custo
                  em tempo real.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Revit", "Autodesk Forma", "Solibri", "Finch 3D"].map((t) => (
                    <span key={t} className="tag-pill !text-[12px] !py-1">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* Visual abstrato BIM orbital */}
              <div className="relative aspect-square max-w-[280px] mx-auto">
                <BIMOrbital />
              </div>
            </div>
          </motion.article>

          {/* Card 2 · IA Embarcada */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-glass p-8 hover-lift relative overflow-hidden"
          >
            <p className="eyebrow text-warn mb-3">IA · 7 AGENTES</p>
            <h3 className="font-display text-display-sm text-ink mb-3 leading-tight">
              Barch.OS Cognitive
            </h3>
            <p className="text-body-sm text-charcoal leading-relaxed mb-6">
              Wesley-Bot · Olho-de-Obra · Compliance-Bot · Curva-S Watchdog ·
              Contábil-Bot · Cliente-Bot · Contratual-Bot.
            </p>
            {/* Mockup mini · chat IA */}
            <div className="glass-deep rounded-card p-3 text-[11px] font-mono">
              <div className="flex items-center gap-2 mb-2 text-muted2">
                <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
                wesley-bot · processando
              </div>
              <div className="text-charcoal/80">
                <span className="text-warn">$</span> diário de hoje gerado a partir de áudio + 6 fotos
              </div>
              <div className="text-muted2 mt-1.5">
                ✓ Conformidade PBK-001 validada
              </div>
            </div>
          </motion.article>

          {/* Card 3 · Painel Cliente */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-glass p-8 hover-lift relative overflow-hidden"
          >
            <p className="eyebrow text-warn mb-3">PAINEL CLIENTE</p>
            <h3 className="font-display text-display-sm text-ink mb-3 leading-tight">
              Transparência Proativa
            </h3>
            <p className="text-body-sm text-charcoal leading-relaxed mb-6">
              Cliente acessa curva S ao vivo, vistorias 360°, decisões e
              cronograma. Reports semanais WhatsApp.
            </p>
            {/* Mini-chart */}
            <div className="glass-deep rounded-card p-3">
              <div className="flex justify-between text-[10px] text-muted2 mb-2 uppercase tracking-wider">
                <span>Físico</span>
                <span className="text-warn tnum">25%</span>
              </div>
              <div className="h-1.5 rounded-pill bg-soft overflow-hidden">
                <div className="h-full w-1/4 rounded-pill bg-ink" />
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-muted2 uppercase tracking-wider">
                <span>Mês 5/18</span>
                <span className="tnum text-charcoal">27%</span>
              </div>
            </div>
          </motion.article>

          {/* Card 4 · Vistorias 360° · 2 colunas */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-glass p-8 lg:p-10 lg:col-span-2 hover-lift relative overflow-hidden"
          >
            <div className="grid sm:grid-cols-[1.2fr_1fr] gap-8 items-center">
              <div>
                <p className="eyebrow text-warn mb-3">VISTORIAS 360°</p>
                <h3 className="font-display text-display-md text-ink mb-3 leading-tight">
                  Canteiro Imersivo
                </h3>
                <p className="text-body text-charcoal leading-relaxed mb-5">
                  Insta360 X5 captura o estado real do canteiro. Cliente navega
                  por dentro da obra pelo painel, mesmo de outra cidade.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Insta360 X5", "Pannellum", "Equirectangular", "Hotspots"].map(
                    (t) => (
                      <span key={t} className="tag-pill !text-[12px] !py-1">
                        {t}
                      </span>
                    )
                  )}
                </div>
              </div>
              {/* Visual 360° symbol */}
              <div className="relative aspect-square max-w-[220px] mx-auto">
                <Tour360Visual />
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function BIMOrbital() {
  const orbits = [
    { r: 38, items: 3 },
    { r: 65, items: 5 },
    { r: 92, items: 7 },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Hub central */}
      <div className="absolute w-14 h-14 rounded-full bg-ink flex items-center justify-center text-paperPure font-display text-display-sm font-bold z-10">
        b
      </div>
      {/* Órbitas concentric */}
      {orbits.map((orbit, oi) => (
        <div
          key={oi}
          className="absolute rounded-full border border-rule/40"
          style={{
            width: orbit.r * 2,
            height: orbit.r * 2,
            animation: `spin-slow ${20 + oi * 8}s linear infinite ${
              oi % 2 ? "reverse" : "normal"
            }`,
          }}
        >
          {Array.from({ length: orbit.items }).map((_, i) => {
            const angle = (i / orbit.items) * Math.PI * 2;
            const x = Math.cos(angle) * orbit.r;
            const y = Math.sin(angle) * orbit.r;
            const isHi = i === Math.floor(orbit.items / 2);
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `calc(50% + ${x}px - 4px)`,
                  top: `calc(50% + ${y}px - 4px)`,
                  background: isHi ? "#A23A1F" : "rgba(54, 69, 79, 0.5)",
                  boxShadow: isHi ? "0 0 12px rgba(162,58,31,0.5)" : "none",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Tour360Visual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Sphere wireframe */}
        <defs>
          <radialGradient id="sphere-grad" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#FCFBF7" />
            <stop offset="100%" stopColor="#36454F" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill="url(#sphere-grad)" opacity="0.9" />
        {/* Meridians */}
        {[15, 45, 75, 105, 135, 165].map((deg) => (
          <ellipse
            key={deg}
            cx="100"
            cy="100"
            rx="80"
            ry="20"
            fill="none"
            stroke="#FCFBF7"
            strokeWidth="0.6"
            opacity="0.5"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
        {/* Equator */}
        <ellipse cx="100" cy="100" rx="80" ry="80" fill="none" stroke="#FCFBF7" strokeWidth="0.8" opacity="0.7" />
        {/* Pulsing hotspot */}
        <circle cx="130" cy="80" r="5" fill="#A23A1F">
          <animate attributeName="r" values="4;7;4" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="115" r="3" fill="#A23A1F" opacity="0.7" />
      </svg>
    </div>
  );
}

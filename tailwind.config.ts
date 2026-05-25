import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== Paleta Barch v9.5 · ANTHRACITE dark-first =====
        // PRIMÁRIA · anthracite = cinza grafite neutro · sem azul · premium / Apple-tier
        anthra: "#25272A",        // primary · backgrounds dark default
        anthraDeep: "#1A1B1E",    // canvas root, áreas mais profundas
        anthraMuted: "#34373C",   // hover state, surface elevation +1 (cards)
        anthraSoft: "#3F4248",    // tier 2 surface, glass card hover
        anthraHi: "#52565C",      // borders sutis, dividers ativos

        // ===== Aliases legacy navy → anthra (cobre código que ainda usa nomes navy) =====
        navy: "#25272A",
        navyDeep: "#1A1B1E",
        navyMuted: "#34373C",
        navySoft: "#3F4248",
        // SECUNDÁRIA · blue = navegação, links, subtitles
        blue: "#2E75B6",
        blueDeep: "#1F5A91",
        // ACENTO · clay sóbrio = CTA "Build Beyond", elementos de energia
        // Tom terra madura · menos vibrante que burnt orange · sóbrio professional
        accent: "#9C7259",        // clay base
        accentSoft: "#B5896E",    // clay light · hover
        accentDark: "#7A5740",    // clay deep · pressed
        accentTint: "#2D2118",    // sobre fundo dark, low-saturation
        // NEUTROS · sobre navy / sobre paper
        paper: "#F2F2F2",         // background light (uso restrito · manifesto, contato)
        paperPure: "#FFFFFF",
        dark: "#333333",          // texto sobre paper
        ruleDark: "rgba(255, 255, 255, 0.10)",   // linhas sobre navy
        ruleLight: "rgba(10, 25, 45, 0.12)",     // linhas sobre paper

        // ===== LEGACY (mantido para coexistência durante migração) =====
        ink: "#0a0a0a",
        ink2: "#1a1a1a",
        ink3: "#2a2a2a",
        ink4: "#3a3a3a",
        charcoal: "#36454F",
        muted: "#6B6B66",
        muted2: "#9a9a93",
        muted3: "#bdbdb6",
        rule: "#e4e1d8",
        ruleSoft: "#ece9df",
        soft: "#f0ede5",
        softer: "#f7f5ee",
        // Acento legado (terracotta) · será deprecado em favor de accent
        warn: "#A23A1F",
        warn2: "#C24A2A",
        warnSoft: "#F4D8CF",
        warnPale: "#FBEEE8",
        ok: "#2D5A3D",
        okSoft: "#D4E3D5",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "SF Pro Text",
          "Helvetica Neue",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Inter Tight",
          "var(--font-inter)",
          "Inter",
          "SF Pro Display",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "display-3xl": ["96px", { lineHeight: "0.95", letterSpacing: "-3.5px", fontWeight: "500" }],
        "display-2xl": ["80px", { lineHeight: "0.95", letterSpacing: "-3px", fontWeight: "500" }],
        "display-xl": ["64px", { lineHeight: "0.98", letterSpacing: "-2.4px", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "1.02", letterSpacing: "-1.6px", fontWeight: "500" }],
        "display-md": ["36px", { lineHeight: "1.08", letterSpacing: "-1px", fontWeight: "500" }],
        "display-sm": ["24px", { lineHeight: "1.2", letterSpacing: "-0.4px", fontWeight: "500" }],
        "body-lg": ["17px", { lineHeight: "1.55", letterSpacing: "-0.1px", fontWeight: "400" }],
        "body": ["15px", { lineHeight: "1.55", letterSpacing: "-0.05px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["11px", { lineHeight: "1.4", letterSpacing: "0.2px", fontWeight: "500" }],
        "eyebrow": ["11px", { lineHeight: "1", letterSpacing: "1.6px", fontWeight: "500" }],
      },
      spacing: {
        section: "88px",
        sectionLg: "128px",
        gutter: "32px",
      },
      borderRadius: {
        glass: "28px",
        card: "20px",
        cardSm: "14px",
        chip: "10px",
        pill: "9999px",
      },
      boxShadow: {
        "elev-1": "0 1px 2px rgba(10, 10, 10, 0.04)",
        "elev-2": "0 2px 4px rgba(10, 10, 10, 0.04), 0 4px 8px rgba(10, 10, 10, 0.03)",
        "elev-3": "0 4px 8px rgba(10, 10, 10, 0.04), 0 8px 16px rgba(10, 10, 10, 0.04)",
        "elev-4": "0 8px 16px rgba(10, 10, 10, 0.05), 0 16px 32px rgba(10, 10, 10, 0.05)",
        "elev-5": "0 16px 32px rgba(10, 10, 10, 0.06), 0 32px 64px rgba(10, 10, 10, 0.06)",
        "card": "0 0 0 1px rgba(228, 225, 216, 0.7), 0 1px 2px rgba(10, 10, 10, 0.03)",
        "card-hover": "0 0 0 1px rgba(228, 225, 216, 0.9), 0 4px 12px rgba(10, 10, 10, 0.06), 0 16px 32px rgba(10, 10, 10, 0.05)",
        "ink-btn": "0 1px 2px rgba(10, 10, 10, 0.25), 0 4px 12px rgba(10, 10, 10, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        "ink-btn-hover": "0 2px 4px rgba(10, 10, 10, 0.3), 0 8px 20px rgba(10, 10, 10, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
      },
      transitionTimingFunction: {
        "apple": "cubic-bezier(0.32, 0.72, 0, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "250": "250ms", "400": "400ms", "600": "600ms", "800": "800ms",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "50%": { opacity: "0.4" },
          "100%": { transform: "scale(1.3)", opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1) both",
        "scale-in": "scale-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-ring": "pulse-ring 4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

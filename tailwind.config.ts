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
        // ===== Paleta Barch R01 (tokens canônicos · mesma do painel) =====
        ink: "#0e0e0e",
        ink2: "#1a1a1a",
        ink3: "#2a2a2a",
        charcoal: "#36454F",
        muted: "#6B6B66",
        muted2: "#8a877f",
        soft: "#F0EDE5",
        softer: "#F7F5EE",
        paper: "#FCFBF7",
        paperPure: "#FFFFFF",
        rule: "#dcd9cf",
        ruleSoft: "#e8e5db",
        // Acento principal: terracotta (substitui o roxo do LanderOS)
        warn: "#A23A1F",
        warn2: "#C24A2A",
        warn3: "#D86545",
        warnSoft: "#F4D8CF",
        warnPale: "#FBEEE8",
        warnGlow: "#E8A48F",
        // Acento confirmação: verde-floresta
        ok: "#2D5A3D",
        okSoft: "#D4E3D5",
        // Glass surfaces
        glass: {
          50: "rgba(252, 251, 247, 0.55)",
          100: "rgba(252, 251, 247, 0.7)",
          200: "rgba(255, 255, 255, 0.8)",
          ink: "rgba(14, 14, 14, 0.85)",
          inkSoft: "rgba(14, 14, 14, 0.6)",
        },
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
          "var(--font-fraunces)",
          "Fraunces",
          "var(--font-inter)",
          "Inter Display",
          "serif",
        ],
      },
      fontSize: {
        "display-3xl": ["96px", { lineHeight: "0.95", letterSpacing: "-3px", fontWeight: "600" }],
        "display-2xl": ["72px", { lineHeight: "0.95", letterSpacing: "-2.5px", fontWeight: "600" }],
        "display-xl": ["56px", { lineHeight: "1", letterSpacing: "-1.8px", fontWeight: "600" }],
        "display-lg": ["44px", { lineHeight: "1.05", letterSpacing: "-1.2px", fontWeight: "600" }],
        "display-md": ["32px", { lineHeight: "1.1", letterSpacing: "-0.6px", fontWeight: "600" }],
        "display-sm": ["24px", { lineHeight: "1.2", letterSpacing: "-0.3px", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "1.55", letterSpacing: "-0.1px", fontWeight: "400" }],
        "body": ["15px", { lineHeight: "1.55", letterSpacing: "-0.05px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "caption": ["11px", { lineHeight: "1.4", letterSpacing: "0.2px", fontWeight: "500" }],
        "eyebrow": ["10px", { lineHeight: "1", letterSpacing: "2.2px", fontWeight: "600" }],
      },
      spacing: {
        section: "120px",
        sectionLg: "160px",
        gutter: "32px",
      },
      borderRadius: {
        glass: "24px",
        card: "16px",
        chip: "10px",
        pill: "9999px",
      },
      backdropBlur: {
        xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "40px",
      },
      boxShadow: {
        "elev-1": "0 1px 1px rgba(14, 14, 14, 0.03), 0 1px 2px rgba(14, 14, 14, 0.04)",
        "elev-2": "0 1px 2px rgba(14, 14, 14, 0.04), 0 2px 4px rgba(14, 14, 14, 0.04), 0 4px 8px rgba(14, 14, 14, 0.03)",
        "elev-3": "0 2px 4px rgba(14, 14, 14, 0.04), 0 4px 8px rgba(14, 14, 14, 0.06), 0 8px 16px rgba(14, 14, 14, 0.04)",
        "elev-4": "0 4px 8px rgba(14, 14, 14, 0.04), 0 8px 16px rgba(14, 14, 14, 0.06), 0 16px 32px rgba(14, 14, 14, 0.06)",
        "elev-5": "0 8px 16px rgba(14, 14, 14, 0.05), 0 16px 32px rgba(14, 14, 14, 0.08), 0 32px 64px rgba(14, 14, 14, 0.08)",
        "glass-1": "inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 2px rgba(14, 14, 14, 0.04), 0 4px 12px rgba(14, 14, 14, 0.05)",
        "glass-2": "inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 2px 4px rgba(14, 14, 14, 0.05), 0 8px 24px rgba(14, 14, 14, 0.07)",
        "glass-3": "inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 8px rgba(14, 14, 14, 0.06), 0 16px 40px rgba(14, 14, 14, 0.1)",
        "warn-glow": "0 0 0 1px rgba(162, 58, 31, 0.2), 0 8px 24px rgba(162, 58, 31, 0.18)",
        "warn-glow-lg": "0 0 0 1px rgba(162, 58, 31, 0.25), 0 12px 40px rgba(162, 58, 31, 0.25)",
      },
      transitionTimingFunction: {
        "apple": "cubic-bezier(0.32, 0.72, 0, 1)",
        "apple-soft": "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "250": "250ms", "400": "400ms", "600": "600ms", "800": "800ms",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
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
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        "scale-in": "scale-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { SmoothScroll } from "@/components/system/SmoothScroll";
import { StructuredData } from "@/components/system/StructuredData";
import "./globals.css";

// Fontes VARIÁVEIS (sem array de weight = eixo completo 100–900) + itálico real.
// Antes: instâncias estáticas até 700 e sem italic — todo fontWeight 800/900 do
// display e todo `italic` do site eram sintetizados pelo navegador (faux bold/oblique).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  style: ["normal", "italic"],
  preload: true,
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
  preload: true,
});

const SITE_URL = "https://barch.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Barch · Venture builder arquitetônica",
    template: "%s · Barch",
  },
  description:
    "Barch projeta, constrói e opera empreendimentos como uma única tese — concepção, obra e gestão sob a mesma stack. Construir sem ruído.",
  // Canonical relativo: cada rota aponta para si mesma no domínio apex
  // (www.barch.com.br serve 200 sem redirect — sem canonical vira conteúdo duplicado)
  alternates: { canonical: "./" },
  applicationName: "Barch",
  authors: [{ name: "Gustavo Alonso Borges", url: SITE_URL }],
  creator: "Barch Engenharia e Arquitetura",
  keywords: [
    "arquitetura",
    "venture builder arquitetônica",
    "BIM",
    "gerenciamento de obras",
    "residências de alto padrão",
    "Barch",
    "Piracicaba",
    "São Paulo",
    "arquitetura contemporânea brasileira",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Barch",
    title: "Barch · Venture builder arquitetônica",
    description:
      "Articulamos arquitetura, obra e operação como um sistema único. Construir sem ruído.",
    // images: gerado automaticamente por app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Barch · Venture builder arquitetônica",
    description: "Construir sem ruído.",
    // images: gerado automaticamente por app/opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Favicons · espelha o setup do painel.barch.com.br para identidade visual unificada
  icons: {
    icon: [
      { url: "/logos/barch-symbol-full-dark-bgoff.svg", media: "(prefers-color-scheme: light)" },
      { url: "/logos/barch-symbol-full-light-bgoff.svg", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/icon-192.png",
  },
  // manifest: gerado automaticamente por app/manifest.ts
  category: "Architecture",
};

export const viewport: Viewport = {
  // anthraDeep — o chrome do navegador deve casar com o fundo dark-first do site
  themeColor: "#1A1B1E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen antialiased bg-anthra text-paper/90 selection:bg-accent selection:text-paperPure"
        style={{ fontFeatureSettings: '"ss01", "cv11", "cv02"' }}
      >
        <StructuredData />
        {/* Skip to content — visível apenas no foco (acessibilidade) */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-ink focus:text-paperPure focus:px-4 focus:py-2 focus:rounded-full focus:text-[12px] focus:tracking-[0.15em] focus:uppercase focus:font-medium focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper"
        >
          Pular para o conteúdo
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

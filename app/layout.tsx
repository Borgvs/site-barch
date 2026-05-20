import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Barch · Venture Builder Arquitetônica e Urbana",
    template: "%s · Barch",
  },
  description:
    "A liberdade de criar. A ousadia de transformar. Barch projeta, constrói e opera empreendimentos como ecossistemas culturais, econômicos e espaciais integrados.",
  applicationName: "Barch",
  metadataBase: new URL("https://barch.com.br"),
  openGraph: {
    title: "Barch · Venture Builder Arquitetônica e Urbana",
    description: "A liberdade de criar. A ousadia de transformar.",
    url: "https://barch.com.br",
    locale: "pt_BR",
    type: "website",
  },
  icons: {
    icon: "/logos/barch-symbol-full-dark-bgoff.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FCFBF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="min-h-screen text-ink antialiased">{children}</body>
    </html>
  );
}

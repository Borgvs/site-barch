import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barch",
    short_name: "Barch",
    description: "Venture builder arquitetônica. Construir sem ruído.",
    start_url: "/",
    display: "standalone",
    // Dark-first: casa com o anthraDeep do site (antes: creme sobre site dark)
    background_color: "#1A1B1E",
    theme_color: "#1A1B1E",
    // /icon e /apple-icon eram rotas inexistentes (404) — os arquivos reais vivem em /icons
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

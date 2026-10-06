import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Os concepts seguem rastreáveis para que o X-Robots-Tag noindex seja lido;
    // só a API do concept Terreno (JSON sem cache) fica fora do rastreio.
    rules: { userAgent: "*", allow: "/", disallow: ["/concepts/terreno/api/"] },
    sitemap: "https://barch.com.br/sitemap.xml",
    host: "https://barch.com.br",
  };
}

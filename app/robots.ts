import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://barch.com.br/sitemap.xml",
    host: "https://barch.com.br",
  };
}

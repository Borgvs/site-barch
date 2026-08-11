/**
 * StructuredData — JSON-LD para Organization + WebSite.
 * Inserido no <head> via Script para Google Rich Results.
 */

export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Barch",
    legalName: "Barch Engenharia e Arquitetura",
    url: "https://barch.com.br",
    // /apple-icon era rota inexistente (404) — o Google descartava o logo
    logo: "https://barch.com.br/icons/icon-512.png",
    description:
      "Venture builder arquitetônica. Projeta, constrói e opera empreendimentos como uma stack integrada — do diagnóstico ao asset pós-entrega.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Gustavo Alonso Borges",
    },
    taxID: "55.060.950/0001-01",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Piracicaba",
      addressRegion: "SP",
      addressCountry: "BR",
    },
    sameAs: [
      "https://www.linkedin.com/company/barchco/",
      "https://instagram.com/barch.arq",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contato@barch.com.br",
      contactType: "Customer Service",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Barch",
    url: "https://barch.com.br",
    inLanguage: "pt-BR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}

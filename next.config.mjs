/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Talma study: isolated static document, preserving the institutional app shell.
  async rewrites() {
    return [{ source: "/viabilidade", destination: "/viabilidade/index.html" }, { source: "/tatuape", destination: "/estudos/tatuape/v3/index.html" }, { source: "/concepts/terreno", destination: "/concepts/terreno/index.html" }];
  },
  async redirects() {
    return [
      { source: "/tatuap%C3%A9", destination: "/tatuape", permanent: true },
      { source: "/terrenos", destination: "/concepts/terreno", permanent: true },
      { source: "/terreno", destination: "/concepts/terreno", permanent: true },
      { source: "/terreno/:path*", destination: "/concepts/terreno/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/viabilidade/:path*", headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'; form-action 'none'; base-uri 'self'" },
        // Send only the origin to map providers; OSM requires a valid web Referer.
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cache-Control", value: "no-cache" },
      ] },
      { source: "/concepts/terreno/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "X-Content-Type-Options", value: "nosniff" }] },
      { source: "/tatuape", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/estudos/tatuape/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  typedRoutes: false,
  outputFileTracingIncludes: { "/concepts/terreno/api/*": ["./.barch-terreno/**/*"] },
  images: { remotePatterns: [] },
  turbopack: {
    root: process.cwd(),
  },
};
export default nextConfig;

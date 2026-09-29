/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Talma study: isolated static document, preserving the institutional app shell.
  async rewrites() {
    return [{ source: "/tatuape", destination: "/estudos/tatuape/v3/index.html" }];
  },
  async redirects() {
    return [{ source: "/tatuap%C3%A9", destination: "/tatuape", permanent: true }];
  },
  async headers() {
    return [
      { source: "/tatuape", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/estudos/tatuape/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  typedRoutes: false,
  images: { remotePatterns: [] },
  turbopack: {
    root: process.cwd(),
  },
};
export default nextConfig;

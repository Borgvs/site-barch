/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  images: { remotePatterns: [] },
  turbopack: {
    root: process.cwd(),
  },
};
export default nextConfig;

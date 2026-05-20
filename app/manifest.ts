import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barch",
    short_name: "Barch",
    description: "Venture builder arquitetônica. Construir sem ruído.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCFBF7",
    theme_color: "#0A0A0A",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

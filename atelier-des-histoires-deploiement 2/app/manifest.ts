import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Atelier des Histoires",
    short_name: "Histoires",
    description: "Écrire, publier et lire des histoires.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2ff",
    theme_color: "#6c4cff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

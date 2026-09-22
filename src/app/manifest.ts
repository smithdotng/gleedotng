import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "glee.ng — Beauty, beautifully booked",
    short_name: "glee",
    description: "Discover and book Nigeria's finest stylists, salons, spas and barbers.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1d0f0a",
    theme_color: "#1d0f0a",
    categories: ["lifestyle", "beauty", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Explore", url: "/explore", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My dashboard", url: "/dashboard", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}

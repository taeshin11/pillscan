import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PillScan — AI 알약 판별",
    short_name: "PillScan",
    description: "AI 기반 알약 판별 서비스 — Identify pills instantly with AI",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#7c9a92",
    orientation: "portrait",
    categories: ["health", "medical"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

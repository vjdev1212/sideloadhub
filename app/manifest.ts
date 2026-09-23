import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SideloadHub",
    short_name: "SideloadHub",
    description: "Discover, track, and install the latest iOS apps for sideloading.",
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#f7f8fb",
    theme_color: "#f7f8fb",
    orientation: "portrait-primary",
    categories: ["utilities", "software", "entertainment"],
    prefer_related_applications: false,
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Browse Apps", short_name: "Apps", url: "/apps", icons: [{ src: "/icon-192", sizes: "192x192", type: "image/png" }] },
      { name: "Add Repository", short_name: "Add Repo", url: "/submit", icons: [{ src: "/icon-192", sizes: "192x192", type: "image/png" }] },
    ],
  };
}

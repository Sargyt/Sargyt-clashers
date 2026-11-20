import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sargyt Clashers · Clash of Clans Analiz & Rehber",
    short_name: "Sargyt Clashers",
    description:
      "Clash of Clans köy analizi, ekipman danışmanı, inşaatçı takipçisi, meta ordular ve klan ilan panosu.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    lang: "tr",
    icons: [
      {
        src: "/birimler/th19.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/birimler/th19.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
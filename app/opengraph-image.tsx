import { ImageResponse } from "next/og";

export const alt = "Sargyt Clashers · Clash of Clans Köy Analizi & Rehber";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const OZELLIKLER = [
  "Köy & Ekipman Analizi",
  "Cevher Danışmanı",
  "İnşaatçı Takipçisi",
  "Köy Yaşı & Tarihi",
  "Klan & İlan Panosu",
];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 68px",
          background: "linear-gradient(135deg, #070d19 0%, #0f1c33 55%, #16243d 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
          border: "10px solid #38bdf8",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(56, 189, 248, 0.16)",
              border: "2px solid #38bdf8",
              color: "#7dd3fc",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            CLASH OF CLANS TÜRKİYE PORTALI
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: "#94a3b8" }}>
            sargyt-clashers.vercel.app
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.05,
              color: "#ffffff",
            }}
          >
            Sargyt Clashers
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 600,
              color: "#cbd5e1",
              lineHeight: 1.35,
            }}
          >
            Köyünü analiz et, eksiklerini ve cevher önceliklerini gör, klan savaşlarını canlı takip et.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {OZELLIKLER.map((ozellik) => (
            <div
              key={ozellik}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                borderRadius: 14,
                background: "rgba(15, 23, 42, 0.85)",
                border: "2px solid rgba(56, 189, 248, 0.45)",
                color: "#e0f2fe",
                fontSize: 21,
                fontWeight: 800,
              }}
            >
              {ozellik}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
"use client";
import { useState } from "react";

type Ordu = {
  ad: string;
  thMin: number;
  thMax: number;
  tur: string;
  birlikler: string;
  ozet: string;
  dogrulandi: boolean;
};

const ORDULAR: Ordu[] = [
  {
    ad: "Mızrakçı (Thrower) + Healer",
    thMin: 19,
    thMax: 19,
    tur: "Yer",
    birlikler: "Mızrakçı (Thrower), Healer",
    ozet: "Sargyt'ın kullandığı ordu: Mızrakçılar ana vurucu güçtür, Healer'lar onları iyileştirir.",
    dogrulandi: true,
  }, 
    {
    ad: "Dragon Duke + Super Bowler",
    thMin: 17,
    thMax: 18,
    tur: "Karma (yer + hava)",
    birlikler: "Dragon Duke, Super Bowler, Ice Golem, Healer",
    ozet: "Dragon Duke ile açılış yapılır, Super Bowler ana vurucu güçtür, Ice Golem tanklık eder.",
    dogrulandi: false,
  },
  {
    ad: "Warden Walk + Mızrakçı",
    thMin: 18,
    thMax: 19,
    tur: "Yer",
    birlikler: "Grand Warden, Mızrakçı, tank birlikler, Skeleton ve Rage büyüleri",
    ozet: "Grand Warden önde yürür, Mızrakçı'lar duvar arkasındaki hedefleri uzaktan yok eder.",
    dogrulandi: false,
  },
  {
    ad: "Dragon Rider + Minion Prince",
    thMin: 17,
    thMax: 18,
    tur: "Hava",
    birlikler: "Dragon Rider, Inferno Dragon, Rocket Balloon, hava odaklı ekipmanlar",
    ozet: "Hava ordusu, Freeze ve Skeleton büyüleriyle tek hedefli savunmaları etkisiz hale getirir.",
    dogrulandi: false,
  },
  {
    ad: "Root Rider + Overgrowth",
    thMin: 17,
    thMax: 19,
    tur: "Yer (Smash)",
    birlikler: "Root Rider, Witch veya Titan, Overgrowth ve Freeze büyüleri",
    ozet: "Overgrowth ile kritik savunmalar geçici devre dışı kalır, ordu merkeze hızla ilerler.",
    dogrulandi: false,
  },
  {
    ad: "Super Witch + Fireball",
    thMin: 17,
    thMax: 18,
    tur: "Yer",
    birlikler: "Super Witch, Healer, Skeleton ve Invisibility büyüleri, Grand Warden Fireball",
    ozet: "Fireball ile haritanın kritik bir bölgesi açılır, geri kalan ordu o yoldan ilerler.",
    dogrulandi: false,
  },
];

const FILTRELER = ["Tümü", "17", "18", "19"];

export default function Ordular() {
  const [th, setTh] = useState("Tümü");

  const liste = ORDULAR.filter(
    (o) => th === "Tümü" || (Number(th) >= o.thMin && Number(th) <= o.thMax)
  );

  return (
    <main style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1>Ordular</h1>
      <p style={{ opacity: 0.75 }}>
        Belediye binasına göre ordu fikirleri. &quot;Doğrulanmadı&quot; etiketi, içeriğin henüz oyunda
        veya güvenilir bir kaynakla teyit edilmediğini gösterir.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
        {FILTRELER.map((f) => (
          <button
            key={f}
            onClick={() => setTh(f)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: th === f ? "var(--vurgu)" : "var(--kart)",
              color: th === f ? "#111" : "var(--fg)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {f === "Tümü" ? "Tümü" : "TH" + f}
          </button>
        ))}
      </div>

      <p style={{ opacity: 0.7 }}>{liste.length} ordu</p>

      <div style={{ display: "grid", gap: 12 }}>
        {liste.map((o) => (
          <div
            key={o.ad}
            style={{
              padding: 16,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <strong>{o.ad}</strong>
              <span style={{ fontSize: 13, opacity: 0.75 }}>
                TH{o.thMin}–TH{o.thMax} · {o.tur}
              </span>
            </div>
            <p style={{ margin: "8px 0", fontSize: 14 }}>
              <strong>Birlikler:</strong> {o.birlikler}
            </p>
            <p style={{ margin: "8px 0", fontSize: 14 }}>{o.ozet}</p>
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 10,
                background: o.dogrulandi ? "var(--vurgu)" : "var(--cizgi)",
                color: o.dogrulandi ? "#111" : "var(--fg)",
              }}
            >
              {o.dogrulandi ? "Doğrulandı" : "Doğrulanmadı"}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
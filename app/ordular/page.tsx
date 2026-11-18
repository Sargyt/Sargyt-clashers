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
    ad: "Mızrakçı + Şifacı",
    thMin: 19,
    thMax: 19,
    tur: "Yer",
    birlikler: "Mızrakçı, Şifacı",
    ozet: "Sargyt'ın kullandığı ordu: Mızrakçılar ana vurucu güçtür, Şifacılar onları iyileştirir.",
    dogrulandi: true,
  },
  {
    ad: "Ejder Dükü + Süper Atıcı",
    thMin: 17,
    thMax: 18,
    tur: "Karma (yer + hava)",
    birlikler: "Ejder Dükü, Süper Atıcı, Buz Golem, Şifacı",
    ozet: "Ejder Dükü ile açılış yapılır, Süper Atıcı ana vurucu güçtür, Buz Golem tanklık eder.",
    dogrulandi: false,
  },
  {
    ad: "Büyük Koruyucu yürüyüşü + Mızrakçı",
    thMin: 18,
    thMax: 19,
    tur: "Yer",
    birlikler: "Büyük Koruyucu, Mızrakçı, tank birlikler, İskelet ve Öfke büyüleri",
    ozet: "Büyük Koruyucu önde yürür, Mızrakçılar duvar arkasındaki hedefleri uzaktan yok eder.",
    dogrulandi: false,
  },
  {
    ad: "Ejderha Binici + Minyon Prens",
    thMin: 17,
    thMax: 18,
    tur: "Hava",
    birlikler: "Ejderha Binici, Cehennem Ejderhası, Roket Balon, hava odaklı ekipmanlar",
    ozet: "Hava ordusu, Buz ve İskelet büyüleriyle tek hedefli savunmaları etkisiz hale getirir.",
    dogrulandi: false,
  },
  {
    ad: "Orman Binici + Sarmaşık Büyüsü",
    thMin: 17,
    thMax: 19,
    tur: "Yer (ezme)",
    birlikler: "Orman Binici, Cadı veya Titan, Sarmaşık ve Buz büyüleri",
    ozet: "Sarmaşık Büyüsü ile kritik savunmalar geçici devre dışı kalır, ordu merkeze hızla ilerler.",
    dogrulandi: false,
  },
  {
    ad: "Süper Cadı + Ateş Topu",
    thMin: 17,
    thMax: 18,
    tur: "Yer",
    birlikler: "Süper Cadı, Şifacı, İskelet ve Görünmezlik büyüleri, Büyük Koruyucu'nun Ateş Topu",
    ozet: "Ateş Topu ile haritanın kritik bir bölgesi açılır, geri kalan ordu o yoldan ilerler.",
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
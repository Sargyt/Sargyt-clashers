"use client";
import { useState } from "react";

type Ordu = {
  ad: string;
  thMin: number;
  thMax: number;
  tur: "Yer" | "Hava" | "Karma";
  zorluk: "Kolay" | "Orta" | "İleri";
  birlikler: string;
  buyuler: string;
  kusatma: string;
  ozet: string;
  dogrulandi: boolean;
};

const ORDULAR: Ordu[] = [
  {
    ad: "Orman Binicisi & Valkyrie Ezme (Root Rider Smash)",
    thMin: 15,
    thMax: 17,
    tur: "Yer",
    zorluk: "Kolay",
    birlikler: "6 Orman Binicisi, 10 Valkyrie, 3 Buz Golem, 2 Çırak Koruyucu",
    buyuler: "3 Sarmaşık, 2 Öfke, 1 Dondurma, 1 Zehir",
    kusatma: "Kuşatma Kışlası veya Odun Fırlatıcı",
    ozet: "Güncel metanın en güçlü yer ordusu. Orman Binicileri duvarları yararken Valkyrie'ler merkeze hızla girip savunmaları temizler.",
    dogrulandi: true,
  },
  {
    ad: "Mızrakçı + Şifacı (Sargyt Özel)",
    thMin: 16,
    thMax: 17,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "12 Mızrakçı, 5 Şifacı, 2 Buz Golem, 3 Süper Duvar Yıkıcı",
    buyuler: "3 Öfke, 2 İskelet, 2 Dondurma, 1 Zehir",
    kusatma: "Kuşatma Kışlası",
    ozet: "Sargyt'ın kullandığı özel ordu: Mızrakçılar duvar arkasındaki hedefleri uzaktan eritirken Şifacılar onları ayakta tutar.",
    dogrulandi: true,
  },
  {
    ad: "Süper Okçu Zeplin + Ejderha (Super Archer Blimp)",
    thMin: 13,
    thMax: 17,
    tur: "Hava",
    zorluk: "İleri",
    birlikler: "10 Ejderha, 8 Balon, 1 Bebek Ejderha (Klan Kalesi: 3 Süper Okçu)",
    buyuler: "2 Klon, 1 Öfke, 5 Görünmezlik",
    kusatma: "Savaş Zeplini",
    ozet: "Koruyucu özelliğiyle merkeze indirilen Zeplin içindeki Süper Okçular Görünmezlik ve Klon ile köyün %40'ını tek başına yok eder.",
    dogrulandi: true,
  },
  {
    ad: "Kraliçe Yürüyüşü Hibrit (QC Hybrid)",
    thMin: 13,
    thMax: 15,
    tur: "Yer",
    zorluk: "İleri",
    birlikler: "5 Şifacı, 14 Madenci, 12 Domuz Binici, 2 Bebek Ejderha, 3 Süper Duvar Yıkıcı",
    buyuler: "3 İyileştirme, 2 Öfke, 2 Dondurma, 1 Zehir",
    kusatma: "Kuşatma Kışlası",
    ozet: "Okçu Kraliçe haritanın bir kanadını ve Klan Kalesini temizlerken Madenci ve Domuz Biniciler L şeklinde koridor boyunca ilerler.",
    dogrulandi: true,
  },
  {
    ad: "Yıldırım Ejderha & Balon (Zap Dragons)",
    thMin: 13,
    thMax: 16,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "12 Ejderha, 12 Balon, 1 Ejderha Binici",
    buyuler: "6 Yıldırım, 2 Deprem, 1 Öfke, 1 Dondurma",
    kusatma: "Kaya Balonu veya Savaş Zeplini",
    ozet: "Hava Savunmaları ve Tekli Cehennem Kuleleri Yıldırım/Deprem ile indirilir, ardından Ejderhalar tek hat üzerinden salınır.",
    dogrulandi: true,
  },
  {
    ad: "Büyük Koruyucu Ateş Topu + Süper Cadı",
    thMin: 15,
    thMax: 17,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "4 Süper Cadı, 5 Şifacı, 2 Buz Golem, 3 Süper Duvar Yıkıcı",
    buyuler: "3 Öfke, 2 Dondurma, 2 Görünmezlik, 1 Zehir",
    kusatma: "Alev Atıcı",
    ozet: "Büyük Koruyucu'nun Ateş Topu ekipmanı ile kritik savunma öbeği patlatılır, Süper Cadılar Koca İskeletlerle birlikte ilerler.",
    dogrulandi: true,
  },
  {
    ad: "Elektro Ejderha & Öfke Balon (E-Drag Spam)",
    thMin: 13,
    thMax: 16,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "8 Elektro Ejderha, 14 Balon, 1 Bebek Ejderha",
    buyuler: "3 Öfke, 5 Dondurma",
    kusatma: "Kaya Balonu veya Savaş Zeplini",
    ozet: "Binaların birbirine bitişik dizildiği sıkışık köy düzenlerine karşı zincirleme yıldırım hasarıyla yüksek 3 yıldız şansı sunar.",
    dogrulandi: true,
  },
  {
    ad: "Yeti & Süper Atıcı Ezme (Yeti Smash)",
    thMin: 13,
    thMax: 15,
    tur: "Karma",
    zorluk: "Orta",
    birlikler: "4 Yeti, 4 Süper Atıcı, 4 Şifacı, 2 Buz Golem",
    buyuler: "3 Öfke, 1 Zıplama, 2 Dondurma, 1 Zehir",
    kusatma: "Odun Fırlatıcı",
    ozet: "Odun Fırlatıcı ve Zıplama büyüsü ile merkeze açılan koridordan Yeti ve Süper Atıcılar çift seken kayalarla tüm merkezi eritir.",
    dogrulandi: true,
  },
];

const TH_FILTRELER = ["Tümü", "13", "14", "15", "16", "17"];
const TUR_FILTRELER = ["Tümü", "Yer", "Hava", "Karma"];

export default function Ordular() {
  const [th, setTh] = useState("Tümü");
  const [tur, setTur] = useState("Tümü");
  const [kopyalanan, setKopyalanan] = useState("");

  const liste = ORDULAR.filter((o) => {
    const thUygun = th === "Tümü" || (Number(th) >= o.thMin && Number(th) <= o.thMax);
    const turUygun = tur === "Tümü" || o.tur === tur;
    return thUygun && turUygun;
  });

  function orduKopyala(o: Ordu) {
    const metin = `⚔️ ${o.ad} (TH${o.thMin}-TH${o.thMax})\n• Birlikler: ${o.birlikler}\n• Büyüler: ${o.buyuler}\n• Kuşatma: ${o.kusatma}`;
    navigator.clipboard.writeText(metin);
    setKopyalanan(o.ad);
    setTimeout(() => setKopyalanan(""), 2000);
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Meta Ordular & Stratejiler</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Belediye Binası seviyene ve saldırı tarzına göre en güncel ve kanıtlanmış 3 yıldız ordularını filtrele.
      </p>

      {/* Filtre Alanı */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          margin: "20px 0",
          padding: 14,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginRight: 4 }}>Belediye:</span>
          {TH_FILTRELER.map((f) => (
            <button
              key={f}
              onClick={() => setTh(f)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid " + (th === f ? "var(--vurgu)" : "var(--cizgi)"),
                background: th === f ? "var(--vurgu)" : "var(--bg)",
                color: th === f ? "#111" : "var(--fg)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {f === "Tümü" ? "Tümü" : "BB " + f}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginRight: 4 }}>Tür:</span>
          {TUR_FILTRELER.map((t) => (
            <button
              key={t}
              onClick={() => setTur(t)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "1px solid " + (tur === t ? "var(--vurgu)" : "var(--cizgi)"),
                background: tur === t ? "var(--vurgu)" : "var(--bg)",
                color: tur === t ? "#111" : "var(--fg)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p style={{ opacity: 0.7, fontSize: 14 }}>{liste.length} ordu listeleniyor</p>

      <div style={{ display: "grid", gap: 14 }}>
        {liste.map((o) => (
          <div
            key={o.ad}
            style={{
              padding: 18,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 18 }}>{o.ad}</strong>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 9px",
                    borderRadius: 8,
                    background: "var(--bg)",
                    border: "1px solid var(--cizgi)",
                    fontWeight: 600,
                  }}
                >
                  BB {o.thMin}–{o.thMax} · {o.tur}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 9px",
                    borderRadius: 8,
                    background: "var(--bg)",
                    border: "1px solid var(--cizgi)",
                  }}
                >
                  Zorluk: {o.zorluk}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 8,
                padding: 12,
                borderRadius: 10,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                fontSize: 13,
              }}
            >
              <div>
                <strong>⚔️ Birlikler:</strong> {o.birlikler}
              </div>
              <div>
                <strong>⚡ Büyüler:</strong> {o.buyuler}
              </div>
              <div>
                <strong>🚜 Kuşatma:</strong> {o.kusatma}
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>{o.ozet}</p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 8,
                  background: o.dogrulandi ? "var(--vurgu)" : "var(--cizgi)",
                  color: o.dogrulandi ? "#111" : "var(--fg)",
                  fontWeight: 700,
                }}
              >
                {o.dogrulandi ? "✓ Meta Doğrulandı" : "Deneysel"}
              </span>

              <button
                type="button"
                onClick={() => orduKopyala(o)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {kopyalanan === o.ad ? "✅ Kopyalandı!" : "📋 Orduyu Kopyala"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
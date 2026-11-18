"use client";
import { useState } from "react";

// Duvar seviyelerine göre 1 adet duvarın temel yükseltme maliyeti (Altın / İksir)
const DUVAR_MALIYETLERI: Record<number, number> = {
  8: 25000,
  9: 50000,
  10: 100000,
  11: 200000,
  12: 500000,
  13: 1000000,
  14: 2000000,
  15: 3000000,
  16: 5000000,
  17: 8000000,
  18: 9000000,
};

// Clash of Clans gerçek süre -> Taş (Gem) dönüşüm formülü
function sureyiTasaCevir(toplamSaniye: number): number {
  if (toplamSaniye <= 0) return 0;
  if (toplamSaniye <= 60) return 1;
  if (toplamSaniye <= 3600) {
    // 1 dakika (1 taş) -> 1 saat (20 taş)
    return Math.round(1 + ((toplamSaniye - 60) / 3540) * 19);
  }
  if (toplamSaniye <= 86400) {
    // 1 saat (20 taş) -> 24 saat (260 taş)
    return Math.round(20 + ((toplamSaniye - 3600) / 82800) * 240);
  }
  // 1 gün (260 taş) -> her ekstra gün +123 taş
  return Math.round(260 + ((toplamSaniye - 86400) / 86400) * 123);
}

function sayiFormatla(sayi: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.round(sayi));
}

export default function HesaplayiciSayfasi() {
  // Duvar Hesaplayıcı State'leri
  const [mevcutSeviye, setMevcutSeviye] = useState(13);
  const [hedefSeviye, setHedefSeviye] = useState(15);
  const [duvarAdedi, setDuvarAdedi] = useState(100);
  const [indirimOrani, setIndirimOrani] = useState(20); // %0, %10, %15, %20

  // Taş (Gem) Hesaplayıcı State'leri
  const [gun, setGun] = useState(3);
  const [saat, setSaat] = useState(12);
  const [dakika, setDakika] = useState(0);

  // Duvar Maliyeti Hesaplama
  let birimHamMaliyet = 0;
  for (let s = mevcutSeviye + 1; s <= hedefSeviye; s++) {
    birimHamMaliyet += DUVAR_MALIYETLERI[s] ?? 0;
  }
  const toplamHamMaliyet = birimHamMaliyet * Math.max(0, duvarAdedi);
  const indirimMiktari = toplamHamMaliyet * (indirimOrani / 100);
  const odenecekNetMaliyet = toplamHamMaliyet - indirimMiktari;

  // Taş Hesaplama
  const toplamSaniye = Math.max(0, gun) * 86400 + Math.max(0, saat) * 3600 + Math.max(0, dakika) * 60;
  const gerekenTas = sureyiTasaCevir(toplamSaniye);

  return (
    <main style={{ padding: "40px 20px", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Köy Hesaplayıcıları</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Duvar yükseltme maliyetlerini, Altın Bilet indirimini ve inşaat bitirme taş (gem) tutarını hesapla.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginTop: 24,
        }}
      >
        {/* 1. KART: DUVAR & ALTIN BİLET HESAPLAYICI */}
        <section
          style={{
            padding: 22,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>🧱 Duvar & Altın Bilet Hesaplayıcı</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label style={{ fontSize: 13 }}>
              Mevcut Duvar Seviyesi
              <select
                value={mevcutSeviye}
                onChange={(e) => {
                  const yeni = Number(e.target.value);
                  setMevcutSeviye(yeni);
                  if (hedefSeviye <= yeni) setHedefSeviye(Math.min(18, yeni + 1));
                }}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                }}
              >
                {Object.keys(DUVAR_MALIYETLERI).map((s) => (
                  <option key={s} value={Number(s) - 1}>
                    Seviye {Number(s) - 1}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: 13 }}>
              Hedef Duvar Seviyesi
              <select
                value={hedefSeviye}
                onChange={(e) => setHedefSeviye(Number(e.target.value))}
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                }}
              >
                {Object.keys(DUVAR_MALIYETLERI)
                  .map(Number)
                  .filter((s) => s > mevcutSeviye)
                  .map((s) => (
                    <option key={s} value={s}>
                      Seviye {s}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label style={{ fontSize: 13 }}>
            Duvar Adedi (Maks. 325)
            <input
              type="number"
              min={1}
              max={325}
              value={duvarAdedi}
              onChange={(e) => setDuvarAdedi(Math.min(325, Math.max(0, Number(e.target.value))))}
              style={{
                width: "100%",
                marginTop: 4,
                padding: 10,
                borderRadius: 8,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
          </label>

          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>🎫 Altın Bilet İnşaat İndirimi</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {[0, 10, 15, 20].map((oran) => (
                <button
                  key={oran}
                  type="button"
                  onClick={() => setIndirimOrani(oran)}
                  style={{
                    padding: "8px 0",
                    borderRadius: 8,
                    border: indirimOrani === oran ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                    background: indirimOrani === oran ? "var(--vurgu)" : "var(--bg)",
                    color: indirimOrani === oran ? "#111" : "var(--fg)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {oran === 0 ? "Yok (%0)" : `%${oran}`}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 6,
              padding: 14,
              borderRadius: 10,
              background: "var(--bg)",
              border: "1px solid var(--cizgi)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, opacity: 0.75 }}>
              <span>İndirimsiz Toplam:</span>
              <span>{sayiFormatla(toplamHamMaliyet)} Altın/İksir</span>
            </div>
            {indirimOrani > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#22c55e" }}>
                <span>Altın Bilet Kazancı (%{indirimOrani}):</span>
                <span>-{sayiFormatla(indirimMiktari)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 16,
                fontWeight: 700,
                borderTop: "1px solid var(--cizgi)",
                paddingTop: 8,
                marginTop: 2,
              }}
            >
              <span>Gereken Kaynak:</span>
              <span style={{ color: "var(--vurgu)" }}>{sayiFormatla(odenecekNetMaliyet)}</span>
            </div>
          </div>
        </section>

        {/* 2. KART: SÜRE -> TAŞ (GEM) HESAPLAYICI */}
        <section
          style={{
            padding: 22,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>💎 Süre & Taş (Gem) Hesaplayıcı</h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>
              Kalan inşaat veya laboratuvar araştırma süresini gir, anında bitirmek için kaç Yeşil Taş gerektiğini gör.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <label style={{ fontSize: 13 }}>
                Gün
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={gun}
                  onChange={(e) => setGun(Math.max(0, Number(e.target.value)))}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                  }}
                />
              </label>

              <label style={{ fontSize: 13 }}>
                Saat
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={saat}
                  onChange={(e) => setSaat(Math.min(23, Math.max(0, Number(e.target.value))))}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                  }}
                />
              </label>

              <label style={{ fontSize: 13 }}>
                Dakika
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={dakika}
                  onChange={(e) => setDakika(Math.min(59, Math.max(0, Number(e.target.value))))}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                  }}
                />
              </label>
            </div>
          </div>

          <div
            style={{
              padding: 18,
              borderRadius: 10,
              background: "var(--bg)",
              border: "1px solid var(--cizgi)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.75 }}>Anında Bitirme Maliyeti</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>
              💎 {sayiFormatla(gerekenTas)} Taş
            </div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
              {gun} gün {saat} saat {dakika} dakika için
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
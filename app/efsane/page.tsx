"use client";
import { useEffect, useState } from "react";

type GunKaydi = {
  id: string;
  tarih: string;
  saldirilar: number[]; // 8 saldırı (0..40)
  savunmalar: number[]; // 8 savunma (0..40, pozitif değer olarak tutulur, eksiye çevrilir)
  net: number;
};

const BOS_8 = () => [0, 0, 0, 0, 0, 0, 0, 0];

function bugunStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function EfsaneLigiSayfasi() {
  const [saldirilar, setSaldirilar] = useState<number[]>(BOS_8());
  const [savunmalar, setSavunmalar] = useState<number[]>(BOS_8());
  const [baslangicKupa, setBaslangicKupa] = useState(5400);
  const [gecmis, setGecmis] = useState<GunKaydi[]>([]);
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    try {
      const hamGecmis = localStorage.getItem("sargyt_efsane_gecmis");
      if (hamGecmis) setGecmis(JSON.parse(hamGecmis));
      const hamKupa = localStorage.getItem("sargyt_efsane_kupa");
      if (hamKupa) setBaslangicKupa(Number(hamKupa) || 5400);
    } catch {}
  }, []);

  const toplamSaldiri = saldirilar.reduce((t, v) => t + (Number(v) || 0), 0);
  const toplamSavunma = savunmalar.reduce((t, v) => t + (Number(v) || 0), 0);
  const netDegisim = toplamSaldiri - toplamSavunma;
  const guncelKupa = baslangicKupa + netDegisim;

  const doluSaldiriAdet = saldirilar.filter((v) => v > 0).length;
  const doluSavunmaAdet = savunmalar.filter((v) => v > 0).length;
  const ortSaldiri = doluSaldiriAdet ? (toplamSaldiri / doluSaldiriAdet).toFixed(1) : "0.0";
  const ortSavunma = doluSavunmaAdet ? (toplamSavunma / doluSavunmaAdet).toFixed(1) : "0.0";

  function saldiriGuncelle(idx: number, deger: number) {
    const temiz = Math.max(0, Math.min(40, Number.isNaN(deger) ? 0 : deger));
    setSaldirilar((eski) => eski.map((v, i) => (i === idx ? temiz : v)));
  }

  function savunmaGuncelle(idx: number, deger: number) {
    const temiz = Math.max(0, Math.min(40, Number.isNaN(deger) ? 0 : deger));
    setSavunmalar((eski) => eski.map((v, i) => (i === idx ? temiz : v)));
  }

  function tamUcYildizDoldur() {
    setSaldirilar([40, 40, 40, 40, 40, 40, 40, 40]);
  }

  function gunuKaydet() {
    const yeniKayit: GunKaydi = {
      id: String(Date.now()),
      tarih: bugunStr(),
      saldirilar: [...saldirilar],
      savunmalar: [...savunmalar],
      net: netDegisim,
    };
    const guncelListe = [yeniKayit, ...gecmis].slice(0, 14);
    setGecmis(guncelListe);
    setBaslangicKupa(guncelKupa);
    try {
      localStorage.setItem("sargyt_efsane_gecmis", JSON.stringify(guncelListe));
      localStorage.setItem("sargyt_efsane_kupa", String(guncelKupa));
    } catch {}
  }

  function gunKaydiSil(id: string) {
    const guncel = gecmis.filter((g) => g.id !== id);
    setGecmis(guncel);
    try {
      localStorage.setItem("sargyt_efsane_gecmis", JSON.stringify(guncel));
    } catch {}
  }

  function sifirla() {
    setSaldirilar(BOS_8());
    setSavunmalar(BOS_8());
  }

  async function ozetKopyala() {
    const isaret = netDegisim >= 0 ? `+${netDegisim}` : `${netDegisim}`;
    const metin = `🏆 *Efsane Ligi Günlük Rapor* (${bugunStr()})\n⚔️ Saldırı: +${toplamSaldiri} kupa (Ort: ${ortSaldiri})\n🛡️ Savunma: -${toplamSavunma} kupa (Ort: -${ortSavunma})\n📊 Net Günlük: *${isaret}* · Güncel Kupa: *${guncelKupa}*\n📋 Sargyt Clashers`;
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2200);
    } catch {}
  }

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1320, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ÜST BAŞLIK & KUPA ÖZETİ */}
      <section style={{ padding: "24px 28px", background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px" }}>
              🏆 Efsane Ligi Günlük Takipçisi
            </h1>
            <p style={{ margin: 0, opacity: 0.78, fontSize: 15 }}>
              8 saldırı ve 8 savunmanı gir; gün sonu net kupa değişimini ve ortalamalarını anında gör.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={tamUcYildizDoldur}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              ⚡ 8×40 Doldur
            </button>
            <button
              type="button"
              onClick={sifirla}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef6b5f", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              Sıfırla
            </button>
          </div>
        </div>

        {/* ÖZET KARTLARI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 12 }}>
          <div style={{ padding: 14, borderRadius: 13, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.72 }}>Güne Başlangıç Kupası</div>
            <input
              type="number"
              min={0}
              max={9999}
              value={baslangicKupa}
              onChange={(e) => setBaslangicKupa(Math.max(0, Number(e.target.value) || 0))}
              style={{ marginTop: 6, width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "var(--fg)", fontWeight: 900, fontSize: 16 }}
            />
          </div>

          <div style={{ padding: 14, borderRadius: 13, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.72 }}>Saldırı Kazancı (Ort: {ortSaldiri})</div>
            <div style={{ fontSize: 22, fontWeight: 950, color: "#22c55e", marginTop: 6 }}>
              +{toplamSaldiri}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 13, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.72 }}>Savunma Kaybı (Ort: -{ortSavunma})</div>
            <div style={{ fontSize: 22, fontWeight: 950, color: "#ef6b5f", marginTop: 6 }}>
              -{toplamSavunma}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 13, background: "var(--bg)", border: "1.5px solid var(--vurgu)" }}>
            <div style={{ fontSize: 12, opacity: 0.72 }}>Net Günlük · Tahmini Kupa</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 950, color: netDegisim >= 0 ? "#22c55e" : "#ef6b5f" }}>
                {netDegisim >= 0 ? `+${netDegisim}` : netDegisim}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                → {guncelKupa} 🏆
              </span>
            </div>
          </div>
        </div>

        {/* AKSİYON BUTONLARI */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={gunuKaydet}
            style={{ padding: "10px 20px", borderRadius: 11, border: 0, background: "var(--vurgu)", color: "var(--vurgu-yazi)", fontWeight: 900, cursor: "pointer" }}
          >
            💾 Günü Kaydet & Kupayı Güncelle
          </button>
          <button
            type="button"
            onClick={ozetKopyala}
            style={{ padding: "10px 20px", borderRadius: 11, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, cursor: "pointer" }}
          >
            {kopyalandi ? "✓ Rapor Kopyalandı!" : "📋 Günlük Raporu Kopyala"}
          </button>
        </div>
      </section>

      {/* 8 SALDIRI & 8 SAVUNMA IZGARASI */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        {/* SALDIRILAR */}
        <div style={{ padding: 22, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="baslik-serit" style={{ margin: 0, fontSize: 17 }}>
              <span>⚔️ 8 Günlük Saldırı</span>
            </h2>
            <strong style={{ color: "#22c55e", fontSize: 15 }}>+{toplamSaldiri}</strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {saldirilar.map((deger, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.8 }}>Saldırı #{idx + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 900 }}>+</span>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={deger || ""}
                    placeholder="0"
                    onChange={(e) => saldiriGuncelle(idx, Number(e.target.value))}
                    style={{
                      width: 58,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: "1px solid var(--cizgi)",
                      background: "var(--kart)",
                      color: "var(--fg)",
                      fontWeight: 900,
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVUNMALAR */}
        <div style={{ padding: 22, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="baslik-serit" style={{ margin: 0, fontSize: 17 }}>
              <span>🛡️ 8 Günlük Savunma</span>
            </h2>
            <strong style={{ color: "#ef6b5f", fontSize: 15 }}>-{toplamSavunma}</strong>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {savunmalar.map((deger, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.8 }}>Savunma #{idx + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, color: "#ef6b5f", fontWeight: 900 }}>−</span>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={deger || ""}
                    placeholder="0"
                    onChange={(e) => savunmaGuncelle(idx, Number(e.target.value))}
                    style={{
                      width: 58,
                      padding: "6px 8px",
                      borderRadius: 8,
                      border: "1px solid var(--cizgi)",
                      background: "var(--kart)",
                      color: "var(--fg)",
                      fontWeight: 900,
                      textAlign: "center",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KAYITLI GÜN GEÇMİŞİ */}
      {gecmis.length > 0 && (
        <section style={{ padding: 22, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <h2 className="baslik-serit" style={{ margin: 0, fontSize: 17 }}>
            <span>📅 Kayıtlı Günlerim ({gecmis.length})</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {gecmis.map((g) => {
              const sTop = g.saldirilar.reduce((t, v) => t + v, 0);
              const dTop = g.savunmalar.reduce((t, v) => t + v, 0);
              return (
                <div key={g.id} style={{ padding: 14, borderRadius: 13, background: "var(--bg)", border: "1px solid var(--cizgi)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900 }}>{g.tarih}</div>
                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                      ⚔️ +{sTop} · 🛡️ -{dTop}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 17, color: g.net >= 0 ? "#22c55e" : "#ef6b5f" }}>
                      {g.net >= 0 ? `+${g.net}` : g.net}
                    </strong>
                    <button
                      type="button"
                      onClick={() => gunKaydiSil(g.id)}
                      style={{ padding: "4px 8px", minHeight: 28, borderRadius: 7, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "#ef6b5f", fontSize: 11.5, fontWeight: 800, cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
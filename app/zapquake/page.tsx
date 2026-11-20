"use client";
import { useState } from "react";

type SavunmaVeri = {
  id: string;
  ad: string;
  ikon: string;
  seviyeler: { sv: number; hp: number }[];
};

const YILDIRIM_HASAR: Record<number, number> = {
  5: 270,
  6: 320,
  7: 400,
  8: 480,
  9: 560,
  10: 600,
  11: 640,
  12: 660,
  13: 680,
};

const DEPREM_YUZDE: Record<number, number> = {
  1: 0.145,
  2: 0.17,
  3: 0.21,
  4: 0.25,
  5: 0.29,
};

const DEV_OK_HASAR: Record<number, number> = {
  0: 0,
  9: 1150,
  12: 1500,
  15: 1750,
  18: 1950,
};

const SAVUNMALAR: SavunmaVeri[] = [
  {
    id: "hava-savunmasi",
    ad: "Hava Savunması",
    ikon: "🚀",
    seviyeler: [
      { sv: 8, hp: 1200 },
      { sv: 9, hp: 1300 },
      { sv: 10, hp: 1400 },
      { sv: 11, hp: 1500 },
      { sv: 12, hp: 1650 },
      { sv: 13, hp: 1750 },
      { sv: 14, hp: 1850 },
      { sv: 15, hp: 1950 },
    ],
  },
  {
    id: "hava-patlatici",
    ad: "Hava Patlatıcı",
    ikon: "💨",
    seviyeler: [
      { sv: 4, hp: 900 },
      { sv: 5, hp: 950 },
      { sv: 6, hp: 1000 },
      { sv: 7, hp: 1050 },
    ],
  },
  {
    id: "cehennem-kulesi",
    ad: "Cehennem Kulesi",
    ikon: "🔥",
    seviyeler: [
      { sv: 6, hp: 3000 },
      { sv: 7, hp: 3300 },
      { sv: 8, hp: 3700 },
      { sv: 9, hp: 4000 },
      { sv: 10, hp: 4400 },
      { sv: 11, hp: 4700 },
    ],
  },
  {
    id: "x-yayi",
    ad: "X Yayı",
    ikon: "🏹",
    seviyeler: [
      { sv: 7, hp: 3500 },
      { sv: 8, hp: 3900 },
      { sv: 9, hp: 4200 },
      { sv: 10, hp: 4400 },
      { sv: 11, hp: 4600 },
      { sv: 12, hp: 4900 },
    ],
  },
  {
    id: "kayasaçar",
    ad: "Kayasaçar",
    ikon: "☄️",
    seviyeler: [
      { sv: 1, hp: 3600 },
      { sv: 2, hp: 4200 },
      { sv: 3, hp: 4800 },
      { sv: 4, hp: 5100 },
      { sv: 5, hp: 5400 },
      { sv: 6, hp: 5700 },
    ],
  },
  {
    id: "kartal-topu",
    ad: "Kartal Topu",
    ikon: "🦅",
    seviyeler: [
      { sv: 3, hp: 4800 },
      { sv: 4, hp: 5200 },
      { sv: 5, hp: 5600 },
      { sv: 6, hp: 5900 },
      { sv: 7, hp: 6200 },
    ],
  },
  {
    id: "monolit",
    ad: "Monolit",
    ikon: "🗿",
    seviyeler: [
      { sv: 1, hp: 4747 },
      { sv: 2, hp: 5050 },
      { sv: 3, hp: 5353 },
      { sv: 4, hp: 5750 },
    ],
  },
  {
    id: "buyu-kulesi",
    ad: "Büyü Kulesi",
    ikon: "🧪",
    seviyeler: [
      { sv: 1, hp: 2500 },
      { sv: 2, hp: 2800 },
      { sv: 3, hp: 3100 },
    ],
  },
  {
    id: "coklu-okcu",
    ad: "Çoklu Okçu Kulesi",
    ikon: "🎯",
    seviyeler: [
      { sv: 1, hp: 5000 },
      { sv: 2, hp: 5300 },
      { sv: 3, hp: 5600 },
    ],
  },
  {
    id: "seken-top",
    ad: "Seken Top",
    ikon: "💣",
    seviyeler: [
      { sv: 1, hp: 5400 },
      { sv: 2, hp: 5700 },
      { sv: 3, hp: 6000 },
    ],
  },
  {
    id: "ates-puskurtucu",
    ad: "Ateş Püskürtücü",
    ikon: "🐉",
    seviyeler: [
      { sv: 1, hp: 4500 },
      { sv: 2, hp: 4900 },
    ],
  },
];

// Clash of Clans kuralı: 2. Deprem 1/3, 3. Deprem 1/5 hasar verir.
function depremCarpani(adet: number): number {
  if (adet <= 0) return 0;
  let toplam = 0;
  for (let i = 0; i < adet; i++) {
    toplam += 1 / (2 * i + 1);
  }
  return toplam;
}

function kombinasyonHesapla(hp: number, yildirimHasar: number, depremOran: number, devOkHasar: number) {
  const secenekler = [0, 1, 2].map((depremAdet) => {
    const depremHasar = Math.floor(hp * depremOran * depremCarpani(depremAdet));
    const kalanHp = Math.max(0, hp - depremHasar - devOkHasar);
    const yildirimAdet = kalanHp === 0 ? 0 : Math.ceil(kalanHp / yildirimHasar);
    const toplamAlan = yildirimAdet + depremAdet;
    const fazlaHasar = Math.max(0, yildirimAdet * yildirimHasar + depremHasar + devOkHasar - hp);

    return {
      depremAdet,
      yildirimAdet,
      toplamAlan,
      depremHasar,
      fazlaHasar,
    };
  });

  const enAzAlan = Math.min(...secenekler.map((s) => s.toplamAlan));
  return secenekler.map((s) => ({
    ...s,
    enIyiMi: s.toplamAlan === enAzAlan,
  }));
}

export default function ZapQuakeSayfasi() {
  const [yildirimSv, setYildirimSv] = useState(11);
  const [depremSv, setDepremSv] = useState(5);
  const [devOkSv, setDevOkSv] = useState(0);

  const [seciliId, setSeciliId] = useState(SAVUNMALAR[0].id);
  const seciliSavunma = SAVUNMALAR.find((s) => s.id === seciliId) ?? SAVUNMALAR[0];
  const [savunmaSvIdx, setSavunmaSvIdx] = useState(seciliSavunma.seviyeler.length - 1);

  const [ozelHpAktif, setOzelHpAktif] = useState(false);
  const [ozelHp, setOzelHp] = useState(4000);

  const aktifSeviye = seciliSavunma.seviyeler[Math.min(savunmaSvIdx, seciliSavunma.seviyeler.length - 1)];
  const hedefHp = ozelHpAktif ? Math.max(100, ozelHp) : aktifSeviye.hp;

  const yildirimHasar = YILDIRIM_HASAR[yildirimSv] ?? 640;
  const depremOran = DEPREM_YUZDE[depremSv] ?? 0.29;
  const devOkHasar = DEV_OK_HASAR[devOkSv] ?? 0;

  const sonuclar = kombinasyonHesapla(hedefHp, yildirimHasar, depremOran, devOkHasar);

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1320, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ÜST BAŞLIK & BÜYÜ SEVİYELERİ */}
      <section style={{ padding: "24px 28px", background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>
          ⚡ ZapQuake (Yıldırım + Deprem) Hesaplayıcısı
        </h1>
        <p style={{ margin: "0 0 20px", opacity: 0.78, fontSize: 15 }}>
          Hedef savunmayı indirmek için en az büyü alanıyla kaç Yıldırım ve Deprem gerektiğini anında hesapla.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>⚡ Yıldırım Büyüsü Seviyen</span>
            <select
              value={yildirimSv}
              onChange={(e) => setYildirimSv(Number(e.target.value))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800 }}
            >
              {Object.entries(YILDIRIM_HASAR).map(([sv, hasar]) => (
                <option key={sv} value={Number(sv)}>
                  Sv. {sv} ({hasar} Hasar)
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>🌍 Deprem Büyüsü Seviyen</span>
            <select
              value={depremSv}
              onChange={(e) => setDepremSv(Number(e.target.value))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800 }}
            >
              {Object.entries(DEPREM_YUZDE).map(([sv, oran]) => (
                <option key={sv} value={Number(sv)}>
                  Sv. {sv} (%{Math.round(oran * 1000) / 10} Can)
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>🏹 Dev Ok Desteği (İsteğe Bağlı)</span>
            <select
              value={devOkSv}
              onChange={(e) => setDevOkSv(Number(e.target.value))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800 }}
            >
              <option value={0}>Kullanmıyorum (0 Hasar)</option>
              <option value={9}>Dev Ok Sv. 9 (1.150 Hasar)</option>
              <option value={12}>Dev Ok Sv. 12 (1.500 Hasar)</option>
              <option value={15}>Dev Ok Sv. 15 (1.750 Hasar)</option>
              <option value={18}>Dev Ok Sv. 18 MAX (1.950 Hasar)</option>
            </select>
          </label>
        </div>
      </section>

      {/* HEDEF SAVUNMA SEÇİMİ & SONUÇ KARTLARI */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
            <span>🎯 Hedef Savunma Seçimi</span>
          </h2>

          <button
            type="button"
            onClick={() => setOzelHpAktif((v) => !v)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid " + (ozelHpAktif ? "var(--vurgu)" : "var(--cizgi)"),
              background: ozelHpAktif ? "var(--vurgu)" : "var(--bg)",
              color: ozelHpAktif ? "var(--vurgu-yazi)" : "var(--fg)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {ozelHpAktif ? "✓ Özel HP Modu Açık" : "🔧 Özel HP Gir"}
          </button>
        </div>

        {ozelHpAktif ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--vurgu)" }}>
            <strong style={{ fontSize: 14.5 }}>Hedef Bina Canı (HP):</strong>
            <input
              type="number"
              min={100}
              max={15000}
              step={50}
              value={ozelHp}
              onChange={(e) => setOzelHp(Number(e.target.value))}
              style={{ width: 140, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "var(--fg)", fontWeight: 900 }}
            />
            <span style={{ fontSize: 13, opacity: 0.72 }}>
              Güncelleme sonrası değişen herhangi bir binanın tam HP değerini yazabilirsin.
            </span>
          </div>
        ) : (
          <>
            {/* SAVUNMA BUTONLARI */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SAVUNMALAR.map((s) => {
                const secili = s.id === seciliSavunma.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSeciliId(s.id);
                      setSavunmaSvIdx(s.seviyeler.length - 1);
                    }}
                    style={{
                      padding: "8px 13px",
                      borderRadius: 10,
                      border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                      background: secili ? "var(--vurgu)" : "var(--bg)",
                      color: secili ? "var(--vurgu-yazi)" : "var(--fg)",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {s.ikon} {s.ad}
                  </button>
                );
              })}
            </div>

            {/* SEVİYE SEÇİCİ */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, opacity: 0.8 }}>Seviye:</span>
              {seciliSavunma.seviyeler.map((s, idx) => {
                const secili = idx === Math.min(savunmaSvIdx, seciliSavunma.seviyeler.length - 1);
                return (
                  <button
                    key={s.sv}
                    type="button"
                    onClick={() => setSavunmaSvIdx(idx)}
                    style={{
                      padding: "6px 12px",
                      minHeight: 34,
                      borderRadius: 9,
                      border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                      background: secili ? "var(--vurgu)" : "var(--bg)",
                      color: secili ? "var(--vurgu-yazi)" : "var(--fg)",
                      fontWeight: 800,
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    Sv. {s.sv} ({s.hp.toLocaleString("tr-TR")} HP)
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* 3 KOMBİNASYON SONUÇ KARTI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
          {sonuclar.map((s) => (
            <div
              key={s.depremAdet}
              style={{
                padding: 18,
                borderRadius: 15,
                background: "var(--bg)",
                border: s.enIyiMi ? "2px solid #22c55e" : "1px solid var(--cizgi)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 15 }}>
                  {s.depremAdet === 0 ? "Sadece Yıldırım" : `${s.depremAdet} Deprem + Yıldırım`}
                </strong>
                {s.enIyiMi && (
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: 8,
                      fontSize: 11.5,
                      fontWeight: 900,
                      background: "rgba(34, 197, 94, 0.18)",
                      color: "#22c55e",
                    }}
                  >
                    ★ EN EKONOMİK
                  </span>
                )}
              </div>

              <div style={{ fontSize: 26, fontWeight: 950, color: s.enIyiMi ? "#22c55e" : "var(--vurgu)" }}>
                {s.yildirimAdet === 0 && s.depremAdet === 0
                  ? "🏹 Sadece Dev Ok Yeter!"
                  : `${s.yildirimAdet}⚡${s.depremAdet > 0 ? ` + ${s.depremAdet}🌍` : ""}`}
              </div>

              <div style={{ fontSize: 13, opacity: 0.8, display: "flex", flexDirection: "column", gap: 3 }}>
                <span>📦 Toplam Büyü Alanı: <strong>{s.toplamAlan} yer</strong></span>
                {s.depremAdet > 0 && (
                  <span>🌍 Deprem Hasarı: <strong>{s.depremHasar.toLocaleString("tr-TR")} HP</strong></span>
                )}
                <span>🛡️ Hasar Payı: <strong>+{s.fazlaHasar.toLocaleString("tr-TR")} HP</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* TAKTİK İPUCU */}
        <div style={{ padding: "12px 15px", borderRadius: 12, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.35)", fontSize: 13, lineHeight: 1.5 }}>
          💡 <strong>Savaş İpucu:</strong> Hedefin yanında <strong>Silahlı İnşaatçı Kulübesi</strong> varsa, önce Deprem atıp kulübeyi oyalamadan Yıldırımları hızlıca üst üste bırak; yoksa inşaatçı tamir ettiği için 1 ekstra Yıldırım gerekebilir.
        </div>
      </section>

      {/* HIZLI REFERANS TABLOSU (TÜM MAX SAVUNMALAR) */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 19, fontWeight: 900 }}>
          📋 Mevcut Büyülerine Göre Hızlı Tablo (En Yüksek Seviye Savunmalar)
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cizgi)", textAlign: "left", fontSize: 12.5, opacity: 0.72 }}>
                <th style={{ padding: "10px 8px" }}>Savunma (Max)</th>
                <th style={{ padding: "10px 8px" }}>Can (HP)</th>
                <th style={{ padding: "10px 8px" }}>Sadece Yıldırım</th>
                <th style={{ padding: "10px 8px" }}>1 Deprem + Yıldırım</th>
                <th style={{ padding: "10px 8px" }}>En İyi Seçenek</th>
              </tr>
            </thead>
            <tbody>
              {SAVUNMALAR.map((sav) => {
                const maxSv = sav.seviyeler[sav.seviyeler.length - 1];
                const komb = kombinasyonHesapla(maxSv.hp, yildirimHasar, depremOran, devOkHasar);
                const enIyi = komb.find((k) => k.enIyiMi) ?? komb[0];
                return (
                  <tr key={sav.id} style={{ borderBottom: "1px solid var(--cizgi)", fontSize: 14 }}>
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                      {sav.ikon} {sav.ad} (Sv. {maxSv.sv})
                    </td>
                    <td style={{ padding: "10px 8px", opacity: 0.85 }}>{maxSv.hp.toLocaleString("tr-TR")}</td>
                    <td style={{ padding: "10px 8px" }}>{komb[0].yildirimAdet}⚡ ({komb[0].toplamAlan} yer)</td>
                    <td style={{ padding: "10px 8px" }}>{komb[1].yildirimAdet}⚡ + 1🌍 ({komb[1].toplamAlan} yer)</td>
                    <td style={{ padding: "10px 8px", fontWeight: 900, color: "#22c55e" }}>
                      {enIyi.yildirimAdet === 0 && enIyi.depremAdet === 0
                        ? "🏹 Dev Ok"
                        : `${enIyi.yildirimAdet}⚡${enIyi.depremAdet > 0 ? ` + ${enIyi.depremAdet}🌍` : ""} (${enIyi.toplamAlan} yer)`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
"use client";
import { useState } from "react";

type MadalyaUrun = {
  id: string;
  ad: string;
  ikon: string;
  maliyet: number;
  aciklama: string;
  tasDegeri: number;
  tur: "insaat" | "lab" | "kahraman" | "diger";
};

const MAGAZA_URUNLERI: MadalyaUrun[] = [
  { id: "insaatci-iksir", ad: "İnşaatçı İksiri", ikon: "🧪", maliyet: 30, aciklama: "1 saat boyunca 10x hız (inşaatçı başı +9 saat)", tasDegeri: 10, tur: "insaat" },
  { id: "arastirma-iksir", ad: "Araştırma İksiri", ikon: "🔬", maliyet: 20, aciklama: "1 saat boyunca 24x lab hızı (+23 saat)", tasDegeri: 10, tur: "lab" },
  { id: "insaat-cekici", ad: "İnşaat Çekici", ikon: "🔨", maliyet: 120, aciklama: "1 bina yükseltmesini anında & ücretsiz bitirir", tasDegeri: 100, tur: "insaat" },
  { id: "savas-cekici", ad: "Savaş Çekici", ikon: "⚔️", maliyet: 120, aciklama: "1 birlik yükseltmesini anında & ücretsiz bitirir", tasDegeri: 100, tur: "lab" },
  { id: "buyu-cekici", ad: "Büyü Çekici", ikon: "⚡", maliyet: 120, aciklama: "1 büyü yükseltmesini anında & ücretsiz bitirir", tasDegeri: 100, tur: "lab" },
  { id: "kahraman-cekici", ad: "Kahraman Çekici", ikon: "👑", maliyet: 165, aciklama: "1 kahraman/hayvan seviyesini anında & ücretsiz basar", tasDegeri: 100, tur: "kahraman" },
  { id: "kaynak-iksir", ad: "Kaynak İksiri", ikon: "💰", maliyet: 10, aciklama: "En ucuz Taş çevirme yöntemi (10 madalya = 10 Taş)", tasDegeri: 10, tur: "diger" },
  { id: "duvar-yuzugu", ad: "Duvar Yüzüğü (x5)", ikon: "🧱", maliyet: 50, aciklama: "5 adet duvar yüzüğü (satarsan 25 Taş)", tasDegeri: 25, tur: "diger" },
];

const TAS_SATIS_REHBERI = [
  { esya: "Kaynak / Eğitim / Saat Kulesi İksiri", tas: 10, tavsiye: "Kullanmıyorsan sat", renk: "#22c55e" },
  { esya: "Engel Küreği", tas: 50, tavsiye: "Dekorasyon kasmıyorsan sat (50 Taş!)", renk: "#22c55e" },
  { esya: "Duvar Yüzüğü (1 adet)", tas: 5, tavsiye: "Yüksek BB'de kullan, düşükte sat", renk: "#f59e0b" },
  { esya: "İnşaatçı / Araştırma İksiri", tas: 10, tavsiye: "Asla satma, değerinin çok altında", renk: "#ef6b5f" },
  { esya: "Kahraman / İnşaat Kitabı", tas: 50, tavsiye: "Asla satma, sadece depo dolunca sat", renk: "#ef6b5f" },
  { esya: "Altın / İksir / Kara İksir Rünü", tas: 50, tavsiye: "Depo doluyken acil değilse kullan", renk: "#f59e0b" },
];

function saatFormat(toplamSaat: number) {
  const gun = Math.floor(toplamSaat / 24);
  const saat = Math.round(toplamSaat % 24);
  if (gun === 0) return `${saat} saat`;
  if (saat === 0) return `${gun} gün`;
  return `${gun} gün ${saat} saat`;
}

export default function MadalyaOptimizatoruSayfasi() {
  const [insaatciSayisi, setInsaatciSayisi] = useState(6);
  const [binaSuresiGun, setBinaSuresiGun] = useState(11);
  const [labSuresiGun, setLabSuresiGun] = useState(8);
  const [altinBilet, setAltinBilet] = useState(0); // 0, 10, 15, 20
  const [madalya, setMadalya] = useState(350);

  const [sepet, setSepet] = useState<Record<string, number>>({});

  // Altın bilet indirimli gerçek süreler
  const gercekBinaGun = Number((binaSuresiGun * (1 - altinBilet / 100)).toFixed(2));
  const gercekLabGun = Number((labSuresiGun * (1 - altinBilet / 100)).toFixed(2));

  // 120 madalya = 4 İnşaatçı İksiri = 4 * (insaatci * 9 saat)
  const dortIksirSaat = 4 * insaatciSayisi * 9;
  const binaKirilimGun = Number((dortIksirSaat / 24).toFixed(2));
  const binaCekicKarli = gercekBinaGun >= binaKirilimGun;

  // 120 madalya = 6 Araştırma İksiri = 6 * 23 saat = 138 saat = 5.75 gün
  const altiLabIksirSaat = 6 * 23;
  const labKirilimGun = Number((altiLabIksirSaat / 24).toFixed(2));
  const labCekicKarli = gercekLabGun >= labKirilimGun;

  // Sepet hesaplamaları
  const harcananMadalya = MAGAZA_URUNLERI.reduce((t, u) => t + (sepet[u.id] ?? 0) * u.maliyet, 0);
  const kalanMadalya = madalya - harcananMadalya;

  const sepetSaatKazanci = MAGAZA_URUNLERI.reduce((t, u) => {
    const adet = sepet[u.id] ?? 0;
    if (adet === 0) return t;
    if (u.id === "insaatci-iksir") return t + adet * insaatciSayisi * 9;
    if (u.id === "arastirma-iksir") return t + adet * 23;
    if (u.id === "insaat-cekici") return t + adet * gercekBinaGun * 24;
    if (u.id === "savas-cekici" || u.id === "buyu-cekici") return t + adet * gercekLabGun * 24;
    if (u.id === "kahraman-cekici") return t + adet * 7 * 24;
    return t;
  }, 0);

  const sepetTasDegeri = MAGAZA_URUNLERI.reduce((t, u) => t + (sepet[u.id] ?? 0) * u.tasDegeri, 0);

  function adetDegistir(id: string, fark: number) {
    setSepet((eski) => {
      const yeni = Math.max(0, (eski[id] ?? 0) + fark);
      return { ...eski, [id]: yeni };
    });
  }

  function otomatikDoldur(hedef: "insaat" | "lab" | "tas") {
    const yeni: Record<string, number> = {};
    let bakiye = madalya;

    if (hedef === "tas") {
      yeni["kaynak-iksir"] = Math.floor(bakiye / 10);
    } else if (hedef === "insaat") {
      if (binaCekicKarli) {
        const cekic = Math.floor(bakiye / 120);
        yeni["insaat-cekici"] = cekic;
        bakiye -= cekic * 120;
      }
      yeni["insaatci-iksir"] = Math.floor(bakiye / 30);
    } else if (hedef === "lab") {
      if (labCekicKarli) {
        const cekic = Math.floor(bakiye / 120);
        yeni["savas-cekici"] = cekic;
        bakiye -= cekic * 120;
      }
      yeni["arastirma-iksir"] = Math.floor(bakiye / 20);
    }
    setSepet(yeni);
  }

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1320, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ÜST BAŞLIK & KÖY AYARLARI */}
      <section style={{ padding: "24px 28px", background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>
          💎 Sihirli Eşya & CWL Madalya Optimizatörü
        </h1>
        <p style={{ margin: "0 0 20px", opacity: 0.78, fontSize: 15 }}>
          Çekiç mi yoksa İksir mi daha fazla süre kazandırır? Köyünün ayarlarını gir, CWL madalyalarını boşa harcama.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>🔨 İnşaatçı Sayısı</span>
            <select
              value={insaatciSayisi}
              onChange={(e) => setInsaatciSayisi(Number(e.target.value))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontSize: 15, fontWeight: 800 }}
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} İnşaatçı</option>
              ))}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>🏗️ Ortalama Bina Süresi (Gün)</span>
            <input
              type="number"
              min={1}
              max={25}
              step={0.5}
              value={binaSuresiGun}
              onChange={(e) => setBinaSuresiGun(Math.max(1, Number(e.target.value)))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontSize: 15, fontWeight: 800 }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>🔬 Ortalama Lab Süresi (Gün)</span>
            <input
              type="number"
              min={1}
              max={25}
              step={0.5}
              value={labSuresiGun}
              onChange={(e) => setLabSuresiGun(Math.max(1, Number(e.target.value)))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontSize: 15, fontWeight: 800 }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 700 }}>
            <span>🎫 Altın Bilet İndirimi</span>
            <select
              value={altinBilet}
              onChange={(e) => setAltinBilet(Number(e.target.value))}
              style={{ padding: "11px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontSize: 15, fontWeight: 800 }}
            >
              <option value={0}>Yok (%0)</option>
              <option value={10}>%10 İndirim</option>
              <option value={15}>%15 İndirim</option>
              <option value={20}>%20 İndirim (Maks)</option>
            </select>
          </label>
        </div>
      </section>

      {/* 1. BÖLÜM: ÇEKİÇ VS İKSİR KARAR KARTLARI */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        {/* BİNA KARARI */}
        <div
          style={{
            padding: 22,
            borderRadius: 16,
            background: "var(--kart)",
            border: "1.5px solid " + (binaCekicKarli ? "#22c55e" : "var(--vurgu)"),
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 17 }}>🏗️ Bina Yükseltmesi (120 Madalya)</strong>
            <span
              style={{
                padding: "5px 11px",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 900,
                background: binaCekicKarli ? "rgba(34, 197, 94, 0.18)" : "rgba(56, 189, 248, 0.18)",
                color: binaCekicKarli ? "#22c55e" : "var(--vurgu)",
              }}
            >
              {binaCekicKarli ? "🔨 İNŞAAT ÇEKİCİ AL" : "🧪 İNŞAATÇI İKSİRİ AL"}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.55 }}>
            {insaatciSayisi} inşaatçıyla 4 adet İnşaatçı İksiri toplam <strong>{binaKirilimGun} gün</strong> kazandırır.
            Senin indirimli yükseltme süren <strong>{gercekBinaGun} gün</strong> olduğu için{" "}
            <strong style={{ color: binaCekicKarli ? "#22c55e" : "var(--vurgu)" }}>
              {binaCekicKarli
                ? "İnşaat Çekici hem daha fazla süre hem de ganimet tasarrufu sağlar."
                : "İnşaatçı İksiri toplamda daha fazla inşaatçı süresi kazandırır."}
            </strong>
          </p>

          <div style={{ fontSize: 12.5, opacity: 0.72, padding: "8px 12px", borderRadius: 10, background: "var(--bg)" }}>
            📌 Kırılım eşiği ({insaatciSayisi} inşaatçı): <strong>{binaKirilimGun} gün</strong> üzeri → Çekiç · Altı → İksir
          </div>
        </div>

        {/* LABORATUVAR KARARI */}
        <div
          style={{
            padding: 22,
            borderRadius: 16,
            background: "var(--kart)",
            border: "1.5px solid " + (labCekicKarli ? "#22c55e" : "var(--vurgu)"),
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 17 }}>🔬 Laboratuvar (120 Madalya)</strong>
            <span
              style={{
                padding: "5px 11px",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 900,
                background: labCekicKarli ? "rgba(34, 197, 94, 0.18)" : "rgba(56, 189, 248, 0.18)",
                color: labCekicKarli ? "#22c55e" : "var(--vurgu)",
              }}
            >
              {labCekicKarli ? "⚔️ SAVAŞ/BÜYÜ ÇEKİCİ AL" : "🔬 ARAŞTIRMA İKSİRİ AL"}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.55 }}>
            120 madalyaya alınan 6 adet Araştırma İksiri toplam <strong>{labKirilimGun} gün</strong> (138 saat) kazandırır.
            İndirimli lab süren <strong>{gercekLabGun} gün</strong> olduğu için{" "}
            <strong style={{ color: labCekicKarli ? "#22c55e" : "var(--vurgu)" }}>
              {labCekicKarli
                ? "Savaş/Büyü Çekici hem daha kârlı hem de kara iksir/iksir masrafını sıfırlar."
                : "Araştırma İksiri şu an için daha fazla toplam süre kazandırır."}
            </strong>
          </p>

          <div style={{ fontSize: 12.5, opacity: 0.72, padding: "8px 12px", borderRadius: 10, background: "var(--bg)" }}>
            📌 Kırılım eşiği: <strong>5.75 gün</strong> üzeri → Çekiç · Altı → Araştırma İksiri
          </div>
        </div>
      </section>

      {/* 2. BÖLÜM: CWL MADALYA SEPETİ PLANLAYICI */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>🛒 CWL Madalya Sepeti</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.72 }}>
              Elindeki madalyayı yaz, tek tıkla en kârlı sepeti oluştur veya kendin seç.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 800 }}>
              <span>🏅 Madalyan:</span>
              <input
                type="number"
                min={0}
                max={2500}
                step={10}
                value={madalya}
                onChange={(e) => setMadalya(Math.max(0, Math.min(2500, Number(e.target.value))))}
                style={{ width: 92, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--vurgu)", background: "var(--bg)", color: "var(--fg)", fontWeight: 900, fontSize: 15 }}
              />
            </label>

            <button type="button" onClick={() => otomatikDoldur("insaat")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              ⚡ En İyi Bina
            </button>
            <button type="button" onClick={() => otomatikDoldur("lab")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              ⚡ En İyi Lab
            </button>
            <button type="button" onClick={() => otomatikDoldur("tas")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              💎 Maks Taş
            </button>
            <button type="button" onClick={() => setSepet({})} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef6b5f", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              Sıfırla
            </button>
          </div>
        </div>

        {/* SEPET ÖZET ŞERİDİ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Kalan Madalya</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: kalanMadalya < 0 ? "#ef6b5f" : "var(--vurgu)", marginTop: 3 }}>
              🏅 {kalanMadalya} / {madalya}
            </div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Toplam Kazanılan Süre</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e", marginTop: 3 }}>
              ⏱️ {saatFormat(sepetSaatKazanci)}
            </div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Satarsan Taş (Gem) Değeri</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", marginTop: 3 }}>
              💎 {sepetTasDegeri} Taş
            </div>
          </div>
        </div>

        {/* ÜRÜN KARTLARI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {MAGAZA_URUNLERI.map((u) => {
            const adet = sepet[u.id] ?? 0;
            return (
              <div
                key={u.id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "var(--bg)",
                  border: "1px solid " + (adet > 0 ? "var(--vurgu)" : "var(--cizgi)"),
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 15 }}>{u.ikon} {u.ad}</strong>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: "var(--vurgu)" }}>🏅 {u.maliyet}</span>
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: 12.5, opacity: 0.75, lineHeight: 1.4 }}>{u.aciklama}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: "1px solid var(--cizgi)" }}>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>Toplam: 🏅 {adet * u.maliyet}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => adetDegistir(u.id, -1)}
                      style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "var(--fg)", fontWeight: 900, cursor: "pointer" }}
                    >
                      −
                    </button>
                    <strong style={{ minWidth: 20, textAlign: "center" }}>{adet}</strong>
                    <button
                      type="button"
                      onClick={() => adetDegistir(u.id, 1)}
                      style={{ width: 30, height: 30, borderRadius: 8, border: 0, background: "var(--vurgu)", color: "var(--vurgu-yazi)", fontWeight: 900, cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. BÖLÜM: HANGİ SİHİRLİ EŞYA TAŞA ÇEVRİLİR? */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 19, fontWeight: 900 }}>💎 Sihirli Eşya → Taş (Gem) Satış Rehberi</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {TAS_SATIS_REHBERI.map((s) => (
            <div key={s.esya} style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{s.esya}</div>
                <div style={{ fontSize: 12, color: s.renk, fontWeight: 700, marginTop: 2 }}>{s.tavsiye}</div>
              </div>
              <span style={{ padding: "4px 9px", borderRadius: 8, background: "var(--kart)", border: "1px solid var(--cizgi)", fontSize: 12.5, fontWeight: 900, flexShrink: 0 }}>
                💎 {s.tas}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
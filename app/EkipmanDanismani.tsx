"use client";
import { useState } from "react";
import { tr } from "./isimler";

type EkipmanParca = {
  isim: string;
  seviye: number;
  azami: number;
};

type MetaBilgi = {
  sinif: "S" | "A" | "B" | "C";
  kahraman: string;
  neden: string;
};

const META_LISTE: Record<string, MetaBilgi> = {
  // S-TİER (Önce bunları bas)
  "Eternal Tome": { sinif: "S", kahraman: "Büyük Koruyucu", neden: "Her ordunun omurgası; dokunulmazlık süresi hayati." },
  "Healing Tome": { sinif: "S", kahraman: "Büyük Koruyucu", neden: "Sürekli can yenileme ile 3 yıldız garantisi." },
  "Electro Boots": { sinif: "S", kahraman: "Kraliyet Şampiyonu", neden: "RC yürüyüşlerinin ve güncel metanın kralı." },
  "Spiky Ball": { sinif: "S", kahraman: "Barbar Kral", neden: "Tek tuşla 7–8 savunmayı temizleyen yüksek patlayıcı hasar." },
  "Earthquake Boots": { sinif: "S", kahraman: "Barbar Kral", neden: "Duvarları açar, Spiky Ball ile yıkıcı kombo yapar." },
  "Fireball": { sinif: "S", kahraman: "Büyük Koruyucu", neden: "Merkez savunmaları tek seferde silen turnuva silahı." },
  "Magic Mirror": { sinif: "S", kahraman: "Okçu Kraliçe", neden: "Klonlarla anlık DPS patlaması ve hedef dağıtma." },
  "Action Figure": { sinif: "S", kahraman: "Okçu Kraliçe", neden: "Devasa tanklama ve kraliçe ömrünü ciddi uzatma." },
  "Healer Puppet": { sinif: "S", kahraman: "Okçu Kraliçe", neden: "Kraliçe yürüyüşü olmadan bile ücretsiz şifacı desteği." },
  "Haste Vial": { sinif: "S", kahraman: "Kraliyet Şampiyonu", neden: "Kısa sürede çok sayıda savunma eriten hız patlaması." },
  "Dark Orb": { sinif: "S", kahraman: "Minyon Prensi", neden: "Geniş alanda savunmaları dondurup yavaşlatan temel güç." },

  // A-TİER (Güçlü meta seçenekleri)
  "Rocket Spear": { sinif: "A", kahraman: "Kraliyet Şampiyonu", neden: "Uzun menzilden kritik savunmaları güvenle düşürür." },
  "Giant Gauntlet": { sinif: "A", kahraman: "Barbar Kral", neden: "Hasar azaltma + alan hasarı ile sağlam yer tanklığı." },
  "Giant Arrow": { sinif: "A", kahraman: "Okçu Kraliçe", neden: "Hava savunmalarını ve süpürücüleri harita boyu temizler." },
  "Rage Gem": { sinif: "A", kahraman: "Büyük Koruyucu", neden: "Hava ve spam ordularında pasif yüksek hasar çarpanı." },
  "Frozen Arrow": { sinif: "A", kahraman: "Okçu Kraliçe", neden: "Kraliçe yürüyüşlerinde tekil savunmaları yavaşlatır." },
  "Invisibility Vial": { sinif: "A", kahraman: "Okçu Kraliçe", neden: "Acil kaçış ve yüksek anlık hasar desteği." },
  "Seeking Shield": { sinif: "A", kahraman: "Kraliyet Şampiyonu", neden: "Düşük canlı savunmaları tek tuşla bitirir." },
  "Hog Rider Puppet": { sinif: "A", kahraman: "Kraliyet Şampiyonu", neden: "RC'ye görünmezlik ve tanklayacak biniciler verir." },
  "Rage Vial": { sinif: "A", kahraman: "Barbar Kral", neden: "Hızlı temizlik ve yüksek tekil hasar." },
  "Snake Bracelet": { sinif: "A", kahraman: "Barbar Kral", neden: "Kenar temizliği ve ekstra hedef dağıtma için güçlü." },
  "Henchmen Puppet": { sinif: "A", kahraman: "Minyon Prensi", neden: "Hava saldırılarında ekstra hasar ve koruma." },
  "Metal Pants": { sinif: "A", kahraman: "Minyon Prensi", neden: "Hava savunmalarına karşı yüksek dayanıklılık." },
  "Dark Crown": { sinif: "A", kahraman: "Minyon Prensi", neden: "Uzayan savaşlarda giderek güçlenen pasif statlar." },

  // B-TİER (Duruma göre)
  "Life Gem": { sinif: "B", kahraman: "Büyük Koruyucu", neden: "Düşük canlı birliklerde (Binici/Madenci) işe yarar." },
  "Vampstache": { sinif: "B", kahraman: "Barbar Kral", neden: "Dış halka temizliğinde kralı hayatta tutar." },
  "Royal Gem": { sinif: "B", kahraman: "Kraliyet Şampiyonu", neden: "Diğer RC ekipmanları varken ikinci planda kalır." },

  // C-TİER (Cevher harcamadan önce bekle)
  "Barbarian Puppet": { sinif: "C", kahraman: "Barbar Kral", neden: "Üst belediyelerde alan hasarına anında erir; cevherini sakla." },
  "Archer Puppet": { sinif: "C", kahraman: "Okçu Kraliçe", neden: "Magic Mirror / Healer Puppet varken öncelik verme." },
  "Lavaloon Puppet": { sinif: "C", kahraman: "Büyük Koruyucu", neden: "Yıldızlı Cevher maliyeti yüksek, etki alanı dar." },
};

// Seviye başına yükseltme maliyeti (index = hedef seviye, 2..27)
const PARLAK_MALIYET = [
  0, 0,
  120, 240, 400, 600, 840, 1120, 1440, 1800, 1900,
  2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700,
  2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600,
];

const PARILTILI_MALIYET: Record<number, number> = {
  3: 20, 6: 100, 9: 200, 12: 400, 15: 600, 18: 600, 21: 600, 24: 600, 27: 600,
};

const YILDIZLI_MALIYET: Record<number, number> = {
  9: 10, 12: 20, 15: 30, 18: 50, 21: 100, 24: 120, 27: 150,
};

function cevherHesapla(mevcut: number, hedef: number, destansiMi: boolean) {
  let parlak = 0;
  let pariltili = 0;
  let yildizli = 0;
  for (let sv = mevcut + 1; sv <= hedef; sv++) {
    parlak += PARLAK_MALIYET[sv] ?? 0;
    pariltili += PARILTILI_MALIYET[sv] ?? 0;
    if (destansiMi) {
      yildizli += YILDIZLI_MALIYET[sv] ?? 0;
    }
  }
  return { parlak, pariltili, yildizli };
}

function sonrakiKirilim(seviye: number, azami: number): number {
  const kirilim = Math.ceil((seviye + 1) / 3) * 3;
  return Math.min(azami, kirilim);
}

const SINIF_PUAN: Record<MetaBilgi["sinif"], number> = { S: 4, A: 3, B: 2, C: 1 };
const SINIF_RENK: Record<MetaBilgi["sinif"], { yazi: string; arkaplan: string }> = {
  S: { yazi: "#f59e0b", arkaplan: "rgba(245, 158, 11, 0.16)" },
  A: { yazi: "#38bdf8", arkaplan: "rgba(56, 189, 248, 0.16)" },
  B: { yazi: "#a78bfa", arkaplan: "rgba(167, 139, 250, 0.16)" },
  C: { yazi: "#ef6b5f", arkaplan: "rgba(239, 68, 68, 0.15)" },
};

export default function EkipmanDanismani({ ekipmanlar }: { ekipmanlar: EkipmanParca[] }) {
  const [sadeceMeta, setSadeceMeta] = useState(true);
  const [tumuAcik, setTumuAcik] = useState(false);

  const eksikler = ekipmanlar
    .filter((e) => e.seviye < e.azami)
    .map((e) => {
      const destansiMi = e.azami > 18;
      const meta: MetaBilgi = META_LISTE[e.isim] ?? {
        sinif: destansiMi ? "B" : "B",
        kahraman: destansiMi ? "Destansı Ekipman" : "Standart Ekipman",
        neden: destansiMi
          ? "Destansı ekipman; Yıldızlı Cevherini önce S/A sınıfı ana ekipmanlara ayır."
          : "İhtiyacına göre 3'lü kırılım seviyelerine kadar yükseltebilirsin.",
      };
      const hedef = sonrakiKirilim(e.seviye, e.azami);
      const kirilimMaliyet = cevherHesapla(e.seviye, hedef, destansiMi);
      const maxMaliyet = cevherHesapla(e.seviye, e.azami, destansiMi);
      return { ...e, destansiMi, meta, hedef, kirilimMaliyet, maxMaliyet };
    });

  const oncelikliler = eksikler
    .filter((e) => e.meta.sinif !== "C")
    .sort((a, b) => {
      const sinifFark = SINIF_PUAN[b.meta.sinif] - SINIF_PUAN[a.meta.sinif];
      if (sinifFark !== 0) return sinifFark;
      // Kırılıma en yakın ve yüksek seviye olanı öne al
      return (a.hedef - a.seviye) - (b.hedef - b.seviye) || b.seviye - a.seviye;
    });

  const bekletilecekler = eksikler.filter((e) => e.meta.sinif === "C");

  // Toplam kalan cevher bilançosu
  const bilancoListesi = sadeceMeta
    ? eksikler.filter((e) => e.meta.sinif === "S" || e.meta.sinif === "A")
    : eksikler;

  const toplamCevher = bilancoListesi.reduce(
    (acc, e) => ({
      parlak: acc.parlak + e.maxMaliyet.parlak,
      pariltili: acc.pariltili + e.maxMaliyet.pariltili,
      yildizli: acc.yildizli + e.maxMaliyet.yildizli,
    }),
    { parlak: 0, pariltili: 0, yildizli: 0 }
  );

  const gosterilenOncelik = tumuAcik ? oncelikliler : oncelikliler.slice(0, 6);

  if (ekipmanlar.length === 0) return null;

  return (
    <section
      style={{
        padding: 24,
        background: "var(--kart)",
        border: "1px solid var(--cizgi)",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* ÜST BAŞLIK & FİLTRE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
            <span>🧠 Akıllı Ekipman & Cevher Danışmanı</span>
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.72 }}>
            Mevcut seviyelerine göre cevherlerini en verimli harcayacağın yükseltme sırası.
          </p>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSadeceMeta(true)}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "1px solid " + (sadeceMeta ? "var(--vurgu)" : "var(--cizgi)"),
              background: sadeceMeta ? "var(--vurgu)" : "var(--bg)",
              color: sadeceMeta ? "#111" : "var(--fg)",
              fontSize: 12.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🔥 Sadece Meta (S/A)
          </button>
          <button
            type="button"
            onClick={() => setSadeceMeta(false)}
            style={{
              padding: "7px 12px",
              borderRadius: 10,
              border: "1px solid " + (!sadeceMeta ? "var(--vurgu)" : "var(--cizgi)"),
              background: !sadeceMeta ? "var(--vurgu)" : "var(--bg)",
              color: !sadeceMeta ? "#111" : "var(--fg)",
              fontSize: 12.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📦 Tüm Ekipmanlar ({eksikler.length})
          </button>
        </div>
      </div>

      {eksikler.length === 0 ? (
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            background: "rgba(34, 197, 94, 0.12)",
            border: "1px solid rgba(34, 197, 94, 0.45)",
            color: "#22c55e",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          🎉 Tebrikler! Köyündeki tüm ekipmanlar maksimum seviyede.
        </div>
      ) : (
        <>
          {/* TOPLAM KALAN CEVHER BİLANÇOSU */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 10 }}>
            <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.72 }}>💎 Kalan Parlak Cevher</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", marginTop: 3 }}>
                {toplamCevher.parlak.toLocaleString("tr-TR")}
              </div>
            </div>
            <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.72 }}>🟣 Kalan Parıltılı Cevher</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#c084fc", marginTop: 3 }}>
                {toplamCevher.pariltili.toLocaleString("tr-TR")}
              </div>
            </div>
            <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.72 }}>⭐ Kalan Yıldızlı Cevher</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", marginTop: 3 }}>
                {toplamCevher.yildizli.toLocaleString("tr-TR")}
              </div>
            </div>
          </div>

          {/* ÖNCELİKLİ BASILACAKLAR KARTLARI */}
          {gosterilenOncelik.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <strong style={{ fontSize: 14.5 }}>
                🎯 Öncelikli Yükseltme Önerileri ({oncelikliler.length} ekipman)
              </strong>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
                {gosterilenOncelik.map((e, idx) => {
                  const renk = SINIF_RENK[e.meta.sinif];
                  return (
                    <div
                      key={e.isim}
                      style={{
                        padding: 15,
                        borderRadius: 14,
                        background: "var(--bg)",
                        border: "1px solid " + (idx < 2 ? "var(--vurgu)" : "var(--cizgi)"),
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 900 }}>
                            {idx + 1}. {tr(e.isim)}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                            {e.meta.kahraman} · {e.destansiMi ? "Destansı" : "Standart"}
                          </div>
                        </div>

                        <span
                          style={{
                            padding: "4px 9px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 900,
                            background: renk.arkaplan,
                            color: renk.yazi,
                            flexShrink: 0,
                          }}
                        >
                          {e.meta.sinif}-Tier
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: 13, opacity: 0.84, lineHeight: 1.45 }}>
                        {e.meta.neden}
                      </p>

                      <div
                        style={{
                          padding: "9px 11px",
                          borderRadius: 10,
                          background: "var(--kart)",
                          border: "1px solid var(--cizgi)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 800 }}>
                          <span>Sonraki Kırılım Hedefi</span>
                          <span style={{ color: "var(--vurgu)" }}>
                            Sv. {e.seviye} → {e.hedef} {e.hedef === e.azami ? "(MAX)" : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>
                          <span>💎 {e.kirilimMaliyet.parlak.toLocaleString("tr-TR")}</span>
                          {e.kirilimMaliyet.pariltili > 0 && (
                            <span>🟣 {e.kirilimMaliyet.pariltili.toLocaleString("tr-TR")}</span>
                          )}
                          {e.kirilimMaliyet.yildizli > 0 && (
                            <span style={{ color: "#f59e0b" }}>⭐ {e.kirilimMaliyet.yildizli}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {oncelikliler.length > 6 && (
                <button
                  type="button"
                  onClick={() => setTumuAcik((v) => !v)}
                  style={{
                    alignSelf: "center",
                    padding: "8px 18px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {tumuAcik ? "Daha Az Göster ▲" : `Tümünü Göster (${oncelikliler.length}) ▼`}
                </button>
              )}
            </div>
          )}

          {/* BEKLETİLECEKLER (CEVHER İSRAFI UYARISI) */}
          {bekletilecekler.length > 0 && (
            <div
              style={{
                padding: "13px 16px",
                borderRadius: 13,
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <strong style={{ fontSize: 13.5, color: "#ef6b5f" }}>
                ⏸️ Şimdilik Bekletebileceklerin (Cevherini Ana Ekipmanlara Sakla)
              </strong>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {bekletilecekler.map((b) => (
                  <span
                    key={b.isim}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 9,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    {tr(b.isim)} ({b.seviye}/{b.azami})
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
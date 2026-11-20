"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ligTr } from "../isimler";

const ALFABE = "0289PYLQGRJCUV";
const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type OyuncuOzet = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  lig?: string | null;
};

type BbTarih = {
  th: number;
  yil: number;
  etiket: string;
};

const BB_TARIHCESI: BbTarih[] = [
  { th: 9, yil: 2012, etiket: "2012" },
  { th: 10, yil: 2013, etiket: "2013" },
  { th: 11, yil: 2015, etiket: "2015" },
  { th: 12, yil: 2018, etiket: "2018" },
  { th: 13, yil: 2019, etiket: "2019" },
  { th: 14, yil: 2021, etiket: "2021" },
  { th: 15, yil: 2022, etiket: "2022" },
  { th: 16, yil: 2023, etiket: "2023" },
  { th: 17, yil: 2024, etiket: "2024" },
  { th: 18, yil: 2025, etiket: "2025" },
  { th: 19, yil: 2026, etiket: "2026" },
];

type YasSonuc = {
  baslangicYil: number;
  aralik: string;
  yaklasikYil: number;
  yuzdelik: number;
  rozet: string;
  rozetAciklama: string;
  oZamankiMaksBb: number;
};

const YIL_ESIKLERI: { maksLow: number; yil: number; aralik: string; yuzdelik: number; maksBb: number }[] = [
  { maksLow: 150_000, yil: 2012, aralik: "2012–2013", yuzdelik: 99, maksBb: 9 },
  { maksLow: 550_000, yil: 2013, aralik: "2013–2014", yuzdelik: 97, maksBb: 10 },
  { maksLow: 2_000_000, yil: 2014, aralik: "2014–2015", yuzdelik: 93, maksBb: 10 },
  { maksLow: 5_000_000, yil: 2015, aralik: "2015–2016", yuzdelik: 88, maksBb: 11 },
  { maksLow: 10_000_000, yil: 2016, aralik: "2016–2017", yuzdelik: 81, maksBb: 11 },
  { maksLow: 17_000_000, yil: 2017, aralik: "2017–2018", yuzdelik: 73, maksBb: 11 },
  { maksLow: 26_000_000, yil: 2018, aralik: "2018–2019", yuzdelik: 64, maksBb: 12 },
  { maksLow: 38_000_000, yil: 2019, aralik: "2019–2020", yuzdelik: 55, maksBb: 13 },
  { maksLow: 52_000_000, yil: 2020, aralik: "2020–2021", yuzdelik: 46, maksBb: 13 },
  { maksLow: 70_000_000, yil: 2021, aralik: "2021–2022", yuzdelik: 37, maksBb: 14 },
  { maksLow: 90_000_000, yil: 2022, aralik: "2022–2023", yuzdelik: 28, maksBb: 15 },
  { maksLow: 115_000_000, yil: 2023, aralik: "2023–2024", yuzdelik: 19, maksBb: 16 },
  { maksLow: 145_000_000, yil: 2024, aralik: "2024–2025", yuzdelik: 11, maksBb: 17 },
  { maksLow: 180_000_000, yil: 2025, aralik: "2025–2026", yuzdelik: 5, maksBb: 18 },
];

function koddanYasTahmin(temizKod: string): YasSonuc {
  let deger = BigInt(0);
  for (const ch of temizKod) {
    const idx = ALFABE.indexOf(ch);
    if (idx === -1) continue;
    deger = deger * BigInt(14) + BigInt(idx);
  }
  const low = Number(deger / BigInt(256));
  const buYil = new Date().getFullYear();

  const eslesen = YIL_ESIKLERI.find((e) => low <= e.maksLow) ?? {
    maksLow: Infinity,
    yil: 2026,
    aralik: "2026",
    yuzdelik: 2,
    maksBb: 19,
  };

  const yaklasikYil = Math.max(1, buYil - eslesen.yil);

  let rozet = "⚡ Yeni Nesil Savaşçı";
  let rozetAciklama = "Modern meta ve ekipman çağında oyuna adım attın.";
  if (eslesen.yil <= 2013) {
    rozet = "🏛️ Kurucu Efsane";
    rozetAciklama = "Clash of Clans'ın ilk yıllarından kalma gerçek bir tarih!";
  } else if (eslesen.yil <= 2016) {
    rozet = "🔥 Eski Kurt";
    rozetAciklama = "Klan Savaşları'nın ve global sohbetin altın çağını gördün.";
  } else if (eslesen.yil <= 2019) {
    rozet = "⚔️ Kıdemli Komutan";
    rozetAciklama = "Kuşatma makineleri ve CWL döneminden beri sahadasın.";
  } else if (eslesen.yil <= 2022) {
    rozet = "🛡️ Deneyimli Şef";
    rozetAciklama = "Hayvanlar ve yeni nesil savunmalarla büyüdün.";
  }

  return {
    baslangicYil: eslesen.yil,
    aralik: eslesen.aralik,
    yaklasikYil,
    yuzdelik: eslesen.yuzdelik,
    rozet,
    rozetAciklama,
    oZamankiMaksBb: eslesen.maksBb,
  };
}

export default function KoyYasiSayfasi() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oyuncu, setOyuncu] = useState<OyuncuOzet | null>(null);
  const [yas, setYas] = useState<YasSonuc | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  async function sorgula(hamKod: string) {
    const temiz = hamKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setOyuncu(null);
    setYas(null);
    setKopyalandi(false);

    if (!KOD_KURALI.test(temiz)) {
      setHata("Geçersiz köy kodu. Örnek: #LGJP280J2");
      return;
    }

    setHata("");
    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/oyuncu?kod=" + temiz);
      const veri = await yanit.json();
      if (!yanit.ok) {
        setHata(veri.hata ?? "Oyuncu bulunamadı.");
      } else {
        setOyuncu(veri);
        setYas(koddanYasTahmin(temiz));
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }

  function formGonder(e: FormEvent) {
    e.preventDefault();
    sorgula(kod);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKod = params.get("kod");
    if (urlKod) {
      setKod("#" + urlKod.replace(/^#/, "").toUpperCase());
      sorgula(urlKod);
    }
  }, []);

  async function paylas() {
    if (!oyuncu || !yas) return;
    const metin = `⏳ ${oyuncu.isim} (${oyuncu.kod}) köyü tahmini ${yas.aralik} döneminden beri Clash of Clans'ta! (Yaklaşık ${yas.yaklasikYil} yıl · Oyuncuların %${yas.yuzdelik}'inden daha eski · ${yas.rozet}) — Sargyt Clashers`;
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2500);
    } catch {}
  }

  const tanikOlunanBbSayisi = yas
    ? BB_TARIHCESI.filter((b) => b.yil >= yas.baslangicYil).length
    : 0;

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1120, width: "100%", margin: "0 auto" }}>
      {/* ÜST ARAMA */}
      <section
        style={{
          padding: "24px 28px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>⏳ Köy Yaşı & Tarihi</h1>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 9,
              background: "rgba(245, 197, 66, 0.16)",
              border: "1px solid var(--vurgu)",
              color: "var(--vurgu)",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Beta
          </span>
        </div>
        <p style={{ opacity: 0.78, margin: "0 0 18px", fontSize: 15 }}>
          Köy kodundan hesabının tahmini kuruluş yılını, kıdem yüzdeliğini ve oyuna başladığından beri gördüğün Belediye Binası dönemlerini keşfet.
        </p>

        <form onSubmit={formGonder} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="Köy kodu girin, örn: #LGJP280J2"
            maxLength={14}
            style={{
              flex: 1,
              minWidth: 220,
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 16,
            }}
          />
          <button
            disabled={yukleniyor}
            style={{
              padding: "13px 26px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "var(--vurgu-yazi)",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "Hesaplanıyor..." : "⏳ Yaşını Hesapla"}
          </button>
        </form>

        {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}
      </section>

      {/* SONUÇ KARTI */}
      {oyuncu && yas && (
        <section
          style={{
            padding: "28px 28px 32px",
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* KART ÜST BİLGİ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <img
                src={`/birimler/th${oyuncu.thSeviyesi}.png`}
                alt={`BB ${oyuncu.thSeviyesi}`}
                width={58}
                height={58}
                style={{ objectFit: "contain" }}
              />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{oyuncu.isim}</div>
                <div style={{ fontSize: 13.5, opacity: 0.78, fontWeight: 600 }}>
                  {oyuncu.kod} · Belediye {oyuncu.thSeviyesi}
                  {oyuncu.klan ? ` · ${oyuncu.klan}` : ""}
                  {oyuncu.lig ? ` · ${ligTr(oyuncu.lig)}` : ""}
                </div>
              </div>
            </div>

            <span
              style={{
                padding: "7px 14px",
                borderRadius: 11,
                background: "var(--bg)",
                border: "1px solid var(--vurgu)",
                color: "var(--vurgu)",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {yas.rozet}
            </span>
          </div>

          {/* ANA YIL GÖSTERGESİ */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, opacity: 0.72, fontWeight: 600 }}>Tahmini başlangıç dönemi</span>
            <div style={{ fontSize: "clamp(46px, 8vw, 76px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-1px" }}>
              {yas.aralik}
            </div>
            <div style={{ fontSize: 16, opacity: 0.82, fontWeight: 600 }}>
              Oyunda yaklaşık <strong style={{ color: "var(--vurgu)" }}>{yas.yaklasikYil} yıl</strong> · {yas.rozetAciklama}
            </div>

            {/* YÜZDELİK ÇUBUĞU */}
            <div style={{ width: "min(520px, 100%)", marginTop: 12 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 8 }}>
                Oyuncuların <span style={{ color: "var(--vurgu)" }}>%{yas.yuzdelik}&apos;inden</span> daha eski bir hesap
              </div>
              <div style={{ height: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", borderRadius: 12, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: yas.yuzdelik + "%",
                    background: "var(--vurgu)",
                    borderRadius: 12,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            {/* AKSİYON BUTONLARI */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
              <button
                type="button"
                onClick={paylas}
                style={{
                  padding: "11px 22px",
                  borderRadius: 12,
                  border: 0,
                  background: "var(--vurgu)",
                  color: "var(--vurgu-yazi)",
                  fontSize: 14.5,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {kopyalandi ? "✓ Metin Kopyalandı!" : "📤 Yaşımı Paylaş"}
              </button>

              <Link
                href={"/?kod=" + oyuncu.kod.replace(/^#/, "")}
                style={{
                  padding: "11px 20px",
                  borderRadius: 12,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                🔍 Köy Analizine Git ↗
              </Link>
            </div>
          </div>

          {/* KISA NOSTALJİ İSTATİSTİKLERİ */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Sen Başladığında Maksimum</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: "var(--vurgu)", marginTop: 4 }}>
                Belediye Binası {yas.oZamankiMaksBb}
              </div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Tanıklık Ettiğin BB Çağları</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: "var(--vurgu)", marginTop: 4 }}>
                {tanikOlunanBbSayisi} Büyük Güncelleme
              </div>
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 14, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Güncel Seviyen</div>
              <div style={{ fontSize: 19, fontWeight: 900, color: "#22c55e", marginTop: 4 }}>
                Belediye {oyuncu.thSeviyesi} · 🏆 {oyuncu.kupa}
              </div>
            </div>
          </div>

          {/* BELEDİYE BİNASI ZAMAN ÇİZELGESİ */}
          <div style={{ borderTop: "1px solid var(--cizgi)", paddingTop: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 800, opacity: 0.85, marginBottom: 16, textAlign: "center" }}>
              🏰 Başlangıcından Bugüne Clash of Clans Belediye Binası Tarihçesi
            </div>

            <div style={{ overflowX: "auto", paddingBottom: 8 }}>
              <div
                style={{
                  minWidth: 760,
                  display: "grid",
                  gridTemplateColumns: `repeat(${BB_TARIHCESI.length}, 1fr)`,
                  gap: 8,
                  alignItems: "end",
                }}
              >
                {BB_TARIHCESI.map((b) => {
                  const gordu = b.yil >= yas.baslangicYil;
                  const baslangicNoktasi = b.yil === yas.baslangicYil;
                  return (
                    <div
                      key={b.th}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        opacity: gordu ? 1 : 0.25,
                      }}
                    >
                      <img
                        src={`/birimler/th${b.th}.png`}
                        alt={`BB ${b.th}`}
                        width={48}
                        height={48}
                        style={{
                          objectFit: "contain",
                          filter: gordu ? "none" : "grayscale(100%)",
                        }}
                      />
                      <div
                        style={{
                          width: "100%",
                          height: 6,
                          borderRadius: 6,
                          background: gordu ? "var(--vurgu)" : "var(--cizgi)",
                          position: "relative",
                        }}
                      >
                        {baslangicNoktasi && (
                          <span
                            title="Tahmini başlangıç dönemin"
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              transform: "translate(-50%, -50%)",
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: "#fff",
                              border: "3px solid var(--vurgu)",
                            }}
                          />
                        )}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: baslangicNoktasi ? 900 : 600, color: baslangicNoktasi ? "var(--vurgu)" : "inherit" }}>
                        {b.etiket}
                      </span>
                      <span style={{ fontSize: 11, opacity: 0.7 }}>BB {b.th}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p style={{ margin: "12px 0 0", fontSize: 12, opacity: 0.6, textAlign: "center" }}>
              * Tahmin, Supercell&apos;in oyuncu kodu sıralama algoritmasına dayanır; kesin hesap açılış tarihini resmi API paylaşmadığı için ±1 yıl sapma olabilir.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
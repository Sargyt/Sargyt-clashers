"use client";
import { useState } from "react";

// Clash of Clans güncel resmi 1 adet duvar yükseltme maliyetleri (Seviye 1 -> 18)
const DUVAR_MALIYETLERI: Record<number, number> = {
  2: 1000,
  3: 5000,
  4: 10000,
  5: 25000,
  6: 50000,
  7: 75000,
  8: 100000,
  9: 200000,
  10: 300000,
  11: 500000,
  12: 1000000,
  13: 1500000,
  14: 2000000,
  15: 3000000,
  16: 5000000,
  17: 8000000,
  18: 9000000,
};

// Resmi Kahraman Ekipmanı Cevher Maliyet Tablosu (Seviye 2'den 27'ye kadar)
const EKIPMAN_MALIYETLERI: Record<number, { parlak: number; pariltili: number; yildizli: number }> = {
  2: { parlak: 120, pariltili: 0, yildizli: 0 },
  3: { parlak: 240, pariltili: 20, yildizli: 0 },
  4: { parlak: 400, pariltili: 0, yildizli: 0 },
  5: { parlak: 600, pariltili: 0, yildizli: 0 },
  6: { parlak: 840, pariltili: 100, yildizli: 0 },
  7: { parlak: 1120, pariltili: 0, yildizli: 0 },
  8: { parlak: 1440, pariltili: 0, yildizli: 0 },
  9: { parlak: 1800, pariltili: 200, yildizli: 10 },
  10: { parlak: 1900, pariltili: 0, yildizli: 0 },
  11: { parlak: 2000, pariltili: 0, yildizli: 0 },
  12: { parlak: 2100, pariltili: 400, yildizli: 20 },
  13: { parlak: 2200, pariltili: 0, yildizli: 0 },
  14: { parlak: 2300, pariltili: 0, yildizli: 0 },
  15: { parlak: 2400, pariltili: 600, yildizli: 30 },
  16: { parlak: 2500, pariltili: 0, yildizli: 0 },
  17: { parlak: 2600, pariltili: 0, yildizli: 0 },
  18: { parlak: 2700, pariltili: 600, yildizli: 50 },
  19: { parlak: 2800, pariltili: 0, yildizli: 0 },
  20: { parlak: 2900, pariltili: 0, yildizli: 0 },
  21: { parlak: 3000, pariltili: 600, yildizli: 100 },
  22: { parlak: 3100, pariltili: 0, yildizli: 0 },
  23: { parlak: 3200, pariltili: 0, yildizli: 0 },
  24: { parlak: 3300, pariltili: 600, yildizli: 120 },
  25: { parlak: 3400, pariltili: 0, yildizli: 0 },
  26: { parlak: 3500, pariltili: 0, yildizli: 0 },
  27: { parlak: 3600, pariltili: 600, yildizli: 150 },
};

type BbPlan = {
  hedefBb: number;
  bbAltin: number;
  bbGun: number;
  zorunluYeniBinalar: string[];
  oncelikliYukseltmeler: {
    ad: string;
    kaynak: "Altın" | "İksir" | "Kara İksir";
    maliyet: number;
    gun: number;
  }[];
};

const BB_PLANLARI: Record<number, BbPlan> = {
  11: {
    hedefBb: 11,
    bbAltin: 3000000,
    bbGun: 3,
    zorunluYeniBinalar: ["Kartal Topu", "Büyük Koruyucu", "Kasırga Tuzağı", "1x X-Yayı", "1x Büyücü Kulesi"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 9)", kaynak: "İksir", maliyet: 2500000, gun: 2.5 },
      { ad: "Klan Kalesi (Sv. 7)", kaynak: "Altın", maliyet: 3500000, gun: 3 },
      { ad: "4x Ordu Kampı (Sv. 9)", kaynak: "İksir", maliyet: 10000000, gun: 12 },
      { ad: "Kartal Topu Kurulumu & Sv. 2", kaynak: "Altın", maliyet: 6500000, gun: 5 },
      { ad: "Büyük Koruyucu (Sv. 1 -> 10)", kaynak: "İksir", maliyet: 18000000, gun: 14 },
    ],
  },
  12: {
    hedefBb: 12,
    bbAltin: 4500000,
    bbGun: 4,
    zorunluYeniBinalar: ["Atölye (Kuşatma Makineleri)", "3. Cehennem Kulesi", "1x Gizli Tesla", "1x Yaylı Tuzak"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 10)", kaynak: "İksir", maliyet: 3600000, gun: 3 },
      { ad: "Klan Kalesi (Sv. 8)", kaynak: "Altın", maliyet: 5500000, gun: 4 },
      { ad: "Atölye Kurulumu (Sv. 1 -> 3)", kaynak: "İksir", maliyet: 8200000, gun: 6.5 },
      { ad: "4x Ordu Kampı (Sv. 10)", kaynak: "İksir", maliyet: 16000000, gun: 16 },
      { ad: "3. Cehennem Kulesi & Giga Tesla", kaynak: "Altın", maliyet: 19000000, gun: 15 },
    ],
  },
  13: {
    hedefBb: 13,
    bbAltin: 6500000,
    bbGun: 5,
    zorunluYeniBinalar: ["Kraliyet Şampiyonu", "2x Kaya Saçar", "1x Hava Bombası", "1x Güdümlü Hava Mayını"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 11)", kaynak: "İksir", maliyet: 5000000, gun: 4 },
      { ad: "Klan Kalesi (Sv. 9)", kaynak: "Altın", maliyet: 7500000, gun: 5 },
      { ad: "2x Kaya Saçar Kurulumu", kaynak: "Altın", maliyet: 14000000, gun: 10 },
      { ad: "4x Ordu Kampı (Sv. 11)", kaynak: "İksir", maliyet: 24000000, gun: 20 },
      { ad: "Kraliyet Şampiyonu (Sv. 1 -> 15)", kaynak: "Kara İksir", maliyet: 1450000, gun: 24 },
    ],
  },
  14: {
    hedefBb: 14,
    bbAltin: 8500000,
    bbGun: 6,
    zorunluYeniBinalar: ["Hayvan Barınağı (Pet House)", "25x Ekstra Duvar", "1x Güdümlü Hava Mayını", "1x İskelet Tuzağı"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 12)", kaynak: "İksir", maliyet: 6800000, gun: 5 },
      { ad: "Klan Kalesi (Sv. 10)", kaynak: "Altın", maliyet: 9500000, gun: 6 },
      { ad: "Hayvan Barınağı (Sv. 1 -> 4)", kaynak: "İksir", maliyet: 22000000, gun: 16 },
      { ad: "Kartal Topu & Kaya Saçar Maks.", kaynak: "Altın", maliyet: 26000000, gun: 22 },
      { ad: "Kahramanlar (+5 Seviye)", kaynak: "Kara İksir", maliyet: 2400000, gun: 30 },
    ],
  },
  15: {
    hedefBb: 15,
    bbAltin: 11000000,
    bbGun: 7,
    zorunluYeniBinalar: ["Monolit", "2x Büyü Kulesi", "4 Yeni Kahraman Hayvanı (Diggy/Phoenix)"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 13)", kaynak: "İksir", maliyet: 8500000, gun: 6 },
      { ad: "Klan Kalesi (Sv. 11)", kaynak: "Altın", maliyet: 12000000, gun: 7 },
      { ad: "Monolit Kurulumu & Sv. 2", kaynak: "Kara İksir", maliyet: 480000, gun: 12 },
      { ad: "2x Büyü Kulesi (Görünmezlik/Öfke)", kaynak: "Altın", maliyet: 16000000, gun: 14 },
      { ad: "4x Ordu Kampı (Sv. 12)", kaynak: "İksir", maliyet: 36000000, gun: 28 },
    ],
  },
  16: {
    hedefBb: 16,
    bbAltin: 14000000,
    bbGun: 8,
    zorunluYeniBinalar: ["Ruh Tilkisi (Spirit Fox)", "Çoklu Okçu Kulesi Birleşimi", "Seken Top Birleşimi"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 14)", kaynak: "İksir", maliyet: 11000000, gun: 7 },
      { ad: "Klan Kalesi (Sv. 12)", kaynak: "Altın", maliyet: 15000000, gun: 8 },
      { ad: "2x Çoklu Okçu Kulesi & 2x Seken Top", kaynak: "Altın", maliyet: 44000000, gun: 32 },
      { ad: "Hayvan Barınağı (Sv. 9 - Spirit Fox)", kaynak: "İksir", maliyet: 14500000, gun: 9 },
      { ad: "Demirci (Blacksmith) Maks.", kaynak: "İksir", maliyet: 12000000, gun: 8 },
    ],
  },
  17: {
    hedefBb: 17,
    bbAltin: 18000000,
    bbGun: 10,
    zorunluYeniBinalar: ["Ateş Tüküren (Firespitter)", "Cehennem Topçusu (BB Silahı)", "Giga Bomba"],
    oncelikliYukseltmeler: [
      { ad: "Laboratuvar (Sv. 15)", kaynak: "İksir", maliyet: 14500000, gun: 9 },
      { ad: "Klan Kalesi (Sv. 13)", kaynak: "Altın", maliyet: 18500000, gun: 10 },
      { ad: "2x Ateş Tüküren Kurulumu & Sv. 2", kaynak: "Altın", maliyet: 48000000, gun: 34 },
      { ad: "4x Ordu Kampı (Sv. 13)", kaynak: "İksir", maliyet: 52000000, gun: 36 },
      { ad: "Kahraman Salonu (Hero Hall) Maks.", kaynak: "İksir", maliyet: 16000000, gun: 11 },
    ],
  },
};

function sureyiTasaCevir(toplamSaniye: number): number {
  if (toplamSaniye <= 0) return 0;
  if (toplamSaniye <= 60) return 1;
  if (toplamSaniye <= 3600) {
    return Math.round(1 + ((toplamSaniye - 60) / 3540) * 19);
  }
  if (toplamSaniye <= 86400) {
    return Math.round(20 + ((toplamSaniye - 3600) / 82800) * 240);
  }
  return Math.round(260 + ((toplamSaniye - 86400) / 86400) * 123);
}

function sayiFormatla(sayi: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.round(sayi));
}

function dakikaMetni(toplamDakika: number): string {
  const d = Math.max(0, Math.round(toplamDakika));
  const gun = Math.floor(d / 1440);
  const saat = Math.floor((d % 1440) / 60);
  const dk = d % 60;
  const parcalar: string[] = [];
  if (gun > 0) parcalar.push(`${gun} gün`);
  if (saat > 0) parcalar.push(`${saat} saat`);
  if (dk > 0 || parcalar.length === 0) parcalar.push(`${dk} dk`);
  return parcalar.join(" ");
}

type AracId = "duvar" | "cevher" | "tas" | "sure" | "bbPlan";

const ARAC_KARTLARI: {
  id: AracId;
  ikon: string;
  baslik: string;
  aciklama: string;
  etiket: string;
}[] = [
  {
    id: "duvar",
    ikon: "🧱",
    baslik: "Duvar & Altın Bilet Hesaplayıcı",
    aciklama: "Seviye 1'den 18'e kadar toplu duvar yükseltme maliyetini ve Altın Bilet %20 indirim kazancını hesapla.",
    etiket: "Kaynak & İndirim",
  },
  {
    id: "cevher",
    ikon: "🛡️",
    baslik: "Ekipman Cevher (Ore) Hesaplayıcı",
    aciklama: "Sıradan (Sv. 18) ve Destansı (Sv. 27) ekipmanlar için gereken Parlak, Parıltılı ve Yıldızlı Cevheri gör.",
    etiket: "Demirci & Ekipman",
  },
  {
    id: "tas",
    ikon: "💎",
    baslik: "Taş (Gem) Süre Hesaplayıcı",
    aciklama: "Kalan inşaat veya laboratuvar yükseltmesini anında tamamlamak için gereken Yeşil Taş miktarını öğren.",
    etiket: "Anında Bitirme",
  },
  {
    id: "sure",
    ikon: "⏱️",
    baslik: "Süre & İnşaatçı İksiri Hesaplayıcı",
    aciklama: "Altın Bilet süre indirimi ve İnşaatçı İksiri hızlandırmasıyla inşaatın gerçek bitiş saatini hesapla.",
    etiket: "Zaman Yönetimi",
  },
  {
    id: "bbPlan",
    ikon: "🏰",
    baslik: "Belediye Binası Yükseltme Planlayıcı",
    aciklama: "Yeni Belediye Binasına geçerken zorunlu binaları, toplam kaynak ihtiyacını ve inşaatçı takvimini planla.",
    etiket: "Gelişim Yol Haritası",
  },
];

export default function HesaplayiciSayfasi() {
  const [seciliArac, setSeciliArac] = useState<AracId>("duvar");

  // 1. Duvar Hesaplayıcı State'leri
  const [mevcutSeviye, setMevcutSeviye] = useState(14);
  const [hedefSeviye, setHedefSeviye] = useState(16);
  const [duvarAdedi, setDuvarAdedi] = useState(100);
  const [indirimOrani, setIndirimOrani] = useState(20);

  // 2. Taş (Gem) Hesaplayıcı State'leri
  const [gun, setGun] = useState(3);
  const [saat, setSaat] = useState(12);
  const [dakika, setDakika] = useState(0);

  // 3. Süre İndirimi & İnşaatçı İksiri Hesaplayıcı State'leri
  const [insaatGun, setInsaatGun] = useState(10);
  const [insaatSaat, setInsaatSaat] = useState(0);
  const [sureIndirimi, setSureIndirimi] = useState(20);
  const [iksirAdedi, setIksirAdedi] = useState(0);

  // 4. Kahraman Ekipmanı Cevher Hesaplayıcı State'leri
  const [ekipmanTuru, setEkipmanTuru] = useState<"siradan" | "destansi">("destansi");
  const [ekipmanMevcut, setEkipmanMevcut] = useState(1);
  const [ekipmanHedef, setEkipmanHedef] = useState(18);

  // 5. Belediye Binası Planlayıcı State'leri
  const [seciliHedefBb, setSeciliHedefBb] = useState(17);
  const [insaatciSayisi, setInsaatciSayisi] = useState(6);
  const [planBiletIndirimi, setPlanBiletIndirimi] = useState(20);

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

  // Süre İndirimi & İksir Hesaplama
  const hamDakika = Math.max(0, insaatGun) * 1440 + Math.max(0, insaatSaat) * 60;
  const biletSonrasiDakika = hamDakika * (1 - sureIndirimi / 100);
  const iksirKazanciDakika = Math.max(0, iksirAdedi) * 9 * 60;
  const netKalanDakika = Math.max(0, biletSonrasiDakika - iksirKazanciDakika);

  // Cevher Hesaplama
  const maksEkipmanSeviyesi = ekipmanTuru === "siradan" ? 18 : 27;
  let toplamParlak = 0;
  let toplamPariltili = 0;
  let toplamYildizli = 0;
  for (let s = ekipmanMevcut + 1; s <= ekipmanHedef; s++) {
    const adim = EKIPMAN_MALIYETLERI[s];
    if (adim) {
      toplamParlak += adim.parlak;
      toplamPariltili += adim.pariltili;
      if (ekipmanTuru === "destansi") {
        toplamYildizli += adim.yildizli;
      }
    }
  }

  // BB Planlayıcı Hesaplamaları
  const aktifBbPlan = BB_PLANLARI[seciliHedefBb] ?? BB_PLANLARI[17];
  const carpan = 1 - planBiletIndirimi / 100;

  const toplamAltin =
    (aktifBbPlan.bbAltin +
      aktifBbPlan.oncelikliYukseltmeler
        .filter((y) => y.kaynak === "Altın")
        .reduce((t, y) => t + y.maliyet, 0)) *
    carpan;

  const toplamIksir =
    aktifBbPlan.oncelikliYukseltmeler
      .filter((y) => y.kaynak === "İksir")
      .reduce((t, y) => t + y.maliyet, 0) * carpan;

  const toplamKaraIksir =
    aktifBbPlan.oncelikliYukseltmeler
      .filter((y) => y.kaynak === "Kara İksir")
      .reduce((t, y) => t + y.maliyet, 0) * carpan;

  const toplamInsaatciGunu =
    (aktifBbPlan.bbGun +
      aktifBbPlan.oncelikliYukseltmeler.reduce((t, y) => t + y.gun, 0)) *
    carpan;

  const gercekTakvimGunu = Math.ceil(toplamInsaatciGunu / Math.max(1, insaatciSayisi));

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px" }}>🧮 Köy Hesaplayıcıları</h1>
      <p style={{ opacity: 0.75, marginTop: 0, marginBottom: 26, fontSize: 16 }}>
        Kullanmak istediğin hesaplama aracını aşağıdaki kartlardan seç; detaylı hesaplama ekranı hemen altında açılsın.
      </p>

      {/* 2x2 BÜYÜK DİKDÖRTGEN BUTON KARTLARI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {ARAC_KARTLARI.map((arac) => {
          const aktif = seciliArac === arac.id;
          return (
            <button
              key={arac.id}
              type="button"
              onClick={() => setSeciliArac(arac.id)}
              style={{
                textAlign: "left",
                padding: "22px 24px",
                borderRadius: 16,
                border: aktif ? "2px solid var(--vurgu)" : "1px solid var(--cizgi)",
                background: aktif
                  ? "linear-gradient(135deg, rgba(245, 197, 66, 0.16), var(--kart))"
                  : "var(--kart)",
                color: "var(--fg)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 18,
                transition: "all 0.15s ease",
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 14,
                  background: aktif ? "var(--vurgu)" : "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                {arac.ikon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <strong style={{ fontSize: 19, color: aktif ? "var(--vurgu)" : "var(--fg)" }}>
                    {arac.baslik}
                  </strong>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 6,
                      background: aktif ? "var(--vurgu)" : "var(--bg)",
                      color: aktif ? "#111" : "var(--fg)",
                      border: "1px solid var(--cizgi)",
                    }}
                  >
                    {aktif ? "✓ SEÇİLİ" : arac.etiket}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.78, lineHeight: 1.45 }}>
                  {arac.aciklama}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* SEÇİLİ HESAPLAYICI PANELİ */}
      <div style={{ maxWidth: seciliArac === "bbPlan" ? "100%" : 760, margin: "0 auto" }}>
        {/* 1. DUVAR & ALTIN BİLET HESAPLAYICI */}
        {seciliArac === "duvar" && (
          <section
            style={{
              padding: 28,
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>🧱 Duvar & Altın Bilet Maliyeti</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
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
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                >
                  {Object.keys(DUVAR_MALIYETLERI).map((s) => (
                    <option key={s} value={Number(s) - 1}>
                      Seviye {Number(s) - 1}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Hedef Duvar Seviyesi
                <select
                  value={hedefSeviye}
                  onChange={(e) => setHedefSeviye(Number(e.target.value))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
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

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Duvar Adedi (Maks. 325)
              <input
                type="number"
                min={1}
                max={325}
                value={duvarAdedi}
                onChange={(e) => setDuvarAdedi(Math.min(325, Math.max(0, Number(e.target.value))))}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 15,
                }}
              />
            </label>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🎫 Altın Bilet İnşaat İndirimi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[0, 10, 15, 20].map((oran) => (
                  <button
                    key={oran}
                    type="button"
                    onClick={() => setIndirimOrani(oran)}
                    style={{
                      padding: "10px 0",
                      borderRadius: 10,
                      border: indirimOrani === oran ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                      background: indirimOrani === oran ? "var(--vurgu)" : "var(--bg)",
                      color: indirimOrani === oran ? "#111" : "var(--fg)",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {oran === 0 ? "%0" : `%${oran}`}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, opacity: 0.78 }}>
                <span>İndirimsiz Toplam Maliyet:</span>
                <span>{sayiFormatla(toplamHamMaliyet)}</span>
              </div>
              {indirimOrani > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#22c55e", fontWeight: 700 }}>
                  <span>Altın Bilet Tasarrufu:</span>
                  <span>-{sayiFormatla(indirimMiktari)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 20,
                  fontWeight: 900,
                  borderTop: "1px solid var(--cizgi)",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span>Ödenecek Net Kaynak:</span>
                <span style={{ color: "var(--vurgu)" }}>{sayiFormatla(odenecekNetMaliyet)}</span>
              </div>
            </div>
          </section>
        )}

        {/* 2. KAHRAMAN EKİPMANI CEVHER (ORE) HESAPLAYICI */}
        {seciliArac === "cevher" && (
          <section
            style={{
              padding: 28,
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>🛡️ Ekipman Cevher (Ore) Hesaplayıcı</h2>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Ekipman Nadirliği</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setEkipmanTuru("siradan");
                    if (ekipmanMevcut >= 18) setEkipmanMevcut(17);
                    if (ekipmanHedef > 18) setEkipmanHedef(18);
                  }}
                  style={{
                    padding: "11px 0",
                    borderRadius: 10,
                    border: ekipmanTuru === "siradan" ? "1px solid #38bdf8" : "1px solid var(--cizgi)",
                    background: ekipmanTuru === "siradan" ? "#38bdf8" : "var(--bg)",
                    color: ekipmanTuru === "siradan" ? "#111" : "var(--fg)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  🔵 Sıradan (Maks 18)
                </button>
                <button
                  type="button"
                  onClick={() => setEkipmanTuru("destansi")}
                  style={{
                    padding: "11px 0",
                    borderRadius: 10,
                    border: ekipmanTuru === "destansi" ? "1px solid #a855f7" : "1px solid var(--cizgi)",
                    background: ekipmanTuru === "destansi" ? "#a855f7" : "var(--bg)",
                    color: ekipmanTuru === "destansi" ? "#fff" : "var(--fg)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  🟣 Destansı (Maks 27)
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Mevcut Seviye
                <select
                  value={ekipmanMevcut}
                  onChange={(e) => {
                    const yeni = Number(e.target.value);
                    setEkipmanMevcut(yeni);
                    if (ekipmanHedef <= yeni) setEkipmanHedef(Math.min(maksEkipmanSeviyesi, yeni + 1));
                  }}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                >
                  {Array.from({ length: maksEkipmanSeviyesi - 1 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>
                      Seviye {s}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Hedef Seviye
                <select
                  value={ekipmanHedef}
                  onChange={(e) => setEkipmanHedef(Number(e.target.value))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                >
                  {Array.from({ length: maksEkipmanSeviyesi }, (_, i) => i + 1)
                    .filter((s) => s > ekipmanMevcut)
                    .map((s) => (
                      <option key={s} value={s}>
                        Seviye {s}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800 }}>
                <span style={{ color: "#38bdf8" }}>🔵 Parlak Cevher:</span>
                <span>{sayiFormatla(toplamParlak)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800 }}>
                <span style={{ color: "#c084fc" }}>🟣 Parıltılı Cevher:</span>
                <span>{sayiFormatla(toplamPariltili)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800 }}>
                <span style={{ color: "#facc15" }}>⭐ Yıldızlı Cevher:</span>
                <span>{ekipmanTuru === "siradan" ? "0 (Sıradan ekipmanda gerekmez)" : sayiFormatla(toplamYildizli)}</span>
              </div>
            </div>
          </section>
        )}

        {/* 3. TAŞ (GEM) HESAPLAYICI */}
        {seciliArac === "tas" && (
          <section
            style={{
              padding: 28,
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>💎 Taş (Gem) Süre Hesaplayıcı</h2>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.78 }}>
              Kalan inşaat veya araştırma süresini gir, anında bitirmek için gereken Yeşil Taşı gör.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Gün
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={gun}
                  onChange={(e) => setGun(Math.max(0, Number(e.target.value)))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Saat
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={saat}
                  onChange={(e) => setSaat(Math.min(23, Math.max(0, Number(e.target.value))))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Dakika
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={dakika}
                  onChange={(e) => setDakika(Math.min(59, Math.max(0, Number(e.target.value))))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                />
              </label>
            </div>

            <div
              style={{
                padding: 22,
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 14, opacity: 0.78 }}>Anında Bitirme Maliyeti</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#22c55e", marginTop: 6 }}>
                💎 {sayiFormatla(gerekenTas)} Taş
              </div>
              <div style={{ fontSize: 13, opacity: 0.68, marginTop: 6 }}>
                {gun} gün {saat} saat {dakika} dakika için
              </div>
            </div>
          </section>
        )}

        {/* 4. SÜRE & İNŞAATÇI İKSİRİ HESAPLAYICI */}
        {seciliArac === "sure" && (
          <section
            style={{
              padding: 28,
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22 }}>⏱️ Süre İndirimi & İnşaatçı İksiri Hesaplayıcı</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Normal Gün
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={insaatGun}
                  onChange={(e) => setInsaatGun(Math.max(0, Number(e.target.value)))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Normal Saat
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={insaatSaat}
                  onChange={(e) => setInsaatSaat(Math.min(23, Math.max(0, Number(e.target.value))))}
                  style={{
                    width: "100%",
                    marginTop: 6,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 15,
                  }}
                />
              </label>
            </div>

            <label style={{ fontSize: 14, fontWeight: 600 }}>
              Kullanılacak İnşaatçı İksiri (Adet)
              <input
                type="number"
                min={0}
                max={20}
                value={iksirAdedi}
                onChange={(e) => setIksirAdedi(Math.min(20, Math.max(0, Number(e.target.value))))}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 15,
                }}
              />
            </label>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🎫 Altın Bilet Süre İndirimi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[0, 10, 15, 20].map((oran) => (
                  <button
                    key={oran}
                    type="button"
                    onClick={() => setSureIndirimi(oran)}
                    style={{
                      padding: "10px 0",
                      borderRadius: 10,
                      border: sureIndirimi === oran ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                      background: sureIndirimi === oran ? "var(--vurgu)" : "var(--bg)",
                      color: sureIndirimi === oran ? "#111" : "var(--fg)",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {oran === 0 ? "%0" : `%${oran}`}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, opacity: 0.78 }}>
                <span>Altın Bilet Sonrası Süre:</span>
                <span>{dakikaMetni(biletSonrasiDakika)}</span>
              </div>
              {iksirAdedi > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#22c55e", fontWeight: 700 }}>
                  <span>{iksirAdedi}x İnşaatçı İksiri Kazancı:</span>
                  <span>-{iksirAdedi * 9} saat</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 20,
                  fontWeight: 900,
                  borderTop: "1px solid var(--cizgi)",
                  paddingTop: 10,
                  marginTop: 4,
                }}
              >
                <span>Gerçek Bitiş Süresi:</span>
                <span style={{ color: "var(--vurgu)" }}>{dakikaMetni(netKalanDakika)}</span>
              </div>
            </div>
          </section>
        )}

        {/* 5. BELEDİYE BİNASI YÜKSELTME PLANLAYICI */}
        {seciliArac === "bbPlan" && (
          <section
            style={{
              padding: 28,
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 23, fontWeight: 900 }}>
                  🏰 Belediye Binası Yükseltme Planlayıcı & Maliyet/Süre Takvimi
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.78 }}>
                  Geçmek istediğin Belediye Binası seviyesini ve inşaatçı sayını seç; zorunlu yeni binaları ve ilk faz takvimini gör.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>
                  Hedef Belediye
                  <select
                    value={seciliHedefBb}
                    onChange={(e) => setSeciliHedefBb(Number(e.target.value))}
                    style={{
                      display: "block",
                      marginTop: 4,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--vurgu)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontWeight: 700,
                    }}
                  >
                    {[11, 12, 13, 14, 15, 16, 17].map((bb) => (
                      <option key={bb} value={bb}>
                        BB {bb - 1} → BB {bb}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ fontSize: 13, fontWeight: 700 }}>
                  İnşaatçı Sayısı
                  <select
                    value={insaatciSayisi}
                    onChange={(e) => setInsaatciSayisi(Number(e.target.value))}
                    style={{
                      display: "block",
                      marginTop: 4,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontWeight: 700,
                    }}
                  >
                    {[2, 3, 4, 5, 6].map((adet) => (
                      <option key={adet} value={adet}>
                        👷 {adet} İnşaatçı
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ fontSize: 13, fontWeight: 700 }}>
                  Altın Bilet
                  <select
                    value={planBiletIndirimi}
                    onChange={(e) => setPlanBiletIndirimi(Number(e.target.value))}
                    style={{
                      display: "block",
                      marginTop: 4,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontWeight: 700,
                    }}
                  >
                    {[0, 10, 15, 20].map((oran) => (
                      <option key={oran} value={oran}>
                        %{oran} İndirim
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 12,
              }}
            >
              <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>🪙 Toplam Kritik Altın</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#facc15", marginTop: 4 }}>
                  {sayiFormatla(toplamAltin)}
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>💧 Toplam Kritik İksir</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#e879f9", marginTop: 4 }}>
                  {sayiFormatla(toplamIksir)}
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>🛢️ Toplam Kara İksir</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#94a3b8", marginTop: 4 }}>
                  {sayiFormatla(toplamKaraIksir)}
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--vurgu)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>📅 Tahmini Kritik Faz Süresi</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e", marginTop: 4 }}>
                  ~{gercekTakvimGunu} Gün ({insaatciSayisi} İnşaatçı)
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
              <div style={{ padding: 18, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <strong style={{ fontSize: 16 }}>🆕 BB {seciliHedefBb} ile Açılan Zorunlu / Yeni Binalar</strong>
                <ul style={{ margin: "12px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                  {aktifBbPlan.zorunluYeniBinalar.map((bina) => (
                    <li key={bina}>{bina}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: 18, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <strong style={{ fontSize: 16 }}>⚡ İlk Faz Öncelikli Yükseltme Takvimi</strong>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      paddingBottom: 6,
                      borderBottom: "1px solid var(--cizgi)",
                    }}
                  >
                    <span>🏰 Belediye Binası {seciliHedefBb} İnşaatı</span>
                    <span style={{ fontWeight: 700, color: "var(--vurgu)" }}>
                      {sayiFormatla(aktifBbPlan.bbAltin * carpan)} Altın · {(aktifBbPlan.bbGun * carpan).toFixed(1)} gün
                    </span>
                  </div>
                  {aktifBbPlan.oncelikliYukseltmeler.map((y) => (
                    <div
                      key={y.ad}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        paddingBottom: 6,
                        borderBottom: "1px solid var(--cizgi)",
                      }}
                    >
                      <span>{y.ad}</span>
                      <span style={{ fontWeight: 700, opacity: 0.9 }}>
                        {sayiFormatla(y.maliyet * carpan)} {y.kaynak} · {(y.gun * carpan).toFixed(1)} gün
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
"use client";
import { useState } from "react";

type BolgeRehberi = {
  id: string;
  ad: string;
  ikon: string;
  hedefSaldiri: string;
  zorluk: "Kolay" | "Orta" | "Zor";
  ordu: string;
  buyuler: string;
  taktik: string;
  alternatif: string;
};

type TuccarUrun = {
  id: string;
  ad: string;
  ikon: string;
  maliyet: number;
  haftalikLimit: number;
  tasDegeri: number;
  kategori: "cevher" | "iksir" | "tas" | "kaynak";
  not: string;
};

const BOLGELER: BolgeRehberi[] = [
  {
    id: "zirve",
    ad: "Başkent Zirvesi",
    ikon: "🏔️",
    hedefSaldiri: "2–3 Saldırı",
    zorluk: "Zor",
    ordu: "12–14 Süper Madenci + 2–3 Koçbaşı + 1 Süper Barbar",
    buyuler: "2 Donma Büyüsü + 1 Şifa (veya 1 Mezarlık + 1 Donma)",
    taktik:
      "İlk saldırıda Başkent Salonu ve Dev Arbalet çevresine Donma atarak kenarları temizle, Madencileri tek hattan merkeze sür. İkinci saldırıda kalan çekirdeği Şifa desteğiyle bitir.",
    alternatif: "Golem + Büyücü + Öfke/Hız kombinasyonu (dar koridorlu düzenlerde).",
  },
  {
    id: "barbar",
    ad: "Barbar Kampı",
    ikon: "⚔️",
    hedefSaldiri: "2 Saldırı",
    zorluk: "Kolay",
    ordu: "10 Süper Madenci + 4 Koçbaşı + 2 Okçu",
    buyuler: "2 Donma Büyüsü",
    taktik:
      "Roket Topçularını ve Dev Topları Donma ile kilitleyip Madencileri 2 grup halinde gönder. Açık düzenlerde tek seferde %70+ görülür.",
    alternatif: "Kıvılcım (Sparky) + Dev + Mezarlık (savunmalar birbirine yakınsa).",
  },
  {
    id: "buyucu",
    ad: "Büyücü Vadisi",
    ikon: "🔮",
    hedefSaldiri: "2 Saldırı",
    zorluk: "Orta",
    ordu: "8–10 Süper Madenci + 1 Kıvılcım + 3 Koçbaşı",
    buyuler: "2 Mezarlık Büyüsü + 1 Şifa",
    taktik:
      "Süper Büyücü Kuleleri toplu birlikleri anında eritir; önce Mezarlık ile dikkat dağıtıp Madencileri dağınık bırak veya Kıvılcım ile tek atışta temizle.",
    alternatif: "Süper Ejderha + Öfke (Hava Bombası kuleleri kenardaysa).",
  },
  {
    id: "balon",
    ad: "Balon Lagünü",
    ikon: "🎈",
    hedefSaldiri: "2 Saldırı",
    zorluk: "Kolay",
    ordu: "10 Süper Madenci + 3 Koçbaşı + 2 Minyon",
    buyuler: "1 Donma + 1 Şifa + 1 Yıldırım",
    taktik:
      "Cehennem Kulesi ve Roket Topçusu'nun olduğu tarafa Donma bırak. Hava savunmaları Madencilere vuramadığı için yer ordusu bu bölgede çok rahattır.",
    alternatif: "Roket Balon + İskelet Fıçısı + Hız Büyüsü.",
  },
  {
    id: "atolye",
    ad: "İnşaatçı Atölyesi",
    ikon: "🛠️",
    hedefSaldiri: "2 Saldırı",
    zorluk: "Orta",
    ordu: "1 Kıvılcım (Mega Sparky) + 4 Dev + 4 Koçbaşı + 6 Süper Büyücü",
    buyuler: "2 Mezarlık + 1 Öfke",
    taktik:
      "Patlayıcı Yay (Blast Bow) ve Dev Top aynı hatta ise Mezarlık ile meşgul edip Kıvılcım'ı Dev arkasından yürüt. İkinci saldırıda Madenci ile süpür.",
    alternatif: "Full Süper Madenci + 2 Donma (patlayıcı yayları dondurarak).",
  },
  {
    id: "ejderha",
    ad: "Ejderha Kayalıkları",
    ikon: "🐉",
    hedefSaldiri: "2 Saldırı",
    zorluk: "Zor",
    ordu: "3 Cehennem Ejderhası + 8 Süper Madenci + 4 Koçbaşı",
    buyuler: "2 Mezarlık + 1 Donma (veya Öfke)",
    taktik:
      "Önce Süper Ejderha yuvalarını Koçbaşı ile çekip Cehennem Ejderhası + Öfke ile tek tek indir. Ejderhalar bittikten sonra Madencilerle tüm haritayı sil.",
    alternatif: "Süper Okçu + Mezarlık spam (ejderhaları dışarı çekip eritmek için).",
  },
  {
    id: "golem",
    ad: "Golem Taş Ocağı",
    ikon: "🪨",
    hedefSaldiri: "2–3 Saldırı",
    zorluk: "Zor",
    ordu: "10 Süper Madenci + 3 Koçbaşı + 2 İskelet Fıçısı",
    buyuler: "2 Donma + 1 Sonsuz Hız (Endless Haste)",
    taktik:
      "Patlayıcı Yaylar bu haritanın en büyük tehdidi. Sonsuz Hız büyüsü tüm saldırılarda aktif kaldığı için ilk saldırıda merkeze Hız + Donma bırak, ikinci saldırıda Madenciler uçarak temizlesin.",
    alternatif: "Dağ Golemi + Öfke + Hız (dar blok düzenlerinde).",
  },
  {
    id: "iskelet",
    ad: "İskelet Parkı",
    ikon: "💀",
    hedefSaldiri: "2 Saldırı",
    zorluk: "Orta",
    ordu: "10 Süper Madenci + 4 Koçbaşı + 1 Süper Barbar",
    buyuler: "2 Mezarlık + 1 Şifa",
    taktik:
      "Yansıtıcı (Reflector) ve Minyon Kovanı'nı Mezarlık ile boğ. Dar duvar bölmelerini Koçbaşı ile açıp Madencileri kesintisiz ilerlet.",
    alternatif: "Mezarlık + Domuz Akıncısı (Hog Raiders) dalgası.",
  },
  {
    id: "goblin",
    ad: "Goblin Madenleri",
    ikon: "⛏️",
    hedefSaldiri: "2–3 Saldırı",
    zorluk: "Zor",
    ordu: "9 Süper Madenci + 3 Koçbaşı + 4 Süper Okçu",
    buyuler: "2 Donma + 1 Şifa",
    taktik:
      "Goblin Fırlatıcıları (Goblin Thrower) ve mızraklı goblinleri temizlemek için Donma'yı dar geçitlere at. İlk saldırıda nehir geçişlerini açıp ikinci saldırıda çekirdeği bitir.",
    alternatif: "Kıvılcım + Süper Dev + Şifa (köprü başı savunmalarını tekte indirmek için).",
  },
];

const TUCCAR_URUNLERI: TuccarUrun[] = [
  { id: "yildizli", ad: "Yıldızlı Cevher (x5)", ikon: "⭐", maliyet: 350, haftalikLimit: 2, tasDegeri: 0, kategori: "cevher", not: "En kıt kaynak — her hafta kesinlikle ilk alman gereken ürün" },
  { id: "pariltili", ad: "Parıltılı Cevher (x100)", ikon: "🟣", maliyet: 300, haftalikLimit: 2, tasDegeri: 0, kategori: "cevher", not: "Destansı ve standart kırılımlar için çok yüksek değer" },
  { id: "parlak", ad: "Parlak Cevher (x500)", ikon: "💎", maliyet: 350, haftalikLimit: 2, tasDegeri: 0, kategori: "cevher", not: "Sadece Parlak Cevher eksiğin varsa al" },
  { id: "arastirma", ad: "Araştırma İksiri", ikon: "🔬", maliyet: 200, haftalikLimit: 3, tasDegeri: 10, kategori: "iksir", not: "Haftada 3 gün lab hızı kazandırır — F2P için altın değerinde" },
  { id: "hayvan", ad: "Hayvan İksiri", ikon: "🐾", maliyet: 200, haftalikLimit: 3, tasDegeri: 10, kategori: "iksir", not: "Kahraman hayvanlarını fullemek için en hızlı yol" },
  { id: "egitim", ad: "Eğitim İksiri", ikon: "⚡", maliyet: 100, haftalikLimit: 3, tasDegeri: 10, kategori: "tas", not: "Taş kasmak için en iyi oran: 100 madalya → 10 Taş" },
  { id: "saat-kulesi", ad: "Saat Kulesi İksiri", ikon: "⏱️", maliyet: 100, haftalikLimit: 3, tasDegeri: 10, kategori: "tas", not: "İnşaatçı Üssü bittiyse direkt 10 Taşa satılır" },
  { id: "duvar-yuzuk", ad: "Duvar Yüzüğü (x5)", ikon: "🧱", maliyet: 300, haftalikLimit: 3, tasDegeri: 25, kategori: "tas", not: "Satarsan 25 Taş (300 madalya için 3x 100'lük iksirden az verir)" },
  { id: "altin-iksir", ad: "2.5M Altın / İksir", ikon: "🪙", maliyet: 300, haftalikLimit: 1, tasDegeri: 0, kategori: "kaynak", not: "Çok acil değilse alma; saldırıyla 10 dakikada kasılır" },
];

const ZORLUK_RENK: Record<BolgeRehberi["zorluk"], { yazi: string; arkaplan: string }> = {
  Kolay: { yazi: "#22c55e", arkaplan: "rgba(34, 197, 94, 0.16)" },
  Orta: { yazi: "#f59e0b", arkaplan: "rgba(245, 158, 11, 0.16)" },
  Zor: { yazi: "#ef6b5f", arkaplan: "rgba(239, 68, 68, 0.16)" },
};

export default function BaskentSayfasi() {
  const [zorlukFiltre, setZorlukFiltre] = useState<"Tümü" | BolgeRehberi["zorluk"]>("Tümü");
  const [seciliBolge, setSeciliBolge] = useState<string>(BOLGELER[0].id);
  const [kopyalandiId, setKopyalandiId] = useState<string | null>(null);

  const [madalya, setMadalya] = useState(1400);
  const [sepet, setSepet] = useState<Record<string, number>>({
    yildizli: 2,
    arastirma: 3,
  });

  const gorunenBolgeler =
    zorlukFiltre === "Tümü" ? BOLGELER : BOLGELER.filter((b) => b.zorluk === zorlukFiltre);

  const aktifBolge =
    gorunenBolgeler.find((b) => b.id === seciliBolge) ?? gorunenBolgeler[0] ?? BOLGELER[0];

  const harcanan = TUCCAR_URUNLERI.reduce((t, u) => t + (sepet[u.id] ?? 0) * u.maliyet, 0);
  const kalan = madalya - harcanan;
  const toplamTas = TUCCAR_URUNLERI.reduce((t, u) => t + (sepet[u.id] ?? 0) * u.tasDegeri, 0);
  const labGunKazanci = sepet["arastirma"] ?? 0;

  function adetDegistir(u: TuccarUrun, fark: number) {
    setSepet((eski) => {
      const mevcut = eski[u.id] ?? 0;
      const yeni = Math.max(0, Math.min(u.haftalikLimit, mevcut + fark));
      return { ...eski, [u.id]: yeni };
    });
  }

  function hazirSepet(mod: "cevher" | "gelisim" | "tas") {
    const yeni: Record<string, number> = {};
    let bakiye = madalya;

    const al = (id: string) => {
      const u = TUCCAR_URUNLERI.find((x) => x.id === id);
      if (!u) return;
      const maksAdet = Math.min(u.haftalikLimit, Math.floor(bakiye / u.maliyet));
      if (maksAdet > 0) {
        yeni[id] = maksAdet;
        bakiye -= maksAdet * u.maliyet;
      }
    };

    if (mod === "cevher") {
      al("yildizli");
      al("pariltili");
      al("arastirma");
      al("egitim");
    } else if (mod === "gelisim") {
      al("arastirma");
      al("yildizli");
      al("hayvan");
      al("pariltili");
    } else if (mod === "tas") {
      al("egitim");
      al("saat-kulesi");
      al("duvar-yuzuk");
    }
    setSepet(yeni);
  }

  async function bolgeKopyala(b: BolgeRehberi) {
    const metin = `🏰 *${b.ad}* (${b.hedefSaldiri})\n⚔️ Ordu: ${b.ordu}\n🧪 Büyüler: ${b.buyuler}\n💡 Taktik: ${b.taktik}\n📋 Sargyt Clashers`;
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandiId(b.id);
      setTimeout(() => setKopyalandiId(null), 2000);
    } catch {}
  }

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1320, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ÜST BAŞLIK */}
      <section style={{ padding: "24px 28px", background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>
          🏰 Klan Başkenti & Baskın Madalyası Merkezi
        </h1>
        <p style={{ margin: 0, opacity: 0.78, fontSize: 15 }}>
          Hafta sonu baskınlarında 9 bölge için 2 saldırı taktikleri ve haftalık Baskın Madalyası tüccar hesaplayıcısı.
        </p>
      </section>

      {/* 1. BÖLÜM: BÖLGE BÖLGE BASKIN REHBERİ */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
            <span>⚔️ Bölge Bölge Baskın Orduları</span>
          </h2>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["Tümü", "Kolay", "Orta", "Zor"] as const).map((z) => {
              const secili = zorlukFiltre === z;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZorlukFiltre(z)}
                  style={{
                    padding: "6px 12px",
                    minHeight: 34,
                    borderRadius: 9,
                    border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                    background: secili ? "var(--vurgu)" : "var(--bg)",
                    color: secili ? "var(--vurgu-yazi)" : "var(--fg)",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </div>

        {/* BÖLGE SEÇİCİ BUTONLAR */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {gorunenBolgeler.map((b) => {
            const secili = b.id === aktifBolge.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSeciliBolge(b.id)}
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
                {b.ikon} {b.ad}
              </button>
            );
          })}
        </div>

        {/* SEÇİLİ BÖLGE DETAY KARTI */}
        <div
          style={{
            padding: 20,
            borderRadius: 15,
            background: "var(--bg)",
            border: "1.5px solid var(--vurgu)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 21 }}>
                {aktifBolge.ikon} {aktifBolge.ad}
              </strong>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 900,
                  background: ZORLUK_RENK[aktifBolge.zorluk].arkaplan,
                  color: ZORLUK_RENK[aktifBolge.zorluk].yazi,
                }}
              >
                {aktifBolge.zorluk} · {aktifBolge.hedefSaldiri}
              </span>
            </div>

            <button
              type="button"
              onClick={() => bolgeKopyala(aktifBolge)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: 0,
                background: "var(--vurgu)",
                color: "var(--vurgu-yazi)",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {kopyalandiId === aktifBolge.id ? "✓ Kopyalandı!" : "📋 Klan Sohbetine Kopyala"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "var(--kart)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700 }}>⚔️ ÖNERİLEN ORDU</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{aktifBolge.ordu}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "var(--kart)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700 }}>🧪 ÖNERİLEN BÜYÜLER</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{aktifBolge.buyuler}</div>
            </div>
          </div>

          <div style={{ fontSize: 14.5, lineHeight: 1.6, opacity: 0.9 }}>
            <strong>💡 Uygulama Taktiği:</strong> {aktifBolge.taktik}
          </div>

          <div style={{ fontSize: 13, opacity: 0.75, padding: "9px 12px", borderRadius: 10, background: "var(--kart)" }}>
            <strong>🔄 Alternatif Ordu:</strong> {aktifBolge.alternatif}
          </div>
        </div>
      </section>

      {/* 2. BÖLÜM: BASKIN MADALYASI TÜCCAR OPTİMİZATÖRÜ */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
              <span>🛒 Haftalık Baskın Madalyası Tüccar Sepeti</span>
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.72 }}>
              Haftalık madalyanı gir, tüccar limitlerine göre en kârlı Cevher / Lab / Taş sepetini oluştur.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 800 }}>
              <span>🏅 Haftalık Madalyan:</span>
              <input
                type="number"
                min={0}
                max={5000}
                step={50}
                value={madalya}
                onChange={(e) => setMadalya(Math.max(0, Math.min(5000, Number(e.target.value))))}
                style={{
                  width: 100,
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid var(--vurgu)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 900,
                }}
              />
            </label>

            <button type="button" onClick={() => hazirSepet("cevher")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              ⭐ Cevher Odaklı
            </button>
            <button type="button" onClick={() => hazirSepet("gelisim")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              🔬 Lab + Cevher
            </button>
            <button type="button" onClick={() => hazirSepet("tas")} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              💎 Maks Taş
            </button>
            <button type="button" onClick={() => setSepet({})} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef6b5f", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
              Sıfırla
            </button>
          </div>
        </div>

        {/* ÖZET KARTLARI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 10 }}>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Kalan Baskın Madalyası</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: kalan < 0 ? "#ef6b5f" : "var(--vurgu)", marginTop: 3 }}>
              🏅 {kalan} / {madalya}
            </div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Haftalık Lab Hız Kazancı</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e", marginTop: 3 }}>
              🔬 +{labGunKazanci * 23} saat ({labGunKazanci} gün)
            </div>
          </div>
          <div style={{ padding: "12px 15px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Satarsan Yeşil Taş Kazancı</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", marginTop: 3 }}>
              💎 {toplamTas} Taş / hafta
            </div>
          </div>
        </div>

        {/* TÜCCAR ÜRÜNLERİ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
          {TUCCAR_URUNLERI.map((u) => {
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
                    <strong style={{ fontSize: 14.5 }}>{u.ikon} {u.ad}</strong>
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: "var(--vurgu)" }}>🏅 {u.maliyet}</span>
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: 12.5, opacity: 0.75, lineHeight: 1.4 }}>{u.not}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: "1px solid var(--cizgi)" }}>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    Limit: {adet}/{u.haftalikLimit} · 🏅 {adet * u.maliyet}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => adetDegistir(u, -1)}
                      style={{ width: 32, height: 32, minHeight: 32, borderRadius: 8, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "var(--fg)", fontWeight: 900, cursor: "pointer" }}
                    >
                      −
                    </button>
                    <strong style={{ minWidth: 18, textAlign: "center" }}>{adet}</strong>
                    <button
                      type="button"
                      disabled={adet >= u.haftalikLimit}
                      onClick={() => adetDegistir(u, 1)}
                      style={{ width: 32, height: 32, minHeight: 32, borderRadius: 8, border: 0, background: "var(--vurgu)", color: "var(--vurgu-yazi)", fontWeight: 900, cursor: "pointer" }}
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
    </main>
  );
}
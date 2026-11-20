"use client";
import { useEffect, useState } from "react";

type Kategori = "Kahraman & Ekipman" | "Birlik & Büyü" | "Savunma & Mekanik";

type Soru = {
  id: number;
  kategori: Kategori;
  soru: string;
  secenekler: [string, string, string, string];
  dogru: number;
  aciklama: string;
};

const SORU_HAVUZU: Soru[] = [
  {
    id: 1,
    kategori: "Savunma & Mekanik",
    soru: "Aynı binaya 2. Deprem Büyüsü atıldığında, 1. Deprem'in hasarının kaçta kaçını verir?",
    secenekler: ["1/2'sini", "1/3'ünü", "1/4'ünü", "Aynı hasarı verir"],
    dogru: 1,
    aciklama: "Deprem Büyüsü azalan verimle çalışır: 1. tam hasar, 2. 1/3, 3. 1/5 hasar verir.",
  },
  {
    id: 2,
    kategori: "Birlik & Büyü",
    soru: "Birlikleri kısa süreliğine yer altından geçirip savunmaları atlamasını sağlayan birlik hangisidir?",
    secenekler: ["Domuz Binici", "Madenci", "Atıcı", "Yeti"],
    dogru: 1,
    aciklama: "Madenci (Miner), binalar arasında yer altından ilerler ve bu sırada hedef alınamaz.",
  },
  {
    id: 3,
    kategori: "Kahraman & Ekipman",
    soru: "Destansı (Epic) bir kahraman ekipmanı en fazla kaçıncı seviyeye kadar yükseltilebilir?",
    secenekler: ["18", "21", "24", "27"],
    dogru: 3,
    aciklama: "Standart ekipmanlar maks. 18, Destansı ekipmanlar maks. 27. seviyeye kadar çıkar.",
  },
  {
    id: 4,
    kategori: "Savunma & Mekanik",
    soru: "Klan Savaş Ligi (CWL) boyunca her oyuncu 1 savaş gününde kaç saldırı hakkına sahiptir?",
    secenekler: ["1 saldırı", "2 saldırı", "3 saldırı", "Klan lideri belirler"],
    dogru: 0,
    aciklama: "Normal klan savaşlarında 2, CWL'de ise her turda sadece 1 saldırı hakkı vardır.",
  },
  {
    id: 5,
    kategori: "Birlik & Büyü",
    soru: "Aşağıdaki büyülerden hangisi Kara İksir Büyü Fabrikasında üretilir?",
    secenekler: ["Görünmezlik Büyüsü", "Klon Büyüsü", "Sarmaşık Büyüsü", "Geri Çağırma Büyüsü"],
    dogru: 2,
    aciklama: "Sarmaşık (Overgrowth) Büyüsü Kara İksir büyüsüdür; diğer üçü normal İksir büyüsüdür.",
  },
  {
    id: 6,
    kategori: "Kahraman & Ekipman",
    soru: "Barbar Kral'ın duvarları tek tuşla yıkıp çevredeki binalara yüzde bazlı hasar veren ekipmanı hangisidir?",
    secenekler: ["Dev Eldiven", "Deprem Çizmeleri", "Dikenli Top", "Vampir Bıyığı"],
    dogru: 1,
    aciklama: "Deprem Çizmeleri (Earthquake Boots) aktif edildiğinde çevredeki duvarları anında parçalar.",
  },
  {
    id: 7,
    kategori: "Savunma & Mekanik",
    soru: "İnşaatçı İksiri kullanıldığında 1 saat boyunca inşaatçılar kaç kat hızlı çalışır?",
    secenekler: ["5x", "8x", "10x", "24x"],
    dogru: 2,
    aciklama: "İnşaatçı İksiri 1 saatte 10x hız verir (her inşaatçıya +9 saat kazandırır). 24x olan Araştırma İksiridir.",
  },
  {
    id: 8,
    kategori: "Birlik & Büyü",
    soru: "Kelle Avcısı (Headhunter) savaş alanında öncelikli olarak kimi hedefler?",
    secenekler: ["Kaynak depolarını", "Savunmaları", "Rakip Kahramanları", "Klan Kalesi birliklerini"],
    dogru: 2,
    aciklama: "Kelle Avcısı rakip kahramanlara 4 kat hasar verir ve onları zehirle yavaşlatır.",
  },
  {
    id: 9,
    kategori: "Kahraman & Ekipman",
    soru: "Kraliyet Şampiyonu'nun etrafında sürekli elektrik aurası oluşturarak yakındaki savunmaları eriten ekipman hangisidir?",
    secenekler: ["Roket Mızrak", "Elektro Çizmeler", "Uçan Kalkan", "Hız Şişesi"],
    dogru: 1,
    aciklama: "Elektro Çizmeler (Electro Boots) pasif elektrik aurasıyla hem hasar verir hem iyileştirir.",
  },
  {
    id: 10,
    kategori: "Savunma & Mekanik",
    soru: "Monolit savunmasının diğer savunmalardan en büyük farkı nedir?",
    secenekler: [
      "Sadece hava birliklerine vurur",
      "Hedefin maksimum canına göre ekstra yüzdelik hasar verir",
      "Ölünce patlayıp dondurur",
      "Aynı anda 5 hedefe ateş eder",
    ],
    dogru: 1,
    aciklama: "Monolit, sabit hasarına ek olarak hedefinin toplam canının belirli bir yüzdesini söker; tankların kâbusudur.",
  },
  {
    id: 11,
    kategori: "Birlik & Büyü",
    soru: "Klon Büyüsü büyü fabrikasında kaç birim yer kaplar?",
    secenekler: ["1", "2", "3", "4"],
    dogru: 2,
    aciklama: "Klon Büyüsü 3 büyü alanı kaplayan tek büyüdür.",
  },
  {
    id: 12,
    kategori: "Kahraman & Ekipman",
    soru: "Hangi kahraman hayvanı, eşleştiği kahramanı belirli aralıklarla görünmez yapar?",
    secenekler: ["Ruh Tilkisi", "Tek Boynuzlu At", "Anka Kuşu", "Kazıcı"],
    dogru: 0,
    aciklama: "Ruh Tilkisi (Spirit Fox) hem kendini hem kahramanını düzenli aralıklarla görünmezliğe sokar.",
  },
  {
    id: 13,
    kategori: "Savunma & Mekanik",
    soru: "Aynı anda sadece 4 Deprem Büyüsü atılarak hangisi tamamen yok edilebilir?",
    secenekler: ["Seviyesi fark etmeksizin tüm duvarlar", "Sadece Belediye Binası", "Sadece Hava Savunması", "Sadece X Yayı"],
    dogru: 0,
    aciklama: "4 adet 1. seviye Deprem Büyüsü bile seviyesi ne olursa olsun alandaki tüm duvarları yıkar.",
  },
  {
    id: 14,
    kategori: "Birlik & Büyü",
    soru: "Orman Binici (Root Rider) ilerlerken hangi özel yeteneğiyle ordunun yolunu açar?",
    secenekler: ["Duvarların üzerinden zıplar", "Dokunduğu duvarları doğrudan parçalar", "Savunmaları dondurur", "Görünmez olur"],
    dogru: 1,
    aciklama: "Orman Binici, temas ettiği duvarları anında yıkıp arkasındaki birliklere otoban açar.",
  },
  {
    id: 15,
    kategori: "Kahraman & Ekipman",
    soru: "Okçu Kraliçe'nin harita boyu düz bir çizgide ilerleyip tüm binalara hasar veren ekipmanı hangisidir?",
    secenekler: ["Donmuş Ok", "Dev Ok", "Sihirli Ayna", "Şifacı Kuklası"],
    dogru: 1,
    aciklama: "Dev Ok (Giant Arrow) haritanın bir ucundan diğer ucuna kadar düz hatta hasar verir.",
  },
  {
    id: 16,
    kategori: "Savunma & Mekanik",
    soru: "Klan Başkenti hafta sonu baskınlarında her oyuncunun temel saldırı hakkı (bonus dahil en fazla) kaçtır?",
    secenekler: ["3 + 1 = 4", "4 + 1 = 5", "5 + 1 = 6", "6 + 2 = 8"],
    dogru: 2,
    aciklama: "Her oyuncu 5 saldırıyla başlar; bir bölgeyi 3 yıldızla bitirirse +1 bonus saldırı kazanarak toplam 6 saldırı yapar.",
  },
  {
    id: 17,
    kategori: "Birlik & Büyü",
    soru: "Alev Atıcı (Flame Flinger) kuşatma makinesinin en büyük zayıflığı nedir?",
    secenekler: [
      "Duvarlara takılması",
      "X Yayı, Havan ve gizli Tesla gibi uzun menzilli/yakın tuzaklara karşı kırılgan olması",
      "Sadece kaynak binalarına saldırması",
      "Hava savunmalarından hasar alması",
    ],
    dogru: 1,
    aciklama: "Alev Atıcı çok uzun menzillidir ama Havan, X Yayı ve gizli Tesla'lar onu çok hızlı yok eder.",
  },
  {
    id: 18,
    kategori: "Kahraman & Ekipman",
    soru: "Ekipman yükseltirken Yıldızlı Cevher (Starry Ore) hangi ekipmanlar için gereklidir?",
    secenekler: [
      "Tüm ekipmanlar için",
      "Sadece Destansı (Epic) ekipmanlar için",
      "Sadece Barbar Kral ekipmanları için",
      "Sadece 18. seviyeden sonra standart ekipmanlar için",
    ],
    dogru: 1,
    aciklama: "Yıldızlı Cevher yalnızca Destansı ekipmanların 9, 12, 15, 18, 21, 24 ve 27. seviyelerinde istenir.",
  },
  {
    id: 19,
    kategori: "Savunma & Mekanik",
    soru: "Efsane Ligi'nde (Legend League) bir günde en fazla kaç saldırı yapılabilir?",
    secenekler: ["5", "6", "8", "Sınırsız"],
    dogru: 2,
    aciklama: "Efsane Ligi'nde her lig günü tüm oyunculara eşit şekilde 8 saldırı ve 8 savunma hakkı verilir.",
  },
  {
    id: 20,
    kategori: "Birlik & Büyü",
    soru: "Öfke Büyüsü (Rage Spell) altındaki Şifacılar (Healer) için hangisi doğrudur?",
    secenekler: [
      "Öfkeden hiç etkilenmezler",
      "İyileştirme güçleri ciddi oranda artar",
      "Sadece hızları artar, iyileştirme değişmez",
      "Hasar vermeye başlarlar",
    ],
    dogru: 1,
    aciklama: "Öfke Büyüsü Şifacıların iyileştirme miktarını artırır; Kraliçe Yürüyüşü'nün temel kuralıdır.",
  },
  {
    id: 21,
    kategori: "Savunma & Mekanik",
    soru: "CWL Mağazasında 120 Madalya ile alınan İnşaat Çekici yerine kaç adet İnşaatçı İksiri alınabilir?",
    secenekler: ["2 adet", "3 adet", "4 adet", "6 adet"],
    dogru: 2,
    aciklama: "İnşaatçı İksiri 30 madalyadır; 120 madalyaya tam 4 adet alınabilir.",
  },
  {
    id: 22,
    kategori: "Kahraman & Ekipman",
    soru: "Anka Kuşu (Phoenix) kahraman hayvanının özel gücü nedir?",
    secenekler: [
      "Kahramanı sürekli iyileştirir",
      "Kahraman düştüğünde onu kısa süreliğine dokunulmaz şekilde geri canlandırır",
      "Savunmaları sersemletir",
      "Duvarların üzerinden uçurur",
    ],
    dogru: 1,
    aciklama: "Anka Kuşu yumurtadan çıkarak kahramanı ölümden döndürür ve birkaç saniye dokunulmaz yapar.",
  },
  {
    id: 23,
    kategori: "Birlik & Büyü",
    soru: "Süper Birlik açmak için normal birliğin yanı sıra hangisi gereklidir?",
    secenekler: [
      "25.000 Kara İksir veya 1 Süper İksir",
      "100 Yeşil Taş",
      "Klan Lideri onayı",
      "Altın Bilet",
    ],
    dogru: 0,
    aciklama: "Süper Birlikler 3 günlüğüne 25.000 Kara İksir veya 1 Süper İksir ile aktif edilir.",
  },
  {
    id: 24,
    kategori: "Savunma & Mekanik",
    soru: "Clash of Clans dünya genelinde ilk olarak hangi yıl piyasaya sürüldü?",
    secenekler: ["2010", "2011", "2012", "2014"],
    dogru: 2,
    aciklama: "Clash of Clans, 2 Ağustos 2012'de iOS için çıkış yaptı (Android sürümü 2013'te geldi).",
  },
];

function karistir<T>(dizi: T[]): T[] {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

function rutbeBul(dogruSayisi: number, toplam: number) {
  const oran = toplam > 0 ? dogruSayisi / toplam : 0;
  if (oran >= 0.9) return { ad: "👑 Efsane Ligi Şampiyonu", not: "Köyün değil, oyunun kitabını yazmışsın!" };
  if (oran >= 0.7) return { ad: "⚔️ Klan Savaşı Komutanı", not: "Çok sağlam bilgi! 3 yıldız garantili oyuncu." };
  if (oran >= 0.5) return { ad: "🛡️ Deneyimli Savaşçı", not: "Temeller sağlam, birkaç ince detayı da kaparsan tamamsın." };
  return { ad: "👺 Goblin Çırağı", not: "Ganimet toplarken rehbere de bir göz atmak lazım!" };
}

export default function QuizSayfasi() {
  const [kategori, setKategori] = useState<"Tümü" | Kategori>("Tümü");
  const [sorular, setSorular] = useState<Soru[]>([]);
  const [indeks, setIndeks] = useState(0);
  const [secilen, setSecilen] = useState<number | null>(null);
  const [puan, setPuan] = useState(0);
  const [dogruSayisi, setDogruSayisi] = useState(0);
  const [seri, setSeri] = useState(0);
  const [enIyiSeri, setEnIyiSeri] = useState(0);
  const [bitti, setBitti] = useState(false);
  const [rekor, setRekor] = useState(0);
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    try {
      const kayit = Number(localStorage.getItem("sargyt_quiz_rekor") ?? "0");
      if (kayit > 0) setRekor(kayit);
    } catch {}
    yeniOyun("Tümü");
  }, []);

  function yeniOyun(seciliKat: "Tümü" | Kategori) {
    setKategori(seciliKat);
    const havuz =
      seciliKat === "Tümü"
        ? SORU_HAVUZU
        : SORU_HAVUZU.filter((s) => s.kategori === seciliKat);
    setSorular(karistir(havuz).slice(0, Math.min(10, havuz.length)));
    setIndeks(0);
    setSecilen(null);
    setPuan(0);
    setDogruSayisi(0);
    setSeri(0);
    setEnIyiSeri(0);
    setBitti(false);
    setKopyalandi(false);
  }

  const aktifSoru = sorular[indeks];

  function cevapla(secenekIdx: number) {
    if (secilen !== null || !aktifSoru) return;
    setSecilen(secenekIdx);

    if (secenekIdx === aktifSoru.dogru) {
      const yeniSeri = seri + 1;
      const kazanilan = 100 + (yeniSeri > 1 ? (yeniSeri - 1) * 20 : 0);
      const yeniPuan = puan + kazanilan;
      setSeri(yeniSeri);
      setEnIyiSeri((e) => Math.max(e, yeniSeri));
      setDogruSayisi((d) => d + 1);
      setPuan(yeniPuan);
      if (yeniPuan > rekor) {
        setRekor(yeniPuan);
        try {
          localStorage.setItem("sargyt_quiz_rekor", String(yeniPuan));
        } catch {}
      }
    } else {
      setSeri(0);
    }
  }

  function sonrakiSoru() {
    if (indeks + 1 >= sorular.length) {
      setBitti(true);
    } else {
      setIndeks((i) => i + 1);
      setSecilen(null);
    }
  }

  async function sonucuKopyala() {
    const rutbe = rutbeBul(dogruSayisi, sorular.length);
    const metin = `🧠 *Sargyt Clashers Bilgi Yarışması*\n${rutbe.ad}\n✅ Doğru: ${dogruSayisi}/${sorular.length} · 🏆 Puan: ${puan} · 🔥 En İyi Seri: ${enIyiSeri}\nSen kaç yapabilirsin? 👉 sargyt-clashers.vercel.app/quiz`;
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2500);
    } catch {}
  }

  const rutbe = rutbeBul(dogruSayisi, sorular.length);

  return (
    <main style={{ padding: "32px 24px", maxWidth: 960, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ÜST BAŞLIK & KATEGORİLER */}
      <section style={{ padding: "24px 28px", background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 6px" }}>
              🧠 Clash of Clans Bilgi Yarışması
            </h1>
            <p style={{ margin: 0, opacity: 0.78, fontSize: 14.5 }}>
              Üst üste doğru bilerek seri bonusu kas, Clash rütbeni kazan!
            </p>
          </div>
          <div style={{ padding: "8px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--vurgu)", fontWeight: 900, fontSize: 14 }}>
            🏆 Rekorun: <span style={{ color: "var(--vurgu)" }}>{rekor}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {(["Tümü", "Kahraman & Ekipman", "Birlik & Büyü", "Savunma & Mekanik"] as const).map((k) => {
            const secili = kategori === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => yeniOyun(k)}
                style={{
                  padding: "7px 12px",
                  minHeight: 36,
                  borderRadius: 10,
                  border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                  background: secili ? "var(--vurgu)" : "var(--bg)",
                  color: secili ? "var(--vurgu-yazi)" : "var(--fg)",
                  fontWeight: 800,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
      </section>

      {/* OYUN ALANI */}
      {bitti ? (
        <section
          style={{
            padding: 30,
            background: "var(--kart)",
            border: "2px solid var(--vurgu)",
            borderRadius: 18,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 950, color: "var(--vurgu)" }}>{rutbe.ad}</div>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.85, maxWidth: 480 }}>{rutbe.not}</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(110px, 1fr))", gap: 12, width: "100%", maxWidth: 460 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Doğru</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#22c55e" }}>
                {dogruSayisi}/{sorular.length}
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Toplam Puan</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--vurgu)" }}>{puan}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>En İyi Seri</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#f59e0b" }}>🔥 {enIyiSeri}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
            <button
              type="button"
              onClick={sonucuKopyala}
              style={{
                padding: "11px 20px",
                borderRadius: 11,
                border: 0,
                background: "var(--vurgu)",
                color: "var(--vurgu-yazi)",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {kopyalandi ? "✓ Sonuç Kopyalandı!" : "📋 WhatsApp / Discord'a Kopyala"}
            </button>
            <button
              type="button"
              onClick={() => yeniOyun(kategori)}
              style={{
                padding: "11px 20px",
                borderRadius: 11,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🔄 Tekrar Oyna
            </button>
          </div>
        </section>
      ) : aktifSoru ? (
        <section style={{ padding: 26, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* İLERLEME & PUAN */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 13.5, fontWeight: 800 }}>
            <span>
              Soru {indeks + 1} / {sorular.length} · <span style={{ color: "var(--vurgu)" }}>{aktifSoru.kategori}</span>
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              {seri >= 2 && <span style={{ color: "#f59e0b" }}>🔥 {seri}x Seri!</span>}
              <span>⭐ {puan} Puan</span>
            </div>
          </div>

          {/* İLERLEME ÇUBUĞU */}
          <div style={{ height: 8, borderRadius: 999, background: "var(--bg)", overflow: "hidden" }}>
            <div
              style={{
                width: `${((indeks + (secilen !== null ? 1 : 0)) / sorular.length) * 100}%`,
                height: "100%",
                background: "var(--vurgu)",
                transition: "width 0.25s ease",
              }}
            />
          </div>

          {/* SORU METNİ */}
          <h2 style={{ margin: "4px 0 0", fontSize: 21, fontWeight: 900, lineHeight: 1.35 }}>
            {aktifSoru.soru}
          </h2>

          {/* ŞIKLAR */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 11 }}>
            {aktifSoru.secenekler.map((secenek, idx) => {
              const harf = ["A", "B", "C", "D"][idx];
              const cevaplandi = secilen !== null;
              const dogruMu = idx === aktifSoru.dogru;
              const secilenMi = idx === secilen;

              let kenarlik = "1px solid var(--cizgi)";
              let arkaplan = "var(--bg)";
              if (cevaplandi && dogruMu) {
                kenarlik = "2px solid #22c55e";
                arkaplan = "rgba(34, 197, 94, 0.16)";
              } else if (cevaplandi && secilenMi && !dogruMu) {
                kenarlik = "2px solid #ef4444";
                arkaplan = "rgba(239, 68, 68, 0.16)";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cevaplandi}
                  onClick={() => cevapla(idx)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 13,
                    border: kenarlik,
                    background: arkaplan,
                    color: "var(--fg)",
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: 14.5,
                    cursor: cevaplandi ? "default" : "pointer",
                    opacity: cevaplandi && !dogruMu && !secilenMi ? 0.55 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "var(--kart)",
                      border: "1px solid var(--cizgi)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {harf}
                  </span>
                  <span>{secenek}</span>
                </button>
              );
            })}
          </div>

          {/* AÇIKLAMA & SONRAKİ BUTONU */}
          {secilen !== null && (
            <div
              style={{
                padding: 15,
                borderRadius: 13,
                background: secilen === aktifSoru.dogru ? "rgba(34, 197, 94, 0.12)" : "rgba(239, 68, 68, 0.12)",
                border: "1px solid " + (secilen === aktifSoru.dogru ? "rgba(34, 197, 94, 0.45)" : "rgba(239, 68, 68, 0.45)"),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 220, fontSize: 14, lineHeight: 1.5 }}>
                <strong style={{ color: secilen === aktifSoru.dogru ? "#22c55e" : "#ef6b5f" }}>
                  {secilen === aktifSoru.dogru ? "✓ Doğru Bildin!" : "✕ Yanlış Cevap!"}
                </strong>{" "}
                {aktifSoru.aciklama}
              </div>

              <button
                type="button"
                onClick={sonrakiSoru}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: 0,
                  background: "var(--vurgu)",
                  color: "var(--vurgu-yazi)",
                  fontWeight: 900,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {indeks + 1 >= sorular.length ? "Sonucu Gör 🏆" : "Sonraki Soru →"}
              </button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
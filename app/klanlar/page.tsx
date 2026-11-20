"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;
const SAYFA_BOYUTU = 20;
const AY_ADLARI = [
  "",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

type Uye = {
  tag: string;
  name: string;
  role: string;
  townHallLevel: number;
  trophies: number;
  donations: number;
  donationsReceived: number;
};

type Klan = {
  kod: string;
  isim: string;
  aciklama: string;
  seviye: number;
  puan: number;
  uyeSayisi: number;
  savasGalibiyet: number;
  savasMaglubiyet: number;
  savasBeraberlik: number;
  savasSerisi: number;
  rozet?: string | null;
  uyeler: Uye[];
};

type SavasOyuncu = {
  tag: string;
  isim: string;
  bbSeviyesi: number;
  haritaSirasi: number;
  klanAdi: string;
  klanKodu: string;
  bizimKlan: boolean;
  saldiriSayisi: number;
  maksSaldiri: number;
  toplamYildiz: number;
  toplamYuzde: number;
};

type GrupKlan = {
  tag: string;
  name: string;
  clanLevel: number;
  rozet: string | null;
  uyeSayisi: number;
  yildiz: number;
  yuzde: number;
  galibiyet: number;
};

type CwlMac = {
  tur: number;
  durum: string;
  klan1: { tag: string; name: string; rozet: string | null; stars: number; destructionPercentage: number };
  klan2: { tag: string; name: string; rozet: string | null; stars: number; destructionPercentage: number };
};

type GecmisSavas = {
  id: string;
  sonuc: "win" | "lose" | "tie" | "unknown";
  bitisTarihi: string;
  takimBoyutu: number;
  bizimAdi?: string;
  bizimRozet?: string | null;
  bizimYildiz: number;
  bizimYuzde: number;
  rakipTag: string;
  rakipAdi: string;
  rakipRozet: string | null;
  rakipYildiz: number;
  rakipYuzde: number;
  detayli: boolean;
  oyuncuSiralamasi?: SavasOyuncu[];
};

type CwlArsivKaydi = {
  sezon: string;
  yil: number;
  ay: number;
  durum: string;
  takimBoyutu: number;
  grupKlanlari: GrupKlan[];
  tumMaclar: CwlMac[];
  oyuncuSiralamasi: SavasOyuncu[];
};

type SavasVerisi = {
  aktif: boolean;
  tur: "cwl" | "normal" | "yok";
  durum?: string;
  sezon?: string;
  takimBoyutu?: number;
  bizimKlan?: {
    tag: string;
    name: string;
    rozet: string | null;
    stars: number;
    destructionPercentage: number;
    attacks: number;
  };
  rakipKlan?: {
    tag: string;
    name: string;
    rozet: string | null;
    stars: number;
    destructionPercentage: number;
    attacks: number;
  };
  grupKlanlari?: GrupKlan[];
  tumMaclar?: CwlMac[];
  oyuncuSiralamasi?: SavasOyuncu[];
  savasGecmisi?: GecmisSavas[];
  gecmisGizli?: boolean;
  cwlArsivi?: CwlArsivKaydi[];
};

type FavoriKlan = {
  kod: string;
  isim: string;
  seviye: number;
};

const ROL_TR: Record<string, string> = {
  leader: "Lider",
  coLeader: "Yardımcı Lider",
  admin: "Büyük",
  member: "Üye",
};

function savasTarihiFormatla(ham: string): string {
  if (!ham || ham.length < 8) return "";
  const yil = ham.slice(0, 4);
  const ay = ham.slice(4, 6);
  const gun = ham.slice(6, 8);
  const tarih = new Date(`${yil}-${ay}-${gun}T00:00:00Z`);
  if (Number.isNaN(tarih.getTime())) return "";
  return tarih.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function BbGorsel({ seviye, boyut = 28 }: { seviye: number; boyut?: number }) {
  const [hata, setHata] = useState(false);

  if (hata) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px 7px",
          borderRadius: 6,
          background: "var(--bg)",
          border: "1px solid var(--cizgi)",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        BB {seviye}
      </span>
    );
  }

  return (
    <span
      title={`Belediye Binası ${seviye}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <img
        src={`/birimler/th${seviye}.png`}
        alt={`BB ${seviye}`}
        width={boyut}
        height={boyut}
        onError={() => setHata(true)}
        style={{ objectFit: "contain", display: "block" }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>{seviye}</span>
    </span>
  );
}

function KlanlarIcerik() {
  const aramaParam = useSearchParams();
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [klan, setKlan] = useState<Klan | null>(null);
  const [sirala, setSirala] = useState<"kupa" | "bagis" | "bb">("kupa");

  const [favoriKlanlar, setFavoriKlanlar] = useState<FavoriKlan[]>([]);
  const [savas, setSavas] = useState<SavasVerisi | null>(null);
  const [savasYukleniyor, setSavasYukleniyor] = useState(false);

  // Canlı Savaş Modalı
  const [savasPencereAcik, setSavasPencereAcik] = useState(false);
  const [savasSekme, setSavasSekme] = useState<"yildiz" | "grup">("yildiz");
  const [sadeceBizimKlan, setSadeceBizimKlan] = useState(false);

  // Arşiv Görünümü (Özet <-> Arşiv)
  const [gorunum, setGorunum] = useState<"ozet" | "arsiv">("ozet");
  const [arsivSekme, setArsivSekme] = useState<"savaslar" | "cwl">("savaslar");
  const [savasFiltre, setSavasFiltre] = useState<"hepsi" | "win" | "lose" | "detayli">("hepsi");
  const [arsivSayfa, setArsivSayfa] = useState(1);
  const [seciliGecmisSavas, setSeciliGecmisSavas] = useState<GecmisSavas | null>(null);
  const [detaySadeceBiz, setDetaySadeceBiz] = useState(false);

  // CWL Arşivi Yıl/Ay ve Alt Sekme State'leri
  const [seciliCwlYil, setSeciliCwlYil] = useState<number | null>(null);
  const [seciliCwlSezon, setSeciliCwlSezon] = useState<string>("");
  const [cwlAltSekme, setCwlAltSekme] = useState<"grup" | "yildiz" | "maclar">("grup");
  const [cwlSadeceBiz, setCwlSadeceBiz] = useState(false);
  const [cwlTurFiltre, setCwlTurFiltre] = useState<string>("hepsi");

  useEffect(() => {
    try {
      const kayit = localStorage.getItem("favori_klanlar");
      if (kayit) setFavoriKlanlar(JSON.parse(kayit));
    } catch {}
  }, []);

  const klanGetir = useCallback(async (hamKod: string) => {
    const temiz = hamKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setKlan(null);
    setSavas(null);
    setSavasPencereAcik(false);
    setGorunum("ozet");
    setArsivSayfa(1);
    setSeciliGecmisSavas(null);
    setSeciliCwlYil(null);
    setSeciliCwlSezon("");

    if (!KOD_KURALI.test(temiz)) {
      setHata("Geçersiz klan kodu. Örnek: #2PP0Y8L");
      return;
    }

    setHata("");
    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/klan?kod=" + temiz);
      const veri = (await yanit.json()) as Klan & { hata?: string };
      if (!yanit.ok) {
        setHata(veri.hata ?? "Bir sorun oluştu");
      } else {
        setKlan(veri);
        setSavasYukleniyor(true);
        fetch("/api/savas?kod=" + temiz)
          .then((r) => r.json())
          .then((sv: SavasVerisi) => setSavas(sv))
          .catch(() => setSavas(null))
          .finally(() => setSavasYukleniyor(false));
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    const urlKod = aramaParam.get("kod");
    if (urlKod) {
      setKod(urlKod.startsWith("#") ? urlKod : "#" + urlKod);
      klanGetir(urlKod);
    }
  }, [aramaParam, klanGetir]);

  function ara(e: FormEvent) {
    e.preventDefault();
    klanGetir(kod);
  }

  function favoriDegistir() {
    if (!klan) return;
    const temizKod = klan.kod.replace(/^#/, "");
    const varMi = favoriKlanlar.some((f) => f.kod === temizKod);
    const yeniListe = varMi
      ? favoriKlanlar.filter((f) => f.kod !== temizKod)
      : [...favoriKlanlar, { kod: temizKod, isim: klan.isim, seviye: klan.seviye }];
    setFavoriKlanlar(yeniListe);
    try {
      localStorage.setItem("favori_klanlar", JSON.stringify(yeniListe));
    } catch {}
  }

  const favorideMi = klan ? favoriKlanlar.some((f) => f.kod === klan.kod.replace(/^#/, "")) : false;

  const bbDagilimi: Record<number, number> = {};
  if (klan) {
    for (const u of klan.uyeler) {
      bbDagilimi[u.townHallLevel] = (bbDagilimi[u.townHallLevel] ?? 0) + 1;
    }
  }

  const siraliUyeler = klan
    ? [...klan.uyeler].sort((a, b) => {
        if (sirala === "bagis") return b.donations - a.donations;
        if (sirala === "bb") return b.townHallLevel - a.townHallLevel || b.trophies - a.trophies;
        return b.trophies - a.trophies;
      })
    : [];

  const filtrelenmisYildizlar = (savas?.oyuncuSiralamasi ?? []).filter((o) =>
    sadeceBizimKlan ? o.bizimKlan : true
  );

  // Savaş Geçmişi Filtreleme, İstatistikler ve 20'şerli Sayfalama
  const tumGecmisSavaslar = useMemo(() => savas?.savasGecmisi ?? [], [savas]);

  const arsivPerformans = useMemo(() => {
    const toplam = tumGecmisSavaslar.length;
    if (toplam === 0) return null;
    const galibiyet = tumGecmisSavaslar.filter((s) => s.sonuc === "win").length;
    const ortYildiz = (
      tumGecmisSavaslar.reduce((acc, s) => acc + s.bizimYildiz, 0) / toplam
    ).toFixed(1);
    const ortYuzde = (
      tumGecmisSavaslar.reduce((acc, s) => acc + s.bizimYuzde, 0) / toplam
    ).toFixed(1);
    const kazanmaOrani = Math.round((galibiyet / toplam) * 100);
    return { toplam, galibiyet, kazanmaOrani, ortYildiz, ortYuzde };
  }, [tumGecmisSavaslar]);

  const filtrelenmisGecmis = useMemo(() => {
    return tumGecmisSavaslar.filter((g) => {
      if (savasFiltre === "win") return g.sonuc === "win";
      if (savasFiltre === "lose") return g.sonuc === "lose";
      if (savasFiltre === "detayli") return g.detayli;
      return true;
    });
  }, [tumGecmisSavaslar, savasFiltre]);

  const toplamSayfa = Math.max(1, Math.ceil(filtrelenmisGecmis.length / SAYFA_BOYUTU));
  const guvenliSayfa = Math.min(arsivSayfa, toplamSayfa);
  const sayfaSavaslari = filtrelenmisGecmis.slice(
    (guvenliSayfa - 1) * SAYFA_BOYUTU,
    guvenliSayfa * SAYFA_BOYUTU
  );

  // CWL Arşivi Yıl & Ay Hesaplamaları
  const cwlArsivi = useMemo(() => savas?.cwlArsivi ?? [], [savas]);
  const cwlYillari = useMemo(
    () => Array.from(new Set(cwlArsivi.map((c) => c.yil))).sort((a, b) => b - a),
    [cwlArsivi]
  );
  const aktifCwlYil = seciliCwlYil && cwlYillari.includes(seciliCwlYil) ? seciliCwlYil : cwlYillari[0] ?? null;
  const yilCwlKayitlari = useMemo(
    () => cwlArsivi.filter((c) => c.yil === aktifCwlYil).sort((a, b) => b.ay - a.ay),
    [cwlArsivi, aktifCwlYil]
  );
  const aktifCwlKaydi =
    yilCwlKayitlari.find((c) => c.sezon === seciliCwlSezon) ?? yilCwlKayitlari[0] ?? null;

  const cwlOyuncular = (aktifCwlKaydi?.oyuncuSiralamasi ?? []).filter((o) =>
    cwlSadeceBiz ? o.bizimKlan : true
  );
  const cwlTurlari = useMemo(
    () =>
      Array.from(new Set((aktifCwlKaydi?.tumMaclar ?? []).map((m) => m.tur))).sort((a, b) => a - b),
    [aktifCwlKaydi]
  );
  const cwlFiltreliMaclar = (aktifCwlKaydi?.tumMaclar ?? []).filter((m) =>
    cwlTurFiltre === "hepsi" ? true : String(m.tur) === cwlTurFiltre
  );

  return (
    <main style={{ padding: "32px 24px 60px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, margin: "0 0 8px", fontWeight: 800 }}>🛡️ Klan Analizi</h1>
      <p style={{ opacity: 0.78, marginTop: 0, fontSize: 16 }}>
        Klan etiketini gir; canlı klan savaşı &amp; lig durumunu, Savaş &amp; CWL arşivini, Belediye Binası dağılımını ve üye bağışlarını incele.
      </p>

      <form onSubmit={ara} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <input
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Klan kodu, örn. #2PP0Y8L"
          maxLength={14}
          aria-label="Klan kodu"
          style={{
            flex: 1,
            minWidth: 240,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
            color: "var(--fg)",
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          disabled={yukleniyor}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            border: 0,
            background: "var(--vurgu)",
            color: "var(--vurgu-yazi)",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {yukleniyor ? "Aranıyor..." : "Klanı Ara"}
        </button>
      </form>

      {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}

      {/* ============================================================
          GÖRÜNÜM 1: KLAN ÖZETİ & ÜYE LİSTESİ
      ============================================================ */}
      {klan && gorunum === "ozet" && (
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 18,
            }}
          >
            {/* Klan Ana Bilgi Kartı */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {klan.rozet ? (
                  <img
                    src={klan.rozet}
                    alt={klan.isim}
                    width={72}
                    height={72}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 16,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                    }}
                  >
                    🛡️
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{klan.isim}</h2>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        background: "var(--vurgu)",
                        color: "var(--vurgu-yazi)",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      Seviye {klan.seviye}
                    </span>
                  </div>
                  <p style={{ opacity: 0.78, margin: "6px 0 0", fontSize: 14 }}>
                    {klan.kod} · 👥 {klan.uyeSayisi}/50 Üye · 🏆 {klan.puan} Puan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={favoriDegistir}
                  title={favorideMi ? "Favorilerden çıkar" : "Favori klanlara ekle"}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid " + (favorideMi ? "var(--vurgu)" : "var(--cizgi)"),
                    background: favorideMi ? "rgba(245, 197, 66, 0.16)" : "var(--bg)",
                    color: favorideMi ? "var(--vurgu)" : "var(--fg)",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {favorideMi ? "★ Favoride" : "☆ Yıldızla"}
                </button>
              </div>

              {klan.aciklama && (
                <p style={{ opacity: 0.85, fontSize: 14, margin: 0, lineHeight: 1.55 }}>
                  {klan.aciklama}
                </p>
              )}

              {/* Canlı Klan Savaşı / CWL Durum Butonu */}
              <div style={{ marginTop: 4 }}>
                {savasYukleniyor ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      fontSize: 14,
                      opacity: 0.75,
                    }}
                  >
                    ⚔️ Savaş durumu kontrol ediliyor...
                  </div>
                ) : savas?.aktif && savas.bizimKlan && savas.rakipKlan ? (
                  <button
                    type="button"
                    onClick={() => setSavasPencereAcik(true)}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: 14,
                      border: "2px solid var(--vurgu)",
                      background: "linear-gradient(135deg, rgba(245,197,66,0.18), rgba(239,68,68,0.14))",
                      color: "var(--fg)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {savas.bizimKlan.rozet && (
                        <img src={savas.bizimKlan.rozet} alt="" width={34} height={34} />
                      )}
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{savas.bizimKlan.name}</span>
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: 20,
                        fontWeight: 900,
                        letterSpacing: 1,
                        padding: "4px 14px",
                        borderRadius: 10,
                        background: "var(--bg)",
                        border: "1px solid var(--vurgu)",
                        color: "var(--vurgu)",
                      }}
                    >
                      ⭐ {savas.bizimKlan.stars} - {savas.rakipKlan.stars} ⭐
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{savas.rakipKlan.name}</span>
                      {savas.rakipKlan.rozet && (
                        <img src={savas.rakipKlan.rozet} alt="" width={34} height={34} />
                      )}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--vurgu)",
                        marginTop: 2,
                      }}
                    >
                      {savas.tur === "cwl" ? "🏆 Klan Savaş Ligi Aktif" : "⚔️ Klan Savaşı Aktif"} — Detaylı İnceleme İçin Tıkla ↗
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      opacity: 0.65,
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    🛡️ Klan Savaşı: Şu an aktif bir savaş bulunmuyor
                  </button>
                )}
              </div>
            </section>

            {/* Savaş İstatistikleri, BB Dağılımı & Savaş Arşivi Butonu */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <strong style={{ fontSize: 18 }}>⚔️ Klan Savaşı İstatistikleri</strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, textAlign: "center" }}>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{klan.savasGalibiyet}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Galibiyet</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#ef6b5f" }}>{klan.savasMaglubiyet}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Mağlubiyet</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--vurgu)" }}>{klan.savasSerisi}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Galibiyet Serisi</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>Belediye Binası Dağılımı:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(bbDagilimi)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([bb, adet]) => (
                      <span
                        key={bb}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                        }}
                      >
                        <BbGorsel seviye={Number(bb)} boyut={22} />
                        <span>× <strong>{adet}</strong></span>
                      </span>
                    ))}
                </div>
              </div>

              {/* SAĞ ALTTA ŞIK SAVAŞ & CWL ARŞİVİ BUTONU */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6, borderTop: "1px solid var(--cizgi)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setGorunum("arsiv");
                    setArsivSayfa(1);
                  }}
                  style={{
                    padding: "11px 20px",
                    borderRadius: 12,
                    border: "1.5px solid var(--vurgu)",
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--vurgu) 22%, var(--bg)), var(--bg))",
                    color: "var(--fg)",
                    fontWeight: 800,
                    fontSize: 14.5,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                  }}
                >
                  <span>📜 Savaş &amp; CWL Arşivi</span>
                  {tumGecmisSavaslar.length > 0 && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 8,
                        background: "var(--vurgu)",
                        color: "var(--vurgu-yazi)",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {tumGecmisSavaslar.length}
                    </span>
                  )}
                  <span style={{ color: "var(--vurgu)" }}>↗</span>
                </button>
              </div>
            </section>
          </div>

          {/* Üye Listesi */}
          <section
            style={{
              padding: 24,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 16,
            }}
          >
            <h2 className="baslik-serit" style={{ marginTop: 0 }}>
              <span>👥 Üye Listesi ({klan.uyeler.length})</span>
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <label htmlFor="uye-sirala" style={{ fontSize: 13.5, opacity: 0.78, fontWeight: 600 }}>
                Sırala:
              </label>
              <select
                id="uye-sirala"
                value={sirala}
                onChange={(e) => setSirala(e.target.value as "kupa" | "bagis" | "bb")}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <option value="kupa">🏆 Kupaya Göre</option>
                <option value="bb">🏰 BB Seviyesine Göre</option>
                <option value="bagis">🎁 Bağışa Göre</option>
              </select>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                    <th style={{ padding: "12px 10px" }}>#</th>
                    <th style={{ padding: "12px 10px" }}>Oyuncu</th>
                    <th style={{ padding: "12px 10px" }}>Rol</th>
                    <th style={{ padding: "12px 10px" }}>Kupa</th>
                    <th style={{ padding: "12px 10px" }}>Bağış / Alınan</th>
                  </tr>
                </thead>
                <tbody>
                  {siraliUyeler.map((u, idx) => (
                    <tr key={u.tag} style={{ borderBottom: "1px solid var(--cizgi)" }}>
                      <td style={{ padding: "12px 10px", opacity: 0.7 }}>{idx + 1}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <BbGorsel seviye={u.townHallLevel} boyut={32} />
                          <div>
                            <Link
                              href={"/?kod=" + u.tag.replace(/^#/, "")}
                              style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
                              title="Bu oyuncunun köyünü analiz et"
                            >
                              {u.name} ↗
                            </Link>
                            <div style={{ fontSize: 12, opacity: 0.65 }}>{u.tag}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: 14 }}>{ROL_TR[u.role] ?? u.role}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 600 }}>🏆 {u.trophies}</td>
                      <td style={{ padding: "12px 10px", fontSize: 14 }}>
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>↑ {u.donations}</span> /{" "}
                        <span style={{ opacity: 0.75 }}>↓ {u.donationsReceived}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================
          GÖRÜNÜM 2: SAVAŞ & CWL ARŞİVİ (2 SEKMELİ TAM SAYFA)
      ============================================================ */}
      {klan && gorunum === "arsiv" && (
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Üst Gezinme & Klan Başlığı */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                type="button"
                onClick={() => setGorunum("ozet")}
                style={{
                  padding: "10px 16px",
                  borderRadius: 11,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ← Klan Özetine Dön
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {klan.rozet && <img src={klan.rozet} alt="" width={40} height={40} />}
                <div>
                  <div className="oyun-baslik" style={{ fontSize: 20, fontWeight: 800 }}>
                    {klan.isim} — Savaş Arşivi
                  </div>
                  <div style={{ fontSize: 12.5, opacity: 0.72 }}>{klan.kod} · Seviye {klan.seviye}</div>
                </div>
              </div>
            </div>

            {/* 2 Ana Arşiv Sekmesi */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setArsivSekme("savaslar")}
                style={{
                  padding: "10px 18px",
                  borderRadius: 11,
                  border: "1.5px solid " + (arsivSekme === "savaslar" ? "var(--vurgu)" : "var(--cizgi)"),
                  background: arsivSekme === "savaslar" ? "var(--vurgu)" : "var(--bg)",
                  color: arsivSekme === "savaslar" ? "#111" : "var(--fg)",
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                ⚔️ Klan Savaşları ({tumGecmisSavaslar.length})
              </button>
              <button
                type="button"
                onClick={() => setArsivSekme("cwl")}
                style={{
                  padding: "10px 18px",
                  borderRadius: 11,
                  border: "1.5px solid " + (arsivSekme === "cwl" ? "var(--vurgu)" : "var(--cizgi)"),
                  background: arsivSekme === "cwl" ? "var(--vurgu)" : "var(--bg)",
                  color: arsivSekme === "cwl" ? "#111" : "var(--fg)",
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: "pointer",
                }}
              >
                🏆 Klan Savaş Ligi ({cwlArsivi.length})
              </button>
            </div>
          </div>

          {/* SEKME A: KLAN SAVAŞLARI (20'ŞERLİ SAYFALAMA + DETAY PENCERESİ) */}
          {arsivSekme === "savaslar" && (
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
              <h2 className="baslik-serit" style={{ marginTop: 0, marginBottom: 4 }}>
                <span>⚔️ Klan Savaşı Geçmişi</span>
              </h2>

              {/* Performans Özet Şeridi */}
              {arsivPerformans && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 12,
                  }}
                >
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#22c55e" }}>%{arsivPerformans.kazanmaOrani}</div>
                    <div style={{ fontSize: 12.5, opacity: 0.72 }}>Kazanma Oranı ({arsivPerformans.galibiyet}/{arsivPerformans.toplam})</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "var(--vurgu)" }}>⭐ {arsivPerformans.ortYildiz}</div>
                    <div style={{ fontSize: 12.5, opacity: 0.72 }}>Ortalama Yıldız</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>%{arsivPerformans.ortYuzde}</div>
                    <div style={{ fontSize: 12.5, opacity: 0.72 }}>Ortalama Yıkım</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{arsivPerformans.toplam}</div>
                    <div style={{ fontSize: 12.5, opacity: 0.72 }}>Arşivlenen Savaş</div>
                  </div>
                </div>
              )}

              {/* Filtre & Sayfalama Üst Barı */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label htmlFor="savas-filtre" style={{ fontSize: 13.5, opacity: 0.78, fontWeight: 600 }}>
                    Filtrele:
                  </label>
                  <select
                    id="savas-filtre"
                    value={savasFiltre}
                    onChange={(e) => {
                      setSavasFiltre(e.target.value as "hepsi" | "win" | "lose" | "detayli");
                      setArsivSayfa(1);
                    }}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <option value="hepsi">📋 Tüm Savaşlar ({tumGecmisSavaslar.length})</option>
                    <option value="win">🟢 Sadece Galibiyetler</option>
                    <option value="lose">🔴 Sadece Mağlubiyetler</option>
                    <option value="detayli">📊 Oyuncu Detaylı Kayıtlar</option>
                  </select>
                </div>

                {toplamSayfa > 1 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      disabled={guvenliSayfa <= 1}
                      onClick={() => setArsivSayfa((p) => Math.max(1, p - 1))}
                      style={{
                        padding: "8px 14px",
                        minHeight: 38,
                        borderRadius: 9,
                        border: "1px solid var(--cizgi)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: guvenliSayfa <= 1 ? "not-allowed" : "pointer",
                        opacity: guvenliSayfa <= 1 ? 0.45 : 1,
                      }}
                    >
                      ← Önceki
                    </button>
                    <span style={{ fontSize: 13.5, fontWeight: 700, padding: "0 6px" }}>
                      Sayfa {guvenliSayfa} / {toplamSayfa}
                    </span>
                    <button
                      type="button"
                      disabled={guvenliSayfa >= toplamSayfa}
                      onClick={() => setArsivSayfa((p) => Math.min(toplamSayfa, p + 1))}
                      style={{
                        padding: "8px 14px",
                        minHeight: 38,
                        borderRadius: 9,
                        border: "1px solid var(--cizgi)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: guvenliSayfa >= toplamSayfa ? "not-allowed" : "pointer",
                        opacity: guvenliSayfa >= toplamSayfa ? 0.45 : 1,
                      }}
                    >
                      Sonraki →
                    </button>
                  </div>
                )}
              </div>

              {/* Savaş Listesi */}
              {savasYukleniyor ? (
                <p style={{ opacity: 0.72, textAlign: "center", padding: 24 }}>⏳ Savaş geçmişi yükleniyor...</p>
              ) : savas?.gecmisGizli && tumGecmisSavaslar.length === 0 ? (
                <p style={{ opacity: 0.75, textAlign: "center", padding: 24 }}>
                  🔒 Bu klanın savaş günlüğü oyun içi ayarlardan gizli tutuluyor.
                </p>
              ) : sayfaSavaslari.length === 0 ? (
                <p style={{ opacity: 0.75, textAlign: "center", padding: 24 }}>
                  Bu filtreye uygun savaş kaydı bulunamadı.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sayfaSavaslari.map((g) => {
                    const galibiyet = g.sonuc === "win";
                    const maglubiyet = g.sonuc === "lose";
                    const renk = galibiyet ? "#22c55e" : maglubiyet ? "#ef6b5f" : "var(--vurgu)";
                    const etiket = galibiyet ? "GALİBİYET" : maglubiyet ? "MAĞLUBİYET" : "BERABERLİK";

                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSeciliGecmisSavas(g);
                          setDetaySadeceBiz(false);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 13,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                          borderLeft: `4px solid ${renk}`,
                          color: "var(--fg)",
                          cursor: "pointer",
                          display: "grid",
                          gridTemplateColumns: "minmax(105px, auto) 1fr auto auto auto",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 900, color: renk, letterSpacing: "0.4px" }}>
                            {etiket}
                          </span>
                          <span style={{ fontSize: 12, opacity: 0.7 }}>
                            {g.takimBoyutu > 0 ? `${g.takimBoyutu}v${g.takimBoyutu}` : "Savaş"}{" "}
                            {g.bitisTarihi ? `· ${savasTarihiFormatla(g.bitisTarihi)}` : ""}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          {g.rakipRozet && (
                            <img src={g.rakipRozet} alt="" width={32} height={32} style={{ flexShrink: 0 }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 15,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              vs {g.rakipAdi}
                            </div>
                            {g.rakipTag && <div style={{ fontSize: 11.5, opacity: 0.6 }}>{g.rakipTag}</div>}
                          </div>
                        </div>

                        <div
                          style={{
                            fontFamily: "var(--font-geist-mono), monospace",
                            fontSize: 16,
                            fontWeight: 900,
                            padding: "5px 12px",
                            borderRadius: 9,
                            background: "var(--kart)",
                            border: "1px solid var(--cizgi)",
                            color: renk,
                            whiteSpace: "nowrap",
                          }}
                        >
                          ⭐ {g.bizimYildiz} - {g.rakipYildiz}
                        </div>

                        <div style={{ fontSize: 12.5, opacity: 0.82, textAlign: "right", whiteSpace: "nowrap" }}>
                          <div>Biz: <strong>%{g.bizimYuzde}</strong></div>
                          <div>Rakip: %{g.rakipYuzde}</div>
                        </div>

                        <span
                          style={{
                            padding: "4px 9px",
                            borderRadius: 8,
                            fontSize: 11.5,
                            fontWeight: 800,
                            border: "1px solid " + (g.detayli ? "var(--vurgu)" : "var(--cizgi)"),
                            background: g.detayli
                              ? "color-mix(in srgb, var(--vurgu) 16%, var(--kart))"
                              : "var(--kart)",
                            color: g.detayli ? "var(--vurgu)" : "var(--fg)",
                            opacity: g.detayli ? 1 : 0.72,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {g.detayli ? "📊 Detaylı" : "İncele →"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Alt Sayfalama */}
              {toplamSayfa > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, paddingTop: 6 }}>
                  <button
                    type="button"
                    disabled={guvenliSayfa <= 1}
                    onClick={() => setArsivSayfa((p) => Math.max(1, p - 1))}
                    style={{
                      padding: "8px 16px",
                      minHeight: 38,
                      borderRadius: 9,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: guvenliSayfa <= 1 ? "not-allowed" : "pointer",
                      opacity: guvenliSayfa <= 1 ? 0.45 : 1,
                    }}
                  >
                    ← Önceki 20
                  </button>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>
                    Sayfa {guvenliSayfa} / {toplamSayfa}
                  </span>
                  <button
                    type="button"
                    disabled={guvenliSayfa >= toplamSayfa}
                    onClick={() => setArsivSayfa((p) => Math.min(toplamSayfa, p + 1))}
                    style={{
                      padding: "8px 16px",
                      minHeight: 38,
                      borderRadius: 9,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: guvenliSayfa >= toplamSayfa ? "not-allowed" : "pointer",
                      opacity: guvenliSayfa >= toplamSayfa ? 0.45 : 1,
                    }}
                  >
                    Sonraki 20 →
                  </button>
                </div>
              )}
            </section>
          )}

          {/* SEKME B: KLAN SAVAŞ LİGİ (CWL) YIL & AY ARŞİVİ */}
          {arsivSekme === "cwl" && (
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
              <h2 className="baslik-serit" style={{ marginTop: 0, marginBottom: 4 }}>
                <span>🏆 Klan Savaş Ligi (CWL) Arşivi</span>
              </h2>

              {cwlArsivi.length === 0 ? (
                <div
                  style={{
                    padding: 28,
                    borderRadius: 14,
                    background: "var(--bg)",
                    border: "1px dashed var(--cizgi)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <strong style={{ fontSize: 17 }}>Henüz Arşivlenmiş CWL Sezonu Yok</strong>
                  <p style={{ margin: 0, fontSize: 14, opacity: 0.78, lineHeight: 1.6, maxWidth: 640, alignSelf: "center" }}>
                    Supercell API geçmiş ayların CWL verilerini tutmaz. Bu klan aktif bir CWL haftasında sorgulandığı anda, o sezonun 8 klanlık puan durumu, tüm tur maçları ve oyuncu yıldız sıralaması buraya yıl ve ay bazında kalıcı olarak kaydedilir.
                  </p>
                </div>
              ) : (
                <>
                  {/* Yıl & Ay Seçici Barı */}
                  <div
                    style={{
                      padding: 14,
                      borderRadius: 13,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <label htmlFor="cwl-yil" style={{ fontSize: 13.5, fontWeight: 700, opacity: 0.8 }}>
                        Yıl:
                      </label>
                      <select
                        id="cwl-yil"
                        value={aktifCwlYil ?? ""}
                        onChange={(e) => {
                          const yeniYil = Number(e.target.value);
                          setSeciliCwlYil(yeniYil);
                          const ilkSezon = cwlArsivi.find((c) => c.yil === yeniYil)?.sezon ?? "";
                          setSeciliCwlSezon(ilkSezon);
                          setCwlTurFiltre("hepsi");
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: "1px solid var(--cizgi)",
                          background: "var(--kart)",
                          color: "var(--fg)",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {cwlYillari.map((y) => (
                          <option key={y} value={y}>
                            📅 {y}
                          </option>
                        ))}
                      </select>

                      <label htmlFor="cwl-ay" style={{ fontSize: 13.5, fontWeight: 700, opacity: 0.8, marginLeft: 6 }}>
                        Sezon (Ay):
                      </label>
                      <select
                        id="cwl-ay"
                        value={aktifCwlKaydi?.sezon ?? ""}
                        onChange={(e) => {
                          setSeciliCwlSezon(e.target.value);
                          setCwlTurFiltre("hepsi");
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: "1px solid var(--cizgi)",
                          background: "var(--kart)",
                          color: "var(--fg)",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {yilCwlKayitlari.map((c) => (
                          <option key={c.sezon} value={c.sezon}>
                            🏆 {AY_ADLARI[c.ay] || c.ay} {c.yil} ({c.takimBoyutu}v{c.takimBoyutu})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Alt Görünüm Seçici */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(
                        [
                          { id: "grup", ad: "🏆 8 Klan Sıralaması" },
                          { id: "yildiz", ad: "⭐ Oyuncu Yıldızları" },
                          { id: "maclar", ad: "⚔️ Tur Maçları" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCwlAltSekme(tab.id)}
                          style={{
                            padding: "8px 14px",
                            minHeight: 38,
                            borderRadius: 9,
                            border: "1px solid " + (cwlAltSekme === tab.id ? "var(--vurgu)" : "var(--cizgi)"),
                            background: cwlAltSekme === tab.id ? "var(--vurgu)" : "var(--kart)",
                            color: cwlAltSekme === tab.id ? "#111" : "var(--fg)",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {tab.ad}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CWL ALT SEKME 1: 8 KLAN PUAN DURUMU */}
                  {aktifCwlKaydi && cwlAltSekme === "grup" && (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14.5, textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                            <th style={{ padding: "11px 10px" }}>Sıra</th>
                            <th style={{ padding: "11px 10px" }}>Klan</th>
                            <th style={{ padding: "11px 10px" }}>Galibiyet</th>
                            <th style={{ padding: "11px 10px" }}>Toplam Yıldız</th>
                            <th style={{ padding: "11px 10px" }}>Toplam Yıkım</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aktifCwlKaydi.grupKlanlari.map((g, i) => (
                            <tr
                              key={g.tag}
                              style={{
                                borderBottom: "1px solid var(--cizgi)",
                                background: g.tag === klan.kod ? "rgba(245, 197, 66, 0.1)" : "transparent",
                              }}
                            >
                              <td style={{ padding: "11px 10px", fontWeight: 800 }}>
                                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                              </td>
                              <td style={{ padding: "11px 10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  {g.rozet && <img src={g.rozet} alt="" width={30} height={30} />}
                                  <Link
                                    href={"/klanlar?kod=" + g.tag.replace(/^#/, "")}
                                    style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700 }}
                                  >
                                    {g.name} ↗
                                  </Link>
                                </div>
                              </td>
                              <td style={{ padding: "11px 10px", fontWeight: 700, color: "#22c55e" }}>{g.galibiyet}</td>
                              <td style={{ padding: "11px 10px", fontWeight: 800, color: "var(--vurgu)" }}>⭐ {g.yildiz}</td>
                              <td style={{ padding: "11px 10px" }}>%{g.yuzde.toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CWL ALT SEKME 2: TURNUVA OYUNCU YILDIZ LİDERLİĞİ */}
                  {aktifCwlKaydi && cwlAltSekme === "yildiz" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={cwlSadeceBiz}
                            onChange={(e) => setCwlSadeceBiz(e.target.checked)}
                          />
                          Sadece {klan.isim} oyuncularını göster
                        </label>
                      </div>

                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                              <th style={{ padding: "10px 8px" }}>Sıra</th>
                              <th style={{ padding: "10px 8px" }}>Oyuncu</th>
                              <th style={{ padding: "10px 8px" }}>Klan</th>
                              <th style={{ padding: "10px 8px" }}>Saldırı</th>
                              <th style={{ padding: "10px 8px" }}>Toplam Yıldız</th>
                              <th style={{ padding: "10px 8px" }}>Toplam Yıkım</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cwlOyuncular.map((o, idx) => (
                              <tr
                                key={o.tag + idx}
                                style={{
                                  borderBottom: "1px solid var(--cizgi)",
                                  background: o.bizimKlan ? "rgba(245, 197, 66, 0.08)" : "transparent",
                                }}
                              >
                                <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                                </td>
                                <td style={{ padding: "10px 8px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <BbGorsel seviye={o.bbSeviyesi} boyut={26} />
                                    <Link
                                      href={"/?kod=" + o.tag.replace(/^#/, "")}
                                      style={{ color: "var(--fg)", textDecoration: "none", fontWeight: 700 }}
                                    >
                                      {o.isim}
                                    </Link>
                                  </div>
                                </td>
                                <td style={{ padding: "10px 8px", fontSize: 13, opacity: 0.8 }}>{o.klanAdi}</td>
                                <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                                  {o.saldiriSayisi}/{o.maksSaldiri}
                                </td>
                                <td style={{ padding: "10px 8px", fontWeight: 800, color: "var(--vurgu)" }}>
                                  ⭐ {o.toplamYildiz}
                                </td>
                                <td style={{ padding: "10px 8px", fontSize: 13 }}>%{o.toplamYuzde.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CWL ALT SEKME 3: TUR MAÇLARI */}
                  {aktifCwlKaydi && cwlAltSekme === "maclar" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                        <label htmlFor="cwl-tur" style={{ fontSize: 13.5, opacity: 0.78, fontWeight: 600 }}>
                          Tur Seç:
                        </label>
                        <select
                          id="cwl-tur"
                          value={cwlTurFiltre}
                          onChange={(e) => setCwlTurFiltre(e.target.value)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 9,
                            border: "1px solid var(--cizgi)",
                            background: "var(--bg)",
                            color: "var(--fg)",
                            fontSize: 13.5,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <option value="hepsi">Tüm Turlar</option>
                          {cwlTurlari.map((t) => (
                            <option key={t} value={String(t)}>
                              Tur {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
                        {cwlFiltreliMaclar.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: 14,
                              borderRadius: 12,
                              background: "var(--bg)",
                              border:
                                m.klan1.tag === klan.kod || m.klan2.tag === klan.kod
                                  ? "1.5px solid var(--vurgu)"
                                  : "1px solid var(--cizgi)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 11.5, opacity: 0.68, fontWeight: 700 }}>
                              Tur {m.tur} · {m.durum === "inWar" ? "🔴 Canlı" : m.durum === "warEnded" ? "✅ Bitti" : "⏳ Hazırlık"}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {m.klan1.rozet && <img src={m.klan1.rozet} alt="" width={22} height={22} />}
                                {m.klan1.name}
                              </span>
                              <span>⭐ {m.klan1.stars} (%{m.klan1.destructionPercentage})</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {m.klan2.rozet && <img src={m.klan2.rozet} alt="" width={22} height={22} />}
                                {m.klan2.name}
                              </span>
                              <span>⭐ {m.klan2.stars} (%{m.klan2.destructionPercentage})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      )}

      {/* ============================================================
          GEÇMİŞ SAVAŞ DETAY PENCERESİ (MODAL)
      ============================================================ */}
      {seciliGecmisSavas && (
        <div
          onClick={() => setSeciliGecmisSavas(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 940,
              maxHeight: "88vh",
              overflowY: "auto",
              background: "var(--kart)",
              border: "1.5px solid var(--vurgu)",
              borderRadius: 18,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22 }}>⚔️ Savaş Detayı</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75 }}>
                  {seciliGecmisSavas.takimBoyutu > 0 ? `${seciliGecmisSavas.takimBoyutu}v${seciliGecmisSavas.takimBoyutu}` : "Klan Savaşı"}{" "}
                  {seciliGecmisSavas.bitisTarihi ? `· ${savasTarihiFormatla(seciliGecmisSavas.bitisTarihi)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSeciliGecmisSavas(null)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕ Kapat
              </button>
            </div>

            {/* Skor Panosu */}
            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ textAlign: "center" }}>
                {(seciliGecmisSavas.bizimRozet || klan?.rozet) && (
                  <img src={seciliGecmisSavas.bizimRozet || klan?.rozet || ""} alt="" width={54} height={54} />
                )}
                <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>
                  {seciliGecmisSavas.bizimAdi || klan?.isim}
                </div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>%{seciliGecmisSavas.bizimYuzde} Yıkım</div>
              </div>

              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 30,
                  fontWeight: 900,
                  color:
                    seciliGecmisSavas.sonuc === "win"
                      ? "#22c55e"
                      : seciliGecmisSavas.sonuc === "lose"
                      ? "#ef6b5f"
                      : "var(--vurgu)",
                }}
              >
                ⭐ {seciliGecmisSavas.bizimYildiz} : {seciliGecmisSavas.rakipYildiz} ⭐
              </div>

              <div style={{ textAlign: "center" }}>
                {seciliGecmisSavas.rakipRozet && (
                  <img src={seciliGecmisSavas.rakipRozet} alt="" width={54} height={54} />
                )}
                <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>
                  {seciliGecmisSavas.rakipTag ? (
                    <Link
                      href={`/klanlar?kod=${seciliGecmisSavas.rakipTag.replace(/^#/, "")}`}
                      onClick={() => setSeciliGecmisSavas(null)}
                      style={{ color: "var(--vurgu)", textDecoration: "none" }}
                    >
                      {seciliGecmisSavas.rakipAdi} ↗
                    </Link>
                  ) : (
                    seciliGecmisSavas.rakipAdi
                  )}
                </div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>%{seciliGecmisSavas.rakipYuzde} Yıkım</div>
              </div>
            </div>

            {/* Oyuncu Yıldız Tablosu (Arşivlenmişse) */}
            {seciliGecmisSavas.detayli &&
            seciliGecmisSavas.oyuncuSiralamasi &&
            seciliGecmisSavas.oyuncuSiralamasi.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <strong style={{ fontSize: 16 }}>⭐ Oyuncu Performans Tablosu</strong>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={detaySadeceBiz}
                      onChange={(e) => setDetaySadeceBiz(e.target.checked)}
                    />
                    Sadece {klan?.isim} üyelerini göster
                  </label>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                        <th style={{ padding: "10px 8px" }}>Sıra</th>
                        <th style={{ padding: "10px 8px" }}>Oyuncu</th>
                        <th style={{ padding: "10px 8px" }}>Klan</th>
                        <th style={{ padding: "10px 8px" }}>Saldırı</th>
                        <th style={{ padding: "10px 8px" }}>Yıldız</th>
                        <th style={{ padding: "10px 8px" }}>Yıkım</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seciliGecmisSavas.oyuncuSiralamasi
                        .filter((o) => (detaySadeceBiz ? o.bizimKlan : true))
                        .map((o, idx) => (
                          <tr
                            key={o.tag + idx}
                            style={{
                              borderBottom: "1px solid var(--cizgi)",
                              background: o.bizimKlan ? "rgba(245, 197, 66, 0.07)" : "transparent",
                            }}
                          >
                            <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                            </td>
                            <td style={{ padding: "10px 8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <BbGorsel seviye={o.bbSeviyesi} boyut={26} />
                                <span style={{ fontWeight: 700 }}>{o.isim}</span>
                              </div>
                            </td>
                            <td style={{ padding: "10px 8px", fontSize: 13, opacity: 0.8 }}>{o.klanAdi}</td>
                            <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                              {o.saldiriSayisi}/{o.maksSaldiri}
                            </td>
                            <td style={{ padding: "10px 8px", fontWeight: 800, color: "var(--vurgu)" }}>
                              ⭐ {o.toplamYildiz}
                            </td>
                            <td style={{ padding: "10px 8px", fontSize: 13 }}>%{o.toplamYuzde.toFixed(1)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: "var(--bg)",
                  border: "1px dashed var(--cizgi)",
                  fontSize: 13.5,
                  opacity: 0.82,
                  lineHeight: 1.6,
                }}
              >
                ℹ️ Bu savaş Supercell geçmiş özetinden (`/warlog`) çekildiği için bireysel oyuncu saldırılarını içermez. Bundan sonra canlı olarak takip edilen her savaş otomatik olarak tam oyuncu yıldız tablosuyla arşivlenecektir.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          CANLI SAVAŞ & CWL İNCELEME PENCERESİ (MODAL)
      ============================================================ */}
      {savasPencereAcik && savas?.aktif && (
        <div
          onClick={() => setSavasPencereAcik(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 980,
              maxHeight: "88vh",
              overflowY: "auto",
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 18,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Pencere Üst Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22 }}>
                  {savas.tur === "cwl" ? `🏆 Klan Savaş Ligi (${savas.sezon ?? ""})` : "⚔️ Canlı Klan Savaşı"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75 }}>
                  Oyuncu yıldız sıralamasını ve savaş sonuçlarını canlı olarak incele
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSavasPencereAcik(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕ Kapat
              </button>
            </div>

            {/* Karşılaşma Skor Panosu */}
            {savas.bizimKlan && savas.rakipKlan && (
              <div
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  {savas.bizimKlan.rozet && <img src={savas.bizimKlan.rozet} alt="" width={54} height={54} />}
                  <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{savas.bizimKlan.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>%{savas.bizimKlan.destructionPercentage.toFixed(1)} Yıkım</div>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 30,
                    fontWeight: 900,
                    color: "var(--vurgu)",
                  }}
                >
                  ⭐ {savas.bizimKlan.stars} : {savas.rakipKlan.stars} ⭐
                </div>

                <div style={{ textAlign: "center" }}>
                  {savas.rakipKlan.rozet && <img src={savas.rakipKlan.rozet} alt="" width={54} height={54} />}
                  <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{savas.rakipKlan.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>%{savas.rakipKlan.destructionPercentage.toFixed(1)} Yıkım</div>
                </div>
              </div>
            )}

            {/* Sekme Seçimi */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSavasSekme("yildiz")}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1px solid " + (savasSekme === "yildiz" ? "var(--vurgu)" : "var(--cizgi)"),
                    background: savasSekme === "yildiz" ? "var(--vurgu)" : "var(--bg)",
                    color: savasSekme === "yildiz" ? "#111" : "var(--fg)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ⭐ Oyuncu Yıldız Sıralaması
                </button>
                {savas.tur === "cwl" && (
                  <button
                    type="button"
                    onClick={() => setSavasSekme("grup")}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 10,
                      border: "1px solid " + (savasSekme === "grup" ? "var(--vurgu)" : "var(--cizgi)"),
                      background: savasSekme === "grup" ? "var(--vurgu)" : "var(--bg)",
                      color: savasSekme === "grup" ? "#111" : "var(--fg)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🏆 Lig Grubu &amp; Diğer 7 Klan ({savas.grupKlanlari?.length ?? 8})
                  </button>
                )}
              </div>

              {savasSekme === "yildiz" && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={sadeceBizimKlan}
                    onChange={(e) => setSadeceBizimKlan(e.target.checked)}
                  />
                  Sadece {klan?.isim} üyelerini göster
                </label>
              )}
            </div>

            {/* Sekme 1: Oyuncu Yıldız Sıralaması */}
            {savasSekme === "yildiz" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                      <th style={{ padding: "10px 8px" }}>Sıra</th>
                      <th style={{ padding: "10px 8px" }}>Oyuncu</th>
                      <th style={{ padding: "10px 8px" }}>Klan</th>
                      <th style={{ padding: "10px 8px" }}>Saldırı</th>
                      <th style={{ padding: "10px 8px" }}>Toplam Yıldız</th>
                      <th style={{ padding: "10px 8px" }}>Yıkım</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrelenmisYildizlar.map((o, idx) => (
                      <tr
                        key={o.tag + idx}
                        style={{
                          borderBottom: "1px solid var(--cizgi)",
                          background: o.bizimKlan ? "rgba(245, 197, 66, 0.06)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <BbGorsel seviye={o.bbSeviyesi} boyut={26} />
                            <span style={{ fontWeight: 700 }}>{o.isim}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 8px", fontSize: 13, opacity: 0.8 }}>{o.klanAdi}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                          {o.saldiriSayisi}/{o.maksSaldiri}
                        </td>
                        <td style={{ padding: "10px 8px", fontWeight: 800, color: o.toplamYildiz > 0 ? "var(--vurgu)" : "inherit" }}>
                          ⭐ {o.toplamYildiz}
                        </td>
                        <td style={{ padding: "10px 8px", fontSize: 13 }}>%{o.toplamYuzde.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sekme 2: CWL 8 Klanlık Grup Sıralaması ve Tur Maçları */}
            {savasSekme === "grup" && savas.tur === "cwl" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                        <th style={{ padding: "10px 8px" }}>#</th>
                        <th style={{ padding: "10px 8px" }}>Klan</th>
                        <th style={{ padding: "10px 8px" }}>Galibiyet</th>
                        <th style={{ padding: "10px 8px" }}>Toplam Yıldız</th>
                        <th style={{ padding: "10px 8px" }}>Toplam Yıkım</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(savas.grupKlanlari ?? []).map((g, i) => (
                        <tr
                          key={g.tag}
                          style={{
                            borderBottom: "1px solid var(--cizgi)",
                            background: g.tag === klan?.kod ? "rgba(245, 197, 66, 0.1)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px 8px", fontWeight: 800 }}>{i + 1}</td>
                          <td style={{ padding: "10px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {g.rozet && <img src={g.rozet} alt="" width={28} height={28} />}
                              <Link
                                href={"/klanlar?kod=" + g.tag.replace(/^#/, "")}
                                onClick={() => setSavasPencereAcik(false)}
                                style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700 }}
                              >
                                {g.name} ↗
                              </Link>
                            </div>
                          </td>
                          <td style={{ padding: "10px 8px", fontWeight: 700, color: "#22c55e" }}>{g.galibiyet}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 800 }}>⭐ {g.yildiz}</td>
                          <td style={{ padding: "10px 8px" }}>%{g.yuzde.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {savas.tumMaclar && savas.tumMaclar.length > 0 && (
                  <div>
                    <h4 style={{ margin: "0 0 10px", fontSize: 16 }}>Tur Karşılaşmaları</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                      {savas.tumMaclar.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: "var(--bg)",
                            border: "1px solid var(--cizgi)",
                            fontSize: 13,
                          }}
                        >
                          <div style={{ opacity: 0.65, fontSize: 11, marginBottom: 6 }}>
                            Tur {m.tur} · {m.durum === "inWar" ? "🔴 Canlı" : m.durum === "warEnded" ? "✅ Bitti" : "⏳ Hazırlık"}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>{m.klan1.name}</span>
                            <span>⭐ {m.klan1.stars}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 4 }}>
                            <span>{m.klan2.name}</span>
                            <span>⭐ {m.klan2.stars}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function KlanlarSayfasi() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Yükleniyor...</main>}>
      <KlanlarIcerik />
    </Suspense>
  );
}
"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { tr } from "./isimler";
import { supabase } from "./supabase";
import { gercekAzami } from "./thSinirlari";
import { gorselYolu } from "./gorseller";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Parca = {
  isim: string;
  seviye: number;
  azami: number;
  aktifEkipmanlar?: { isim: string; seviye: number; azami: number }[];
};

type Oyuncu = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  klanKod?: string | null;
  klanRozet?: string | null;
  ligAdi?: string | null;
  ligIkonu?: string | null;
  kahramanlar: Parca[];
  birlikler: Parca[];
  buyuler: Parca[];
  ekipmanlar: Parca[];
};

type SekmeTipi = "kahramanlar" | "ekipmanlar" | "birlikler" | "buyuler" | "petler" | "super";

const PETLER = [
  "L.A.S.S.I", "Mighty Yak", "Electro Owl", "Unicorn", "Phoenix",
  "Poison Lizard", "Diggy", "Frosty", "Spirit Fox", "Angry Jelly",
  "Sneezy", "Greedy Raven",
];
const SUPER_EK = ["Sneaky Goblin", "Rocket Balloon", "Inferno Dragon", "Ice Hound"];

const superMi = (p: Parca) => p.isim.startsWith("Super ") || SUPER_EK.includes(p.isim);

const VITRIN_KARTLARI = [
  {
    href: "/hesaplayici",
    ikon: "🧱",
    baslik: "Duvar & Süre Hesaplayıcı",
    aciklama: "Altın Bilet indirimi, inşaat süresi ve yeşil taş maliyetlerini anında hesapla.",
  },
  {
    href: "/ansiklopedi",
    ikon: "📖",
    baslik: "Kapsamlı Oyun Rehberi",
    aciklama: "6 Kahraman, 9 Kuşatma Makinesi, birlikler, büyüler ve savunmaların taktik ipuçları.",
  },
  {
    href: "/klanlar",
    ikon: "🛡️",
    baslik: "Klan & Savaş Analizi",
    aciklama: "Klan etiketini gir; savaş serisini, BB dağılımını ve üye listesini tek tıkla incele.",
  },
  {
    href: "/ordular",
    ikon: "⚔️",
    baslik: "Meta Ordular & Taktikler",
    aciklama: "Belediye Binana uygun en güncel 3 yıldız ordularını ve Sargyt özel taktiklerini keşfet.",
  },
];

function yuzde(liste: Parca[]) {
  const s = liste.reduce((t, p) => t + p.seviye, 0);
  const m = liste.reduce((t, p) => t + p.azami, 0);
  return m ? Math.round((s / m) * 100) : 0;
}

function KahramanKarti({ p }: { p: Parca }) {
  const tamamlandi = p.seviye >= p.azami;
  const oran = Math.min(100, Math.round((p.seviye / p.azami) * 100));

  return (
    <div
      style={{
        padding: 18,
        background: "var(--bg)",
        border: `2px solid ${tamamlandi ? "var(--vurgu)" : "var(--cizgi)"}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img
          src={gorselYolu(p.isim)}
          alt={tr(p.isim)}
          width={76}
          height={76}
          style={{
            borderRadius: 14,
            objectFit: "cover",
            flexShrink: 0,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{tr(p.isim)}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
            <span style={{ color: tamamlandi ? "#22c55e" : "var(--vurgu)" }}>
              Seviye {p.seviye} / {p.azami}
            </span>
            <span style={{ opacity: 0.7 }}>%{oran}</span>
          </div>
          <div style={{ height: 8, background: "var(--cizgi)", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
            <div
              style={{
                height: "100%",
                width: oran + "%",
                background: tamamlandi ? "#22c55e" : "var(--vurgu)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Aktif Kullanılan Ekipmanlar */}
      <div
        style={{
          borderTop: "1px solid var(--cizgi)",
          paddingTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>🛡️ Aktif Ekipmanlar</span>
        {p.aktifEkipmanlar && p.aktifEkipmanlar.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {p.aktifEkipmanlar.map((ek) => (
              <div
                key={ek.isim}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 10,
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                }}
              >
                <img
                  src={gorselYolu(ek.isim)}
                  alt={tr(ek.isim)}
                  width={30}
                  height={30}
                  style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tr(ek.isim).split(" (")[0]}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>
                    Sv. {ek.seviye}/{ek.azami}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, opacity: 0.6 }}>Aktif ekipman verisi yok</span>
        )}
      </div>
    </div>
  );
}

function SuperBirlikKarti({ p }: { p: Parca }) {
  const aktif = p.seviye > 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: "var(--bg)",
        border: aktif ? "2px solid #f59e0b" : "1px solid var(--cizgi)",
        boxShadow: aktif ? "0 0 14px rgba(245, 158, 11, 0.28)" : "none",
        borderRadius: 14,
        opacity: aktif ? 1 : 0.6,
      }}
    >
      <img
        src={gorselYolu(p.isim)}
        alt={tr(p.isim)}
        width={48}
        height={48}
        style={{
          borderRadius: 10,
          objectFit: "cover",
          flexShrink: 0,
          border: aktif ? "1px solid #f59e0b" : "1px solid var(--cizgi)",
        }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{tr(p.isim)}</div>
        {aktif && (
          <span
            style={{
              display: "inline-block",
              marginTop: 4,
              fontSize: 11,
              fontWeight: 800,
              color: "#f59e0b",
            }}
          >
            ★ Şu An Aktif
          </span>
        )}
      </div>
    </div>
  );
}

function BirimKarti({ p }: { p: Parca }) {
  const tamamlandi = p.seviye >= p.azami;
  const oran = Math.min(100, Math.round((p.seviye / p.azami) * 100));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: "var(--bg)",
        border: `1px solid ${tamamlandi ? "var(--vurgu)" : "var(--cizgi)"}`,
        borderRadius: 12,
      }}
    >
      <img
        src={gorselYolu(p.isim)}
        alt={tr(p.isim)}
        width={44}
        height={44}
        style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {tr(p.isim)}
          </span>
          <span style={{ opacity: 0.85, marginLeft: 6 }}>
            {p.seviye}/{p.azami}
          </span>
        </div>
        <div style={{ height: 6, background: "var(--cizgi)", borderRadius: 6, overflow: "hidden", marginTop: 7 }}>
          <div
            style={{
              height: "100%",
              width: oran + "%",
              background: tamamlandi ? "#22c55e" : "var(--vurgu)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oyuncu, setOyuncu] = useState<Oyuncu | null>(null);
  const [favoriEklendi, setFavoriEklendi] = useState(false);
  const [favoriMesaj, setFavoriMesaj] = useState("");
  const [aktifSekme, setAktifSekme] = useState<SekmeTipi>("kahramanlar");

  async function favoriyeEkle(o: Oyuncu) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { error } = await supabase
        .from("favoriler")
        .insert({ kod: o.kod, isim: o.isim.slice(0, 40) });
      if (error) {
        setFavoriMesaj(error.code === "23505" ? "Zaten favorilerinde kayıtlı." : "Kaydedilemedi.");
      } else {
        setFavoriEklendi(true);
        setFavoriMesaj("Hesabındaki favorilere eklendi!");
      }
      return;
    }
    try {
      const eski = JSON.parse(localStorage.getItem("favoriler") || "[]");
      const liste: { kod: string; isim: string }[] = Array.isArray(eski) ? eski : [];
      if (liste.some((f) => f.kod === o.kod)) {
        setFavoriMesaj("Zaten favorilerinde kayıtlı.");
        return;
      }
      liste.push({ kod: o.kod, isim: o.isim });
      localStorage.setItem("favoriler", JSON.stringify(liste));
      setFavoriEklendi(true);
      setFavoriMesaj("Favorilere eklendi! Tüm cihazlarda saklamak için giriş yapabilirsin.");
    } catch {
      setFavoriMesaj("Kaydedilemedi.");
    }
  }

  function veriyiIsle(veri: Oyuncu) {
    setOyuncu({
      ...veri,
      kahramanlar: veri.kahramanlar.map((k: Parca) => ({
        ...k,
        azami: gercekAzami(veri.thSeviyesi, k.isim, k.azami),
      })),
      birlikler: veri.birlikler.map((b: Parca) => ({
        ...b,
        azami: gercekAzami(veri.thSeviyesi, b.isim, b.azami),
      })),
      buyuler: veri.buyuler.map((s: Parca) => ({
        ...s,
        azami: gercekAzami(veri.thSeviyesi, s.isim, s.azami),
      })),
    });
    setAktifSekme("kahramanlar");
  }

  async function ara(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setOyuncu(null);
    setFavoriEklendi(false);
    setFavoriMesaj("");
    if (!KOD_KURALI.test(temiz)) {
      setHata("Geçersiz köy kodu. Örnek: #2PP0Y8L");
      return;
    }
    setHata("");
    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/oyuncu?kod=" + temiz);
      const veri = await yanit.json();
      if (!yanit.ok) {
        setHata(veri.hata ?? "Bir sorun oluştu");
      } else {
        veriyiIsle(veri);
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKod = params.get("kod");
    if (urlKod) {
      const temiz = urlKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
      setKod("#" + temiz);
      if (KOD_KURALI.test(temiz)) {
        setHata("");
        setYukleniyor(true);
        fetch("/api/oyuncu?kod=" + temiz)
          .then(async (yanit) => {
            const veri = await yanit.json();
            if (!yanit.ok) {
              setHata(veri.hata ?? "Bir sorun oluştu");
            } else {
              veriyiIsle(veri);
            }
          })
          .catch(() => setHata("Bağlantı hatası, tekrar dene."))
          .finally(() => setYukleniyor(false));
      }
    }
  }, []);

  const normal = oyuncu ? oyuncu.birlikler.filter((p) => !superMi(p) && !PETLER.includes(p.isim)) : [];
  const petler = oyuncu ? oyuncu.birlikler.filter((p) => PETLER.includes(p.isim)) : [];
  const supers = oyuncu ? oyuncu.birlikler.filter(superMi) : [];
  const hepsi = oyuncu
    ? [...oyuncu.kahramanlar, ...oyuncu.ekipmanlar, ...normal, ...petler, ...oyuncu.buyuler]
    : [];

  const enCokEksikler = hepsi
    .filter((p) => p.seviye < p.azami)
    .sort((a, b) => b.azami - b.seviye - (a.azami - a.seviye))
    .slice(0, 5);

  const sekmeler: { id: SekmeTipi; etiket: string; liste: Parca[] }[] = oyuncu
    ? [
        { id: "kahramanlar", etiket: `👑 Kahramanlar (${oyuncu.kahramanlar.length})`, liste: oyuncu.kahramanlar },
        { id: "birlikler", etiket: `⚔️ Birlikler (${normal.length})`, liste: normal },
        { id: "buyuler", etiket: `⚡ Büyüler (${oyuncu.buyuler.length})`, liste: oyuncu.buyuler },
        { id: "ekipmanlar", etiket: `🛡️ Ekipmanlar (${oyuncu.ekipmanlar.length})`, liste: oyuncu.ekipmanlar },
        { id: "petler", etiket: `🐾 Hayvanlar (${petler.length})`, liste: petler },
        ...(supers.length > 0 ? [{ id: "super" as SekmeTipi, etiket: `✨ Süper Birlikler (${supers.length})`, liste: supers }] : []),
      ]
    : [];

  const seciliSekmeVerisi = sekmeler.find((s) => s.id === aktifSekme) ?? sekmeler[0];

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST ARAMA BÖLÜMÜ */}
      <section
        style={{
          padding: "28px 32px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 28,
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px" }}>Köyünü Analiz Et</h1>
        <p style={{ opacity: 0.75, margin: "0 0 20px", fontSize: 16 }}>
          Köy kodunu gir; kahramanlarını, aktif ekipmanlarını, birlik seviyelerini ve öncelikli eksiklerini tam ekran incele.
        </p>

        <form onSubmit={ara} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="Köy kodu girin, örn: #2PP0Y8L"
            maxLength={14}
            aria-label="Köy kodu"
            style={{
              flex: 1,
              minWidth: 240,
              padding: "14px 18px",
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
              padding: "14px 32px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "#111",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "Analiz Ediliyor..." : "🔍 Köyü Analiz Et"}
          </button>
        </form>

        {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}
      </section>

      {/* HENÜZ KÖY ARANMADIYSA: HIZLI ERİŞİM VİTRİN KARTLARI */}
      {!oyuncu && !yukleniyor && (
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>🚀 Hızlı Erişim & Araçlar</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {VITRIN_KARTLARI.map((kart) => (
              <Link
                key={kart.href}
                href={kart.href}
                style={{
                  padding: 24,
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 16,
                  textDecoration: "none",
                  color: "var(--fg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 34 }}>{kart.ikon}</div>
                <strong style={{ fontSize: 19, color: "var(--vurgu)" }}>{kart.baslik} ↗</strong>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>{kart.aciklama}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* KÖY ANALİZ SONUÇLARI */}
      {oyuncu && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ÜST KISIM: 2 Sütunlu Zengin Profil Kartı ve Genel İlerleme Özeti */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 20,
            }}
          >
            {/* Sol Kart: Oyuncu Profil Kartı */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {oyuncu.ligIkonu && (
                    <img
                      src={oyuncu.ligIkonu}
                      alt={oyuncu.ligAdi ?? "Lig"}
                      width={56}
                      height={56}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{oyuncu.isim}</h2>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: 10,
                          background: "var(--vurgu)",
                          color: "#111",
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        🏰 Belediye {oyuncu.thSeviyesi}
                      </span>
                    </div>
                    <p style={{ opacity: 0.75, margin: "6px 0 0", fontSize: 15 }}>
                      {oyuncu.kod} · 🏆 {oyuncu.kupa} Kupa {oyuncu.ligAdi ? `(${oyuncu.ligAdi})` : ""}
                    </p>
                    <p style={{ opacity: 0.9, margin: "6px 0 0", fontSize: 15, fontWeight: 600 }}>
                      🛡️{" "}
                      {oyuncu.klan && oyuncu.klanKod ? (
                        <Link
                          href={"/klanlar?kod=" + oyuncu.klanKod.replace(/^#/, "")}
                          style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 800 }}
                          title="Bu klanın analizini ve üyelerini gör"
                        >
                          {oyuncu.klan} ↗
                        </Link>
                      ) : oyuncu.klan ? (
                        oyuncu.klan
                      ) : (
                        "Klanı yok"
                      )}
                    </p>
                  </div>
                </div>

                {/* Yıldız Favori İkon Butonu */}
                <button
                  onClick={() => favoriyeEkle(oyuncu)}
                  title="Favorilere ekle"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: favoriEklendi ? "1px solid #f59e0b" : "1px solid var(--cizgi)",
                    background: favoriEklendi ? "rgba(245, 158, 11, 0.15)" : "var(--bg)",
                    color: favoriEklendi ? "#f59e0b" : "var(--fg)",
                    cursor: "pointer",
                    fontSize: 18,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{favoriEklendi ? "★" : "☆"}</span>
                  <span style={{ fontSize: 13 }}>{favoriEklendi ? "Favoride" : "Favori"}</span>
                </button>
              </div>

              {favoriMesaj && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--vurgu)", fontWeight: 600 }}>{favoriMesaj}</p>
              )}
            </section>

            {/* Sağ Kart: Genel İlerleme ve Öncelikli Eksikler */}
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
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 17 }}>Genel Köy Tamamlanması (BB {oyuncu.thSeviyesi})</strong>
                  <strong style={{ fontSize: 24, color: "var(--vurgu)" }}>%{yuzde(hepsi)}</strong>
                </div>
                <div
                  style={{
                    height: 12,
                    background: "var(--cizgi)",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: yuzde(hepsi) + "%",
                      background: "var(--vurgu)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.85, marginBottom: 8 }}>
                  {enCokEksikler.length > 0 ? "⚡ Öncelikli Yükseltmeler:" : "🎉 Bu Belediye Binası tamamen dolu!"}
                </div>
                {enCokEksikler.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {enCokEksikler.map((p) => (
                      <span
                        key={p.isim}
                        style={{
                          fontSize: 13,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                          fontWeight: 600,
                        }}
                      >
                        {tr(p.isim)} ({p.seviye}/{p.azami})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ALT KISIM: Sekmeli Kategori Alanı */}
          <section
            style={{
              padding: 24,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 16,
            }}
          >
            {/* Sekme Butonları */}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                borderBottom: "1px solid var(--cizgi)",
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              {sekmeler.map((sekme) => {
                const secili = sekme.id === seciliSekmeVerisi?.id;
                return (
                  <button
                    key={sekme.id}
                    onClick={() => setAktifSekme(sekme.id)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: secili ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                      background: secili ? "var(--vurgu)" : "var(--bg)",
                      color: secili ? "#111" : "var(--fg)",
                      fontWeight: secili ? 800 : 600,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sekme.etiket}
                  </button>
                );
              })}
            </div>

            {/* Seçili Sekmenin İçeriği */}
            {seciliSekmeVerisi && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{seciliSekmeVerisi.etiket}</h3>
                  {seciliSekmeVerisi.id !== "super" && (
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                      Kategori İlerlemesi: %{yuzde(seciliSekmeVerisi.liste)}
                    </span>
                  )}
                </div>

                {seciliSekmeVerisi.id === "super" && (
                  <p style={{ opacity: 0.75, fontSize: 14, marginTop: 0, marginBottom: 16 }}>
                    Altın çerçeveli birlikler oyuncunun şu an aktif olarak kullandığı Süper Birlikleri gösterir.
                  </p>
                )}

                {seciliSekmeVerisi.liste.length === 0 ? (
                  <p style={{ opacity: 0.7, fontSize: 15 }}>Bu kategoride henüz açık birim bulunmuyor.</p>
                ) : seciliSekmeVerisi.id === "kahramanlar" ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {seciliSekmeVerisi.liste.map((p) => (
                      <KahramanKarti key={p.isim} p={p} />
                    ))}
                  </div>
                ) : seciliSekmeVerisi.id === "super" ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 14,
                    }}
                  >
                    {seciliSekmeVerisi.liste.map((p) => (
                      <SuperBirlikKarti key={p.isim} p={p} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {seciliSekmeVerisi.liste.map((p) => (
                      <BirimKarti key={p.isim} p={p} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
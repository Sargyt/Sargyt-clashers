"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

const ADMIN_EPOSTA = "sargytr0@gmail.com";

const TEMALAR = [
  { id: "altin-koyu", ad: "🐉 Ejderha Ateşi · Altın" },
  { id: "mor-siyah", ad: "🔮 Hiçlik Moru · Efsun" },
  { id: "kanli-ay", ad: "🩸 Kanlı Ay · Nocturnal" },
  { id: "zumrut-orman", ad: "🌿 Zehirli Sarmaşık · Zümrüt" },
  { id: "buzul-efsane", ad: "⚡ Elektro Titan · Buzul" },
  { id: "parsomen-acik", ad: "📜 Kraliyet Parşömeni · Açık" },
];

const ANA_LINKLER = [
  { href: "/", ikon: "🏠", ad: "Ana Sayfa" },
  { href: "/klanlar", ikon: "🛡️", ad: "Klanlar" },
  { href: "/ilanlar", ikon: "📢", ad: "İlanlar" },
  { href: "/forum", ikon: "💬", ad: "Forum" },
  { href: "/favoriler", ikon: "⭐", ad: "Favoriler" },
];

type AracLink = { href: string; ikon: string; ad: string; aciklama: string };

const ARAC_GRUPLARI: { baslik: string; ogeler: AracLink[] }[] = [
  {
    baslik: "⚔️ Savaş & Ordu",
    ogeler: [
      { href: "/ordular", ikon: "⚔️", ad: "Meta Ordular", aciklama: "3 yıldız ordu & ekipman dizilimleri" },
      { href: "/ordu-kurucu", ikon: "🧪", ad: "Ordu Kurucu", aciklama: "Kendi ordunu kur, kapasite hesapla" },
      { href: "/duzenler", ikon: "🗺️", ad: "Köy Düzenleri", aciklama: "Oyuna kopyalanabilir güncel düzenler" },
      { href: "/savas-plan", ikon: "🎯", ad: "Savaş Planlayıcı", aciklama: "Klan savaşı & CWL hedef dağıtımı" },
      { href: "/zapquake", ikon: "⚡", ad: "ZapQuake Hesaplayıcı", aciklama: "Yıldırım + Deprem + Dev Ok hesabı" },
      { href: "/efsane", ikon: "🏆", ad: "Efsane Ligi Takibi", aciklama: "8 saldırı & 8 savunma kupa defteri" },
    ],
  },
  {
    baslik: "🧮 Hesaplayıcı & Takip",
    ogeler: [
      { href: "/takip", ikon: "⏱️", ad: "İnşaatçı Takipçisi", aciklama: "İnşaatçı, lab & iksir geri sayımı" },
      { href: "/hesaplayici", ikon: "🧮", ad: "Hesaplayıcılar", aciklama: "Duvar, süre, taş ve cevher maliyeti" },
      { href: "/madalya", ikon: "💎", ad: "Madalya Optimizatörü", aciklama: "CWL madalyası: Çekiç mi İksir mi?" },
      { href: "/baskent", ikon: "🏰", ad: "Klan Başkenti", aciklama: "Bölge baskın orduları & tüccar sepeti" },
    ],
  },
  {
    baslik: "🏆 Topluluk & Rehber",
    ogeler: [
      { href: "/liderlik", ikon: "🏆", ad: "Liderlik Tablosu", aciklama: "Siteye girilen en güçlü köyler" },
      { href: "/karsilastir", ikon: "🆚", ad: "VS Karşılaştır", aciklama: "İki köyü veya klanı yan yana kıyasla" },
      { href: "/ansiklopedi", ikon: "📖", ad: "Oyun Rehberi", aciklama: "Kahraman, birlik ve savunma taktikleri" },
      { href: "/quiz", ikon: "🧠", ad: "CoC Bilgi Yarışması", aciklama: "10 soruda Clash rütbeni test et" },
    ],
  },
];

const TUM_ARAC_YOLLARI = ARAC_GRUPLARI.flatMap((g) => g.ogeler.map((o) => o.href));

export default function Menu() {
  const yol = usePathname();
  const [tema, setTema] = useState("altin-koyu");
  const [kullaniciEposta, setKullaniciEposta] = useState<string | null>(null);
  const [araclarAcik, setAraclarAcik] = useState(false);
  const [mobilAcik, setMobilAcik] = useState(false);
  const acilirRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const kayit = localStorage.getItem("tema");
      if (kayit && TEMALAR.some((t) => t.id === kayit)) {
        setTema(kayit);
        document.documentElement.setAttribute("data-theme", kayit);
      }
    } catch {}

    supabase.auth.getSession().then(({ data }) => {
      setKullaniciEposta(data.session?.user?.email ?? null);
    });

    const { data: dinleyici } = supabase.auth.onAuthStateChange((_olay, oturum) => {
      setKullaniciEposta(oturum?.user?.email ?? null);
    });

    return () => dinleyici.subscription.unsubscribe();
  }, []);

  // Sayfa değişince açık menüleri kapat
  useEffect(() => {
    setAraclarAcik(false);
    setMobilAcik(false);
  }, [yol]);

  // Masaüstü açılır menüsünün dışına tıklayınca kapat
  useEffect(() => {
    function disTiklama(e: MouseEvent) {
      if (acilirRef.current && !acilirRef.current.contains(e.target as Node)) {
        setAraclarAcik(false);
      }
    }
    document.addEventListener("mousedown", disTiklama);
    return () => document.removeEventListener("mousedown", disTiklama);
  }, []);

  function temaUygula(id: string) {
    setTema(id);
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem("tema", id);
    } catch {}
  }

  async function cikisYap() {
    await supabase.auth.signOut();
    setKullaniciEposta(null);
    setMobilAcik(false);
  }

  const adminMi = kullaniciEposta?.toLowerCase() === ADMIN_EPOSTA;
  const aracAktifMi = TUM_ARAC_YOLLARI.includes(yol);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--kart)",
        borderBottom: "1px solid var(--cizgi)",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 24px",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            marginRight: 8,
            fontSize: 20,
            fontWeight: 900,
            color: "var(--fg)",
            textDecoration: "none",
            letterSpacing: "-0.3px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ⚔️ Sargyt Clashers
        </Link>

        {/* MASAÜSTÜ MENÜ */}
        <div className="menu-masaustu">
          {ANA_LINKLER.map((l) => {
            const aktif = yol === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "8px 13px",
                  borderRadius: 10,
                  border: "1px solid " + (aktif ? "var(--vurgu)" : "var(--cizgi)"),
                  background: aktif ? "var(--vurgu)" : "var(--bg)",
                  color: aktif ? "var(--vurgu-yazi)" : "var(--fg)",
                  fontWeight: 700,
                  fontSize: 14.5,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {l.ad}
              </Link>
            );
          })}

          {/* KATEGORİLİ MEGA ARAÇLAR MENÜSÜ */}
          <div ref={acilirRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setAraclarAcik((acik) => !acik)}
              aria-expanded={araclarAcik}
              style={{
                padding: "8px 14px",
                minHeight: 38,
                borderRadius: 10,
                border: "1px solid " + (aracAktifMi || araclarAcik ? "var(--vurgu)" : "var(--cizgi)"),
                background: aracAktifMi ? "var(--vurgu)" : "var(--bg)",
                color: aracAktifMi ? "var(--vurgu-yazi)" : "var(--fg)",
                fontWeight: 700,
                fontSize: 14.5,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <span>🧰 Araçlar</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>{araclarAcik ? "▲" : "▼"}</span>
            </button>

            {araclarAcik && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  left: "50%",
                  transform: "translateX(-35%)",
                  width: "min(820px, 92vw)",
                  maxHeight: "78vh",
                  overflowY: "auto",
                  padding: 16,
                  borderRadius: 18,
                  background: "var(--kart)",
                  border: "1.5px solid var(--vurgu)",
                  boxShadow: "0 20px 48px rgba(0, 0, 0, 0.55)",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 14,
                  zIndex: 60,
                }}
              >
                {ARAC_GRUPLARI.map((grup) => (
                  <div key={grup.baslik} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "var(--vurgu)",
                        padding: "4px 8px",
                        borderBottom: "1px solid var(--cizgi)",
                      }}
                    >
                      {grup.baslik}
                    </div>
                    {grup.ogeler.map((a) => {
                      const aktif = yol === a.href;
                      return (
                        <Link
                          key={a.href}
                          href={a.href}
                          onClick={() => setAraclarAcik(false)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "9px 10px",
                            borderRadius: 11,
                            border: "1px solid " + (aktif ? "var(--vurgu)" : "transparent"),
                            background: aktif
                              ? "color-mix(in srgb, var(--vurgu) 18%, var(--bg))"
                              : "var(--bg)",
                            color: "var(--fg)",
                            textDecoration: "none",
                          }}
                        >
                          <span style={{ fontSize: 19, lineHeight: 1.1, flexShrink: 0 }}>{a.ikon}</span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                            <strong style={{ fontSize: 13.5, color: aktif ? "var(--vurgu)" : "var(--fg)" }}>
                              {a.ad}
                            </strong>
                            <span style={{ fontSize: 11.5, opacity: 0.7, lineHeight: 1.3 }}>
                              {a.aciklama}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ TARAF: HESAP & TEMA */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {kullaniciEposta ? (
              <>
                <Link
                  href="/giris"
                  title="Hesap Bilgileri"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--vurgu)",
                    background: "color-mix(in srgb, var(--vurgu) 16%, var(--bg))",
                    color: "var(--vurgu)",
                    fontWeight: 800,
                    fontSize: 13.5,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {adminMi ? "👑 Sargyt" : `👤 ${kullaniciEposta.split("@")[0]}`}
                </Link>
                <button
                  type="button"
                  onClick={cikisYap}
                  style={{
                    padding: "8px 11px",
                    minHeight: 38,
                    borderRadius: 10,
                    border: "1px solid #ef4444",
                    background: "rgba(239, 68, 68, 0.14)",
                    color: "#ef6b5f",
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  🚪 Çıkış
                </button>
              </>
            ) : (
              <Link
                href="/giris"
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid " + (yol === "/giris" ? "var(--vurgu)" : "var(--cizgi)"),
                  background: yol === "/giris" ? "var(--vurgu)" : "var(--bg)",
                  color: yol === "/giris" ? "var(--vurgu-yazi)" : "var(--fg)",
                  fontWeight: 700,
                  fontSize: 14.5,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Giriş
              </Link>
            )}

            <select
              value={tema}
              onChange={(e) => temaUygula(e.target.value)}
              aria-label="Tema"
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                maxWidth: 185,
              }}
            >
              {TEMALAR.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MOBİL HAMBURGER BUTONU */}
        <button
          type="button"
          className="menu-mobil-buton"
          onClick={() => setMobilAcik((v) => !v)}
          aria-expanded={mobilAcik}
          aria-label="Menüyü aç veya kapat"
          style={{
            padding: "8px 14px",
            minHeight: 40,
            borderRadius: 10,
            border: "1px solid " + (mobilAcik ? "var(--vurgu)" : "var(--cizgi)"),
            background: mobilAcik ? "var(--vurgu)" : "var(--bg)",
            color: mobilAcik ? "var(--vurgu-yazi)" : "var(--fg)",
            fontWeight: 900,
            fontSize: 14.5,
            cursor: "pointer",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{mobilAcik ? "✕ Kapat" : "☰ Menü"}</span>
        </button>
      </nav>

      {/* MOBİL AÇILIR ÇEKMECE */}
      {mobilAcik && (
        <div
          className="menu-mobil-panel"
          style={{
            flexDirection: "column",
            gap: 16,
            padding: "14px 16px 22px",
            borderTop: "1px solid var(--cizgi)",
            background: "var(--kart)",
            maxHeight: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          {/* ANA SEKMELER (2 SÜTUNLU KUTULAR) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            {ANA_LINKLER.map((l) => {
              const aktif = yol === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    padding: "11px 12px",
                    borderRadius: 11,
                    border: "1px solid " + (aktif ? "var(--vurgu)" : "var(--cizgi)"),
                    background: aktif ? "var(--vurgu)" : "var(--bg)",
                    color: aktif ? "var(--vurgu-yazi)" : "var(--fg)",
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{l.ikon}</span>
                  <span>{l.ad}</span>
                </Link>
              );
            })}
          </div>

          {/* KATEGORİLİ ARAÇLAR */}
          {ARAC_GRUPLARI.map((grup) => (
            <div key={grup.baslik} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "var(--vurgu)",
                  letterSpacing: "0.04em",
                }}
              >
                {grup.baslik}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                {grup.ogeler.map((a) => {
                  const aktif = yol === a.href;
                  return (
                    <Link
                      key={a.href}
                      href={a.href}
                      style={{
                        padding: "10px 11px",
                        borderRadius: 11,
                        border: "1px solid " + (aktif ? "var(--vurgu)" : "var(--cizgi)"),
                        background: aktif
                          ? "color-mix(in srgb, var(--vurgu) 18%, var(--bg))"
                          : "var(--bg)",
                        color: aktif ? "var(--vurgu)" : "var(--fg)",
                        fontWeight: 800,
                        fontSize: 13.5,
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 17 }}>{a.ikon}</span>
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.ad}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* TEMA & HESAP ALT ÇUBUĞU */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingTop: 12,
              borderTop: "1px solid var(--cizgi)",
            }}
          >
            <select
              value={tema}
              onChange={(e) => temaUygula(e.target.value)}
              aria-label="Tema"
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: 11,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 14.5,
                fontWeight: 700,
              }}
            >
              {TEMALAR.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ad}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 8 }}>
              {kullaniciEposta ? (
                <>
                  <Link
                    href="/giris"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "11px 12px",
                      borderRadius: 11,
                      border: "1px solid var(--vurgu)",
                      background: "color-mix(in srgb, var(--vurgu) 16%, var(--bg))",
                      color: "var(--vurgu)",
                      fontWeight: 800,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    {adminMi ? "👑 Sargyt" : `👤 ${kullaniciEposta.split("@")[0]}`}
                  </Link>
                  <button
                    type="button"
                    onClick={cikisYap}
                    style={{
                      padding: "11px 16px",
                      borderRadius: 11,
                      border: "1px solid #ef4444",
                      background: "rgba(239, 68, 68, 0.14)",
                      color: "#ef6b5f",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    🚪 Çıkış Yap
                  </button>
                </>
              ) : (
                <Link
                  href="/giris"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "11px 12px",
                    borderRadius: 11,
                    background: "var(--vurgu)",
                    color: "var(--vurgu-yazi)",
                    fontWeight: 900,
                    fontSize: 14.5,
                    textDecoration: "none",
                  }}
                >
                  Giriş Yap / Kayıt Ol
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
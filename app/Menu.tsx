"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";

const TEMALAR = [
  { id: "altin-koyu", ad: "🟡 Ejderha Ateşi" },
  { id: "mor-siyah", ad: "🟣 Hiçlik Moru" },
  { id: "kanli-ay", ad: "🔴 Kanlı Ay" },
  { id: "zumrut-orman", ad: "🟢 Zehirli Sarmaşık" },
  { id: "buzul-efsane", ad: "🔵 Elektro Titan" },
  { id: "parsomen-acik", ad: "⚪ Kraliyet Parşömeni" },
];

const ANA_LINKLER = [
  { href: "/", ad: "Ana Sayfa" },
  { href: "/klanlar", ad: "Klanlar" },
  { href: "/forum", ad: "Forum" },
  { href: "/favoriler", ad: "Favoriler" },
];

const ARAC_LINKLERI = [
  { href: "/takip", ikon: "⏱️", ad: "İnşaatçı Takipçisi", aciklama: "İnşaatçı, lab & iksir geri sayımı" },
  { href: "/hesaplayici", ikon: "🧮", ad: "Hesaplayıcılar", aciklama: "Duvar, süre ve cevher maliyeti" },
  { href: "/karsilastir", ikon: "⚡", ad: "VS Karşılaştır", aciklama: "İki köyü veya klanı yan yana kıyasla" },
];

const REHBER_LINKLERI = [
  { href: "/ordular", ikon: "⚔️", ad: "Meta Ordular", aciklama: "3 yıldız ordu & ekipman dizilimleri" },
  { href: "/duzenler", ikon: "🗺️", ad: "Köy Düzenleri", aciklama: "Oyuna kopyalanabilir güncel düzenler" },
  { href: "/ansiklopedi", ikon: "📖", ad: "Oyun Rehberi", aciklama: "Kahraman, birlik ve savunma taktikleri" },
];

export default function Menu() {
  const [tema, setTema] = useState("altin-koyu");
  const [kullaniciEposta, setKullaniciEposta] = useState<string | null>(null);
  const [acikMenu, setAcikMenu] = useState<"araclar" | "rehber" | null>(null);
  const araclarRef = useRef<HTMLDivElement>(null);
  const rehberRef = useRef<HTMLDivElement>(null);

  const yol = usePathname();
  const router = useRouter();

  function temaUygula(id: string) {
    setTema(id);
    document.documentElement.setAttribute("data-theme", id);
    document.body.setAttribute("data-theme", id);
    try {
      localStorage.setItem("tema", id);
    } catch {}
  }

  useEffect(() => {
    try {
      const kayit = localStorage.getItem("tema");
      if (kayit && TEMALAR.some((t) => t.id === kayit)) {
        temaUygula(kayit);
      } else {
        temaUygula("altin-koyu");
      }
    } catch {
      temaUygula("altin-koyu");
    }

    supabase.auth.getSession().then(({ data }) => {
      setKullaniciEposta(data.session?.user?.email ?? null);
    });

    const { data: dinleyici } = supabase.auth.onAuthStateChange((_event, session) => {
      setKullaniciEposta(session?.user?.email ?? null);
    });

    return () => {
      dinleyici.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function disariTikla(e: MouseEvent) {
      const hedef = e.target as Node;
      const araclardaMi = araclarRef.current?.contains(hedef);
      const rehberdeMi = rehberRef.current?.contains(hedef);
      if (!araclardaMi && !rehberdeMi) {
        setAcikMenu(null);
      }
    }
    document.addEventListener("mousedown", disariTikla);
    return () => document.removeEventListener("mousedown", disariTikla);
  }, []);

  useEffect(() => {
    setAcikMenu(null);
  }, [yol]);

  async function cikisYap() {
    await supabase.auth.signOut();
    setKullaniciEposta(null);
    router.refresh();
  }

  const adminMi = kullaniciEposta?.toLowerCase() === "sargytr0@gmail.com";
  const aracAktifMi = ARAC_LINKLERI.some((a) => a.href === yol);
  const rehberAktifMi = REHBER_LINKLERI.some((r) => r.href === yol);
  const aktifYaziRengi = tema === "kanli-ay" ? "#ffffff" : "#111111";

  return (
    <nav
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "13px 26px",
        borderBottom: "1px solid var(--cizgi)",
        background: "color-mix(in srgb, var(--kart) 90%, transparent)",
        backdropFilter: "blur(10px)",
        flexWrap: "wrap",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <Link
        href="/"
        className="oyun-baslik"
        style={{
          marginRight: 10,
          fontSize: 21,
          fontWeight: 800,
          color: "var(--fg)",
          textDecoration: "none",
        }}
      >
        ⚔️ Sargyt Clashers
      </Link>

      {/* ANA SEKMELER */}
      {ANA_LINKLER.map((l) => {
        const aktif = yol === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            style={{
              padding: "9px 15px",
              borderRadius: 11,
              border: "1px solid " + (aktif ? "var(--vurgu)" : "var(--cizgi)"),
              background: aktif ? "var(--vurgu)" : "var(--bg)",
              color: aktif ? aktifYaziRengi : "var(--fg)",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            {l.ad}
          </Link>
        );
      })}

      {/* 1. AÇILIR MENÜ: ARAÇLAR */}
      <div ref={araclarRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setAcikMenu((m) => (m === "araclar" ? null : "araclar"))}
          aria-expanded={acikMenu === "araclar"}
          style={{
            padding: "9px 15px",
            minHeight: 40,
            borderRadius: 11,
            border: "1px solid " + (aracAktifMi || acikMenu === "araclar" ? "var(--vurgu)" : "var(--cizgi)"),
            background: aracAktifMi ? "var(--vurgu)" : "var(--bg)",
            color: aracAktifMi ? aktifYaziRengi : "var(--fg)",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>🧰 Araçlar</span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>{acikMenu === "araclar" ? "▲" : "▼"}</span>
        </button>

        {acikMenu === "araclar" && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: 0,
              width: "min(310px, 88vw)",
              padding: 10,
              borderRadius: 16,
              background: "var(--kart)",
              border: "1.5px solid var(--vurgu)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 50,
            }}
          >
            {ARAC_LINKLERI.map((a) => {
              const aktif = yol === a.href;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  onClick={() => setAcikMenu(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid " + (aktif ? "var(--vurgu)" : "transparent"),
                    background: aktif ? "color-mix(in srgb, var(--vurgu) 18%, var(--bg))" : "var(--bg)",
                    color: "var(--fg)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{a.ikon}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <strong style={{ fontSize: 14.5, color: aktif ? "var(--vurgu)" : "var(--fg)" }}>{a.ad}</strong>
                    <span style={{ fontSize: 12, opacity: 0.72 }}>{a.aciklama}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. AÇILIR MENÜ: REHBER & META */}
      <div ref={rehberRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setAcikMenu((m) => (m === "rehber" ? null : "rehber"))}
          aria-expanded={acikMenu === "rehber"}
          style={{
            padding: "9px 15px",
            minHeight: 40,
            borderRadius: 11,
            border: "1px solid " + (rehberAktifMi || acikMenu === "rehber" ? "var(--vurgu)" : "var(--cizgi)"),
            background: rehberAktifMi ? "var(--vurgu)" : "var(--bg)",
            color: rehberAktifMi ? aktifYaziRengi : "var(--fg)",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>📚 Rehber & Meta</span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>{acikMenu === "rehber" ? "▲" : "▼"}</span>
        </button>

        {acikMenu === "rehber" && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: 0,
              width: "min(310px, 88vw)",
              padding: 10,
              borderRadius: 16,
              background: "var(--kart)",
              border: "1.5px solid var(--vurgu)",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 50,
            }}
          >
            {REHBER_LINKLERI.map((r) => {
              const aktif = yol === r.href;
              return (
                <Link
                  key={r.href}
                  href={r.href}
                  onClick={() => setAcikMenu(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid " + (aktif ? "var(--vurgu)" : "transparent"),
                    background: aktif ? "color-mix(in srgb, var(--vurgu) 18%, var(--bg))" : "var(--bg)",
                    color: "var(--fg)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{r.ikon}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <strong style={{ fontSize: 14.5, color: aktif ? "var(--vurgu)" : "var(--fg)" }}>{r.ad}</strong>
                    <span style={{ fontSize: 12, opacity: 0.72 }}>{r.aciklama}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* SAĞ TARAF: HESAP & TEMA */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {kullaniciEposta ? (
          <>
            <Link
              href="/giris"
              title="Hesap Bilgileri"
              style={{
                padding: "9px 14px",
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
                padding: "9px 14px",
                minHeight: 40,
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
              padding: "9px 16px",
              borderRadius: 11,
              border: "1px solid " + (yol === "/giris" ? "var(--vurgu)" : "var(--cizgi)"),
              background: yol === "/giris" ? "var(--vurgu)" : "var(--bg)",
              color: yol === "/giris" ? aktifYaziRengi : "var(--fg)",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
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
            padding: "9px 12px",
            borderRadius: 11,
            border: "1px solid var(--cizgi)",
            background: "var(--bg)",
            color: "var(--fg)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {TEMALAR.map((t) => (
            <option key={t.id} value={t.id}>
              {t.ad}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
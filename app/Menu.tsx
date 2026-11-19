"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const TEMALAR = [
  { id: "altin-koyu", ad: "🟡 Ejderha Ateşi" },
  { id: "mor-siyah", ad: "🟣 Hiçlik Moru" },
  { id: "kanli-ay", ad: "🔴 Kanlı Ay" },
  { id: "zumrut-orman", ad: "🟢 Zehirli Sarmaşık" },
  { id: "buzul-efsane", ad: "🔵 Elektro Titan" },
  { id: "parsomen-acik", ad: "⚪ Kraliyet Parşömeni" },
];

const LINKLER = [
  { href: "/", ad: "Ana Sayfa" },
  { href: "/klanlar", ad: "Klanlar" },
  { href: "/karsilastir", ad: "VS Karşılaştır" },
  { href: "/ordular", ad: "Ordular" },
  { href: "/duzenler", ad: "Düzenler" },
  { href: "/ansiklopedi", ad: "Rehber" },
  { href: "/hesaplayici", ad: "Hesaplayıcı" },
  { href: "/forum", ad: "Forum" },
  { href: "/favoriler", ad: "Favoriler" },
];

export default function Menu() {
  const [tema, setTema] = useState("altin-koyu");
  const [kullaniciEposta, setKullaniciEposta] = useState<string | null>(null);
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

  async function cikisYap() {
    await supabase.auth.signOut();
    setKullaniciEposta(null);
    router.refresh();
  }

  const adminMi = kullaniciEposta?.toLowerCase() === "sargytr0@gmail.com";

  return (
    <nav
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "14px 28px",
        borderBottom: "1px solid var(--cizgi)",
        background: "color-mix(in srgb, var(--kart) 88%, transparent)",
        backdropFilter: "blur(10px)",
        flexWrap: "wrap",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <Link
        href="/"
        style={{
          marginRight: 12,
          fontSize: 20,
          fontWeight: 900,
          color: "var(--fg)",
          textDecoration: "none",
          letterSpacing: "-0.3px",
        }}
      >
        ⚔️ Sargyt Clashers
      </Link>

      {LINKLER.map((l) => {
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
              color: aktif ? (tema === "kanli-ay" ? "#ffffff" : "#111111") : "var(--fg)",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
            }}
          >
            {l.ad}
          </Link>
        );
      })}

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
              color: yol === "/giris" ? (tema === "kanli-ay" ? "#ffffff" : "#111111") : "var(--fg)",
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
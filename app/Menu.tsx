"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const TEMALAR = [
  { id: "altin-koyu", ad: "Altın · Koyu" },
  { id: "altin-acik", ad: "Altın · Açık" },
  { id: "mor-siyah", ad: "Mor · Siyah" },
];

const LINKLER = [
  { href: "/", ad: "Ana Sayfa" },
  { href: "/klanlar", ad: "Klanlar" },
  { href: "/karsilastir", ad: "VS Karşılaştır" },
  { href: "/ordular", ad: "Ordular" },
  { href: "/ansiklopedi", ad: "Rehber" },
  { href: "/hesaplayici", ad: "Hesaplayıcı" },
  { href: "/forum", ad: "Forum" },
  { href: "/favoriler", ad: "Favoriler" },
  { href: "/giris", ad: "Giriş" },
];

export default function Menu() {
  const [tema, setTema] = useState("altin-koyu");
  const yol = usePathname();

  useEffect(() => {
    try {
      const kayit = localStorage.getItem("tema");
      if (kayit && TEMALAR.some((t) => t.id === kayit)) {
        setTema(kayit);
        document.documentElement.setAttribute("data-theme", kayit);
      }
    } catch {}
  }, []);

  function sec(id: string) {
    setTema(id);
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem("tema", id);
    } catch {}
  }

  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "16px 32px",
        borderBottom: "1px solid var(--cizgi)",
        background: "var(--kart)",
        flexWrap: "wrap",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        href="/"
        style={{
          marginRight: 16,
          fontSize: 21,
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
              padding: "11px 18px",
              borderRadius: 12,
              border: "1px solid " + (aktif ? "var(--vurgu)" : "var(--cizgi)"),
              background: aktif ? "var(--vurgu)" : "var(--bg)",
              color: aktif ? "#111" : "var(--fg)",
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
            }}
          >
            {l.ad}
          </Link>
        );
      })}

      <select
        value={tema}
        onChange={(e) => sec(e.target.value)}
        aria-label="Tema"
        style={{
          marginLeft: "auto",
          padding: "11px 14px",
          borderRadius: 12,
          border: "1px solid var(--cizgi)",
          background: "var(--bg)",
          color: "var(--fg)",
          fontSize: 15,
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
    </nav>
  );
}
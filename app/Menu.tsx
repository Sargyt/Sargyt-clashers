"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const TEMALAR = [
  { id: "altin-koyu", ad: "Altın · Koyu" },
  { id: "altin-acik", ad: "Altın · Açık" },
  { id: "mor-siyah", ad: "Mor · Siyah" },
];

export default function Menu() {
  const [tema, setTema] = useState("altin-koyu");

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

  const stil = { color: "inherit", textDecoration: "none", padding: "6px 12px" };

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid var(--cizgi)",
        background: "var(--kart)",
        flexWrap: "wrap",
                position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <strong style={{ marginRight: 16 }}>⚔️ Sargyt Clashers</strong>
      <Link href="/" style={stil}>Ana Sayfa</Link>
      <Link href="/ordular" style={stil}>Ordular</Link>
      <Link href="/ansiklopedi" style={stil}>Ansiklopedi</Link>
      <Link href="/favoriler" style={stil}>Favoriler</Link>
      <select
        value={tema}
        onChange={(e) => sec(e.target.value)}
        aria-label="Tema"
        style={{
          marginLeft: "auto",
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid var(--cizgi)",
          background: "var(--bg)",
          color: "var(--fg)",
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
"use client";
import { useEffect, useState } from "react";

type Favori = { kod: string; isim: string };

export default function Favoriler() {
  const [liste, setListe] = useState<Favori[]>([]);

  useEffect(() => {
    try {
      const veri = JSON.parse(localStorage.getItem("favoriler") || "[]");
      if (Array.isArray(veri)) setListe(veri);
    } catch {}
  }, []);

  function sil(kod: string) {
    const yeni = liste.filter((f) => f.kod !== kod);
    setListe(yeni);
    try {
      localStorage.setItem("favoriler", JSON.stringify(yeni));
    } catch {}
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1>⭐ Favoriler</h1>
      <p style={{ opacity: 0.75 }}>
        Favoriler şimdilik bu tarayıcıda saklanır. E-posta ile üyelik gelince cihazlar arasında senkron olacak.
      </p>
      {liste.length === 0 && <p>Henüz favori yok.</p>}
      {liste.map((f) => (
        <div
          key={f.kod}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 14,
            marginBottom: 10,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 12,
          }}
        >
          <span>
            <strong>{f.isim}</strong> · {f.kod}
          </span>
          <button
            onClick={() => sil(f.kod)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            Sil
          </button>
        </div>
      ))}
    </main>
  );
}
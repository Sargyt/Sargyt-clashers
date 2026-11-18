"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

type Favori = { kod: string; isim: string };

export default function Favoriler() {
  const [liste, setListe] = useState<Favori[]>([]);
  const [girisli, setGirisli] = useState(false);

  useEffect(() => {
    async function yukle() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setGirisli(true);
        const { data: satirlar } = await supabase
          .from("favoriler")
          .select("kod, isim")
          .order("created_at", { ascending: false });
        setListe(satirlar ?? []);
      } else {
        try {
          const veri = JSON.parse(localStorage.getItem("favoriler") || "[]");
          if (Array.isArray(veri)) setListe(veri);
        } catch {}
      }
    }
    yukle();
  }, []);

  async function sil(kod: string) {
    const yeni = liste.filter((f) => f.kod !== kod);
    setListe(yeni);
    if (girisli) {
      await supabase.from("favoriler").delete().eq("kod", kod);
    } else {
      try {
        localStorage.setItem("favoriler", JSON.stringify(yeni));
      } catch {}
    }
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1>⭐ Favoriler</h1>
      <p style={{ opacity: 0.75 }}>
        {girisli ? (
          "Favorilerin hesabında saklanıyor."
        ) : (
          <>
            Favoriler şimdilik bu tarayıcıda saklanıyor. Hesabına kaydetmek için{" "}
            <Link href="/giris">giriş yap</Link>.
          </>
        )}
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
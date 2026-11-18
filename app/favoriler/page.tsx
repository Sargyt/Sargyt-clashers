"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

type Favori = { kod: string; isim: string };
type FavoriKlan = { kod: string; isim: string; seviye?: number };

export default function Favoriler() {
  const [liste, setListe] = useState<Favori[]>([]);
  const [klanListesi, setKlanListesi] = useState<FavoriKlan[]>([]);
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

      try {
        const klanVeri = JSON.parse(localStorage.getItem("favoriKlanlar") || "[]");
        if (Array.isArray(klanVeri)) setKlanListesi(klanVeri);
      } catch {}
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

  function klanSil(kod: string) {
    const yeni = klanListesi.filter((k) => k.kod !== kod);
    setKlanListesi(yeni);
    try {
      localStorage.setItem("favoriKlanlar", JSON.stringify(yeni));
    } catch {}
  }

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6 }}>⭐ Favoriler</h1>
      <p style={{ opacity: 0.75, marginTop: 0, marginBottom: 28 }}>
        {girisli ? (
          "Favori köylerin hesabında, favori klanların tarayıcında saklanıyor."
        ) : (
          <>
            Favoriler şimdilik bu tarayıcıda saklanıyor. Hesabına kaydetmek için{" "}
            <Link href="/giris" style={{ color: "var(--vurgu)" }}>giriş yap</Link>.
          </>
        )}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
        }}
      >
        {/* SOL SÜTUN: FAVORİ KÖYLER */}
        <section
          style={{
            padding: 22,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 16,
          }}
        >
          <h2 style={{ fontSize: 20, margin: "0 0 14px" }}>🏰 Favori Köyler ({liste.length})</h2>
          {liste.length === 0 && <p style={{ opacity: 0.7 }}>Henüz favori köy eklenmedi.</p>}
          {liste.map((f) => (
            <div
              key={f.kod}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 14,
                marginBottom: 10,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                borderRadius: 12,
              }}
            >
              <Link
                href={"/?kod=" + f.kod.replace(/^#/, "")}
                style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700, fontSize: 15 }}
              >
                {f.isim} · {f.kod} ↗
              </Link>
              <button
                onClick={() => sil(f.kod)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--kart)",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Sil
              </button>
            </div>
          ))}
        </section>

        {/* SAĞ SÜTUN: FAVORİ KLANLAR */}
        <section
          style={{
            padding: 22,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 16,
          }}
        >
          <h2 style={{ fontSize: 20, margin: "0 0 14px" }}>🛡️ Favori Klanlar ({klanListesi.length})</h2>
          {klanListesi.length === 0 && (
            <p style={{ opacity: 0.7 }}>Henüz favori klan eklenmedi. Klanlar sayfasından yıldızlayabilirsin.</p>
          )}
          {klanListesi.map((k) => (
            <div
              key={k.kod}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 14,
                marginBottom: 10,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                borderRadius: 12,
              }}
            >
              <Link
                href={"/klanlar?kod=" + k.kod.replace(/^#/, "")}
                style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700, fontSize: 15 }}
              >
                {k.isim} {k.seviye ? `(Sv. ${k.seviye})` : ""} · {k.kod} ↗
              </Link>
              <button
                onClick={() => klanSil(k.kod)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--kart)",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Sil
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
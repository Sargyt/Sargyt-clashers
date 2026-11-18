"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabase";

type Favori = { kod: string; isim: string };
type FavoriKlan = { kod: string; isim: string; seviye?: number };

type CanliDurum = {
  yukleniyor: boolean;
  aktif: boolean;
  tur?: "cwl" | "normal" | "yok";
  bizimYildiz?: number;
  rakipYildiz?: number;
  rakipAdi?: string;
  rakipRozet?: string | null;
  klanRozet?: string | null;
};

export default function Favoriler() {
  const [liste, setListe] = useState<Favori[]>([]);
  const [klanListesi, setKlanListesi] = useState<FavoriKlan[]>([]);
  const [girisli, setGirisli] = useState(false);
  const [radar, setRadar] = useState<Record<string, CanliDurum>>({});

  const radarTara = useCallback(async (klanlar: FavoriKlan[]) => {
    if (klanlar.length === 0) return;

    const baslangic: Record<string, CanliDurum> = {};
    for (const k of klanlar) {
      baslangic[k.kod] = { yukleniyor: true, aktif: false };
    }
    setRadar(baslangic);

    await Promise.all(
      klanlar.map(async (k) => {
        const temiz = k.kod.replace(/^#/, "");
        try {
          const r = await fetch("/api/savas?kod=" + temiz);
          const veri = await r.json();
          if (veri?.aktif && veri?.bizimKlan && veri?.rakipKlan) {
            setRadar((prev) => ({
              ...prev,
              [k.kod]: {
                yukleniyor: false,
                aktif: true,
                tur: veri.tur,
                bizimYildiz: veri.bizimKlan.stars,
                rakipYildiz: veri.rakipKlan.stars,
                rakipAdi: veri.rakipKlan.name,
                rakipRozet: veri.rakipKlan.rozet,
                klanRozet: veri.bizimKlan.rozet,
              },
            }));
          } else {
            setRadar((prev) => ({
              ...prev,
              [k.kod]: { yukleniyor: false, aktif: false },
            }));
          }
        } catch {
          setRadar((prev) => ({
            ...prev,
            [k.kod]: { yukleniyor: false, aktif: false },
          }));
        }
      })
    );
  }, []);

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
        const k1 = JSON.parse(localStorage.getItem("favori_klanlar") || "[]");
        const k2 = JSON.parse(localStorage.getItem("favoriKlanlar") || "[]");
        const birlesik: FavoriKlan[] = [];
        const gorulen = new Set<string>();

        for (const item of [...(Array.isArray(k1) ? k1 : []), ...(Array.isArray(k2) ? k2 : [])]) {
          if (item?.kod) {
            const norm = item.kod.replace(/^#/, "");
            if (!gorulen.has(norm)) {
              gorulen.add(norm);
              birlesik.push({ ...item, kod: norm });
            }
          }
        }
        setKlanListesi(birlesik);
        radarTara(birlesik);
      } catch {}
    }
    yukle();
  }, [radarTara]);

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
    const temiz = kod.replace(/^#/, "");
    const yeni = klanListesi.filter((k) => k.kod.replace(/^#/, "") !== temiz);
    setKlanListesi(yeni);
    try {
      localStorage.setItem("favori_klanlar", JSON.stringify(yeni));
      localStorage.setItem("favoriKlanlar", JSON.stringify(yeni));
    } catch {}
  }

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 6px" }}>⭐ Favoriler & Canlı Savaş Radarı</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 16 }}>
            {girisli ? (
              "Favori köylerin hesabında, favori klanların ise canlı savaş & CWL radarıyla birlikte burada."
            ) : (
              <>
                Favoriler şimdilik bu tarayıcıda saklanıyor. Köylerini hesabına kaydetmek için{" "}
                <Link href="/giris" style={{ color: "var(--vurgu)" }}>
                  giriş yap
                </Link>
                .
              </>
            )}
          </p>
        </div>

        {klanListesi.length > 0 && (
          <button
            type="button"
            onClick={() => radarTara(klanListesi)}
            style={{
              padding: "11px 18px",
              borderRadius: 12,
              border: "1px solid var(--vurgu)",
              background: "var(--kart)",
              color: "var(--vurgu)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🔄 Savaş Durumlarını Yenile
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* SOL SÜTUN: FAVORİ KÖYLER */}
        <section
          style={{
            padding: 24,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 16,
          }}
        >
          <h2 style={{ fontSize: 21, margin: "0 0 16px" }}>🏰 Favori Köyler ({liste.length})</h2>
          {liste.length === 0 && <p style={{ opacity: 0.7 }}>Henüz favori köy eklenmedi.</p>}
          {liste.map((f) => (
            <div
              key={f.kod}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 15,
                marginBottom: 10,
                background: "var(--bg)",
                border: "1px solid var(--cizgi)",
                borderRadius: 12,
              }}
            >
              <Link
                href={"/?kod=" + f.kod.replace(/^#/, "")}
                style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
              >
                {f.isim} · {f.kod} ↗
              </Link>
              <button
                onClick={() => sil(f.kod)}
                style={{
                  padding: "7px 13px",
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--kart)",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Sil
              </button>
            </div>
          ))}
        </section>

        {/* SAĞ SÜTUN: FAVORİ KLANLAR & CANLI SAVAŞ / CWL RADARI */}
        <section
          style={{
            padding: 24,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 16,
          }}
        >
          <h2 style={{ fontSize: 21, margin: "0 0 16px" }}>
            🛡️ Favori Klanlar & Savaş Radarı ({klanListesi.length})
          </h2>
          {klanListesi.length === 0 && (
            <p style={{ opacity: 0.7 }}>Henüz favori klan eklenmedi. Klanlar sayfasından yıldızlayabilirsin.</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {klanListesi.map((k) => {
              const durum = radar[k.kod];
              return (
                <div
                  key={k.kod}
                  style={{
                    padding: 16,
                    background: "var(--bg)",
                    border: durum?.aktif ? "1.5px solid var(--vurgu)" : "1px solid var(--cizgi)",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {durum?.klanRozet && (
                        <img src={durum.klanRozet} alt="" width={30} height={30} />
                      )}
                      <Link
                        href={"/klanlar?kod=" + k.kod.replace(/^#/, "")}
                        style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 800, fontSize: 16 }}
                      >
                        {k.isim} {k.seviye ? `(Sv. ${k.seviye})` : ""} · #{k.kod.replace(/^#/, "")} ↗
                      </Link>
                    </div>

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
                        fontWeight: 600,
                      }}
                    >
                      Sil
                    </button>
                  </div>

                  {/* Canlı Savaş / CWL Radar Durumu */}
                  {durum?.yukleniyor ? (
                    <div style={{ fontSize: 13, opacity: 0.7 }}>⏳ Canlı savaş durumu taranıyor...</div>
                  ) : durum?.aktif ? (
                    <Link
                      href={"/klanlar?kod=" + k.kod.replace(/^#/, "")}
                      style={{
                        textDecoration: "none",
                        color: "var(--fg)",
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "linear-gradient(135deg, rgba(245,197,66,0.16), rgba(239,68,68,0.12))",
                        border: "1px solid var(--vurgu)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: "var(--vurgu)" }}>
                        {durum.tur === "cwl" ? "🏆 CWL Aktif" : "⚔️ Klan Savaşı Aktif"}
                      </span>
                      <span style={{ fontWeight: 800 }}>
                        ⭐ {durum.bizimYildiz} - {durum.rakipYildiz} ⭐ vs {durum.rakipAdi}
                      </span>
                    </Link>
                  ) : (
                    <div style={{ fontSize: 13, opacity: 0.68 }}>
                      🛡️ Şu an aktif savaş veya CWL karşılaşması bulunmuyor
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
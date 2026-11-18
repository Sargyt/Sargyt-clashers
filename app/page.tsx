"use client";
import { useState, type FormEvent } from "react";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Oyuncu = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  kahramanlar: { isim: string; seviye: number; azami: number }[];
};

export default function Home() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oyuncu, setOyuncu] = useState<Oyuncu | null>(null);

  async function ara(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setOyuncu(null);
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
        setOyuncu(veri);
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Köyünü analiz et</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Köy kodunu gir, gelişim durumunu gör.
      </p>

      <form onSubmit={ara} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Köy kodu, örn. #2PP0Y8L"
          maxLength={14}
          aria-label="Köy kodu"
          style={{
            flex: 1,
            minWidth: 180,
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
            color: "var(--fg)",
          }}
        />
        <button
          disabled={yukleniyor}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: 0,
            background: "var(--vurgu)",
            color: "#111",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {yukleniyor ? "Aranıyor..." : "Köyü Ara"}
        </button>
      </form>

      {hata && <p style={{ color: "#ef6b5f" }}>{hata}</p>}

      {oyuncu && (
        <section
          style={{
            marginTop: 24,
            padding: 20,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 14,
          }}
        >
          <h2 style={{ margin: 0 }}>{oyuncu.isim}</h2>
          <p style={{ opacity: 0.75 }}>
            {oyuncu.kod} · Belediye Binası {oyuncu.thSeviyesi} · 🏆 {oyuncu.kupa}
            {oyuncu.klan ? " · Klan: " + oyuncu.klan : ""}
          </p>
          <h3>Kahramanlar</h3>
          {oyuncu.kahramanlar.length === 0 && <p>Kahraman bulunamadı.</p>}
          {oyuncu.kahramanlar.map((h) => (
            <div key={h.isim} style={{ marginBottom: 12 }}>
              <div>
                {h.isim}: {h.seviye}/{h.azami}
              </div>
              <div
                style={{
                  height: 10,
                  background: "var(--cizgi)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: Math.round((h.seviye / h.azami) * 100) + "%",
                    background: "var(--vurgu)",
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
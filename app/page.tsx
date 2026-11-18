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
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 600 }}>
      <h1>⚔️ Sargyt Clashers</h1>
      <p>Clash of Clans köy analizi ve rehber sitesi.</p>
      <form onSubmit={ara} style={{ display: "flex", gap: 8 }}>
        <input
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Köy kodu, örn. #2PP0Y8L"
          maxLength={14}
          style={{ flex: 1, padding: 10 }}
        />
        <button style={{ padding: "10px 16px" }} disabled={yukleniyor}>
          {yukleniyor ? "Aranıyor..." : "Köyü Ara"}
        </button>
      </form>

      {hata && <p style={{ color: "crimson" }}>{hata}</p>}

      {oyuncu && (
        <section style={{ marginTop: 24, padding: 16, border: "1px solid #ccc", borderRadius: 12 }}>
          <h2 style={{ margin: 0 }}>{oyuncu.isim}</h2>
          <p style={{ color: "#666" }}>
            {oyuncu.kod} · Belediye Binası {oyuncu.thSeviyesi} · 🏆 {oyuncu.kupa}
            {oyuncu.klan ? " · Klan: " + oyuncu.klan : ""}
          </p>
          <h3>Kahramanlar</h3>
          {oyuncu.kahramanlar.length === 0 && <p>Kahraman bulunamadı.</p>}
          {oyuncu.kahramanlar.map((h) => (
            <div key={h.isim} style={{ marginBottom: 10 }}>
              <div>
                {h.isim}: {h.seviye}/{h.azami}
              </div>
              <div style={{ height: 8, background: "#ddd", borderRadius: 4 }}>
                <div
                  style={{
                    height: "100%",
                    width: Math.round((h.seviye / h.azami) * 100) + "%",
                    background: "#2f7d4f",
                    borderRadius: 4,
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
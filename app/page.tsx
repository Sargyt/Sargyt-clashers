"use client";
import { useState, type FormEvent } from "react";
import { tr } from "./isimler";
const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Parca = { isim: string; seviye: number; azami: number };

type Oyuncu = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  kahramanlar: Parca[];
  birlikler: Parca[];
  buyuler: Parca[];
  ekipmanlar: Parca[];
};

const PETLER = [
  "L.A.S.S.I", "Mighty Yak", "Electro Owl", "Unicorn", "Phoenix",
  "Poison Lizard", "Diggy", "Frosty", "Spirit Fox", "Angry Jelly",
  "Sneezy", "Greedy Raven",
];
const SUPER_EK = ["Sneaky Goblin", "Rocket Balloon", "Inferno Dragon", "Ice Hound"];

const superMi = (p: Parca) => p.isim.startsWith("Super ") || SUPER_EK.includes(p.isim);

function yuzde(liste: Parca[]) {
  const s = liste.reduce((t, p) => t + p.seviye, 0);
  const m = liste.reduce((t, p) => t + p.azami, 0);
  return m ? Math.round((s / m) * 100) : 0;
}

function Satir({ p }: { p: Parca }) {
  return (
    <div>
      <div style={{ fontSize: 14 }}>
        {tr(p.isim)}: {p.seviye}/{p.azami}
      </div>
      <div style={{ height: 8, background: "var(--cizgi)", borderRadius: 6, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: Math.round((p.seviye / p.azami) * 100) + "%",
            background: "var(--vurgu)",
          }}
        />
      </div>
    </div>
  );
}

function Bolum({ baslik, liste }: { baslik: string; liste: Parca[] }) {
  if (liste.length === 0) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 8 }}>
        {baslik} · %{yuzde(liste)}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
        {liste.map((p) => (
          <Satir key={p.isim} p={p} />
        ))}
      </div>
    </div>
  );
}
function Eksikler({ baslik, liste }: { baslik: string; liste: Parca[] }) {
  const eksik = liste
    .filter((p) => p.seviye < p.azami)
    .sort((a, b) => b.azami - b.seviye - (a.azami - a.seviye))
    .slice(0, 5);

  if (eksik.length === 0) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 8 }}>{baslik}</h3>
      <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
        {eksik.map((p) => (
          <li key={p.isim} style={{ marginBottom: 4 }}>
            {tr(p.isim)}: {p.azami - p.seviye} seviye kaldı ({p.seviye}/{p.azami})
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Home() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oyuncu, setOyuncu] = useState<Oyuncu | null>(null);
  const [favoriMesaj, setFavoriMesaj] = useState("");

function favoriyeEkle(o: Oyuncu) {
  try {
    const eski = JSON.parse(localStorage.getItem("favoriler") || "[]");
    const liste: { kod: string; isim: string }[] = Array.isArray(eski) ? eski : [];
    if (liste.some((f) => f.kod === o.kod)) {
      setFavoriMesaj("Zaten favorilerde.");
      return;
    }
    liste.push({ kod: o.kod, isim: o.isim });
    localStorage.setItem("favoriler", JSON.stringify(liste));
    setFavoriMesaj("Favorilere eklendi.");
  } catch {
    setFavoriMesaj("Kaydedilemedi.");
  }
}

  async function ara(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setOyuncu(null);
    setFavoriMesaj("");
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

  const normal = oyuncu ? oyuncu.birlikler.filter((p) => !superMi(p) && !PETLER.includes(p.isim)) : [];
  const petler = oyuncu ? oyuncu.birlikler.filter((p) => PETLER.includes(p.isim)) : [];
  const supers = oyuncu ? oyuncu.birlikler.filter(superMi) : [];
  const hepsi = oyuncu
    ? [...oyuncu.kahramanlar, ...oyuncu.ekipmanlar, ...normal, ...petler, ...oyuncu.buyuler]
    : [];

  return (
    <main style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Köyünü analiz et</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Köy kodunu gir, gelişim durumunu gör.</p>

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

<button
  onClick={() => favoriyeEkle(oyuncu)}
  style={{
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid var(--cizgi)",
    background: "var(--bg)",
    color: "var(--fg)",
    cursor: "pointer",
  }}
>
  ⭐ Favorilere ekle
</button>
{favoriMesaj && <span style={{ marginLeft: 8, fontSize: 14 }}>{favoriMesaj}</span>}
          <div style={{ marginTop: 8 }}>
            <strong>Genel ilerleme: %{yuzde(hepsi)}</strong>
            <div style={{ height: 12, background: "var(--cizgi)", borderRadius: 8, overflow: "hidden", marginTop: 6 }}>
              <div style={{ height: "100%", width: yuzde(hepsi) + "%", background: "var(--vurgu)" }} />
            </div>
          </div>
          <Eksikler baslik="Kalan: Kahramanlar" liste={oyuncu.kahramanlar} />
          <Eksikler baslik="Kalan: Birlikler" liste={normal} />
          <Eksikler baslik="Kalan: Büyüler" liste={oyuncu.buyuler} />
          <Eksikler baslik="Kalan: Evcil Hayvanlar" liste={petler} />
          <Eksikler baslik="Kalan: Ekipmanlar" liste={oyuncu.ekipmanlar} />
          <Bolum baslik="Kahramanlar" liste={oyuncu.kahramanlar} />
          <Bolum baslik="Ekipmanlar" liste={oyuncu.ekipmanlar} />
          <Bolum baslik="Birlikler" liste={normal} />
          <Bolum baslik="Büyüler" liste={oyuncu.buyuler} />
          <Bolum baslik="Evcil Hayvanlar" liste={petler} />

          {supers.length > 0 && (
            <details style={{ marginTop: 20 }}>
              <summary style={{ cursor: "pointer" }}>Süper birlikler ({supers.length})</summary>
              <p style={{ opacity: 0.75, fontSize: 14 }}>
                Bunlar normal birliklerin geçici güçlenmiş halleridir, genel ilerlemeye dahil edilmez.
              </p>
              <ul style={{ columns: 2, fontSize: 14 }}>
                {supers.map((p) => (
                  <li key={p.isim}>{p.isim}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </main>
  );
}
"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";


const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Uye = {
  tag: string;
  name: string;
  role: string;
  townHallLevel: number;
  trophies: number;
  donations: number;
  donationsReceived: number;
};

type Klan = {
  kod: string;
  isim: string;
  aciklama: string;
  rozet?: string | null;
  seviye: number;
  puan: number;
  uyeSayisi: number;
  savasGalibiyet: number;
  savasMaglubiyet: number;
  savasBeraberlik: number;
  savasSerisi: number;
  uyeler: Uye[];
};

const ROL_TR: Record<string, string> = {
  leader: "Lider",
  coLeader: "Yardımcı Lider",
  admin: "Büyük",
  member: "Üye",
};

export default function KlanlarSayfasi() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [klan, setKlan] = useState<Klan | null>(null);
  const [sirala, setSirala] = useState<"kupa" | "bagis" | "bb">("kupa");
  const [favoriEklendi, setFavoriEklendi] = useState(false);
  const [favoriMesaj, setFavoriMesaj] = useState("");

  function klanFavoriyeEkle(k: Klan) {
    try {
      const eski = JSON.parse(localStorage.getItem("favoriKlanlar") || "[]");
      const liste: { kod: string; isim: string; seviye: number }[] = Array.isArray(eski) ? eski : [];
      if (liste.some((f) => f.kod === k.kod)) {
        setFavoriEklendi(true);
        setFavoriMesaj("Bu klan zaten favorilerinde kayıtlı.");
        return;
      }
      liste.push({ kod: k.kod, isim: k.isim, seviye: k.seviye });
      localStorage.setItem("favoriKlanlar", JSON.stringify(liste));
      setFavoriEklendi(true);
      setFavoriMesaj("Klan favorilerine eklendi!");
    } catch {
      setFavoriMesaj("Kaydedilemedi.");
    }
  }

  async function klanGetir(temizKod: string) {
    setKlan(null);
    setFavoriEklendi(false);
    setFavoriMesaj("");
    if (!KOD_KURALI.test(temizKod)) {
      setHata("Geçersiz klan kodu. Örnek: #2PP0Y8L");
      return;
    }
    setHata("");
    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/klan?kod=" + temizKod);
      const veri = (await yanit.json()) as Klan & { hata?: string };
      if (!yanit.ok) {
        setHata(veri.hata ?? "Bir sorun oluştu");
      } else {
        setKlan(veri);
        try {
          const kayitli = JSON.parse(localStorage.getItem("favoriKlanlar") || "[]");
          if (Array.isArray(kayitli) && kayitli.some((f) => f.kod === veri.kod)) {
            setFavoriEklendi(true);
          }
        } catch {}
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }

  async function ara(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    await klanGetir(temiz);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKod = params.get("kod");
    if (urlKod) {
      const temiz = urlKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
      setKod("#" + temiz);
      klanGetir(temiz);
    }
  }, []);

  const bbDagilimi: Record<number, number> = {};
  if (klan) {
    for (const u of klan.uyeler) {
      bbDagilimi[u.townHallLevel] = (bbDagilimi[u.townHallLevel] ?? 0) + 1;
    }
  }

  const siraliUyeler = klan
    ? [...klan.uyeler].sort((a, b) => {
        if (sirala === "bagis") return b.donations - a.donations;
        if (sirala === "bb") return b.townHallLevel - a.townHallLevel || b.trophies - a.trophies;
        return b.trophies - a.trophies;
      })
    : [];

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST ARAMA KARTI */}
      <section
        style={{
          padding: "28px 32px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 28,
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px" }}>Klan Analizi</h1>
        <p style={{ opacity: 0.75, margin: "0 0 20px", fontSize: 16 }}>
          Klan etiketini gir; savaş istatistiklerini, Belediye Binası dağılımını ve üye bağış durumlarını tam ekran incele.
        </p>

        <form onSubmit={ara} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="Klan kodu girin, örn: #2PP0Y8L"
            maxLength={14}
            aria-label="Klan kodu"
            style={{
              flex: 1,
              minWidth: 240,
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 16,
            }}
          />
          <button
            type="submit"
            disabled={yukleniyor}
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "#111",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "Aranıyor..." : "🛡️ Klanı Analiz Et"}
          </button>
        </form>

        {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}
      </section>

      {klan && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* ÜST 2 SÜTUNLU KLAN BİLGİ & SAVAŞ KARTLARI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: 20,
            }}
          >
            {/* Sol Kart: Klan Kimliği & Rozeti */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {klan.rozet && (
                    <img
                      src={klan.rozet}
                      alt={klan.isim}
                      width={68}
                      height={68}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{klan.isim}</h2>
                      <span
                        style={{
                          padding: "5px 12px",
                          borderRadius: 10,
                          background: "var(--vurgu)",
                          color: "#111",
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        Seviye {klan.seviye}
                      </span>
                    </div>
                    <p style={{ opacity: 0.8, margin: "6px 0 0", fontSize: 15, fontWeight: 600 }}>
                      {klan.kod} · 👥 {klan.uyeSayisi}/50 Üye · 🏆 {klan.puan} Puan
                    </p>
                  </div>
                </div>

                {/* Klan Yıldız Favori Butonu */}
                <button
                  type="button"
                  onClick={() => klanFavoriyeEkle(klan)}
                  title="Klanı favorilere ekle"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: favoriEklendi ? "1px solid #f59e0b" : "1px solid var(--cizgi)",
                    background: favoriEklendi ? "rgba(245, 158, 11, 0.15)" : "var(--bg)",
                    color: favoriEklendi ? "#f59e0b" : "var(--fg)",
                    cursor: "pointer",
                    fontSize: 18,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span>{favoriEklendi ? "★" : "☆"}</span>
                  <span style={{ fontSize: 13 }}>{favoriEklendi ? "Favoride" : "Favori"}</span>
                </button>
              </div>

              {favoriMesaj && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--vurgu)", fontWeight: 600 }}>{favoriMesaj}</p>
              )}

              {klan.aciklama && (
                <p
                  style={{
                    opacity: 0.85,
                    fontSize: 14,
                    margin: 0,
                    lineHeight: 1.55,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "var(--bg)",
                    border: "1px solid var(--cizgi)",
                  }}
                >
                  {klan.aciklama}
                </p>
              )}
            </section>

            {/* Sağ Kart: Savaş İstatistikleri & BB Dağılımı */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <strong style={{ fontSize: 17, display: "block", marginBottom: 12 }}>
                  ⚔️ Klan Savaşı İstatistikleri
                </strong>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, textAlign: "center" }}>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#22c55e" }}>{klan.savasGalibiyet}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, fontWeight: 600 }}>Galibiyet</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#ef6b5f" }}>{klan.savasMaglubiyet}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, fontWeight: 600 }}>Mağlubiyet</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "var(--vurgu)" }}>{klan.savasSerisi}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, fontWeight: 600 }}>Galibiyet Serisi</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 8 }}>
                  🏰 Belediye Binası Dağılımı:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(bbDagilimi)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([bb, adet]) => (
                      <span
                        key={bb}
                        style={{
                          fontSize: 13,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                        }}
                      >
                        BB {bb}: <strong>{adet}</strong>
                      </span>
                    ))}
                </div>
              </div>
            </section>
          </div>

          {/* ALT BÖLÜM: ÜYE LİSTESİ TABLOSU */}
          <section
            style={{
              padding: 24,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                👥 Üye Listesi ({klan.uyeler.length} Oyuncu)
              </h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(
                  [
                    { id: "kupa", ad: "🏆 Kupaya Göre" },
                    { id: "bb", ad: "🏰 BB Seviyesine Göre" },
                    { id: "bagis", ad: "🎁 Bağışa Göre" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSirala(s.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: sirala === s.id ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                      background: sirala === s.id ? "var(--vurgu)" : "var(--bg)",
                      color: sirala === s.id ? "#111" : "var(--fg)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {s.ad}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                    <th style={{ padding: "12px 10px" }}>#</th>
                    <th style={{ padding: "12px 10px" }}>Oyuncu (Köyü İncele)</th>
                    <th style={{ padding: "12px 10px" }}>Belediye</th>
                    <th style={{ padding: "12px 10px" }}>Rol</th>
                    <th style={{ padding: "12px 10px" }}>Kupa</th>
                    <th style={{ padding: "12px 10px" }}>Bağış / Alınan</th>
                  </tr>
                </thead>
                <tbody>
                  {siraliUyeler.map((u, idx) => (
                    <tr key={u.tag} style={{ borderBottom: "1px solid var(--cizgi)" }}>
                      <td style={{ padding: "14px 10px", opacity: 0.7, fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: "14px 10px" }}>
                        <Link
                          href={"/?kod=" + u.tag.replace(/^#/, "")}
                          style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 800, fontSize: 16 }}
                          title="Bu oyuncunun köyünü analiz et"
                        >
                          {u.name} ↗
                        </Link>
                        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{u.tag}</div>
                      </td>
                      <td style={{ padding: "14px 10px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 8,
                            background: "var(--bg)",
                            border: "1px solid var(--cizgi)",
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          BB {u.townHallLevel}
                        </span>
                      </td>
                      <td style={{ padding: "14px 10px", fontSize: 14, fontWeight: 600 }}>
                        {ROL_TR[u.role] ?? u.role}
                      </td>
                      <td style={{ padding: "14px 10px", fontWeight: 700 }}>🏆 {u.trophies}</td>
                      <td style={{ padding: "14px 10px", fontSize: 14, fontWeight: 600 }}>
                        <span style={{ color: "#22c55e" }}>↑ {u.donations}</span> /{" "}
                        <span style={{ opacity: 0.75 }}>↓ {u.donationsReceived}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
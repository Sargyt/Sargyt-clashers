"use client";
import { useEffect, useState, type FormEvent } from "react";
import { tr } from "./isimler";
import { supabase } from "./supabase";
import { gercekAzami } from "./thSinirlari";
import { gorselYolu } from "./gorseller";

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

type SekmeTipi = "kahramanlar" | "ekipmanlar" | "birlikler" | "buyuler" | "petler" | "super";

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

function BirimKarti({ p }: { p: Parca }) {
  const tamamlandi = p.seviye >= p.azami;
  const oran = Math.min(100, Math.round((p.seviye / p.azami) * 100));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        background: "var(--bg)",
        border: `1px solid ${tamamlandi ? "var(--vurgu)" : "var(--cizgi)"}`,
        borderRadius: 10,
      }}
    >
      <img
        src={gorselYolu(p.isim)}
        alt={tr(p.isim)}
        width={40}
        height={40}
        style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {tr(p.isim)}
          </span>
          <span style={{ opacity: 0.85, marginLeft: 6 }}>
            {p.seviye}/{p.azami}
          </span>
        </div>
        <div style={{ height: 6, background: "var(--cizgi)", borderRadius: 6, overflow: "hidden", marginTop: 6 }}>
          <div
            style={{
              height: "100%",
              width: oran + "%",
              background: tamamlandi ? "#22c55e" : "var(--vurgu)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oyuncu, setOyuncu] = useState<Oyuncu | null>(null);
  const [favoriMesaj, setFavoriMesaj] = useState("");
  const [aktifSekme, setAktifSekme] = useState<SekmeTipi>("kahramanlar");

  async function favoriyeEkle(o: Oyuncu) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { error } = await supabase
        .from("favoriler")
        .insert({ kod: o.kod, isim: o.isim.slice(0, 40) });
      if (error) {
        setFavoriMesaj(error.code === "23505" ? "Zaten favorilerde." : "Kaydedilemedi.");
      } else {
        setFavoriMesaj("Hesabına eklendi.");
      }
      return;
    }
    try {
      const eski = JSON.parse(localStorage.getItem("favoriler") || "[]");
      const liste: { kod: string; isim: string }[] = Array.isArray(eski) ? eski : [];
      if (liste.some((f) => f.kod === o.kod)) {
        setFavoriMesaj("Zaten favorilerde.");
        return;
      }
      liste.push({ kod: o.kod, isim: o.isim });
      localStorage.setItem("favoriler", JSON.stringify(liste));
      setFavoriMesaj("Bu tarayıcıya eklendi. Hesabına kaydetmek için giriş yap.");
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
        const guncelKahramanlar = veri.kahramanlar.map((k: Parca) => ({
          ...k,
          azami: gercekAzami(veri.thSeviyesi, k.isim, k.azami),
        }));
        const guncelBirlikler = veri.birlikler.map((b: Parca) => ({
          ...b,
          azami: gercekAzami(veri.thSeviyesi, b.isim, b.azami),
        }));
        const guncelBuyuler = veri.buyuler.map((s: Parca) => ({
          ...s,
          azami: gercekAzami(veri.thSeviyesi, s.isim, s.azami),
        }));

        setOyuncu({
          ...veri,
          kahramanlar: guncelKahramanlar,
          birlikler: guncelBirlikler,
          buyuler: guncelBuyuler,
        });
        setAktifSekme("kahramanlar");
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKod = params.get("kod");
    if (urlKod) {
      const temiz = urlKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
      setKod("#" + temiz);
      if (KOD_KURALI.test(temiz)) {
        setHata("");
        setYukleniyor(true);
        fetch("/api/oyuncu?kod=" + temiz)
          .then(async (yanit) => {
            const veri = await yanit.json();
            if (!yanit.ok) {
              setHata(veri.hata ?? "Bir sorun oluştu");
            } else {
              setOyuncu({
                ...veri,
                kahramanlar: veri.kahramanlar.map((k: Parca) => ({
                  ...k,
                  azami: gercekAzami(veri.thSeviyesi, k.isim, k.azami),
                })),
                birlikler: veri.birlikler.map((b: Parca) => ({
                  ...b,
                  azami: gercekAzami(veri.thSeviyesi, b.isim, b.azami),
                })),
                buyuler: veri.buyuler.map((s: Parca) => ({
                  ...s,
                  azami: gercekAzami(veri.thSeviyesi, s.isim, s.azami),
                })),
              });
              setAktifSekme("kahramanlar");
            }
          })
          .catch(() => setHata("Bağlantı hatası, tekrar dene."))
          .finally(() => setYukleniyor(false));
      }
    }
  }, []);

  const normal = oyuncu ? oyuncu.birlikler.filter((p) => !superMi(p) && !PETLER.includes(p.isim)) : [];
  const petler = oyuncu ? oyuncu.birlikler.filter((p) => PETLER.includes(p.isim)) : [];
  const supers = oyuncu ? oyuncu.birlikler.filter(superMi) : [];
  const hepsi = oyuncu
    ? [...oyuncu.kahramanlar, ...oyuncu.ekipmanlar, ...normal, ...petler, ...oyuncu.buyuler]
    : [];

  // En çok eksiği olan ilk 4 birimi özet kartında göstermek için
  const enCokEksikler = hepsi
    .filter((p) => p.seviye < p.azami)
    .sort((a, b) => b.azami - b.seviye - (a.azami - a.seviye))
    .slice(0, 4);

  const sekmeler: { id: SekmeTipi; etiket: string; liste: Parca[] }[] = oyuncu
    ? [
        { id: "kahramanlar", etiket: `👑 Kahramanlar (${oyuncu.kahramanlar.length})`, liste: oyuncu.kahramanlar },
        { id: "birlikler", etiket: `⚔️ Birlikler (${normal.length})`, liste: normal },
        { id: "buyuler", etiket: `⚡ Büyüler (${oyuncu.buyuler.length})`, liste: oyuncu.buyuler },
        { id: "ekipmanlar", etiket: `🛡️ Ekipmanlar (${oyuncu.ekipmanlar.length})`, liste: oyuncu.ekipmanlar },
        { id: "petler", etiket: `🐾 Hayvanlar (${petler.length})`, liste: petler },
        ...(supers.length > 0 ? [{ id: "super" as SekmeTipi, etiket: `✨ Süper (${supers.length})`, liste: supers }] : []),
      ]
    : [];

  const seciliSekmeVerisi = sekmeler.find((s) => s.id === aktifSekme) ?? sekmeler[0];

  return (
    <main style={{ padding: "40px 20px", maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Köyünü analiz et</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>Köy kodunu gir, gelişim durumunu ve eksiklerini detaylı incele.</p>

      <form onSubmit={ara} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Köy kodu, örn. #2PP0Y8L"
          maxLength={14}
          aria-label="Köy kodu"
          style={{
            flex: 1,
            minWidth: 200,
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
            padding: "12px 24px",
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

      {hata && <p style={{ color: "#ef6b5f", marginTop: 12 }}>{hata}</p>}

      {oyuncu && (
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ÜST KISIM: 2 Sütunlu Profil Kartı ve Genel İlerleme Özeti */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {/* Sol Kart: Oyuncu Profil Kartı */}
            <section
              style={{
                padding: 20,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 22 }}>{oyuncu.isim}</h2>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "var(--vurgu)",
                      color: "#111",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    BB {oyuncu.thSeviyesi}
                  </span>
                </div>
                <p style={{ opacity: 0.75, margin: "6px 0 0", fontSize: 14 }}>
                  {oyuncu.kod} · 🏆 {oyuncu.kupa} Kupa
                </p>
                <p style={{ opacity: 0.85, margin: "4px 0 0", fontSize: 14 }}>
                  🛡️ {oyuncu.klan ? oyuncu.klan : "Klanı yok"}
                </p>
              </div>

              <div>
                <button
                  onClick={() => favoriyeEkle(oyuncu)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ⭐ Favorilere ekle
                </button>
                {favoriMesaj && (
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--vurgu)" }}>{favoriMesaj}</p>
                )}
              </div>
            </section>

            {/* Sağ Kart: Genel İlerleme ve Öncelikli Eksikler */}
            <section
              style={{
                padding: 20,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 15 }}>Genel Köy Tamamlanması</strong>
                  <strong style={{ fontSize: 20, color: "var(--vurgu)" }}>%{yuzde(hepsi)}</strong>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "var(--cizgi)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginTop: 8,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: yuzde(hepsi) + "%",
                      background: "var(--vurgu)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 6 }}>
                  {enCokEksikler.length > 0 ? "⚡ Öncelikli Yükseltmeler:" : "🎉 Bu Belediye Binası tamamen dolu!"}
                </div>
                {enCokEksikler.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {enCokEksikler.map((p) => (
                      <span
                        key={p.isim}
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                        }}
                      >
                        {tr(p.isim)} ({p.seviye}/{p.azami})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ALT KISIM: Sekmeli Kategori Alanı */}
          <section
            style={{
              padding: 20,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 14,
            }}
          >
            {/* Sekme Butonları */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                borderBottom: "1px solid var(--cizgi)",
                paddingBottom: 14,
                marginBottom: 18,
              }}
            >
              {sekmeler.map((sekme) => {
                const secili = sekme.id === seciliSekmeVerisi?.id;
                return (
                  <button
                    key={sekme.id}
                    onClick={() => setAktifSekme(sekme.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: secili ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                      background: secili ? "var(--vurgu)" : "var(--bg)",
                      color: secili ? "#111" : "var(--fg)",
                      fontWeight: secili ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {sekme.etiket}
                  </button>
                );
              })}
            </div>

            {/* Seçili Sekmenin İçeriği */}
            {seciliSekmeVerisi && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 18 }}>{seciliSekmeVerisi.etiket}</h3>
                  {seciliSekmeVerisi.id !== "super" && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--vurgu)" }}>
                      Kategori İlerlemesi: %{yuzde(seciliSekmeVerisi.liste)}
                    </span>
                  )}
                </div>

                {seciliSekmeVerisi.id === "super" && (
                  <p style={{ opacity: 0.75, fontSize: 13, marginTop: 0 }}>
                    Süper birlikler normal birliklerin geçici güçlendirilmiş halleridir, genel köy ilerlemesine dahil edilmez.
                  </p>
                )}

                {seciliSekmeVerisi.liste.length === 0 ? (
                  <p style={{ opacity: 0.7, fontSize: 14 }}>Bu kategoride henüz açık birim bulunmuyor.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {seciliSekmeVerisi.liste.map((p) => (
                      <BirimKarti key={p.isim} p={p} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
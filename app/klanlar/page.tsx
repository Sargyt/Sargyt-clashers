"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";

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
  seviye: number;
  puan: number;
  uyeSayisi: number;
  savasGalibiyet: number;
  savasMaglubiyet: number;
  savasBeraberlik: number;
  savasSerisi: number;
  rozet?: string | null;
  uyeler: Uye[];
};

type SavasOyuncu = {
  tag: string;
  isim: string;
  bbSeviyesi: number;
  haritaSirasi: number;
  klanAdi: string;
  klanKodu: string;
  bizimKlan: boolean;
  saldiriSayisi: number;
  maksSaldiri: number;
  toplamYildiz: number;
  toplamYuzde: number;
};

type GrupKlan = {
  tag: string;
  name: string;
  clanLevel: number;
  rozet: string | null;
  uyeSayisi: number;
  yildiz: number;
  yuzde: number;
  galibiyet: number;
};

type CwlMac = {
  tur: number;
  durum: string;
  klan1: { tag: string; name: string; rozet: string | null; stars: number; destructionPercentage: number };
  klan2: { tag: string; name: string; rozet: string | null; stars: number; destructionPercentage: number };
};

type SavasVerisi = {
  aktif: boolean;
  tur: "cwl" | "normal" | "yok";
  durum?: string;
  sezon?: string;
  takimBoyutu?: number;
  bizimKlan?: {
    tag: string;
    name: string;
    rozet: string | null;
    stars: number;
    destructionPercentage: number;
    attacks: number;
  };
  rakipKlan?: {
    tag: string;
    name: string;
    rozet: string | null;
    stars: number;
    destructionPercentage: number;
    attacks: number;
  };
  grupKlanlari?: GrupKlan[];
  tumMaclar?: CwlMac[];
  oyuncuSiralamasi?: SavasOyuncu[];
};

type FavoriKlan = {
  kod: string;
  isim: string;
  seviye: number;
};

const ROL_TR: Record<string, string> = {
  leader: "Lider",
  coLeader: "Yardımcı Lider",
  admin: "Büyük",
  member: "Üye",
};

function BbGorsel({ seviye, boyut = 28 }: { seviye: number; boyut?: number }) {
  const [hata, setHata] = useState(false);

  if (hata) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2px 7px",
          borderRadius: 6,
          background: "var(--bg)",
          border: "1px solid var(--cizgi)",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        BB {seviye}
      </span>
    );
  }

  return (
    <span
      title={`Belediye Binası ${seviye}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <img
        src={`/birimler/th${seviye}.png`}
        alt={`BB ${seviye}`}
        width={boyut}
        height={boyut}
        onError={() => setHata(true)}
        style={{ objectFit: "contain", display: "block" }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.85 }}>{seviye}</span>
    </span>
  );
}

function KlanlarIcerik() {
  const aramaParam = useSearchParams();
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [klan, setKlan] = useState<Klan | null>(null);
  const [sirala, setSirala] = useState<"kupa" | "bagis" | "bb">("kupa");

  const [favoriKlanlar, setFavoriKlanlar] = useState<FavoriKlan[]>([]);
  const [savas, setSavas] = useState<SavasVerisi | null>(null);
  const [savasYukleniyor, setSavasYukleniyor] = useState(false);
  const [savasPencereAcik, setSavasPencereAcik] = useState(false);
  const [savasSekme, setSavasSekme] = useState<"yildiz" | "grup">("yildiz");
  const [sadeceBizimKlan, setSadeceBizimKlan] = useState(false);

  useEffect(() => {
    try {
      const kayit = localStorage.getItem("favori_klanlar");
      if (kayit) setFavoriKlanlar(JSON.parse(kayit));
    } catch {}
  }, []);

  const klanGetir = useCallback(async (hamKod: string) => {
    const temiz = hamKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setKlan(null);
    setSavas(null);
    setSavasPencereAcik(false);

    if (!KOD_KURALI.test(temiz)) {
      setHata("Geçersiz klan kodu. Örnek: #2PP0Y8L");
      return;
    }

    setHata("");
    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/klan?kod=" + temiz);
      const veri = (await yanit.json()) as Klan & { hata?: string };
      if (!yanit.ok) {
        setHata(veri.hata ?? "Bir sorun oluştu");
      } else {
        setKlan(veri);
        setSavasYukleniyor(true);
        fetch("/api/savas?kod=" + temiz)
          .then((r) => r.json())
          .then((sv: SavasVerisi) => setSavas(sv))
          .catch(() => setSavas(null))
          .finally(() => setSavasYukleniyor(false));
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    const urlKod = aramaParam.get("kod");
    if (urlKod) {
      setKod(urlKod.startsWith("#") ? urlKod : "#" + urlKod);
      klanGetir(urlKod);
    }
  }, [aramaParam, klanGetir]);

  function ara(e: FormEvent) {
    e.preventDefault();
    klanGetir(kod);
  }

  function favoriDegistir() {
    if (!klan) return;
    const temizKod = klan.kod.replace(/^#/, "");
    const varMi = favoriKlanlar.some((f) => f.kod === temizKod);
    const yeniListe = varMi
      ? favoriKlanlar.filter((f) => f.kod !== temizKod)
      : [...favoriKlanlar, { kod: temizKod, isim: klan.isim, seviye: klan.seviye }];
    setFavoriKlanlar(yeniListe);
    try {
      localStorage.setItem("favori_klanlar", JSON.stringify(yeniListe));
    } catch {}
  }

  const favorideMi = klan ? favoriKlanlar.some((f) => f.kod === klan.kod.replace(/^#/, "")) : false;

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

  const filtrelenmisYildizlar = (savas?.oyuncuSiralamasi ?? []).filter((o) =>
    sadeceBizimKlan ? o.bizimKlan : true
  );

  return (
    <main style={{ padding: "32px 24px 60px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      <h1 style={{ fontSize: 34, margin: "0 0 8px", fontWeight: 800 }}>Klan Analizi</h1>
      <p style={{ opacity: 0.78, marginTop: 0, fontSize: 16 }}>
        Klan etiketini gir; savaş istatistiklerini, canlı klan savaşı & lig durumunu, Belediye Binası dağılımını ve üye bağışlarını incele.
      </p>

      <form onSubmit={ara} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <input
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Klan kodu, örn. #2PP0Y8L"
          maxLength={14}
          aria-label="Klan kodu"
          style={{
            flex: 1,
            minWidth: 240,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
            color: "var(--fg)",
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          disabled={yukleniyor}
          style={{
            padding: "14px 28px",
            borderRadius: 12,
            border: 0,
            background: "var(--vurgu)",
            color: "#111",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {yukleniyor ? "Aranıyor..." : "Klanı Ara"}
        </button>
      </form>

      {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}

      {klan && (
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 18,
            }}
          >
            {/* Klan Ana Bilgi Kartı */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {klan.rozet ? (
                  <img
                    src={klan.rozet}
                    alt={klan.isim}
                    width={72}
                    height={72}
                    style={{ objectFit: "contain", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 16,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                    }}
                  >
                    🛡️
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{klan.isim}</h2>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        background: "var(--vurgu)",
                        color: "#111",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      Seviye {klan.seviye}
                    </span>
                  </div>
                  <p style={{ opacity: 0.78, margin: "6px 0 0", fontSize: 14 }}>
                    {klan.kod} · 👥 {klan.uyeSayisi}/50 Üye · 🏆 {klan.puan} Puan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={favoriDegistir}
                  title={favorideMi ? "Favorilerden çıkar" : "Favori klanlara ekle"}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid " + (favorideMi ? "var(--vurgu)" : "var(--cizgi)"),
                    background: favorideMi ? "rgba(245, 197, 66, 0.16)" : "var(--bg)",
                    color: favorideMi ? "var(--vurgu)" : "var(--fg)",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {favorideMi ? "★ Favoride" : "☆ Yıldızla"}
                </button>
              </div>

              {klan.aciklama && (
                <p style={{ opacity: 0.85, fontSize: 14, margin: 0, lineHeight: 1.55 }}>
                  {klan.aciklama}
                </p>
              )}

              {/* Canlı Klan Savaşı / CWL Durum Butonu */}
              <div style={{ marginTop: 4 }}>
                {savasYukleniyor ? (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      fontSize: 14,
                      opacity: 0.75,
                    }}
                  >
                    ⚔️ Savaş durumu kontrol ediliyor...
                  </div>
                ) : savas?.aktif && savas.bizimKlan && savas.rakipKlan ? (
                  <button
                    type="button"
                    onClick={() => setSavasPencereAcik(true)}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: 14,
                      border: "2px solid var(--vurgu)",
                      background: "linear-gradient(135deg, rgba(245,197,66,0.18), rgba(239,68,68,0.14))",
                      color: "var(--fg)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {savas.bizimKlan.rozet && (
                        <img src={savas.bizimKlan.rozet} alt="" width={34} height={34} />
                      )}
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{savas.bizimKlan.name}</span>
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-geist-mono), monospace",
                        fontSize: 20,
                        fontWeight: 900,
                        letterSpacing: 1,
                        padding: "4px 14px",
                        borderRadius: 10,
                        background: "var(--bg)",
                        border: "1px solid var(--vurgu)",
                        color: "var(--vurgu)",
                      }}
                    >
                      ⭐ {savas.bizimKlan.stars} - {savas.rakipKlan.stars} ⭐
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{savas.rakipKlan.name}</span>
                      {savas.rakipKlan.rozet && (
                        <img src={savas.rakipKlan.rozet} alt="" width={34} height={34} />
                      )}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--vurgu)",
                        marginTop: 2,
                      }}
                    >
                      {savas.tur === "cwl" ? "🏆 Klan Savaş Ligi Aktif" : "⚔️ Klan Savaşı Aktif"} — Detaylı İnceleme İçin Tıkla ↗
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      opacity: 0.65,
                      fontSize: 14,
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    🛡️ Klan Savaşı: Şu an aktif bir savaş bulunmuyor
                  </button>
                )}
              </div>
            </section>

            {/* Savaş İstatistikleri ve BB Dağılımı */}
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
              <strong style={{ fontSize: 18 }}>⚔️ Klan Savaşı Geçmişi</strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, textAlign: "center" }}>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#22c55e" }}>{klan.savasGalibiyet}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Galibiyet</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#ef6b5f" }}>{klan.savasMaglubiyet}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Mağlubiyet</div>
                </div>
                <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--vurgu)" }}>{klan.savasSerisi}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>Galibiyet Serisi</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>Belediye Binası Dağılımı:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.entries(bbDagilimi)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([bb, adet]) => (
                      <span
                        key={bb}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          padding: "5px 10px",
                          borderRadius: 8,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                        }}
                      >
                        <BbGorsel seviye={Number(bb)} boyut={22} />
                        <span>× <strong>{adet}</strong></span>
                      </span>
                    ))}
                </div>
              </div>
            </section>
          </div>

          {/* Üye Listesi */}
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
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 20 }}>Üye Listesi ({klan.uyeler.length})</h3>
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
                    <th style={{ padding: "12px 10px" }}>Oyuncu</th>
                    <th style={{ padding: "12px 10px" }}>Rol</th>
                    <th style={{ padding: "12px 10px" }}>Kupa</th>
                    <th style={{ padding: "12px 10px" }}>Bağış / Alınan</th>
                  </tr>
                </thead>
                <tbody>
                  {siraliUyeler.map((u, idx) => (
                    <tr key={u.tag} style={{ borderBottom: "1px solid var(--cizgi)" }}>
                      <td style={{ padding: "12px 10px", opacity: 0.7 }}>{idx + 1}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <BbGorsel seviye={u.townHallLevel} boyut={32} />
                          <div>
                            <Link
                              href={"/?kod=" + u.tag.replace(/^#/, "")}
                              style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
                              title="Bu oyuncunun köyünü analiz et"
                            >
                              {u.name} ↗
                            </Link>
                            <div style={{ fontSize: 12, opacity: 0.65 }}>{u.tag}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 10px", fontSize: 14 }}>{ROL_TR[u.role] ?? u.role}</td>
                      <td style={{ padding: "12px 10px", fontWeight: 600 }}>🏆 {u.trophies}</td>
                      <td style={{ padding: "12px 10px", fontSize: 14 }}>
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>↑ {u.donations}</span> /{" "}
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

      {/* Site İçi Savaş & CWL İnceleme Penceresi (Modal) */}
      {savasPencereAcik && savas?.aktif && (
        <div
          onClick={() => setSavasPencereAcik(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 980,
              maxHeight: "88vh",
              overflowY: "auto",
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 18,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Pencere Üst Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22 }}>
                  {savas.tur === "cwl" ? `🏆 Klan Savaş Ligi (${savas.sezon ?? ""})` : "⚔️ Canlı Klan Savaşı"}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75 }}>
                  Oyuncu yıldız sıralamasını ve savaş sonuçlarını canlı olarak incele
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSavasPencereAcik(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✕ Kapat
              </button>
            </div>

            {/* Karşılaşma Skor Panosu */}
            {savas.bizimKlan && savas.rakipKlan && (
              <div
                style={{
                  padding: 18,
                  borderRadius: 14,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  {savas.bizimKlan.rozet && <img src={savas.bizimKlan.rozet} alt="" width={54} height={54} />}
                  <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{savas.bizimKlan.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>%{savas.bizimKlan.destructionPercentage.toFixed(1)} Yıkım</div>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: 30,
                    fontWeight: 900,
                    color: "var(--vurgu)",
                  }}
                >
                  ⭐ {savas.bizimKlan.stars} : {savas.rakipKlan.stars} ⭐
                </div>

                <div style={{ textAlign: "center" }}>
                  {savas.rakipKlan.rozet && <img src={savas.rakipKlan.rozet} alt="" width={54} height={54} />}
                  <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{savas.rakipKlan.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>%{savas.rakipKlan.destructionPercentage.toFixed(1)} Yıkım</div>
                </div>
              </div>
            )}

            {/* Sekme Seçimi */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSavasSekme("yildiz")}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 10,
                    border: "1px solid " + (savasSekme === "yildiz" ? "var(--vurgu)" : "var(--cizgi)"),
                    background: savasSekme === "yildiz" ? "var(--vurgu)" : "var(--bg)",
                    color: savasSekme === "yildiz" ? "#111" : "var(--fg)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ⭐ Oyuncu Yıldız Sıralaması
                </button>
                {savas.tur === "cwl" && (
                  <button
                    type="button"
                    onClick={() => setSavasSekme("grup")}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 10,
                      border: "1px solid " + (savasSekme === "grup" ? "var(--vurgu)" : "var(--cizgi)"),
                      background: savasSekme === "grup" ? "var(--vurgu)" : "var(--bg)",
                      color: savasSekme === "grup" ? "#111" : "var(--fg)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🏆 Lig Grubu & Diğer 7 Klan ({savas.grupKlanlari?.length ?? 8})
                  </button>
                )}
              </div>

              {savasSekme === "yildiz" && (
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={sadeceBizimKlan}
                    onChange={(e) => setSadeceBizimKlan(e.target.checked)}
                  />
                  Sadece {klan?.isim} üyelerini göster
                </label>
              )}
            </div>

            {/* Sekme 1: Oyuncu Yıldız Sıralaması */}
            {savasSekme === "yildiz" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                      <th style={{ padding: "10px 8px" }}>Sıra</th>
                      <th style={{ padding: "10px 8px" }}>Oyuncu</th>
                      <th style={{ padding: "10px 8px" }}>Klan</th>
                      <th style={{ padding: "10px 8px" }}>Saldırı</th>
                      <th style={{ padding: "10px 8px" }}>Toplam Yıldız</th>
                      <th style={{ padding: "10px 8px" }}>Yıkım</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrelenmisYildizlar.map((o, idx) => (
                      <tr
                        key={o.tag + idx}
                        style={{
                          borderBottom: "1px solid var(--cizgi)",
                          background: o.bizimKlan ? "rgba(245, 197, 66, 0.06)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <BbGorsel seviye={o.bbSeviyesi} boyut={26} />
                            <span style={{ fontWeight: 700 }}>{o.isim}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 8px", fontSize: 13, opacity: 0.8 }}>{o.klanAdi}</td>
                        <td style={{ padding: "10px 8px", fontWeight: 600 }}>
                          {o.saldiriSayisi}/{o.maksSaldiri}
                        </td>
                        <td style={{ padding: "10px 8px", fontWeight: 800, color: o.toplamYildiz > 0 ? "var(--vurgu)" : "inherit" }}>
                          ⭐ {o.toplamYildiz}
                        </td>
                        <td style={{ padding: "10px 8px", fontSize: 13 }}>%{o.toplamYuzde.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Sekme 2: CWL 8 Klanlık Grup Sıralaması ve Tur Maçları */}
            {savasSekme === "grup" && savas.tur === "cwl" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                        <th style={{ padding: "10px 8px" }}>#</th>
                        <th style={{ padding: "10px 8px" }}>Klan</th>
                        <th style={{ padding: "10px 8px" }}>Galibiyet</th>
                        <th style={{ padding: "10px 8px" }}>Toplam Yıldız</th>
                        <th style={{ padding: "10px 8px" }}>Toplam Yıkım</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(savas.grupKlanlari ?? []).map((g, i) => (
                        <tr
                          key={g.tag}
                          style={{
                            borderBottom: "1px solid var(--cizgi)",
                            background: g.tag === klan?.kod ? "rgba(245, 197, 66, 0.1)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px 8px", fontWeight: 800 }}>{i + 1}</td>
                          <td style={{ padding: "10px 8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {g.rozet && <img src={g.rozet} alt="" width={28} height={28} />}
                              <Link
                                href={"/klanlar?kod=" + g.tag.replace(/^#/, "")}
                                onClick={() => setSavasPencereAcik(false)}
                                style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700 }}
                              >
                                {g.name} ↗
                              </Link>
                            </div>
                          </td>
                          <td style={{ padding: "10px 8px", fontWeight: 700, color: "#22c55e" }}>{g.galibiyet}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 800 }}>⭐ {g.yildiz}</td>
                          <td style={{ padding: "10px 8px" }}>%{g.yuzde.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {savas.tumMaclar && savas.tumMaclar.length > 0 && (
                  <div>
                    <h4 style={{ margin: "0 0 10px", fontSize: 16 }}>Tur Karşılaşmaları</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
                      {savas.tumMaclar.map((m, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: "var(--bg)",
                            border: "1px solid var(--cizgi)",
                            fontSize: 13,
                          }}
                        >
                          <div style={{ opacity: 0.65, fontSize: 11, marginBottom: 6 }}>
                            Tur {m.tur} · {m.durum === "inWar" ? "🔴 Canlı" : m.durum === "warEnded" ? "✅ Bitti" : "⏳ Hazırlık"}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>{m.klan1.name}</span>
                            <span>⭐ {m.klan1.stars}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 4 }}>
                            <span>{m.klan2.name}</span>
                            <span>⭐ {m.klan2.stars}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function KlanlarSayfasi() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Yükleniyor...</main>}>
      <KlanlarIcerik />
    </Suspense>
  );
}
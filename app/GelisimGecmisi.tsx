"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { tr } from "./isimler";

export type ParcaOzet = {
  isim: string;
  seviye: number;
  azami: number;
};

type Detaylar = {
  kahramanlar?: Record<string, number>;
  ekipmanlar?: Record<string, number>;
  birlikler?: Record<string, number>;
  buyuler?: Record<string, number>;
  petler?: Record<string, number>;
  ekipmanToplam?: number;
  labYuzde?: number;
};

type Kayit = {
  gun: string;
  th_seviyesi: number;
  genel_yuzde: number;
  kupa: number;
  kahraman_toplam: number;
  detaylar?: Detaylar | null;
};

type Metrik = "genel_yuzde" | "kupa" | "kahraman_toplam" | "ekipman_toplam" | "lab_yuzde";

type YukseltmeSatiri = {
  kategori: "Kahraman" | "Ekipman" | "Birlik" | "Büyü" | "Hayvan";
  ikon: string;
  isim: string;
  eski: number;
  yeni: number;
  fark: number;
  maxOldu: boolean;
  yeniAcildi: boolean;
};

const METRIKLER: { id: Metrik; etiket: string; birim: string }[] = [
  { id: "genel_yuzde", etiket: "📊 Tamamlanma", birim: "%" },
  { id: "kupa", etiket: "🏆 Kupa", birim: "" },
  { id: "kahraman_toplam", etiket: "👑 Kahraman", birim: " sv" },
  { id: "ekipman_toplam", etiket: "🛡️ Ekipman", birim: " sv" },
  { id: "lab_yuzde", etiket: "🧪 Lab (%)", birim: "%" },
];

function haritaYap(liste: ParcaOzet[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const p of liste) {
    m[p.isim] = p.seviye;
  }
  return m;
}

function listeYuzde(liste: ParcaOzet[]): number {
  const toplamSv = liste.reduce((t, x) => t + Math.min(x.seviye, x.azami), 0);
  const toplamMax = liste.reduce((t, x) => t + x.azami, 0);
  return toplamMax > 0 ? Math.round((toplamSv / toplamMax) * 100) : 0;
}

function kisaTarih(gun: string) {
  const [y, m, d] = gun.split("-");
  if (!y || !m || !d) return gun;
  return `${d}.${m}`;
}

function farkYazi(fark: number, sonEk = "") {
  if (fark > 0) return `+${fark}${sonEk}`;
  if (fark < 0) return `${fark}${sonEk}`;
  return `0${sonEk}`;
}

function sureFormat(gun: number) {
  if (gun < 30) return `~${gun} gün`;
  const ay = Math.floor(gun / 30);
  const kalanGun = gun % 30;
  return kalanGun > 0 ? `~${ay} ay ${kalanGun} gün` : `~${ay} ay`;
}

function metrikDegeri(k: Kayit, metrik: Metrik): number {
  if (metrik === "ekipman_toplam") return k.detaylar?.ekipmanToplam ?? 0;
  if (metrik === "lab_yuzde") return k.detaylar?.labYuzde ?? 0;
  return k[metrik];
}

export default function GelisimGecmisi({
  kod,
  thSeviyesi,
  genelYuzde,
  kupa,
  kahramanlar,
  ekipmanlar,
  birlikler,
  buyuler,
  petler,
}: {
  kod: string;
  thSeviyesi: number;
  genelYuzde: number;
  kupa: number;
  kahramanlar: ParcaOzet[];
  ekipmanlar: ParcaOzet[];
  birlikler: ParcaOzet[];
  buyuler: ParcaOzet[];
  petler: ParcaOzet[];
}) {
  const [kayitlar, setKayitlar] = useState<Kayit[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [metrik, setMetrik] = useState<Metrik>("genel_yuzde");
  const [gunlukFiltre, setGunlukFiltre] = useState<"Tümü" | YukseltmeSatiri["kategori"]>("Tümü");

  const kahramanToplam = kahramanlar.reduce((t, k) => t + k.seviye, 0);
  const ekipmanToplam = ekipmanlar.reduce((t, e) => t + e.seviye, 0);
  const labYuzde = listeYuzde([...birlikler, ...buyuler]);

  useEffect(() => {
    let iptal = false;
    const temizKod = kod.trim().toUpperCase().replace(/^#/, "");
    const bugun = new Date().toISOString().slice(0, 10);

    const detaylar: Detaylar = {
      kahramanlar: haritaYap(kahramanlar),
      ekipmanlar: haritaYap(ekipmanlar),
      birlikler: haritaYap(birlikler),
      buyuler: haritaYap(buyuler),
      petler: haritaYap(petler),
      ekipmanToplam,
      labYuzde,
    };

    async function senkronizeEt() {
      setYukleniyor(true);

      await supabase.from("koy_gecmisi").upsert(
        {
          kod: "#" + temizKod,
          gun: bugun,
          th_seviyesi: thSeviyesi,
          genel_yuzde: genelYuzde,
          kupa,
          kahraman_toplam: kahramanToplam,
          detaylar,
        },
        { onConflict: "kod,gun" }
      );

      const { data } = await supabase
        .from("koy_gecmisi")
        .select("gun, th_seviyesi, genel_yuzde, kupa, kahraman_toplam, detaylar")
        .eq("kod", "#" + temizKod)
        .order("gun", { ascending: true })
        .limit(30);

      if (!iptal) {
        setKayitlar((data as Kayit[]) ?? []);
        setYukleniyor(false);
      }
    }

    senkronizeEt();
    return () => {
      iptal = true;
    };
  }, [kod, thSeviyesi, genelYuzde, kupa, kahramanToplam, ekipmanToplam, labYuzde]);

  const ilk = kayitlar[0];
  const son = kayitlar[kayitlar.length - 1];
  const aktifMetrik = METRIKLER.find((m) => m.id === metrik) ?? METRIKLER[0];

  // Detaylı yükseltme karşılaştırması (detayları dolu ilk kayıt ile son kayıt arası)
  const detayliKayitlar = kayitlar.filter((k) => k.detaylar && k.detaylar.kahramanlar);
  const detayIlk = detayliKayitlar[0];
  const detaySon = detayliKayitlar[detayliKayitlar.length - 1];

  const yukseltmeler: YukseltmeSatiri[] = [];
  if (detayIlk && detaySon && detayIlk.gun !== detaySon.gun) {
    const kiyasla = (
      kategori: YukseltmeSatiri["kategori"],
      ikon: string,
      guncelListe: ParcaOzet[],
      eskiHarita?: Record<string, number>,
      yeniHarita?: Record<string, number>
    ) => {
      if (!eskiHarita || !yeniHarita) return;
      for (const p of guncelListe) {
        const yeniSv = yeniHarita[p.isim] ?? p.seviye;
        const eskiSv = eskiHarita[p.isim];
        if (eskiSv === undefined && yeniSv > 0) {
          yukseltmeler.push({
            kategori,
            ikon,
            isim: p.isim,
            eski: 0,
            yeni: yeniSv,
            fark: yeniSv,
            maxOldu: yeniSv >= p.azami,
            yeniAcildi: true,
          });
        } else if (eskiSv !== undefined && yeniSv > eskiSv) {
          yukseltmeler.push({
            kategori,
            ikon,
            isim: p.isim,
            eski: eskiSv,
            yeni: yeniSv,
            fark: yeniSv - eskiSv,
            maxOldu: eskiSv < p.azami && yeniSv >= p.azami,
            yeniAcildi: false,
          });
        }
      }
    };

    kiyasla("Kahraman", "👑", kahramanlar, detayIlk.detaylar?.kahramanlar, detaySon.detaylar?.kahramanlar);
    kiyasla("Ekipman", "🛡️", ekipmanlar, detayIlk.detaylar?.ekipmanlar, detaySon.detaylar?.ekipmanlar);
    kiyasla("Birlik", "⚔️", birlikler, detayIlk.detaylar?.birlikler, detaySon.detaylar?.birlikler);
    kiyasla("Büyü", "⚡", buyuler, detayIlk.detaylar?.buyuler, detaySon.detaylar?.buyuler);
    kiyasla("Hayvan", "🐾", petler, detayIlk.detaylar?.petler, detaySon.detaylar?.petler);

    yukseltmeler.sort((a, b) => Number(b.maxOldu) - Number(a.maxOldu) || b.fark - a.fark);
  }

  const fullenenler = yukseltmeler.filter((y) => y.maxOldu);
  const toplamBasilanSeviye = yukseltmeler.reduce((t, y) => t + y.fark, 0);
  const bbAtladi = ilk && son && son.th_seviyesi > ilk.th_seviyesi;

  // Tahmini fulleme süresi hesabı
  let tahminiFulleme: string | null = null;
  if (ilk && son && ilk.gun !== son.gun && son.genel_yuzde > ilk.genel_yuzde && son.genel_yuzde < 100) {
    const gunFarki = Math.max(
      1,
      Math.round((new Date(son.gun).getTime() - new Date(ilk.gun).getTime()) / 86_400_000)
    );
    const gunlukHiz = (son.genel_yuzde - ilk.genel_yuzde) / gunFarki;
    if (gunlukHiz > 0) {
      const kalanGun = Math.round((100 - son.genel_yuzde) / gunlukHiz);
      if (kalanGun > 0 && kalanGun <= 1800) {
        tahminiFulleme = sureFormat(kalanGun);
      }
    }
  }

  // Grafik verisi (ekipman veya lab seçiliyse detayı olan kayıtları çiz)
  const grafikKayitlari =
    metrik === "ekipman_toplam" || metrik === "lab_yuzde"
      ? kayitlar.filter((k) => k.detaylar && (k.detaylar.ekipmanToplam !== undefined || k.detaylar.labYuzde !== undefined))
      : kayitlar;

  const W = 820;
  const H = 220;
  const padX = 48;
  const padY = 28;

  const degerler = grafikKayitlari.map((k) => metrikDegeri(k, metrik));
  const minVal = degerler.length ? Math.min(...degerler) : 0;
  const maxVal = degerler.length ? Math.max(...degerler) : 100;
  const aralik = Math.max(1, maxVal - minVal);

  const noktalar = grafikKayitlari.map((k, i) => {
    const x =
      grafikKayitlari.length === 1
        ? W / 2
        : padX + (i / (grafikKayitlari.length - 1)) * (W - padX * 2);
    const oran = (metrikDegeri(k, metrik) - minVal) / aralik;
    const y = H - padY - oran * (H - padY * 2);
    return { x, y, kayit: k, deger: metrikDegeri(k, metrik) };
  });

  const cizgiYolu = noktalar.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ");
  const alanYolu =
    noktalar.length >= 2
      ? `${cizgiYolu} L ${noktalar[noktalar.length - 1].x} ${H - padY} L ${noktalar[0].x} ${H - padY} Z`
      : "";

  const gorunenYukseltmeler =
    gunlukFiltre === "Tümü" ? yukseltmeler : yukseltmeler.filter((y) => y.kategori === gunlukFiltre);

  return (
    <section
      style={{
        padding: 24,
        background: "var(--kart)",
        border: "1px solid var(--cizgi)",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* ÜST BAŞLIK & GRAFİK SEKMELERİ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
            <span>📈 Köy Gelişim Geçmişi & Yükseltme Günlüğü</span>
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.72 }}>
            Köy her sorgulandığında kahraman, ekipman, birlik, büyü ve hayvan seviyeleri günlük kaydedilir (Son {kayitlar.length} kayıt).
          </p>
        </div>

        {kayitlar.length >= 2 && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {METRIKLER.map((m) => {
              const secili = m.id === metrik;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetrik(m.id)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 10,
                    border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                    background: secili ? "var(--vurgu)" : "var(--bg)",
                    color: secili ? "#111" : "var(--fg)",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {m.etiket}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {yukleniyor ? (
        <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>Gelişim geçmişi yükleniyor...</p>
      ) : kayitlar.length <= 1 ? (
        <div
          style={{
            padding: "18px 20px",
            borderRadius: 14,
            background: "var(--bg)",
            border: "1px dashed var(--vurgu)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong style={{ fontSize: 15, color: "var(--vurgu)" }}>✓ Bugünün detaylı ilk kaydı alındı!</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, opacity: 0.8 }}>
              İlerleyen günlerde köyünü tekrar arattığında çizgi grafik, bastığın tüm seviyeler ve fullediğin birimler burada otomatik listelenecek.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12.5, fontWeight: 800 }}>
            <span style={{ padding: "6px 10px", borderRadius: 9, background: "var(--kart)", border: "1px solid var(--cizgi)" }}>
              📊 %{genelYuzde}
            </span>
            <span style={{ padding: "6px 10px", borderRadius: 9, background: "var(--kart)", border: "1px solid var(--cizgi)" }}>
              👑 {kahramanToplam} sv
            </span>
            <span style={{ padding: "6px 10px", borderRadius: 9, background: "var(--kart)", border: "1px solid var(--cizgi)" }}>
              🛡️ {ekipmanToplam} sv
            </span>
            <span style={{ padding: "6px 10px", borderRadius: 9, background: "var(--kart)", border: "1px solid var(--cizgi)" }}>
              🧪 Lab %{labYuzde}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* ÖZET KARTLARI */}
          {ilk && son && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 10 }}>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Tamamlanma Değişimi</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: "#22c55e", marginTop: 3 }}>
                  {farkYazi(son.genel_yuzde - ilk.genel_yuzde, "%")}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Toplam Basılan Seviye</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: "var(--vurgu)", marginTop: 3 }}>
                  {farkYazi(toplamBasilanSeviye, " sv")}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Kupa Değişimi</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: son.kupa >= ilk.kupa ? "#22c55e" : "#ef6b5f", marginTop: 3 }}>
                  {farkYazi(son.kupa - ilk.kupa)}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {bbAtladi ? "Belediye Yükseltmesi" : "Tahmini BB Fulleme"}
                </div>
                <div style={{ fontSize: 19, fontWeight: 900, color: "var(--vurgu)", marginTop: 3 }}>
                  {bbAtladi
                    ? `🏰 BB ${ilk.th_seviyesi} → ${son.th_seviyesi}`
                    : tahminiFulleme ?? (son.genel_yuzde >= 100 ? "🎉 MAX!" : "Veri toplanıyor")}
                </div>
              </div>
            </div>
          )}

          {/* ÇİZGİ GRAFİK (SVG) */}
          {grafikKayitlari.length >= 2 ? (
            <div style={{ background: "var(--bg)", border: "1px solid var(--cizgi)", borderRadius: 14, padding: "14px 10px 8px", overflowX: "auto" }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 520, height: "auto", display: "block" }}>
                <defs>
                  <linearGradient id="sargytGrafikDolgu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--vurgu)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--vurgu)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {alanYolu && <path d={alanYolu} fill="url(#sargytGrafikDolgu)" />}
                <path d={cizgiYolu} fill="none" stroke="var(--vurgu)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                {noktalar.map((n, i) => (
                  <g key={n.kayit.gun}>
                    <circle cx={n.x} cy={n.y} r="5.5" fill="var(--kart)" stroke="var(--vurgu)" strokeWidth="3" />
                    <text x={n.x} y={n.y - 12} textAnchor="middle" fill="var(--fg)" fontSize="12" fontWeight="800">
                      {n.deger}
                      {aktifMetrik.birim}
                    </text>
                    {(grafikKayitlari.length <= 10 || i === 0 || i === grafikKayitlari.length - 1 || i % 2 === 0) && (
                      <text x={n.x} y={H - 6} textAnchor="middle" fill="var(--fg)" opacity="0.65" fontSize="11.5" fontWeight="600">
                        {kisaTarih(n.kayit.gun)}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          ) : (
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg)", fontSize: 13.5, opacity: 0.78 }}>
              Bu metrik için en az 2 detaylı günlük kayıt oluştuğunda grafik otomatik çizilecek.
            </div>
          )}

          {/* BU DÖNEMDE FULLENENLER ŞERİDİ */}
          {fullenenler.length > 0 && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <strong style={{ fontSize: 14, color: "#22c55e" }}>
                🎉 Bu Dönemde Fullediklerin ({fullenenler.length})
              </strong>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {fullenenler.map((f) => (
                  <span
                    key={f.kategori + f.isim}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 9,
                      background: "var(--bg)",
                      border: "1px solid rgba(34, 197, 94, 0.5)",
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    {f.ikon} {tr(f.isim)} (Sv. {f.yeni} MAX)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* YÜKSELTME GÜNLÜĞÜ (NELER BASILDI?) */}
          {detayIlk && detaySon && detayIlk.gun !== detaySon.gun && (
            <div style={{ borderTop: "1px solid var(--cizgi)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 15 }}>
                  📜 Yükseltme Günlüğü ({kisaTarih(detayIlk.gun)} → {kisaTarih(detaySon.gun)})
                </strong>

                {yukseltmeler.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(["Tümü", "Kahraman", "Ekipman", "Birlik", "Büyü", "Hayvan"] as const).map((kat) => {
                      const adet = kat === "Tümü" ? yukseltmeler.length : yukseltmeler.filter((y) => y.kategori === kat).length;
                      if (kat !== "Tümü" && adet === 0) return null;
                      const secili = gunlukFiltre === kat;
                      return (
                        <button
                          key={kat}
                          type="button"
                          onClick={() => setGunlukFiltre(kat)}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                            background: secili ? "var(--vurgu)" : "var(--bg)",
                            color: secili ? "#111" : "var(--fg)",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          {kat} ({adet})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {gorunenYukseltmeler.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13.5, opacity: 0.72 }}>
                  {kisaTarih(detayIlk.gun)} tarihinden bu yana henüz yeni bir seviye artışı algılanmadı.
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(235px, 1fr))", gap: 10 }}>
                  {gorunenYukseltmeler.map((y) => (
                    <div
                      key={y.kategori + y.isim}
                      style={{
                        padding: "10px 13px",
                        borderRadius: 11,
                        background: "var(--bg)",
                        border: "1px solid " + (y.maxOldu ? "rgba(34, 197, 94, 0.55)" : "var(--cizgi)"),
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {y.ikon} {tr(y.isim)}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.72, marginTop: 2 }}>
                          {y.yeniAcildi ? `Yeni açıldı · Sv. ${y.yeni}` : `Sv. ${y.eski} → ${y.yeni}`}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 900,
                          flexShrink: 0,
                          background: y.maxOldu ? "rgba(34, 197, 94, 0.18)" : "rgba(56, 189, 248, 0.15)",
                          color: y.maxOldu ? "#22c55e" : "var(--vurgu)",
                        }}
                      >
                        {y.maxOldu ? "MAX!" : `+${y.fark}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
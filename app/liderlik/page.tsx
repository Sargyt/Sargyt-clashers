"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type HamKayit = {
  kod: string;
  gun: string;
  th_seviyesi: number;
  genel_yuzde: number;
  kupa: number;
  kahraman_toplam: number;
  detaylar?: {
    isim?: string;
    klan?: string | null;
    ekipmanToplam?: number;
    labYuzde?: number;
  } | null;
};

type LiderOyuncu = {
  kod: string;
  isim: string;
  klan: string | null;
  gun: string;
  thSeviyesi: number;
  genelYuzde: number;
  kupa: number;
  kahramanToplam: number;
  ekipmanToplam: number;
  labYuzde: number;
};

type SiralamaTur =
  | "genelYuzde"
  | "kupa"
  | "kahramanToplam"
  | "ekipmanToplam"
  | "labYuzde";

const SEKMELER: { id: SiralamaTur; etiket: string; birim: string }[] = [
  { id: "genelYuzde", etiket: "📊 Tamamlanma", birim: "%" },
  { id: "kupa", etiket: "🏆 Kupa", birim: "" },
  { id: "kahramanToplam", etiket: "👑 Kahraman", birim: " sv" },
  { id: "ekipmanToplam", etiket: "🛡️ Ekipman", birim: " sv" },
  { id: "labYuzde", etiket: "🧪 Laboratuvar", birim: "%" },
];

const MADALYALAR = [
  { ikon: "🥇", renk: "#f59e0b", cerceve: "rgba(245, 158, 11, 0.55)" },
  { ikon: "🥈", renk: "#cbd5e1", cerceve: "rgba(203, 213, 225, 0.45)" },
  { ikon: "🥉", renk: "#d97706", cerceve: "rgba(217, 119, 6, 0.45)" },
];

function tarihKisa(gun: string) {
  const [y, m, d] = gun.split("-");
  if (!y || !m || !d) return gun;
  return `${d}.${m}.${y}`;
}

export default function LiderlikSayfasi() {
  const [oyuncular, setOyuncular] = useState<LiderOyuncu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [siralama, setSiralama] = useState<SiralamaTur>("genelYuzde");
  const [bbFiltre, setBbFiltre] = useState<number>(0);
  const [arama, setArama] = useState("");

  useEffect(() => {
    async function getir() {
      setYukleniyor(true);
      const { data } = await supabase
        .from("koy_gecmisi")
        .select("kod, gun, th_seviyesi, genel_yuzde, kupa, kahraman_toplam, detaylar")
        .order("gun", { ascending: false })
        .limit(500);

      const enGuncel = new Map<string, LiderOyuncu>();
      for (const satir of (data as HamKayit[]) ?? []) {
        if (enGuncel.has(satir.kod)) continue;
        enGuncel.set(satir.kod, {
          kod: satir.kod,
          isim: satir.detaylar?.isim?.trim() || satir.kod,
          klan: satir.detaylar?.klan ?? null,
          gun: satir.gun,
          thSeviyesi: satir.th_seviyesi,
          genelYuzde: satir.genel_yuzde,
          kupa: satir.kupa,
          kahramanToplam: satir.kahraman_toplam,
          ekipmanToplam: satir.detaylar?.ekipmanToplam ?? 0,
          labYuzde: satir.detaylar?.labYuzde ?? 0,
        });
      }

      setOyuncular(Array.from(enGuncel.values()));
      setYukleniyor(false);
    }

    getir();
  }, []);

  const aktifSekme = SEKMELER.find((s) => s.id === siralama) ?? SEKMELER[0];
  const aranan = arama.trim().toLowerCase();

  const sirali = oyuncular
    .filter((o) => {
      if (bbFiltre > 0) {
        if (bbFiltre === 15) {
          if (o.thSeviyesi > 15) return false;
        } else if (o.thSeviyesi !== bbFiltre) {
          return false;
        }
      }
      if (aranan) {
        const eslesme =
          o.isim.toLowerCase().includes(aranan) ||
          o.kod.toLowerCase().includes(aranan) ||
          (o.klan ?? "").toLowerCase().includes(aranan);
        if (!eslesme) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        b[siralama] - a[siralama] ||
        b.thSeviyesi - a.thSeviyesi ||
        b.kupa - a.kupa
    );

  const podyum = sirali.slice(0, 3);

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1320, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ÜST BAŞLIK */}
      <section
        style={{
          padding: "24px 28px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px" }}>
            🏆 Sargyt Liderlik Tablosu
          </h1>
          <p style={{ margin: 0, opacity: 0.78, fontSize: 15 }}>
            Siteye girilen en güçlü köylerin canlı sıralaması ({oyuncular.length} kayıtlı köy). Listeye girmek için Ana Sayfa&apos;da köyünü aratman yeterli!
          </p>
        </div>

        <Link
          href="/"
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            background: "var(--vurgu)",
            color: "var(--vurgu-yazi)",
            fontWeight: 900,
            fontSize: 14.5,
            textDecoration: "none",
          }}
        >
          + Köyünü Listeye Ekle ↗
        </Link>
      </section>

      {/* SIRALAMA & FİLTRE ÇUBUĞU */}
      <section style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {SEKMELER.map((s) => {
          const secili = s.id === siralama;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSiralama(s.id)}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                background: secili ? "var(--vurgu)" : "var(--kart)",
                color: secili ? "var(--vurgu-yazi)" : "var(--fg)",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              {s.etiket}
            </button>
          );
        })}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="İsim, kod veya klan ara..."
            maxLength={30}
            style={{
              padding: "9px 13px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--kart)",
              color: "var(--fg)",
              fontSize: 13.5,
              minWidth: 190,
            }}
          />
          <select
            value={bbFiltre}
            onChange={(e) => setBbFiltre(Number(e.target.value))}
            style={{
              padding: "9px 13px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--kart)",
              color: "var(--fg)",
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            <option value={0}>Tüm Belediyeler</option>
            <option value={19}>Sadece BB 19</option>
            <option value={18}>Sadece BB 18</option>
            <option value={17}>Sadece BB 17</option>
            <option value={16}>Sadece BB 16</option>
            <option value={15}>BB 15 ve Altı</option>
          </select>
        </div>
      </section>

      {yukleniyor ? (
        <p style={{ opacity: 0.75 }}>Liderlik tablosu yükleniyor...</p>
      ) : sirali.length === 0 ? (
        <div
          style={{
            padding: 36,
            textAlign: "center",
            background: "var(--kart)",
            border: "1px dashed var(--cizgi)",
            borderRadius: 16,
            opacity: 0.8,
          }}
        >
          Bu filtrede kayıtlı köy bulunamadı.
        </div>
      ) : (
        <>
          {/* İLK 3 PODYUM KARTLARI */}
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 16 }}>
            {podyum.map((o, idx) => {
              const m = MADALYALAR[idx];
              const temizKod = o.kod.replace(/^#/, "");
              return (
                <article
                  key={o.kod}
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    background: "var(--kart)",
                    border: `2px solid ${m.cerceve}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: m.renk }}>
                        {m.ikon} {idx + 1}. SIRA · BB {o.thSeviyesi}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {o.isim}
                      </div>
                      <div style={{ fontSize: 12.5, opacity: 0.72, marginTop: 2 }}>
                        {o.kod} {o.klan ? `· 🛡️ ${o.klan}` : ""}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 26, fontWeight: 950, color: "var(--vurgu)", lineHeight: 1 }}>
                        {o[siralama].toLocaleString("tr-TR")}
                        {aktifSekme.birim}
                      </div>
                      <div style={{ fontSize: 11.5, opacity: 0.68, marginTop: 4 }}>
                        {aktifSekme.etiket}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, fontWeight: 700, opacity: 0.85 }}>
                    <span style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg)" }}>📊 %{o.genelYuzde}</span>
                    <span style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg)" }}>🏆 {o.kupa}</span>
                    <span style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg)" }}>👑 {o.kahramanToplam}</span>
                    <span style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg)" }}>🛡️ {o.ekipmanToplam}</span>
                  </div>

                  <Link
                    href={`/?kod=${temizKod}`}
                    style={{
                      textAlign: "center",
                      padding: "9px 12px",
                      borderRadius: 10,
                      background: "var(--bg)",
                      border: "1px solid var(--vurgu)",
                      color: "var(--vurgu)",
                      fontWeight: 800,
                      fontSize: 13.5,
                      textDecoration: "none",
                    }}
                  >
                    🔍 Köyü İncele ↗
                  </Link>
                </article>
              );
            })}
          </section>

          {/* TAM SIRALAMA TABLOSU */}
          <section style={{ padding: 22, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 740 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--cizgi)", textAlign: "left", fontSize: 12.5, opacity: 0.72 }}>
                    <th style={{ padding: "10px 8px" }}>#</th>
                    <th style={{ padding: "10px 8px" }}>Oyuncu / Klan</th>
                    <th style={{ padding: "10px 8px" }}>BB</th>
                    <th style={{ padding: "10px 8px" }}>Tamamlanma</th>
                    <th style={{ padding: "10px 8px" }}>Kupa</th>
                    <th style={{ padding: "10px 8px" }}>Kahraman</th>
                    <th style={{ padding: "10px 8px" }}>Ekipman</th>
                    <th style={{ padding: "10px 8px" }}>Son Güncelleme</th>
                    <th style={{ padding: "10px 8px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sirali.map((o, idx) => {
                    const temizKod = o.kod.replace(/^#/, "");
                    return (
                      <tr key={o.kod} style={{ borderBottom: "1px solid var(--cizgi)", fontSize: 14 }}>
                        <td style={{ padding: "11px 8px", fontWeight: 900, opacity: 0.8 }}>
                          {idx < 3 ? MADALYALAR[idx].ikon : idx + 1}
                        </td>
                        <td style={{ padding: "11px 8px" }}>
                          <div style={{ fontWeight: 800 }}>{o.isim}</div>
                          <div style={{ fontSize: 12, opacity: 0.68 }}>
                            {o.kod} {o.klan ? `· ${o.klan}` : ""}
                          </div>
                        </td>
                        <td style={{ padding: "11px 8px", fontWeight: 800 }}>BB {o.thSeviyesi}</td>
                        <td style={{ padding: "11px 8px", fontWeight: siralama === "genelYuzde" ? 900 : 600, color: siralama === "genelYuzde" ? "var(--vurgu)" : "inherit" }}>
                          %{o.genelYuzde}
                        </td>
                        <td style={{ padding: "11px 8px", fontWeight: siralama === "kupa" ? 900 : 600, color: siralama === "kupa" ? "var(--vurgu)" : "inherit" }}>
                          {o.kupa.toLocaleString("tr-TR")}
                        </td>
                        <td style={{ padding: "11px 8px", fontWeight: siralama === "kahramanToplam" ? 900 : 600, color: siralama === "kahramanToplam" ? "var(--vurgu)" : "inherit" }}>
                          {o.kahramanToplam} sv
                        </td>
                        <td style={{ padding: "11px 8px", fontWeight: siralama === "ekipmanToplam" ? 900 : 600, color: siralama === "ekipmanToplam" ? "var(--vurgu)" : "inherit" }}>
                          {o.ekipmanToplam} sv
                        </td>
                        <td style={{ padding: "11px 8px", fontSize: 12.5, opacity: 0.68 }}>
                          {tarihKisa(o.gun)}
                        </td>
                        <td style={{ padding: "11px 8px", textAlign: "right" }}>
                          <Link
                            href={`/?kod=${temizKod}`}
                            style={{
                              padding: "6px 11px",
                              borderRadius: 8,
                              border: "1px solid var(--cizgi)",
                              background: "var(--bg)",
                              color: "var(--vurgu)",
                              fontWeight: 800,
                              fontSize: 12.5,
                              textDecoration: "none",
                            }}
                          >
                            İncele ↗
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
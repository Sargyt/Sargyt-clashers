"use client";
import { useState, type FormEvent } from "react";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type SavasOyuncu = {
  tag: string;
  isim: string;
  bbSeviyesi: number;
  haritaSirasi: number;
  bizimKlan: boolean;
  saldiriSayisi: number;
  maksSaldiri: number;
  toplamYildiz: number;
};

type PlanSatiri = {
  sira: number;
  isim: string;
  bb: number;
  hedef1: number;
  hedef2: number | null;
  not: string;
  saldirdiMi: boolean;
};

type RakipSatiri = {
  sira: number;
  isim: string;
  bb: number;
};

const DEMO_BIZIM: PlanSatiri[] = Array.from({ length: 15 }, (_, i) => ({
  sira: i + 1,
  isim: ["Sargyt", "Kaan", "Efe", "Baran", "Mert", "Emre", "Arda", "Yusuf", "Burak", "Kerem", "Deniz", "Umut", "Oğuz", "Furkan", "Taha"][i],
  bb: i < 3 ? 19 : i < 7 ? 18 : i < 11 ? 17 : 16,
  hedef1: i + 1,
  hedef2: null,
  not: "",
  saldirdiMi: false,
}));

const DEMO_RAKIP: RakipSatiri[] = Array.from({ length: 15 }, (_, i) => ({
  sira: i + 1,
  isim: `Rakip #${i + 1}`,
  bb: i < 2 ? 19 : i < 6 ? 18 : i < 11 ? 17 : 15,
}));

export default function SavasPlanlayiciSayfasi() {
  const [kod, setKod] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");

  const [klanAdi, setKlanAdi] = useState("");
  const [rakipAdi, setRakipAdi] = useState("");
  const [savasTuru, setSavasTuru] = useState<"normal" | "cwl">("normal");
  const [plan, setPlan] = useState<PlanSatiri[]>([]);
  const [rakipler, setRakipler] = useState<RakipSatiri[]>([]);
  const [kopyalandi, setKopyalandi] = useState(false);

  async function savasYukle(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setHata("");
    setBilgi("");

    if (!KOD_KURALI.test(temiz)) {
      setHata("Geçerli bir klan kodu gir. Örn: #2G8Q20UQ0");
      return;
    }

    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/savas?kod=" + temiz);
      const veri = await yanit.json();

      if (!veri.aktif || !Array.isArray(veri.oyuncuSiralamasi) || veri.oyuncuSiralamasi.length === 0) {
        setHata(veri.mesaj ?? "Bu klanda şu an aktif bir savaş bulunamadı. Aşağıdan Demo 15v15 ile deneyebilirsin.");
        setYukleniyor(false);
        return;
      }

      const tumOyuncular: SavasOyuncu[] = veri.oyuncuSiralamasi;
      const bizimkiler = tumOyuncular
        .filter((o) => o.bizimKlan)
        .sort((a, b) => a.haritaSirasi - b.haritaSirasi);

      const rakipTag = veri.rakipKlan?.tag;
      const rakiplerHam = tumOyuncular
        .filter((o) => !o.bizimKlan && (!rakipTag || o.tag !== ""))
        .sort((a, b) => a.haritaSirasi - b.haritaSirasi)
        .slice(0, bizimkiler.length);

      const cwlMi = veri.tur === "cwl";
      setSavasTuru(cwlMi ? "cwl" : "normal");
      setKlanAdi(veri.bizimKlan?.name ?? "Bizim Klan");
      setRakipAdi(veri.rakipKlan?.name ?? "Rakip Klan");

      setRakipler(
        rakiplerHam.map((r, idx) => ({
          sira: r.haritaSirasi || idx + 1,
          isim: r.isim,
          bb: r.bbSeviyesi,
        }))
      );

      setPlan(
        bizimkiler.map((o, idx) => ({
          sira: o.haritaSirasi || idx + 1,
          isim: o.isim,
          bb: o.bbSeviyesi,
          hedef1: o.haritaSirasi || idx + 1,
          hedef2: null,
          not: "",
          saldirdiMi: o.saldiriSayisi >= o.maksSaldiri,
        }))
      );

      setBilgi(`✓ ${cwlMi ? "CWL" : "Klan Savaşı"} kadrosu (${bizimkiler.length}v${bizimkiler.length}) canlı olarak çekildi!`);
    } catch {
      setHata("Savaş verisi çekilirken bağlantı hatası oluştu.");
    }
    setYukleniyor(false);
  }

  function demoYukle() {
    setHata("");
    setSavasTuru("normal");
    setKlanAdi("JÖN TÜRKLER (Demo)");
    setRakipAdi("Dark Knights (Demo)");
    setPlan(DEMO_BIZIM.map((p) => ({ ...p })));
    setRakipler(DEMO_RAKIP.map((r) => ({ ...r })));
    setBilgi("🎮 Örnek 15v15 savaş yüklendi! Yukarıdaki strateji butonlarıyla hedefleri anında dağıtabilirsin.");
  }

  function stratejiUygula(mod: "ayna" | "birAlt" | "ikiAlt") {
    const n = plan.length;
    if (n === 0) return;
    setPlan((eski) =>
      eski.map((p, idx) => {
        const sira = idx + 1;
        let hedef = sira;
        if (mod === "birAlt") hedef = sira === n ? 1 : sira + 1;
        if (mod === "ikiAlt") hedef = sira + 2 > n ? ((sira + 1) % n) + 1 : sira + 2;
        return {
          ...p,
          hedef1: hedef,
          not:
            mod === "ayna"
              ? "Ayna hedef"
              : mod === "birAlt"
                ? sira === n
                  ? "1 numara keşif / temizlik"
                  : "1 altına güvenli 3★"
                : "2 altına garanti 3★",
        };
      })
    );
  }

  function satirGuncelle(index: number, alan: "hedef1" | "hedef2" | "not", deger: number | string | null) {
    setPlan((eski) => eski.map((p, i) => (i === index ? { ...p, [alan]: deger } : p)));
  }

  async function planiKopyala() {
    if (plan.length === 0) return;
    const baslik = `⚔️ *${klanAdi} vs ${rakipAdi}* (${savasTuru === "cwl" ? "CWL" : "Klan Savaşı"} Hedef Planı)\n━━━━━━━━━━━━━━━━━━`;
    const satirlar = plan.map((p) => {
      const rakip1 = rakipler.find((r) => r.sira === p.hedef1);
      const h1Yazi = `#${p.hedef1}${rakip1 ? ` (BB${rakip1.bb})` : ""}`;
      const h2Yazi = p.hedef2 ? ` + #${p.hedef2}` : "";
      const notYazi = p.not.trim() ? ` · _${p.not.trim()}_` : "";
      const durum = p.saldirdiMi ? " ✅" : "";
      return `${p.sira}. *${p.isim}* (BB${p.bb}) ➔ 🎯 ${h1Yazi}${h2Yazi}${notYazi}${durum}`;
    });
    const metin = `${baslik}\n${satirlar.join("\n")}\n━━━━━━━━━━━━━━━━━━\n📋 Sargyt Clashers Savaş Planlayıcı`;

    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2500);
    } catch {}
  }

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST ARAMA & DEMO */}
      <section
        style={{
          padding: "24px 28px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 22,
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>
          ⚔️ Savaş & CWL Hedef Planlayıcısı
        </h1>
        <p style={{ margin: "0 0 18px", opacity: 0.78, fontSize: 15 }}>
          Aktif savaş kadronu klan kodunla çek, tek tıkla Ayna veya Kaydırmalı strateji uygula ve WhatsApp/Discord&apos;a hazır savaş emri kopyala.
        </p>

        <form onSubmit={savasYukle} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="Klan kodu girin, örn: #2G8Q20UQ0"
            maxLength={14}
            style={{
              flex: 1,
              minWidth: 220,
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 15.5,
            }}
          />
          <button
            disabled={yukleniyor}
            style={{
              padding: "13px 22px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "var(--vurgu-yazi)",
              fontSize: 15,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "Çekiliyor..." : "🔍 Aktif Savaşı Çek"}
          </button>
          <button
            type="button"
            onClick={demoYukle}
            style={{
              padding: "13px 18px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 14.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🎮 Demo 15v15 Yükle
          </button>
        </form>

        {hata && <p style={{ color: "#ef6b5f", marginTop: 12, marginBottom: 0, fontWeight: 700 }}>{hata}</p>}
        {bilgi && <p style={{ color: "#22c55e", marginTop: 12, marginBottom: 0, fontWeight: 700 }}>{bilgi}</p>}
      </section>

      {/* PLANLAMA MASASI */}
      {plan.length > 0 && (
        <section
          style={{
            padding: 24,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* STRATEJİ & KOPYALA BAR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                🛡️ {klanAdi} <span style={{ opacity: 0.55 }}>vs</span> 🔥 {rakipAdi}
              </div>
              <div style={{ fontSize: 13, opacity: 0.72, marginTop: 2 }}>
                {savasTuru === "cwl" ? "Klan Savaş Ligi (1 Saldırı)" : "Klan Savaşı (2 Saldırı)"} · {plan.length}v{plan.length}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => stratejiUygula("ayna")}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🪞 Ayna (1→1)
              </button>
              <button
                type="button"
                onClick={() => stratejiUygula("birAlt")}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ⬇️ 1 Altına Vur
              </button>
              <button
                type="button"
                onClick={() => stratejiUygula("ikiAlt")}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ⬇️ 2 Altına Vur
              </button>
              <button
                type="button"
                onClick={planiKopyala}
                style={{
                  padding: "9px 18px",
                  borderRadius: 10,
                  border: 0,
                  background: "var(--vurgu)",
                  color: "var(--vurgu-yazi)",
                  fontWeight: 900,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                {kopyalandi ? "✓ Plan Kopyalandı!" : "📋 WhatsApp / Discord Kopyala"}
              </button>
            </div>
          </div>

          {/* HEDEF TABLOSU */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cizgi)", textAlign: "left", fontSize: 12.5, opacity: 0.72 }}>
                  <th style={{ padding: "10px 8px" }}>#</th>
                  <th style={{ padding: "10px 8px" }}>Bizim Oyuncu</th>
                  <th style={{ padding: "10px 8px" }}>1. Hedef (Rakip)</th>
                  {savasTuru === "normal" && <th style={{ padding: "10px 8px" }}>2. Hedef (Temizlik)</th>}
                  <th style={{ padding: "10px 8px" }}>Lider Notu / Taktik</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((p, idx) => {
                  const seciliRakip = rakipler.find((r) => r.sira === p.hedef1);
                  const bbFark = seciliRakip ? p.bb - seciliRakip.bb : 0;
                  return (
                    <tr key={p.sira + p.isim} style={{ borderBottom: "1px solid var(--cizgi)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 900, opacity: 0.75 }}>{p.sira}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                          {p.isim} {p.saldirdiMi && <span title="Saldırı tamamlandı">✅</span>}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>BB {p.bb}</div>
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <select
                            value={p.hedef1}
                            onChange={(e) => satirGuncelle(idx, "hedef1", Number(e.target.value))}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 9,
                              border: "1px solid var(--cizgi)",
                              background: "var(--bg)",
                              color: "var(--fg)",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {rakipler.map((r) => (
                              <option key={r.sira} value={r.sira}>
                                #{r.sira} · {r.isim} (BB {r.bb})
                              </option>
                            ))}
                          </select>
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 800,
                              padding: "3px 7px",
                              borderRadius: 7,
                              background:
                                bbFark > 0
                                  ? "rgba(34, 197, 94, 0.16)"
                                  : bbFark < 0
                                    ? "rgba(239, 68, 68, 0.16)"
                                    : "rgba(56, 189, 248, 0.16)",
                              color: bbFark > 0 ? "#22c55e" : bbFark < 0 ? "#ef6b5f" : "#38bdf8",
                            }}
                          >
                            {bbFark > 0 ? `+${bbFark} BB` : bbFark < 0 ? `${bbFark} BB` : "Eşit"}
                          </span>
                        </div>
                      </td>
                      {savasTuru === "normal" && (
                        <td style={{ padding: "10px 8px" }}>
                          <select
                            value={p.hedef2 ?? ""}
                            onChange={(e) => satirGuncelle(idx, "hedef2", e.target.value ? Number(e.target.value) : null)}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 9,
                              border: "1px solid var(--cizgi)",
                              background: "var(--bg)",
                              color: "var(--fg)",
                              fontSize: 13,
                            }}
                          >
                            <option value="">Serbest / Temizlik</option>
                            {rakipler.map((r) => (
                              <option key={r.sira} value={r.sira}>
                                #{r.sira} · {r.isim} (BB {r.bb})
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      <td style={{ padding: "10px 8px" }}>
                        <input
                          value={p.not}
                          onChange={(e) => satirGuncelle(idx, "not", e.target.value)}
                          placeholder="Örn: İlk 12 saatte vur, hava zayıf..."
                          maxLength={60}
                          style={{
                            width: "100%",
                            minWidth: 180,
                            padding: "7px 10px",
                            borderRadius: 9,
                            border: "1px solid var(--cizgi)",
                            background: "var(--bg)",
                            color: "var(--fg)",
                            fontSize: 13,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
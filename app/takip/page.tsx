"use client";
import { useEffect, useState } from "react";

type SlotTur = "insaatci" | "lab" | "hayvan";

type Slot = {
  id: string;
  ad: string;
  tur: SlotTur;
  ikon: string;
  gorev: string;
  baslangic: number | null;
  bitis: number | null;
};

const VARSAYILAN_SLOTLAR: Slot[] = [
  { id: "b1", ad: "1. İnşaatçı", tur: "insaatci", ikon: "🔨", gorev: "", baslangic: null, bitis: null },
  { id: "b2", ad: "2. İnşaatçı", tur: "insaatci", ikon: "🔨", gorev: "", baslangic: null, bitis: null },
  { id: "b3", ad: "3. İnşaatçı", tur: "insaatci", ikon: "🔨", gorev: "", baslangic: null, bitis: null },
  { id: "b4", ad: "4. İnşaatçı", tur: "insaatci", ikon: "🔨", gorev: "", baslangic: null, bitis: null },
  { id: "b5", ad: "5. İnşaatçı", tur: "insaatci", ikon: "🔨", gorev: "", baslangic: null, bitis: null },
  { id: "b6", ad: "6. İnşaatçı (B.O.B)", tur: "insaatci", ikon: "🤖", gorev: "", baslangic: null, bitis: null },
  { id: "lab", ad: "Laboratuvar", tur: "lab", ikon: "🧪", gorev: "", baslangic: null, bitis: null },
  { id: "pet", ad: "Hayvan Evi", tur: "hayvan", ikon: "🐾", gorev: "", baslangic: null, bitis: null },
];

const DEPO_ANAHTARI = "sargyt_yukseltme_takip_v1";

function kalanFormat(ms: number): string {
  if (ms <= 0) return "Tamamlandı!";
  const toplamSn = Math.floor(ms / 1000);
  const gun = Math.floor(toplamSn / 86400);
  const saat = Math.floor((toplamSn % 86400) / 3600);
  const dk = Math.floor((toplamSn % 3600) / 60);
  const sn = toplamSn % 60;
  const parcalar: string[] = [];
  if (gun > 0) parcalar.push(`${gun}g`);
  if (saat > 0 || gun > 0) parcalar.push(`${saat}s`);
  parcalar.push(`${dk}dk`);
  if (gun === 0) parcalar.push(`${sn}sn`);
  return parcalar.join(" ");
}

function bitisTarihiFormat(ms: number): string {
  return new Date(ms).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function geceBitiyorMu(ms: number): boolean {
  const saat = new Date(ms).getHours();
  return saat >= 1 && saat < 7;
}

export default function TakipSayfasi() {
  const [slotlar, setSlotlar] = useState<Slot[]>(VARSAYILAN_SLOTLAR);
  const [simdi, setSimdi] = useState<number>(0);
  const [acikId, setAcikId] = useState<string | null>(null);
  const [formGorev, setFormGorev] = useState("");
  const [formGun, setFormGun] = useState("0");
  const [formSaat, setFormSaat] = useState("12");
  const [formDk, setFormDk] = useState("0");

  useEffect(() => {
    setSimdi(Date.now());
    try {
      const kayitli = localStorage.getItem(DEPO_ANAHTARI);
      if (kayitli) {
        const parsed = JSON.parse(kayitli);
        if (Array.isArray(parsed) && parsed.length === VARSAYILAN_SLOTLAR.length) {
          setSlotlar(parsed);
        }
      }
    } catch {}

    const zamanlayici = setInterval(() => setSimdi(Date.now()), 1000);
    return () => clearInterval(zamanlayici);
  }, []);

  function kaydet(yeni: Slot[]) {
    setSlotlar(yeni);
    try {
      localStorage.setItem(DEPO_ANAHTARI, JSON.stringify(yeni));
    } catch {}
  }

  function baslat(slotId: string) {
    const gun = Math.max(0, Number(formGun) || 0);
    const saat = Math.max(0, Number(formSaat) || 0);
    const dk = Math.max(0, Number(formDk) || 0);
    const toplamMs = ((gun * 24 + saat) * 60 + dk) * 60 * 1000;
    if (toplamMs <= 0) return;

    const an = Date.now();
    const yeni = slotlar.map((s) =>
      s.id === slotId
        ? {
            ...s,
            gorev: formGorev.trim() || "Yükseltme",
            baslangic: an,
            bitis: an + toplamMs,
          }
        : s
    );
    kaydet(yeni);
    setAcikId(null);
    setFormGorev("");
    setFormGun("0");
    setFormSaat("12");
    setFormDk("0");
  }

  function temizle(slotId: string) {
    kaydet(
      slotlar.map((s) =>
        s.id === slotId ? { ...s, gorev: "", baslangic: null, bitis: null } : s
      )
    );
  }

  function iksirBas(hedefTur: SlotTur, saatKazanc: number) {
    const dusulecekMs = saatKazanc * 3600 * 1000;
    const yeni = slotlar.map((s) => {
      if (s.tur !== hedefTur || !s.bitis || s.bitis <= simdi) return s;
      return {
        ...s,
        bitis: Math.max(simdi, s.bitis - dusulecekMs),
      };
    });
    kaydet(yeni);
  }

  const aktifInsaatci = slotlar.filter((s) => s.tur === "insaatci" && s.bitis && s.bitis > simdi).length;
  const bitenSayisi = slotlar.filter((s) => s.bitis && s.bitis <= simdi).length;

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST ÖZET VE İKSİR BUTONLARI */}
      <section
        style={{
          padding: "24px 28px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px" }}>
            ⏱️ İnşaatçı & Yükseltme Takipçisi
          </h1>
          <p style={{ margin: 0, opacity: 0.78, fontSize: 15 }}>
            Aktif İnşaatçı: <strong style={{ color: "var(--vurgu)" }}>{aktifInsaatci} / 6</strong>
            {bitenSayisi > 0 && (
              <span style={{ marginLeft: 12, color: "#22c55e", fontWeight: 800 }}>
                ✓ {bitenSayisi} yükseltme tamamlandı!
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => iksirBas("insaatci", 9)}
            style={{
              padding: "11px 16px",
              borderRadius: 12,
              border: "1px solid var(--vurgu)",
              background: "rgba(245, 197, 66, 0.14)",
              color: "var(--vurgu)",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            🧪 İnşaatçı İksiri (-9 Saat)
          </button>

          <button
            type="button"
            onClick={() => iksirBas("lab", 23)}
            style={{
              padding: "11px 16px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            ⚗️ Araştırma İksiri (-23 Saat)
          </button>

          <button
            type="button"
            onClick={() => iksirBas("hayvan", 23)}
            style={{
              padding: "11px 16px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            🐾 Hayvan İksiri (-23 Saat)
          </button>
        </div>
      </section>

      {/* SLOT KARTLARI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 18,
        }}
      >
        {slotlar.map((s) => {
          const aktif = Boolean(s.bitis && simdi > 0);
          const kalan = s.bitis ? s.bitis - simdi : 0;
          const bitti = aktif && kalan <= 0;
          const gece = aktif && !bitti && s.bitis ? geceBitiyorMu(s.bitis) : false;

          let oran = 0;
          if (s.baslangic && s.bitis && s.bitis > s.baslangic) {
            oran = Math.min(100, Math.max(0, Math.round(((simdi - s.baslangic) / (s.bitis - s.baslangic)) * 100)));
          }

          return (
            <div
              key={s.id}
              style={{
                padding: 20,
                background: "var(--kart)",
                border: `2px solid ${bitti ? "#22c55e" : gece ? "#f59e0b" : aktif ? "var(--vurgu)" : "var(--cizgi)"}`,
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{s.ikon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{s.ad}</div>
                    <div style={{ fontSize: 12.5, opacity: 0.72 }}>
                      {aktif ? s.gorev : "Boşta · Görev bekliyor"}
                    </div>
                  </div>
                </div>

                {aktif && (
                  <button
                    type="button"
                    onClick={() => temizle(s.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 9,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {bitti ? "✓ Temizle" : "İptal"}
                  </button>
                )}
              </div>

              {aktif ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: 20, color: bitti ? "#22c55e" : "var(--vurgu)" }}>
                      {kalanFormat(kalan)}
                    </strong>
                    <span style={{ fontSize: 12.5, opacity: 0.8 }}>
                      Bitiş: {s.bitis ? bitisTarihiFormat(s.bitis) : ""}
                    </span>
                  </div>

                  <div style={{ height: 8, background: "var(--cizgi)", borderRadius: 8, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: (bitti ? 100 : oran) + "%",
                        background: bitti ? "#22c55e" : "var(--vurgu)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {gece && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "6px 10px",
                        borderRadius: 9,
                        background: "rgba(245, 158, 11, 0.14)",
                        border: "1px solid #f59e0b",
                        color: "#f59e0b",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      🌙 Gece bitiyor! İnşaatçı boşta kalabilir.
                    </div>
                  )}
                </div>
              ) : acikId === s.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    value={formGorev}
                    onChange={(e) => setFormGorev(e.target.value)}
                    placeholder="Örn: Barbar Kral Sv. 111"
                    style={{
                      padding: "9px 12px",
                      borderRadius: 10,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontSize: 14,
                    }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <label style={{ fontSize: 11.5, opacity: 0.8 }}>
                      Gün
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={formGun}
                        onChange={(e) => setFormGun(e.target.value)}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "7px 8px",
                          borderRadius: 8,
                          border: "1px solid var(--cizgi)",
                          background: "var(--bg)",
                          color: "var(--fg)",
                        }}
                      />
                    </label>
                    <label style={{ fontSize: 11.5, opacity: 0.8 }}>
                      Saat
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={formSaat}
                        onChange={(e) => setFormSaat(e.target.value)}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "7px 8px",
                          borderRadius: 8,
                          border: "1px solid var(--cizgi)",
                          background: "var(--bg)",
                          color: "var(--fg)",
                        }}
                      />
                    </label>
                    <label style={{ fontSize: 11.5, opacity: 0.8 }}>
                      Dakika
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={formDk}
                        onChange={(e) => setFormDk(e.target.value)}
                        style={{
                          width: "100%",
                          marginTop: 4,
                          padding: "7px 8px",
                          borderRadius: 8,
                          border: "1px solid var(--cizgi)",
                          background: "var(--bg)",
                          color: "var(--fg)",
                        }}
                      />
                    </label>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => baslat(s.id)}
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: 0,
                        background: "var(--vurgu)",
                        color: "#111",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Başlat
                    </button>
                    <button
                      type="button"
                      onClick={() => setAcikId(null)}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--cizgi)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAcikId(s.id);
                    setFormGorev("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 11,
                    border: "1px dashed var(--vurgu)",
                    background: "var(--bg)",
                    color: "var(--vurgu)",
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: "pointer",
                  }}
                >
                  + Yükseltme Ekle
                </button>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
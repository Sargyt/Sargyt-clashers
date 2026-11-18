"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";

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

async function ara(e: FormEvent) {
e.preventDefault();
const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
setKlan(null);
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
}
} catch {
setHata("Bağlantı hatası, tekrar dene.");
}
setYukleniyor(false);
}

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
<main style={{ padding: "40px 20px", maxWidth: 960, margin: "0 auto" }}>
<h1 style={{ fontSize: 32, margin: "0 0 8px" }}>Klan Analizi</h1>
<p style={{ opacity: 0.75, marginTop: 0 }}>
Klan etiketini gir, savaş istatistiklerini, Belediye Binası dağılımını ve üye bağış durumlarını incele.</p>


  <form onSubmit={ara} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <input
      value={kod}
      onChange={(e) => setKod(e.target.value)}
      placeholder="Klan kodu, örn. #2PP0Y8L"
      maxLength={14}
      aria-label="Klan kodu"
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
      type="submit"
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
      {yukleniyor ? "Aranıyor..." : "Klanı Ara"}
    </button>
  </form>

  {hata && <p style={{ color: "#ef6b5f", marginTop: 12 }}>{hata}</p>}

  {klan && (
    <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <section
          style={{
            padding: 20,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>{klan.isim}</h2>
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
              Seviye {klan.seviye}
            </span>
          </div>
          <p style={{ opacity: 0.75, margin: "6px 0", fontSize: 14 }}>
            {klan.kod} · 👥 {klan.uyeSayisi}/50 Üye · 🏆 {klan.puan} Puan
          </p>
          {klan.aciklama && (
            <p style={{ opacity: 0.85, fontSize: 13, margin: "10px 0 0", lineHeight: 1.5 }}>
              {klan.aciklama}
            </p>
          )}
        </section>

        <section
          style={{
            padding: 20,
            background: "var(--kart)",
            border: "1px solid var(--cizgi)",
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <strong style={{ fontSize: 16 }}>⚔️ Klan Savaşı İstatistikleri</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
            <div style={{ padding: 10, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>{klan.savasGalibiyet}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Galibiyet</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#ef6b5f" }}>{klan.savasMaglubiyet}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Mağlubiyet</div>
            </div>
            <div style={{ padding: 10, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--vurgu)" }}>{klan.savasSerisi}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Galibiyet Serisi</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Belediye Binası Dağılımı:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(bbDagilimi)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([bb, adet]) => (
                  <span
                    key={bb}
                    style={{
                      fontSize: 12,
                      padding: "3px 8px",
                      borderRadius: 6,
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

      <section
        style={{
          padding: 20,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18 }}>Üye Listesi ({klan.uyeler.length})</h3>
          <div style={{ display: "flex", gap: 6 }}>
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
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: sirala === s.id ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                  background: sirala === s.id ? "var(--vurgu)" : "var(--bg)",
                  color: sirala === s.id ? "#111" : "var(--fg)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {s.ad}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cizgi)", opacity: 0.75 }}>
                <th style={{ padding: "10px 8px" }}>#</th>
                <th style={{ padding: "10px 8px" }}>Oyuncu</th>
                <th style={{ padding: "10px 8px" }}>BB</th>
                <th style={{ padding: "10px 8px" }}>Rol</th>
                <th style={{ padding: "10px 8px" }}>Kupa</th>
                <th style={{ padding: "10px 8px" }}>Bağış / Alınan</th>
              </tr>
            </thead>
            <tbody>
              {siraliUyeler.map((u, idx) => (
                <tr key={u.tag} style={{ borderBottom: "1px solid var(--cizgi)" }}>
                 <td style={{ padding: "10px 8px", opacity: 0.7 }}>{idx + 1}</td>
                  <td style={{ padding: "10px 8px" }}>
                    <Link
                      href={"/?kod=" + u.tag.replace(/^#/, "")}
                      style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 700 }}
                      title="Bu oyuncunun köyünü analiz et"
                    >
                      {u.name} ↗
                    </Link>
                    <div style={{ fontSize: 11, opacity: 0.65 }}>{u.tag}</div>
                  </td>
                  <td style={{ padding: "10px 8px" }}>
                    <span
                      style={{
                        padding: "2px 7px",
                        borderRadius: 6,
                        background: "var(--bg)",
                        border: "1px solid var(--cizgi)",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      BB {u.townHallLevel}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", fontSize: 13 }}>{ROL_TR[u.role] ?? u.role}</td>
                  <td style={{ padding: "10px 8px" }}>🏆 {u.trophies}</td>
                  <td style={{ padding: "10px 8px", fontSize: 13 }}>
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
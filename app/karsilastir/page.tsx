"use client";
import { useState, type FormEvent } from "react";
import { tr } from "../isimler";
import { gercekAzami } from "../thSinirlari";
import { gorselYolu } from "../gorseller";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Parca = {
  isim: string;
  seviye: number;
  azami: number;
};

type Oyuncu = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  lig?: string | null;
  ligIkon?: string | null;
  klan?: string | null;
  klanRozet?: string | null;
  kahramanlar: Parca[];
  birlikler: Parca[];
  buyuler: Parca[];
  ekipmanlar: Parca[];
};

type Klan = {
  kod: string;
  isim: string;
  seviye: number;
  puan: number;
  uyeSayisi: number;
  savasGalibiyet: number;
  savasMaglubiyet: number;
  savasSerisi: number;
  rozet?: string | null;
  uyeler: { townHallLevel: number; trophies: number; donations: number }[];
};

function temizle(ham: string) {
  return ham.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
}

function hesaplaYuzde(o: Oyuncu) {
  const duzeltilmis = [
    ...o.kahramanlar.map((k) => ({ ...k, azami: gercekAzami(o.thSeviyesi, k.isim, k.azami) })),
    ...o.birlikler.map((b) => ({ ...b, azami: gercekAzami(o.thSeviyesi, b.isim, b.azami) })),
    ...o.buyuler.map((s) => ({ ...s, azami: gercekAzami(o.thSeviyesi, s.isim, s.azami) })),
    ...o.ekipmanlar,
  ];
  const s = duzeltilmis.reduce((t, p) => t + p.seviye, 0);
  const m = duzeltilmis.reduce((t, p) => t + p.azami, 0);
  return m ? Math.round((s / m) * 100) : 0;
}

function KazananRozeti({ goster }: { goster: boolean }) {
  if (!goster) return null;
  return (
    <span
      style={{
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 6,
        background: "#22c55e",
        color: "var(--vurgu-yazi)",
        fontSize: 11,
        fontWeight: 900,
      }}
    >
      👑 ÖNDE
    </span>
  );
}

export default function KarsilastirSayfasi() {
  const [mod, setMod] = useState<"koy" | "klan">("koy");
  const [kod1, setKod1] = useState("");
  const [kod2, setKod2] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const [oyuncu1, setOyuncu1] = useState<Oyuncu | null>(null);
  const [oyuncu2, setOyuncu2] = useState<Oyuncu | null>(null);
  const [klan1, setKlan1] = useState<Klan | null>(null);
  const [klan2, setKlan2] = useState<Klan | null>(null);

  async function karsilastir(e: FormEvent) {
    e.preventDefault();
    const t1 = temizle(kod1);
    const t2 = temizle(kod2);

    if (!KOD_KURALI.test(t1) || !KOD_KURALI.test(t2)) {
      setHata("Lütfen her iki kutuya da geçerli bir etiket girin (örn. #2PP0Y8L).");
      return;
    }

    setHata("");
    setYukleniyor(true);
    setOyuncu1(null);
    setOyuncu2(null);
    setKlan1(null);
    setKlan2(null);

    try {
      const uc = mod === "koy" ? "/api/oyuncu?kod=" : "/api/klan?kod=";
      const [r1, r2] = await Promise.all([fetch(uc + t1), fetch(uc + t2)]);
      const [v1, v2] = await Promise.all([r1.json(), r2.json()]);

      if (!r1.ok) {
        setHata("1. Etiket Hatası: " + (v1.hata ?? "Bulunamadı"));
      } else if (!r2.ok) {
        setHata("2. Etiket Hatası: " + (v2.hata ?? "Bulunamadı"));
      } else if (mod === "koy") {
        setOyuncu1(v1);
        setOyuncu2(v2);
      } else {
        setKlan1(v1);
        setKlan2(v2);
      }
    } catch {
      setHata("Bağlantı hatası oluştu, tekrar dene.");
    }
    setYukleniyor(false);
  }

  const tumKahramanIsimleri =
    oyuncu1 && oyuncu2
      ? Array.from(
          new Set([
            ...oyuncu1.kahramanlar.map((k) => k.isim),
            ...oyuncu2.kahramanlar.map((k) => k.isim),
          ])
        )
      : [];

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px" }}>⚔️ VS Karşılaştırma Modu</h1>
        <p style={{ opacity: 0.75, margin: 0, fontSize: 16 }}>
          İki oyuncunun köyünü veya iki rakip klanı yan yana getir; kahraman seviyelerini, ilerleme oranlarını ve savaş güçlerini kıyasla.
        </p>
      </div>

      {/* Mod Seçici ve Arama Formu */}
      <section
        style={{
          padding: 24,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setMod("koy");
              setHata("");
            }}
            style={{
              padding: "11px 20px",
              borderRadius: 12,
              border: "1px solid " + (mod === "koy" ? "var(--vurgu)" : "var(--cizgi)"),
              background: mod === "koy" ? "var(--vurgu)" : "var(--bg)",
              color: mod === "koy" ? "#111" : "var(--fg)",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            🏰 İki Köy Karşılaştır
          </button>
          <button
            type="button"
            onClick={() => {
              setMod("klan");
              setHata("");
            }}
            style={{
              padding: "11px 20px",
              borderRadius: 12,
              border: "1px solid " + (mod === "klan" ? "var(--vurgu)" : "var(--cizgi)"),
              background: mod === "klan" ? "var(--vurgu)" : "var(--bg)",
              color: mod === "klan" ? "#111" : "var(--fg)",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            🛡️ İki Klan Karşılaştır
          </button>
        </div>

        <form
          onSubmit={karsilastir}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            alignItems: "center",
          }}
        >
          <input
            value={kod1}
            onChange={(e) => setKod1(e.target.value)}
            placeholder={mod === "koy" ? "1. Köy Kodu (#...)" : "1. Klan Kodu (#...)"}
            maxLength={14}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 16,
            }}
          />

          <input
            value={kod2}
            onChange={(e) => setKod2(e.target.value)}
            placeholder={mod === "koy" ? "2. Köy Kodu (#...)" : "2. Klan Kodu (#...)"}
            maxLength={14}
            style={{
              padding: "14px 16px",
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
              padding: "14px 28px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "var(--vurgu-yazi)",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "Kıyaslanıyor..." : "⚔️ Karşılaştır"}
          </button>
        </form>

        {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}
      </section>

      {/* İKİ KÖY KARŞILAŞTIRMA SONUCU */}
      {mod === "koy" && oyuncu1 && oyuncu2 && (() => {
        const y1 = hesaplaYuzde(oyuncu1);
        const y2 = hesaplaYuzde(oyuncu2);
        const kToplam1 = oyuncu1.kahramanlar.reduce((t, k) => t + k.seviye, 0);
        const kToplam2 = oyuncu2.kahramanlar.reduce((t, k) => t + k.seviye, 0);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Üst Profil Kıyaslama Kartları */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
              {[
                { o: oyuncu1, diger: oyuncu2, yuzde: y1, digerYuzde: y2, kTop: kToplam1, digerKTop: kToplam2 },
                { o: oyuncu2, diger: oyuncu1, yuzde: y2, digerYuzde: y1, kTop: kToplam2, digerKTop: kToplam1 },
              ].map(({ o, diger, yuzde, digerYuzde, kTop, digerKTop }) => (
                <section
                  key={o.kod}
                  style={{
                    padding: 24,
                    background: "var(--kart)",
                    border: "1px solid var(--cizgi)",
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <img
                      src={`/birimler/th${o.thSeviyesi}.png`}
                      alt={`BB ${o.thSeviyesi}`}
                      width={64}
                      height={64}
                      style={{ objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div>
                      <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{o.isim}</h2>
                      <div style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                        {o.kod} · {o.klan ?? "Klanı yok"}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Belediye Binası</div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                        BB {o.thSeviyesi}
                        <KazananRozeti goster={o.thSeviyesi > diger.thSeviyesi} />
                      </div>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Kupa</div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                        🏆 {o.kupa}
                        <KazananRozeti goster={o.kupa > diger.kupa} />
                      </div>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Köy Tamamlanması</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--vurgu)", marginTop: 4 }}>
                        %{yuzde}
                        <KazananRozeti goster={yuzde > digerYuzde} />
                      </div>
                    </div>

                    <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>Toplam Kahraman Sv.</div>
                      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                        {kTop} Sv.
                        <KazananRozeti goster={kTop > digerKTop} />
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Kahraman Seviyeleri Birebir Kıyaslama Tablosu */}
            <section
              style={{
                padding: 24,
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
              }}
            >
              <h2 className="baslik-serit">
                <span>👑 Kahraman Seviyeleri Karşılaştırması</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tumKahramanIsimleri.map((isim) => {
                  const k1 = oyuncu1.kahramanlar.find((k) => k.isim === isim);
                  const k2 = oyuncu2.kahramanlar.find((k) => k.isim === isim);
                  const s1 = k1?.seviye ?? 0;
                  const s2 = k2?.seviye ?? 0;

                  return (
                    <div
                      key={isim}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        borderRadius: 12,
                        background: "var(--bg)",
                        border: "1px solid var(--cizgi)",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 16, color: s1 > s2 ? "#22c55e" : "var(--fg)" }}>
                        {s1 > 0 ? `Seviye ${s1}` : "Açık Değil"} {s1 > s2 ? "👑" : ""}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                        <img
                          src={gorselYolu(isim)}
                          alt={tr(isim)}
                          width={32}
                          height={32}
                          style={{ borderRadius: 8 }}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{tr(isim)}</span>
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                          fontWeight: 800,
                          fontSize: 16,
                          color: s2 > s1 ? "#22c55e" : "var(--fg)",
                        }}
                      >
                        {s2 > s1 ? "👑 " : ""}
                        {s2 > 0 ? `Seviye ${s2}` : "Açık Değil"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        );
      })()}

      {/* İKİ KLAN KARŞILAŞTIRMA SONUCU */}
      {mod === "klan" && klan1 && klan2 && (() => {
        const ortBb1 = klan1.uyeler.length
          ? (klan1.uyeler.reduce((t, u) => t + u.townHallLevel, 0) / klan1.uyeler.length).toFixed(1)
          : "0";
        const ortBb2 = klan2.uyeler.length
          ? (klan2.uyeler.reduce((t, u) => t + u.townHallLevel, 0) / klan2.uyeler.length).toFixed(1)
          : "0";

        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
            {[
              { k: klan1, diger: klan2, ortBb: Number(ortBb1), digerOrtBb: Number(ortBb2) },
              { k: klan2, diger: klan1, ortBb: Number(ortBb2), digerOrtBb: Number(ortBb1) },
            ].map(({ k, diger, ortBb, digerOrtBb }) => (
              <section
                key={k.kod}
                style={{
                  padding: 24,
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {k.rozet ? (
                    <img src={k.rozet} alt={k.isim} width={62} height={62} />
                  ) : (
                    <span style={{ fontSize: 40 }}>🛡️</span>
                  )}
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{k.isim}</h2>
                    <div style={{ fontSize: 14, opacity: 0.78, marginTop: 4 }}>
                      {k.kod} · 👥 {k.uyeSayisi}/50 Üye
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Klan Seviyesi</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                      Seviye {k.seviye}
                      <KazananRozeti goster={k.seviye > diger.seviye} />
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Klan Puanı</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                      🏆 {k.puan}
                      <KazananRozeti goster={k.puan > diger.puan} />
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Savaş Galibiyeti</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e", marginTop: 4 }}>
                      {k.savasGalibiyet}
                      <KazananRozeti goster={k.savasGalibiyet > diger.savasGalibiyet} />
                    </div>
                  </div>

                  <div style={{ padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Aktif Galibiyet Serisi</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--vurgu)", marginTop: 4 }}>
                      {k.savasSerisi}
                      <KazananRozeti goster={k.savasSerisi > diger.savasSerisi} />
                    </div>
                  </div>

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: 12,
                      borderRadius: 12,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Ortalama Belediye Binası Gücü</div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>
                      BB {ortBb}
                      <KazananRozeti goster={ortBb > digerOrtBb} />
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        );
      })()}
    </main>
  );
}
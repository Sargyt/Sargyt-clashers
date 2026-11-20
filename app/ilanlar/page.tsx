"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../supabase";

type IlanTur = "klan" | "oyuncu";

type Ilan = {
  id: string;
  user_id: string;
  yazar_eposta: string | null;
  tur: IlanTur;
  baslik: string;
  kod: string;
  min_bb: number;
  lig: string | null;
  aciklama: string;
  iletisim: string | null;
  olusturma: string;
};

const ADMIN_EPOSTA = "sargytr0@gmail.com";
const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

function tarihFormat(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IlanlarSayfasi() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreTur, setFiltreTur] = useState<"hepsi" | IlanTur>("hepsi");
  const [filtreBb, setFiltreBb] = useState<number>(0);

  const [kullaniciId, setKullaniciId] = useState<string | null>(null);
  const [kullaniciEposta, setKullaniciEposta] = useState<string | null>(null);

  const [formAcik, setFormAcik] = useState(false);
  const [tur, setTur] = useState<IlanTur>("klan");
  const [baslik, setBaslik] = useState("");
  const [kod, setKod] = useState("");
  const [minBb, setMinBb] = useState(14);
  const [lig, setLig] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [iletisim, setIletisim] = useState("");
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function ilanlariGetir() {
    setYukleniyor(true);
    const { data } = await supabase
      .from("ilanlar")
      .select("*")
      .order("olusturma", { ascending: false })
      .limit(60);
    setIlanlar((data as Ilan[]) ?? []);
    setYukleniyor(false);
  }

  useEffect(() => {
    ilanlariGetir();
    supabase.auth.getSession().then(({ data }) => {
      setKullaniciId(data.session?.user?.id ?? null);
      setKullaniciEposta(data.session?.user?.email ?? null);
    });
  }, []);

  async function ilanOlustur(e: FormEvent) {
    e.preventDefault();
    setHata("");

    if (!kullaniciId) {
      setHata("İlan oluşturmak için önce giriş yapmalısın.");
      return;
    }

    const temizKod = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    if (!KOD_KURALI.test(temizKod)) {
      setHata("Geçerli bir köy veya klan kodu gir. Örn: #2G8Q20UQ0");
      return;
    }

    if (baslik.trim().length < 4 || aciklama.trim().length < 10) {
      setHata("Başlık en az 4, açıklama en az 10 karakter olmalı.");
      return;
    }

    setGonderiliyor(true);
    const { error } = await supabase.from("ilanlar").insert({
      user_id: kullaniciId,
      yazar_eposta: kullaniciEposta,
      tur,
      baslik: baslik.trim().slice(0, 70),
      kod: "#" + temizKod,
      min_bb: minBb,
      lig: lig.trim().slice(0, 30) || null,
      aciklama: aciklama.trim().slice(0, 400),
      iletisim: iletisim.trim().slice(0, 80) || null,
    });
    setGonderiliyor(false);

    if (error) {
      setHata("İlan eklenemedi: " + error.message);
      return;
    }

    setBaslik("");
    setKod("");
    setLig("");
    setAciklama("");
    setIletisim("");
    setFormAcik(false);
    ilanlariGetir();
  }

  async function ilanSil(id: string) {
    const { error } = await supabase.from("ilanlar").delete().eq("id", id);
    if (!error) {
      setIlanlar((eski) => eski.filter((i) => i.id !== id));
    }
  }

  const adminMi = kullaniciEposta?.toLowerCase() === ADMIN_EPOSTA;

  const filtrelenen = ilanlar.filter((i) => {
    if (filtreTur !== "hepsi" && i.tur !== filtreTur) return false;
    if (filtreBb > 0 && i.min_bb < filtreBb) return false;
    return true;
  });

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST BAŞLIK & İLAN AÇ BUTONU */}
      <section
        style={{
          padding: "24px 28px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px" }}>
            📢 Klan & Oyuncu İlan Panosu
          </h1>
          <p style={{ margin: 0, opacity: 0.78, fontSize: 15 }}>
            Klanına aktif savaşçılar bul veya kendi köyünü paylaş; ilandaki kodlara tıklayıp tek tıkla köy/klan analizini incele.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormAcik((v) => !v)}
          style={{
            padding: "13px 22px",
            borderRadius: 12,
            border: 0,
            background: "var(--vurgu)",
            color: "#111",
            fontSize: 15,
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {formAcik ? "✕ Formu Kapat" : "+ Yeni İlan Oluştur"}
        </button>
      </section>

      {/* YENİ İLAN FORMU */}
      {formAcik && (
        <section
          style={{
            padding: "24px 26px",
            background: "var(--kart)",
            border: "1.5px solid var(--vurgu)",
            borderRadius: 18,
            marginBottom: 24,
          }}
        >
          {!kullaniciId ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                İlan yayınlamak için hesabına giriş yapman gerekiyor.
              </span>
              <Link
                href="/giris"
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "var(--vurgu)",
                  color: "#111",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Giriş Yap ↗
              </Link>
            </div>
          ) : (
            <form onSubmit={ilanOlustur} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setTur("klan")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 11,
                    border: "1px solid " + (tur === "klan" ? "var(--vurgu)" : "var(--cizgi)"),
                    background: tur === "klan" ? "var(--vurgu)" : "var(--bg)",
                    color: tur === "klan" ? "#111" : "var(--fg)",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🛡️ Üye Arıyoruz (Klan İlanı)
                </button>
                <button
                  type="button"
                  onClick={() => setTur("oyuncu")}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 11,
                    border: "1px solid " + (tur === "oyuncu" ? "var(--vurgu)" : "var(--cizgi)"),
                    background: tur === "oyuncu" ? "var(--vurgu)" : "var(--bg)",
                    color: tur === "oyuncu" ? "#111" : "var(--fg)",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ⚔️ Klan Arıyorum (Oyuncu İlanı)
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <input
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  placeholder={tur === "klan" ? "Örn: JÖN TÜRKLER · CWL & Savaş Klanı" : "Örn: Aktif BB 17 Oyuncu Klan Arıyor"}
                  maxLength={70}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14.5,
                  }}
                />
                <input
                  value={kod}
                  onChange={(e) => setKod(e.target.value)}
                  placeholder={tur === "klan" ? "Klan Kodu (örn: #2G8Q20UQ0)" : "Köy Kodu (örn: #LGJP280J2)"}
                  maxLength={14}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14.5,
                  }}
                />
                <select
                  value={minBb}
                  onChange={(e) => setMinBb(Number(e.target.value))}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14.5,
                  }}
                >
                  {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((bb) => (
                    <option key={bb} value={bb}>
                      {tur === "klan" ? `Minimum BB ${bb}+` : `Belediye Binası ${bb}`}
                    </option>
                  ))}
                </select>
                <input
                  value={lig}
                  onChange={(e) => setLig(e.target.value)}
                  placeholder="CWL / Lig (isteğe bağlı, örn: Usta II)"
                  maxLength={30}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14.5,
                  }}
                />
              </div>

              <textarea
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                rows={3}
                maxLength={400}
                placeholder={
                  tur === "klan"
                    ? "Klan kurallarını, savaş sıklığını, CWL beklentisini kısaca yaz..."
                    : "Aktiflik durumunu, savaş tecrübeni ve aradığın klan özelliklerini yaz..."
                }
                style={{
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 14.5,
                  resize: "vertical",
                }}
              />

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <input
                  value={iletisim}
                  onChange={(e) => setIletisim(e.target.value)}
                  placeholder="İletişim / Not (isteğe bağlı, örn: Oyun içinden istek atın)"
                  maxLength={80}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 14,
                  }}
                />
                <button
                  disabled={gonderiliyor}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 11,
                    border: 0,
                    background: "var(--vurgu)",
                    color: "#111",
                    fontWeight: 900,
                    fontSize: 14.5,
                    cursor: "pointer",
                  }}
                >
                  {gonderiliyor ? "Yayınlanıyor..." : "🚀 İlanı Yayınla"}
                </button>
              </div>

              {hata && <p style={{ margin: 0, color: "#ef6b5f", fontWeight: 700, fontSize: 14 }}>{hata}</p>}
            </form>
          )}
        </section>
      )}

      {/* FİLTRE ÇUBUĞU */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
        {[
          { id: "hepsi", ad: `Tümü (${ilanlar.length})` },
          { id: "klan", ad: "🛡️ Üye Arayan Klanlar" },
          { id: "oyuncu", ad: "⚔️ Klan Arayan Oyuncular" },
        ].map((f) => {
          const secili = filtreTur === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltreTur(f.id as "hepsi" | IlanTur)}
              style={{
                padding: "9px 15px",
                borderRadius: 10,
                border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                background: secili ? "var(--vurgu)" : "var(--kart)",
                color: secili ? "#111" : "var(--fg)",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              {f.ad}
            </button>
          );
        })}

        <select
          value={filtreBb}
          onChange={(e) => setFiltreBb(Number(e.target.value))}
          style={{
            marginLeft: "auto",
            padding: "9px 13px",
            borderRadius: 10,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
            color: "var(--fg)",
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          <option value={0}>Tüm Belediye Seviyeleri</option>
          {[11, 12, 13, 14, 15, 16, 17, 18, 19].map((bb) => (
            <option key={bb} value={bb}>
              BB {bb}+ ve üzeri
            </option>
          ))}
        </select>
      </div>

      {/* İLAN LİSTESİ */}
      {yukleniyor ? (
        <p style={{ opacity: 0.75 }}>İlanlar yükleniyor...</p>
      ) : filtrelenen.length === 0 ? (
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
          Henüz bu filtrede ilan yok. İlk ilanı yukarıdaki <strong>+ Yeni İlan Oluştur</strong> butonundan açabilirsin!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
          {filtrelenen.map((ilan) => {
            const temizKod = ilan.kod.replace(/^#/, "");
            const analizUrl = ilan.tur === "klan" ? `/klanlar?kod=${temizKod}` : `/?kod=${temizKod}`;
            const silebilir = adminMi || (kullaniciId && kullaniciId === ilan.user_id);

            return (
              <article
                key={ilan.id}
                style={{
                  padding: 20,
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        background: ilan.tur === "klan" ? "rgba(56, 189, 248, 0.16)" : "rgba(34, 197, 94, 0.16)",
                        color: ilan.tur === "klan" ? "#38bdf8" : "#22c55e",
                      }}
                    >
                      {ilan.tur === "klan" ? "🛡️ Üye Arıyoruz" : "⚔️ Klan Arıyorum"}
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.65 }}>{tarihFormat(ilan.olusturma)}</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{ilan.baslik}</h3>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12.5, fontWeight: 700 }}>
                    <span style={{ padding: "4px 9px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                      🏰 {ilan.tur === "klan" ? `Min. BB ${ilan.min_bb}+` : `BB ${ilan.min_bb}`}
                    </span>
                    <span style={{ padding: "4px 9px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--cizgi)", color: "var(--vurgu)" }}>
                      {ilan.kod}
                    </span>
                    {ilan.lig && (
                      <span style={{ padding: "4px 9px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
                        🏆 {ilan.lig}
                      </span>
                    )}
                  </div>

                  <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.55 }}>{ilan.aciklama}</p>

                  {ilan.iletisim && (
                    <div style={{ fontSize: 12.5, opacity: 0.78, padding: "7px 10px", borderRadius: 9, background: "var(--bg)" }}>
                      💬 {ilan.iletisim}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid var(--cizgi)", paddingTop: 12 }}>
                  <Link
                    href={analizUrl}
                    style={{
                      flex: 1,
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
                    {ilan.tur === "klan" ? "🛡️ Klanı İncele ↗" : "🔍 Köyü İncele ↗"}
                  </Link>

                  {silebilir && (
                    <button
                      type="button"
                      onClick={() => ilanSil(ilan.id)}
                      style={{
                        padding: "9px 12px",
                        borderRadius: 10,
                        border: "1px solid #ef4444",
                        background: "rgba(239, 68, 68, 0.14)",
                        color: "#ef6b5f",
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      Sil
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
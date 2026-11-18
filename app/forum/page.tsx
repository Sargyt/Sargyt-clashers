"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../supabase";

type Yorum = {
  id: string;
  yazar: string;
  icerik: string;
  tarih: string;
};

type Konu = {
  id: string;
  baslik: string;
  kategori: "Saldırı Taktikleri" | "Köy Düzeni" | "Klan Alımı" | "Soru & Cevap";
  yazar: string;
  icerik: string;
  tarih: string;
  yorumlar: Yorum[];
};

const KATEGORILER = ["Tümü", "Saldırı Taktikleri", "Köy Düzeni", "Klan Alımı", "Soru & Cevap"] as const;

export default function ForumSayfasi() {
  const [konular, setKonular] = useState<Konu[]>([]);
  const [seciliKategori, setSeciliKategori] = useState<(typeof KATEGORILER)[number]>("Tümü");
  const [kullaniciEmail, setKullaniciEmail] = useState<string | null>(null);

  // Yeni konu formu
  const [yeniFormAcik, setYeniFormAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [kategori, setKategori] = useState<Konu["kategori"]>("Soru & Cevap");
  const [icerik, setIcerik] = useState("");

  // Yorum yazma state'leri
  const [acikKonuId, setAcikKonuId] = useState<string | null>(null);
  const [yorumMetni, setYorumMetni] = useState("");

  useEffect(() => {
    async function baslat() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setKullaniciEmail(data.session.user.email);
      }

      // Kayıtlı forum konularını yükle
      try {
        const kayitli = JSON.parse(localStorage.getItem("sargyt_forum") || "[]");
        if (Array.isArray(kayitli) && kayitli.length > 0) {
          setKonular(kayitli);
          setAcikKonuId(kayitli[0].id);
        }
      } catch {}
    }
    baslat();
  }, []);

  function konuOlustur(e: FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !icerik.trim()) return;

    const yazarAdi = kullaniciEmail ? kullaniciEmail.split("@")[0] : "Misafir Oyuncu";
    const yeniKonu: Konu = {
      id: "konu-" + Date.now(),
      baslik: baslik.trim(),
      kategori,
      yazar: yazarAdi,
      icerik: icerik.trim(),
      tarih: "Az önce",
      yorumlar: [],
    };

    const guncel = [yeniKonu, ...konular];
    setKonular(guncel);
    setAcikKonuId(yeniKonu.id);
    setBaslik("");
    setIcerik("");
    setYeniFormAcik(false);

    try {
      localStorage.setItem("sargyt_forum", JSON.stringify(guncel));
    } catch {}
  }

  function yorumEkle(konuId: string) {
    if (!yorumMetni.trim()) return;
    const yazarAdi = kullaniciEmail ? kullaniciEmail.split("@")[0] : "Misafir Oyuncu";
    const yeniYorum: Yorum = {
      id: "yorum-" + Date.now(),
      yazar: yazarAdi,
      icerik: yorumMetni.trim(),
      tarih: "Az önce",
    };

    const guncel = konular.map((k) =>
      k.id === konuId ? { ...k, yorumlar: [...k.yorumlar, yeniYorum] } : k
    );
    setKonular(guncel);
    setYorumMetni("");

    try {
      localStorage.setItem("sargyt_forum", JSON.stringify(guncel));
    } catch {}
  }

  const filtrelenmis = konular.filter(
    (k) => seciliKategori === "Tümü" || k.kategori === seciliKategori
  );

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST BAŞLIK & YENİ KONU BUTONU */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px" }}>💬 Topluluk Forumu</h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 16 }}>
            Saldırı taktiklerini tartış, köy düzeni önerileri al veya klanına yeni savaşçılar davet et.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setYeniFormAcik(!yeniFormAcik)}
          style={{
            padding: "13px 24px",
            borderRadius: 12,
            border: 0,
            background: "var(--vurgu)",
            color: "#111",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {yeniFormAcik ? "✕ Formu Kapat" : "✍️ Yeni Konu Aç"}
        </button>
      </div>

      {/* YENİ KONU AÇMA FORMU */}
      {yeniFormAcik && (
        <form
          onSubmit={konuOlustur}
          style={{
            padding: 24,
            background: "var(--kart)",
            border: "1px solid var(--vurgu)",
            borderRadius: 16,
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong style={{ fontSize: 19 }}>Yeni Tartışma Başlat</strong>
            {!kullaniciEmail && (
              <span style={{ fontSize: 13, opacity: 0.75 }}>
                Kendi kullanıcı adınla yazmak için{" "}
                <Link href="/giris" style={{ color: "var(--vurgu)" }}>
                  giriş yap
                </Link>
                .
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <input
              required
              value={baslik}
              onChange={(e) => setBaslik(e.target.value)}
              placeholder="Konu başlığı..."
              maxLength={100}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 15,
              }}
            />
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as Konu["kategori"])}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 15,
              }}
            >
              <option value="Saldırı Taktikleri">Saldırı Taktikleri</option>
              <option value="Köy Düzeni">Köy Düzeni</option>
              <option value="Klan Alımı">Klan Alımı</option>
              <option value="Soru & Cevap">Soru & Cevap</option>
            </select>
          </div>

          <textarea
            required
            rows={4}
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            placeholder="Sorunu, taktiğini veya klan bilgilerini buraya yaz..."
            maxLength={1000}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 15,
              resize: "vertical",
            }}
          />

          <button
            type="submit"
            style={{
              alignSelf: "flex-end",
              padding: "12px 26px",
              borderRadius: 10,
              border: 0,
              background: "var(--vurgu)",
              color: "#111",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Konuyu Yayınla
          </button>
        </form>
      )}

      {/* KATEGORİ FİLTRELERİ */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {KATEGORILER.map((kat) => {
          const aktif = seciliKategori === kat;
          return (
            <button
              key={kat}
              onClick={() => setSeciliKategori(kat)}
              style={{
                padding: "9px 16px",
                borderRadius: 10,
                border: aktif ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                background: aktif ? "var(--vurgu)" : "var(--kart)",
                color: aktif ? "#111" : "var(--fg)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {kat}
            </button>
          );
        })}
      </div>

      {/* KONU LİSTESİ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtrelenmis.length === 0 ? (
          <div
            style={{
              padding: 40,
              background: "var(--kart)",
              border: "1px dashed var(--cizgi)",
              borderRadius: 16,
              textAlign: "center",
              opacity: 0.85,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
            <strong style={{ fontSize: 18, display: "block", marginBottom: 6 }}>
              Henüz bu kategoride açılmış bir konu yok
            </strong>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
              Sağ üstteki <strong>"✍️ Yeni Konu Aç"</strong> butonuna tıklayarak ilk tartışmayı sen başlatabilirsin!
            </p>
          </div>
        ) : (
          filtrelenmis.map((k) => {
            const acik = acikKonuId === k.id;
            return (
              <article
                key={k.id}
                style={{
                  padding: 22,
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 16,
                }}
              >
                <div
                  onClick={() => setAcikKonuId(acik ? null : k.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 10px",
                          borderRadius: 8,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                          color: "var(--vurgu)",
                          fontWeight: 800,
                        }}
                      >
                        {k.kategori}
                      </span>
                      <span style={{ fontSize: 13, opacity: 0.7 }}>
                        👤 <strong>{k.yazar}</strong> · {k.tarih}
                      </span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{k.baslik}</h2>
                  </div>

                  <span
                    style={{
                      alignSelf: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                    }}
                  >
                    💬 {k.yorumlar.length} Yanıt {acik ? "▲" : "▼"}
                  </span>
                </div>

                <p style={{ margin: "12px 0 0", fontSize: 15, opacity: 0.88, lineHeight: 1.55 }}>{k.icerik}</p>

                {/* YORUMLAR & YANIT YAZMA ALANI */}
                {acik && (
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 16,
                      borderTop: "1px solid var(--cizgi)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {k.yorumlar.map((y) => (
                      <div
                        key={y.id}
                        style={{
                          padding: "12px 16px",
                          borderRadius: 12,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                        }}
                      >
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                          <strong>{y.yazar}</strong> · {y.tarih}
                        </div>
                        <div style={{ fontSize: 14, lineHeight: 1.45 }}>{y.icerik}</div>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <input
                        value={yorumMetni}
                        onChange={(e) => setYorumMetni(e.target.value)}
                        placeholder="Bu konuya yanıt yaz..."
                        style={{
                          flex: 1,
                          padding: "11px 14px",
                          borderRadius: 10,
                          border: "1px solid var(--cizgi)",
                          background: "var(--bg)",
                          color: "var(--fg)",
                          fontSize: 14,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => yorumEkle(k.id)}
                        style={{
                          padding: "11px 20px",
                          borderRadius: 10,
                          border: 0,
                          background: "var(--vurgu)",
                          color: "#111",
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        Gönder
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
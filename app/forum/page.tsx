"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "../supabase";

// BURAYA KENDİ ADMİN E-POSTA ADRESİNİ YAZ:
const ADMIN_EPOSTALAR = ["sargytr0@gmail.com"];

// Önden engellenecek küfür, hakaret ve Supercell Hizmet Şartları ihlal kalıpları
const YASAKLI_KELIMELER = [
  // Supercell Hizmet Şartları İhlalleri (Hesap satışı, hile, bot vb.)
  "hesap satilik", "hesap satılık", "hesap satiyorum", "hesap satıyorum",
  "koy satilik", "köy satılık", "hesap takas", "koy takas", "köy takas",
  "bedava tas", "bedava taş", "ucretsiz tas", "ücretsiz taş",
  "gem hilesi", "tas hilesi", "taş hilesi", "elmas hilesi",
  "mod apk", "hile apk", "bot indir", "oto saldiri bot",
  // Ağır küfür ve hakaret kalıpları
  "amk", "aq", "orospu", "pic", "piç", "yarrak", "yarak", "sikik", "siktir",
  "sikeyim", "götveren", "gotveren", "ibne", "pezevenk", "kahpe", "oc", "oç",
];

function metinKontrolEt(hamMetin: string): string | null {
  const temiz = hamMetin
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[.,\-_*!?@#$%^&()+=]/g, " ");

  for (const yasak of YASAKLI_KELIMELER) {
    const normYasak = yasak
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");

    const regex = new RegExp(`(^|\\s)${normYasak}(\\s|$)`, "i");
    if (regex.test(temiz) || (normYasak.length >= 5 && temiz.includes(normYasak))) {
      return "Paylaşımınız topluluk kurallarına veya Supercell Hizmet Şartları'na (hesap satışı/takası, hile, hakaret vb.) aykırı ifadeler içerdiği için engellendi.";
    }
  }
  return null;
}

type Yorum = {
  id: string;
  konu_id: string;
  yazar: string;
  icerik: string;
  created_at: string;
};

type Konu = {
  id: string;
  baslik: string;
  kategori: "Saldırı Taktikleri" | "Köy Düzeni" | "Klan Alımı" | "Soru & Cevap";
  yazar: string;
  icerik: string;
  created_at: string;
  yorumlar: Yorum[];
};

const KATEGORILER = ["Tümü", "Saldırı Taktikleri", "Köy Düzeni", "Klan Alımı", "Soru & Cevap"] as const;

function zamanFormatla(isoTarih: string): string {
  const farkSaniye = Math.floor((Date.now() - new Date(isoTarih).getTime()) / 1000);
  if (farkSaniye < 60) return "Az önce";
  const farkDakika = Math.floor(farkSaniye / 60);
  if (farkDakika < 60) return `${farkDakika} dk önce`;
  const farkSaat = Math.floor(farkDakika / 60);
  if (farkSaat < 24) return `${farkSaat} saat önce`;
  return new Date(isoTarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function ForumSayfasi() {
  const [konular, setKonular] = useState<Konu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliKategori, setSeciliKategori] = useState<(typeof KATEGORILER)[number]>("Tümü");
  const [kullaniciEmail, setKullaniciEmail] = useState<string | null>(null);

  // Yeni konu formu
  const [yeniFormAcik, setYeniFormAcik] = useState(false);
  const [baslik, setBaslik] = useState("");
  const [kategori, setKategori] = useState<Konu["kategori"]>("Soru & Cevap");
  const [icerik, setIcerik] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [uyariMesaji, setUyariMesaji] = useState("");

  // Yorum yazma state'leri
  const [acikKonuId, setAcikKonuId] = useState<string | null>(null);
  const [yorumMetni, setYorumMetni] = useState("");
  const [yorumGonderiliyor, setYorumGonderiliyor] = useState(false);

  const adminMi =
    !!kullaniciEmail &&
    ADMIN_EPOSTALAR.some((mail) => mail.toLowerCase() === kullaniciEmail.toLowerCase());

  const konulariGetir = useCallback(async () => {
    setYukleniyor(true);
    try {
      const [{ data: konuVeri, error: konuHata }, { data: yorumVeri }] = await Promise.all([
        supabase.from("forum_konular").select("*").order("created_at", { ascending: false }),
        supabase.from("forum_yorumlar").select("*").order("created_at", { ascending: true }),
      ]);

      if (!konuHata && konuVeri) {
        const birlesik: Konu[] = konuVeri.map((k) => ({
          id: k.id,
          baslik: k.baslik,
          kategori: k.kategori as Konu["kategori"],
          yazar: k.yazar,
          icerik: k.icerik,
          created_at: k.created_at,
          yorumlar: (yorumVeri ?? []).filter((y) => y.konu_id === k.id),
        }));
        setKonular(birlesik);
        if (birlesik.length > 0) {
          setAcikKonuId((prev) => prev ?? birlesik[0].id);
        }
      }
    } catch {}
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    async function baslat() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setKullaniciEmail(data.session.user.email);
      }
      await konulariGetir();
    }
    baslat();
  }, [konulariGetir]);

  async function konuOlustur(e: FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !icerik.trim() || gonderiliyor) return;

    // 1. Katman: Önden Küfür & Supercell Kural İhlali Kontrolü
    const engel = metinKontrolEt(baslik + " " + icerik);
    if (engel) {
      setUyariMesaji(engel);
      return;
    }

    setUyariMesaji("");
    setGonderiliyor(true);
    const yazarAdi = adminMi
      ? "👑 Sargyt (Admin)"
      : kullaniciEmail
      ? kullaniciEmail.split("@")[0]
      : "Misafir Oyuncu";

    const { data, error } = await supabase
      .from("forum_konular")
      .insert({
        baslik: baslik.trim(),
        kategori,
        yazar: yazarAdi,
        icerik: icerik.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      const yeniKonu: Konu = {
        id: data.id,
        baslik: data.baslik,
        kategori: data.kategori,
        yazar: data.yazar,
        icerik: data.icerik,
        created_at: data.created_at,
        yorumlar: [],
      };
      setKonular((prev) => [yeniKonu, ...prev]);
      setAcikKonuId(yeniKonu.id);
      setBaslik("");
      setIcerik("");
      setYeniFormAcik(false);
    }
    setGonderiliyor(false);
  }

  async function yorumEkle(konuId: string) {
    if (!yorumMetni.trim() || yorumGonderiliyor) return;

    const engel = metinKontrolEt(yorumMetni);
    if (engel) {
      alert(engel);
      return;
    }

    setYorumGonderiliyor(true);
    const yazarAdi = adminMi
      ? "👑 Sargyt (Admin)"
      : kullaniciEmail
      ? kullaniciEmail.split("@")[0]
      : "Misafir Oyuncu";

    const { data, error } = await supabase
      .from("forum_yorumlar")
      .insert({
        konu_id: konuId,
        yazar: yazarAdi,
        icerik: yorumMetni.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setKonular((prev) =>
        prev.map((k) =>
          k.id === konuId ? { ...k, yorumlar: [...k.yorumlar, data] } : k
        )
      );
      setYorumMetni("");
    }
    setYorumGonderiliyor(false);
  }

  // 2. Katman: Admin Konu Silme
  async function konuSil(konuId: string) {
    if (!adminMi) return;
    if (!confirm("Bu konuyu ve altındaki tüm yorumları kalıcı olarak silmek istiyor musun?")) return;

    const { error } = await supabase.from("forum_konular").delete().eq("id", konuId);
    if (!error) {
      setKonular((prev) => prev.filter((k) => k.id !== konuId));
    } else {
      alert("Silme yetkisi doğrulanamadı. Supabase SQL Editor'de admin delete politikasını çalıştırdığından emin ol.");
    }
  }

  // 2. Katman: Admin Yorum Silme
  async function yorumSil(konuId: string, yorumId: string) {
    if (!adminMi) return;
    const { error } = await supabase.from("forum_yorumlar").delete().eq("id", yorumId);
    if (!error) {
      setKonular((prev) =>
        prev.map((k) =>
          k.id === konuId ? { ...k, yorumlar: k.yorumlar.filter((y) => y.id !== yorumId) } : k
        )
      );
    }
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>💬 Canlı Topluluk Forumu</h1>
            {adminMi && (
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: 10,
                  background: "#f59e0b",
                  color: "#111",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                👑 Admin Modu Aktif
              </span>
            )}
          </div>
          <p style={{ opacity: 0.75, margin: "8px 0 0", fontSize: 16 }}>
            Saldırı taktiklerini tartış, köy düzeni önerileri al veya klanına yeni savaşçılar davet et.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={konulariGetir}
            style={{
              padding: "13px 18px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--kart)",
              color: "var(--fg)",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🔄 Yenile
          </button>

          <button
            type="button"
            onClick={() => {
              setYeniFormAcik(!yeniFormAcik);
              setUyariMesaji("");
            }}
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
      </div>

      {/* TOPLULUK & SUPERCELL KURAL BİLGİLENDİRME ŞERİDİ */}
      <div
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          fontSize: 13,
          opacity: 0.85,
          marginBottom: 20,
        }}
      >
        🛡️ <strong>Topluluk Kuralları:</strong> Supercell Hizmet Şartları gereği <strong>hesap satışı/takası, hile/bot paylaşımı</strong> ve hakaret içeren mesajlar otomatik olarak engellenir.
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
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

          {uyariMesaji && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                color: "#ef6b5f",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ⛔ {uyariMesaji}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
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
            disabled={gonderiliyor}
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
            {gonderiliyor ? "Yayınlanıyor..." : "Konuyu Yayınla"}
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
        {yukleniyor ? (
          <div style={{ padding: 32, textAlign: "center", opacity: 0.75 }}>
            ⏳ Topluluk konuları yükleniyor...
          </div>
        ) : filtrelenmis.length === 0 ? (
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    onClick={() => setAcikKonuId(acik ? null : k.id)}
                    style={{ flex: 1, cursor: "pointer" }}
                  >
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
                        👤 <strong>{k.yazar}</strong> · {zamanFormatla(k.created_at)}
                      </span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{k.baslik}</h2>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setAcikKonuId(acik ? null : k.id)}
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "var(--bg)",
                        border: "1px solid var(--cizgi)",
                        color: "var(--fg)",
                        cursor: "pointer",
                      }}
                    >
                      💬 {k.yorumlar.length} Yanıt {acik ? "▲" : "▼"}
                    </button>

                    {adminMi && (
                      <button
                        type="button"
                        onClick={() => konuSil(k.id)}
                        title="Admin: Konuyu Sil"
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: "rgba(239, 68, 68, 0.16)",
                          border: "1px solid #ef4444",
                          color: "#ef6b5f",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Konuyu Sil
                      </button>
                    )}
                  </div>
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
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                            <strong>{y.yazar}</strong> · {zamanFormatla(y.created_at)}
                          </div>
                          <div style={{ fontSize: 14, lineHeight: 1.45 }}>{y.icerik}</div>
                        </div>

                        {adminMi && (
                          <button
                            type="button"
                            onClick={() => yorumSil(k.id, y.id)}
                            title="Admin: Yorumu Sil"
                            style={{
                              padding: "4px 9px",
                              borderRadius: 6,
                              border: "1px solid #ef4444",
                              background: "transparent",
                              color: "#ef6b5f",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            🗑️ Sil
                          </button>
                        )}
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
                        disabled={yorumGonderiliyor}
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
                        {yorumGonderiliyor ? "..." : "Gönder"}
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
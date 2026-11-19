"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "../supabase";

const ADMIN_EPOSTALAR = ["sargytr0@gmail.com"];

const YASAKLI_KOKLER = [
  "hesap sat", "koy sat", "köy sat", "hesabi sat", "hesabı sat",
  "hesap takas", "koy takas", "köy takas", "takaslik", "takaslık",
  "bedava tas", "bedava taş", "ucretsiz tas", "ücretsiz taş",
  "gem hile", "tas hile", "taş hile", "elmas hile",
  "mod apk", "hile apk", "bot indir", "oto saldiri",
  "amk", "aq", "orospu", "pic", "piç", "yarrak", "yarak", "sikik", "siktir",
  "sikeyim", "götveren", "gotveren", "ibne", "pezevenk", "kahpe", "oç",
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
    .replace(/[.,\-_*!?@#$%^&()+=]/g, " ")
    .replace(/\s+/g, " ");

  for (const kok of YASAKLI_KOKLER) {
    const normKok = kok
      .toLowerCase()
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c");

    if (normKok.length <= 3) {
      const regex = new RegExp(`(^|\\s)${normKok}(\\s|$)`, "i");
      if (regex.test(temiz)) {
        return "Paylaşımınız topluluk kurallarına veya Supercell Hizmet Şartları'na aykırı ifadeler içerdiği için engellendi.";
      }
    } else if (temiz.includes(normKok)) {
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
  yazar_email?: string | null;
  icerik: string;
  oylar: number;
  kapali: boolean;
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
  const [sirala, setSirala] = useState<"yeni" | "trend" | "yorum">("yeni");
  const [aramaMetni, setAramaMetni] = useState("");
  const [durumFiltre, setDurumFiltre] = useState<"hepsi" | "acik" | "cozuldu">("hepsi");
  const [kullaniciEmail, setKullaniciEmail] = useState<string | null>(null);
  const [oyVerilenler, setOyVerilenler] = useState<string[]>([]);

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
          yazar_email: k.yazar_email ?? null,
          icerik: k.icerik,
          oylar: k.oylar ?? 0,
          kapali: Boolean(k.kapali),
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
    try {
      const kayitOylar = JSON.parse(localStorage.getItem("sargyt_forum_oylar") || "[]");
      if (Array.isArray(kayitOylar)) setOyVerilenler(kayitOylar);
    } catch {}

    supabase.auth.getSession().then(({ data }) => {
      setKullaniciEmail(data.session?.user?.email ?? null);
    });

    const { data: dinleyici } = supabase.auth.onAuthStateChange((_event, session) => {
      setKullaniciEmail(session?.user?.email ?? null);
    });

    konulariGetir();

    return () => {
      dinleyici.subscription.unsubscribe();
    };
  }, [konulariGetir]);

  async function konuOlustur(e: FormEvent) {
    e.preventDefault();
    if (!baslik.trim() || !icerik.trim() || gonderiliyor) return;

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
        yazar_email: kullaniciEmail,
        icerik: icerik.trim(),
        oylar: 1,
        kapali: false,
      })
      .select()
      .single();

    if (!error && data) {
      const yeniKonu: Konu = {
        id: data.id,
        baslik: data.baslik,
        kategori: data.kategori,
        yazar: data.yazar,
        yazar_email: data.yazar_email,
        icerik: data.icerik,
        oylar: data.oylar ?? 1,
        kapali: false,
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

  async function oyVer(konu: Konu) {
    if (oyVerilenler.includes(konu.id)) return;
    const yeniOy = (konu.oylar ?? 0) + 1;

    setKonular((prev) =>
      prev.map((k) => (k.id === konu.id ? { ...k, oylar: yeniOy } : k))
    );
    const guncelOylar = [...oyVerilenler, konu.id];
    setOyVerilenler(guncelOylar);
    try {
      localStorage.setItem("sargyt_forum_oylar", JSON.stringify(guncelOylar));
    } catch {}

    await supabase.from("forum_konular").update({ oylar: yeniOy }).eq("id", konu.id);
  }

  async function durumDegistir(konu: Konu) {
    const yeniDurum = !konu.kapali;
    const { error } = await supabase
      .from("forum_konular")
      .update({ kapali: yeniDurum })
      .eq("id", konu.id);

    if (!error) {
      setKonular((prev) =>
        prev.map((k) => (k.id === konu.id ? { ...k, kapali: yeniDurum } : k))
      );
    }
  }

  async function yorumEkle(konu: Konu) {
    if (konu.kapali || !yorumMetni.trim() || yorumGonderiliyor) return;

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
        konu_id: konu.id,
        yazar: yazarAdi,
        icerik: yorumMetni.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setKonular((prev) =>
        prev.map((k) =>
          k.id === konu.id ? { ...k, yorumlar: [...k.yorumlar, data] } : k
        )
      );
      setYorumMetni("");
    }
    setYorumGonderiliyor(false);
  }

async function konuSil(konuId: string) {
    if (!adminMi) return;
    if (!confirm("Bu konuyu ve altındaki tüm yorumları kalıcı olarak silmek istiyor musun?")) return;

    const { data, error } = await supabase
      .from("forum_konular")
      .delete()
      .eq("id", konuId)
      .select();

    if (error || !data || data.length === 0) {
      alert("Veritabanından silinemedi! Supabase SQL Editor'de admin delete politikasını çalıştırdığından emin ol.");
      return;
    }

    setKonular((prev) => prev.filter((k) => k.id !== konuId));
  }

  async function yorumSil(konuId: string, yorumId: string) {
    if (!adminMi) return;

    const { data, error } = await supabase
      .from("forum_yorumlar")
      .delete()
      .eq("id", yorumId)
      .select();

    if (error || !data || data.length === 0) {
      alert("Yorum veritabanından silinemedi!");
      return;
    }

    setKonular((prev) =>
      prev.map((k) =>
        k.id === konuId ? { ...k, yorumlar: k.yorumlar.filter((y) => y.id !== yorumId) } : k
      )
    );
  }

  const filtrelenmis = konular
    .filter((k) => seciliKategori === "Tümü" || k.kategori === seciliKategori)
    .filter((k) => {
      if (durumFiltre === "acik") return !k.kapali;
      if (durumFiltre === "cozuldu") return k.kapali;
      return true;
    })
    .filter((k) => {
      if (!aramaMetni.trim()) return true;
      const q = aramaMetni.toLowerCase();
      return (
        k.baslik.toLowerCase().includes(q) ||
        k.icerik.toLowerCase().includes(q) ||
        k.yazar.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sirala === "trend") return (b.oylar ?? 0) - (a.oylar ?? 0);
      if (sirala === "yorum") return b.yorumlar.length - a.yorumlar.length;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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
          marginBottom: 20,
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
            Beğendiğin konulara oy vererek trende çıkar, çözüme ulaşan tartışmaları kapatarak arşive ekle.
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
                Açtığın konuyu ileride &quot;Çözüldü&quot; olarak kapatabilmek için{" "}
                <Link href="/giris" style={{ color: "var(--vurgu)" }}>
                  giriş yapman
                </Link>{" "}
                önerilir.
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

      {/* ARAMA, SIRALAMA VE DURUM FİLTRESİ ÇUBUĞU */}
      <div
        style={{
          padding: 16,
          borderRadius: 14,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          marginBottom: 18,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="🔍 Konularda veya geçmiş çözümlerde ara..."
            style={{
              flex: 1,
              minWidth: 240,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 14,
            }}
          />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(
              [
                { id: "yeni", ad: "🆕 En Yeni" },
                { id: "trend", ad: "🔥 Trend (En Çok Oy)" },
                { id: "yorum", ad: "💬 En Çok Yorum" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSirala(s.id)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 10,
                  border: sirala === s.id ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                  background: sirala === s.id ? "var(--vurgu)" : "var(--bg)",
                  color: sirala === s.id ? "#111" : "var(--fg)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {s.ad}
              </button>
            ))}
          </div>

          <select
            value={durumFiltre}
            onChange={(e) => setDurumFiltre(e.target.value as "hepsi" | "acik" | "cozuldu")}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <option value="hepsi">Tüm Konular</option>
            <option value="acik">🟢 Açık Tartışmalar</option>
            <option value="cozuldu">✅ Çözüldü / Arşiv</option>
          </select>
        </div>

        {/* KATEGORİ FİLTRELERİ */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {KATEGORILER.map((kat) => {
            const aktif = seciliKategori === kat;
            return (
              <button
                key={kat}
                onClick={() => setSeciliKategori(kat)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 9,
                  border: aktif ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                  background: aktif ? "var(--vurgu)" : "var(--bg)",
                  color: aktif ? "#111" : "var(--fg)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {kat}
              </button>
            );
          })}
        </div>
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
              Aradığın kriterde konu bulunamadı
            </strong>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
              Sağ üstteki <strong>&quot;✍️ Yeni Konu Aç&quot;</strong> butonuna tıklayarak ilk tartışmayı sen başlatabilirsin!
            </p>
          </div>
        ) : (
          filtrelenmis.map((k) => {
            const acik = acikKonuId === k.id;
            const oyVerildi = oyVerilenler.includes(k.id);
            const sahibiMi =
              !!kullaniciEmail &&
              !!k.yazar_email &&
              kullaniciEmail.toLowerCase() === k.yazar_email.toLowerCase();
            const kapatabilirMi = adminMi || sahibiMi;

            return (
              <article
                key={k.id}
                style={{
                  padding: 22,
                  background: "var(--kart)",
                  border: k.kapali ? "1px solid #22c55e" : "1px solid var(--cizgi)",
                  borderRadius: 16,
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  {/* SOL TARAF: OYLAMA (UPVOTE) BUTONU */}
                  <button
                    type="button"
                    onClick={() => oyVer(k)}
                    disabled={oyVerildi}
                    title={oyVerildi ? "Bu konuya oy verdin" : "Trende çıkarmak için oy ver"}
                    style={{
                      minWidth: 58,
                      padding: "10px 8px",
                      borderRadius: 12,
                      border: "1px solid " + (oyVerildi ? "var(--vurgu)" : "var(--cizgi)"),
                      background: oyVerildi ? "rgba(245, 197, 66, 0.18)" : "var(--bg)",
                      color: oyVerildi ? "var(--vurgu)" : "var(--fg)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      cursor: oyVerildi ? "default" : "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 900 }}>▲</span>
                    <span style={{ fontSize: 16, fontWeight: 900 }}>{k.oylar ?? 0}</span>
                    <span style={{ fontSize: 10, opacity: 0.75 }}>OY</span>
                  </button>

                  {/* SAĞ TARAF: KONU BAŞLIĞI, DURUM ETİKETLERİ VE YÖNETİM */}
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                          {k.kapali && (
                            <span
                              style={{
                                fontSize: 12,
                                padding: "3px 10px",
                                borderRadius: 8,
                                background: "rgba(34, 197, 94, 0.18)",
                                border: "1px solid #22c55e",
                                color: "#22c55e",
                                fontWeight: 800,
                              }}
                            >
                              ✅ Çözüldü & Kilitli
                            </span>
                          )}
                          {(k.oylar ?? 0) >= 5 && (
                            <span
                              style={{
                                fontSize: 12,
                                padding: "3px 10px",
                                borderRadius: 8,
                                background: "rgba(245, 158, 11, 0.18)",
                                border: "1px solid #f59e0b",
                                color: "#f59e0b",
                                fontWeight: 800,
                              }}
                            >
                              🔥 Trend
                            </span>
                          )}
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

                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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

                        {kapatabilirMi && (
                          <button
                            type="button"
                            onClick={() => durumDegistir(k)}
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              padding: "6px 11px",
                              borderRadius: 8,
                              background: k.kapali ? "var(--bg)" : "rgba(34, 197, 94, 0.15)",
                              border: "1px solid #22c55e",
                              color: "#22c55e",
                              cursor: "pointer",
                            }}
                          >
                            {k.kapali ? "🔓 Tekrar Aç" : "✅ Çözüldü Olarak Kapat"}
                          </button>
                        )}

                        {adminMi && (
                          <button
                            type="button"
                            onClick={() => konuSil(k.id)}
                            title="Admin: Konuyu Sil"
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              padding: "6px 11px",
                              borderRadius: 8,
                              background: "rgba(239, 68, 68, 0.16)",
                              border: "1px solid #ef4444",
                              color: "#ef6b5f",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Sil
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

                        {k.kapali ? (
                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: 10,
                              background: "rgba(34, 197, 94, 0.12)",
                              border: "1px solid #22c55e",
                              color: "#22c55e",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            🔒 Bu konu çözüme ulaştığı için kapatılmıştır. Geçmiş cevapları inceleyebilir ancak yeni yorum yazamazsınız.
                          </div>
                        ) : (
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
                              onClick={() => yorumEkle(k)}
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
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
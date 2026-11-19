"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../supabase";

type Duzen = {
  id: string;
  kod: string;
  baslik: string;
  th: number;
  tur: "Klan Savaşı" | "Efsane Ligi" | "Ganimet" | "Hibrit";
  etiket: string;
  gorsel: string;
  oyun_linki: string;
  kopyalama: number;
  created_at?: string;
};

type OySatiri = {
  duzen_id: string;
  user_id: string;
  oy: number;
};

const ADMIN_EPOSTA = "sargytr0@gmail.com";
const TH_SEVIYELERI = ["13", "14", "15", "16", "17"];

function rastgeleKodUret(): string {
  const karakterler = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let sonuc = "#";
  for (let i = 0; i < 6; i++) {
    sonuc += karakterler[Math.floor(Math.random() * karakterler.length)];
  }
  return sonuc;
}

function gorselYoluCoz(gorsel: string): string {
  const temiz = gorsel.trim();
  if (temiz.startsWith("http://") || temiz.startsWith("https://") || temiz.startsWith("/")) {
    return temiz;
  }
  return `/duzenler/${temiz}`;
}

function DuzenGorselKutusu({
  gorsel,
  baslik,
  th,
  onBuyut,
}: {
  gorsel: string;
  baslik: string;
  th: number;
  onBuyut: () => void;
}) {
  const [hata, setHata] = useState(false);

  return (
    <div
      onClick={onBuyut}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onBuyut();
      }}
      title="Tam ekran incelemek için tıkla"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        background: "var(--bg)",
        borderBottom: "1px solid var(--cizgi)",
        overflow: "hidden",
        cursor: "zoom-in",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {hata || !gorsel.trim() ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: 0.75,
            padding: 16,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 38 }}>🏰</span>
          <strong style={{ fontSize: 15, color: "var(--vurgu)" }}>Belediye Binası {th} Düzeni</strong>
          <span style={{ fontSize: 12 }}>Önizleme görseli henüz yüklenmedi</span>
        </div>
      ) : (
        <img
          src={gorselYoluCoz(gorsel)}
          alt={baslik}
          onError={() => setHata(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      <span
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          padding: "4px 9px",
          borderRadius: 8,
          background: "rgba(10, 10, 12, 0.78)",
          color: "#fff",
          fontSize: 11.5,
          fontWeight: 700,
          backdropFilter: "blur(4px)",
        }}
      >
        🔍 Büyüt
      </span>
    </div>
  );
}

export default function DuzenlerSayfasi() {
  const [duzenler, setDuzenler] = useState<Duzen[]>([]);
  const [oylar, setOylar] = useState<OySatiri[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const [kullaniciId, setKullaniciId] = useState<string | null>(null);
  const [kullaniciEposta, setKullaniciEposta] = useState<string | null>(null);

  // Filtre ve Sıralama State'leri
  const [thFiltre, setThFiltre] = useState("Tümü");
  const [turFiltre, setTurFiltre] = useState("Tümü");
  const [arama, setArama] = useState("");
  const [siralama, setSiralama] = useState<"yeni" | "populer" | "kopyalama">("yeni");

  // Bildirim & Büyütme Modalı
  const [uyariMesaji, setUyariMesaji] = useState("");
  const [buyukDuzen, setBuyukDuzen] = useState<Duzen | null>(null);

  // Admin Düzen Ekleme Formu
  const [formAcik, setFormAcik] = useState(false);
  const [yeniKod, setYeniKod] = useState("");
  const [yeniBaslik, setYeniBaslik] = useState("");
  const [yeniTh, setYeniTh] = useState("17");
  const [yeniTur, setYeniTur] = useState<Duzen["tur"]>("Klan Savaşı");
  const [yeniEtiket, setYeniEtiket] = useState("Anti-3 Yıldız");
  const [yeniGorsel, setYeniGorsel] = useState("");
  const [yeniLink, setYeniLink] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const adminMi = kullaniciEposta?.toLowerCase() === ADMIN_EPOSTA;

  async function verileriYukle() {
    setYukleniyor(true);
    const [{ data: duzenVeri }, { data: oyVeri }] = await Promise.all([
      supabase.from("koy_duzenleri").select("*").order("created_at", { ascending: false }),
      supabase.from("duzen_oylari").select("duzen_id, user_id, oy"),
    ]);

    if (Array.isArray(duzenVeri)) setDuzenler(duzenVeri as Duzen[]);
    if (Array.isArray(oyVeri)) setOylar(oyVeri as OySatiri[]);
    setYukleniyor(false);
  }

  useEffect(() => {
    setYeniKod(rastgeleKodUret());
    supabase.auth.getSession().then(({ data }) => {
      setKullaniciId(data.session?.user?.id ?? null);
      setKullaniciEposta(data.session?.user?.email ?? null);
    });

    const { data: dinleyici } = supabase.auth.onAuthStateChange((_event, session) => {
      setKullaniciId(session?.user?.id ?? null);
      setKullaniciEposta(session?.user?.email ?? null);
    });

    verileriYukle();

    return () => {
      dinleyici.subscription.unsubscribe();
    };
  }, []);

  function mesajGoster(metin: string) {
    setUyariMesaji(metin);
    setTimeout(() => setUyariMesaji(""), 3500);
  }

  async function duzenEkle(e: FormEvent) {
    e.preventDefault();
    if (!adminMi) return;

    const temizKod = yeniKod.trim().toUpperCase().startsWith("#")
      ? yeniKod.trim().toUpperCase()
      : `#${yeniKod.trim().toUpperCase()}`;

    if (temizKod.length < 4) {
      mesajGoster("Düzen kodu en az 3 karakter olmalıdır.");
      return;
    }

    if (!yeniLink.trim().startsWith("https://link.clashofclans.com/")) {
      mesajGoster("Geçerli bir Clash of Clans düzen bağlantısı girmelisin (https://link.clashofclans.com/...).");
      return;
    }

    setKaydediliyor(true);
    const { data, error } = await supabase
      .from("koy_duzenleri")
      .insert({
        kod: temizKod,
        baslik: yeniBaslik.trim(),
        th: Number(yeniTh),
        tur: yeniTur,
        etiket: yeniEtiket.trim() || "Meta Düzen",
        gorsel: yeniGorsel.trim(),
        oyun_linki: yeniLink.trim(),
      })
      .select()
      .single();

    setKaydediliyor(false);

    if (error) {
      mesajGoster(
        error.code === "23505"
          ? "Bu düzen kodu zaten kullanılıyor, yeni bir kod üret."
          : "Düzen eklenemedi: " + error.message
      );
      return;
    }

    if (data) {
      setDuzenler((prev) => [data as Duzen, ...prev]);
    }
    setYeniKod(rastgeleKodUret());
    setYeniBaslik("");
    setYeniGorsel("");
    setYeniLink("");
    setFormAcik(false);
    mesajGoster("Yeni köy düzeni başarıyla yayınlandı!");
  }

  async function duzenSil(id: string) {
    if (!adminMi) return;
    if (!confirm("Bu köy düzenini kalıcı olarak silmek istiyor musun?")) return;
    const { error } = await supabase.from("koy_duzenleri").delete().eq("id", id);
    if (!error) {
      setDuzenler((prev) => prev.filter((d) => d.id !== id));
      mesajGoster("Düzen kaldırıldı.");
    }
  }

  async function oyVer(duzenId: string, secilenOy: -1 | 1) {
    if (!kullaniciId) {
      mesajGoster("Oy verebilmek için önce üye girişi yapmalısın.");
      return;
    }

    const mevcut = oylar.find((o) => o.duzen_id === duzenId && o.user_id === kullaniciId);

    if (mevcut && mevcut.oy === secilenOy) {
      setOylar((prev) => prev.filter((o) => !(o.duzen_id === duzenId && o.user_id === kullaniciId)));
      await supabase.from("duzen_oylari").delete().eq("duzen_id", duzenId).eq("user_id", kullaniciId);
    } else if (mevcut) {
      setOylar((prev) =>
        prev.map((o) => (o.duzen_id === duzenId && o.user_id === kullaniciId ? { ...o, oy: secilenOy } : o))
      );
      await supabase
        .from("duzen_oylari")
        .update({ oy: secilenOy })
        .eq("duzen_id", duzenId)
        .eq("user_id", kullaniciId);
    } else {
      setOylar((prev) => [...prev, { duzen_id: duzenId, user_id: kullaniciId, oy: secilenOy }]);
      await supabase.from("duzen_oylari").insert({ duzen_id: duzenId, user_id: kullaniciId, oy: secilenOy });
    }
  }

 async function kopyalamaArtir(duzen: Duzen) {
    const yeniSayi = (duzen.kopyalama ?? 0) + 1;
    setDuzenler((prev) => prev.map((d) => (d.id === duzen.id ? { ...d, kopyalama: yeniSayi } : d)));
await supabase.rpc("duzen_kopyala_artir", { hedef_id: duzen.id });  }

  function netSkorHesapla(duzenId: string): number {
    return oylar.filter((o) => o.duzen_id === duzenId).reduce((toplam, o) => toplam + o.oy, 0);
  }

  function kullaniciOyuBul(duzenId: string): number {
    if (!kullaniciId) return 0;
    return oylar.find((o) => o.duzen_id === duzenId && o.user_id === kullaniciId)?.oy ?? 0;
  }

  const filtreAktifMi =
    thFiltre !== "Tümü" || turFiltre !== "Tümü" || siralama !== "yeni" || arama.trim() !== "";

  function filtreleriSifirla() {
    setThFiltre("Tümü");
    setTurFiltre("Tümü");
    setSiralama("yeni");
    setArama("");
  }

  const filtrelenmis = duzenler
    .filter((d) => {
      const thUygun = thFiltre === "Tümü" || d.th === Number(thFiltre);
      const turUygun = turFiltre === "Tümü" || d.tur === turFiltre;
      const aranan = arama.trim().toLowerCase();
      const aramaUygun =
        !aranan ||
        d.kod.toLowerCase().includes(aranan) ||
        d.baslik.toLowerCase().includes(aranan) ||
        d.etiket.toLowerCase().includes(aranan);
      return thUygun && turUygun && aramaUygun;
    })
    .sort((a, b) => {
      if (siralama === "populer") return netSkorHesapla(b.id) - netSkorHesapla(a.id);
      if (siralama === "kopyalama") return (b.kopyalama ?? 0) - (a.kopyalama ?? 0);
      return 0;
    });

  const selectStil = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid var(--cizgi)",
    background: "var(--bg)",
    color: "var(--fg)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  } as const;

  return (
    <main style={{ padding: "clamp(20px, 3vw, 34px) clamp(14px, 3vw, 28px)", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST BAŞLIK & ADMİN BUTONU */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 900, margin: "0 0 6px" }}>
            🗺️ Köy Düzenleri &amp; Kopyalama Galerisi
          </h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 15 }}>
            Güncel turnuva ve lig köy düzenlerini incele, tek tıkla oyununa kopyala veya üyeliğinle oy ver.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {!kullaniciId && (
            <Link
              href="/giris"
              style={{
                padding: "10px 16px",
                borderRadius: 11,
                border: "1px solid var(--cizgi)",
                background: "var(--kart)",
                color: "var(--fg)",
                fontSize: 13.5,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              🔑 Oy vermek için Giriş Yap
            </Link>
          )}

          {adminMi && (
            <button
              type="button"
              onClick={() => setFormAcik(!formAcik)}
              style={{
                padding: "11px 20px",
                borderRadius: 12,
                border: 0,
                background: formAcik ? "var(--kart)" : "var(--vurgu)",
                color: formAcik ? "var(--fg)" : "#111",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {formAcik ? "✕ Paneli Kapat" : "+ Yeni Köy Düzeni Ekle"}
            </button>
          )}
        </div>
      </div>

      {/* BİLDİRİM BARI */}
      {uyariMesaji && (
        <div
          style={{
            padding: "12px 18px",
            marginBottom: 18,
            borderRadius: 12,
            background: "color-mix(in srgb, var(--vurgu) 18%, var(--kart))",
            border: "1px solid var(--vurgu)",
            color: "var(--fg)",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>ℹ️ {uyariMesaji}</span>
          {!kullaniciId && uyariMesaji.includes("giriş") && (
            <Link
              href="/giris"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "var(--vurgu)",
                color: "#111",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Giriş Yap →
            </Link>
          )}
        </div>
      )}

      {/* ADMİN YENİ DÜZEN EKLEME FORMU */}
      {adminMi && formAcik && (
        <form
          onSubmit={duzenEkle}
          style={{
            padding: 22,
            marginBottom: 24,
            background: "var(--kart)",
            border: "2px solid var(--vurgu)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h2 className="baslik-serit" style={{ marginTop: 0, marginBottom: 4 }}>
            <span>👑 Sargyt Admin — Yeni Köy Düzeni Yayınla</span>
          </h2>

          <span style={{ fontSize: 12.5, opacity: 0.75, textAlign: "center" }}>
            Görselleri <code>public/duzenler/</code> klasörüne koyup adını yazabilir veya doğrudan resim linki girebilirsin.
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                required
                value={yeniKod}
                onChange={(e) => setYeniKod(e.target.value.toUpperCase())}
                placeholder="Düzen Kodu (#8X4K9P)"
                maxLength={12}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--vurgu)",
                  fontWeight: 800,
                }}
              />
              <button
                type="button"
                onClick={() => setYeniKod(rastgeleKodUret())}
                title="Yeni Rastgele Kod Üret"
                style={{
                  padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                🎲
              </button>
            </div>

            <input
              required
              value={yeniBaslik}
              onChange={(e) => setYeniBaslik(e.target.value)}
              placeholder="Düzen Başlığı (örn. BB17 Elmas Anti-3 Savaş Düzeni)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <select
              value={yeniTh}
              onChange={(e) => setYeniTh(e.target.value)}
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            >
              {TH_SEVIYELERI.map((s) => (
                <option key={s} value={s}>
                  Belediye Binası {s}
                </option>
              ))}
            </select>

            <select
              value={yeniTur}
              onChange={(e) => setYeniTur(e.target.value as Duzen["tur"])}
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            >
              <option value="Klan Savaşı">Tür: Klan Savaşı</option>
              <option value="Efsane Ligi">Tür: Efsane Ligi</option>
              <option value="Ganimet">Tür: Ganimet</option>
              <option value="Hibrit">Tür: Hibrit</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            <input
              value={yeniEtiket}
              onChange={(e) => setYeniEtiket(e.target.value)}
              placeholder="Özellik Etiketi (örn. Anti-3 Yıldız, Anti-Mızrakçı)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <input
              required
              value={yeniGorsel}
              onChange={(e) => setYeniGorsel(e.target.value)}
              placeholder="Görsel Dosya Adı (örn. bb17-savas-1.png veya https://...)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />

            <input
              required
              value={yeniLink}
              onChange={(e) => setYeniLink(e.target.value)}
              placeholder="Oyuna Kopyala Linki (https://link.clashofclans.com/...)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={kaydediliyor}
              style={{
                padding: "11px 24px",
                borderRadius: 10,
                border: 0,
                background: "var(--vurgu)",
                color: "#111",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {kaydediliyor ? "Yayınlanıyor..." : "✓ Düzeni Yayınla"}
            </button>
          </div>
        </form>
      )}

      {/* SADE TEK SATIR FİLTRE, ARAMA & SIRALAMA BAR */}
      <div
        style={{
          padding: 14,
          marginBottom: 22,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="🔍 Düzen kodu (#8X4K9P), başlık veya etiket ara..."
          aria-label="Düzen ara"
          style={{
            flex: "1 1 240px",
            minWidth: 200,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--cizgi)",
            background: "var(--bg)",
            color: "var(--fg)",
            fontSize: 14,
          }}
        />

        <select
          value={thFiltre}
          onChange={(e) => setThFiltre(e.target.value)}
          aria-label="Belediye Binası Seviyesi"
          style={selectStil}
        >
          <option value="Tümü">🏰 Tüm BB Seviyeleri</option>
          {TH_SEVIYELERI.map((s) => (
            <option key={s} value={s}>
              🏰 Belediye Binası {s}
            </option>
          ))}
        </select>

        <select
          value={turFiltre}
          onChange={(e) => setTurFiltre(e.target.value)}
          aria-label="Düzen Türü"
          style={selectStil}
        >
          <option value="Tümü">🎯 Tüm Türler</option>
          <option value="Klan Savaşı">⚔️ Klan Savaşı</option>
          <option value="Efsane Ligi">🏆 Efsane Ligi</option>
          <option value="Ganimet">💰 Ganimet</option>
          <option value="Hibrit">🛡️ Hibrit</option>
        </select>

        <select
          value={siralama}
          onChange={(e) => setSiralama(e.target.value as "yeni" | "populer" | "kopyalama")}
          aria-label="Sıralama"
          style={selectStil}
        >
          <option value="yeni">🕒 En Yeniler</option>
          <option value="populer">🔥 En Yüksek Puan</option>
          <option value="kopyalama">🎮 En Çok Kopyalanan</option>
        </select>

        {filtreAktifMi && (
          <button
            type="button"
            onClick={filtreleriSifirla}
            style={{
              padding: "10px 14px",
              minHeight: 40,
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--vurgu)",
              fontSize: 13.5,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ✕ Sıfırla
          </button>
        )}
      </div>

      {/* DÜZEN KARTLARI IZGARASI */}
      <h2 className="baslik-serit" style={{ marginTop: 0 }}>
        <span>🗺️ Yayınlanan Köy Düzenleri ({filtrelenmis.length})</span>
      </h2>

      {yukleniyor ? (
        <p style={{ opacity: 0.75, textAlign: "center", padding: 32 }}>⏳ Köy düzenleri yükleniyor...</p>
      ) : filtrelenmis.length === 0 ? (
        <div
          style={{
            padding: 40,
            background: "var(--kart)",
            border: "1px dashed var(--cizgi)",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 10 }}>🗺️</div>
          <strong style={{ fontSize: 18, display: "block", marginBottom: 6 }}>
            Henüz bu kriterde yayınlanmış bir köy düzeni yok
          </strong>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
            Filtreleri temizleyebilir veya Forum üzerinden yeni düzen talebi oluşturabilirsin.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: 20,
          }}
        >
          {filtrelenmis.map((d) => {
            const skor = netSkorHesapla(d.id);
            const benimOyum = kullaniciOyuBul(d.id);
            const forumTalepUrl = `/forum?talepKod=${encodeURIComponent(d.kod)}&talepAd=${encodeURIComponent(d.baslik)}`;

            return (
              <article
                key={d.id}
                style={{
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 18,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* 16:9 Köy Düzeni Önizleme Görseli */}
                  <DuzenGorselKutusu
                    gorsel={d.gorsel}
                    baslik={d.baslik}
                    th={d.th}
                    onBuyut={() => setBuyukDuzen(d)}
                  />

                  {/* Kart Bilgileri */}
                  <div style={{ padding: "16px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "3px 9px",
                            borderRadius: 7,
                            background: "var(--vurgu)",
                            color: "#111",
                            fontWeight: 900,
                            letterSpacing: "0.4px",
                          }}
                        >
                          {d.kod}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "3px 9px",
                            borderRadius: 7,
                            background: "var(--bg)",
                            border: "1px solid var(--cizgi)",
                            fontWeight: 700,
                          }}
                        >
                          BB {d.th} · {d.tur}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "3px 9px",
                            borderRadius: 7,
                            background: "var(--bg)",
                            border: "1px solid var(--cizgi)",
                            fontWeight: 600,
                            opacity: 0.85,
                          }}
                        >
                          {d.etiket}
                        </span>
                      </div>

                      <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 700 }}>
                        📋 {d.kopyalama ?? 0} kopyalama
                      </span>
                    </div>

                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>{d.baslik}</h2>
                  </div>
                </div>

                {/* ALT AKSİYON ÇUBUĞU: Reddit Oylama + Forum Talep + Oyuna Kopyala */}
                <div
                  style={{
                    padding: "12px 18px",
                    background: "color-mix(in srgb, var(--bg) 55%, var(--kart))",
                    borderTop: "1px solid var(--cizgi)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {/* Reddit Tarzı (+1 / -1) Üye Oylaması */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: 10,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => oyVer(d.id, 1)}
                      title={kullaniciId ? "Sağlam Düzen (+1)" : "Oy vermek için giriş yap"}
                      style={{
                        padding: "6px 10px",
                        border: 0,
                        background: benimOyum === 1 ? "rgba(34, 197, 94, 0.2)" : "transparent",
                        color: benimOyum === 1 ? "#22c55e" : "var(--fg)",
                        fontWeight: 900,
                        fontSize: 14,
                        cursor: "pointer",
                        minHeight: 34,
                      }}
                    >
                      ▲
                    </button>

                    <span
                      style={{
                        padding: "0 8px",
                        fontSize: 13.5,
                        fontWeight: 900,
                        fontVariantNumeric: "tabular-nums",
                        color: skor > 0 ? "#22c55e" : skor < 0 ? "#ef6b5f" : "var(--fg)",
                      }}
                    >
                      {skor > 0 ? `+${skor}` : skor}
                    </span>

                    <button
                      type="button"
                      onClick={() => oyVer(d.id, -1)}
                      title={kullaniciId ? "Zayıf / Eski Düzen (-1)" : "Oy vermek için giriş yap"}
                      style={{
                        padding: "6px 10px",
                        border: 0,
                        background: benimOyum === -1 ? "rgba(239, 68, 68, 0.2)" : "transparent",
                        color: benimOyum === -1 ? "#ef6b5f" : "var(--fg)",
                        fontWeight: 900,
                        fontSize: 14,
                        cursor: "pointer",
                        minHeight: 34,
                      }}
                    >
                      ▼
                    </button>
                  </div>

                  {/* Sağ Butonlar */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {adminMi && (
                      <button
                        type="button"
                        onClick={() => duzenSil(d.id)}
                        title="Düzeni Sil"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 9,
                          border: "1px solid #ef6b5f",
                          background: "transparent",
                          color: "#ef6b5f",
                          fontSize: 12.5,
                          fontWeight: 700,
                          cursor: "pointer",
                          minHeight: 34,
                        }}
                      >
                        🗑️
                      </button>
                    )}

                    <Link
                      href={forumTalepUrl}
                      title="Bu düzen için Forumda güncelleme talebi oluştur"
                      style={{
                        padding: "6px 11px",
                        borderRadius: 9,
                        border: "1px solid var(--cizgi)",
                        background: "var(--bg)",
                        color: "var(--fg)",
                        textDecoration: "none",
                        fontSize: 12.5,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 34,
                      }}
                    >
                      📢 Talep Oluştur
                    </Link>

                    <a
                      href={d.oyun_linki}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => kopyalamaArtir(d)}
                      style={{
                        padding: "6px 13px",
                        borderRadius: 9,
                        background: "var(--vurgu)",
                        color: "#111",
                        textDecoration: "none",
                        fontSize: 12.5,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 34,
                      }}
                    >
                      🎮 Oyuna Kopyala ↗
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAM EKRAN GÖRSEL BÜYÜTME MODALI */}
      {buyukDuzen && (
        <div
          onClick={() => setBuyukDuzen(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 1000,
              width: "100%",
              background: "var(--kart)",
              border: "1px solid var(--vurgu)",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--cizgi)",
                gap: 12,
              }}
            >
              <div>
                <span style={{ color: "var(--vurgu)", fontWeight: 900, marginRight: 8 }}>{buyukDuzen.kod}</span>
                <strong>{buyukDuzen.baslik}</strong>
              </div>
              <button
                type="button"
                onClick={() => setBuyukDuzen(null)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontWeight: 800,
                  cursor: "pointer",
                  minHeight: 34,
                }}
              >
                ✕ Kapat
              </button>
            </div>
            <img
              src={gorselYoluCoz(buyukDuzen.gorsel)}
              alt={buyukDuzen.baslik}
              style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", display: "block", background: "#000" }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
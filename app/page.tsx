"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "./supabase";
import { gercekAzami } from "./thSinirlari";
import { gorselYolu } from "./gorseller";
import OyunSayaclari from "./OyunSayaclari";
import ProfilKartiModali from "./ProfilKartiModeli";
import { tr, ligTr } from "./isimler";
import KoyYasiKarti from "./KoyYasiKarti";
import GelisimGecmisi from "./GelisimGecmisi";
import EkipmanDanismani from "./EkipmanDanismani";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Parca = {
  isim: string;
  seviye: number;
  azami: number;
  aktif?: boolean;
  aktifEkipmanlar?: { isim: string; seviye: number; azami: number }[];
};

type Oyuncu = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  klanKod?: string | null;
  klanRozet?: string | null;
  lig?: string | null;
  ligIkon?: string | null;
  kahramanlar: Parca[];
  birlikler: Parca[];
  buyuler: Parca[];
  ekipmanlar: Parca[];
};

type SekmeTipi = "kahramanlar" | "laboratuvar" | "ekipmanlar" | "petler"
// KIŞLA AÇILMA ÖNCELİĞİNE GÖRE KESİN SIRALAMA LİSTELERİ
const IKSIR_BIRLIK_SIRASI = [
  "Barbarian",
  "Archer",
  "Giant",
  "Goblin",
  "Wall Breaker",
  "Balloon",
  "Wizard",
  "Healer",
  "Dragon",
  "P.E.K.K.A",
  "Baby Dragon",
  "Miner",
  "Electro Dragon",
  "Yeti",
  "Dragon Rider",
  "Electro Titan",
  "Root Rider",
  "Thrower",
  "Meteor Golem",
];

const KARA_IKSIR_BIRLIK_SIRASI = [
  "Minion",
  "Hog Rider",
  "Valkyrie",
  "Golem",
  "Witch",
  "Lava Hound",
  "Bowler",
  "Ice Golem",
  "Headhunter",
  "Apprentice Warden",
  "Druid",
  "Furnace",
  "Ruin Witch",
  "Doom Witch",
];

const KUSATMA_SIRASI = [
  "Wall Wrecker",
  "Battle Blimp",
  "Stone Slammer",
  "Siege Barracks",
  "Log Launcher",
  "Flame Flinger",
  "Battle Drill",
  "Troop Launcher",
  "Flying Barracks",
  "Sky Wagon",
];

const IKSIR_BUYU_SIRASI = [
  "Lightning Spell",
  "Healing Spell",
  "Rage Spell",
  "Jump Spell",
  "Freeze Spell",
  "Clone Spell",
  "Invisibility Spell",
  "Recall Spell",
  "Revive Spell",
];

const KARA_IKSIR_BUYU_SIRASI = [
  "Poison Spell",
  "Earthquake Spell",
  "Haste Spell",
  "Skeleton Spell",
  "Bat Spell",
  "Overgrowth Spell",
  "Ice Block Spell",
];

const PET_SIRASI = [
  "L.A.S.S.I",
  "Mighty Yak",
  "Electro Owl",
  "Unicorn",
  "Phoenix",
  "Poison Lizard",
  "Diggy",
  "Frosty",
  "Spirit Fox",
  "Angry Jelly",
  "Sneezy",
  "Greedy Raven",
];

const SUPER_SIRASI = [
  "Super Barbarian",
  "Super Archer",
  "Super Giant",
  "Sneaky Goblin",
  "Super Wall Breaker",
  "Rocket Balloon",
  "Super Wizard",
  "Super Dragon",
  "Inferno Dragon",
  "Super Minion",
  "Super Valkyrie",
  "Super Witch",
  "Ice Hound",
  "Super Bowler",
  "Super Miner",
  "Super Hog Rider",
  "Super Yeti",
];

const TAKIM_KISLASLARI = [
  { sv: 1, bb: 8, ad: "Barch Takımı", ozet: "Barbar + Okçu · Sv. 2+ Alan Hasarı Direnci" },
  { sv: 2, bb: 9, ad: "Dev Büyücü Takımı", ozet: "Dev + Büyücü · Sv. 2+ Alan Hasarı Direnci" },
  { sv: 3, bb: 10, ad: "Duvar Yıkıcı Takımı", ozet: "Duvar Yıkıcı · Sv. 2+ Gizli Başlangıç" },
  { sv: 4, bb: 11, ad: "Minyon Takımı", ozet: "Minyon · Sv. 2+ Alan Hasarı Direnci" },
  { sv: 5, bb: 12, ad: "Balon Takımı", ozet: "Balon · Sv. 2+ Tuzak Sezisi" },
  { sv: 6, bb: 13, ad: "Golem Cadı Takımı", ozet: "Golem + Cadı · Sv. 2+ Alan Hasarı Direnci" },
  { sv: 7, bb: 14, ad: "Domuz Binicisi Takımı", ozet: "Domuz Binicisi · Sv. 2+ Tuzak Sezisi" },
  { sv: 8, bb: 15, ad: "Madenci Takımı", ozet: "Madenci · Sv. 2+ Tuzak Sezisi" },
  { sv: 9, bb: 16, ad: "Şifacı Takımı", ozet: "Şifacı · Sv. 2+ Kalkanlı Başlangıç" },
  { sv: 10, bb: 17, ad: "P.E.K.K.A Titan Takımı", ozet: "P.E.K.K.A + Elektro Titan · Odaklanmış Saldırı" },
  { sv: 11, bb: 18, ad: "Ejderhalar Takımı", ozet: "Ejderha + Ejderha Binicisi · Sv. 2+ Kalkanlı Başlangıç" },
  { sv: 12, bb: 19, ad: "Bebek Ejderha Takımı", ozet: "Bebek Ejderha · Öfke Koruması" },
];

const superMi = (p: Parca) => p.isim.startsWith("Super ") || SUPER_SIRASI.includes(p.isim);

function siralaListe(liste: Parca[], referansSira: string[]): Parca[] {
  return [...liste].sort((a, b) => {
    const ia = referansSira.indexOf(a.isim);
    const ib = referansSira.indexOf(b.isim);
    const sa = ia === -1 ? 999 : ia;
    const sb = ib === -1 ? 999 : ib;
    return sa - sb;
  });
}

const VITRIN_KARTLARI = [
  {
    href: "/hesaplayici",
    ikon: "🧱",
    baslik: "Gelişim & Maliyet Hesaplayıcıları",
    aciklama:
      "Duvar basım maliyetlerini, Altın Bilet (%10-%20) indirim avantajını, kahraman ekipmanları için gereken Cevher (Ore) miktarını ve inşaat sürelerini tek ekranda hesapla.",
  },
  {
    href: "/ansiklopedi",
    ikon: "📖",
    baslik: "Kapsamlı Oyun Ansiklopedisi",
    aciklama:
      "Ejder Dükü dahil 6 Kahramanın yeteneklerini, Kuşatma Makinelerini, iksir & kara iksir birliklerini, büyüleri ve savunma yapılarının taktik zayıflıklarını incele.",
  },
  {
    href: "/klanlar",
    ikon: "🛡️",
    baslik: "Canlı Klan & Savaş Analizi",
    aciklama:
      "Klan etiketini girerek güncel Klan Savaşı ve CWL skorlarını, kazanma serisini, Belediye Binası dağılımını ve üyelerin bağış/kupa performansını anında takip et.",
  },
  {
    href: "/ordular",
    ikon: "⚔️",
    baslik: "Meta Ordular & Saldırı Taktikleri",
    aciklama:
      "Belediye Binası seviyene özel en güçlü 3 yıldız ordu kombinasyonlarını, kahraman ekipman eşleşmelerini, büyü dağılımlarını ve tek tıkla oyuna aktarma bağlantılarını keşfet.",
  },
];

function yuzde(liste: Parca[]) {
  const s = liste.reduce((t, p) => t + p.seviye, 0);
  const m = liste.reduce((t, p) => t + p.azami, 0);
  return m ? Math.round((s / m) * 100) : 0;
}

function isimBoyutu(isim: string) {
  const n = isim.length;
  if (n <= 7) return 58;
  if (n <= 10) return 48;
  if (n <= 14) return 38;
  return 30;
}

function ProfilBbGorsel({ seviye }: { seviye: number }) {
  const [hata, setHata] = useState(false);

  const kutu = {
    width: "clamp(120px, 14vw, 248px)",
    aspectRatio: "1 / 1",
    borderRadius: 22,
    background: "var(--bg)",
    border: "1px solid var(--cizgi)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    flexShrink: 0,
  } as const;

  if (hata) {
    return (
      <div style={{ ...kutu, flexDirection: "column" }}>
        <span style={{ fontSize: 64 }}>🏰</span>
        <span style={{ fontSize: 16, fontWeight: 900, color: "var(--vurgu)" }}>BB {seviye}</span>
      </div>
    );
  }

  return (
    <div title={`Belediye Binası ${seviye}`} style={kutu}>
      <img
        src={`/birimler/th${seviye}.png`}
        alt={`Belediye Binası ${seviye}`}
        onError={() => setHata(true)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    </div>
  );
}

function BirimIkon({ isim, boyut = 44, yedekIkon = "⚔️" }: { isim: string; boyut?: number; yedekIkon?: string }) {
  const [hata, setHata] = useState(false);

  if (hata) {
    return (
      <div
        style={{
          width: boyut,
          height: boyut,
          borderRadius: 10,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.round(boyut * 0.48),
          flexShrink: 0,
        }}
      >
        {yedekIkon}
      </div>
    );
  }

  return (
    <img
      src={gorselYolu(isim)}
      alt={tr(isim)}
      width={boyut}
      height={boyut}
      style={{
        borderRadius: 10,
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid var(--cizgi)",
        background: "var(--kart)",
      }}
      onError={() => setHata(true)}
    />
  );
}

function KahramanKarti({ p }: { p: Parca }) {
  const tamamlandi = p.seviye >= p.azami;
  const oran = Math.min(100, Math.round((p.seviye / p.azami) * 100));

  return (
    <div
      style={{
        padding: 18,
        background: "var(--bg)",
        border: `2px solid ${tamamlandi ? "var(--vurgu)" : "var(--cizgi)"}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <BirimIkon isim={p.isim} boyut={72} yedekIkon="👑" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{tr(p.isim)}</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
            <span style={{ color: tamamlandi ? "#22c55e" : "var(--vurgu)" }}>
              Seviye {p.seviye} / {p.azami}
            </span>
            <span style={{ opacity: 0.7 }}>%{oran}</span>
          </div>
          <div style={{ height: 8, background: "var(--cizgi)", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
            <div
              style={{
                height: "100%",
                width: oran + "%",
                background: tamamlandi ? "#22c55e" : "var(--vurgu)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--cizgi)",
          paddingTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>🛡️ Aktif Ekipmanlar</span>
        {p.aktifEkipmanlar && p.aktifEkipmanlar.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {p.aktifEkipmanlar.map((ek) => (
              <div
                key={ek.isim}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 10,
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                }}
              >
                <BirimIkon isim={ek.isim} boyut={28} yedekIkon="🛡️" />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {tr(ek.isim).split(" (")[0]}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>
                    Sv. {ek.seviye}/{ek.azami}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, opacity: 0.6 }}>Aktif ekipman verisi yok</span>
        )}
      </div>
    </div>
  );
}

function SuperBirlikKarti({ p }: { p: Parca }) {
  const aktif = Boolean(p.aktif);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        background: aktif ? "rgba(245, 197, 66, 0.14)" : "var(--bg)",
        border: aktif ? "2px solid #f59e0b" : "1px solid var(--cizgi)",
        boxShadow: aktif ? "0 0 14px rgba(245, 158, 11, 0.35)" : "none",
        borderRadius: 14,
        opacity: aktif ? 1 : 0.6,
      }}
    >
      <BirimIkon isim={p.isim} boyut={46} yedekIkon="✨" />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{tr(p.isim)}</div>
        {aktif ? (
          <span style={{ display: "inline-block", marginTop: 3, fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>
            ★ Şu An Aktif
          </span>
        ) : (
          <span style={{ display: "inline-block", marginTop: 3, fontSize: 12, opacity: 0.65 }}>
            Pasif
          </span>
        )}
      </div>
    </div>
  );
}

function BirimKarti({ p, yedekIkon = "⚔️" }: { p: Parca; yedekIkon?: string }) {
  const tamamlandi = p.seviye >= p.azami;
  const oran = Math.min(100, Math.round((p.seviye / p.azami) * 100));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        background: "var(--bg)",
        border: `1px solid ${tamamlandi ? "var(--vurgu)" : "var(--cizgi)"}`,
        borderRadius: 14,
      }}
    >
      <BirimIkon isim={p.isim} boyut={46} yedekIkon={yedekIkon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 700, gap: 8 }}>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {tr(p.isim)}
          </span>
          <span style={{ opacity: 0.9, flexShrink: 0, color: tamamlandi ? "#22c55e" : "inherit" }}>
            {p.seviye}/{p.azami}
          </span>
        </div>
        <div style={{ height: 6, background: "var(--cizgi)", borderRadius: 6, overflow: "hidden", marginTop: 8 }}>
          <div
            style={{
              height: "100%",
              width: oran + "%",
              background: tamamlandi ? "#22c55e" : "var(--vurgu)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function GenisKategoriBolumu({
  baslik,
  aciklama,
  liste,
  superMod = false,
  yedekIkon = "⚔️",
}: {
  baslik: string;
  aciklama?: string;
  liste: Parca[];
  superMod?: boolean;
  yedekIkon?: string;
}) {
  if (liste.length === 0) return null;
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: "var(--kart)",
        border: "1px solid var(--cizgi)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            {baslik} ({liste.length})
          </h4>
          {aciklama && (
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.72 }}>{aciklama}</p>
          )}
        </div>
        {!superMod && (
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 10,
              background: "var(--bg)",
              border: "1px solid var(--cizgi)",
              fontSize: 14,
              fontWeight: 800,
              color: "var(--vurgu)",
            }}
          >
            İlerleme: %{yuzde(liste)}
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {liste.map((p) =>
          superMod ? (
            <SuperBirlikKarti key={p.isim} p={p} />
          ) : (
            <BirimKarti key={p.isim} p={p} yedekIkon={yedekIkon} />
          )
        )}
      </div>
    </div>
  );
}

const KUTU_Y = 44;
const IKON = 144;

const BLOK = {
  width: 184,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
} as const;

const etiketStil = (vurgulu: boolean) =>
  ({
    width: "100%",
    height: KUTU_Y,
    padding: "0 10px",
    borderRadius: 14,
    background: "var(--bg)",
    border: "2px solid " + (vurgulu ? "var(--vurgu)" : "var(--cizgi)"),
    color: vurgulu ? "var(--vurgu)" : "var(--fg)",
    fontSize: 15,
    fontWeight: 800,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    overflow: "hidden",
    whiteSpace: "nowrap",
  }) as const;

function BlokIkon({ src, alt, yedek }: { src?: string | null; alt: string; yedek: string }) {
  return (
    <div style={{ height: IKON, width: IKON, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {src ? (
        <img src={src} alt={alt} style={{ height: IKON, width: IKON, objectFit: "contain", display: "block" }} />
      ) : (
        <span style={{ fontSize: 80 }}>{yedek}</span>
      )}
    </div>
  );
}

export default function Home() {
  const [kod, setKod] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [oyuncu, setOyuncu] = useState<Oyuncu | null>(null);
  const [favoriEklendi, setFavoriEklendi] = useState(false);
  const [favoriMesaj, setFavoriMesaj] = useState("");
  const [aktifSekme, setAktifSekme] = useState<SekmeTipi>("kahramanlar");
  const [profilKartiAcik, setProfilKartiAcik] = useState(false);
  const [koyYasiAcik, setKoyYasiAcik] = useState(false);

  async function favoriyeEkle(o: Oyuncu) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      if (favoriEklendi) {
        const { error } = await supabase
          .from("favoriler")
          .delete()
          .eq("kod", o.kod);
        if (error) {
          setFavoriMesaj("Favoriden çıkarılamadı.");
        } else {
          setFavoriEklendi(false);
          setFavoriMesaj("Favorilerden çıkarıldı.");
        }
        return;
      }

      const { error } = await supabase
        .from("favoriler")
        .insert({ kod: o.kod, isim: o.isim.slice(0, 40) });
      if (error) {
        setFavoriEklendi(true);
        setFavoriMesaj(error.code === "23505" ? "Zaten favorilerinde kayıtlı." : "Kaydedilemedi.");
      } else {
        setFavoriEklendi(true);
        setFavoriMesaj("Hesabındaki favorilere eklendi!");
      }
      return;
    }

    try {
      const eski = JSON.parse(localStorage.getItem("favoriler") || "[]");
      const liste: { kod: string; isim: string }[] = Array.isArray(eski) ? eski : [];
      if (liste.some((f) => f.kod === o.kod)) {
        const yeniListe = liste.filter((f) => f.kod !== o.kod);
        localStorage.setItem("favoriler", JSON.stringify(yeniListe));
        setFavoriEklendi(false);
        setFavoriMesaj("Favorilerden çıkarıldı.");
        return;
      }
      liste.push({ kod: o.kod, isim: o.isim });
      localStorage.setItem("favoriler", JSON.stringify(liste));
      setFavoriEklendi(true);
      setFavoriMesaj("Favorilere eklendi! Tüm cihazlarda saklamak için giriş yapabilirsin.");
    } catch {
      setFavoriMesaj("Kaydedilemedi.");
    }
  }

  async function veriyiIsle(veri: Oyuncu) {
    setOyuncu({
      ...veri,
      kahramanlar: veri.kahramanlar.map((k: Parca) => ({
        ...k,
        azami: gercekAzami(veri.thSeviyesi, k.isim, k.azami),
      })),
      birlikler: veri.birlikler.map((b: Parca) => ({
        ...b,
        azami: gercekAzami(veri.thSeviyesi, b.isim, b.azami),
      })),
      buyuler: veri.buyuler.map((s: Parca) => ({
        ...s,
        azami: gercekAzami(veri.thSeviyesi, s.isim, s.azami),
      })),
    });
    setAktifSekme("kahramanlar");

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { data: satir } = await supabase
        .from("favoriler")
        .select("kod")
        .eq("kod", veri.kod)
        .maybeSingle();
      if (satir) {
        setFavoriEklendi(true);
        setFavoriMesaj("Bu köy favorilerinde kayıtlı.");
      }
    } else {
      try {
        const eski = JSON.parse(localStorage.getItem("favoriler") || "[]");
        if (Array.isArray(eski) && eski.some((f: { kod: string }) => f.kod === veri.kod)) {
          setFavoriEklendi(true);
          setFavoriMesaj("Bu köy favorilerinde kayıtlı.");
        }
      } catch {}
    }
  }

  async function ara(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    setOyuncu(null);
    setFavoriEklendi(false);
    setFavoriMesaj("");
    if (!KOD_KURALI.test(temiz)) {
      setHata("Geçersiz köy kodu. Örnek: #2PP0Y8L");
      return;
    }
    setHata("");
    setYukleniyor(true);
    try {
      const yanit = await fetch("/api/oyuncu?kod=" + temiz);
      const veri = await yanit.json();
      if (!yanit.ok) {
        setHata(veri.hata ?? "Bir sorun oluştu");
      } else {
        await veriyiIsle(veri);
      }
    } catch {
      setHata("Bağlantı hatası, tekrar dene.");
    }
    setYukleniyor(false);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKod = params.get("kod");
    if (urlKod) {
      const temiz = urlKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
      setKod("#" + temiz);
      if (KOD_KURALI.test(temiz)) {
        setHata("");
        setYukleniyor(true);
        fetch("/api/oyuncu?kod=" + temiz)
          .then(async (yanit) => {
            const veri = await yanit.json();
            if (!yanit.ok) {
              setHata(veri.hata ?? "Bir sorun oluştu");
            } else {
              await veriyiIsle(veri);
            }
          })
          .catch(() => setHata("Bağlantı hatası, tekrar dene."))
          .finally(() => setYukleniyor(false));
      }
    }
  }, []);

  // Kışla açılma önceliğine ve türüne göre kesin ayrım
  const iksirBirlikleri = oyuncu
    ? siralaListe(
        oyuncu.birlikler.filter((p) => IKSIR_BIRLIK_SIRASI.includes(p.isim)),
        IKSIR_BIRLIK_SIRASI
      )
    : [];

  const karaIksirBirlikleri = oyuncu
    ? siralaListe(
        oyuncu.birlikler.filter((p) => KARA_IKSIR_BIRLIK_SIRASI.includes(p.isim)),
        KARA_IKSIR_BIRLIK_SIRASI
      )
    : [];

  const kusatmalar = oyuncu
    ? siralaListe(
        oyuncu.birlikler.filter((p) => KUSATMA_SIRASI.includes(p.isim)),
        KUSATMA_SIRASI
      )
    : [];

  const petler = oyuncu
    ? siralaListe(
        oyuncu.birlikler.filter((p) => PET_SIRASI.includes(p.isim)),
        PET_SIRASI
      )
    : [];

  const supers = oyuncu
    ? siralaListe(
        oyuncu.birlikler.filter(superMi),
        SUPER_SIRASI
      )
    : [];

  const takimKislasiSeviyesi =
    oyuncu && oyuncu.thSeviyesi >= 8 ? Math.min(12, oyuncu.thSeviyesi - 7) : 0;

  const iksirBuyuleri = oyuncu
    ? siralaListe(
        oyuncu.buyuler.filter((s) => !KARA_IKSIR_BUYU_SIRASI.includes(s.isim)),
        IKSIR_BUYU_SIRASI
      )
    : [];

  const karaIksirBuyuleri = oyuncu
    ? siralaListe(
        oyuncu.buyuler.filter((s) => KARA_IKSIR_BUYU_SIRASI.includes(s.isim)),
        KARA_IKSIR_BUYU_SIRASI
      )
    : [];

  const laboratuvarHepsi = [
    ...iksirBirlikleri,
    ...karaIksirBirlikleri,
    ...iksirBuyuleri,
    ...karaIksirBuyuleri,
    ...kusatmalar,
  ];

  const hepsi = oyuncu
    ? [...oyuncu.kahramanlar, ...oyuncu.ekipmanlar, ...laboratuvarHepsi, ...petler]
    : [];

  const enCokEksikler = hepsi
    .filter((p) => p.seviye < p.azami)
    .sort((a, b) => b.azami - b.seviye - (a.azami - a.seviye))
    .slice(0, 5);

  const sekmeler: { id: SekmeTipi; etiket: string }[] = [
    { id: "kahramanlar", etiket: `👑 Kahramanlar (${oyuncu?.kahramanlar.length ?? 0})` },
    { id: "laboratuvar", etiket: `🧪 Laboratuvar & Ordu Merkezi (${laboratuvarHepsi.length})` },
    { id: "ekipmanlar", etiket: `🛡️ Ekipmanlar (${oyuncu?.ekipmanlar.length ?? 0})` },
    { id: "petler", etiket: `🐾 Hayvanlar (${petler.length})` },
  ];

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      {/* ÜST ARAMA BÖLÜMÜ */}
      <section
        style={{
          padding: "24px 28px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px" }}>Köyünü Analiz Et</h1>
        <p style={{ opacity: 0.75, margin: "0 0 18px", fontSize: 15 }}>
          Köy kodunu gir; kahramanlarını, aktif ekipmanlarını, kışla açılma sırasına göre birlik & büyü seviyelerini incele.
        </p>

        <form onSubmit={ara} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="Köy kodu girin, örn: #2PP0Y8L"
            maxLength={14}
            aria-label="Köy kodu"
            style={{
              flex: 1,
              minWidth: 220,
              padding: "13px 16px",
              borderRadius: 12,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 16,
            }}
          />
          <button
            disabled={yukleniyor}
            style={{
              padding: "13px 28px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "#111",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "Analiz Ediliyor..." : "🔍 Köyü Analiz Et"}
          </button>
        </form>

        {hata && <p style={{ color: "#ef6b5f", marginTop: 14, fontWeight: 600 }}>{hata}</p>}
      </section>

      {/* CANLI OYUN ETKİNLİKLERİ & SEZON SAYAÇLARI (2 x 2) */}
      {!oyuncu && !yukleniyor && <OyunSayaclari />}

      {/* HENÜZ KÖY ARANMADIYSA: 2 x 2 GENİŞ HIZLI ERİŞİM KARTLARI */}
      {!oyuncu && !yukleniyor && (
        <section>
          <h2 className="baslik-serit">
            <span>🚀 Hızlı Erişim & Araçlar</span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: 20,
            }}
          >
            {VITRIN_KARTLARI.map((kart) => (
              <Link
                key={kart.href}
                href={kart.href}
                style={{
                  padding: "28px 30px",
                  background: "var(--kart)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 18,
                  textDecoration: "none",
                  color: "var(--fg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 38 }}>{kart.ikon}</span>
                  <strong style={{ fontSize: 20, color: "var(--vurgu)" }}>{kart.baslik} ↗</strong>
                </div>
                <p style={{ margin: 0, fontSize: 15, opacity: 0.84, lineHeight: 1.6 }}>{kart.aciklama}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* KÖY ANALİZ SONUÇLARI */}
      {oyuncu && (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* TEK BİRLEŞİK ÜST KART */}
          <section
            style={{
              padding: "20px 24px",
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "1 1 500px" }}>
                <ProfilBbGorsel seviye={oyuncu.thSeviyesi} />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "space-between",
                    gap: 14,
                    flex: "1 1 280px",
                    minWidth: 280,
                    minHeight: IKON + 2 * 8 + 2 * KUTU_Y,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, paddingTop: 4 }}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: isimBoyutu(oyuncu.isim),
                        fontWeight: 900,
                        lineHeight: 1.05,
                        overflowWrap: "anywhere",
                        maxWidth: "100%",
                      }}
                    >
                      {oyuncu.isim}
                    </h2>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.85 }}>{oyuncu.kod}</span>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 10,
                          background: "var(--vurgu)",
                          color: "#111",
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        Belediye {oyuncu.thSeviyesi}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setKoyYasiAcik(true)}
                      style={{
                        width: "100%",
                        height: KUTU_Y,
                        padding: "0 12px",
                        borderRadius: 14,
                        border: "2px solid var(--vurgu)",
                        background: "rgba(245, 197, 66, 0.16)",
                        color: "var(--vurgu)",
                        cursor: "pointer",
                        fontSize: 15,
                        fontWeight: 900,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontSize: 18 }}></span>
                      <span>⏳ Köy Yaşı</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setProfilKartiAcik(true)}
                      style={{
                        width: "100%",
                        height: KUTU_Y,
                        padding: "0 12px",
                        borderRadius: 14,
                        border: "2px solid var(--vurgu)",
                        background: "rgba(245, 197, 66, 0.16)",
                        color: "var(--vurgu)",
                        cursor: "pointer",
                        fontSize: 15,
                        fontWeight: 900,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🎴</span>
                      <span>Profil Kartını Aç</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => favoriyeEkle(oyuncu)}
                      title={favoriEklendi ? "Favorilerinden çıkar" : "Favorilere ekle"}
                      aria-label={favoriEklendi ? "Favorilerinden çıkar" : "Favorilere ekle"}
                      style={{
                        width: "100%",
                        height: KUTU_Y,
                        padding: 0,
                        borderRadius: 14,
                        border: "2px solid " + (favoriEklendi ? "var(--vurgu)" : "var(--cizgi)"),
                        background: favoriEklendi ? "rgba(245, 197, 66, 0.16)" : "var(--bg)",
                        color: favoriEklendi ? "var(--vurgu)" : "var(--fg)",
                        cursor: "pointer",
                        fontSize: 22,
                        lineHeight: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {favoriEklendi ? "★" : "☆"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, flex: "0 0 auto" }}>
                {oyuncu.klan && (
                  <div style={BLOK}>
                    <BlokIkon src={oyuncu.klanRozet} alt={oyuncu.klan} yedek="🛡️" />
                    {oyuncu.klanKod ? (
                      <Link
                        href={"/klanlar?kod=" + oyuncu.klanKod.replace(/^#/, "")}
                        title={oyuncu.klan}
                        style={etiketStil(true)}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{oyuncu.klan}</span>
                        <span>↗</span>
                      </Link>
                    ) : (
                      <div title={oyuncu.klan} style={etiketStil(true)}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{oyuncu.klan}</span>
                      </div>
                    )}
                    <div style={etiketStil(false)}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {oyuncu.klanKod || "Klan"}
                      </span>
                    </div>
                  </div>
                )}

                <div style={BLOK}>
                  <BlokIkon
                    src={oyuncu.ligIkon}
                    alt={oyuncu.lig ? ligTr(oyuncu.lig) : "Lig"}
                    yedek="🏆"
                  />
                  <div title={oyuncu.lig ? ligTr(oyuncu.lig) : "Ligsiz"} style={etiketStil(true)}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {oyuncu.lig ? ligTr(oyuncu.lig) : "Ligsiz"}
                    </span>
                  </div>
                  <div style={etiketStil(false)}>🏆 {oyuncu.kupa}</div>
                </div>
              </div>

              <div
                style={{
                  flex: "1 1 280px",
                  minWidth: 280,
                  minHeight: IKON + 2 * 8 + 2 * KUTU_Y,
                  alignSelf: "center",
                  padding: "14px 16px",
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div>
                  <strong style={{ fontSize: 14.5, display: "block" }}>
                    Genel Köy Tamamlanması (BB {oyuncu.thSeviyesi})
                  </strong>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <div style={{ flex: 1, height: 10, background: "var(--cizgi)", borderRadius: 10, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: yuzde(hepsi) + "%",
                          background: "var(--vurgu)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    <strong style={{ fontSize: 21, color: "var(--vurgu)" }}>%{yuzde(hepsi)}</strong>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, marginBottom: 6 }}>
                    {enCokEksikler.length > 0 ? "⚡ Öncelikli Yükseltmeler:" : "🎉 Bu Belediye Binası tamamen dolu!"}
                  </div>
                  {enCokEksikler.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {enCokEksikler.map((p) => (
                        <span
                          key={p.isim}
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 8,
                            background: "var(--kart)",
                            border: "1px solid var(--cizgi)",
                            fontWeight: 600,
                          }}
                        >
                          {tr(p.isim)} ({p.seviye}/{p.azami})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {favoriMesaj && (
              <p style={{ margin: 0, fontSize: 12, color: "var(--vurgu)", fontWeight: 600 }}>{favoriMesaj}</p>
            )}
          </section>

          {/* ALT KISIM: Sekmeli Kategori Alanı */}          
          <section
            style={{
              padding: 24,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 16,
            }}
          >
            {/* Sekme Butonları */}
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                borderBottom: "1px solid var(--cizgi)",
                paddingBottom: 16,
                marginBottom: 22,
              }}
            >
              {sekmeler.map((sekme) => {
                const secili = sekme.id === aktifSekme;
                return (
                  <button
                    key={sekme.id}
                    onClick={() => setAktifSekme(sekme.id)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: secili ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                      background: secili ? "var(--vurgu)" : "var(--bg)",
                      color: secili ? "#111" : "var(--fg)",
                      fontWeight: secili ? 800 : 600,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {sekme.etiket}
                  </button>
                );
              })}
            </div>

            {/* 1. SEKME: KAHRAMANLAR */}
            {aktifSekme === "kahramanlar" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
                    <span>Kahramanlar & Ekipmanlar</span>
                  </h2>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                    İlerleme: %{yuzde(oyuncu.kahramanlar)}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 16,
                  }}
                >
                  {oyuncu.kahramanlar.map((p) => (
                    <KahramanKarti key={p.isim} p={p} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. SEKME: LABORATUVAR & ORDU MERKEZİ */}
            {aktifSekme === "laboratuvar" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
                    <span>Laboratuvar & Ordu Merkezi</span>
                  </h2>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                    Genel Laboratuvar İlerlemesi: %{yuzde(laboratuvarHepsi)}
                  </span>
                </div>

                <GenisKategoriBolumu
                  baslik="💧 İksir Birlikleri"
                  aciklama="Kışlada açılma sırasına göre dizilmiştir"
                  liste={iksirBirlikleri}
                  yedekIkon="💧"
                />

                <GenisKategoriBolumu
                  baslik="🛢️ Kara İksir Birlikleri"
                  aciklama="Kara Kışlada açılma sırasına göre dizilmiştir"
                  liste={karaIksirBirlikleri}
                  yedekIkon="🛢️"
                />

                <div
                  style={{
                    padding: 20,
                    borderRadius: 16,
                    background: "var(--kart)",
                    border: "1px solid var(--cizgi)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                        🪖 Takım Kışlası (BB {oyuncu.thSeviyesi})
                      </h4>
                      <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75 }}>
                        {takimKislasiSeviyesi > 0
                          ? `Açık · Maks. Kışla Seviyesi ${takimKislasiSeviyesi}/12 (${takimKislasiSeviyesi} takım açık; 2+ takım kademeleri BB 19 / Lab Sv. 17 ister)`
                          : "Kapalı · Belediye Binası 8 seviyesinde açılır"}
                      </p>
                    </div>

                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 9,
                        fontSize: 12.5,
                        fontWeight: 800,
                        background: takimKislasiSeviyesi > 0 ? "rgba(34, 197, 94, 0.16)" : "var(--bg)",
                        border: "1px solid " + (takimKislasiSeviyesi > 0 ? "#22c55e" : "var(--cizgi)"),
                        color: takimKislasiSeviyesi > 0 ? "#22c55e" : "inherit",
                      }}
                    >
                      {takimKislasiSeviyesi > 0 ? `✓ Açık · Sv. ${takimKislasiSeviyesi}` : "🔒 Kapalı"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
                    {TAKIM_KISLASLARI.map((t) => {
                      const acik = oyuncu.thSeviyesi >= t.bb;
                      return (
                        <div
                          key={t.sv}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 10,
                            background: "var(--bg)",
                            border: "1px solid " + (acik ? "var(--cizgi)" : "transparent"),
                            opacity: acik ? 1 : 0.45,
                            fontSize: 12.5,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span>{acik ? "✓" : "🔒"} {t.ad}</span>
                            <span style={{ opacity: 0.7 }}>BB {t.bb}</span>
                          </div>
                          <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 2 }}>{t.ozet}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <GenisKategoriBolumu
                  baslik="✨ Süper Birlikler"
                  aciklama="Vurgulu çerçeveli kartlar oyuncunun şu an aktif olarak kullandığı Süper Birlikleri gösterir"
                  liste={supers}
                  superMod
                />

                <GenisKategoriBolumu
                  baslik="⚡ İksir Büyüleri"
                  aciklama="Büyü Fabrikasında açılma sırasına göre dizilmiştir"
                  liste={iksirBuyuleri}
                  yedekIkon="⚡"
                />

                <GenisKategoriBolumu
                  baslik="🌑 Kara İksir Büyüleri"
                  aciklama="Kara Büyü Fabrikasında açılma sırasına göre dizilmiştir"
                  liste={karaIksirBuyuleri}
                  yedekIkon="🌑"
                />

                <GenisKategoriBolumu
                  baslik="🚜 Kuşatma Makineleri"
                  aciklama="Atölyede açılma sırasına göre dizilmiştir"
                  liste={kusatmalar}
                  yedekIkon="🚜"
                />
              </div>
            )}

            {/* 3. SEKME: EKİPMANLAR */}
            {aktifSekme === "ekipmanlar" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🛡️ Kahraman Ekipmanları</h3>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                    İlerleme: %{yuzde(oyuncu.ekipmanlar)}
                  </span>
                </div>
                {oyuncu.ekipmanlar.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>Bu köyde henüz açık ekipman bulunmuyor.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {oyuncu.ekipmanlar.map((p) => (
                      <BirimKarti key={p.isim} p={p} yedekIkon="🛡️" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. SEKME: HAYVANLAR */}
            {aktifSekme === "petler" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🐾 Kahraman Hayvanları</h3>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                    İlerleme: %{yuzde(petler)}
                  </span>
                </div>
                {petler.length === 0 ? (
                  <p style={{ opacity: 0.7 }}>Bu köyde henüz açık kahraman hayvanı bulunmuyor.</p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {petler.map((p) => (
                      <BirimKarti key={p.isim} p={p} yedekIkon="🐾" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

<EkipmanDanismani ekipmanlar={oyuncu.ekipmanlar} />
          <GelisimGecmisi
            kod={oyuncu.kod}
            thSeviyesi={oyuncu.thSeviyesi}
            genelYuzde={yuzde(hepsi)}
            kupa={oyuncu.kupa}
            kahramanlar={oyuncu.kahramanlar}
            ekipmanlar={oyuncu.ekipmanlar}
            birlikler={[...iksirBirlikleri, ...karaIksirBirlikleri]}
            buyuler={[...iksirBuyuleri, ...karaIksirBuyuleri]}
            petler={petler}
          />
        </div>
 
      )}
      {oyuncu && profilKartiAcik && (
        <ProfilKartiModali
          veri={{
            kod: oyuncu.kod,
            isim: oyuncu.isim,
            thSeviyesi: oyuncu.thSeviyesi,
            kupa: oyuncu.kupa,
            klan: oyuncu.klan,
            lig: oyuncu.lig,
            genelOrtalama: yuzde(hepsi),
            kahramanOrt: yuzde(oyuncu.kahramanlar),
            ekipmanOrt: yuzde(oyuncu.ekipmanlar),
            birlikOrt: yuzde([...iksirBirlikleri, ...karaIksirBirlikleri]),
            buyuOrt: yuzde([...iksirBuyuleri, ...karaIksirBuyuleri]),
            hayvanOrt: yuzde(petler),
            takimKislasiSv: takimKislasiSeviyesi,
          }}
       onKapat={() => setProfilKartiAcik(false)}
        />
      )}

      {oyuncu && koyYasiAcik && (
        <KoyYasiKarti oyuncu={oyuncu} onKapat={() => setKoyYasiAcik(false)} />
      )}
    </main>
  );
}
"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { tr } from "./isimler";
import { supabase } from "./supabase";
import { gercekAzami } from "./thSinirlari";
import { gorselYolu } from "./gorseller";
import OyunSayaclari from "./OyunSayaclari";

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

type SekmeTipi = "kahramanlar" | "laboratuvar" | "ekipmanlar" | "petler";

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

function ProfilBbGorsel({ seviye }: { seviye: number }) {
  const [hata, setHata] = useState(false);

  if (hata) {
    return (
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 18,
          background: "var(--bg)",
          border: "1px solid var(--cizgi)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 32 }}>🏰</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--vurgu)" }}>BB {seviye}</span>
      </div>
    );
  }

  return (
    <div
      title={`Belediye Binası ${seviye}`}
      style={{
        width: 98,
        height: 98,
        borderRadius: 18,
        background: "var(--bg)",
        border: "1px solid var(--cizgi)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        flexShrink: 0,
      }}
    >
      <img
        src={`/birimler/th${seviye}.png`}
        alt={`Belediye Binası ${seviye}`}
        width={82}
        height={82}
        onError={() => setHata(true)}
        style={{ objectFit: "contain", display: "block" }}
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
  bosGoster = false,
  bosMesaj = "Bu kategori yakında eklenecek birlikler için ayrılmıştır.",
}: {
  baslik: string;
  aciklama?: string;
  liste: Parca[];
  superMod?: boolean;
  yedekIkon?: string;
  bosGoster?: boolean;
  bosMesaj?: string;
}) {
  if (liste.length === 0 && !bosGoster) return null;
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
            {baslik} {liste.length > 0 ? `(${liste.length})` : ""}
          </h4>
          {aciklama && (
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.72 }}>{aciklama}</p>
          )}
        </div>
        {!superMod && liste.length > 0 && (
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

      {liste.length === 0 ? (
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 12,
            background: "var(--bg)",
            border: "1px dashed var(--cizgi)",
            fontSize: 13,
            opacity: 0.75,
          }}
        >
          {bosMesaj}
        </div>
      ) : (
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

  async function favoriyeEkle(o: Oyuncu) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
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
        setFavoriEklendi(true);
        setFavoriMesaj("Zaten favorilerinde kayıtlı.");
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

  // Takım Kışlası / özel birlikler (şu an boş veya yeni gelen birlikler)
  // YENİ HALİ:
  const takimKislasiBirlikleri: Parca[] = [];

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
    ...takimKislasiBirlikleri,
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
      <OyunSayaclari />
      

      {/* HENÜZ KÖY ARANMADIYSA: 2 x 2 GENİŞ HIZLI ERİŞİM KARTLARI */}
      {!oyuncu && !yukleniyor && (
        <section>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px" }}>🚀 Hızlı Erişim & Araçlar</h2>
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
          {/* ÜST KISIM: Ferah Profil Kartı ve Genel İlerleme Özeti */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            <section
              style={{
                padding: "22px 24px",
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: 1 }}>
                  <ProfilBbGorsel seviye={oyuncu.thSeviyesi} />

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>{oyuncu.isim}</h2>
                      <span
                        style={{
                          padding: "4px 11px",
                          borderRadius: 9,
                          background: "var(--vurgu)",
                          color: "#111",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        Belediye {oyuncu.thSeviyesi}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        margin: "8px 0 0",
                        fontSize: 14,
                        opacity: 0.9,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{oyuncu.kod}</span>
                      <span>·</span>
                      {oyuncu.ligIkon && (
                        <img
                          src={oyuncu.ligIkon}
                          alt={oyuncu.lig ?? "Lig"}
                          width={28}
                          height={28}
                          style={{ objectFit: "contain", flexShrink: 0 }}
                        />
                      )}
                      <span>
                        🏆 <strong>{oyuncu.kupa}</strong> {oyuncu.lig ? `(${oyuncu.lig})` : ""}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        margin: "8px 0 0",
                        fontSize: 15,
                        fontWeight: 700,
                      }}
                    >
                      {oyuncu.klanRozet ? (
                        <img
                          src={oyuncu.klanRozet}
                          alt={oyuncu.klan ?? "Klan"}
                          width={28}
                          height={28}
                          style={{ objectFit: "contain", flexShrink: 0 }}
                        />
                      ) : (
                        <span style={{ fontSize: 19 }}>🛡️</span>
                      )}

                      {oyuncu.klan && oyuncu.klanKod ? (
                        <Link
                          href={"/klanlar?kod=" + oyuncu.klanKod.replace(/^#/, "")}
                          style={{ color: "var(--vurgu)", textDecoration: "none", fontWeight: 800 }}
                        >
                          {oyuncu.klan} ↗
                        </Link>
                      ) : oyuncu.klan ? (
                        <span>{oyuncu.klan}</span>
                      ) : (
                        <span style={{ opacity: 0.7 }}>Klanı yok</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => favoriyeEkle(oyuncu)}
                  title={favoriEklendi ? "Favorilerinde kayıtlı" : "Favorilere ekle"}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: favoriEklendi ? "1px solid var(--vurgu)" : "1px solid var(--cizgi)",
                    background: favoriEklendi ? "rgba(245, 197, 66, 0.15)" : "var(--bg)",
                    color: favoriEklendi ? "var(--vurgu)" : "var(--fg)",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span>{favoriEklendi ? "★" : "☆"}</span>
                  <span style={{ fontSize: 13 }}>{favoriEklendi ? "Favoride" : "Favori"}</span>
                </button>
              </div>

              {favoriMesaj && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--vurgu)", fontWeight: 600 }}>{favoriMesaj}</p>
              )}
            </section>

            <section
              style={{
                padding: "22px 24px",
                background: "var(--kart)",
                border: "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 16 }}>Genel Köy Tamamlanması (BB {oyuncu.thSeviyesi})</strong>
                  <strong style={{ fontSize: 22, color: "var(--vurgu)" }}>%{yuzde(hepsi)}</strong>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "var(--cizgi)",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: yuzde(hepsi) + "%",
                      background: "var(--vurgu)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginBottom: 8 }}>
                  {enCokEksikler.length > 0 ? "⚡ Öncelikli Yükseltmeler:" : "🎉 Bu Belediye Binası tamamen dolu!"}
                </div>
                {enCokEksikler.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {enCokEksikler.map((p) => (
                      <span
                        key={p.isim}
                        style={{
                          fontSize: 12,
                          padding: "4px 9px",
                          borderRadius: 8,
                          background: "var(--bg)",
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
            </section>
          </div>

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
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>👑 Kahramanlar & Aktif Ekipmanlar</h3>
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

            {/* 2. SEKME: LABORATUVAR & ORDU MERKEZİ (TAM GENİŞLİKTE ALT ALTA KATEGORİLER) */}
            {aktifSekme === "laboratuvar" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>🧪 Laboratuvar & Ordu Merkezi</h3>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--vurgu)" }}>
                    Genel Laboratuvar İlerlemesi: %{yuzde(laboratuvarHepsi)}
                  </span>
                </div>

                {/* Tam Genişlikte Alt Alta Kategoriler */}
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

                {/* Takım Kışlası — Birliklerin hemen altında, şimdilik boş yer tutucu olarak hazır */}
                <GenisKategoriBolumu
                  baslik="🪖 Takım Kışlası"
                  aciklama="Takım Kışlası birimleri bu bölümde yer alacaktır"
                  liste={takimKislasiBirlikleri}
                  yedekIkon="🪖"
                  bosGoster
                  bosMesaj="Takım Kışlası birimleri henüz listelenmedi — çok yakında burada görünecek."
                />

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
        </div>
      )}
    </main>
  );
}
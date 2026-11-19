"use client";
import { useEffect, useState, type FormEvent } from "react";
import { gorselYolu } from "../gorseller";

type KahramanKurulum = {
  kahraman: string;
  ingilizceKahraman: string;
  ekipmanlar: { ad: string; ingilizceAd: string }[];
  not?: string;
};

type Ordu = {
  id?: string;
  ad: string;
  thMin: number;
  thMax: number;
  tur: "Yer" | "Hava" | "Karma";
  zorluk: "Kolay" | "Orta" | "İleri";
  birlikler: string;
  buyuler: string;
  klanKalesiBirlik?: string;
  klanKalesiBuyu?: string;
  kusatma: string;
  kahramanlar?: KahramanKurulum[];
  ozet: string;
  adimlar?: string[];
  oyunLinki?: string;
  sargytOzel?: boolean;
  kullaniciOrdusu?: boolean;
};

type OrduParcasi = {
  adet: number | null;
  etiket: string;
  ingilizceAd: string;
  not?: string;
  kapasite: number;
};

const TR_INGILIZCE_ESLEME: Record<string, string> = {
  "mızrakçı": "Thrower",
  "barbar": "Barbarian",
  "okçu": "Archer",
  "dev": "Giant",
  "goblin": "Goblin",
  "duvar yıkıcı": "Wall Breaker",
  "balon": "Balloon",
  "büyücü": "Wizard",
  "şifacı": "Healer",
  "ejderha": "Dragon",
  "pekka": "P.E.K.K.A",
  "p.e.k.k.a": "P.E.K.K.A",
  "bebek ejderha": "Baby Dragon",
  "madenci": "Miner",
  "elektro ejderha": "Electro Dragon",
  "yeti": "Yeti",
  "ejderha binici": "Dragon Rider",
  "ejderha binicisi": "Dragon Rider",
  "elektro titan": "Electro Titan",
  "orman binici": "Root Rider",
  "orman binicisi": "Root Rider",
  "meteor golem": "Meteor Golem",
  "minyon": "Minion",
  "domuz binici": "Hog Rider",
  "domuz binicisi": "Hog Rider",
  "valkür": "Valkyrie",
  "valkyrie": "Valkyrie",
  "golem": "Golem",
  "cadı": "Witch",
  "lav tazısı": "Lava Hound",
  "atıcı": "Bowler",
  "buz golem": "Ice Golem",
  "kelle avcısı": "Headhunter",
  "çırak koruyucu": "Apprentice Warden",
  "druid": "Druid",
  "fırın": "Furnace",
  "yıkım cadısı": "Ruin Witch",
  

  // Süper Birlikler
  "süper barbar": "Super Barbarian",
  "süper okçu": "Super Archer",
  "süper dev": "Super Giant",
  "sinsi goblin": "Sneaky Goblin",
  "süper duvar yıkıcı": "Super Wall Breaker",
  "roket balon": "Rocket Balloon",
  "süper büyücü": "Super Wizard",
  "süper ejderha": "Super Dragon",
  "cehennem ejderhası": "Inferno Dragon",
  "süper minyon": "Super Minion",
  "süper valkür": "Super Valkyrie",
  "süper cadı": "Super Witch",
  "buz tazısı": "Ice Hound",
  "süper atıcı": "Super Bowler",
  "süper madenci": "Super Miner",
  "süper domuz binici": "Super Hog Rider",
  "süper yeti": "Super Yeti",

  // Büyüler
  "yıldırım": "Lightning Spell",
  "yıldırım büyüsü": "Lightning Spell",
  "iyileştirme": "Healing Spell",
  "iyileştirme büyüsü": "Healing Spell",
  "öfke": "Rage Spell",
  "öfke büyüsü": "Rage Spell",
  "atlama": "Jump Spell",
  "atlama büyüsü": "Jump Spell",
  "dondurma": "Freeze Spell",
  "buz": "Freeze Spell",
  "buz büyüsü": "Freeze Spell",
  "klon": "Clone Spell",
  "klon büyüsü": "Clone Spell",
  "görünmezlik": "Invisibility Spell",
  "görünmezlik büyüsü": "Invisibility Spell",
  "geri çağırma": "Recall Spell",
  "geri çağırma büyüsü": "Recall Spell",
  "canlandırma": "Revive Spell",
  "canlandırma büyüsü": "Revive Spell",
  "zehir": "Poison Spell",
  "zehir büyüsü": "Poison Spell",
  "deprem": "Earthquake Spell",
  "deprem büyüsü": "Earthquake Spell",
  "hızlandırma": "Haste Spell",
  "hızlandırma büyüsü": "Haste Spell",
  "iskelet": "Skeleton Spell",
  "iskelet büyüsü": "Skeleton Spell",
  "yarasa": "Bat Spell",
  "yarasa büyüsü": "Bat Spell",
  "sarmaşık": "Overgrowth Spell",
  "sarmaşık büyüsü": "Overgrowth Spell",
  "buz bloğu": "Ice Block Spell",
  "buz bloğu büyüsü": "Ice Block Spell",
  "totem": "Totem Spell",
  "totem büyüsü": "Totem Spell",

  // Kuşatma Makineleri
  "tokmak": "Wall Wrecker",
  "zeplin": "Battle Blimp",
  "kaya balonu": "Stone Slammer",
  "uçan kışla": "Siege Barracks",
  "tomruk fırlatıcı": "Log Launcher",
  "alev atıcı": "Flame Flinger",
  "savaş köstebeği": "Battle Drill",
  "birlik atıcı": "Troop Launcher",
  "uçan taşıyıcı": "Sky Wagon",
};

const KAPASITE_TABLOSU: Record<string, number> = {
  "Thrower": 16,
  "Barbarian": 1,
  "Archer": 1,
  "Giant": 5,
  "Goblin": 1,
  "Wall Breaker": 2,
  "Balloon": 5,
  "Wizard": 4,
  "Healer": 14,
  "Dragon": 20,
  "P.E.K.K.A": 25,
  "Baby Dragon": 10,
  "Miner": 6,
  "Electro Dragon": 30,
  "Yeti": 18,
  "Dragon Rider": 25,
  "Electro Titan": 32,
  "Root Rider": 20,
  "Meteor Golem": 40,
  "Minion": 2,
  "Hog Rider": 5,
  "Valkyrie": 8,
  "Golem": 30,
  "Witch": 12,
  "Lava Hound": 30,
  "Bowler": 6,
  "Ice Golem": 15,
  "Headhunter": 6,
  "Apprentice Warden": 20,
  "Druid": 16,
  "Furnace": 18,
  "Super Barbarian": 5,
  "Super Archer": 12,
  "Super Giant": 10,
  "Sneaky Goblin": 3,
  "Super Wall Breaker": 8,
  "Rocket Balloon": 8,
  "Super Wizard": 10,
  "Super Dragon": 40,
  "Inferno Dragon": 15,
  "Super Minion": 12,
  "Super Valkyrie": 20,
  "Super Witch": 40,
  "Ice Hound": 40,
  "Super Bowler": 30,
  "Super Miner": 24,
  "Super Hog Rider": 12,
  "Super Yeti": 35,
  // Büyüler
  "Lightning Spell": 1,
  "Healing Spell": 2,
  "Rage Spell": 2,
  "Jump Spell": 2,
  "Freeze Spell": 1,
  "Clone Spell": 3,
  "Invisibility Spell": 1,
  "Recall Spell": 2,
  "Revive Spell": 2,
  "Poison Spell": 1,
  "Earthquake Spell": 1,
  "Haste Spell": 1,
  "Skeleton Spell": 1,
  "Bat Spell": 1,
  "Overgrowth Spell": 2,
  "Ice Block Spell": 1,
  "Totem Spell": 1,
  "Ruin Witch": 18,
  "Doom Witch": 20,
  "Wall Wrecker": 0,
  "Battle Blimp": 0,
  "Stone Slammer": 0,
  "Siege Barracks": 0,
  "Log Launcher": 0,
  "Flame Flinger": 0,
  "Battle Drill": 0,
  "Troop Launcher": 0,
  "Flying Barracks": 0,
  "Sky Wagon": 0,
};

function metniParcala(metin?: string, varsayilanAdet: number | null = null): OrduParcasi[] {
  if (!metin || metin === "Belirtilmedi") return [];
  const genisletilmis = metin.replace(/\(([^)]+)\)/g, ", $1");

  return genisletilmis
    .split(/,| ve | veya /i)
    .map((parca) => parca.trim())
    .filter(Boolean)
    .map((parca) => {
      let not: string | undefined;
      let temiz = parca;

      if (temiz.includes(":")) {
        const [sol, sag] = temiz.split(":");
        not = sol.trim();
        temiz = sag.trim();
      }

      const eslesme = temiz.match(/^(\d+)\s*[x×]?\s*(.+)$/i);
      const adet = eslesme ? Number(eslesme[1]) : varsayilanAdet;
      const etiket = eslesme ? eslesme[2].trim() : temiz;
      const anahtar = etiket.toLocaleLowerCase("tr-TR");
      const ingilizceAd = TR_INGILIZCE_ESLEME[anahtar] ?? etiket;
      const birimKap = KAPASITE_TABLOSU[ingilizceAd] ?? 0;
      const kapasite = (adet ?? 0) * birimKap;

      return { adet, etiket, ingilizceAd, not, kapasite };
    });
}

function PortreGorsel({
  ingilizceAd,
  alt,
  boyut = 40,
  yedekIkon = "⚔️",
  sigdir = false,
}: {
  ingilizceAd: string;
  alt: string;
  boyut?: number;
  yedekIkon?: string;
  sigdir?: boolean;
}) {
  const [hata, setHata] = useState(false);

  if (hata) {
    return <span style={{ fontSize: Math.round(boyut * 0.48) }}>{yedekIkon}</span>;
  }

  return (
    <img
      src={gorselYolu(ingilizceAd)}
      alt={alt}
      width={boyut}
      height={boyut}
      onError={() => setHata(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: sigdir ? "contain" : "cover",
        display: "block",
      }}
    />
  );
}

function MiniOnizlemeIkon({ ingilizceAd, adet }: { ingilizceAd: string; adet: number | null }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: "var(--bg)",
        border: "1px solid var(--cizgi)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <PortreGorsel ingilizceAd={ingilizceAd} alt={ingilizceAd} boyut={34} />
      {adet !== null && (
        <span
          style={{
            position: "absolute",
            right: 1,
            bottom: 0,
            padding: "0 3px",
            borderRadius: 4,
            background: "rgba(10,10,12,0.88)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
            lineHeight: 1.2,
          }}
        >
          ×{adet}
        </span>
      )}
    </div>
  );
}

function OrduBirimKarti({
  parca,
  yedekIkon,
  vurguRengi = "var(--vurgu)",
}: {
  parca: OrduParcasi;
  yedekIkon: string;
  vurguRengi?: string;
}) {
  return (
    <div
      title={`${parca.adet ? parca.adet + "× " : ""}${parca.etiket}${parca.kapasite > 0 ? ` (${parca.kapasite} alan)` : ""}`}
      style={{
        background: "var(--kart)",
        border: "1px solid var(--cizgi)",
        borderRadius: 10,
        padding: "6px 9px",
        display: "flex",
        alignItems: "center",
        gap: 9,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "var(--bg)",
          border: "1px solid var(--cizgi)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PortreGorsel ingilizceAd={parca.ingilizceAd} alt={parca.etiket} boyut={40} yedekIkon={yedekIkon} />

        {parca.adet !== null && (
          <span
            style={{
              position: "absolute",
              right: 1,
              bottom: 1,
              padding: "0px 4px",
              borderRadius: 4,
              background: "rgba(10, 10, 12, 0.9)",
              border: `1px solid ${vurguRengi}`,
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 900,
              lineHeight: 1.2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ×{parca.adet}
          </span>
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            lineHeight: 1.2,
            color: "var(--fg)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {parca.etiket}
        </div>
        {parca.kapasite > 0 && (
          <div style={{ fontSize: 10.5, opacity: 0.62, marginTop: 1 }}>{parca.kapasite} alan</div>
        )}
      </div>
    </div>
  );
}

const ORDULAR: Ordu[] = [
  {
    ad: "Mızrakçı Ordusu (Sargyt İmza Taktik)",
    thMin: 16,
    thMax: 17,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "10 Mızrakçı, 5 Şifacı, 2 Buz Golem, 1 Yeti, 3 Süper Duvar Yıkıcı, 2 Bebek Ejderha, 2 Kelle Avcısı, 6 Okçu",
    buyuler: "2 Sarmaşık, 3 Dondurma, 2 İskelet, 1 Görünmezlik, 1 Zehir",
    klanKalesiBirlik: "2 Yeti, 1 Valkyrie, 11 Okçu",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Uçan Kışla",
    kahramanlar: [
      {
        kahraman: "Büyük Koruyucu",
        ingilizceKahraman: "Grand Warden",
        ekipmanlar: [
          { ad: "Öfke Taşı", ingilizceAd: "Rage Gem" },
          { ad: "Sonsuz Büyük Kitap", ingilizceAd: "Eternal Tome" },
        ],
        not: "Öfke Taşı aurası sayesinde orduya Öfke Büyüsü alınmaz; yerini Sarmaşık ve Dondurma alır.",
      },
      {
        kahraman: "Okçu Kraliçe",
        ingilizceKahraman: "Archer Queen",
        ekipmanlar: [
          { ad: "Sihirli Ayna", ingilizceAd: "Magic Mirror" },
          { ad: "Şifacı Kuklası", ingilizceAd: "Healer Puppet" },
        ],
        not: "Mızrakçılarla birlikte merkez yürüyüşüne eşlik eder.",
      },
      {
        kahraman: "Barbar Kral",
        ingilizceKahraman: "Barbarian King",
        ekipmanlar: [
          { ad: "Dikenli Top", ingilizceAd: "Spiky Ball" },
          { ad: "Deprem Çizmeleri", ingilizceAd: "Earthquake Boots" },
        ],
        not: "Uçan Kışla ile birlikte yan kanadı kapatır.",
      },
      {
        kahraman: "Kraliyet Şampiyonu",
        ingilizceKahraman: "Royal Champion",
        ekipmanlar: [
          { ad: "Elektro Çizmeler", ingilizceAd: "Electro Boots" },
          { ad: "Hız Şişesi", ingilizceAd: "Haste Vial" },
        ],
        not: "Arka savunmaları ve tekli kuleleri süpürür.",
      },
    ],
    ozet: "340 birimlik tam kapasite turnuva dizilimi: Büyük Koruyucu'nun Öfke Taşı aurasıyla desteklenen Mızrakçılar duvar arkasındaki Monolit ve Kayasaçarları güvenli mesafeden eritir.",
    adimlar: [
      "1. Aşama (Koridor Açma): Bir köşeye Barbar Kral + Uçan Kışla (içinde 2 Yeti, 1 Valkyrie, 11 Okçu), karşı köşeye Yeti + Bebek Ejderha bırakarak iki kanadı temizle.",
      "2. Aşama (Ana Yürüyüş): Orta hattan Buz Golemler, 10 Mızrakçı, Şifacılar, Okçu Kraliçe ve Öfke Taşı donanımlı Büyük Koruyucu'yu gönder; Süper Duvar Yıkıcılarla ilk katmanı aç.",
      "3. Aşama (Kontrol & Bitiriş): Yandaki ağır savunmaları Sarmaşık Büyüsü ile kilitle, Monolit veya Tekli Cehennem üzerinde Dondurma + İskelet kullan ve arka hattan Kraliyet Şampiyonu'nu sal.",
    ],
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u10x123-5x7-2x58-1x53-3x28-2x23-2x82-6x1s2x70-3x5-2x17-1x35-1x9",
    sargytOzel: true,
  },
  {
    ad: "Orman Binicisi & Valkyrie Ezme",
    thMin: 16,
    thMax: 17,
    tur: "Yer",
    zorluk: "Kolay",
    birlikler: "7 Orman Binicisi, 10 Valkyrie, 2 Buz Golem, 2 Çırak Koruyucu, 3 Süper Duvar Yıkıcı, 2 Kelle Avcısı, 1 Bebek Ejderha, 4 Okçu",
    buyuler: "2 Sarmaşık, 2 Öfke, 2 Dondurma, 1 Zehir",
    klanKalesiBirlik: "2 Yeti, 1 Valkyrie, 11 Okçu",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Uçan Kışla",
    kahramanlar: [
      {
        kahraman: "Büyük Koruyucu",
        ingilizceKahraman: "Grand Warden",
        ekipmanlar: [
          { ad: "Şifa Büyük Kitabı", ingilizceAd: "Healing Tome" },
          { ad: "Sonsuz Büyük Kitap", ingilizceAd: "Eternal Tome" },
        ],
        not: "Valkyrie sürüsünü alan hasarından korur.",
      },
      {
        kahraman: "Barbar Kral",
        ingilizceKahraman: "Barbarian King",
        ekipmanlar: [
          { ad: "Dikenli Top", ingilizceAd: "Spiky Ball" },
          { ad: "Deprem Çizmeleri", ingilizceAd: "Earthquake Boots" },
        ],
      },
      {
        kahraman: "Okçu Kraliçe",
        ingilizceKahraman: "Archer Queen",
        ekipmanlar: [
          { ad: "Sihirli Ayna", ingilizceAd: "Magic Mirror" },
          { ad: "Donmuş Ok", ingilizceAd: "Frozen Arrow" },
        ],
      },
      {
        kahraman: "Kraliyet Şampiyonu",
        ingilizceKahraman: "Royal Champion",
        ekipmanlar: [
          { ad: "Elektro Çizmeler", ingilizceAd: "Electro Boots" },
          { ad: "Uçan Kalkan", ingilizceAd: "Seeking Shield" },
        ],
      },
    ],
    ozet: "340 birimlik en istikrarlı 3 yıldız yer ordusu. Sarmaşık Büyüsü ile savunma hattı daraltılır, Orman Binicileri duvarları yararken Valkyrie'ler merkezi süpürür.",
    adimlar: [
      "1. Aşama: Uçan Kışla ve Bebek Ejderha ile bir kanadı kes, diğer kanadı Barbar Kral ile tut.",
      "2. Aşama: 7 Orman Binicisi, Buz Golemler, Valkyrie'ler ve kahramanları tek hat halinde merkeze sür.",
      "3. Aşama: İki kenardaki savunma adalarını Sarmaşık ile dondurup tüm ordunun tek koridorda kalmasını sağla.",
    ],
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u7x110-10x12-2x58-2x97-3x28-2x82-1x23-4x1s2x70-2x2-2x5-1x9",
    sargytOzel: true,
  },
  {
    ad: "Hydra Süper Okçu Zeplin",
    thMin: 16,
    thMax: 17,
    tur: "Hava",
    zorluk: "İleri",
    birlikler: "9 Ejderha, 4 Ejderha Binici, 10 Balon, 1 Bebek Ejderha",
    buyuler: "2 Klon, 1 Öfke, 3 Görünmezlik",
    klanKalesiBirlik: "3 Süper Okçu, 4 Duvar Yıkıcı, 11 Okçu",
    klanKalesiBuyu: "3 Görünmezlik",
    kusatma: "Zeplin",
    kahramanlar: [
      {
        kahraman: "Büyük Koruyucu",
        ingilizceKahraman: "Grand Warden",
        ekipmanlar: [
          { ad: "Sonsuz Büyük Kitap", ingilizceAd: "Eternal Tome" },
          { ad: "Öfke Taşı", ingilizceAd: "Rage Gem" },
        ],
        not: "Zeplin'i merkeze hasarsız ulaştırmak için erken yetenek kullanılır.",
      },
      {
        kahraman: "Barbar Kral",
        ingilizceKahraman: "Barbarian King",
        ekipmanlar: [
          { ad: "Dev Eldiven", ingilizceAd: "Giant Gauntlet" },
          { ad: "Öfke Şişesi", ingilizceAd: "Rage Vial" },
        ],
      },
      {
        kahraman: "Okçu Kraliçe",
        ingilizceKahraman: "Archer Queen",
        ekipmanlar: [
          { ad: "Dev Ok", ingilizceAd: "Giant Arrow" },
          { ad: "Şifacı Kuklası", ingilizceAd: "Healer Puppet" },
        ],
        not: "Dev Ok ile karşı köşedeki Hava Savunmalarını keser.",
      },
      {
        kahraman: "Kraliyet Şampiyonu",
        ingilizceKahraman: "Royal Champion",
        ekipmanlar: [
          { ad: "Elektro Çizmeler", ingilizceAd: "Electro Boots" },
          { ad: "Hız Şişesi", ingilizceAd: "Haste Vial" },
        ],
      },
    ],
    ozet: "340 birimlik Hydra hava filosu: Merkeze indirilen Zeplin içindeki 3 Süper Okçu Klon ve Görünmezlik ile köyün %40'ını yok eder.",
    adimlar: [
      "1. Aşama: Okçu Kraliçe'nin Dev Oku ile 1-2 Hava Savunmasını çizgi halinde indir.",
      "2. Aşama: Balonların arkasından Zeplin'i sal, Büyük Koruyucu yeteneğiyle merkeze indirip Görünmezlik + 2 Klon + Öfke kombosunu uygula.",
      "3. Aşama: 9 Ejderha ve 4 Ejderha Biniciyi tek cepheden salıp kalan kenar savunmaları topla.",
    ],
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u9x8-4x65-10x5-1x23s2x16-1x2-3x35",
  },
  {
    ad: "Ateş Topu Süper Cadı",
    thMin: 16,
    thMax: 17,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "4 Süper Cadı, 5 Şifacı, 2 Buz Golem, 3 Süper Duvar Yıkıcı, 2 Bebek Ejderha, 2 Kelle Avcısı, 6 Büyücü",
    buyuler: "2 Öfke, 3 Görünmezlik, 2 Deprem, 1 Dondurma, 1 Zehir",
    klanKalesiBirlik: "2 Yeti, 1 Buz Golem, 4 Okçu",
    klanKalesiBuyu: "1 Öfke, 1 Zehir",
    kusatma: "Alev Atıcı",
    kahramanlar: [
      {
        kahraman: "Büyük Koruyucu",
        ingilizceKahraman: "Grand Warden",
        ekipmanlar: [
          { ad: "Ateş Topu", ingilizceAd: "Fireball" },
          { ad: "Öfke Taşı", ingilizceAd: "Rage Gem" },
        ],
        not: "Görünmezlik ile yönlendirilip en yoğun savunma öbeğine Ateş Topu atılır.",
      },
      {
        kahraman: "Barbar Kral",
        ingilizceKahraman: "Barbarian King",
        ekipmanlar: [
          { ad: "Dikenli Top", ingilizceAd: "Spiky Ball" },
          { ad: "Deprem Çizmeleri", ingilizceAd: "Earthquake Boots" },
        ],
      },
      {
        kahraman: "Okçu Kraliçe",
        ingilizceKahraman: "Archer Queen",
        ekipmanlar: [
          { ad: "Sihirli Ayna", ingilizceAd: "Magic Mirror" },
          { ad: "Şifacı Kuklası", ingilizceAd: "Healer Puppet" },
        ],
      },
      {
        kahraman: "Kraliyet Şampiyonu",
        ingilizceKahraman: "Royal Champion",
        ekipmanlar: [
          { ad: "Uçan Kalkan", ingilizceAd: "Seeking Shield" },
          { ad: "Elektro Çizmeler", ingilizceAd: "Electro Boots" },
        ],
      },
    ],
    ozet: "340 birimlik Ateş Topu kombosu: Büyük Koruyucu'nun Ateş Topu ve 2 Deprem büyüsüyle köyün en tehlikeli bölgesi tek vuruşta silinir.",
    adimlar: [
      "1. Aşama: Koruyucu Yürüyüşü başlat, kenar binaları Görünmezlik ile saklayarak Ateş Topu'nu en yoğun savunma bloğuna isabet ettir ve 2 Deprem at.",
      "2. Aşama: Diğer köşeye Alev Atıcı kur, ortadan Süper Cadılar, Şifacılar ve kahramanları birleştir.",
      "3. Aşama: Koca İskeletleri Öfke altında merkeze sürerek kalan savunmaları ez.",
    ],
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u4x66-5x7-2x58-3x28-2x23-2x82-6x6s2x2-3x35-2x10-1x5-1x9",
  },
  {
    ad: "Kraliçe Yürüyüşü Hibrit",
    thMin: 13,
    thMax: 14,
    tur: "Yer",
    zorluk: "İleri",
    birlikler: "5 Şifacı, 14 Madenci, 14 Domuz Binici, 2 Bebek Ejderha, 3 Süper Duvar Yıkıcı, 4 Büyücü, 2 Kelle Avcısı, 4 Okçu",
    buyuler: "3 İyileştirme, 2 Öfke, 1 Zehir",
    klanKalesiBirlik: "9 Domuz Binici",
    klanKalesiBuyu: "2 Dondurma",
    kusatma: "Uçan Kışla",
    kahramanlar: [
      {
        kahraman: "Okçu Kraliçe",
        ingilizceKahraman: "Archer Queen",
        ekipmanlar: [
          { ad: "Donmuş Ok", ingilizceAd: "Frozen Arrow" },
          { ad: "Görünmezlik Şişesi", ingilizceAd: "Invisibility Vial" },
        ],
        not: "Belediye Binası veya Klan Kalesi hattını temizler.",
      },
      {
        kahraman: "Büyük Koruyucu",
        ingilizceKahraman: "Grand Warden",
        ekipmanlar: [
          { ad: "Sonsuz Büyük Kitap", ingilizceAd: "Eternal Tome" },
          { ad: "Hayat Taşı", ingilizceAd: "Life Gem" },
        ],
        not: "Hayat Taşı düşük canlı Madenci ve Domuz Binicilere ekstra can verir.",
      },
      {
        kahraman: "Barbar Kral",
        ingilizceKahraman: "Barbarian King",
        ekipmanlar: [
          { ad: "Dev Eldiven", ingilizceAd: "Giant Gauntlet" },
          { ad: "Deprem Çizmeleri", ingilizceAd: "Earthquake Boots" },
        ],
      },
      {
        kahraman: "Kraliyet Şampiyonu",
        ingilizceKahraman: "Royal Champion",
        ekipmanlar: [
          { ad: "Uçan Kalkan", ingilizceAd: "Seeking Shield" },
          { ad: "Kraliyet Taşı", ingilizceAd: "Royal Gem" },
        ],
      },
    ],
    ozet: "BB13–14'ün en klasik 300 birimlik turnuva ordusu: Okçu Kraliçe ve Barbar Kral L şeklinde dar bir koridor açar, Madenci + Domuz Biniciler aradan akar.",
    adimlar: [
      "1. Aşama: Okçu Kraliçe + 5 Şifacı ile Belediye Binası veya Klan Kalesi yönüne giriş yap, Zehir ve Öfke ile destekle.",
      "2. Aşama: Diğer kanada Barbar Kral + Uçan Kışla (içinde 9 Domuz Binici) bırakarak L koridorunu oluştur.",
      "3. Aşama: Ortadan Madenci, Domuz Binici, Büyük Koruyucu ve Kraliyet Şampiyonu'nu sal; 3 İyileştirme büyüsünü Kayasaçar ve Büyücü Kulesi bölgelerinde kullan.",
    ],
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u5x7-14x24-14x11-2x23-3x28-4x6-2x82-4x1s3x1-2x2-1x9",
  },
  {
    ad: "Yıldırım & Deprem Ejderhalar",
    thMin: 13,
    thMax: 15,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "13 Ejderha, 10 Balon, 1 Bebek Ejderha",
    buyuler: "6 Yıldırım, 2 Deprem, 1 Öfke, 1 Dondurma",
    klanKalesiBirlik: "10 Balon",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Kaya Balonu",
    kahramanlar: [
      {
        kahraman: "Okçu Kraliçe",
        ingilizceKahraman: "Archer Queen",
        ekipmanlar: [
          { ad: "Dev Ok", ingilizceAd: "Giant Arrow" },
          { ad: "Şifacı Kuklası", ingilizceAd: "Healer Puppet" },
        ],
        not: "Dev Ok ile tek atışta 2 Hava Savunmasını aradan çıkarır.",
      },
      {
        kahraman: "Büyük Koruyucu",
        ingilizceKahraman: "Grand Warden",
        ekipmanlar: [
          { ad: "Sonsuz Büyük Kitap", ingilizceAd: "Eternal Tome" },
          { ad: "Öfke Taşı", ingilizceAd: "Rage Gem" },
        ],
      },
      {
        kahraman: "Barbar Kral",
        ingilizceKahraman: "Barbarian King",
        ekipmanlar: [
          { ad: "Dikenli Top", ingilizceAd: "Spiky Ball" },
          { ad: "Dev Eldiven", ingilizceAd: "Giant Gauntlet" },
        ],
      },
      {
        kahraman: "Kraliyet Şampiyonu",
        ingilizceKahraman: "Royal Champion",
        ekipmanlar: [
          { ad: "Uçan Kalkan", ingilizceAd: "Seeking Shield" },
          { ad: "Hız Şişesi", ingilizceAd: "Haste Vial" },
        ],
      },
    ],
    ozet: "320 birimlik klasik hava saldırısı: Hava Savunmaları Yıldırım + Deprem ile indirilir, Ejderha ve Balonlar tek hat üzerinden salınır.",
    adimlar: [
      "1. Aşama: En uzak iki Hava Savunmasını 3'er Yıldırım + 1'er Deprem ile yık.",
      "2. Aşama: Bir köşeye Barbar Kral, diğer köşeye Okçu Kraliçe koyup Dev Ok'u kalan Hava Savunmalarına hizala.",
      "3. Aşama: Ejderhalar, Balonlar, Kaya Balonu (içinde 10 Balon) ve Büyük Koruyucu'yu tek hat üzerinden bırak.",
    ],
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u13x8-10x5-1x23s6x0-2x10-1x2-1x5",
  },

  {
    ad: "BB18–19 Orman Binicisi & Elektro Titan Hücumu",
    thMin: 18,
    thMax: 19,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "6 Orman Binicisi, 3 Elektro Titan, 5 Şifacı, 2 Buz Golem, 3 Süper Duvar Yıkıcı, 2 Kelle Avcısı, 2 Bebek Ejderha",
    buyuler: "2 Sarmaşık, 2 Öfke, 2 Dondurma, 1 Zehir",
    klanKalesiBirlik: "2 Yeti, 1 Valkyrie, 11 Okçu",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Uçan Kışla",
    ozet: "Üst Belediye Binası seviyelerinde duvarları Orman Binicileriyle kırarken Elektro Titan ve kahramanlarla merkeze sert giriş yapan sağlam yer ordusu.",
    adimlar: [
      "1. Aşama: Uçan Kışla ve Bebek Ejderha ile kanatları temizle.",
      "2. Aşama: Orman Binicileri, Elektro Titanlar ve kahramanları aynı hat üzerinden merkeze sür.",
      "3. Aşama: Ağır savunma bölgelerini Sarmaşık ve Dondurma ile kilitle.",
    ],
  },
  {
    ad: "BB18–19 Ejderha & Ejderha Binici Baskını",
    thMin: 18,
    thMax: 19,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "9 Ejderha, 5 Ejderha Binici, 8 Balon, 2 Bebek Ejderha",
    buyuler: "3 Öfke, 3 Dondurma, 1 Zehir",
    klanKalesiBirlik: "2 Ejderha Binici, 1 Balon",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Kaya Balonu",
    ozet: "Üst BB seviyelerinde hava savunmalarını ve merkez kuleleri hızlı eriten pratik ve güçlü hava ordusu.",
    adimlar: [
      "1. Aşama: Bebek Ejderha ve kahramanlarla dış binaları alıp yön ver.",
      "2. Aşama: Ejderha, Ejderha Binici, Balon ve Kaya Balonunu savunma hattına sal.",
      "3. Aşama: Kule ve kahramanlara karşı Öfke ve Dondurma zamanlamasını iyi ayarla.",
    ],
  },

  {
    ad: "BB18–19 Meteor Golem & Elektro Titan Ezme",
    thMin: 18,
    thMax: 19,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "4 Meteor Golem, 3 Elektro Titan, 5 Şifacı, 3 Süper Duvar Yıkıcı, 2 Kelle Avcısı, 2 Bebek Ejderha",
    buyuler: "2 Sarmaşık, 2 Öfke, 2 Dondurma, 1 Zehir",
    klanKalesiBirlik: "2 Yeti, 1 Valkyrie, 11 Okçu",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Uçan Kışla",
    ozet: "Yüksek Belediye Binası seviyelerinde Meteor Golem ve Elektro Titan ikilisiyle merkeze ağır baskı kuran sağlam yer ordusu.",
    adimlar: [
      "1. Aşama: Uçan Kışla ve Bebek Ejderha ile dış binaları temizleyip ana orduya yön ver.",
      "2. Aşama: Meteor Golem, Elektro Titan, Şifacı ve kahramanları aynı hat üzerinden merkeze sür.",
      "3. Aşama: Ağır savunma bölgelerini Sarmaşık ve Dondurma ile kilitleyip temizliği tamamla.",
    ],
  },
  {
    ad: "BB18–19 Ejderha & Ejderha Binici Baskını",
    thMin: 18,
    thMax: 19,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "9 Ejderha, 5 Ejderha Binici, 8 Balon, 2 Bebek Ejderha",
    buyuler: "3 Öfke, 3 Dondurma, 1 Zehir",
    klanKalesiBirlik: "2 Ejderha Binici, 1 Balon",
    klanKalesiBuyu: "1 Öfke, 1 Dondurma",
    kusatma: "Kaya Balonu",
    ozet: "Üst BB seviyelerinde hava savunmalarını ve merkez kuleleri hızlı eriten pratik ve güçlü hava ordusu.",
    adimlar: [
      "1. Aşama: Bebek Ejderha ve kahramanlarla dış binaları alıp yön ver.",
      "2. Aşama: Ejderha, Ejderha Binici, Balon ve Kaya Balonunu savunma hattına sal.",
      "3. Aşama: Kule ve kahramanlara karşı Öfke ve Dondurma zamanlamasını iyi ayarla.",
    ],
  },
];

const TH_FILTRELER = ["Tümü", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"];
const TUR_FILTRELER = ["Tümü", "Yer", "Hava", "Karma"];

export default function Ordular() {
  const [th, setTh] = useState("Tümü");
  const [tur, setTur] = useState("Tümü");
  const [sadeceSargyt, setSadeceSargyt] = useState(false);
  const [kopyalanan, setKopyalanan] = useState("");
  const [seciliOrdu, setSeciliOrdu] = useState<Ordu | null>(null);

  const [ozelOrdular, setOzelOrdular] = useState<Ordu[]>([]);
  const [formAcik, setFormAcik] = useState(false);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniTh, setYeniTh] = useState("16");
  const [yeniTur, setYeniTur] = useState<"Yer" | "Hava" | "Karma">("Yer");
  const [yeniZorluk, setYeniZorluk] = useState<"Kolay" | "Orta" | "İleri">("Orta");
  const [yeniBirlikler, setYeniBirlikler] = useState("");
  const [yeniBuyuler, setYeniBuyuler] = useState("");
  const [yeniKkBirlik, setYeniKkBirlik] = useState("");
  const [yeniKkBuyu, setYeniKkBuyu] = useState("");
  const [yeniKusatma, setYeniKusatma] = useState("");
  const [yeniOzet, setYeniOzet] = useState("");
  const [yeniLink, setYeniLink] = useState("");

  useEffect(() => {
    try {
      const kayit = localStorage.getItem("sargyt_ozel_ordular");
      if (kayit) {
        const parsed = JSON.parse(kayit);
        if (Array.isArray(parsed)) setOzelOrdular(parsed);
      }
    } catch {}
  }, []);

  function ozelOrduEkle(e: FormEvent) {
    e.preventDefault();
    if (!yeniAd.trim() || !yeniBirlikler.trim()) return;

    const temizLink = yeniLink.trim();
    const gecerliLink =
      temizLink.startsWith("https://link.clashofclans.com/") ? temizLink : undefined;

    const yeniOrdu: Ordu = {
      id: Date.now().toString(),
      ad: yeniAd.trim(),
      thMin: Number(yeniTh),
      thMax: Number(yeniTh),
      tur: yeniTur,
      zorluk: yeniZorluk,
      birlikler: yeniBirlikler.trim(),
      buyuler: yeniBuyuler.trim() || "Belirtilmedi",
      klanKalesiBirlik: yeniKkBirlik.trim() || undefined,
      klanKalesiBuyu: yeniKkBuyu.trim() || undefined,
      kusatma: yeniKusatma.trim() || "Belirtilmedi",
      ozet: yeniOzet.trim() || "Kullanıcı tarafından oluşturulan özel saldırı ordusu.",
      oyunLinki: gecerliLink,
      kullaniciOrdusu: true,
    };

    const guncel = [yeniOrdu, ...ozelOrdular];
    setOzelOrdular(guncel);
    try {
      localStorage.setItem("sargyt_ozel_ordular", JSON.stringify(guncel));
    } catch {}

    setYeniAd("");
    setYeniBirlikler("");
    setYeniBuyuler("");
    setYeniKkBirlik("");
    setYeniKkBuyu("");
    setYeniKusatma("");
    setYeniOzet("");
    setYeniLink("");
    setFormAcik(false);
  }

  function ozelOrduSil(id?: string) {
    if (!id) return;
    const guncel = ozelOrdular.filter((o) => o.id !== id);
    setOzelOrdular(guncel);
    if (seciliOrdu?.id === id) setSeciliOrdu(null);
    try {
      localStorage.setItem("sargyt_ozel_ordular", JSON.stringify(guncel));
    } catch {}
  }

  const tumOrdular = [...ozelOrdular, ...ORDULAR];

  const liste = tumOrdular.filter((o) => {
    const thUygun = th === "Tümü" || (Number(th) >= o.thMin && Number(th) <= o.thMax);
    const turUygun = tur === "Tümü" || o.tur === tur;
    const ozelUygun = !sadeceSargyt || o.sargytOzel;
    return thUygun && turUygun && ozelUygun;
  });

  function orduKopyala(o: Ordu) {
    const kkSatiri = o.klanKalesiBirlik
      ? `\n• Klan Kalesi: ${o.klanKalesiBirlik}${o.klanKalesiBuyu ? ` | ${o.klanKalesiBuyu}` : ""} (${o.kusatma})`
      : `\n• Kuşatma: ${o.kusatma}`;
    const kahramanSatiri = o.kahramanlar
      ? `\n• Kahramanlar: ${o.kahramanlar.map((k) => `${k.kahraman} (${k.ekipmanlar.map((e) => e.ad).join(" + ")})`).join(", ")}`
      : "";
    const metin = `⚔️ ${o.ad} (BB${o.thMin}${o.thMax !== o.thMin ? "-BB" + o.thMax : ""})\n• Birlikler: ${o.birlikler}\n• Büyüler: ${o.buyuler}${kkSatiri}${kahramanSatiri}${o.oyunLinki ? `\n• Oyuna Aktar: ${o.oyunLinki}` : ""}`;
    navigator.clipboard.writeText(metin);
    setKopyalanan(o.ad);
    setTimeout(() => setKopyalanan(""), 2000);
  }

  /* ============================================================================
     DETAY SEKMESİ GÖRÜNÜMÜ (Bir Orduya Tıklandığında Açılır)
  ============================================================================ */
  if (seciliOrdu) {
    const birlikParcalari = metniParcala(seciliOrdu.birlikler);
    const buyuParcalari = metniParcala(seciliOrdu.buyuler);
    const kkBirlikParcalari = metniParcala(seciliOrdu.klanKalesiBirlik);
    const kkBuyuParcalari = metniParcala(seciliOrdu.klanKalesiBuyu);
    const kusatmaParcalari = metniParcala(seciliOrdu.kusatma, 1);

    const toplamBirimAlani = birlikParcalari.reduce((t, p) => t + p.kapasite, 0);
    const toplamBuyuAlani = buyuParcalari.reduce((t, p) => t + p.kapasite, 0);
    const toplamKkBirimAlani = kkBirlikParcalari.reduce((t, p) => t + p.kapasite, 0);
    const toplamKkBuyuAlani = kkBuyuParcalari.reduce((t, p) => t + p.kapasite, 0);

    return (
      <main style={{ padding: "clamp(20px, 3vw, 34px) clamp(14px, 3vw, 28px)", maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        {/* Üst Geri Dönüş & Aksiyon Çubuğu */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setSeciliOrdu(null)}
            style={{
              padding: "10px 18px",
              borderRadius: 11,
              border: "1px solid var(--cizgi)",
              background: "var(--kart)",
              color: "var(--fg)",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ← Tüm Ordulara Dön
          </button>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => orduKopyala(seciliOrdu)}
              style={{
                padding: "10px 16px",
                borderRadius: 11,
                border: "1px solid var(--cizgi)",
                background: "var(--kart)",
                color: "var(--fg)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {kopyalanan === seciliOrdu.ad ? "✅ Kopyalandı!" : "📋 Metni Kopyala"}
            </button>

            {seciliOrdu.oyunLinki && (
              <a
                href={seciliOrdu.oyunLinki}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 18px",
                  borderRadius: 11,
                  background: "var(--vurgu)",
                  color: "#111",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                🎮 Oyuna Aktar ↗
              </a>
            )}
          </div>
        </div>

        {/* Detay Ana Kartı */}
        <div
          style={{
            padding: "clamp(20px, 3vw, 28px)",
            background: "var(--kart)",
            border: seciliOrdu.sargytOzel ? "2px solid #f59e0b" : "1px solid var(--cizgi)",
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {/* Başlık ve Kapasite Rozetleri */}
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {seciliOrdu.sargytOzel && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "#f59e0b",
                    color: "#111",
                    fontWeight: 800,
                  }}
                >
                  👑 Sargyt Özel Taktik
                </span>
              )}
              <span
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  fontWeight: 700,
                }}
              >
                {seciliOrdu.thMin === seciliOrdu.thMax
                  ? `Belediye Binası ${seciliOrdu.thMin}`
                  : `Belediye Binası ${seciliOrdu.thMin} – ${seciliOrdu.thMax}`}
              </span>
              <span
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  fontWeight: 700,
                }}
              >
                Tür: {seciliOrdu.tur} · Zorluk: {seciliOrdu.zorluk}
              </span>
              {toplamBirimAlani > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "color-mix(in srgb, var(--vurgu) 16%, var(--bg))",
                    border: "1px solid var(--vurgu)",
                    color: "var(--vurgu)",
                    fontWeight: 800,
                  }}
                >
                  ⛺ Ordu: {toplamBirimAlani} Birim · {toplamBuyuAlani} Büyü
                </span>
              )}
              {toplamKkBirimAlani > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 8,
                    background: "rgba(245, 158, 11, 0.14)",
                    border: "1px solid #f59e0b",
                    color: "#f59e0b",
                    fontWeight: 800,
                  }}
                >
                  🏰 Klan Kalesi: {toplamKkBirimAlani} Birim · {toplamKkBuyuAlani} Büyü
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 900, margin: "0 0 10px" }}>
              {seciliOrdu.ad}
            </h1>
            <p style={{ margin: 0, fontSize: 15.5, opacity: 0.88, lineHeight: 1.6 }}>{seciliOrdu.ozet}</p>
          </div>

          {/* 1. ORDU KAMPI BİRLİKLERİ & BÜYÜ FABRİKASI */}
          <div
            style={{
              padding: 18,
              borderRadius: 14,
              background: "var(--bg)",
              border: "1px solid var(--cizgi)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 13, opacity: 0.8 }}>⚔️ ORDU KAMPI BİRLİKLERİ</strong>
                {toplamBirimAlani > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--vurgu)" }}>
                    Toplam: {toplamBirimAlani} Alan
                  </span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                {birlikParcalari.map((p, idx) => (
                  <OrduBirimKarti key={`${p.etiket}-${idx}`} parca={p} yedekIkon="⚔️" />
                ))}
              </div>
            </div>

            <div style={{ paddingTop: 12, borderTop: "1px solid var(--cizgi)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <strong style={{ fontSize: 13, opacity: 0.8 }}>⚡ BÜYÜ FABRİKASI</strong>
                {toplamBuyuAlani > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#38bdf8" }}>
                    Toplam: {toplamBuyuAlani} Alan
                  </span>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: 8 }}>
                {buyuParcalari.map((p, idx) => (
                  <OrduBirimKarti key={`${p.etiket}-${idx}`} parca={p} yedekIkon="⚡" vurguRengi="#38bdf8" />
                ))}
              </div>
            </div>
          </div>

          {/* 2. KLAN KALESİ TAKVİYESİ (Birlik + Büyü + Kuşatma) */}
          <div
            style={{
              padding: 18,
              borderRadius: 14,
              background: "var(--bg)",
              border: "1px solid #f59e0b",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <strong style={{ fontSize: 14, color: "#f59e0b" }}>🏰 KLAN KALESİ TAKVİYESİ</strong>
              {toplamKkBirimAlani > 0 && (
                <span style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b" }}>
                  Kapasite: {toplamKkBirimAlani} Birim · {toplamKkBuyuAlani} Büyü
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {kkBirlikParcalari.length > 0 && (
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.72, marginBottom: 6 }}>🛡️ KK BİRLİKLERİ</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                    {kkBirlikParcalari.map((p, idx) => (
                      <OrduBirimKarti key={`kk-b-${idx}`} parca={p} yedekIkon="🛡️" vurguRengi="#f59e0b" />
                    ))}
                  </div>
                </div>
              )}

              {kkBuyuParcalari.length > 0 && (
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.72, marginBottom: 6 }}>✨ KK BÜYÜLERİ</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: 8 }}>
                    {kkBuyuParcalari.map((p, idx) => (
                      <OrduBirimKarti key={`kk-s-${idx}`} parca={p} yedekIkon="✨" vurguRengi="#38bdf8" />
                    ))}
                  </div>
                </div>
              )}

              {kusatmaParcalari.length > 0 && (
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, opacity: 0.72, marginBottom: 6 }}>🚜 KUŞATMA MAKİNESİ</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
                    {kusatmaParcalari.map((p, idx) => (
                      <OrduBirimKarti key={`kk-k-${idx}`} parca={p} yedekIkon="🚜" vurguRengi="#f59e0b" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

{/* 3. KAHRAMANLAR & GÖRSELLİ EKİPMAN DİZİLİMİ */}
          {seciliOrdu.kahramanlar && seciliOrdu.kahramanlar.length > 0 && (
            <div>
              <h2 className="baslik-serit">
                <span>👑 Kahramanlar & Kritik Ekipman Dizilimi</span>
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
                  gap: 16,
                }}
              >
                {seciliOrdu.kahramanlar.map((k) => (
                  <div
                    key={k.kahraman}
                    style={{
                      padding: 18,
                      borderRadius: 16,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    {/* Üstte Büyük Kare Kahraman Vitrini */}
                    <div
                      style={{
                        width: 124,
                        height: 124,
                        borderRadius: 18,
                        background: "var(--kart)",
                        border: "2px solid var(--vurgu)",
                        padding: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.28)",
                      }}
                    >
                      <PortreGorsel
                        ingilizceAd={k.ingilizceKahraman}
                        alt={k.kahraman}
                        boyut={108}
                        yedekIkon="👑"
                        sigdir
                      />
                    </div>

                    <strong style={{ fontSize: 17, fontWeight: 900, color: "var(--vurgu)", textAlign: "center" }}>
                      {k.kahraman}
                    </strong>

                    {/* Altında 2 Ayrı Kutuda Ekipmanlar */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        width: "100%",
                      }}
                    >
                      {k.ekipmanlar.map((ek) => (
                        <div
                          key={ek.ad}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "12px 8px",
                            borderRadius: 12,
                            background: "var(--kart)",
                            border: "1px solid var(--cizgi)",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 52,
                              height: 52,
                              borderRadius: 10,
                              background: "var(--bg)",
                              border: "1px solid var(--cizgi)",
                              padding: 4,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PortreGorsel
                              ingilizceAd={ek.ingilizceAd}
                              alt={ek.ad}
                              boyut={44}
                              yedekIkon="🛡️"
                              sigdir
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              lineHeight: 1.25,
                              color: "var(--fg)",
                            }}
                          >
                            {ek.ad}
                          </span>
                        </div>
                      ))}
                    </div>

                    {k.not && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          opacity: 0.8,
                          lineHeight: 1.5,
                          textAlign: "center",
                          borderTop: "1px solid var(--cizgi)",
                          paddingTop: 10,
                          width: "100%",
                        }}
                      >
                        {k.not}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 4. ADIM ADIM UYGULAMA PLANI */}
          {seciliOrdu.adimlar && seciliOrdu.adimlar.length > 0 && (
            <div>
              <h2 className="baslik-serit">
                <span>🎯 Adım Adım Saldırı Planı</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {seciliOrdu.adimlar.map((adim, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "13px 16px",
                      borderRadius: 12,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      fontSize: 14.5,
                      lineHeight: 1.55,
                    }}
                  >
                    {adim}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  /* ============================================================================
     ANA LİSTE GÖRÜNÜMÜ (Kompakt Tıklanabilir Ordu Kartları)
  ============================================================================ */
  return (
    <main style={{ padding: "clamp(20px, 3vw, 34px) clamp(14px, 3vw, 28px)", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
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
          <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 900, margin: "0 0 6px" }}>
            ⚔️ Meta Ordular & Sargyt Özel Taktikler
          </h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 15 }}>
            Kahraman ekipmanları, Klan Kalesi takviyesi ve adım adım saldırı planını görmek için karta tıkla.
          </p>
        </div>

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
          {formAcik ? "✕ Formu Kapat" : "+ Kendi Ordunu Oluştur"}
        </button>
      </div>

      {/* Özel Ordu Oluşturucu Formu */}
      {formAcik && (
        <form
          onSubmit={ozelOrduEkle}
          style={{
            padding: 20,
            marginBottom: 22,
            background: "var(--kart)",
            border: "2px solid var(--vurgu)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <strong style={{ fontSize: 18 }}>🛠️ Yeni Özel Ordu Oluştur</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <input
              required
              value={yeniAd}
              onChange={(e) => setYeniAd(e.target.value)}
              placeholder="Ordu Adı (örn. Mızrakçı Ordusu)"
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
              {["6","7","8","9","10","11","12","13", "14", "15", "16", "17","18","19"].map((seviye) => (
                <option key={seviye} value={seviye}>
                  Belediye Binası {seviye}
                </option>
              ))}
            </select>
            <select
              value={yeniTur}
              onChange={(e) => setYeniTur(e.target.value as "Yer" | "Hava" | "Karma")}
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            >
              <option value="Yer">Tür: Yer</option>
              <option value="Hava">Tür: Hava</option>
              <option value="Karma">Tür: Karma</option>
            </select>
            <select
              value={yeniZorluk}
              onChange={(e) => setYeniZorluk(e.target.value as "Kolay" | "Orta" | "İleri")}
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            >
              <option value="Kolay">Zorluk: Kolay</option>
              <option value="Orta">Zorluk: Orta</option>
              <option value="İleri">Zorluk: İleri</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            <input
              required
              value={yeniBirlikler}
              onChange={(e) => setYeniBirlikler(e.target.value)}
              placeholder="Ordu Kampı Birlikleri (örn. 10 Mızrakçı, 5 Şifacı...)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
            <input
              value={yeniBuyuler}
              onChange={(e) => setYeniBuyuler(e.target.value)}
              placeholder="Büyüler (örn. 2 Sarmaşık, 3 Dondurma, 1 Zehir)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
            <input
              value={yeniKusatma}
              onChange={(e) => setYeniKusatma(e.target.value)}
              placeholder="Kuşatma Makinesi (örn. Uçan Kışla)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            <input
              value={yeniKkBirlik}
              onChange={(e) => setYeniKkBirlik(e.target.value)}
              placeholder="Klan Kalesi Birlikleri (örn. 2 Yeti, 1 Valkyrie, 11 Okçu)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
            <input
              value={yeniKkBuyu}
              onChange={(e) => setYeniKkBuyu(e.target.value)}
              placeholder="Klan Kalesi Büyüleri (örn. 1 Öfke, 1 Dondurma)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
            <input
              value={yeniLink}
              onChange={(e) => setYeniLink(e.target.value)}
              placeholder="Oyundan Kopyalanan Ordu Linki (https://link.clashofclans.com/...)"
              style={{
                padding: 11,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
          </div>

          <textarea
            value={yeniOzet}
            onChange={(e) => setYeniOzet(e.target.value)}
            placeholder="Saldırı taktiği ve uygulama ipuçları..."
            rows={2}
            style={{
              padding: 11,
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              style={{
                padding: "11px 22px",
                borderRadius: 10,
                border: 0,
                background: "var(--vurgu)",
                color: "#111",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ✓ Ordumu Kaydet
            </button>
          </div>
        </form>
      )}

      {/* Filtre Alanı */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          padding: "14px 18px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 14,
        }}
      >
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label htmlFor="ordu-bb-filtre" style={{ fontSize: 13.5, fontWeight: 700, opacity: 0.85 }}>
            🏰 Belediye:
          </label>
          <select
            id="ordu-bb-filtre"
            value={th}
            onChange={(e) => setTh(e.target.value)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {TH_FILTRELER.map((f) => (
              <option key={f} value={f}>
                {f === "Tümü" ? "🏰 Tüm BB Seviyeleri" : `🏰 Belediye Binası ${f}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.85, marginRight: 4 }}>🎯 Tür:</span>
          {TUR_FILTRELER.map((t) => (
            <button
              key={t}
              onClick={() => setTur(t)}
              style={{
                padding: "7px 12px",
                borderRadius: 9,
                border: "1px solid " + (tur === t ? "var(--vurgu)" : "var(--cizgi)"),
                background: tur === t ? "var(--vurgu)" : "var(--bg)",
                color: tur === t ? "#111" : "var(--fg)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                minHeight: 36,
              }}
            >
              {t}
            </button>
          ))}

          <button
            onClick={() => setSadeceSargyt(!sadeceSargyt)}
            style={{
              marginLeft: 4,
              padding: "7px 14px",
              borderRadius: 9,
              border: "1px solid " + (sadeceSargyt ? "#f59e0b" : "var(--cizgi)"),
              background: sadeceSargyt ? "#f59e0b" : "var(--bg)",
              color: sadeceSargyt ? "#111" : "var(--fg)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              minHeight: 36,
            }}
          >
            👑 Sadece Sargyt Özel
          </button>
        </div>
      </div>

      <p style={{ opacity: 0.75, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
        {liste.length} ordu listeleniyor — Klan Kalesi ve kahraman ekipmanları için karta tıkla
      </p>

      {/* KOMPAKT DİKDÖRTGEN ORDU KARTLARI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: 16,
        }}
      >
        {liste.map((o) => {
          const birlikParcalari = metniParcala(o.birlikler);
          const buyuParcalari = metniParcala(o.buyuler);
          const toplamBirim = birlikParcalari.reduce((t, p) => t + p.kapasite, 0);
          const toplamBuyu = buyuParcalari.reduce((t, p) => t + p.kapasite, 0);

          return (
            <div
              key={o.id ?? o.ad}
              style={{
                background: "var(--kart)",
                border: o.sargytOzel
                  ? "2px solid #f59e0b"
                  : o.kullaniciOrdusu
                  ? "2px solid #22c55e"
                  : "1px solid var(--cizgi)",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden",
              }}
            >
              {/* Tıklanabilir Üst Gövde */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSeciliOrdu(o)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSeciliOrdu(o);
                }}
                style={{
                  padding: "18px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                          fontWeight: 700,
                        }}
                      >
                        {o.thMin === o.thMax ? `BB ${o.thMin}` : `BB ${o.thMin}–${o.thMax}`} · {o.tur}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: "var(--bg)",
                          border: "1px solid var(--cizgi)",
                          fontWeight: 600,
                        }}
                      >
                        {o.zorluk}
                      </span>
                      {toplamBirim > 0 && (
                        <span
                          style={{
                            fontSize: 11.5,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "color-mix(in srgb, var(--vurgu) 14%, var(--bg))",
                            color: "var(--vurgu)",
                            fontWeight: 800,
                          }}
                        >
                          {toplamBirim} Birim · {toplamBuyu} Büyü
                        </span>
                      )}
                    </div>

                    <strong style={{ fontSize: 18, lineHeight: 1.25, display: "block" }}>{o.ad}</strong>
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "var(--vurgu)",
                      whiteSpace: "nowrap",
                      paddingTop: 2,
                    }}
                  >
                    Detay →
                  </span>
                </div>

                {/* Ana Birlik Önizleme Şeridi + Klan Kalesi Özeti */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {birlikParcalari.slice(0, 5).map((p, idx) => (
                    <MiniOnizlemeIkon key={`${p.etiket}-${idx}`} ingilizceAd={p.ingilizceAd} adet={p.adet} />
                  ))}
                  {birlikParcalari.length > 5 && (
                    <span
                      style={{
                        height: 34,
                        padding: "0 9px",
                        borderRadius: 8,
                        background: "var(--bg)",
                        border: "1px solid var(--cizgi)",
                        fontSize: 11.5,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        opacity: 0.85,
                      }}
                    >
                      +{birlikParcalari.length - 5}
                    </span>
                  )}

                  {o.klanKalesiBirlik && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11.5,
                        color: "#f59e0b",
                        fontWeight: 800,
                      }}
                    >
                      🏰 KK: {o.kusatma}
                    </span>
                  )}
                </div>
              </div>

              {/* Alt Kısım: Rozet & Doğrudan Kopyala / Oyuna Aktar Butonları */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  padding: "10px 18px",
                  background: "color-mix(in srgb, var(--bg) 55%, var(--kart))",
                  borderTop: "1px solid var(--cizgi)",
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: o.sargytOzel ? "#f59e0b" : o.kullaniciOrdusu ? "#22c55e" : "var(--vurgu)",
                    color: "#111",
                    fontWeight: 800,
                  }}
                >
                  {o.sargytOzel ? "👑 Sargyt Özel" : o.kullaniciOrdusu ? "🛠️ Özel Ordu" : "✓ Meta"}
                </span>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {o.kullaniciOrdusu && (
                    <button
                      type="button"
                      onClick={() => ozelOrduSil(o.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #ef6b5f",
                        background: "transparent",
                        color: "#ef6b5f",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        minHeight: 34,
                      }}
                    >
                      🗑️
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => orduKopyala(o)}
                    style={{
                      padding: "6px 11px",
                      borderRadius: 8,
                      border: "1px solid var(--cizgi)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      minHeight: 34,
                    }}
                  >
                    {kopyalanan === o.ad ? "✅ Kopyalandı" : "📋 Kopyala"}
                  </button>

                  {o.oyunLinki && (
                    <a
                      href={o.oyunLinki}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        background: "var(--vurgu)",
                        color: "#111",
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        minHeight: 34,
                      }}
                    >
                      🎮 Oyuna Aktar ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
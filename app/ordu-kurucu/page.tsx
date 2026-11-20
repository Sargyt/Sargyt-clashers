"use client";
import { useEffect, useState } from "react";

type BirimKategori = "İksir" | "Kara İksir" | "Süper Birlik" | "Büyü" | "Kuşatma";

type Birim = {
  id: string;
  ad: string;
  kategori: BirimKategori;
  kapasite: number;
  ikon: string;
};

type KayitliOrdu = {
  id: string;
  ad: string;
  bb: number;
  secimler: Record<string, number>;
  kusatma: string;
};

const BB_KAPASITE: Record<number, { kamp: number; buyu: number; klanKalesi: number }> = {
  11: { kamp: 260, buyu: 11, klanKalesi: 35 },
  12: { kamp: 280, buyu: 11, klanKalesi: 40 },
  13: { kamp: 300, buyu: 11, klanKalesi: 45 },
  14: { kamp: 300, buyu: 11, klanKalesi: 45 },
  15: { kamp: 320, buyu: 11, klanKalesi: 50 },
  16: { kamp: 320, buyu: 11, klanKalesi: 50 },
  17: { kamp: 340, buyu: 11, klanKalesi: 55 },
  18: { kamp: 340, buyu: 11, klanKalesi: 55 },
  19: { kamp: 360, buyu: 11, klanKalesi: 60 },
};

const BIRIMLER: Birim[] = [
  // İksir Birlikleri
  { id: "barbarian", ad: "Barbar", kategori: "İksir", kapasite: 1, ikon: "🗡️" },
  { id: "archer", ad: "Okçu", kategori: "İksir", kapasite: 1, ikon: "🏹" },
  { id: "giant", ad: "Dev", kategori: "İksir", kapasite: 5, ikon: "💪" },
  { id: "wall-breaker", ad: "Duvar Yıkıcı", kategori: "İksir", kapasite: 2, ikon: "💣" },
  { id: "balloon", ad: "Balon", kategori: "İksir", kapasite: 5, ikon: "🎈" },
  { id: "wizard", ad: "Büyücü", kategori: "İksir", kapasite: 4, ikon: "🔥" },
  { id: "healer", ad: "Şifacı", kategori: "İksir", kapasite: 14, ikon: "✨" },
  { id: "dragon", ad: "Ejderha", kategori: "İksir", kapasite: 20, ikon: "🐉" },
  { id: "pekka", ad: "P.E.K.K.A", kategori: "İksir", kapasite: 25, ikon: "🤖" },
  { id: "baby-dragon", ad: "Bebek Ejderha", kategori: "İksir", kapasite: 10, ikon: "🐲" },
  { id: "miner", ad: "Madenci", kategori: "İksir", kapasite: 6, ikon: "⛏️" },
  { id: "edrag", ad: "Elektro Ejderha", kategori: "İksir", kapasite: 30, ikon: "⚡" },
  { id: "yeti", ad: "Yeti", kategori: "İksir", kapasite: 18, ikon: "❄️" },
  { id: "dragon-rider", ad: "Ejderha Binici", kategori: "İksir", kapasite: 25, ikon: "🚁" },
  { id: "etitan", ad: "Elektro Titan", kategori: "İksir", kapasite: 32, ikon: "🌩️" },
  { id: "root-rider", ad: "Orman Binici", kategori: "İksir", kapasite: 20, ikon: "🌿" },
  { id: "thrower", ad: "Mızrakçı", kategori: "İksir", kapasite: 16, ikon: "🔱" },
  { id: "meteor-golem", ad: "Meteor Golem", kategori: "İksir", kapasite: 40, ikon: "☄️" },

  // Kara İksir Birlikleri
  { id: "minion", ad: "Minyon", kategori: "Kara İksir", kapasite: 2, ikon: "🦇" },
  { id: "hog-rider", ad: "Domuz Binici", kategori: "Kara İksir", kapasite: 5, ikon: "🐗" },
  { id: "valkyrie", ad: "Valkür", kategori: "Kara İksir", kapasite: 8, ikon: "🪓" },
  { id: "golem", ad: "Golem", kategori: "Kara İksir", kapasite: 30, ikon: "🪨" },
  { id: "witch", ad: "Cadı", kategori: "Kara İksir", kapasite: 12, ikon: "💀" },
  { id: "lava-hound", ad: "Lav Tazısı", kategori: "Kara İksir", kapasite: 30, ikon: "🌋" },
  { id: "bowler", ad: "Atıcı", kategori: "Kara İksir", kapasite: 6, ikon: "🟣" },
  { id: "ice-golem", ad: "Buz Golem", kategori: "Kara İksir", kapasite: 15, ikon: "🧊" },
  { id: "headhunter", ad: "Kelle Avcısı", kategori: "Kara İksir", kapasite: 6, ikon: "☠️" },
  { id: "app-warden", ad: "Çırak Koruyucu", kategori: "Kara İksir", kapasite: 20, ikon: "🪄" },
  { id: "druid", ad: "Druid", kategori: "Kara İksir", kapasite: 16, ikon: "🐻" },
  { id: "furnace", ad: "Fırın", kategori: "Kara İksir", kapasite: 18, ikon: "🔥" },

  // Süper Birlikler
  { id: "s-barb", ad: "Süper Barbar", kategori: "Süper Birlik", kapasite: 5, ikon: "⚔️" },
  { id: "s-archer", ad: "Süper Okçu", kategori: "Süper Birlik", kapasite: 12, ikon: "🎯" },
  { id: "sneaky-goblin", ad: "Sinsi Goblin", kategori: "Süper Birlik", kapasite: 3, ikon: "💰" },
  { id: "s-wb", ad: "Süper Duvar Yıkıcı", kategori: "Süper Birlik", kapasite: 8, ikon: "💥" },
  { id: "rocket-loon", ad: "Roket Balon", kategori: "Süper Birlik", kapasite: 8, ikon: "🚀" },
  { id: "s-wiz", ad: "Süper Büyücü", kategori: "Süper Birlik", kapasite: 10, ikon: "⚡" },
  { id: "s-bowler", ad: "Süper Atıcı", kategori: "Süper Birlik", kapasite: 30, ikon: "🎳" },
  { id: "s-witch", ad: "Süper Cadı", kategori: "Süper Birlik", kapasite: 40, ikon: "🧙‍♀️" },
  { id: "s-hog", ad: "Süper Domuz Binici", kategori: "Süper Birlik", kapasite: 12, ikon: "🐗" },
  { id: "s-yeti", ad: "Süper Yeti", kategori: "Süper Birlik", kapasite: 35, ikon: "❄️" },

  // Büyüler
  { id: "lightning", ad: "Yıldırım", kategori: "Büyü", kapasite: 1, ikon: "⚡" },
  { id: "heal", ad: "İyileştirme", kategori: "Büyü", kapasite: 2, ikon: "💛" },
  { id: "rage", ad: "Öfke", kategori: "Büyü", kapasite: 2, ikon: "🟣" },
  { id: "jump", ad: "Atlama", kategori: "Büyü", kapasite: 2, ikon: "🟢" },
  { id: "freeze", ad: "Buz", kategori: "Büyü", kapasite: 1, ikon: "❄️" },
  { id: "clone", ad: "Klon", kategori: "Büyü", kapasite: 3, ikon: "🌀" },
  { id: "invis", ad: "Görünmezlik", kategori: "Büyü", kapasite: 1, ikon: "👻" },
  { id: "recall", ad: "Geri Çağırma", kategori: "Büyü", kapasite: 2, ikon: "🔄" },
  { id: "revive", ad: "Canlandırma", kategori: "Büyü", kapasite: 2, ikon: "💖" },
  { id: "poison", ad: "Zehir", kategori: "Büyü", kapasite: 1, ikon: "🧪" },
  { id: "earthquake", ad: "Deprem", kategori: "Büyü", kapasite: 1, ikon: "🌍" },
  { id: "haste", ad: "Hızlandırma", kategori: "Büyü", kapasite: 1, ikon: "💨" },
  { id: "skeleton", ad: "İskelet", kategori: "Büyü", kapasite: 1, ikon: "💀" },
  { id: "overgrowth", ad: "Sarmaşık", kategori: "Büyü", kapasite: 2, ikon: "🌿" },
  { id: "ice-block", ad: "Buz Bloğu", kategori: "Büyü", kapasite: 1, ikon: "🧊" },
  { id: "totem", ad: "Totem", kategori: "Büyü", kapasite: 1, ikon: "🗿" },
];

const KUSATMALAR = [
  "Seçilmedi",
  "Zeplin (Battle Blimp)",
  "Uçan Kışla (Siege Barracks)",
  "Tomruk Fırlatıcı (Log Launcher)",
  "Alev Atıcı (Flame Flinger)",
  "Savaş Köstebeği (Battle Drill)",
  "Birlik Atıcı (Troop Launcher)",
  "Kaya Balonu (Stone Slammer)",
  "Tokmak (Wall Wrecker)",
  "Uçan Taşıyıcı (Sky Wagon)",
];

const KATEGORILER: BirimKategori[] = ["İksir", "Kara İksir", "Süper Birlik", "Büyü"];

export default function OrduKurucuSayfasi() {
  const [bb, setBb] = useState(18);
  const [aktifKategori, setAktifKategori] = useState<BirimKategori>("İksir");
  const [secimler, setSecimler] = useState<Record<string, number>>({});
  const [kusatma, setKusatma] = useState(KUSATMALAR[1]);
  const [orduAdi, setOrduAdi] = useState("");
  const [kayitlar, setKayitlar] = useState<KayitliOrdu[]>([]);
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    try {
      const ham = localStorage.getItem("sargyt_kayitli_ordular");
      if (ham) setKayitlar(JSON.parse(ham));
    } catch {}
  }, []);

  const limit = BB_KAPASITE[bb] ?? BB_KAPASITE[18];

  const kullanilanKamp = BIRIMLER.filter((b) => b.kategori !== "Büyü").reduce(
    (t, b) => t + (secimler[b.id] ?? 0) * b.kapasite,
    0
  );
  const kullanilanBuyu = BIRIMLER.filter((b) => b.kategori === "Büyü").reduce(
    (t, b) => t + (secimler[b.id] ?? 0) * b.kapasite,
    0
  );

  const seciliBirlikler = BIRIMLER.filter((b) => b.kategori !== "Büyü" && (secimler[b.id] ?? 0) > 0);
  const seciliBuyuler = BIRIMLER.filter((b) => b.kategori === "Büyü" && (secimler[b.id] ?? 0) > 0);

  function degistir(b: Birim, fark: number) {
    setSecimler((eski) => {
      const mevcut = eski[b.id] ?? 0;
      const yeni = mevcut + fark;
      if (yeni < 0) return eski;

      if (fark > 0) {
        if (b.kategori === "Büyü" && kullanilanBuyu + b.kapasite > limit.buyu) return eski;
        if (b.kategori !== "Büyü" && kullanilanKamp + b.kapasite > limit.kamp) return eski;
      }

      const kopya = { ...eski };
      if (yeni === 0) delete kopya[b.id];
      else kopya[b.id] = yeni;
      return kopya;
    });
  }

  function orduKaydet() {
    if (seciliBirlikler.length === 0 && seciliBuyuler.length === 0) return;
    const yeniKayit: KayitliOrdu = {
      id: String(Date.now()),
      ad: orduAdi.trim() || `BB ${bb} Özel Ordu #${kayitlar.length + 1}`,
      bb,
      secimler: { ...secimler },
      kusatma,
    };
    const guncel = [yeniKayit, ...kayitlar].slice(0, 12);
    setKayitlar(guncel);
    setOrduAdi("");
    try {
      localStorage.setItem("sargyt_kayitli_ordular", JSON.stringify(guncel));
    } catch {}
  }

  function kayitSil(id: string) {
    const guncel = kayitlar.filter((k) => k.id !== id);
    setKayitlar(guncel);
    try {
      localStorage.setItem("sargyt_kayitli_ordular", JSON.stringify(guncel));
    } catch {}
  }

  async function kopyala() {
    if (seciliBirlikler.length === 0 && seciliBuyuler.length === 0) return;
    const birlikMetin = seciliBirlikler.map((b) => `${secimler[b.id]}x ${b.ad}`).join(", ") || "Yok";
    const buyuMetin = seciliBuyuler.map((b) => `${secimler[b.id]}x ${b.ad}`).join(", ") || "Yok";
    const baslik = orduAdi.trim() || `BB ${bb} Özel Ordu`;

    const metin = `⚔️ *${baslik}* (BB ${bb})\n🪖 Birlikler (${kullanilanKamp}/${limit.kamp}): ${birlikMetin}\n🧪 Büyüler (${kullanilanBuyu}/${limit.buyu}): ${buyuMetin}\n🚜 Kuşatma: ${kusatma}\n📋 Sargyt Clashers Ordu Kurucu`;
    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2500);
    } catch {}
  }

  const kampYuzde = Math.min(100, Math.round((kullanilanKamp / limit.kamp) * 100));
  const buyuYuzde = Math.min(100, Math.round((kullanilanBuyu / limit.buyu) * 100));

  return (
    <main style={{ padding: "32px 24px", maxWidth: 1360, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ÜST BAŞLIK & BB SEÇİMİ */}
      <section style={{ padding: "24px 28px", background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px" }}>
            🧪 İnteraktif Ordu Kurucu
          </h1>
          <p style={{ margin: 0, opacity: 0.78, fontSize: 15 }}>
            Birlik ve büyülerini seç, kamp kapasiteni canlı takip et, ordunu kaydet veya klan grubuna tek tıkla paylaş.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14 }}>
            <span>🏰 Belediye:</span>
            <select
              value={bb}
              onChange={(e) => setBb(Number(e.target.value))}
              style={{ padding: "9px 13px", borderRadius: 10, border: "1px solid var(--vurgu)", background: "var(--bg)", color: "var(--fg)", fontWeight: 900 }}
            >
              {Object.keys(BB_KAPASITE).map((k) => (
                <option key={k} value={Number(k)}>
                  BB {k}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setSecimler({})}
            style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef6b5f", fontWeight: 800, cursor: "pointer" }}
          >
            🗑️ Temizle
          </button>
        </div>
      </section>

      {/* KAPASİTE ÇUBUKLARI & CANLI ORDU ÖZETİ */}
      <section style={{ padding: 22, background: "var(--kart)", border: "1.5px solid var(--vurgu)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {/* KAMP BARI */}
          <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 800 }}>
              <span>🪖 Ordu Kampı</span>
              <span style={{ color: kullanilanKamp === limit.kamp ? "#22c55e" : "var(--vurgu)" }}>
                {kullanilanKamp} / {limit.kamp}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "var(--kart)", marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: `${kampYuzde}%`, height: "100%", background: kullanilanKamp === limit.kamp ? "#22c55e" : "var(--vurgu)", transition: "width 0.2s" }} />
            </div>
          </div>

          {/* BÜYÜ BARI */}
          <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 800 }}>
              <span>🧪 Büyü Fabrikası</span>
              <span style={{ color: kullanilanBuyu === limit.buyu ? "#22c55e" : "var(--vurgu)" }}>
                {kullanilanBuyu} / {limit.buyu}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "var(--kart)", marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: `${buyuYuzde}%`, height: "100%", background: kullanilanBuyu === limit.buyu ? "#22c55e" : "#a78bfa", transition: "width 0.2s" }} />
            </div>
          </div>

          {/* KUŞATMA SEÇİMİ */}
          <div style={{ padding: 14, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, opacity: 0.78 }}>🚜 Kuşatma Makinesi (CC: {limit.klanKalesi} yer)</div>
            <select
              value={kusatma}
              onChange={(e) => setKusatma(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "var(--fg)", fontSize: 13.5, fontWeight: 700 }}
            >
              {KUSATMALAR.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SEÇİLİ ROZETLER */}
        {(seciliBirlikler.length > 0 || seciliBuyuler.length > 0) ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            {[...seciliBirlikler, ...seciliBuyuler].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => degistir(b, -1)}
                title="1 adet azaltmak için tıkla"
                style={{
                  padding: "6px 11px",
                  minHeight: 34,
                  borderRadius: 9,
                  border: "1px solid var(--vurgu)",
                  background: "var(--kart)",
                  color: "var(--fg)",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {b.ikon} {secimler[b.id]}× {b.ad} <span style={{ opacity: 0.55 }}>−</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bg)", fontSize: 13.5, opacity: 0.7 }}>
            Aşağıdaki birimlere tıklayarak ordunu oluşturmaya başla.
          </div>
        )}

        {/* KAYDET & PAYLAŞ ÇUBUĞU */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={orduAdi}
            onChange={(e) => setOrduAdi(e.target.value)}
            placeholder="Orduya isim ver (örn: BB 18 Orman Binici + Valkür)"
            maxLength={45}
            style={{ flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)" }}
          />
          <button
            type="button"
            onClick={orduKaydet}
            disabled={seciliBirlikler.length === 0 && seciliBuyuler.length === 0}
            style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid var(--cizgi)", background: "var(--bg)", color: "var(--fg)", fontWeight: 800, cursor: "pointer" }}
          >
            💾 Ordumu Kaydet
          </button>
          <button
            type="button"
            onClick={kopyala}
            disabled={seciliBirlikler.length === 0 && seciliBuyuler.length === 0}
            style={{ padding: "10px 18px", borderRadius: 10, border: 0, background: "var(--vurgu)", color: "var(--vurgu-yazi)", fontWeight: 900, cursor: "pointer" }}
          >
            {kopyalandi ? "✓ Kopyalandı!" : "📋 WhatsApp / Discord Kopyala"}
          </button>
        </div>
      </section>

      {/* BİRİM SEÇİM PANELİ */}
      <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {KATEGORILER.map((kat) => {
            const secili = kat === aktifKategori;
            return (
              <button
                key={kat}
                type="button"
                onClick={() => setAktifKategori(kat)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 10,
                  border: "1px solid " + (secili ? "var(--vurgu)" : "var(--cizgi)"),
                  background: secili ? "var(--vurgu)" : "var(--bg)",
                  color: secili ? "var(--vurgu-yazi)" : "var(--fg)",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {kat}
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))", gap: 11 }}>
          {BIRIMLER.filter((b) => b.kategori === aktifKategori).map((b) => {
            const adet = secimler[b.id] ?? 0;
            const sigarMi =
              b.kategori === "Büyü"
                ? kullanilanBuyu + b.kapasite <= limit.buyu
                : kullanilanKamp + b.kapasite <= limit.kamp;

            return (
              <div
                key={b.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 13,
                  background: "var(--bg)",
                  border: "1px solid " + (adet > 0 ? "var(--vurgu)" : "var(--cizgi)"),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.ikon} {b.ad}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.68 }}>
                    {b.kapasite} yer {adet > 0 ? `· Toplam ${adet * b.kapasite}` : ""}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    disabled={adet === 0}
                    onClick={() => degistir(b, -1)}
                    style={{ width: 30, height: 30, minHeight: 30, borderRadius: 8, border: "1px solid var(--cizgi)", background: "var(--kart)", color: "var(--fg)", fontWeight: 900, cursor: "pointer" }}
                  >
                    −
                  </button>
                  <strong style={{ minWidth: 18, textAlign: "center", fontSize: 14 }}>{adet}</strong>
                  <button
                    type="button"
                    disabled={!sigarMi}
                    onClick={() => degistir(b, 1)}
                    style={{ width: 30, height: 30, minHeight: 30, borderRadius: 8, border: 0, background: "var(--vurgu)", color: "var(--vurgu-yazi)", fontWeight: 900, cursor: "pointer" }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* KAYITLI ORDULARIM */}
      {kayitlar.length > 0 && (
        <section style={{ padding: 24, background: "var(--kart)", border: "1px solid var(--cizgi)", borderRadius: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 className="baslik-serit" style={{ margin: 0, fontSize: 18 }}>
            <span>💾 Kayıtlı Ordularım ({kayitlar.length})</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
            {kayitlar.map((k) => (
              <div key={k.id} style={{ padding: 15, borderRadius: 13, background: "var(--bg)", border: "1px solid var(--cizgi)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>{k.ad}</strong>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--vurgu)" }}>BB {k.bb}</span>
                </div>
                <div style={{ fontSize: 12.5, opacity: 0.78 }}>🚜 {k.kusatma}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setBb(k.bb);
                      setSecimler(k.secimler);
                      setKusatma(k.kusatma);
                      setOrduAdi(k.ad);
                    }}
                    style={{ flex: 1, padding: "7px 12px", minHeight: 34, borderRadius: 9, border: 0, background: "var(--vurgu)", color: "var(--vurgu-yazi)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    Yükle
                  </button>
                  <button
                    type="button"
                    onClick={() => kayitSil(k.id)}
                    style={{ padding: "7px 12px", minHeight: 34, borderRadius: 9, border: "1px solid #ef4444", background: "rgba(239,68,68,0.12)", color: "#ef6b5f", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
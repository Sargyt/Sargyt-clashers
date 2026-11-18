"use client";
import { useEffect, useState, type FormEvent } from "react";

type Ordu = {
  id?: string;
  ad: string;
  thMin: number;
  thMax: number;
  tur: "Yer" | "Hava" | "Karma";
  zorluk: "Kolay" | "Orta" | "İleri";
  birlikler: string;
  buyuler: string;
  kusatma: string;
  ozet: string;
  oyunLinki?: string;
  sargytOzel?: boolean;
  kullaniciOrdusu?: boolean;
};

const ORDULAR: Ordu[] = [
  {
    ad: "Mızrakçı + Şifacı (Sargyt İmza Ordusu)",
    thMin: 16,
    thMax: 17,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "12 Mızrakçı, 5 Şifacı, 2 Buz Golem, 3 Süper Duvar Yıkıcı, 2 Bebek Ejderha",
    buyuler: "3 Öfke, 2 İskelet, 2 Dondurma, 1 Zehir",
    kusatma: "Uçan Kışla",
    ozet: "Sargyt'ın özel turnuva ve klan savaşı taktiği: İki kanat Bebek Ejderha ve Uçan Kışla ile temizlendikten sonra Mızrakçılar duvar arkasındaki kritik savunmaları güvenli mesafeden eritir.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u12x123-5x7-2x58-3x28-2x23s3x2-2x17-2x5-1x9",
    sargytOzel: true,
  },
  {
    ad: "Orman Binicisi & Valkyrie Ezme (Root Rider Smash)",
    thMin: 15,
    thMax: 17,
    tur: "Yer",
    zorluk: "Kolay",
    birlikler: "6 Orman Binicisi, 10 Valkyrie, 3 Buz Golem, 2 Çırak Koruyucu",
    buyuler: "3 Sarmaşık, 2 Öfke, 1 Dondurma, 1 Zehir",
    kusatma: "Uçan Kışla veya Tomruk Fırlatıcı",
    ozet: "Güncel metanın en istikrarlı 3 yıldız yer ordusu. Sarmaşık Büyüsü ile savunma koridoru daraltılır, Orman Binicileri duvarları yararken Valkyrie'ler merkezi temizler.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u6x110-10x12-3x58-2x97s3x70-2x2-1x5-1x9",
    sargytOzel: true,
  },
  {
    ad: "Süper Okçu Zeplin + Ejderha (Super Archer Blimp)",
    thMin: 13,
    thMax: 17,
    tur: "Hava",
    zorluk: "İleri",
    birlikler: "10 Ejderha, 8 Balon, 1 Bebek Ejderha (Klan Kalesi: 3 Süper Okçu)",
    buyuler: "2 Klon, 1 Öfke, 5 Görünmezlik",
    kusatma: "Zeplin",
    ozet: "Büyük Koruyucu yeteneğiyle merkeze indirilen Zeplin içindeki Süper Okçular Görünmezlik ve Klon ile köyün %40'ını tek başına yok eder.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u10x8-8x5-1x23s2x16-1x2-5x35",
  },
  {
    ad: "Büyük Koruyucu Ateş Topu + Süper Cadı",
    thMin: 15,
    thMax: 17,
    tur: "Yer",
    zorluk: "Orta",
    birlikler: "4 Süper Cadı, 5 Şifacı, 2 Buz Golem, 3 Süper Duvar Yıkıcı",
    buyuler: "3 Öfke, 2 Dondurma, 2 Görünmezlik, 1 Zehir",
    kusatma: "Alev Atıcı",
    ozet: "Büyük Koruyucu'nun Ateş Topu ekipmanı ile en yoğun savunma öbeği patlatılır, Süper Cadılar Koca İskeletlerle birlikte merkeze yürür.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u4x66-5x7-2x58-3x28s3x2-2x5-2x35-1x9",
  },
  {
    ad: "Kraliçe Yürüyüşü Hibrit (QC Hybrid)",
    thMin: 13,
    thMax: 15,
    tur: "Yer",
    zorluk: "İleri",
    birlikler: "5 Şifacı, 14 Madenci, 12 Domuz Binici, 2 Bebek Ejderha, 3 Süper Duvar Yıkıcı",
    buyuler: "3 İyileştirme, 2 Öfke, 2 Dondurma, 1 Zehir",
    kusatma: "Uçan Kışla",
    ozet: "Okçu Kraliçe haritanın bir kanadını ve Klan Kalesini temizlerken Madenci ve Domuz Biniciler L şeklinde koridor boyunca ilerler.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u5x7-14x24-12x11-2x23-3x28s3x1-2x2-2x5-1x9",
  },
  {
    ad: "Yıldırım Ejderha & Balon (Zap Dragons)",
    thMin: 13,
    thMax: 16,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "12 Ejderha, 12 Balon, 1 Ejderha Binici",
    buyuler: "6 Yıldırım, 2 Deprem, 1 Öfke, 1 Dondurma",
    kusatma: "Kaya Balonu veya Zeplin",
    ozet: "Hava Savunmaları ve Tekli Cehennem Kuleleri Yıldırım/Deprem ile indirilir, ardından Ejderhalar tek hat üzerinden salınır.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u12x8-12x5-1x65s6x0-2x10-1x2-1x5",
  },
  {
    ad: "Elektro Ejderha & Öfke Balon (E-Drag Spam)",
    thMin: 13,
    thMax: 16,
    tur: "Hava",
    zorluk: "Kolay",
    birlikler: "8 Elektro Ejderha, 14 Balon, 1 Bebek Ejderha",
    buyuler: "3 Öfke, 5 Dondurma",
    kusatma: "Kaya Balonu veya Zeplin",
    ozet: "Binaların birbirine bitişik dizildiği sıkışık köy düzenlerine karşı zincirleme yıldırım hasarıyla yüksek 3 yıldız şansı sunar.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u8x59-14x5-1x23s3x2-5x5",
  },
  {
    ad: "Yeti & Süper Atıcı Ezme (Yeti Smash)",
    thMin: 13,
    thMax: 15,
    tur: "Karma",
    zorluk: "Orta",
    birlikler: "4 Yeti, 4 Süper Atıcı, 4 Şifacı, 2 Buz Golem",
    buyuler: "3 Öfke, 1 Atlama, 2 Dondurma, 1 Zehir",
    kusatma: "Tomruk Fırlatıcı",
    ozet: "Tomruk Fırlatıcı ve Atlama büyüsü ile merkeze açılan koridordan Yeti ve Süper Atıcılar çift seken kayalarla tüm merkezi eritir.",
    oyunLinki: "https://link.clashofclans.com/tr?action=CopyArmy&army=u4x53-4x80-4x7-2x58s3x2-1x3-2x5-1x9",
  },
];

const TH_FILTRELER = ["Tümü", "13", "14", "15", "16", "17"];
const TUR_FILTRELER = ["Tümü", "Yer", "Hava", "Karma"];

export default function Ordular() {
  const [th, setTh] = useState("Tümü");
  const [tur, setTur] = useState("Tümü");
  const [sadeceSargyt, setSadeceSargyt] = useState(false);
  const [kopyalanan, setKopyalanan] = useState("");

  // Özel Ordu Oluşturucu State'leri
  const [ozelOrdular, setOzelOrdular] = useState<Ordu[]>([]);
  const [formAcik, setFormAcik] = useState(false);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniTh, setYeniTh] = useState("16");
  const [yeniTur, setYeniTur] = useState<"Yer" | "Hava" | "Karma">("Yer");
  const [yeniZorluk, setYeniZorluk] = useState<"Kolay" | "Orta" | "İleri">("Orta");
  const [yeniBirlikler, setYeniBirlikler] = useState("");
  const [yeniBuyuler, setYeniBuyuler] = useState("");
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
    setYeniKusatma("");
    setYeniOzet("");
    setYeniLink("");
    setFormAcik(false);
  }

  function ozelOrduSil(id?: string) {
    if (!id) return;
    const guncel = ozelOrdular.filter((o) => o.id !== id);
    setOzelOrdular(guncel);
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
    const metin = `⚔️ ${o.ad} (BB${o.thMin}${o.thMax !== o.thMin ? "-BB" + o.thMax : ""})\n• Birlikler: ${o.birlikler}\n• Büyüler: ${o.buyuler}\n• Kuşatma: ${o.kusatma}${o.oyunLinki ? `\n• Oyuna Aktar: ${o.oyunLinki}` : ""}`;
    navigator.clipboard.writeText(metin);
    setKopyalanan(o.ad);
    setTimeout(() => setKopyalanan(""), 2000);
  }

  return (
    <main style={{ padding: "36px 32px", maxWidth: 1360, width: "100%", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 8px" }}>
            ⚔️ Meta Ordular & Sargyt Özel Taktikler
          </h1>
          <p style={{ opacity: 0.75, margin: 0, fontSize: 16 }}>
            Belediye Binası seviyene göre kanıtlanmış orduları tek tıkla oyuna aktar veya kendi özel ordunu oluştur.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormAcik(!formAcik)}
          style={{
            padding: "13px 22px",
            borderRadius: 12,
            border: 0,
            background: formAcik ? "var(--kart)" : "var(--vurgu)",
            color: formAcik ? "var(--fg)" : "#111",
            fontWeight: 800,
            fontSize: 15,
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
            padding: 24,
            marginBottom: 24,
            background: "var(--kart)",
            border: "2px solid var(--vurgu)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <strong style={{ fontSize: 19 }}>🛠️ Yeni Özel Ordu Oluştur</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input
              required
              value={yeniAd}
              onChange={(e) => setYeniAd(e.target.value)}
              placeholder="Ordu Adı (örn. Süper Atıcı Kraliçe)"
              style={{
                padding: 12,
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
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            >
              {["13", "14", "15", "16", "17"].map((seviye) => (
                <option key={seviye} value={seviye}>
                  Belediye Binası {seviye}
                </option>
              ))}
            </select>
            <select
              value={yeniTur}
              onChange={(e) => setYeniTur(e.target.value as "Yer" | "Hava" | "Karma")}
              style={{
                padding: 12,
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
                padding: 12,
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            <input
              required
              value={yeniBirlikler}
              onChange={(e) => setYeniBirlikler(e.target.value)}
              placeholder="Birlikler (örn. 6 Orman Binicisi, 8 Valkyrie...)"
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
            <input
              value={yeniBuyuler}
              onChange={(e) => setYeniBuyuler(e.target.value)}
              placeholder="Büyüler (örn. 3 Öfke, 2 Dondurma...)"
              style={{
                padding: 12,
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
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
              }}
            />
          </div>

          <input
            value={yeniLink}
            onChange={(e) => setYeniLink(e.target.value)}
            placeholder="Oyundan Kopyalanan Ordu Linki (İsteğe bağlı: https://link.clashofclans.com/...)"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
            }}
          />

          <textarea
            value={yeniOzet}
            onChange={(e) => setYeniOzet(e.target.value)}
            placeholder="Saldırı taktiği ve uygulama ipuçları..."
            rows={2}
            style={{
              padding: 12,
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
                padding: "12px 24px",
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
          gap: 14,
          marginBottom: 24,
          padding: "18px 22px",
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.85, marginRight: 4 }}>🏰 Belediye:</span>
          {TH_FILTRELER.map((f) => (
            <button
              key={f}
              onClick={() => setTh(f)}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                border: "1px solid " + (th === f ? "var(--vurgu)" : "var(--cizgi)"),
                background: th === f ? "var(--vurgu)" : "var(--bg)",
                color: th === f ? "#111" : "var(--fg)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {f === "Tümü" ? "Tümü" : "BB " + f}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.85, marginRight: 4 }}>🎯 Tür:</span>
          {TUR_FILTRELER.map((t) => (
            <button
              key={t}
              onClick={() => setTur(t)}
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                border: "1px solid " + (tur === t ? "var(--vurgu)" : "var(--cizgi)"),
                background: tur === t ? "var(--vurgu)" : "var(--bg)",
                color: tur === t ? "#111" : "var(--fg)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          ))}

          <button
            onClick={() => setSadeceSargyt(!sadeceSargyt)}
            style={{
              marginLeft: 8,
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid " + (sadeceSargyt ? "#f59e0b" : "var(--cizgi)"),
              background: sadeceSargyt ? "#f59e0b" : "var(--bg)",
              color: sadeceSargyt ? "#111" : "var(--fg)",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            👑 Sadece Sargyt Özel
          </button>
        </div>
      </div>

      <p style={{ opacity: 0.75, fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
        {liste.length} ordu listeleniyor
      </p>

      {/* Geniş Ekran 2 Sütunlu Ordu Kartları */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(560px, 1fr))",
          gap: 18,
        }}
      >
        {liste.map((o) => (
          <div
            key={o.id ?? o.ad}
            style={{
              padding: 22,
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
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <strong style={{ fontSize: 20 }}>{o.ad}</strong>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 13,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      fontWeight: 700,
                    }}
                  >
                    {o.thMin === o.thMax ? `BB ${o.thMin}` : `BB ${o.thMin}–${o.thMax}`} · {o.tur}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--cizgi)",
                      fontWeight: 600,
                    }}
                  >
                    Zorluk: {o.zorluk}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: 14,
                  borderRadius: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--cizgi)",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                <div>
                  <strong>⚔️ Birlikler:</strong> {o.birlikler}
                </div>
                <div>
                  <strong>⚡ Büyüler:</strong> {o.buyuler}
                </div>
                <div>
                  <strong>🚜 Kuşatma:</strong> {o.kusatma}
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 14, opacity: 0.85, lineHeight: 1.55 }}>{o.ozet}</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                borderTop: "1px solid var(--cizgi)",
                paddingTop: 12,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: o.sargytOzel ? "#f59e0b" : o.kullaniciOrdusu ? "#22c55e" : "var(--vurgu)",
                  color: "#111",
                  fontWeight: 800,
                }}
              >
                {o.sargytOzel ? "👑 Sargyt Özel Taktik" : o.kullaniciOrdusu ? "🛠️ Özel Ordu" : "✓ Meta Doğrulandı"}
              </span>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {o.kullaniciOrdusu && (
                  <button
                    type="button"
                    onClick={() => ozelOrduSil(o.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #ef6b5f",
                      background: "transparent",
                      color: "#ef6b5f",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Sil
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => orduKopyala(o)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--cizgi)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {kopyalanan === o.ad ? "✅ Kopyalandı!" : "📋 Metni Kopyala"}
                </button>

                {o.oyunLinki && (
                  <a
                    href={o.oyunLinki}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: "var(--vurgu)",
                      color: "#111",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    🎮 Oyuna Aktar ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
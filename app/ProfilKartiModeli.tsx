"use client";
import { useRef, useState } from "react";

export type ProfilKartVerisi = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  lig?: string | null;
  genelOrtalama: number;
  kahramanOrt: number;
  ekipmanOrt: number;
  birlikOrt: number;
  buyuOrt: number;
  hayvanOrt: number;
  takimKislasiSv: number;
};

type KartTemasi = {
  id: string;
  ad: string;
  ikon: string;
  ustRenk: string;
  ortaRenk: string;
  altRenk: string;
  cerceve: string;
  vurgu: string;
  yazi: string;
  altYazi: string;
  kutuBg: string;
};

const KART_TEMALARI: KartTemasi[] = [
  {
    id: "altin",
    ad: "Efsane Altın",
    ikon: "👑",
    ustRenk: "#422d08",
    ortaRenk: "#231705",
    altRenk: "#120b02",
    cerceve: "#f5c542",
    vurgu: "#ffd966",
    yazi: "#fff8e7",
    altYazi: "#e6c875",
    kutuBg: "rgba(245, 197, 66, 0.12)",
  },
  {
    id: "elmas",
    ad: "Şampiyon Elmas",
    ikon: "💎",
    ustRenk: "#0b3b59",
    ortaRenk: "#071f33",
    altRenk: "#04101c",
    cerceve: "#38bdf8",
    vurgu: "#7dd3fc",
    yazi: "#f0f9ff",
    altYazi: "#93c5fd",
    kutuBg: "rgba(56, 189, 248, 0.13)",
  },
  {
    id: "mor",
    ad: "Hiçlik Moru",
    ikon: "🔮",
    ustRenk: "#381259",
    ortaRenk: "#1e0933",
    altRenk: "#0e041a",
    cerceve: "#c084fc",
    vurgu: "#e879f9",
    yazi: "#faf5ff",
    altYazi: "#d8b4fe",
    kutuBg: "rgba(192, 132, 252, 0.13)",
  },
  {
    id: "yakut",
    ad: "Kızıl Yakut",
    ikon: "🔥",
    ustRenk: "#571019",
    ortaRenk: "#2e070c",
    altRenk: "#170306",
    cerceve: "#f87171",
    vurgu: "#fca5a5",
    yazi: "#fef2f2",
    altYazi: "#fecaca",
    kutuBg: "rgba(248, 113, 113, 0.13)",
  },
  {
    id: "zumrut",
    ad: "Zümrüt İksir",
    ikon: "🌿",
    ustRenk: "#0b4229",
    ortaRenk: "#062416",
    altRenk: "#03120b",
    cerceve: "#34d399",
    vurgu: "#6ee7b7",
    yazi: "#ecfdf5",
    altYazi: "#a7f3d0",
    kutuBg: "rgba(52, 211, 153, 0.13)",
  },
];

function yuvarlakDikdortgen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function kalkanYolu(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x + 42, y);
  ctx.lineTo(x + w - 42, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + 42);
  ctx.lineTo(x + w, y + h * 0.72);
  ctx.quadraticCurveTo(x + w, y + h * 0.87, x + w * 0.5, y + h);
  ctx.quadraticCurveTo(x, y + h * 0.87, x, y + h * 0.72);
  ctx.lineTo(x, y + 42);
  ctx.quadraticCurveTo(x, y, x + 42, y);
  ctx.closePath();
}

export default function ProfilKartiModali({
  veri,
  onKapat,
}: {
  veri: ProfilKartVerisi;
  onKapat: () => void;
}) {
  const [seciliTema, setSeciliTema] = useState<KartTemasi>(KART_TEMALARI[0]);
  const [onizlemeTema, setOnizlemeTema] = useState<KartTemasi | null>(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [indiriliyor, setIndiriliyor] = useState(false);
  const [bbGorselHata, setBbGorselHata] = useState(false);
  const bbImgRef = useRef<HTMLImageElement | null>(null);

  const aktifTema = onizlemeTema ?? seciliTema;

  const istatistikler = [
    { kod: "KAH", deger: veri.kahramanOrt, aciklama: "Kahraman" },
    { kod: "EKP", deger: veri.ekipmanOrt, aciklama: "Ekipman" },
    { kod: "BRL", deger: veri.birlikOrt, aciklama: "Birlik" },
    { kod: "BÜY", deger: veri.buyuOrt, aciklama: "Büyü" },
    { kod: "HAY", deger: veri.hayvanOrt, aciklama: "Hayvan" },
    { kod: "TKM", deger: veri.takimKislasiSv, aciklama: "Takım Kışlası" },
  ];

  async function kartiPngIndir() {
    setIndiriliyor(true);
    try {
      const W = 760;
      const H = 1040;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Arka plan koyu sahne
      ctx.fillStyle = "#09090d";
      ctx.fillRect(0, 0, W, H);

      // Kalkan çerçevesi
      const pad = 28;
      const cw = W - pad * 2;
      const ch = H - pad * 2;

      ctx.save();
      kalkanYolu(ctx, pad, pad, cw, ch);
      const grad = ctx.createLinearGradient(0, pad, 0, pad + ch);
      grad.addColorStop(0, aktifTema.ustRenk);
      grad.addColorStop(0.55, aktifTema.ortaRenk);
      grad.addColorStop(1, aktifTema.altRenk);
      ctx.fillStyle = grad;
      ctx.fill();

      // Çapraz egzotik ışık çizgileri
      ctx.clip();
      ctx.strokeStyle = aktifTema.kutuBg;
      ctx.lineWidth = 36;
      for (let i = -H; i < W + H; i += 110) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - 260, H);
        ctx.stroke();
      }
      ctx.restore();

      // Dış altın/tema kenarlık
      ctx.save();
      kalkanYolu(ctx, pad, pad, cw, ch);
      ctx.lineWidth = 8;
      ctx.strokeStyle = aktifTema.cerceve;
      ctx.stroke();

      kalkanYolu(ctx, pad + 14, pad + 14, cw - 28, ch - 28);
      ctx.lineWidth = 2;
      ctx.strokeStyle = aktifTema.vurgu;
      ctx.stroke();
      ctx.restore();

      // Üst marka şeridi
      ctx.fillStyle = aktifTema.altYazi;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("SARGYT CLASHERS", W - 76, 88);

      // Sol Üst: BB Görseli + Yanında Genel Ortalama (% işareti olmadan)
      const bbKutuX = 76;
      const bbKutuY = 112;
      const bbKutuBoy = 148;
      yuvarlakDikdortgen(ctx, bbKutuX, bbKutuY, bbKutuBoy, bbKutuBoy, 24);
      ctx.fillStyle = aktifTema.kutuBg;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = aktifTema.cerceve;
      ctx.stroke();

      const img = bbImgRef.current;
      if (img && img.complete && img.naturalWidth > 0 && !bbGorselHata) {
        ctx.drawImage(img, bbKutuX + 14, bbKutuY + 14, bbKutuBoy - 28, bbKutuBoy - 28);
      } else {
        ctx.fillStyle = aktifTema.vurgu;
        ctx.font = "900 36px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`BB ${veri.thSeviyesi}`, bbKutuX + bbKutuBoy / 2, bbKutuY + 86);
      }

      // BB görselinin hemen yanında Genel Ortalama
      ctx.textAlign = "left";
      ctx.fillStyle = aktifTema.vurgu;
      ctx.font = "900 104px system-ui, -apple-system, sans-serif";
      ctx.fillText(String(veri.genelOrtalama), bbKutuX + bbKutuBoy + 28, bbKutuY + 96);

      ctx.fillStyle = aktifTema.altYazi;
      ctx.font = "800 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(`BB ${veri.thSeviyesi} · GENEL ORTALAMA`, bbKutuX + bbKutuBoy + 32, bbKutuY + 134);

      // Sağ Üst Kupa Rozeti
      yuvarlakDikdortgen(ctx, W - 245, 118, 168, 72, 18);
      ctx.fillStyle = aktifTema.kutuBg;
      ctx.fill();
      ctx.strokeStyle = aktifTema.cerceve;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = aktifTema.yazi;
      ctx.font = "900 26px system-ui, sans-serif";
      ctx.fillText(`🏆 ${veri.kupa}`, W - 161, 156);
      ctx.fillStyle = aktifTema.altYazi;
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.fillText((veri.lig ?? "Efsane Ligi").slice(0, 18), W - 161, 178);

      // Orta Ayırıcı Çizgi
      ctx.strokeStyle = aktifTema.cerceve;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(76, 305);
      ctx.lineTo(W - 76, 305);
      ctx.stroke();

      // Oyuncu İsmi, Kod ve Klan
      ctx.textAlign = "center";
      ctx.fillStyle = aktifTema.yazi;
      ctx.font = "900 54px system-ui, -apple-system, sans-serif";
      ctx.fillText(veri.isim.slice(0, 18), W / 2, 376);

      ctx.fillStyle = aktifTema.vurgu;
      ctx.font = "800 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(veri.kod, W / 2, 416);

      ctx.fillStyle = aktifTema.altYazi;
      ctx.font = "700 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(`🛡️ ${veri.klan ?? "Bağımsız Savaşçı"}`, W / 2, 456);

      // Alt 6'lı İstatistik Kartları (2 sütun x 3 satır)
      const gridX = 86;
      const gridY = 500;
      const gap = 18;
      const boxW = (W - gridX * 2 - gap) / 2;
      const boxH = 104;

      istatistikler.forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const bx = gridX + col * (boxW + gap);
        const by = gridY + row * (boxH + gap);

        yuvarlakDikdortgen(ctx, bx, by, boxW, boxH, 18);
        ctx.fillStyle = aktifTema.kutuBg;
        ctx.fill();
        ctx.strokeStyle = aktifTema.cerceve;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.fillStyle = aktifTema.vurgu;
        ctx.font = "900 38px system-ui, -apple-system, sans-serif";
        ctx.fillText(String(st.deger), bx + 24, by + 64);

        ctx.fillStyle = aktifTema.yazi;
        ctx.font = "900 28px system-ui, -apple-system, sans-serif";
        ctx.fillText(st.kod, bx + 112, by + 56);

        ctx.fillStyle = aktifTema.altYazi;
        ctx.font = "700 16px system-ui, -apple-system, sans-serif";
        ctx.fillText(st.aciklama, bx + 112, by + 80);
      });

      // En Alt Kalkan Ucu Yazısı
      ctx.textAlign = "center";
      ctx.fillStyle = aktifTema.altYazi;
      ctx.font = "800 18px system-ui, sans-serif";
      ctx.fillText("sargyt-clashers.vercel.app", W / 2, H - 72);

      const link = document.createElement("a");
      const temizKod = veri.kod.replace(/[^A-Z0-9]/gi, "");
      link.download = `sargyt-kart-${temizKod || "oyuncu"}-${aktifTema.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIndiriliyor(false);
    }
  }

  return (
    <div
      onClick={onKapat}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.86)",
        zIndex: 70,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          width: "100%",
          maxHeight: "95vh",
          overflowY: "auto",
          background: "var(--kart)",
          border: "1.5px solid var(--vurgu)",
          borderRadius: 20,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Üst Başlık & Kapat */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <strong style={{ fontSize: 18 }}>🎴 Epik Oyuncu Profil Kartı</strong>
            <div style={{ fontSize: 12, opacity: 0.72 }}>
              Renk seçeneklerinin üzerine gelerek anlık önizle, seç ve PNG indir
            </div>
          </div>
          <button
            type="button"
            onClick={onKapat}
            style={{
              padding: "6px 12px",
              borderRadius: 9,
              border: "1px solid var(--cizgi)",
              background: "var(--bg)",
              color: "var(--fg)",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* ÖZEL AÇILIR TEMA SEÇİCİ (ÜZERİNE GELİNCE ANLIK ÖNİZLEME + İNDİRME) */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", position: "relative" }}>
          <div style={{ flex: "1 1 220px", position: "relative" }}>
            <button
              type="button"
              onClick={() => setMenuAcik((prev) => !prev)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 11,
                border: "1.5px solid var(--vurgu)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {aktifTema.ikon} Tema: {aktifTema.ad}
              </span>
              <span>{menuAcik ? "▲" : "▼"}</span>
            </button>

            {menuAcik && (
              <div
                onMouseLeave={() => setOnizlemeTema(null)}
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  background: "var(--kart)",
                  border: "1.5px solid var(--vurgu)",
                  borderRadius: 12,
                  padding: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.55)",
                }}
              >
                {KART_TEMALARI.map((t) => {
                  const secili = t.id === seciliTema.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onMouseEnter={() => setOnizlemeTema(t)}
                      onFocus={() => setOnizlemeTema(t)}
                      onClick={() => {
                        setSeciliTema(t);
                        setOnizlemeTema(null);
                        setMenuAcik(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: 9,
                        border: secili ? `1px solid ${t.cerceve}` : "1px solid transparent",
                        background: secili ? t.kutuBg : "transparent",
                        color: "var(--fg)",
                        fontWeight: 800,
                        fontSize: 13.5,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: t.cerceve,
                            display: "inline-block",
                          }}
                        />
                        <span>
                          {t.ikon} {t.ad}
                        </span>
                      </span>
                      {secili && <span style={{ fontSize: 12, color: t.vurgu }}>✓ Seçili</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={indiriliyor}
            onClick={kartiPngIndir}
            style={{
              padding: "10px 18px",
              borderRadius: 11,
              border: 0,
              background: "var(--vurgu)",
              color: "var(--vurgu-yazi)",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {indiriliyor ? "Hazırlanıyor..." : "💾 PNG İndir"}
          </button>
        </div>

        {/* FIFA FUT TARZI CANLI KART ÖNİZLEMESİ */}
        <div
          style={{
            position: "relative",
            borderRadius: "24px 24px 96px 96px",
            padding: 20,
            background: `linear-gradient(165deg, ${aktifTema.ustRenk} 0%, ${aktifTema.ortaRenk} 55%, ${aktifTema.altRenk} 100%)`,
            border: `3px solid ${aktifTema.cerceve}`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.6), inset 0 0 0 2px ${aktifTema.vurgu}44`,
            color: aktifTema.yazi,
            transition: "all 0.18s ease",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Üst Satır: Sol Üstte BB Görseli + Yanında Genel Ortalama */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 16,
                  background: aktifTema.kutuBg,
                  border: `1.5px solid ${aktifTema.cerceve}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 6,
                  flexShrink: 0,
                }}
              >
                {bbGorselHata ? (
                  <strong style={{ fontSize: 18, color: aktifTema.vurgu }}>BB {veri.thSeviyesi}</strong>
                ) : (
                  <img
                    ref={bbImgRef}
                    src={`/birimler/th${veri.thSeviyesi}.png`}
                    alt={`BB ${veri.thSeviyesi}`}
                    width={64}
                    height={64}
                    onError={() => setBbGorselHata(true)}
                    style={{ objectFit: "contain" }}
                  />
                )}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 950,
                    lineHeight: 0.95,
                    color: aktifTema.vurgu,
                    letterSpacing: "-1.5px",
                  }}
                >
                  {veri.genelOrtalama}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: aktifTema.altYazi, marginTop: 4 }}>
                  BB {veri.thSeviyesi} · GENEL ORT.
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                background: aktifTema.kutuBg,
                border: `1px solid ${aktifTema.cerceve}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 900 }}>🏆 {veri.kupa}</div>
              <div style={{ fontSize: 11, color: aktifTema.altYazi, fontWeight: 700 }}>
                {veri.lig ?? "Efsane Ligi"}
              </div>
            </div>
          </div>

          {/* Orta Kısım: İsim, Kod ve Klan */}
          <div
            style={{
              textAlign: "center",
              padding: "10px 0",
              borderTop: `1px solid ${aktifTema.cerceve}66`,
              borderBottom: `1px solid ${aktifTema.cerceve}66`,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: "-0.4px" }}>{veri.isim}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: aktifTema.vurgu, marginTop: 2 }}>
              {veri.kod}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: aktifTema.altYazi, marginTop: 3 }}>
              🛡️ {veri.klan ?? "Bağımsız Savaşçı"}
            </div>
          </div>

          {/* Alt Kısım: 6'lı FUT Tarzı Kısaltma İstatistikleri */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {istatistikler.map((st) => (
              <div
                key={st.kod}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: aktifTema.kutuBg,
                  border: `1px solid ${aktifTema.cerceve}88`,
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 950, color: aktifTema.vurgu, minWidth: 38 }}>
                  {st.deger}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.1 }}>{st.kod}</div>
                  <div style={{ fontSize: 10.5, color: aktifTema.altYazi, fontWeight: 700 }}>{st.aciklama}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 800, color: aktifTema.altYazi, opacity: 0.85, paddingBottom: 6 }}>
            ⚔️ SARGYT CLASHERS
          </div>
        </div>
      </div>
    </div>
  );
}
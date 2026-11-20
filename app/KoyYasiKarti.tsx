"use client";
import { useEffect, useState } from "react";
import { ligTr } from "./isimler";

const ALFABE = "0289PYLQGRJCUV";

export type KoyYasiOyuncu = {
  kod: string;
  isim: string;
  thSeviyesi: number;
  kupa: number;
  klan: string | null;
  lig?: string | null;
};

const BB_TARIHCESI = [
  { th: 9, yil: 2012 },
  { th: 10, yil: 2013 },
  { th: 11, yil: 2015 },
  { th: 12, yil: 2018 },
  { th: 13, yil: 2019 },
  { th: 14, yil: 2021 },
  { th: 15, yil: 2022 },
  { th: 16, yil: 2023 },
  { th: 17, yil: 2024 },
  { th: 18, yil: 2025 },
  { th: 19, yil: 2026 },
];

const YIL_ESIKLERI = [
  { maksLow: 150_000, yil: 2012, aralik: "2012–2013", yuzdelik: 99, maksBb: 9 },
  { maksLow: 550_000, yil: 2013, aralik: "2013–2014", yuzdelik: 97, maksBb: 10 },
  { maksLow: 2_000_000, yil: 2014, aralik: "2014–2015", yuzdelik: 93, maksBb: 10 },
  { maksLow: 5_000_000, yil: 2015, aralik: "2015–2016", yuzdelik: 88, maksBb: 11 },
  { maksLow: 10_000_000, yil: 2016, aralik: "2016–2017", yuzdelik: 81, maksBb: 11 },
  { maksLow: 17_000_000, yil: 2017, aralik: "2017–2018", yuzdelik: 73, maksBb: 11 },
  { maksLow: 26_000_000, yil: 2018, aralik: "2018–2019", yuzdelik: 64, maksBb: 12 },
  { maksLow: 38_000_000, yil: 2019, aralik: "2019–2020", yuzdelik: 55, maksBb: 13 },
  { maksLow: 52_000_000, yil: 2020, aralik: "2020–2021", yuzdelik: 46, maksBb: 13 },
  { maksLow: 70_000_000, yil: 2021, aralik: "2021–2022", yuzdelik: 37, maksBb: 14 },
  { maksLow: 90_000_000, yil: 2022, aralik: "2022–2023", yuzdelik: 28, maksBb: 15 },
  { maksLow: 115_000_000, yil: 2023, aralik: "2023–2024", yuzdelik: 19, maksBb: 16 },
  { maksLow: 145_000_000, yil: 2024, aralik: "2024–2025", yuzdelik: 11, maksBb: 17 },
  { maksLow: 180_000_000, yil: 2025, aralik: "2025–2026", yuzdelik: 5, maksBb: 18 },
];

function koddanYasTahmin(hamKod: string) {
  const temizKod = hamKod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
  let deger = BigInt(0);
  for (const ch of temizKod) {
    const idx = ALFABE.indexOf(ch);
    if (idx === -1) continue;
    deger = deger * BigInt(14) + BigInt(idx);
  }
  const low = Number(deger / BigInt(256));
  const buYil = new Date().getFullYear();

  const eslesen = YIL_ESIKLERI.find((e) => low <= e.maksLow) ?? {
    maksLow: Infinity,
    yil: 2026,
    aralik: "2026",
    yuzdelik: 2,
    maksBb: 19,
  };

  const yaklasikYil = Math.max(1, buYil - eslesen.yil);

  let rozet = "Yeni Nesil Savaşçı";
  let rozetIkon = "⚡";
  let rozetAciklama = "Modern meta ve ekipman çağında oyuna adım attın.";
  if (eslesen.yil <= 2013) {
    rozet = "Kurucu Efsane";
    rozetIkon = "🏛️";
    rozetAciklama = "Clash of Clans'ın ilk yıllarından kalma gerçek bir tarih!";
  } else if (eslesen.yil <= 2016) {
    rozet = "Eski Kurt";
    rozetIkon = "🔥";
    rozetAciklama = "Klan Savaşları'nın ve global sohbetin altın çağını gördün.";
  } else if (eslesen.yil <= 2019) {
    rozet = "Kıdemli Komutan";
    rozetIkon = "⚔️";
    rozetAciklama = "Kuşatma makineleri ve CWL döneminden beri sahadasın.";
  } else if (eslesen.yil <= 2022) {
    rozet = "Deneyimli Şef";
    rozetIkon = "🛡️";
    rozetAciklama = "Hayvanlar ve yeni nesil savunmalarla büyüdün.";
  }

  return {
    baslangicYil: eslesen.yil,
    aralik: eslesen.aralik,
    yaklasikYil,
    yuzdelik: eslesen.yuzdelik,
    rozet: `${rozetIkon} ${rozet}`,
    rozetDuz: rozet,
    rozetAciklama,
    oZamankiMaksBb: eslesen.maksBb,
  };
}

function gorselYukle(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function yuvarlakKutu(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

export default function KoyYasiKarti({
  oyuncu,
  onKapat,
}: {
  oyuncu: KoyYasiOyuncu;
  onKapat: () => void;
}) {
  const [durum, setDurum] = useState("");
  const [hazirlaniyor, setHazirlaniyor] = useState(false);

  const yas = koddanYasTahmin(oyuncu.kod);
  const tanikOlunanBbSayisi = BB_TARIHCESI.filter((b) => b.yil >= yas.baslangicYil).length;

  useEffect(() => {
    function tusDinle(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    window.addEventListener("keydown", tusDinle);
    return () => window.removeEventListener("keydown", tusDinle);
  }, [onKapat]);

  async function gorselOlusturVePaylas(sadeceIndir: boolean) {
    setHazirlaniyor(true);
    setDurum("");
    try {
      const W = 1080;
      const H = 640;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0b1220");
      bg.addColorStop(1, "#111b2e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      yuvarlakKutu(ctx, 28, 28, W - 56, H - 56, 26);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      const thImg = await gorselYukle(`/birimler/th${oyuncu.thSeviyesi}.png`);
      if (thImg) ctx.drawImage(thImg, 60, 56, 76, 76);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "900 32px system-ui, -apple-system, sans-serif";
      ctx.fillText(oyuncu.isim, 152, 92);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 18px system-ui, -apple-system, sans-serif";
      const altBilgi = `${oyuncu.kod} · Belediye ${oyuncu.thSeviyesi}${oyuncu.klan ? " · " + oyuncu.klan : ""}${oyuncu.lig ? " · " + ligTr(oyuncu.lig) : ""}`;
      ctx.fillText(altBilgi, 152, 122);

      yuvarlakKutu(ctx, W - 280, 62, 220, 44, 12);
      ctx.fillStyle = "rgba(56, 189, 248, 0.14)";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#38bdf8";
      ctx.font = "800 18px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(yas.rozetDuz, W - 170, 90);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 22px system-ui, -apple-system, sans-serif";
      ctx.fillText("Tahmini başlangıç dönemi", W / 2, 200);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 96px system-ui, -apple-system, sans-serif";
      ctx.fillText(yas.aralik, W / 2, 298);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "700 23px system-ui, -apple-system, sans-serif";
      ctx.fillText(`Oyunda yaklaşık ${yas.yaklasikYil} yıl · Oyuncuların %${yas.yuzdelik}'inden daha eski`, W / 2, 346);

      const barW = 640;
      const barX = (W - barW) / 2;
      const barY = 374;
      yuvarlakKutu(ctx, barX, barY, barW, 18, 9);
      ctx.fillStyle = "#1e293b";
      ctx.fill();

      yuvarlakKutu(ctx, barX, barY, Math.max(24, (barW * yas.yuzdelik) / 100), 18, 9);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      const cizgiX1 = 80;
      const cizgiX2 = W - 80;
      const cizgiY = 515;
      const adim = (cizgiX2 - cizgiX1) / (BB_TARIHCESI.length - 1);

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cizgiX1, cizgiY);
      ctx.lineTo(cizgiX2, cizgiY);
      ctx.stroke();

      const basIdx = Math.max(0, BB_TARIHCESI.findIndex((b) => b.yil >= yas.baslangicYil));
      ctx.strokeStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(cizgiX1 + basIdx * adim, cizgiY);
      ctx.lineTo(cizgiX2, cizgiY);
      ctx.stroke();

      for (let i = 0; i < BB_TARIHCESI.length; i++) {
        const b = BB_TARIHCESI[i];
        const x = cizgiX1 + i * adim;
        const gordu = b.yil >= yas.baslangicYil;

        const ikon = await gorselYukle(`/birimler/th${b.th}.png`);
        if (ikon) {
          ctx.save();
          ctx.globalAlpha = gordu ? 1 : 0.22;
          ctx.drawImage(ikon, x - 24, cizgiY - 66, 48, 48);
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(x, cizgiY, i === basIdx ? 9 : 5, 0, Math.PI * 2);
        ctx.fillStyle = i === basIdx ? "#ffffff" : gordu ? "#38bdf8" : "#475569";
        ctx.fill();

        ctx.fillStyle = i === basIdx ? "#38bdf8" : gordu ? "#e2e8f0" : "#64748b";
        ctx.font = i === basIdx ? "800 15px system-ui, sans-serif" : "600 14px system-ui, sans-serif";
        ctx.fillText(String(b.yil), x, cizgiY + 28);
      }

      ctx.fillStyle = "#64748b";
      ctx.font = "700 16px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("sargyt-clashers.vercel.app · Sargyt Clashers", W - 56, H - 46);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) return;

      const dosyaAdi = `sargyt-yas-${oyuncu.kod.replace(/^#/, "")}.png`;
      const dosya = new File([blob], dosyaAdi, { type: "image/png" });

      if (!sadeceIndir && navigator.canShare && navigator.canShare({ files: [dosya] })) {
        await navigator.share({
          title: `${oyuncu.isim} · Köy Yaşı (${yas.aralik})`,
          text: `${oyuncu.isim} köyü tahmini ${yas.aralik} döneminden beri Clash of Clans'ta!`,
          files: [dosya],
        });
        setDurum("✓ Paylaşım ekranı açıldı!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = dosyaAdi;
        a.click();
        URL.revokeObjectURL(url);
        setDurum("✓ Görsel PNG olarak indirildi!");
      }
    } catch {
      setDurum("Görsel oluşturulurken bir hata oldu.");
    }
    setHazirlaniyor(false);
  }

  return (
    <div
      onClick={onKapat}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(920px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--kart)",
          border: "1.5px solid var(--vurgu)",
          borderRadius: 22,
          padding: "24px 26px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {/* ÜST BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={`/birimler/th${oyuncu.thSeviyesi}.png`}
              alt={`BB ${oyuncu.thSeviyesi}`}
              width={48}
              height={48}
              style={{ objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>{oyuncu.isim} · Köy Yaşı</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                {oyuncu.kod} · Belediye {oyuncu.thSeviyesi}
                {oyuncu.klan ? ` · ${oyuncu.klan}` : ""}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                background: "var(--bg)",
                border: "1px solid var(--vurgu)",
                color: "var(--vurgu)",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {yas.rozet}
            </span>

            <button
              type="button"
              onClick={onKapat}
              aria-label="Kapat"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 18,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

{/* TAHMİNİ VERİ UYARISI */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.45)",
            color: "#fbbf24",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.45,
          }}
        >
          ⚠️ Bilgilendirme: Resmi Clash of Clans API&apos;si hesap kuruluş tarihini paylaşmadığı için buradaki yıl ve dönem bilgileri köy koduna göre tahmin edilmektedir; bilgiler birebir doğru olmayabilir.
        </div>
        {/* ANA YIL GÖSTERGESİ */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, opacity: 0.72, fontWeight: 600 }}>Tahmini başlangıç dönemi</span>
          <div style={{ fontSize: "clamp(42px, 7vw, 68px)", fontWeight: 900, lineHeight: 1, letterSpacing: "-1px" }}>
            {yas.aralik}
          </div>
          <div style={{ fontSize: 15, opacity: 0.85, fontWeight: 600 }}>
            Oyunda yaklaşık <strong style={{ color: "var(--vurgu)" }}>{yas.yaklasikYil} yıl</strong> · {yas.rozetAciklama}
          </div>

          <div style={{ width: "min(500px, 100%)", marginTop: 8 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 7 }}>
              Oyuncuların <span style={{ color: "var(--vurgu)" }}>%{yas.yuzdelik}&apos;inden</span> daha eski bir hesap
            </div>
            <div style={{ height: 11, background: "var(--bg)", border: "1px solid var(--cizgi)", borderRadius: 12, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: yas.yuzdelik + "%",
                  background: "var(--vurgu)",
                  borderRadius: 12,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
            <button
              type="button"
              disabled={hazirlaniyor}
              onClick={() => gorselOlusturVePaylas(false)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                border: 0,
                background: "var(--vurgu)",
                color: "#111",
                fontSize: 14,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {hazirlaniyor ? "Hazırlanıyor..." : "📤 Görseli Paylaş"}
            </button>

            <button
              type="button"
              disabled={hazirlaniyor}
              onClick={() => gorselOlusturVePaylas(true)}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🖼️ PNG İndir
            </button>
          </div>

          {durum && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--vurgu)" }}>{durum}</span>}
        </div>

        {/* 3 MİNİ İSTATİSTİK */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Başladığında Maksimum</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "var(--vurgu)", marginTop: 3 }}>
              Belediye Binası {yas.oZamankiMaksBb}
            </div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Gördüğün BB Çağları</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "var(--vurgu)", marginTop: 3 }}>
              {tanikOlunanBbSayisi} Büyük Güncelleme
            </div>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--cizgi)" }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Güncel Seviyen</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#22c55e", marginTop: 3 }}>
              Belediye {oyuncu.thSeviyesi} · 🏆 {oyuncu.kupa}
            </div>
          </div>
        </div>

        {/* ZAMAN ÇİZELGESİ */}
        <div style={{ borderTop: "1px solid var(--cizgi)", paddingTop: 18 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, opacity: 0.85, marginBottom: 14, textAlign: "center" }}>
            🏰 Başlangıcından Bugüne Clash of Clans Belediye Binası Tarihçesi
          </div>

          <div style={{ overflowX: "auto", paddingBottom: 6 }}>
            <div
              style={{
                minWidth: 700,
                display: "grid",
                gridTemplateColumns: `repeat(${BB_TARIHCESI.length}, 1fr)`,
                gap: 6,
                alignItems: "end",
              }}
            >
              {BB_TARIHCESI.map((b) => {
                const gordu = b.yil >= yas.baslangicYil;
                const baslangicNoktasi = b.yil === yas.baslangicYil;
                return (
                  <div
                    key={b.th}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      opacity: gordu ? 1 : 0.25,
                    }}
                  >
                    <img
                      src={`/birimler/th${b.th}.png`}
                      alt={`BB ${b.th}`}
                      width={42}
                      height={42}
                      style={{ objectFit: "contain", filter: gordu ? "none" : "grayscale(100%)" }}
                    />
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        borderRadius: 6,
                        background: gordu ? "var(--vurgu)" : "var(--cizgi)",
                        position: "relative",
                      }}
                    >
                      {baslangicNoktasi && (
                        <span
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 13,
                            height: 13,
                            borderRadius: "50%",
                            background: "#fff",
                            border: "3px solid var(--vurgu)",
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: baslangicNoktasi ? 900 : 600, color: baslangicNoktasi ? "var(--vurgu)" : "inherit" }}>
                      {b.yil}
                    </span>
                    <span style={{ fontSize: 10.5, opacity: 0.7 }}>BB {b.th}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{ margin: "10px 0 0", fontSize: 11.5, opacity: 0.6, textAlign: "center" }}>
            * Tahmin, oyuncu kodu sıralama algoritmasına dayanır; resmi API kesin kuruluş tarihini paylaşmadığı için ±1 yıl sapma olabilir.
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";

type EtkinlikDurum = {
  baslik: string;
  ikon: string;
  aktif: boolean;
  durumMetni: string;
  etiket: string;
  kalanMs: number;
  yuzde: number;
  altBilgi: string;
};

const AYLAR_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function sureBicimle(ms: number): string {
  if (ms <= 0) return "0dk 0sn";
  const toplamSn = Math.floor(ms / 1000);
  const gun = Math.floor(toplamSn / 86400);
  const saat = Math.floor((toplamSn % 86400) / 3600);
  const dk = Math.floor((toplamSn % 3600) / 60);
  const sn = toplamSn % 60;
  return gun > 0 ? `${gun}g ${saat}sa ${dk}dk ${sn}sn` : `${saat}sa ${dk}dk ${sn}sn`;
}

function etkinlikleriHesapla(simdiMs: number): EtkinlikDurum[] {
  const simdi = new Date(simdiMs);
  const yil = simdi.getUTCFullYear();
  const ay = simdi.getUTCMonth();

  // 1. Aylık Sezon & Altın Bilet Döngüsü (Her ayın 1'i 08:00 UTC -> Sonraki ayın 1'i 08:00 UTC)
  let sezonBas = Date.UTC(yil, ay, 1, 8, 0, 0);
  let sezonBit = Date.UTC(yil, ay + 1, 1, 8, 0, 0);
  if (simdiMs < sezonBas) {
    sezonBas = Date.UTC(yil, ay - 1, 1, 8, 0, 0);
    sezonBit = Date.UTC(yil, ay, 1, 8, 0, 0);
  }
  const aktifSezonAyi = AYLAR_TR[new Date(sezonBas).getUTCMonth()];
  const sezonYuzde = Math.min(100, Math.max(0, Math.round(((simdiMs - sezonBas) / (sezonBit - sezonBas)) * 100)));

  // 2. Klan Savaş Ligi - CWL (Her ayın 1'i 08:00 UTC -> 11'i 08:00 UTC)
  const cwlBas = Date.UTC(yil, ay, 1, 8, 0, 0);
  const cwlBit = Date.UTC(yil, ay, 11, 8, 0, 0);
  const cwlAktif = simdiMs >= cwlBas && simdiMs < cwlBit;
  const cwlKalan = cwlAktif
    ? cwlBit - simdiMs
    : (simdiMs < cwlBas ? cwlBas : Date.UTC(yil, ay + 1, 1, 8, 0, 0)) - simdiMs;
  const cwlYuzde = cwlAktif ? Math.round(((simdiMs - cwlBas) / (cwlBit - cwlBas)) * 100) : 0;

  // 3. Klan Oyunları (Her ayın 22'si 08:00 UTC -> 28'i 08:00 UTC)
  const koBas = Date.UTC(yil, ay, 22, 8, 0, 0);
  const koBit = Date.UTC(yil, ay, 28, 8, 0, 0);
  const koAktif = simdiMs >= koBas && simdiMs < koBit;
  const koKalan = koAktif
    ? koBit - simdiMs
    : (simdiMs < koBas ? koBas : Date.UTC(yil, ay + 1, 22, 8, 0, 0)) - simdiMs;
  const koYuzde = koAktif ? Math.round(((simdiMs - koBas) / (koBit - koBas)) * 100) : 0;

  // 4. Başkent Baskını (Her Cuma 07:00 UTC -> Pazartesi 07:00 UTC)
  const gunHafta = simdi.getUTCDay();
  const saatUtc = simdi.getUTCHours();
  const baskinAktif =
    (gunHafta === 5 && saatUtc >= 7) ||
    gunHafta === 6 ||
    gunHafta === 0 ||
    (gunHafta === 1 && saatUtc < 7);

  let baskinKalan = 0;
  let baskinYuzde = 0;
  if (baskinAktif) {
    const cumaFark = gunHafta >= 5 ? gunHafta - 5 : gunHafta + 2;
    const cumaBas = Date.UTC(yil, ay, simdi.getUTCDate() - cumaFark, 7, 0, 0);
    const pztBit = cumaBas + 3 * 86400 * 1000;
    baskinKalan = pztBit - simdiMs;
    baskinYuzde = Math.min(100, Math.max(0, Math.round(((simdiMs - cumaBas) / (pztBit - cumaBas)) * 100)));
  } else {
    const sonrakiCumaFark = (5 - gunHafta + 7) % 7 || (saatUtc >= 7 ? 7 : 0);
    const sonrakiCuma = Date.UTC(yil, ay, simdi.getUTCDate() + sonrakiCumaFark, 7, 0, 0);
    baskinKalan = sonrakiCuma - simdiMs;
  }

  return [
    {
      baslik: "Klan Savaş Ligi (CWL)",
      ikon: "🏆",
      aktif: cwlAktif,
      durumMetni: cwlAktif ? "● Aktif" : "○ Bekleniyor",
      etiket: cwlAktif ? "Bitmesine Kalan" : "Başlamasına Kalan",
      kalanMs: cwlKalan,
      yuzde: cwlYuzde,
      altBilgi: cwlAktif ? "Lig savaşları ve kayıt süreci aktif" : "Her ayın 1 - 11'i arasında düzenlenir",
    },
    {
      baslik: "Klan Oyunları",
      ikon: "🎯",
      aktif: koAktif,
      durumMetni: koAktif ? "● Aktif" : "○ Bekleniyor",
      etiket: koAktif ? "Bitmesine Kalan" : "Başlamasına Kalan",
      kalanMs: koKalan,
      yuzde: koYuzde,
      altBilgi: koAktif ? "Görevleri tamamla, ödül kademelerini aç" : "Her ayın 22 - 28'i arasında düzenlenir",
    },
    {
      baslik: "Başkent Baskını",
      ikon: "🏰",
      aktif: baskinAktif,
      durumMetni: baskinAktif ? "● Aktif" : "○ Bekleniyor",
      etiket: baskinAktif ? "Bitmesine Kalan" : "Başlamasına Kalan",
      kalanMs: baskinKalan,
      yuzde: baskinYuzde,
      altBilgi: baskinAktif ? "6 saldırı hakkınla Baskın Madalyası topla" : "Her Cuma 10:00 - Pazartesi 10:00 (TSİ)",
    },
    {
      baslik: `${aktifSezonAyi} Sezonu & Altın Bilet`,
      ikon: "🎫",
      aktif: true,
      durumMetni: `● ${aktifSezonAyi} Sezonu`,
      etiket: "Sezon Bitişine Kalan",
      kalanMs: sezonBit - simdiMs,
      yuzde: sezonYuzde,
      altBilgi: "Aylık sezon bankası ve inşaat/araştırma indirim süresi",
    },
  ];
}

export default function OyunSayaclari() {
  const [simdi, setSimdi] = useState<number | null>(null);

  useEffect(() => {
    setSimdi(Date.now());
    const t = setInterval(() => setSimdi(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (simdi === null) return null;
  const etkinlikler = etkinlikleriHesapla(simdi);

  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <h2 className="baslik-serit" style={{ marginBottom: 4 }}>
          <span>⏳ Canlı Oyun Etkinlikleri & Sezon Sayaçları</span>
        </h2>
        <span style={{ fontSize: 13, opacity: 0.72 }}>Oyun sunucu döngüsüne göre anlık güncellenir</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
          gap: 16,
        }}
      >
        {etkinlikler.map((e) => (
          <div
            key={e.baslik}
            style={{
              padding: "20px 24px",
              background: "var(--kart)",
              border: `1px solid ${e.aktif ? "var(--vurgu)" : "var(--cizgi)"}`,
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 30 }}>{e.ikon}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{e.baslik}</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{e.altBilgi}</div>
                </div>
              </div>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800,
                  background: e.aktif ? "color-mix(in srgb, var(--vurgu) 18%, var(--bg))" : "var(--bg)",
                  color: e.aktif ? "var(--vurgu)" : "var(--fg)",
                  border: `1px solid ${e.aktif ? "var(--vurgu)" : "var(--cizgi)"}`,
                  flexShrink: 0,
                }}
              >
                {e.durumMetni}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingTop: 8,
                borderTop: "1px solid var(--cizgi)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>{e.etiket}:</span>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  fontVariantNumeric: "tabular-nums",
                  color: e.aktif ? "var(--vurgu)" : "var(--fg)",
                }}
              >
                {sureBicimle(e.kalanMs)}
              </span>
            </div>

            {e.aktif && (
              <div style={{ height: 6, background: "var(--cizgi)", borderRadius: 6, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${e.yuzde}%`,
                    background: "var(--vurgu)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
import { NextResponse } from "next/server";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Saldiri = {
  attackerTag: string;
  defenderTag: string;
  stars: number;
  destructionPercentage: number;
  order: number;
};

type SavasUyesi = {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacks?: Saldiri[];
};

type SavasKlan = {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls?: { medium?: string; large?: string };
  stars: number;
  destructionPercentage: number;
  attacks?: number;
  members?: SavasUyesi[];
};

type OyuncuYildizOzet = {
  tag: string;
  isim: string;
  klanAdi: string;
  klanKod: string;
  bbSeviyesi: number;
  toplamYildiz: number;
  yapilanSaldiri: number;
  maksSaldiri: number;
  ortalamaYikim: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kod = (searchParams.get("kod") ?? "")
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .replace(/O/g, "0");

  if (!KOD_KURALI.test(kod)) {
    return NextResponse.json({ hata: "Geçersiz klan kodu" }, { status: 400 });
  }

  const token = process.env.COC_API_TOKEN;
  if (!token) {
    return NextResponse.json({ hata: "Sunucu ayarı eksik" }, { status: 500 });
  }

  const headers = { Authorization: "Bearer " + token };
  const hedefTag = "#" + kod;

  try {
    // 1. Önce aktif Klan Savaş Ligi (CWL) grubu var mı kontrol et
    const cwlYanit = await fetch(
      "https://cocproxy.royaleapi.dev/v1/clans/%23" + kod + "/currentwar/leaguegroup",
      { headers, cache: "no-store" }
    );

    if (cwlYanit.ok) {
      const cwlData = await cwlYanit.json();
      const klanlar = cwlData.clans ?? [];
      const rounds = cwlData.rounds ?? [];

      // Tüm CWL savaş etiketlerini topla ve detaylarını paralel çek
      const savasTagleri: string[] = [];
      for (const r of rounds) {
        for (const wTag of r.warTags ?? []) {
          if (wTag && wTag !== "#0") savasTagleri.push(wTag);
        }
      }

      const savasDetaylari = await Promise.all(
        savasTagleri.map(async (wTag) => {
          const temizWTag = wTag.replace(/^#/, "");
          const r = await fetch(
            "https://cocproxy.royaleapi.dev/v1/clanwarleagues/wars/%23" + temizWTag,
            { headers, cache: "no-store" }
          );
          if (!r.ok) return null;
          return r.json();
        })
      );

      const gecerliSavaslar = savasDetaylari.filter((s) => s && s.state !== "notInWar");

      // Aranan klanın en güncel aktif veya son biten savaşını bul
      const bizimSavaslar = gecerliSavaslar.filter(
        (s) => s.clan?.tag === hedefTag || s.opponent?.tag === hedefTag
      );
      const aktifBizimSavas =
        bizimSavaslar.find((s) => s.state === "inWar") ||
        bizimSavaslar.find((s) => s.state === "preparation") ||
        bizimSavaslar[bizimSavaslar.length - 1] ||
        null;

      // Oyuncu yıldız sıralamasını hesapla (Tüm CWL turları boyunca kümülatif)
      const oyuncuHaritasi = new Map<string, OyuncuYildizOzet>();
      const klanTurSayaci = new Map<string, number>();

      for (const s of gecerliSavaslar) {
        if (s.state !== "inWar" && s.state !== "warEnded") continue;
        for (const taraf of [s.clan as SavasKlan, s.opponent as SavasKlan]) {
          if (!taraf?.tag) continue;
          klanTurSayaci.set(taraf.tag, (klanTurSayaci.get(taraf.tag) ?? 0) + 1);
          for (const m of taraf.members ?? []) {
            const mevcut = oyuncuHaritasi.get(m.tag) ?? {
              tag: m.tag,
              isim: m.name,
              klanAdi: taraf.name,
              klanKod: taraf.tag,
              bbSeviyesi: m.townhallLevel,
              toplamYildiz: 0,
              yapilanSaldiri: 0,
              maksSaldiri: 0,
              ortalamaYikim: 0,
            };
            const saldirilar = m.attacks ?? [];
            const kazanilanYildiz = saldirilar.reduce((acc, a) => acc + (a.stars ?? 0), 0);
            const toplamYikim = saldirilar.reduce((acc, a) => acc + (a.destructionPercentage ?? 0), 0);

            mevcut.toplamYildiz += kazanilanYildiz;
            mevcut.yapilanSaldiri += saldirilar.length;
            mevcut.maksSaldiri += 1; // CWL'de her savaşta 1 saldırı hakkı vardır
            mevcut.ortalamaYikim += toplamYikim;
            oyuncuHaritasi.set(m.tag, mevcut);
          }
        }
      }

      const oyuncuSiralamasi = Array.from(oyuncuHaritasi.values())
        .map((o) => ({
          ...o,
          ortalamaYikim: o.yapilanSaldiri > 0 ? Math.round(o.ortalamaYikim / o.yapilanSaldiri) : 0,
        }))
        .sort(
          (a, b) =>
            b.toplamYildiz - a.toplamYildiz ||
            b.ortalamaYikim - a.ortalamaYikim ||
            a.yapilanSaldiri - b.yapilanSaldiri
        );

      // Gruptaki diğer klanların maç özetleri
      const grupMaclari = gecerliSavaslar.map((s, idx) => ({
        id: idx + "-" + (s.clan?.tag ?? "") + "-" + (s.opponent?.tag ?? ""),
        durum: s.state,
        klan1: {
          kod: s.clan?.tag,
          isim: s.clan?.name,
          rozet: s.clan?.badgeUrls?.medium ?? null,
          yildiz: s.clan?.stars ?? 0,
          yikim: Number((s.clan?.destructionPercentage ?? 0).toFixed(1)),
        },
        klan2: {
          kod: s.opponent?.tag,
          isim: s.opponent?.name,
          rozet: s.opponent?.badgeUrls?.medium ?? null,
          yildiz: s.opponent?.stars ?? 0,
          yikim: Number((s.opponent?.destructionPercentage ?? 0).toFixed(1)),
        },
      }));

      let anaKlan1 = null;
      let anaKlan2 = null;
      if (aktifBizimSavas) {
        const bizIlkMiyiz = aktifBizimSavas.clan?.tag === hedefTag;
        const k1 = bizIlkMiyiz ? aktifBizimSavas.clan : aktifBizimSavas.opponent;
        const k2 = bizIlkMiyiz ? aktifBizimSavas.opponent : aktifBizimSavas.clan;
        anaKlan1 = {
          kod: k1?.tag,
          isim: k1?.name,
          rozet: k1?.badgeUrls?.medium ?? null,
          yildiz: k1?.stars ?? 0,
          yikim: Number((k1?.destructionPercentage ?? 0).toFixed(1)),
        };
        anaKlan2 = {
          kod: k2?.tag,
          isim: k2?.name,
          rozet: k2?.badgeUrls?.medium ?? null,
          yildiz: k2?.stars ?? 0,
          yikim: Number((k2?.destructionPercentage ?? 0).toFixed(1)),
        };
      }

      return NextResponse.json({
        savasVar: Boolean(aktifBizimSavas),
        tur: "CWL",
        durum: aktifBizimSavas?.state ?? cwlData.state ?? "inWar",
        sezon: cwlData.season ?? "",
        klan1: anaKlan1,
        klan2: anaKlan2,
        grupKlanlari: klanlar.map((k: SavasKlan) => ({
          kod: k.tag,
          isim: k.name,
          seviye: k.clanLevel,
          rozet: k.badgeUrls?.medium ?? null,
        })),
        grupMaclari,
        oyuncuSiralamasi,
      });
    }

    // 2. CWL yoksa normal Klan Savaşını (currentwar) kontrol et
    const normalYanit = await fetch(
      "https://cocproxy.royaleapi.dev/v1/clans/%23" + kod + "/currentwar",
      { headers, cache: "no-store" }
    );

    if (!normalYanit.ok) {
      return NextResponse.json({
        savasVar: false,
        mesaj: "Savaş günlüğü gizli veya aktif savaş bulunmuyor.",
      });
    }

    const w = await normalYanit.json();
    if (!w || w.state === "notInWar") {
      return NextResponse.json({
        savasVar: false,
        mesaj: "Şu an aktif bir klan savaşı yok.",
      });
    }

    const saldiriHakki = w.attacksPerMember ?? 2;
    const oyuncuListesi: OyuncuYildizOzet[] = [];

    for (const taraf of [w.clan as SavasKlan, w.opponent as SavasKlan]) {
      if (!taraf?.tag) continue;
      for (const m of taraf.members ?? []) {
        const saldirilar = m.attacks ?? [];
        const toplamYildiz = saldirilar.reduce((acc, a) => acc + (a.stars ?? 0), 0);
        const toplamYikim = saldirilar.reduce((acc, a) => acc + (a.destructionPercentage ?? 0), 0);
        oyuncuListesi.push({
          tag: m.tag,
          isim: m.name,
          klanAdi: taraf.name,
          klanKod: taraf.tag,
          bbSeviyesi: m.townhallLevel,
          toplamYildiz,
          yapilanSaldiri: saldirilar.length,
          maksSaldiri: saldiriHakki,
          ortalamaYikim: saldirilar.length > 0 ? Math.round(toplamYikim / saldirilar.length) : 0,
        });
      }
    }

    oyuncuListesi.sort(
      (a, b) =>
        b.toplamYildiz - a.toplamYildiz ||
        b.ortalamaYikim - a.ortalamaYikim ||
        a.yapilanSaldiri - b.yapilanSaldiri
    );

    return NextResponse.json({
      savasVar: true,
      tur: "NORMAL",
      durum: w.state,
      klan1: {
        kod: w.clan?.tag,
        isim: w.clan?.name,
        rozet: w.clan?.badgeUrls?.medium ?? null,
        yildiz: w.clan?.stars ?? 0,
        yikim: Number((w.clan?.destructionPercentage ?? 0).toFixed(1)),
      },
      klan2: {
        kod: w.opponent?.tag,
        isim: w.opponent?.name,
        rozet: w.opponent?.badgeUrls?.medium ?? null,
        yildiz: w.opponent?.stars ?? 0,
        yikim: Number((w.opponent?.destructionPercentage ?? 0).toFixed(1)),
      },
      grupMaclari: [],
      oyuncuSiralamasi: oyuncuListesi,
    });
  } catch {
    return NextResponse.json({ savasVar: false, mesaj: "Savaş verisi alınamadı." });
  }
}
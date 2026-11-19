import { NextResponse } from "next/server";
import { supabase } from "../../supabase";

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

type SavasOyuncu = {
  tag: string;
  isim: string;
  bbSeviyesi: number;
  haritaSirasi: number;
  klanAdi: string;
  klanKodu: string;
  bizimKlan: boolean;
  saldiriSayisi: number;
  maksSaldiri: number;
  toplamYildiz: number;
  toplamYuzde: number;
};

type GrupKlan = {
  tag: string;
  name: string;
  clanLevel: number;
  rozet: string | null;
  uyeSayisi: number;
  yildiz: number;
  yuzde: number;
  galibiyet: number;
};

type CwlMac = {
  tur: number;
  durum: string;
  klan1: { tag: string; name: string; rozet: string | null; stars: number; destructionPercentage: number };
  klan2: { tag: string; name: string; rozet: string | null; stars: number; destructionPercentage: number };
};

type WarLogItem = {
  result?: "win" | "lose" | "tie" | null;
  endTime?: string;
  teamSize?: number;
  clan?: {
    tag?: string;
    name?: string;
    badgeUrls?: { medium?: string };
    stars?: number;
    destructionPercentage?: number;
  };
  opponent?: {
    tag?: string;
    name?: string;
    badgeUrls?: { medium?: string };
    stars?: number;
    destructionPercentage?: number;
  };
};

type GecmisSavas = {
  id: string;
  sonuc: "win" | "lose" | "tie" | "unknown";
  bitisTarihi: string;
  takimBoyutu: number;
  bizimAdi?: string;
  bizimRozet?: string | null;
  bizimYildiz: number;
  bizimYuzde: number;
  rakipTag: string;
  rakipAdi: string;
  rakipRozet: string | null;
  rakipYildiz: number;
  rakipYuzde: number;
  detayli: boolean;
  oyuncuSiralamasi?: SavasOyuncu[];
};

type CwlArsivKaydi = {
  sezon: string;
  yil: number;
  ay: number;
  durum: string;
  takimBoyutu: number;
  grupKlanlari: GrupKlan[];
  tumMaclar: CwlMac[];
  oyuncuSiralamasi: SavasOyuncu[];
};

function sonucHesapla(
  bizimYildiz: number,
  bizimYuzde: number,
  rakipYildiz: number,
  rakipYuzde: number
): "win" | "lose" | "tie" {
  if (bizimYildiz > rakipYildiz) return "win";
  if (bizimYildiz < rakipYildiz) return "lose";
  if (bizimYuzde > rakipYuzde) return "win";
  if (bizimYuzde < rakipYuzde) return "lose";
  return "tie";
}

function eslesmeAnahtari(rakipTag: string, bitisTarihi: string): string {
  const temizTag = (rakipTag ?? "").toUpperCase().replace(/^#/, "");
  const gun = (bitisTarihi ?? "").slice(0, 8);
  return `${temizTag}_${gun}`;
}

async function savasGecmisiniGetir(
  kod: string,
  headers: Record<string, string>
): Promise<{ gecmis: GecmisSavas[]; gizli: boolean }> {
  try {
    const r = await fetch(
      "https://cocproxy.royaleapi.dev/v1/clans/%23" + kod + "/warlog?limit=50",
      { headers, cache: "no-store" }
    );
    if (r.status === 403) return { gecmis: [], gizli: true };
    if (!r.ok) return { gecmis: [], gizli: false };

    const veri = await r.json();
    const items: WarLogItem[] = Array.isArray(veri?.items) ? veri.items : [];

    const gecmis: GecmisSavas[] = items
      .filter((item) => item?.opponent?.name)
      .slice(0, 50)
      .map((item, idx) => {
        const rakipTag = item.opponent?.tag ?? "";
        const bitisTarihi = item.endTime ?? "";
        return {
          id: `log_${kod}_${bitisTarihi.slice(0, 15)}_${rakipTag.replace(/^#/, "")}_${idx}`,
          sonuc: item.result ?? "unknown",
          bitisTarihi,
          takimBoyutu: item.teamSize ?? 0,
          bizimAdi: item.clan?.name ?? "",
          bizimRozet: item.clan?.badgeUrls?.medium ?? null,
          bizimYildiz: item.clan?.stars ?? 0,
          bizimYuzde: Number((item.clan?.destructionPercentage ?? 0).toFixed(1)),
          rakipTag,
          rakipAdi: item.opponent?.name ?? "Bilinmeyen Klan",
          rakipRozet: item.opponent?.badgeUrls?.medium ?? null,
          rakipYildiz: item.opponent?.stars ?? 0,
          rakipYuzde: Number((item.opponent?.destructionPercentage ?? 0).toFixed(1)),
          detayli: false,
        };
      });

    return { gecmis, gizli: false };
  } catch {
    return { gecmis: [], gizli: false };
  }
}

async function arsivleriOku(kod: string): Promise<{
  arsivSavaslar: GecmisSavas[];
  cwlArsivi: CwlArsivKaydi[];
}> {
  try {
    const [{ data: savaslar }, { data: cwller }] = await Promise.all([
      supabase
        .from("savas_arsivi")
        .select("*")
        .eq("klan_kod", kod)
        .order("bitis_tarihi", { ascending: false })
        .limit(120),
      supabase
        .from("cwl_arsivi")
        .select("*")
        .eq("klan_kod", kod)
        .order("sezon", { ascending: false })
        .limit(36),
    ]);

    const arsivSavaslar: GecmisSavas[] = (savaslar ?? []).map((row) => ({
      id: row.id,
      sonuc: (row.sonuc ?? "unknown") as GecmisSavas["sonuc"],
      bitisTarihi: row.bitis_tarihi ?? "",
      takimBoyutu: row.takim_boyutu ?? 0,
      bizimAdi: row.bizim_klan?.name ?? "",
      bizimRozet: row.bizim_klan?.rozet ?? null,
      bizimYildiz: row.bizim_klan?.stars ?? 0,
      bizimYuzde: Number((row.bizim_klan?.destructionPercentage ?? 0).toFixed(1)),
      rakipTag: row.rakip_klan?.tag ?? "",
      rakipAdi: row.rakip_klan?.name ?? "Bilinmeyen Klan",
      rakipRozet: row.rakip_klan?.rozet ?? null,
      rakipYildiz: row.rakip_klan?.stars ?? 0,
      rakipYuzde: Number((row.rakip_klan?.destructionPercentage ?? 0).toFixed(1)),
      detayli: Array.isArray(row.oyuncu_siralamasi) && row.oyuncu_siralamasi.length > 0,
      oyuncuSiralamasi: Array.isArray(row.oyuncu_siralamasi) ? row.oyuncu_siralamasi : [],
    }));

    const cwlArsivi: CwlArsivKaydi[] = (cwller ?? []).map((row) => ({
      sezon: row.sezon,
      yil: row.yil,
      ay: row.ay,
      durum: row.durum ?? "ended",
      takimBoyutu: row.takim_boyutu ?? 15,
      grupKlanlari: Array.isArray(row.grup_klanlari) ? row.grup_klanlari : [],
      tumMaclar: Array.isArray(row.tum_maclar) ? row.tum_maclar : [],
      oyuncuSiralamasi: Array.isArray(row.oyuncu_siralamasi) ? row.oyuncu_siralamasi : [],
    }));

    return { arsivSavaslar, cwlArsivi };
  } catch {
    return { arsivSavaslar: [], cwlArsivi: [] };
  }
}

function gecmisleriBirlestir(arsiv: GecmisSavas[], warlog: GecmisSavas[]): GecmisSavas[] {
  const harita = new Map<string, GecmisSavas>();

  // Önce detaylı arşiv kayıtlarını ekle (öncelikli)
  for (const s of arsiv) {
    const anahtar = eslesmeAnahtari(s.rakipTag, s.bitisTarihi) || s.id;
    harita.set(anahtar, s);
  }

  // Sonra Supercell 50 savaş geçmişinden eksik olanları ekle
  for (const w of warlog) {
    const anahtar = eslesmeAnahtari(w.rakipTag, w.bitisTarihi) || w.id;
    if (!harita.has(anahtar)) {
      harita.set(anahtar, w);
    }
  }

  return Array.from(harita.values()).sort((a, b) =>
    (b.bitisTarihi || "").localeCompare(a.bitisTarihi || "")
  );
}

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
    // Son 50 savaş geçmişini, CWL durumunu ve Supabase arşivini paralel çek
    const [gecmisSonuc, cwlYanit, mevcutArsiv] = await Promise.all([
      savasGecmisiniGetir(kod, headers),
      fetch("https://cocproxy.royaleapi.dev/v1/clans/%23" + kod + "/currentwar/leaguegroup", {
        headers,
        cache: "no-store",
      }),
      arsivleriOku(kod),
    ]);

    // 1. Aktif Klan Savaş Ligi (CWL) grubu varsa
    if (cwlYanit.ok) {
      const cwlData = await cwlYanit.json();
      const klanlar: SavasKlan[] = cwlData.clans ?? [];
      const rounds: { warTags?: string[] }[] = cwlData.rounds ?? [];

      const turVeTagler: { tur: number; tag: string }[] = [];
      rounds.forEach((r, idx) => {
        for (const wTag of r.warTags ?? []) {
          if (wTag && wTag !== "#0") {
            turVeTagler.push({ tur: idx + 1, tag: wTag });
          }
        }
      });

      const savasDetaylari = await Promise.all(
        turVeTagler.map(async ({ tur, tag }) => {
          const temizWTag = tag.replace(/^#/, "");
          const r = await fetch(
            "https://cocproxy.royaleapi.dev/v1/clanwarleagues/wars/%23" + temizWTag,
            { headers, cache: "no-store" }
          );
          if (!r.ok) return null;
          const veri = await r.json();
          return { tur, veri };
        })
      );

      const gecerliSavaslar = savasDetaylari.filter(
        (s): s is { tur: number; veri: { state: string; teamSize?: number; clan: SavasKlan; opponent: SavasKlan } } =>
          Boolean(s && s.veri && s.veri.state !== "notInWar")
      );

      const bizimSavaslar = gecerliSavaslar.filter(
        (s) => s.veri.clan?.tag === hedefTag || s.veri.opponent?.tag === hedefTag
      );

      const aktifBizimSavas =
        bizimSavaslar.find((s) => s.veri.state === "inWar") ||
        bizimSavaslar.find((s) => s.veri.state === "preparation") ||
        bizimSavaslar[bizimSavaslar.length - 1] ||
        null;

      const oyuncuHaritasi = new Map<string, SavasOyuncu>();
      const grupIstatistik = new Map<string, { yildiz: number; yuzde: number; galibiyet: number }>();

      for (const { veri: s } of gecerliSavaslar) {
        if (s.state !== "inWar" && s.state !== "warEnded") continue;

        if (s.clan?.tag && s.opponent?.tag) {
          const c1 = grupIstatistik.get(s.clan.tag) ?? { yildiz: 0, yuzde: 0, galibiyet: 0 };
          const c2 = grupIstatistik.get(s.opponent.tag) ?? { yildiz: 0, yuzde: 0, galibiyet: 0 };

          c1.yildiz += s.clan.stars ?? 0;
          c1.yuzde += s.clan.destructionPercentage ?? 0;
          c2.yildiz += s.opponent.stars ?? 0;
          c2.yuzde += s.opponent.destructionPercentage ?? 0;

          if (s.state === "warEnded") {
            const k1Kazandi =
              (s.clan.stars ?? 0) > (s.opponent.stars ?? 0) ||
              ((s.clan.stars ?? 0) === (s.opponent.stars ?? 0) &&
                (s.clan.destructionPercentage ?? 0) > (s.opponent.destructionPercentage ?? 0));
            const k2Kazandi =
              (s.opponent.stars ?? 0) > (s.clan.stars ?? 0) ||
              ((s.opponent.stars ?? 0) === (s.clan.stars ?? 0) &&
                (s.opponent.destructionPercentage ?? 0) > (s.clan.destructionPercentage ?? 0));
            if (k1Kazandi) c1.galibiyet += 1;
            if (k2Kazandi) c2.galibiyet += 1;
          }

          grupIstatistik.set(s.clan.tag, c1);
          grupIstatistik.set(s.opponent.tag, c2);
        }

        for (const taraf of [s.clan, s.opponent]) {
          if (!taraf?.tag) continue;
          for (const m of taraf.members ?? []) {
            const mevcut = oyuncuHaritasi.get(m.tag) ?? {
              tag: m.tag,
              isim: m.name,
              bbSeviyesi: m.townhallLevel,
              haritaSirasi: m.mapPosition ?? 0,
              klanAdi: taraf.name,
              klanKodu: taraf.tag,
              bizimKlan: taraf.tag === hedefTag,
              saldiriSayisi: 0,
              maksSaldiri: 0,
              toplamYildiz: 0,
              toplamYuzde: 0,
            };

            const saldirilar = m.attacks ?? [];
            mevcut.toplamYildiz += saldirilar.reduce((acc, a) => acc + (a.stars ?? 0), 0);
            mevcut.toplamYuzde += saldirilar.reduce((acc, a) => acc + (a.destructionPercentage ?? 0), 0);
            mevcut.saldiriSayisi += saldirilar.length;
            mevcut.maksSaldiri += 1;
            oyuncuHaritasi.set(m.tag, mevcut);
          }
        }
      }

      const oyuncuSiralamasi = Array.from(oyuncuHaritasi.values()).sort(
        (a, b) =>
          b.toplamYildiz - a.toplamYildiz ||
          b.toplamYuzde - a.toplamYuzde ||
          a.saldiriSayisi - b.saldiriSayisi
      );

      const grupKlanlari: GrupKlan[] = klanlar
        .map((k) => {
          const ist = grupIstatistik.get(k.tag) ?? { yildiz: 0, yuzde: 0, galibiyet: 0 };
          return {
            tag: k.tag,
            name: k.name,
            clanLevel: k.clanLevel,
            rozet: k.badgeUrls?.medium ?? null,
            uyeSayisi: k.members?.length ?? 0,
            yildiz: ist.yildiz,
            yuzde: Number(ist.yuzde.toFixed(1)),
            galibiyet: ist.galibiyet,
          };
        })
        .sort((a, b) => b.yildiz - a.yildiz || b.yuzde - a.yuzde);

      const tumMaclar: CwlMac[] = gecerliSavaslar.map(({ tur, veri: s }) => ({
        tur,
        durum: s.state,
        klan1: {
          tag: s.clan?.tag ?? "",
          name: s.clan?.name ?? "",
          rozet: s.clan?.badgeUrls?.medium ?? null,
          stars: s.clan?.stars ?? 0,
          destructionPercentage: Number((s.clan?.destructionPercentage ?? 0).toFixed(1)),
        },
        klan2: {
          tag: s.opponent?.tag ?? "",
          name: s.opponent?.name ?? "",
          rozet: s.opponent?.badgeUrls?.medium ?? null,
          stars: s.opponent?.stars ?? 0,
          destructionPercentage: Number((s.opponent?.destructionPercentage ?? 0).toFixed(1)),
        },
      }));

      let bizimKlan = undefined;
      let rakipKlan = undefined;
      if (aktifBizimSavas) {
        const s = aktifBizimSavas.veri;
        const bizIlkMiyiz = s.clan?.tag === hedefTag;
        const k1 = bizIlkMiyiz ? s.clan : s.opponent;
        const k2 = bizIlkMiyiz ? s.opponent : s.clan;
        bizimKlan = {
          tag: k1.tag,
          name: k1.name,
          rozet: k1.badgeUrls?.medium ?? null,
          stars: k1.stars ?? 0,
          destructionPercentage: Number((k1.destructionPercentage ?? 0).toFixed(1)),
          attacks: k1.attacks ?? 0,
        };
        rakipKlan = {
          tag: k2.tag,
          name: k2.name,
          rozet: k2.badgeUrls?.medium ?? null,
          stars: k2.stars ?? 0,
          destructionPercentage: Number((k2.destructionPercentage ?? 0).toFixed(1)),
          attacks: k2.attacks ?? 0,
        };
      }

      const sezonStr: string = cwlData.season ?? "";
      const [yilStr, ayStr] = sezonStr.split("-");
      const yil = Number(yilStr) || new Date().getFullYear();
      const ay = Number(ayStr) || new Date().getMonth() + 1;
      const takimBoyutu = aktifBizimSavas?.veri.teamSize ?? 15;

      // Aktif CWL sezonunu Supabase'e kalıcı arşivle
      if (sezonStr && grupKlanlari.length > 0) {
        try {
          await supabase.from("cwl_arsivi").upsert({
            id: `${kod}_${sezonStr}`,
            klan_kod: kod,
            sezon: sezonStr,
            yil,
            ay,
            durum: aktifBizimSavas?.veri.state ?? cwlData.state ?? "inWar",
            takim_boyutu: takimBoyutu,
            grup_klanlari: grupKlanlari,
            tum_maclar: tumMaclar,
            oyuncu_siralamasi: oyuncuSiralamasi,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      const guncelCwlKaydi: CwlArsivKaydi | null = sezonStr
        ? {
            sezon: sezonStr,
            yil,
            ay,
            durum: aktifBizimSavas?.veri.state ?? cwlData.state ?? "inWar",
            takimBoyutu,
            grupKlanlari,
            tumMaclar,
            oyuncuSiralamasi,
          }
        : null;

      const birlesikCwl: CwlArsivKaydi[] = [
        ...(guncelCwlKaydi ? [guncelCwlKaydi] : []),
        ...mevcutArsiv.cwlArsivi.filter((c) => c.sezon !== sezonStr),
      ].sort((a, b) => b.sezon.localeCompare(a.sezon));

      return NextResponse.json({
        aktif: Boolean(aktifBizimSavas),
        tur: "cwl",
        durum: aktifBizimSavas?.veri.state ?? cwlData.state ?? "inWar",
        sezon: sezonStr,
        takimBoyutu,
        bizimKlan,
        rakipKlan,
        grupKlanlari,
        tumMaclar,
        oyuncuSiralamasi,
        savasGecmisi: gecmisleriBirlestir(mevcutArsiv.arsivSavaslar, gecmisSonuc.gecmis),
        gecmisGizli: gecmisSonuc.gizli,
        cwlArsivi: birlesikCwl,
      });
    }

    // 2. CWL yoksa normal Klan Savaşını (currentwar) kontrol et
    const normalYanit = await fetch(
      "https://cocproxy.royaleapi.dev/v1/clans/%23" + kod + "/currentwar",
      { headers, cache: "no-store" }
    );

    if (!normalYanit.ok) {
      return NextResponse.json({
        aktif: false,
        tur: "yok",
        mesaj: "Savaş günlüğü gizli veya aktif savaş bulunmuyor.",
        savasGecmisi: gecmisleriBirlestir(mevcutArsiv.arsivSavaslar, gecmisSonuc.gecmis),
        gecmisGizli: gecmisSonuc.gizli,
        cwlArsivi: mevcutArsiv.cwlArsivi,
      });
    }

    const w = await normalYanit.json();
    if (!w || w.state === "notInWar") {
      return NextResponse.json({
        aktif: false,
        tur: "yok",
        mesaj: "Şu an aktif bir klan savaşı yok.",
        savasGecmisi: gecmisleriBirlestir(mevcutArsiv.arsivSavaslar, gecmisSonuc.gecmis),
        gecmisGizli: gecmisSonuc.gizli,
        cwlArsivi: mevcutArsiv.cwlArsivi,
      });
    }

    const saldiriHakki = w.attacksPerMember ?? 2;
    const oyuncuListesi: SavasOyuncu[] = [];

    for (const taraf of [w.clan as SavasKlan, w.opponent as SavasKlan]) {
      if (!taraf?.tag) continue;
      for (const m of taraf.members ?? []) {
        const saldirilar = m.attacks ?? [];
        oyuncuListesi.push({
          tag: m.tag,
          isim: m.name,
          bbSeviyesi: m.townhallLevel,
          haritaSirasi: m.mapPosition ?? 0,
          klanAdi: taraf.name,
          klanKodu: taraf.tag,
          bizimKlan: taraf.tag === hedefTag,
          saldiriSayisi: saldirilar.length,
          maksSaldiri: saldiriHakki,
          toplamYildiz: saldirilar.reduce((acc, a) => acc + (a.stars ?? 0), 0),
          toplamYuzde: saldirilar.reduce((acc, a) => acc + (a.destructionPercentage ?? 0), 0),
        });
      }
    }

    oyuncuListesi.sort(
      (a, b) =>
        b.toplamYildiz - a.toplamYildiz ||
        b.toplamYuzde - a.toplamYuzde ||
        a.saldiriSayisi - b.saldiriSayisi
    );

    const bizimKlan = {
      tag: w.clan?.tag ?? "",
      name: w.clan?.name ?? "",
      rozet: w.clan?.badgeUrls?.medium ?? null,
      stars: w.clan?.stars ?? 0,
      destructionPercentage: Number((w.clan?.destructionPercentage ?? 0).toFixed(1)),
      attacks: w.clan?.attacks ?? 0,
    };

    const rakipKlan = {
      tag: w.opponent?.tag ?? "",
      name: w.opponent?.name ?? "",
      rozet: w.opponent?.badgeUrls?.medium ?? null,
      stars: w.opponent?.stars ?? 0,
      destructionPercentage: Number((w.opponent?.destructionPercentage ?? 0).toFixed(1)),
      attacks: w.opponent?.attacks ?? 0,
    };

    // Aktif veya yeni biten normal savaşı Supabase'e kalıcı arşivle
    let arsivListesi = mevcutArsiv.arsivSavaslar;
    const bitisTarihi = w.endTime ?? w.preparationStartTime ?? "";
    if (w.state === "inWar" || w.state === "warEnded") {
      const savasId = `${kod}_${bitisTarihi.slice(0, 15)}_${rakipKlan.tag.replace(/^#/, "")}`;
      const sonuc =
        w.state === "warEnded"
          ? sonucHesapla(
              bizimKlan.stars,
              bizimKlan.destructionPercentage,
              rakipKlan.stars,
              rakipKlan.destructionPercentage
            )
          : "unknown";

      try {
        await supabase.from("savas_arsivi").upsert({
          id: savasId,
          klan_kod: kod,
          bitis_tarihi: bitisTarihi,
          durum: w.state,
          sonuc,
          takim_boyutu: w.teamSize ?? 0,
          bizim_klan: bizimKlan,
          rakip_klan: rakipKlan,
          oyuncu_siralamasi: oyuncuListesi,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      if (w.state === "warEnded") {
        const yeniKayit: GecmisSavas = {
          id: savasId,
          sonuc,
          bitisTarihi,
          takimBoyutu: w.teamSize ?? 0,
          bizimAdi: bizimKlan.name,
          bizimRozet: bizimKlan.rozet,
          bizimYildiz: bizimKlan.stars,
          bizimYuzde: bizimKlan.destructionPercentage,
          rakipTag: rakipKlan.tag,
          rakipAdi: rakipKlan.name,
          rakipRozet: rakipKlan.rozet,
          rakipYildiz: rakipKlan.stars,
          rakipYuzde: rakipKlan.destructionPercentage,
          detayli: true,
          oyuncuSiralamasi: oyuncuListesi,
        };
        arsivListesi = [yeniKayit, ...arsivListesi.filter((x) => x.id !== savasId)];
      }
    }

    return NextResponse.json({
      aktif: true,
      tur: "normal",
      durum: w.state,
      takimBoyutu: w.teamSize ?? 0,
      bizimKlan,
      rakipKlan,
      grupKlanlari: [],
      tumMaclar: [],
      oyuncuSiralamasi: oyuncuListesi,
      savasGecmisi: gecmisleriBirlestir(arsivListesi, gecmisSonuc.gecmis),
      gecmisGizli: gecmisSonuc.gizli,
      cwlArsivi: mevcutArsiv.cwlArsivi,
    });
  } catch {
    return NextResponse.json({
      aktif: false,
      tur: "yok",
      mesaj: "Savaş verisi alınamadı.",
      savasGecmisi: [],
      gecmisGizli: false,
      cwlArsivi: [],
    });
  }
}
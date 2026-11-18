import { NextResponse } from "next/server";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type CwlKlan = {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls?: { medium?: string };
  members?: unknown[];
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

  try {
    const yanit = await fetch(
      "https://cocproxy.royaleapi.dev/v1/clans/%23" + kod + "/currentwar/leaguegroup",
      { headers: { Authorization: "Bearer " + token }, cache: "no-store" }
    );

    if (yanit.status === 404) {
      return NextResponse.json({ aktif: false, mesaj: "Bu klan şu an aktif bir Klan Savaş Ligi (CWL) haftasında değil." });
    }
    if (!yanit.ok) {
      return NextResponse.json({ aktif: false, mesaj: "CWL bilgisi şu an alınamıyor (Savaş günlüğü gizli olabilir)." });
    }

    const v = await yanit.json();
    const klanlar = (v.clans ?? []).map((k: CwlKlan) => ({
      kod: k.tag,
      isim: k.name,
      seviye: k.clanLevel,
      rozet: k.badgeUrls?.medium ?? null,
      uyeSayisi: Array.isArray(k.members) ? k.members.length : 0,
    }));

    return NextResponse.json({
      aktif: true,
      durum: v.state ?? "inWar",
      sezon: v.season ?? "",
      turSayisi: Array.isArray(v.rounds) ? v.rounds.length : 0,
      klanlar,
    });
  } catch {
    return NextResponse.json({ aktif: false, mesaj: "Bağlantı hatası" });
  }
}
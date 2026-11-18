import { NextResponse } from "next/server";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

type Uye = {
  tag: string;
  name: string;
  role: string;
  townHallLevel: number;
  trophies: number;
  donations: number;
  donationsReceived: number;
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
      "https://cocproxy.royaleapi.dev/v1/clans/%23" + kod,
      { headers: { Authorization: "Bearer " + token }, cache: "no-store" }
    );

    if (yanit.status === 404) {
      return NextResponse.json({ hata: "Klan bulunamadı" }, { status: 404 });
    }
    if (!yanit.ok) {
      return NextResponse.json({ hata: "Klan verisi alınamadı" }, { status: 502 });
    }

    const v = await yanit.json();
    const uyeler: Uye[] = (v.memberList ?? []).map((u: Uye) => ({
      tag: u.tag,
      name: u.name,
      role: u.role,
      townHallLevel: u.townHallLevel,
      trophies: u.trophies,
      donations: u.donations,
      donationsReceived: u.donationsReceived,
    }));

    return NextResponse.json({
      rozet: v.badgeUrls?.large ?? v.badgeUrls?.medium ?? null,
      kod: v.tag,
      isim: v.name,
      aciklama: v.description ?? "",
      seviye: v.clanLevel,
      puan: v.clanPoints,
      uyeSayisi: v.members,
      savasGalibiyet: v.warWins ?? 0,
      savasMaglubiyet: v.warLosses ?? 0,
      savasBeraberlik: v.warTies ?? 0,
      savasSerisi: v.warWinStreak ?? 0,
      uyeler,
    });
  } catch {
    return NextResponse.json({ hata: "Bağlantı hatası" }, { status: 502 });
  }
}
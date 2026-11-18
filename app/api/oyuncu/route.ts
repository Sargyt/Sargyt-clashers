import { NextResponse } from "next/server";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kod = (searchParams.get("kod") ?? "")
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .replace(/O/g, "0");

  if (!KOD_KURALI.test(kod)) {
    return NextResponse.json({ hata: "Geçersiz köy kodu" }, { status: 400 });
  }

  const token = process.env.COC_API_TOKEN;
  if (!token) {
    return NextResponse.json({ hata: "Sunucu ayarı eksik" }, { status: 500 });
  }

  try {
    const yanit = await fetch(
      "https://cocproxy.royaleapi.dev/v1/players/%23" + kod,
      { headers: { Authorization: "Bearer " + token }, cache: "no-store" }
    );

    if (yanit.status === 404) {
      return NextResponse.json({ hata: "Oyuncu bulunamadı" }, { status: 404 });
    }
    if (!yanit.ok) {
      return NextResponse.json({ hata: "Veri alınamadı" }, { status: 502 });
    }

    const v = await yanit.json();
    return NextResponse.json({
      kod: v.tag,
      isim: v.name,
      thSeviyesi: v.townHallLevel,
      kupa: v.trophies,
      klan: v.clan?.name ?? null,
      kahramanlar: (v.heroes ?? []).map(
        (h: { name: string; level: number; maxLevel: number }) => ({
          isim: h.name,
          seviye: h.level,
          azami: h.maxLevel,
        })
      ),
    });
  } catch {
    return NextResponse.json({ hata: "Bağlantı hatası" }, { status: 502 });
  }
}
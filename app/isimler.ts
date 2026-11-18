const SOZLUK: Record<string, string> = {
  "Thrower": "Mızrakçı",
  "Barbarian King": "Barbar Kral",
  "Archer Queen": "Okçu Kraliçe",
  "Grand Warden": "Büyük Koruyucu",
  "Royal Champion": "Kraliyet Şampiyonu",
  "Minion Prince": "Minyon Prens",
  "Dragon Duke": "Ejder Dükü",
  "Barbarian": "",
  "Archer": "",
  "Giant": "",
  "Healer": "",
  "Golem": "",
  "Hog Rider": "",
  "P.E.K.K.A": "",
};

export function tr(isim: string): string {
  const t = SOZLUK[isim];
  return t ? t + " (" + isim + ")" : isim;
}
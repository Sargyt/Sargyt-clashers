const SOZLUK: Record<string, string> = {
  "Thrower": "Mızrakçı",
  "Barbarian King": "Barbar Kral",
  "Archer Queen": "Okçu Kraliçe",
  "Grand Warden": "Büyük Koruyucu",
  "Royal Champion": "Kraliyet Şampiyonu",
  "Minion Prince": "Minyon Prens",
  "Dragon Duke": "Ejder Dükü",
  "Barbarian": "Barbar",
  "Archer": "Okçu",
  "Giant": "Dev",
  "Goblin": "Goblin",
  "Wall Breaker": "Duvar Yıkıcı",
  "Balloon": "Balon",
  "Wizard": "Büyücü",
  "Healer": "Şifacı",
  "Dragon": "Ejderha",
  "P.E.K.K.A": "P.E.K.K.A",
  "Golem": "Golem",
  "Witch": "Cadı",
  "Lava Hound": "Lav Tazısı",
  "Valkyrie": "Valkür",
  "Hog Rider": "Domuz Binici",
  "Miner": "Madenci",
};

export function tr(isim: string): string {
  const t = SOZLUK[isim];
  if (!t) return isim;
  return t === isim ? isim : t + " (" + isim + ")";
}
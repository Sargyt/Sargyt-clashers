const SOZLUK: Record<string, string> = {
  "Thrower": "Mızrakçı",
  "Barbarian King": "",
  "Archer Queen": "",
  "Grand Warden": "",
  "Royal Champion": "",
  "Minion Prince": "",
  "Dragon Duke": "",
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
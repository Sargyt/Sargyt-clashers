// Oyuncunun Belediye Binası (TH) seviyesine göre ulaşabileceği gerçek maksimum seviyeler.
// Listede olmayan birimler için API'den gelen mutlak maxLevel yedek (fallback) olarak kullanılır.

export const TH_KAHRAMAN_SINIRLARI: Record<number, Record<string, number>> = {
  7: { "Barbarian King": 10 },
  8: { "Barbarian King": 20 },
  9: { "Barbarian King": 30, "Archer Queen": 30 },
  10: { "Barbarian King": 40, "Archer Queen": 40 },
  11: { "Barbarian King": 50, "Archer Queen": 50, "Grand Warden": 20 },
  12: { "Barbarian King": 65, "Archer Queen": 65, "Grand Warden": 40 },
  13: { "Barbarian King": 75, "Archer Queen": 75, "Grand Warden": 50, "Royal Champion": 25 },
  14: { "Barbarian King": 80, "Archer Queen": 80, "Grand Warden": 55, "Royal Champion": 30 },
  15: { "Barbarian King": 90, "Archer Queen": 90, "Grand Warden": 65, "Royal Champion": 40 },
  16: { "Barbarian King": 95, "Archer Queen": 95, "Grand Warden": 70, "Royal Champion": 45 },
  17: { "Barbarian King": 100, "Archer Queen": 100, "Grand Warden": 75, "Royal Champion": 50, "Minion Prince": 90 },
};

export function gercekAzami(thSeviyesi: number, birimIsmi: string, apiAzami: number): number {
  const thTablosu = TH_KAHRAMAN_SINIRLARI[thSeviyesi];
  if (thTablosu && thTablosu[birimIsmi] !== undefined) {
    return thTablosu[birimIsmi];
  }
  return apiAzami;
}
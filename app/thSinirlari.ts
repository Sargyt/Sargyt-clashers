// Oyuncunun Belediye Binası (TH) seviyesine göre ulaşabileceği gerçek maksimum seviyeler.
// Listede olmayan birimler için API'den gelen mutlak maxLevel yedek (fallback) olarak kullanılır.

export const TH_SINIRLARI: Record<number, Record<string, number>> = {
  7: {
    "Barbarian King": 10,
    "Barbarian": 4, "Archer": 4, "Giant": 4, "Goblin": 4, "Wall Breaker": 4, "Balloon": 4, "Wizard": 4, "Healer": 2, "Dragon": 2,
    "Minion": 2, "Hog Rider": 2,
    "Lightning Spell": 4, "Healing Spell": 4, "Rage Spell": 4
  },
  8: {
    "Barbarian King": 20,
    "Barbarian": 5, "Archer": 5, "Giant": 5, "Goblin": 5, "Wall Breaker": 5, "Balloon": 5, "Wizard": 5, "Healer": 3, "Dragon": 3, "P.E.K.K.A": 3,
    "Minion": 4, "Hog Rider": 4, "Valkyrie": 2, "Golem": 2,
    "Lightning Spell": 5, "Healing Spell": 5, "Rage Spell": 5, "Poison Spell": 2, "Earthquake Spell": 2
  },
  9: {
    "Barbarian King": 30, "Archer Queen": 30,
    "Barbarian": 6, "Archer": 6, "Giant": 6, "Goblin": 6, "Wall Breaker": 5, "Balloon": 6, "Wizard": 6, "Healer": 4, "Dragon": 4, "P.E.K.K.A": 4, "Baby Dragon": 2,
    "Minion": 5, "Hog Rider": 5, "Valkyrie": 4, "Golem": 4, "Witch": 2, "Lava Hound": 2,
    "Lightning Spell": 6, "Healing Spell": 6, "Rage Spell": 5, "Jump Spell": 2, "Freeze Spell": 2, "Poison Spell": 3, "Earthquake Spell": 3, "Haste Spell": 2
  },
  10: {
    "Barbarian King": 40, "Archer Queen": 40,
    "Barbarian": 7, "Archer": 7, "Giant": 7, "Goblin": 7, "Wall Breaker": 6, "Balloon": 6, "Wizard": 7, "Healer": 4, "Dragon": 5, "P.E.K.K.A": 6, "Baby Dragon": 4, "Miner": 3,
    "Minion": 6, "Hog Rider": 6, "Valkyrie": 5, "Golem": 5, "Witch": 3, "Lava Hound": 3, "Bowler": 2,
    "Lightning Spell": 7, "Healing Spell": 7, "Rage Spell": 5, "Jump Spell": 3, "Freeze Spell": 5, "Clone Spell": 3, "Poison Spell": 4, "Earthquake Spell": 4, "Haste Spell": 4, "Skeleton Spell": 4, "Bat Spell": 3
  },
  11: {
    "Barbarian King": 50, "Archer Queen": 50, "Grand Warden": 20,
    "Barbarian": 8, "Archer": 8, "Giant": 8, "Goblin": 7, "Wall Breaker": 7, "Balloon": 7, "Wizard": 8, "Healer": 5, "Dragon": 6, "P.E.K.K.A": 7, "Baby Dragon": 5, "Miner": 5, "Electro Dragon": 2,
    "Minion": 7, "Hog Rider": 7, "Valkyrie": 6, "Golem": 7, "Witch": 4, "Lava Hound": 4, "Bowler": 3, "Ice Golem": 3,
    "Lightning Spell": 8, "Healing Spell": 7, "Rage Spell": 5, "Jump Spell": 3, "Freeze Spell": 6, "Clone Spell": 5, "Invisibility Spell": 2, "Poison Spell": 5, "Earthquake Spell": 5, "Haste Spell": 4, "Skeleton Spell": 5, "Bat Spell": 4
  },
  12: {
    "Barbarian King": 65, "Archer Queen": 65, "Grand Warden": 40,
    "Barbarian": 9, "Archer": 9, "Giant": 9, "Goblin": 8, "Wall Breaker": 8, "Balloon": 8, "Wizard": 9, "Healer": 5, "Dragon": 7, "P.E.K.K.A": 8, "Baby Dragon": 6, "Miner": 6, "Electro Dragon": 3, "Yeti": 2,
    "Minion": 8, "Hog Rider": 9, "Valkyrie": 7, "Golem": 9, "Witch": 5, "Lava Hound": 5, "Bowler": 4, "Ice Golem": 5, "Headhunter": 2,
    "Lightning Spell": 9, "Healing Spell": 8, "Rage Spell": 6, "Jump Spell": 4, "Freeze Spell": 7, "Clone Spell": 5, "Invisibility Spell": 3, "Poison Spell": 6, "Earthquake Spell": 5, "Haste Spell": 5, "Skeleton Spell": 6, "Bat Spell": 5
  },
  13: {
    "Barbarian King": 75, "Archer Queen": 75, "Grand Warden": 50, "Royal Champion": 25,
    "Barbarian": 9, "Archer": 9, "Giant": 10, "Goblin": 8, "Wall Breaker": 9, "Balloon": 9, "Wizard": 10, "Healer": 6, "Dragon": 8, "P.E.K.K.A": 9, "Baby Dragon": 7, "Miner": 7, "Electro Dragon": 4, "Yeti": 3, "Dragon Rider": 2,
    "Minion": 9, "Hog Rider": 10, "Valkyrie": 8, "Golem": 10, "Witch": 5, "Lava Hound": 6, "Bowler": 5, "Ice Golem": 5, "Headhunter": 3,
    "Lightning Spell": 9, "Healing Spell": 8, "Rage Spell": 6, "Jump Spell": 4, "Freeze Spell": 7, "Clone Spell": 6, "Invisibility Spell": 4, "Recall Spell": 2, "Poison Spell": 7, "Earthquake Spell": 5, "Haste Spell": 5, "Skeleton Spell": 7, "Bat Spell": 5
  },
  14: {
    "Barbarian King": 80, "Archer Queen": 80, "Grand Warden": 55, "Royal Champion": 30,
    "Barbarian": 10, "Archer": 10, "Giant": 10, "Goblin": 8, "Wall Breaker": 10, "Balloon": 10, "Wizard": 10, "Healer": 7, "Dragon": 9, "P.E.K.K.A": 9, "Baby Dragon": 8, "Miner": 8, "Electro Dragon": 5, "Yeti": 4, "Dragon Rider": 3, "Electro Titan": 2,
    "Minion": 10, "Hog Rider": 11, "Valkyrie": 9, "Golem": 11, "Witch": 5, "Lava Hound": 6, "Bowler": 6, "Ice Golem": 6, "Headhunter": 3, "Apprentice Warden": 2,
    "Lightning Spell": 9, "Healing Spell": 8, "Rage Spell": 6, "Jump Spell": 4, "Freeze Spell": 7, "Clone Spell": 7, "Invisibility Spell": 4, "Recall Spell": 3, "Poison Spell": 8, "Earthquake Spell": 5, "Haste Spell": 5, "Skeleton Spell": 7, "Bat Spell": 6
  },
  15: {
    "Barbarian King": 90, "Archer Queen": 90, "Grand Warden": 65, "Royal Champion": 40,
    "Barbarian": 11, "Archer": 11, "Giant": 11, "Goblin": 9, "Wall Breaker": 11, "Balloon": 10, "Wizard": 11, "Healer": 8, "Dragon": 10, "P.E.K.K.A": 10, "Baby Dragon": 9, "Miner": 9, "Electro Dragon": 6, "Yeti": 5, "Dragon Rider": 3, "Electro Titan": 3, "Root Rider": 2,
    "Minion": 11, "Hog Rider": 12, "Valkyrie": 10, "Golem": 12, "Witch": 6, "Lava Hound": 6, "Bowler": 7, "Ice Golem": 7, "Headhunter": 3, "Apprentice Warden": 4,
    "Lightning Spell": 10, "Healing Spell": 9, "Rage Spell": 6, "Jump Spell": 5, "Freeze Spell": 7, "Clone Spell": 8, "Invisibility Spell": 4, "Recall Spell": 4, "Poison Spell": 9, "Earthquake Spell": 5, "Haste Spell": 5, "Skeleton Spell": 8, "Bat Spell": 6, "Overgrowth Spell": 2
  },
  16: {
    "Barbarian King": 95, "Archer Queen": 95, "Grand Warden": 70, "Royal Champion": 45,
    "Barbarian": 12, "Archer": 12, "Giant": 12, "Goblin": 9, "Wall Breaker": 12, "Balloon": 11, "Wizard": 12, "Healer": 9, "Dragon": 11, "P.E.K.K.A": 11, "Baby Dragon": 10, "Miner": 10, "Electro Dragon": 7, "Yeti": 6, "Dragon Rider": 4, "Electro Titan": 4, "Root Rider": 3, "Thrower": 2,
    "Minion": 12, "Hog Rider": 13, "Valkyrie": 11, "Golem": 13, "Witch": 7, "Lava Hound": 7, "Bowler": 8, "Ice Golem": 8, "Headhunter": 3, "Apprentice Warden": 4, "Druid": 2,
    "Lightning Spell": 11, "Healing Spell": 10, "Rage Spell": 6, "Jump Spell": 5, "Freeze Spell": 7, "Clone Spell": 8, "Invisibility Spell": 4, "Recall Spell": 5, "Poison Spell": 10, "Earthquake Spell": 5, "Haste Spell": 6, "Skeleton Spell": 8, "Bat Spell": 7, "Overgrowth Spell": 3
  },
  17: {
    "Barbarian King": 100, "Archer Queen": 100, "Grand Warden": 75, "Royal Champion": 50, "Minion Prince": 90,
    "Barbarian": 12, "Archer": 13, "Giant": 13, "Goblin": 10, "Wall Breaker": 13, "Balloon": 12, "Wizard": 13, "Healer": 10, "Dragon": 12, "P.E.K.K.A": 12, "Baby Dragon": 11, "Miner": 11, "Electro Dragon": 8, "Yeti": 6, "Dragon Rider": 5, "Electro Titan": 4, "Root Rider": 3, "Thrower": 3,
    "Minion": 13, "Hog Rider": 14, "Valkyrie": 11, "Golem": 14, "Witch": 7, "Lava Hound": 7, "Bowler": 9, "Ice Golem": 9, "Headhunter": 3, "Apprentice Warden": 4, "Druid": 3,
    "Lightning Spell": 12, "Healing Spell": 11, "Rage Spell": 6, "Jump Spell": 5, "Freeze Spell": 7, "Clone Spell": 8, "Invisibility Spell": 4, "Recall Spell": 6, "Poison Spell": 11, "Earthquake Spell": 5, "Haste Spell": 6, "Skeleton Spell": 8, "Bat Spell": 7, "Overgrowth Spell": 4, "Revive Spell": 4
  }
};

export function gercekAzami(thSeviyesi: number, birimIsmi: string, apiAzami: number): number {
  const thTablosu = TH_SINIRLARI[thSeviyesi];
  if (thTablosu && thTablosu[birimIsmi] !== undefined) {
    return thTablosu[birimIsmi];
  }
  return apiAzami;
}
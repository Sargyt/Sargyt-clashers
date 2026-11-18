// Birim adını temiz bir resim dosya yoluna çevirir.
// Örn: "Barbarian King" -> "/birimler/barbarian-king.png"
// Örn: "P.E.K.K.A" -> "/birimler/pekka.png"

export function gorselYolu(ingilizceIsim: string): string {
  const dosyaAdi = ingilizceIsim
    .toLowerCase()
    .replace(/\./g, "")       // Noktaları kaldır (P.E.K.K.A -> pekka, L.A.S.S.I -> lassi)
    .replace(/[^a-z0-9]+/g, "-") // Boşluk ve özel karakterleri tire (-) yap
    .replace(/^-|-$/g, "");   // Baştaki ve sondaki fazlalık tireleri sil

  return `/birimler/${dosyaAdi}.png`;
}
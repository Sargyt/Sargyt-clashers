const liste = [
  { isim: "Barbarian King", tur: "Kahraman", not: "Yer tankı" },
  { isim: "Archer Queen", tur: "Kahraman", not: "Uzun menzil, görünmezlik yeteneği" },
  { isim: "Grand Warden", tur: "Kahraman", not: "Destek, uçar" },
  { isim: "Royal Champion", tur: "Kahraman", not: "Savunmaları hedefler" },
  { isim: "Golem", tur: "Birlik", not: "Büyük tank" },
  { isim: "Balloon", tur: "Birlik", not: "Hava, savunmaları hedefler" },
  { isim: "Air Defense", tur: "Savunma", not: "Yalnızca hava hedefleri" },
  { isim: "X-Bow", tur: "Savunma", not: "Uzun menzil, hızlı atış" },
];

export default function Ansiklopedi() {
  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Ansiklopedi</h1>
      {liste.map((x) => (
        <p key={x.isim}>
          <strong>{x.isim}</strong> ({x.tur}): {x.not}
        </p>
      ))}
    </main>
  );
}
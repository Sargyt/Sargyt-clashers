"use client";
import { useState } from "react";
import { tr } from "../isimler";

const LISTE = [
  { isim: "Barbarian King", tur: "Kahraman", not: "Yer tankı, Iron Fist yeteneği" },
  { isim: "Archer Queen", tur: "Kahraman", not: "Uzun menzil, görünmezlik yeteneği" },
  { isim: "Grand Warden", tur: "Kahraman", not: "Destek, uçar, Eternal Tome ile koruma" },
  { isim: "Royal Champion", tur: "Kahraman", not: "Savunmaları hedefler, Seeking Shield" },
  { isim: "Minion Prince", tur: "Kahraman", not: "Hava saldırı kahramanı" },
  { isim: "Barbarian", tur: "Birlik", not: "Ucuz yakın dövüş birliği" },
  { isim: "Archer", tur: "Birlik", not: "Menzilli, ucuz birlik" },
  { isim: "Giant", tur: "Birlik", not: "Savunmaları hedefler, tank" },
  { isim: "Goblin", tur: "Birlik", not: "Kaynaklara hızlı saldırır" },
  { isim: "Wall Breaker", tur: "Birlik", not: "Duvarları patlatır" },
  { isim: "Balloon", tur: "Birlik", not: "Hava, savunmaları hedefler" },
  { isim: "Wizard", tur: "Birlik", not: "Yüksek hasarlı, kırılgan büyücü" },
  { isim: "Healer", tur: "Birlik", not: "Yer birliklerini iyileştirir" },
  { isim: "Dragon", tur: "Birlik", not: "Hava birliği, alan hasarı" },
  { isim: "P.E.K.K.A", tur: "Birlik", not: "Yüksek hasar ve can" },
  { isim: "Golem", tur: "Birlik", not: "Büyük tank" },
  { isim: "Witch", tur: "Birlik", not: "İskelet çağırır" },
  { isim: "Lava Hound", tur: "Birlik", not: "Hava tankı, ölünce parçalanır" },
  { isim: "Valkyrie", tur: "Birlik", not: "Etrafına dönerek hasar verir" },
  { isim: "Hog Rider", tur: "Birlik", not: "Duvarları atlar, savunmaları hedefler" },
  { isim: "Miner", tur: "Birlik", not: "Yeraltından ilerler" },
  { isim: "Electro Dragon", tur: "Birlik", not: "Zincirleme yıldırım hasarı" },
  { isim: "Yeti", tur: "Birlik", not: "Tank, küçük Yetimite çağırır" },
  { isim: "Headhunter", tur: "Birlik", not: "Kahramanları hedefler" },
  { isim: "Cannon", tur: "Savunma", not: "Yer hedeflerine ateş eder" },
  { isim: "Archer Tower", tur: "Savunma", not: "Hem yer hem hava hedefleri" },
  { isim: "Mortar", tur: "Savunma", not: "Yer hedeflerine alan hasarı" },
  { isim: "Air Defense", tur: "Savunma", not: "Yalnızca hava hedefleri" },
  { isim: "Wizard Tower", tur: "Savunma", not: "Alan hasarı, yer ve hava" },
  { isim: "Air Sweeper", tur: "Savunma", not: "Hava birliklerini iter" },
  { isim: "Hidden Tesla", tur: "Savunma", not: "Gizli, sonradan açılır" },
  { isim: "Bomb Tower", tur: "Savunma", not: "Yıkılınca patlar" },
  { isim: "X-Bow", tur: "Savunma", not: "Uzun menzil, hızlı atış" },
  { isim: "Inferno Tower", tur: "Savunma", not: "Tek veya çoklu hedef ışını" },
  { isim: "Eagle Artillery", tur: "Savunma", not: "Çok geniş menzilli topçu" },
  { isim: "Scattershot", tur: "Savunma", not: "Saçılan alan hasarı" },
];

const TURLER = ["Tümü", "Kahraman", "Birlik", "Savunma"];

export default function Ansiklopedi() {
  const [ara, setAra] = useState("");
  const [tur, setTur] = useState("Tümü");

  const sonuc = LISTE.filter(
    (x) =>
      (tur === "Tümü" || x.tur === tur) &&
      (x.isim + " " + tr(x.isim) + " " + x.not).toLowerCase().includes(ara.trim().toLowerCase())
  );

  return (
    <main style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1>Ansiklopedi</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={ara}
          onChange={(e) => setAra(e.target.value)}
          placeholder="Birlik, bina veya kahraman ara…"
          maxLength={40}
          aria-label="Ara"
          style={{
            flex: 1,
            minWidth: 180,
            padding: 12,
            borderRadius: 10,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
            color: "var(--fg)",
          }}
        />
        {TURLER.map((t) => (
          <button
            key={t}
            onClick={() => setTur(t)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--cizgi)",
              background: tur === t ? "var(--vurgu)" : "var(--kart)",
              color: tur === t ? "#111" : "var(--fg)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <p style={{ opacity: 0.7 }}>{sonuc.length} sonuç</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {sonuc.map((x) => (
          <div
            key={x.isim}
            style={{
              padding: 14,
              background: "var(--kart)",
              border: "1px solid var(--cizgi)",
              borderRadius: 12,
            }}
          >
            <strong>{tr(x.isim)}</strong>
            <div style={{ fontSize: 12, opacity: 0.7, margin: "2px 0 6px" }}>{x.tur}</div>
            <div style={{ fontSize: 14 }}>{x.not}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
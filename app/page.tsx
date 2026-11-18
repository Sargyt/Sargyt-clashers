"use client";
import { useState, type FormEvent } from "react";

const KOD_KURALI = /^[0289PYLQGRJCUV]{3,12}$/;

export default function Home() {
  const [kod, setKod] = useState("");
  const [mesaj, setMesaj] = useState("");

  function ara(e: FormEvent) {
    e.preventDefault();
    const temiz = kod.trim().toUpperCase().replace(/^#/, "").replace(/O/g, "0");
    if (!KOD_KURALI.test(temiz)) {
      setMesaj("Geçersiz köy kodu. Örnek: #2PP0Y8L");
      return;
    }
    setMesaj("Köy kodu geçerli: #" + temiz + ". Köy analizi çok yakında.");
  }

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif", maxWidth: 600 }}>
      <h1>⚔️ Sargyt Clashers</h1>
      <p>Clash of Clans köy analizi ve rehber sitesi.</p>
      <form onSubmit={ara} style={{ display: "flex", gap: 8 }}>
        <input
          value={kod}
          onChange={(e) => setKod(e.target.value)}
          placeholder="Köy kodu, örn. #2PP0Y8L"
          maxLength={14}
          style={{ flex: 1, padding: 10 }}
        />
        <button style={{ padding: "10px 16px" }}>Köyü Ara</button>
      </form>
      <p>{mesaj}</p>
    </main>
  );
}
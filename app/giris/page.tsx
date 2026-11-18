"use client";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../supabase";

const EPOSTA_KURALI = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Giris() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [mod, setMod] = useState<"giris" | "kayit">("giris");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kullanici, setKullanici] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setKullanici(data.session?.user.email ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_olay, session) => {
      setKullanici(session?.user.email ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function gonder(e: FormEvent) {
    e.preventDefault();
    setMesaj("");
    const adres = eposta.trim().toLowerCase();
    if (!EPOSTA_KURALI.test(adres)) {
      setMesaj("Geçerli bir e-posta adresi yaz.");
      return;
    }
    if (sifre.length < 8) {
      setMesaj("Şifre en az 8 karakter olmalı.");
      return;
    }
    setYukleniyor(true);
    if (mod === "kayit") {
      const { error } = await supabase.auth.signUp({
        email: adres,
        password: sifre,
        options: { emailRedirectTo: window.location.origin + "/giris" },
      });
      setMesaj(
        error
          ? "Kayıt yapılamadı, biraz sonra tekrar dene."
          : "Kayıt isteği alındı. E-postana gelen doğrulama linkine tıkla (spam klasörüne de bak)."
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: adres, password: sifre });
      setMesaj(error ? "E-posta veya şifre hatalı ya da e-posta henüz doğrulanmadı." : "");
    }
    setSifre("");
    setYukleniyor(false);
  }

  async function cikis() {
    await supabase.auth.signOut();
  }

  const kutu = {
    padding: 12,
    borderRadius: 10,
    border: "1px solid var(--cizgi)",
    background: "var(--kart)",
    color: "var(--fg)",
    width: "100%",
  } as const;

  if (kullanici) {
    return (
      <main style={{ padding: "40px 20px", maxWidth: 420, margin: "0 auto" }}>
        <h1>Hesabın</h1>
        <p>
          Giriş yapıldı: <strong>{kullanici}</strong>
        </p>
        <button
          onClick={cikis}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "1px solid var(--cizgi)",
            background: "var(--kart)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          Çıkış yap
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px 20px", maxWidth: 420, margin: "0 auto" }}>
      <h1>{mod === "giris" ? "Giriş yap" : "Kayıt ol"}</h1>
      <form onSubmit={gonder} style={{ display: "grid", gap: 10 }}>
        <input
          type="email"
          value={eposta}
          onChange={(e) => setEposta(e.target.value)}
          placeholder="E-posta"
          autoComplete="email"
          maxLength={100}
          style={kutu}
        />
        <input
          type="password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="Şifre (en az 8 karakter)"
          autoComplete={mod === "giris" ? "current-password" : "new-password"}
          maxLength={72}
          style={kutu}
        />
        <button
          disabled={yukleniyor}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: 0,
            background: "var(--vurgu)",
            color: "#111",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {yukleniyor ? "Bekleyin..." : mod === "giris" ? "Giriş yap" : "Kayıt ol"}
        </button>
      </form>
      {mesaj && <p style={{ marginTop: 12 }}>{mesaj}</p>}
      <p style={{ marginTop: 16, fontSize: 14 }}>
        {mod === "giris" ? "Hesabın yok mu? " : "Zaten hesabın var mı? "}
        <button
          onClick={() => {
            setMod(mod === "giris" ? "kayit" : "giris");
            setMesaj("");
          }}
          style={{ background: "none", border: 0, color: "var(--vurgu)", cursor: "pointer", textDecoration: "underline" }}
        >
          {mod === "giris" ? "Kayıt ol" : "Giriş yap"}
        </button>
      </p>
      <p style={{ opacity: 0.7, fontSize: 13 }}>
        Oyunun giriş bilgilerini (Supercell ID, şifre) burada hiçbir zaman girme.
      </p>
    </main>
  );
}
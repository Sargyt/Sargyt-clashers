"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function GirisSayfasi() {
  const router = useRouter();
  const [kayitModu, setKayitModu] = useState(false);
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  async function gonder(e: FormEvent) {
    e.preventDefault();
    setHata("");
    setMesaj("");
    setYukleniyor(true);

    if (kayitModu) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: sifre,
      });
      if (error) {
        setHata(error.message);
      } else {
        setMesaj("Kayıt başarılı! E-posta adresine gelen doğrulama bağlantısına tıklayabilirsin.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: sifre,
      });
      if (error) {
        setHata("E-posta veya şifre hatalı.");
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setYukleniyor(false);
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 32,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
            {kayitModu ? "Yeni Hesap Oluştur" : "Hoş Geldin"}
          </div>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
            {kayitModu
              ? "Favori köylerini ve ayarlarını tüm cihazlarında sakla."
              : "Hesabına erişmek için bilgilerini gir."}
          </p>
        </div>

        <form onSubmit={gonder} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 }}>
            E-posta Adresi
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              style={{
                padding: "13px 14px",
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 15,
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 }}>
            Şifre
            <input
              type="password"
              required
              minLength={6}
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="En az 6 karakter"
              style={{
                padding: "13px 14px",
                borderRadius: 10,
                border: "1px solid var(--cizgi)",
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 15,
              }}
            />
          </label>

          {hata && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(239, 107, 95, 0.12)",
                color: "#ef6b5f",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {hata}
            </div>
          )}

          {mesaj && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(34, 197, 94, 0.12)",
                color: "#22c55e",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {mesaj}
            </div>
          )}

          <button
            type="submit"
            disabled={yukleniyor}
            style={{
              marginTop: 4,
              padding: "14px",
              borderRadius: 12,
              border: 0,
              background: "var(--vurgu)",
              color: "#111",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {yukleniyor ? "İşleniyor..." : kayitModu ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <div
          style={{
            borderTop: "1px solid var(--cizgi)",
            paddingTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.75 }}>
            {kayitModu ? "Zaten bir hesabın var mı?" : "Henüz hesabın yok mu?"}
          </span>
          <button
            type="button"
            onClick={() => {
              setKayitModu(!kayitModu);
              setHata("");
              setMesaj("");
            }}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--vurgu)",
              background: "transparent",
              color: "var(--vurgu)",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {kayitModu ? "Giriş Ekranına Dön" : "✨ Hemen Ücretsiz Kayıt Ol"}
          </button>
        </div>
      </div>
    </main>
  );
}
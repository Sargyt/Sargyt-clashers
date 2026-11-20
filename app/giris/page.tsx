"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function GirisSayfasi() {
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [kayitModu, setKayitModu] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [aktifKullanici, setAktifKullanici] = useState<string | null>(null);
  const [oturumKontrolEdiliyor, setOturumKontrolEdiliyor] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAktifKullanici(data.session?.user?.email ?? null);
      setOturumKontrolEdiliyor(false);
    });

    const { data: dinleyici } = supabase.auth.onAuthStateChange((_event, session) => {
      setAktifKullanici(session?.user?.email ?? null);
    });

    return () => {
      dinleyici.subscription.unsubscribe();
    };
  }, []);

  async function gonder(e: FormEvent) {
    e.preventDefault();
    setHata("");
    setMesaj("");
    setYukleniyor(true);

    if (kayitModu) {
      const { error } = await supabase.auth.signUp({
        email: eposta.trim(),
        password: sifre,
      });
      if (error) {
        setHata("Kayıt hatası: " + error.message);
      } else {
        setMesaj("Kayıt başarılı! E-posta kutundaki doğrulama bağlantısına tıklayıp giriş yapabilirsin.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: eposta.trim(),
        password: sifre,
      });
      if (error) {
        setHata("Giriş yapılamadı: E-posta veya şifre hatalı.");
      } else if (data.user?.email) {
        setAktifKullanici(data.user.email);
        router.refresh();
      }
    }
    setYukleniyor(false);
  }

  async function cikisYap() {
    await supabase.auth.signOut();
    setAktifKullanici(null);
    setEposta("");
    setSifre("");
    router.refresh();
  }

  const adminMi = aktifKullanici?.toLowerCase() === "sargytr0@gmail.com";

  return (
    <main style={{ padding: "48px 24px", maxWidth: 480, margin: "0 auto" }}>
      <div
        style={{
          padding: 28,
          background: "var(--kart)",
          border: "1px solid var(--cizgi)",
          borderRadius: 18,
        }}
      >
        {oturumKontrolEdiliyor ? (
          <p style={{ textAlign: "center", opacity: 0.75, margin: 0 }}>⏳ Oturum kontrol ediliyor...</p>
        ) : aktifKullanici ? (
          /* ZATEN GİRİŞ YAPILMIŞSA GÖRÜNECEK HESAP YÖNETİM KARTI */
          <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center" }}>
            <div style={{ fontSize: 42 }}>🛡️</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Oturum Açık</h1>

            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--vurgu)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 13, opacity: 0.75 }}>Aktif Hesap</span>
              <strong style={{ fontSize: 17, color: "var(--vurgu)" }}>{aktifKullanici}</strong>
              {adminMi && (
                <span
                  style={{
                    alignSelf: "center",
                    marginTop: 4,
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: "#f59e0b",
                    color: "var(--vurgu-yazi)",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  👑 Kurucu Admin Yetkisi Aktif
                </span>
              )}
            </div>

            <p style={{ fontSize: 14, opacity: 0.8, margin: 0, lineHeight: 1.5 }}>
              Favori köylerin hesabınla eşitlendi. Forumda kendi adınla konu açabilir ve tartışmalara katılabilirsin.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
              <Link
                href="/"
                style={{
                  padding: "13px 20px",
                  borderRadius: 12,
                  background: "var(--vurgu)",
                  color: "var(--vurgu-yazi)",
                  fontWeight: 800,
                  textDecoration: "none",
                  fontSize: 15,
                }}
              >
                🏰 Ana Sayfaya Git
              </Link>

              <button
                type="button"
                onClick={cikisYap}
                style={{
                  padding: "13px 20px",
                  borderRadius: 12,
                  border: "1px solid #ef4444",
                  background: "rgba(239, 68, 68, 0.14)",
                  color: "#ef6b5f",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                🚪 Hesaptan Çıkış Yap
              </button>
            </div>
          </div>
        ) : (
          /* GİRİŞ YAPILMAMIŞSA GÖRÜNECEK GİRİŞ / KAYIT FORMU */
          <>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>
              {kayitModu ? "⚔️ Yeni Hesap Oluştur" : "⚔️ Hesaba Giriş Yap"}
            </h1>
            <p style={{ opacity: 0.75, fontSize: 14, margin: "0 0 22px" }}>
              {kayitModu
                ? "Favori köylerini buluta kaydetmek ve toplulukta yer almak için kaydol."
                : "Kayıtlı favorilerine ve topluluk özelliklerine erişmek için giriş yap."}
            </p>

            <form onSubmit={gonder} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="email"
                required
                value={eposta}
                onChange={(e) => setEposta(e.target.value)}
                placeholder="E-posta adresin..."
                style={{
                  padding: "13px 15px",
                  borderRadius: 12,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 15,
                }}
              />

              <input
                type="password"
                required
                minLength={6}
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="Şifren (en az 6 karakter)..."
                style={{
                  padding: "13px 15px",
                  borderRadius: 12,
                  border: "1px solid var(--cizgi)",
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 15,
                }}
              />

              {hata && (
                <p style={{ margin: 0, color: "#ef6b5f", fontSize: 14, fontWeight: 600 }}>{hata}</p>
              )}
              {mesaj && (
                <p style={{ margin: 0, color: "#22c55e", fontSize: 14, fontWeight: 600 }}>{mesaj}</p>
              )}

              <button
                type="submit"
                disabled={yukleniyor}
                style={{
                  padding: "14px",
                  borderRadius: 12,
                  border: 0,
                  background: "var(--vurgu)",
                  color: "var(--vurgu-yazi)",
                  fontWeight: 800,
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                {yukleniyor ? "İşleniyor..." : kayitModu ? "Kaydol" : "Giriş Yap"}
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: "center", fontSize: 14 }}>
              <button
                type="button"
                onClick={() => {
                  setKayitModu(!kayitModu);
                  setHata("");
                  setMesaj("");
                }}
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--vurgu)",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {kayitModu
                  ? "Zaten hesabın var mı? Giriş yap"
                  : "Hesabın yok mu? Hemen kaydol"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
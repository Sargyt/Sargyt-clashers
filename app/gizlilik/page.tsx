import { EPOSTA } from "../iletisim";
export default function Gizlilik() {
  return (
    <main style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto", lineHeight: 1.6 }}>
      <h1>Gizlilik</h1>
      <p style={{ opacity: 0.75 }}>
        Bu sayfa sitenin şu anki durumunu anlatır. Üyelik gibi yeni özellikler eklendiğinde
        güncellenecektir.
      </p>

      <h2>Hangi verileri işliyoruz?</h2>
      <p>
        Bir köy kodu aradığında, girdiğin kod Supercell&apos;in oyun verisi servisine sunucumuz
        üzerinden iletilir ve dönen herkese açık oyuncu bilgisi ekranda gösterilir. Bu bilgiyi
        kalıcı olarak saklamıyoruz.
      </p>
      <p>
        Seçtiğin tema ve favori köyler yalnızca senin tarayıcında saklanır. Bu bilgiler sunucumuza
        gönderilmez, tarayıcı verilerini silersen kaybolur.
      </p>
      <p>
        Sitenin yayınlandığı altyapı (Vercel), teknik amaçlı olarak ziyaretlere ait sunucu kayıtları
        (örneğin IP adresi ve istek zamanı) tutabilir.
      </p>

      <h2>Hesap ve şifre</h2>
      <p>
        Oyunun giriş bilgilerini (Supercell ID, şifre) hiçbir zaman istemeyiz ve istemeyeceğiz.
      </p>

      <h2>Bize ulaş</h2>
      <p>
  Bir sorun, hata ya da talep için: <a href={"mailto:" + EPOSTA}>{EPOSTA}</a>
</p>

      <p style={{ opacity: 0.75, fontSize: 14, marginTop: 24 }}>
        Bu site Supercell tarafından desteklenmemekte veya onaylanmamaktadır.
      </p>
    </main>
  );
}
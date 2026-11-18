import Link from "next/link";
import { EPOSTA } from "./iletisim";

export default function Altbilgi() {
  return (
    <footer
      style={{
        marginTop: 40,
        padding: "20px 24px",
        borderTop: "1px solid var(--cizgi)",
        fontSize: 13,
        opacity: 0.8,
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 6 }}>
        <Link href="/hakkinda">Hakkında</Link> · <Link href="/gizlilik">Gizlilik</Link> ·{" "}
<a href={"mailto:" + EPOSTA}>İletişim</a>
      </div>
      Sargyt Clashers, Supercell tarafından desteklenmemekte veya onaylanmamaktadır.
    </footer>
  );
}
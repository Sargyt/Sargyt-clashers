import Link from "next/link";

export default function Menu() {
  const stil = { color: "inherit", textDecoration: "none", padding: "6px 12px" };
  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        padding: "12px 24px",
        borderBottom: "1px solid #ccc",
        fontFamily: "sans-serif",
        flexWrap: "wrap",
      }}
    >
      <strong style={{ marginRight: 16 }}>⚔️ Sargyt Clashers</strong>
      <Link href="/" style={stil}>Ana Sayfa</Link>
      <Link href="/ordular" style={stil}>Ordular</Link>
      <Link href="/ansiklopedi" style={stil}>Ansiklopedi</Link>
    </nav>
  );
}
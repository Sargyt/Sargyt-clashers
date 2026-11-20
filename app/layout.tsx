import type { Metadata, Viewport } from "next";
import { Baloo_2, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "./Menu";
import Altbilgi from "./Altbilgi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo2 = Baloo_2({
  variable: "--font-baslik",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sargyt-clashers.vercel.app"),
  title: {
    default: "Sargyt Clashers · Clash of Clans Köy Analizi & Rehber",
    template: "%s · Sargyt Clashers",
  },
  description:
    "Clash of Clans köy analizi, ekipman ve cevher danışmanı, inşaatçı takipçisi, klan savaş radarı, meta ordular ve ilan panosu.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sargyt Clashers",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://sargyt-clashers.vercel.app",
    siteName: "Sargyt Clashers",
    title: "Sargyt Clashers · Clash of Clans Köy Analizi & Rehber",
    description:
      "Köy kodunu gir; kahramanlarını, ekipman önceliklerini, gelişim geçmişini ve klan savaşlarını tek ekranda incele.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sargyt Clashers · Clash of Clans Portalı",
    description:
      "Köy analizi, cevher danışmanı, inşaatçı takipçisi ve klan ilan panosu.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-theme="altin-koyu"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${baloo2.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("tema");if(t){document.documentElement.setAttribute("data-theme",t);}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Menu />
        {children}
        <Altbilgi />
      </body>
    </html>
  );
}
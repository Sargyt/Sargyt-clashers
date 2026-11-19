import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Sargyt Clashers",
  description: "Clash of Clans köy analizi ve rehber sitesi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      data-theme="altin-koyu"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WORLD CONFLICT 1945 - Global Command",
  description: "Estrategia multijugador en tiempo real.",
  keywords: ["strategy game", "WWII", "multiplayer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${notoSans.variable} font-sans antialiased bg-[#0f1c23] text-zinc-100 overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}

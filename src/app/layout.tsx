import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WORLD CONFLICT 1945 - Estrategia Multijugador WWII",
  description: "El juego de estrategia multijugador en tiempo real de la Segunda Guerra Mundial. Conquista territorios, forma alianzas y domina el mundo.",
  keywords: ["strategy game", "WWII", "multiplayer", "world war 2", "war game", "real-time strategy"],
  authors: [{ name: "World Conflict Team" }],
  openGraph: {
    title: "WORLD CONFLICT 1945",
    description: "Estrategia multijugador en tiempo real de la Segunda Guerra Mundial",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}

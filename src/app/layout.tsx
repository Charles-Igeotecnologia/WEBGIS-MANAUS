import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Território Digital - Web GIS Manaus — Localidades, Bairros e Zonas",
  description:
    "Aplicação Web GIS interativa para visualização, análise cartográfica e geração de relatórios das divisões administrativas de Manaus/AM.",
  keywords: [
    "Web GIS",
    "Manaus",
    "Bairros",
    "Zonas",
    "Localidades",
    "Leaflet",
    "Cartografia",
    "Mapa",
  ],
  authors: [{ name: "Território Digital - Web GIS Manaus" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Território Digital - Web GIS Manaus — Localidades, Bairros e Zonas",
    description:
      "Visualização, análise cartográfica e geração de relatórios das divisões de Manaus/AM.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

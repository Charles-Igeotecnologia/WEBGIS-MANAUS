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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var div = document.getElementById('debug-err') || document.createElement('div');
                div.id = 'debug-err';
                div.style.position = 'fixed';
                div.style.bottom = '10px';
                div.style.right = '10px';
                div.style.background = '#ef4444';
                div.style.color = 'white';
                div.style.zIndex = '999999';
                div.style.padding = '15px';
                div.style.borderRadius = '8px';
                div.style.fontSize = '12px';
                div.style.fontFamily = 'monospace';
                div.style.maxWidth = '80%';
                div.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                var msg = '';
                if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                  msg = '<strong>Erro de Recurso:</strong> Não foi possível carregar o arquivo: ' + (e.target.src || e.target.href);
                } else {
                  msg = '<strong>Erro JS:</strong> ' + e.message + ' em ' + e.filename + ':' + e.lineno;
                }
                div.innerHTML = msg;
                document.body.appendChild(div);
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                var div = document.getElementById('debug-err-promise') || document.createElement('div');
                div.id = 'debug-err-promise';
                div.style.position = 'fixed';
                div.style.bottom = '80px';
                div.style.right = '10px';
                div.style.background = '#b91c1c';
                div.style.color = 'white';
                div.style.zIndex = '999999';
                div.style.padding = '15px';
                div.style.borderRadius = '8px';
                div.style.fontSize = '12px';
                div.style.fontFamily = 'monospace';
                div.style.maxWidth = '80%';
                div.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                div.innerHTML = '<strong>Promise Rejeitada:</strong> ' + (e.reason ? e.reason.message || e.reason : 'Erro desconhecido');
                document.body.appendChild(div);
              });
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

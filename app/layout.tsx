import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Italy Pulse — Piattaforma Analitica OSINT",
  description: "Dashboard OSINT C4ISR in tempo reale per l'Italia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}

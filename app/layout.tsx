import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "SALA OPERATIVA — Italy OSINT Command Center",
  description: "Real-time Italian intelligence and OSINT platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/Widgets/widgets.css" />
      </head>
      <body className="antialiased overflow-hidden h-screen w-screen">
        <Script
          src="https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/Cesium.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}

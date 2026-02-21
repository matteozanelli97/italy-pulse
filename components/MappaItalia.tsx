"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Regione } from "@/types";
import { getSentimentColore } from "@/lib/regions";

interface MappaItaliaProps {
  regioni: Regione[];
}

// SVG paths semplificati per le 20 regioni italiane
// Coordinate basate su una viewBox 400x550
const regionPaths: Record<string, string> = {
  "valle-d-aosta":
    "M 52,95 L 62,85 L 72,88 L 75,98 L 68,105 L 55,102 Z",
  piemonte:
    "M 55,102 L 68,105 L 75,98 L 85,95 L 100,100 L 110,115 L 115,135 L 105,155 L 90,160 L 70,155 L 55,140 L 48,120 Z",
  lombardia:
    "M 100,100 L 115,80 L 135,75 L 155,80 L 170,90 L 175,110 L 170,130 L 155,140 L 140,145 L 125,140 L 115,135 L 110,115 Z",
  "trentino-alto-adige":
    "M 170,90 L 180,65 L 200,55 L 220,60 L 225,75 L 215,90 L 200,95 L 185,95 Z",
  veneto:
    "M 175,110 L 185,95 L 200,95 L 215,90 L 230,95 L 240,110 L 235,130 L 215,140 L 195,138 L 180,130 Z",
  "friuli-venezia-giulia":
    "M 230,95 L 245,80 L 270,78 L 280,90 L 275,105 L 260,115 L 245,115 L 240,110 Z",
  liguria:
    "M 55,140 L 70,155 L 90,160 L 105,165 L 120,175 L 110,182 L 90,180 L 70,175 L 55,165 Z",
  "emilia-romagna":
    "M 105,155 L 125,140 L 140,145 L 155,140 L 170,130 L 180,130 L 195,138 L 215,140 L 220,150 L 200,165 L 175,175 L 150,178 L 130,175 L 120,175 L 105,165 Z",
  toscana:
    "M 120,175 L 130,175 L 150,178 L 175,175 L 180,190 L 175,210 L 165,230 L 155,245 L 140,248 L 125,240 L 115,220 L 110,200 L 112,185 Z",
  umbria:
    "M 175,210 L 180,195 L 200,195 L 210,210 L 205,230 L 195,240 L 180,240 L 170,230 Z",
  marche:
    "M 200,165 L 220,150 L 240,160 L 248,175 L 245,195 L 235,210 L 220,215 L 210,210 L 200,195 L 180,195 L 175,175 Z",
  lazio:
    "M 140,248 L 155,245 L 165,230 L 170,230 L 180,240 L 195,240 L 205,250 L 210,265 L 200,285 L 185,295 L 170,290 L 155,280 L 145,268 Z",
  abruzzo:
    "M 205,230 L 210,210 L 220,215 L 235,210 L 245,220 L 245,240 L 235,255 L 220,260 L 210,250 Z",
  molise:
    "M 220,260 L 235,255 L 245,260 L 248,275 L 240,280 L 228,278 L 220,270 Z",
  campania:
    "M 200,285 L 210,265 L 205,250 L 210,250 L 220,260 L 220,270 L 228,278 L 235,290 L 240,305 L 235,320 L 220,325 L 205,315 L 195,300 Z",
  puglia:
    "M 245,240 L 260,235 L 280,240 L 300,255 L 320,275 L 330,290 L 325,305 L 310,310 L 290,305 L 270,295 L 255,285 L 248,275 L 245,260 Z",
  basilicata:
    "M 240,305 L 255,285 L 270,295 L 275,310 L 268,325 L 255,330 L 242,322 Z",
  calabria:
    "M 242,322 L 255,330 L 260,345 L 255,365 L 248,385 L 240,400 L 232,408 L 225,395 L 228,375 L 232,355 L 235,335 Z",
  sicilia:
    "M 175,400 L 195,390 L 215,395 L 235,410 L 250,420 L 245,435 L 225,445 L 200,448 L 180,440 L 165,428 L 160,415 Z",
  sardegna:
    "M 90,310 L 105,300 L 120,305 L 128,320 L 130,340 L 128,360 L 120,380 L 108,390 L 95,385 L 85,370 L 80,350 L 82,330 Z",
};

export default function MappaItalia({ regioni }: MappaItaliaProps) {
  const router = useRouter();
  const [hoveredRegion, setHoveredRegion] = useState<Regione | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const regioneMap = new Map(regioni.map((r) => [r.slug, r]));

  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox="30 40 320 430"
        className="h-auto w-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseLeave={() => setHoveredRegion(null)}
      >
        {Object.entries(regionPaths).map(([slug, path]) => {
          const regione = regioneMap.get(slug);
          if (!regione) return null;

          return (
            <path
              key={slug}
              d={path}
              fill={getSentimentColore(regione.sentiment)}
              stroke="var(--background)"
              strokeWidth="1.5"
              className="region-path"
              onMouseEnter={() => setHoveredRegion(regione)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => router.push(`/regioni/${slug}`)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredRegion && (
        <div
          className="pointer-events-none absolute z-10 rounded border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] px-3 py-2 shadow-lg"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y - 10,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {hoveredRegion.nome}
            </span>
            <span>{hoveredRegion.emoji}</span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="text-2xl font-bold"
              style={{
                color: getSentimentColore(hoveredRegion.sentiment),
                fontFamily: "'Bebas Neue', sans-serif",
              }}
            >
              {hoveredRegion.sentiment}
            </span>
            <span className="text-xs text-[var(--grigio-testo)]">/ 100</span>
          </div>
          <p className="max-w-48 text-[10px] italic text-[var(--grigio-testo)]">
            {hoveredRegion.frase}
          </p>
        </div>
      )}
    </div>
  );
}

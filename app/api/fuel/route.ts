import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface FuelPrice {
  region: string;
  benzina: number;  // EUR/L
  diesel: number;   // EUR/L
  gpl: number;      // EUR/L
  metano: number;   // EUR/kg
  trend: 'up' | 'down' | 'stable';
}

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';

// Try fetching from RapidAPI fuel prices endpoint
async function fetchFuelPrices(): Promise<FuelPrice[]> {
  if (!RAPIDAPI_KEY) throw new Error('No RapidAPI key');

  // Using prezzo-benzina API via RapidAPI
  const res = await fetch('https://prezzo-benzina.p.rapidapi.com/regions', {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'prezzo-benzina.p.rapidapi.com',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Fuel API ${res.status}`);
  const data = await res.json();

  // Map API response to our format
  if (Array.isArray(data)) {
    return data.slice(0, 20).map((item: Record<string, unknown>) => ({
      region: (item.name as string) || 'Italia',
      benzina: parseFloat(String(item.benzina || item.gasoline || 1.85)),
      diesel: parseFloat(String(item.diesel || item.gasolio || 1.72)),
      gpl: parseFloat(String(item.gpl || 0.73)),
      metano: parseFloat(String(item.metano || 1.35)),
      trend: 'stable' as const,
    }));
  }

  throw new Error('Unexpected API response format');
}

// Synthetic Italian fuel prices by region
function generateFallback(): FuelPrice[] {
  const regions = [
    'Lombardia', 'Lazio', 'Campania', 'Sicilia', 'Veneto',
    'Piemonte', 'Emilia-Romagna', 'Toscana', 'Puglia', 'Calabria',
    'Sardegna', 'Liguria', 'Marche', 'Abruzzo', 'Friuli-Venezia Giulia',
    'Trentino-Alto Adige', 'Umbria', 'Basilicata', 'Molise', "Valle d'Aosta",
  ];

  const baseBenzina = 1.82;
  const baseDiesel = 1.69;
  const baseGpl = 0.72;
  const baseMetano = 1.32;

  return regions.map((region) => {
    const variance = (Math.sin(region.length * 7.3 + Date.now() / 3_600_000) * 0.05);
    const trends: FuelPrice['trend'][] = ['up', 'down', 'stable'];
    return {
      region,
      benzina: parseFloat((baseBenzina + variance + Math.random() * 0.06).toFixed(3)),
      diesel: parseFloat((baseDiesel + variance + Math.random() * 0.05).toFixed(3)),
      gpl: parseFloat((baseGpl + variance * 0.3 + Math.random() * 0.03).toFixed(3)),
      metano: parseFloat((baseMetano + variance * 0.5 + Math.random() * 0.08).toFixed(3)),
      trend: trends[Math.floor(Math.random() * 3)],
    };
  });
}

export async function GET() {
  try {
    const prices = await fetchFuelPrices();
    return NextResponse.json({ prices, source: 'rapidapi', updatedAt: new Date().toISOString() });
  } catch {
    const prices = generateFallback();
    return NextResponse.json({ prices, source: 'fallback', updatedAt: new Date().toISOString() });
  }
}

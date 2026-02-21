import { NextResponse } from 'next/server';
import { MONITORED_CITIES } from '@/lib/constants';
import type { AirQualityStation } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use Open-Meteo Air Quality API (free, no key needed)
    const lats = MONITORED_CITIES.slice(0, 10).map((c) => c.lat).join(',');
    const lngs = MONITORED_CITIES.slice(0, 10).map((c) => c.lng).join(',');

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&timezone=Europe/Rome`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Air Quality API ${res.status}`);

    const data = await res.json();

    const stations: AirQualityStation[] = (Array.isArray(data) ? data : [data]).map(
      (d: Record<string, unknown>, i: number) => {
        const c = d.current as Record<string, number> | undefined;
        const aqi = c?.european_aqi ?? 0;
        const dominant = getDominant(c);
        return {
          id: `aq-${i}`,
          name: MONITORED_CITIES[i]?.name ?? `Station ${i}`,
          latitude: MONITORED_CITIES[i]?.lat ?? 0,
          longitude: MONITORED_CITIES[i]?.lng ?? 0,
          aqi,
          level: aqiLevel(aqi),
          dominantPollutant: dominant,
          lastUpdate: new Date().toISOString(),
        };
      }
    );

    return NextResponse.json({ stations, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Air Quality API error:', e);
    return NextResponse.json({ stations: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

function getDominant(c: Record<string, number> | undefined): string {
  if (!c) return 'N/A';
  const pollutants = [
    { name: 'PM2.5', val: c.pm2_5 ?? 0 },
    { name: 'PM10', val: c.pm10 ?? 0 },
    { name: 'NO2', val: c.nitrogen_dioxide ?? 0 },
    { name: 'O3', val: c.ozone ?? 0 },
  ];
  pollutants.sort((a, b) => b.val - a.val);
  return pollutants[0]?.name ?? 'N/A';
}

function aqiLevel(aqi: number): AirQualityStation['level'] {
  if (aqi <= 20) return 'good';
  if (aqi <= 40) return 'moderate';
  if (aqi <= 60) return 'unhealthy_sensitive';
  if (aqi <= 80) return 'unhealthy';
  if (aqi <= 100) return 'very_unhealthy';
  return 'hazardous';
}

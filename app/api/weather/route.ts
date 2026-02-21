import { NextResponse } from 'next/server';
import { MONITORED_CITIES, WMO_CODES } from '@/lib/constants';
import type { WeatherData } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lats = MONITORED_CITIES.map((c) => c.lat).join(',');
    const lngs = MONITORED_CITIES.map((c) => c.lng).join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day,precipitation&timezone=Europe/Rome`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

    const data = await res.json();

    const results: WeatherData[] = Array.isArray(data)
      ? data.map((d: Record<string, unknown>, i: number) => mapCity(d, i))
      : [mapCity(data, 0)];

    return NextResponse.json({ cities: results, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Weather API error:', e);
    return NextResponse.json({ cities: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

function mapCity(d: Record<string, unknown>, i: number): WeatherData {
  const c = d.current as Record<string, number>;
  const code = c?.weather_code ?? 0;
  return {
    city: MONITORED_CITIES[i]?.name ?? `City ${i}`,
    latitude: MONITORED_CITIES[i]?.lat ?? 0,
    longitude: MONITORED_CITIES[i]?.lng ?? 0,
    temperature: c?.temperature_2m ?? 0,
    apparentTemperature: c?.apparent_temperature ?? 0,
    humidity: c?.relative_humidity_2m ?? 0,
    windSpeed: c?.wind_speed_10m ?? 0,
    windDirection: c?.wind_direction_10m ?? 0,
    weatherCode: code,
    weatherDescription: WMO_CODES[code] ?? 'Sconosciuto',
    isDay: (c?.is_day ?? 1) === 1,
    precipitation: c?.precipitation ?? 0,
    alertLevel: getAlertLevel(code, c?.wind_speed_10m ?? 0),
  };
}

function getAlertLevel(code: number, wind: number): WeatherData['alertLevel'] {
  if (code >= 95 || wind > 80) return 'warning';
  if (code >= 80 || wind > 60) return 'watch';
  if (code >= 61 || wind > 40) return 'advisory';
  return 'none';
}

import { NextRequest, NextResponse } from 'next/server';
import { WMO_CODES } from '@/lib/constants';
import type { WeatherData } from '@/types';

export const dynamic = 'force-dynamic';

// Search any Italian city via Open-Meteo geocoding + weather
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ cities: [], error: 'Query too short' }, { status: 400 });
  }

  try {
    // Geocode the city
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=it&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (!geoRes.ok) throw new Error(`Geocoding ${geoRes.status}`);
    const geoData = await geoRes.json();
    const results = (geoData.results ?? []) as Array<{ name: string; latitude: number; longitude: number; country_code: string; admin1?: string }>;

    // Filter to Italian results
    const italian = results.filter((r) => r.country_code === 'IT');
    if (italian.length === 0) {
      return NextResponse.json({ cities: [] });
    }

    // Fetch weather for each match
    const lats = italian.map((r) => r.latitude).join(',');
    const lngs = italian.map((r) => r.longitude).join(',');
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day,precipitation&timezone=Europe/Rome`,
      { next: { revalidate: 300 } }
    );
    if (!wxRes.ok) throw new Error(`Weather ${wxRes.status}`);
    const wxData = await wxRes.json();
    const wxResults = Array.isArray(wxData) ? wxData : [wxData];

    const cities: WeatherData[] = wxResults.map((d: Record<string, unknown>, i: number) => {
      const c = d.current as Record<string, number>;
      const code = c?.weather_code ?? 0;
      const wind = c?.wind_speed_10m ?? 0;
      const loc = italian[i];
      return {
        city: loc?.admin1 ? `${loc.name} (${loc.admin1})` : loc?.name ?? q,
        latitude: loc?.latitude ?? 0,
        longitude: loc?.longitude ?? 0,
        temperature: c?.temperature_2m ?? 0,
        apparentTemperature: c?.apparent_temperature ?? 0,
        humidity: c?.relative_humidity_2m ?? 0,
        windSpeed: wind,
        windDirection: c?.wind_direction_10m ?? 0,
        weatherCode: code,
        weatherDescription: WMO_CODES[code] ?? 'Sconosciuto',
        isDay: (c?.is_day ?? 1) === 1,
        precipitation: c?.precipitation ?? 0,
        alertLevel: code >= 95 || wind > 80 ? 'warning' : code >= 80 || wind > 60 ? 'watch' : code >= 61 || wind > 40 ? 'advisory' : 'none',
      };
    });

    return NextResponse.json({ cities });
  } catch (e) {
    console.error('Weather search error:', e);
    return NextResponse.json({ cities: [], error: true }, { status: 502 });
  }
}

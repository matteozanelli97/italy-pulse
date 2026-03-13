import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SeismicEvent {
  id: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  magnitudeType: string;
  place: string;
  region: string;
}

// INGV Italian earthquake data — last 30 days, M1.0+
// Using FDSN event webservice: http://webservices.ingv.it/fdsnws/event/1/
function getINGVUrl() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const fmt = (d: Date) => d.toISOString().split('T')[0];

  return `http://webservices.ingv.it/fdsnws/event/1/query?starttime=${fmt(startDate)}&endtime=${fmt(endDate)}&minmag=1.0&maxmag=10&mindepth=-10&maxdepth=1000&minlat=35&maxlat=48&minlon=6&maxlon=19&minversion=100&orderby=time-asc&format=text&limit=200`;
}

export async function GET() {
  try {
    const res = await fetch(getINGVUrl(), {
      next: { revalidate: 120 },
      headers: { 'User-Agent': 'SalaOperativa/1.0' },
    });

    if (!res.ok) {
      // Fallback to USGS filtered to Italy region
      return await fetchUSGSFallback();
    }

    const text = await res.text();
    const lines = text.trim().split('\n');
    // Skip header line
    const events: SeismicEvent[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('|');
      if (parts.length < 10) continue;
      events.push({
        id: parts[0]?.trim() || `ingv-${i}`,
        time: parts[1]?.trim() || new Date().toISOString(),
        latitude: parseFloat(parts[2]) || 0,
        longitude: parseFloat(parts[3]) || 0,
        depth: parseFloat(parts[4]) || 0,
        magnitude: parseFloat(parts[10]) || 0,
        magnitudeType: parts[9]?.trim() || 'ML',
        place: parts[12]?.trim() || 'Italia',
        region: parts[12]?.trim() || 'Italia',
      });
    }

    // Sort by time descending (most recent first)
    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ events, updatedAt: new Date().toISOString(), source: 'INGV' });
  } catch (e) {
    console.error('INGV API error, trying USGS fallback:', e);
    return await fetchUSGSFallback();
  }
}

async function fetchUSGSFallback() {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson', {
      next: { revalidate: 120 },
      headers: { 'User-Agent': 'SalaOperativa/1.0' },
    });
    if (!res.ok) {
      return NextResponse.json({ events: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
    }
    const data = await res.json();
    // Filter to Italy bounding box
    const events: SeismicEvent[] = (data.features || [])
      .filter((f: { geometry: { coordinates: number[] } }) => {
        const lng = f.geometry.coordinates[0];
        const lat = f.geometry.coordinates[1];
        return lat >= 35 && lat <= 48 && lng >= 6 && lng <= 19;
      })
      .map((f: { id: string; properties: Record<string, unknown>; geometry: { coordinates: number[] } }) => ({
        id: f.id || `eq-${f.properties.time}`,
        time: new Date(f.properties.time as number).toISOString(),
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2] || 0,
        magnitude: f.properties.mag as number,
        magnitudeType: (f.properties.magType as string) || 'ml',
        place: (f.properties.place as string) || 'Italia',
        region: (f.properties.place as string)?.replace(/^\d+\s*km\s+\w+\s+of\s+/, '') || 'Italia',
      }));

    return NextResponse.json({ events, updatedAt: new Date().toISOString(), source: 'USGS-fallback' });
  } catch {
    return NextResponse.json({ events: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

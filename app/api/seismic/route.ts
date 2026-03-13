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

// USGS global earthquake feed — M2.5+ in the past week
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';

export async function GET() {
  try {
    const res = await fetch(USGS_URL, {
      next: { revalidate: 120 },
      headers: { 'User-Agent': 'Pulse/1.0' },
    });

    if (!res.ok) {
      return NextResponse.json({ events: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
    }

    const data = await res.json();
    const events: SeismicEvent[] = (data.features || []).map((f: { id: string; properties: Record<string, unknown>; geometry: { coordinates: number[] } }) => ({
      id: f.id || `eq-${f.properties.time}`,
      time: new Date(f.properties.time as number).toISOString(),
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2] || 0,
      magnitude: f.properties.mag as number,
      magnitudeType: (f.properties.magType as string) || 'ml',
      place: (f.properties.place as string) || 'Unknown',
      region: (f.properties.place as string)?.replace(/^\d+\s*km\s+\w+\s+of\s+/, '') || 'Unknown',
    }));

    return NextResponse.json({ events, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Seismic API error:', e);
    return NextResponse.json({ events: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

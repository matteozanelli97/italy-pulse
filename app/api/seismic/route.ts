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

export async function GET() {
  try {
    // INGV (Istituto Nazionale di Geofisica e Vulcanologia) — real Italian seismic data
    // Fetch last 50 events from the past 7 days
    const endTime = new Date().toISOString().split('.')[0];
    const startDate = new Date(Date.now() - 7 * 86400000);
    const startTime = startDate.toISOString().split('.')[0];

    const url = `https://webservices.ingv.it/fdsnws/event/1/query?starttime=${startTime}&endtime=${endTime}&minmag=1.5&format=geojson&orderby=time&limit=50`;

    const res = await fetch(url, {
      next: { revalidate: 120 },
      headers: { 'User-Agent': 'ItalyPulse/1.0' },
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
      magnitudeType: (f.properties.magType as string) || 'ML',
      place: (f.properties.place as string) || 'Italia',
      region: (f.properties.place as string)?.replace(/^\d+\s*km\s+\w+\s+/, '') || 'Italia',
    }));

    return NextResponse.json({ events, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Seismic API error:', e);
    return NextResponse.json({ events: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

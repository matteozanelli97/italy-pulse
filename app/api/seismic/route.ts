import { NextResponse } from 'next/server';
import type { SeismicEvent } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const url = `https://webservices.ingv.it/fdsnws/event/1/query?starttime=${fmt(start)}&endtime=${fmt(now)}&minmag=2&format=geojson&orderby=time&limit=50`;

    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`INGV ${res.status}`);

    const geo = await res.json();

    const events: SeismicEvent[] = geo.features.map(
      (f: { id: string; properties: Record<string, unknown>; geometry: { coordinates: number[] } }) => ({
        id: f.id,
        time: f.properties.time as string,
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        magnitude: f.properties.mag as number,
        magnitudeType: (f.properties.magType as string) || 'ML',
        description: (f.properties.place as string) || '',
        region: (f.properties.place as string) || '',
      })
    );

    return NextResponse.json({ events, updatedAt: now.toISOString() });
  } catch (e) {
    console.error('Seismic API error:', e);
    return NextResponse.json({ events: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

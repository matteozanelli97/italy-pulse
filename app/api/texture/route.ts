import { NextRequest, NextResponse } from 'next/server';

const ALLOWED: Record<string, string> = {
  day: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.200412.3x5400x2700.jpg',
  night: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79790/city_lights_2012.jpg',
};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const url = id ? ALLOWED[id] : null;
  if (!url) {
    return NextResponse.json({ error: 'Invalid texture id' }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, { next: { revalidate: 86400 } });
    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);

    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch texture' }, { status: 502 });
  }
}

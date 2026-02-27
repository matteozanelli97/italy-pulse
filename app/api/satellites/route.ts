import { NextResponse } from 'next/server';
import type { SatelliteTrack } from '@/types';

export const dynamic = 'force-dynamic';

// CelesTrak public TLE data — compute satellite positions above Italy
const TLE_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json';

const SAT_TYPES: Record<string, SatelliteTrack['type']> = {
  STARLINK: 'communication', ONEWEB: 'communication', IRIDIUM: 'communication',
  GPS: 'navigation', GALILEO: 'navigation', GLONASS: 'navigation', BEIDOU: 'navigation',
  NOAA: 'weather', METEOSAT: 'weather', GOES: 'weather', METOP: 'weather',
  ISS: 'science', HUBBLE: 'science', TIANGONG: 'science',
  USA: 'military', NROL: 'military', LACROSSE: 'military',
};

function classifySat(name: string): SatelliteTrack['type'] {
  const upper = name.toUpperCase();
  for (const [key, type] of Object.entries(SAT_TYPES)) {
    if (upper.includes(key)) return type;
  }
  return 'other';
}

function getCountry(name: string): string {
  const n = name.toUpperCase();
  if (n.includes('STARLINK') || n.includes('GPS') || n.includes('USA') || n.includes('NROL')) return 'US';
  if (n.includes('GALILEO')) return 'EU';
  if (n.includes('GLONASS') || n.includes('COSMOS')) return 'RU';
  if (n.includes('BEIDOU')) return 'CN';
  if (n.includes('METEOSAT')) return 'EU';
  if (n.includes('COSMO') || n.includes('SICRAL')) return 'IT';
  return 'INT';
}

// Simplified SGP4 position estimate from TLE mean elements
function estimatePosition(tle: { MEAN_MOTION: number; INCLINATION: number; RA_OF_ASC_NODE: number; ECCENTRICITY: number; ARG_OF_PERICENTER: number; MEAN_ANOMALY: number; EPOCH: string; NORAD_CAT_ID: number }) {
  const now = Date.now();
  const epoch = new Date(tle.EPOCH).getTime();
  const elapsed = (now - epoch) / 1000; // seconds
  const n = tle.MEAN_MOTION; // revs/day
  const period = 86400 / n; // seconds per orbit
  const phase = ((elapsed % period) / period) * 2 * Math.PI + (tle.MEAN_ANOMALY * Math.PI / 180);
  const inc = tle.INCLINATION * Math.PI / 180;
  const raan = tle.RA_OF_ASC_NODE * Math.PI / 180;
  const earthRotation = (elapsed / 86400) * 2 * Math.PI;

  const lat = Math.asin(Math.sin(inc) * Math.sin(phase)) * 180 / Math.PI;
  const lng = ((Math.atan2(Math.cos(inc) * Math.sin(phase), Math.cos(phase)) + raan - earthRotation) * 180 / Math.PI) % 360;
  const normalizedLng = lng > 180 ? lng - 360 : lng < -180 ? lng + 360 : lng;

  const a = 42241.122 / Math.pow(n, 2 / 3); // semi-major axis in km (approx)
  const alt = a - 6371; // altitude above Earth surface

  return { lat, lng: normalizedLng, alt: Math.max(100, alt), velocity: n * 2 * Math.PI * a / 86400 };
}

export async function GET() {
  try {
    const res = await fetch(TLE_URL, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'ItalyPulse/1.0' },
    });

    if (!res.ok) throw new Error(`CelesTrak ${res.status}`);
    const data = await res.json();

    // Filter satellites near Italy and limit count
    const italySats: SatelliteTrack[] = [];
    const tles = Array.isArray(data) ? data : [];

    for (const tle of tles) {
      if (italySats.length >= 80) break;
      if (!tle.MEAN_MOTION || !tle.NORAD_CAT_ID) continue;

      try {
        const pos = estimatePosition(tle);
        // Filter to roughly above/near Italy (wide area)
        if (pos.lat >= 30 && pos.lat <= 55 && pos.lng >= -5 && pos.lng <= 25) {
          italySats.push({
            id: `sat-${tle.NORAD_CAT_ID}`,
            name: tle.OBJECT_NAME || `SAT-${tle.NORAD_CAT_ID}`,
            noradId: tle.NORAD_CAT_ID,
            latitude: pos.lat,
            longitude: pos.lng,
            altitude: pos.alt,
            velocity: pos.velocity,
            type: classifySat(tle.OBJECT_NAME || ''),
            country: getCountry(tle.OBJECT_NAME || ''),
          });
        }
      } catch { /* skip malformed */ }
    }

    return NextResponse.json({ satellites: italySats, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Satellites API error:', e);
    return NextResponse.json({ satellites: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

import { NextResponse } from 'next/server';
import type { FlightTrack } from '@/types';

export const dynamic = 'force-dynamic';

// OpenSky Network — free, no API key needed (rate-limited)
// Bounding box for Italy: lat 35.5-47.1, lon 6.6-18.6
const OPENSKY_URL = 'https://opensky-network.org/api/states/all?lamin=35.5&lomin=6.6&lamax=47.1&lomax=18.6';

// Classify aircraft by callsign
function classifyFlight(callsign: string): FlightTrack['type'] {
  const cs = callsign.trim().toUpperCase();
  // Italian military
  if (/^IAM|^MM\d|^I-AM|^NAVY|^HAWK|^ARROW|^STORM|^EAGLE|^VIPER/i.test(cs)) return 'military';
  // NATO/US military
  if (/^RCH|^REACH|^DARK|^TOPCAT|^DOOM|^EVAC|^CNV|^SAM|^AACS/i.test(cs)) return 'military';
  // Cargo
  if (/^FDX|^UPS|^GTI|^CLX|^QY|^ABW|^MPH|^ICL|^BOX/i.test(cs)) return 'cargo';
  // Private/general aviation
  if (/^I-[A-Z]{4}$/.test(cs)) return 'private';
  return 'commercial';
}

export async function GET() {
  try {
    const res = await fetch(OPENSKY_URL, {
      next: { revalidate: 15 },
      headers: { 'User-Agent': 'ItalyPulse/1.0' },
    });

    if (!res.ok) {
      // OpenSky may rate-limit — return empty gracefully
      return NextResponse.json({ flights: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
    }

    const data = await res.json();
    const states: unknown[][] = data.states ?? [];

    const flights: FlightTrack[] = states
      .filter((s) => s[5] != null && s[6] != null) // must have lon, lat
      .slice(0, 60) // limit for performance
      .map((s, i) => {
        const callsign = ((s[1] as string) ?? '').trim() || `UNKN${i}`;
        const type = classifyFlight(callsign);
        return {
          id: `osky-${(s[0] as string) ?? i}`,
          callsign,
          origin: (s[2] as string) ?? 'N/A',
          destination: '', // OpenSky doesn't provide destination
          longitude: s[5] as number,
          latitude: s[6] as number,
          altitude: ((s[7] as number) ?? 0) * 3.281, // meters to feet
          speed: ((s[9] as number) ?? 0) * 1.944, // m/s to knots
          heading: (s[10] as number) ?? 0,
          type,
          squawk: (s[14] as string) ?? undefined,
          timestamp: new Date().toISOString(),
        };
      });

    return NextResponse.json({ flights, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error('OpenSky API error:', e);
    return NextResponse.json({ flights: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
  }
}

import { NextResponse } from 'next/server';
import type { FlightTrack } from '@/types';

export const dynamic = 'force-dynamic';

// OpenSky Network — free, no API key needed (rate-limited)
// Global endpoint — no bounding box
const OPENSKY_URL = 'https://opensky-network.org/api/states/all';

// Classify aircraft by callsign — global NATO and military patterns
function classifyFlight(callsign: string): FlightTrack['type'] {
  const cs = callsign.trim().toUpperCase();

  // US Military / NATO
  if (/^RCH|^REACH|^DARK|^TOPCAT|^DOOM|^EVAC|^CNV|^SAM|^AACS|^JAKE|^IRON|^STEEL|^BOLT|^ATLAS|^NOBLE|^HAVOC/.test(cs)) return 'military';
  // US Air Force / Navy / Army
  if (/^AF[0-9]|^NAVY|^ARMY|^MARN|^CGD|^PAT|^RFF|^AIO|^HKY|^MCG|^SPAR/.test(cs)) return 'military';
  // Italian military
  if (/^IAM|^MM\d|^I-AM/.test(cs)) return 'military';
  // UK Royal Air Force
  if (/^RRR|^RFR|^ASY|^TARTN/.test(cs)) return 'military';
  // French Air Force
  if (/^FAF|^CTM|^COTAM/.test(cs)) return 'military';
  // German Air Force
  if (/^GAF|^DCN/.test(cs)) return 'military';
  // Russian military
  if (/^RFF|^RF\d/.test(cs)) return 'military';
  // Chinese military
  if (/^CFC|^PLAAF/.test(cs)) return 'military';
  // NATO AWACS / tankers / generic
  if (/^NATO|^AWACS|^VIPER|^HAWK|^EAGLE|^ARROW|^STORM|^COBRA|^PYTHON|^DRAGON|^TITAN/.test(cs)) return 'military';
  // Emergency squawk patterns handled separately

  // Cargo carriers
  if (/^FDX|^UPS|^GTI|^CLX|^QY|^ABW|^MPH|^ICL|^BOX|^CKS|^GEC|^ANA|^NCA|^KAL|^SQC|^CPA|^CAO/.test(cs)) return 'cargo';

  // Private / general aviation (common registration patterns)
  if (/^N\d{1,5}[A-Z]{0,2}$/.test(cs)) return 'private'; // US N-numbers
  if (/^[A-Z]-[A-Z]{4}$/.test(cs)) return 'private'; // European registrations
  if (/^[A-Z]{2}-[A-Z]{3}$/.test(cs)) return 'private';

  return 'commercial';
}

export async function GET() {
  try {
    const res = await fetch(OPENSKY_URL, {
      next: { revalidate: 15 },
      headers: { 'User-Agent': 'Pulse/1.0' },
    });

    if (!res.ok) {
      // OpenSky may rate-limit — return empty gracefully
      return NextResponse.json({ flights: [], updatedAt: new Date().toISOString(), error: true }, { status: 502 });
    }

    const data = await res.json();
    const states: unknown[][] = data.states ?? [];

    const flights: FlightTrack[] = states
      .filter((s) => s[5] != null && s[6] != null) // must have lon, lat
      .slice(0, 200) // global limit
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

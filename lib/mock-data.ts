// ============================================================
// ITALY PULSE — Mock Data Generators (Flights, Cyber, Naval)
// ============================================================

import type { FlightTrack, CyberThreat, NavalTrack } from '@/types';

// ─── Italian airports / waypoints ───
const AIRPORTS = [
  { code: 'FCO', name: 'Fiumicino', lat: 41.8003, lng: 12.2389 },
  { code: 'MXP', name: 'Malpensa', lat: 45.6306, lng: 8.7281 },
  { code: 'LIN', name: 'Linate', lat: 45.449, lng: 9.2783 },
  { code: 'NAP', name: 'Napoli', lat: 40.886, lng: 14.2908 },
  { code: 'VCE', name: 'Venezia', lat: 45.5053, lng: 12.3519 },
  { code: 'BLQ', name: 'Bologna', lat: 44.5354, lng: 11.2887 },
  { code: 'CTA', name: 'Catania', lat: 37.4668, lng: 15.0664 },
  { code: 'PMO', name: 'Palermo', lat: 38.176, lng: 13.091 },
  { code: 'TRN', name: 'Torino', lat: 45.2008, lng: 7.6494 },
  { code: 'FLR', name: 'Firenze', lat: 43.81, lng: 11.2051 },
];

const AIRLINES = ['AZ', 'FR', 'U2', 'W6', 'LH', 'BA', 'AF', 'IB', 'VY', 'NO'];
const MIL_CALLSIGNS = ['IAM', 'NAVY', 'HAWK', 'ARROW', 'STORM', 'EAGLE', 'VIPER'];

const FLIGHT_TYPES: FlightTrack['type'][] = ['commercial', 'commercial', 'commercial', 'cargo', 'military', 'private'];

function randomBetween(a: number, b: number) { return a + Math.random() * (b - a); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

let flightSeed = 0;
export function generateFlights(count = 18): FlightTrack[] {
  flightSeed++;
  const flights: FlightTrack[] = [];
  for (let i = 0; i < count; i++) {
    const type = pick(FLIGHT_TYPES);
    const origin = pick(AIRPORTS);
    let dest = pick(AIRPORTS);
    while (dest.code === origin.code) dest = pick(AIRPORTS);

    const t = (Date.now() / 60000 + i * 7 + flightSeed) % 100 / 100;
    const lat = origin.lat + (dest.lat - origin.lat) * t + randomBetween(-0.3, 0.3);
    const lng = origin.lng + (dest.lng - origin.lng) * t + randomBetween(-0.3, 0.3);
    const heading = Math.atan2(dest.lng - origin.lng, dest.lat - origin.lat) * (180 / Math.PI);

    const callsign = type === 'military'
      ? `${pick(MIL_CALLSIGNS)}${Math.floor(randomBetween(10, 99))}`
      : `${pick(AIRLINES)}${Math.floor(randomBetween(100, 9999))}`;

    flights.push({
      id: `fl-${i}-${flightSeed}`,
      callsign,
      origin: origin.code,
      destination: dest.code,
      latitude: Math.max(35.5, Math.min(47.1, lat)),
      longitude: Math.max(6.6, Math.min(18.6, lng)),
      altitude: type === 'military' ? randomBetween(500, 15000) : randomBetween(8000, 12000),
      speed: type === 'military' ? randomBetween(400, 900) : randomBetween(200, 500),
      heading: ((heading % 360) + 360) % 360,
      type,
      squawk: type === 'military' ? '7700' : undefined,
      timestamp: new Date().toISOString(),
    });
  }
  return flights;
}

// ─── Cyber threats ───
const THREAT_TYPES: CyberThreat['type'][] = ['ddos', 'malware', 'phishing', 'intrusion', 'ransomware', 'data_breach'];
const SOURCE_COUNTRIES = ['CN', 'RU', 'KP', 'IR', 'BR', 'US', 'UA', 'RO', 'NG', 'PK'];
const SECTORS = ['Governo', 'Banche', 'Telecomunicazioni', 'Energia', 'Difesa', 'Sanità', 'Trasporti', 'Industria', 'Media'];
const THREAT_DESCS: Record<CyberThreat['type'], string[]> = {
  ddos: ['Attacco DDoS volumetrico rilevato', 'Flood SYN su porta 443', 'Amplificazione DNS rilevata'],
  malware: ['Trojan bancario intercettato', 'Nuovo ransomware in distribuzione', 'Cryptominer su infrastruttura critica'],
  phishing: ['Campagna spear-phishing contro PA', 'Phishing credenziali bancarie', 'SMS phishing su larga scala'],
  intrusion: ['Accesso non autorizzato a DB', 'Lateral movement rilevato', 'Privilege escalation su server'],
  ransomware: ['LockBit 4.0 variant rilevato', 'Ransomware targeting ASL', 'Cifratura file su rete comunale'],
  data_breach: ['Esfiltrazione dati sensibili', 'Dump DB su darknet', 'Leak credenziali aziendali'],
};

let cyberSeed = 0;
export function generateCyberThreats(count = 12): CyberThreat[] {
  cyberSeed++;
  const threats: CyberThreat[] = [];
  for (let i = 0; i < count; i++) {
    const type = pick(THREAT_TYPES);
    const severities: CyberThreat['severity'][] = ['low', 'medium', 'high', 'critical'];
    threats.push({
      id: `cy-${i}-${cyberSeed}`,
      type,
      sourceIP: `${Math.floor(randomBetween(10, 255))}.${Math.floor(randomBetween(0, 255))}.${Math.floor(randomBetween(0, 255))}.${Math.floor(randomBetween(1, 254))}`,
      sourceCountry: pick(SOURCE_COUNTRIES),
      targetSector: pick(SECTORS),
      severity: pick(severities),
      description: pick(THREAT_DESCS[type]),
      timestamp: new Date(Date.now() - randomBetween(0, 3600000)).toISOString(),
      latitude: randomBetween(37, 46),
      longitude: randomBetween(7, 17),
    });
  }
  return threats.sort((a, b) => {
    const sev = { critical: 0, high: 1, medium: 2, low: 3 };
    return sev[a.severity] - sev[b.severity];
  });
}

// ─── Naval / AIS ───
const VESSEL_NAMES = [
  'MSC SOFIA', 'EVERGREEN STAR', 'NAVE CAVOUR', 'CMA CGM TIRRENO',
  'COSTA PACIFICA', 'ITS MARGOTTINI', 'PORTO DI GENOVA', 'ATLANTIC SPIRIT',
  'MAERSK ADRIATICO', 'GRIMALDI EXPRESS', 'GNL SICILIA', 'SAIPEM 7000',
];
const VESSEL_TYPES: NavalTrack['type'][] = ['cargo', 'cargo', 'tanker', 'military', 'passenger', 'fishing'];
const FLAGS = ['IT', 'MT', 'PA', 'LR', 'MH', 'GR', 'CY', 'IT', 'IT'];
const PORTS = ['Genova', 'Napoli', 'Trieste', 'Gioia Tauro', 'Livorno', 'Venezia', 'Augusta', 'Taranto', 'La Spezia'];

// Mediterranean sea lanes near Italy
const SEA_POINTS = [
  { lat: 40.5, lng: 14.0 }, { lat: 38.0, lng: 13.0 }, { lat: 37.0, lng: 15.5 },
  { lat: 39.5, lng: 8.5 }, { lat: 44.3, lng: 9.0 }, { lat: 45.4, lng: 12.3 },
  { lat: 42.0, lng: 10.0 }, { lat: 36.5, lng: 14.0 }, { lat: 41.0, lng: 17.0 },
];

let navalSeed = 0;
export function generateNavalTracks(count = 14): NavalTrack[] {
  navalSeed++;
  const tracks: NavalTrack[] = [];
  for (let i = 0; i < count; i++) {
    const base = pick(SEA_POINTS);
    const type = pick(VESSEL_TYPES);
    tracks.push({
      id: `nv-${i}-${navalSeed}`,
      mmsi: `${Math.floor(randomBetween(200000000, 799999999))}`,
      name: pick(VESSEL_NAMES),
      type,
      latitude: base.lat + randomBetween(-1.5, 1.5),
      longitude: base.lng + randomBetween(-1.5, 1.5),
      speed: type === 'fishing' ? randomBetween(2, 6) : randomBetween(8, 22),
      heading: randomBetween(0, 360),
      destination: pick(PORTS),
      flag: pick(FLAGS),
      timestamp: new Date().toISOString(),
    });
  }
  return tracks;
}

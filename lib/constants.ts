// ============================================================
// ITALY PULSE — Constants & Configuration
// ============================================================

import type { GeoCoord, ModuleConfig } from '@/types';

export const ITALY_CENTER: GeoCoord = { lat: 42.0, lng: 12.5 };
export const ITALY_ZOOM = 5.8;
export const ITALY_PITCH = 50;
export const ITALY_BEARING = -5;

export const ITALY_BOUNDS = {
  north: 47.1, south: 35.5, west: 6.6, east: 18.6,
} as const;

// Polling intervals (ms)
export const POLL_SEISMIC = 30_000;
export const POLL_WEATHER = 300_000;
export const POLL_MARKETS = 60_000;
export const POLL_NEWS = 120_000;
export const POLL_AIR_QUALITY = 600_000;
export const POLL_TRANSPORT = 180_000;
export const POLL_ENERGY = 300_000;
export const POLL_SATELLITES = 30_000;

export const MONITORED_CITIES = [
  { name: 'Roma', lat: 41.9028, lng: 12.4964 },
  { name: 'Milano', lat: 45.4642, lng: 9.19 },
  { name: 'Napoli', lat: 40.8518, lng: 14.2681 },
  { name: 'Torino', lat: 45.0703, lng: 7.6869 },
  { name: 'Palermo', lat: 38.1157, lng: 13.3615 },
  { name: 'Genova', lat: 44.4056, lng: 8.9463 },
  { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
  { name: 'Firenze', lat: 43.7696, lng: 11.2558 },
  { name: 'Bari', lat: 41.1171, lng: 16.8719 },
  { name: 'Catania', lat: 37.5079, lng: 15.09 },
  { name: 'Venezia', lat: 45.4408, lng: 12.3155 },
  { name: 'Cagliari', lat: 39.2238, lng: 9.1217 },
  { name: 'Trieste', lat: 45.6495, lng: 13.7768 },
  { name: "L'Aquila", lat: 42.3498, lng: 13.3995 },
  { name: 'Perugia', lat: 43.1107, lng: 12.3908 },
  { name: 'Ancona', lat: 43.6158, lng: 13.5189 },
  { name: 'Potenza', lat: 40.6404, lng: 15.8056 },
  { name: 'Catanzaro', lat: 38.891, lng: 16.5987 },
  { name: 'Campobasso', lat: 41.5603, lng: 14.6626 },
  { name: 'Aosta', lat: 45.7375, lng: 7.3154 },
] as const;

export const SEVERITY_COLORS = {
  low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626',
} as const;

// News category colors
export const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#8b5cf6',
  Defense: '#ef4444',
  Economy: '#f59e0b',
  World: '#3b82f6',
  Cronaca: '#ec4899',
  Entertainment: '#10b981',
};

// Left panel modules — fixed, no drag-drop
export const MODULES: ModuleConfig[] = [
  { id: 'markets', label: 'Mercati', description: 'Mercati IT/US + Energia', icon: 'markets' },
  { id: 'weatherAqi', label: 'Meteo & AQI', description: 'Meteo + Qualità Aria', icon: 'weather' },
  { id: 'mobility', label: 'Viabilità', description: 'Traffico e trasporti live', icon: 'mobility' },
  { id: 'cyber', label: 'Cyber Intel', description: 'Attacchi e outage', icon: 'cyber' },
  { id: 'livecams', label: 'Live Cams', description: 'Webcam e dirette', icon: 'livecams' },
];

export const WMO_CODES: Record<number, string> = {
  0: 'Sereno', 1: 'Prevalentemente sereno', 2: 'Parzialmente nuvoloso', 3: 'Coperto',
  45: 'Nebbia', 48: 'Nebbia con brina',
  51: 'Pioviggine leggera', 53: 'Pioviggine moderata', 55: 'Pioviggine intensa',
  61: 'Pioggia leggera', 63: 'Pioggia moderata', 65: 'Pioggia intensa',
  71: 'Neve leggera', 73: 'Neve moderata', 75: 'Neve intensa', 77: 'Granuli di neve',
  80: 'Rovesci leggeri', 81: 'Rovesci moderati', 82: 'Rovesci violenti',
  85: 'Neve leggera a rovesci', 86: 'Neve intensa a rovesci',
  95: 'Temporale', 96: 'Temporale con grandine leggera', 99: 'Temporale con grandine forte',
};

// Source favicons/logos map
export const SOURCE_FAVICONS: Record<string, string> = {
  ANSA: 'https://www.ansa.it/favicon.ico',
  Repubblica: 'https://www.repubblica.it/favicon.ico',
  Corriere: 'https://images2.corrieredellasera.it/etc.clientlibs/corrieredellasera/clientlibs/bundle/resources/images/favicon.ico',
  Sole24Ore: 'https://www.ilsole24ore.com/favicon.ico',
  Adnkronos: 'https://www.adnkronos.com/favicon.ico',
  SkyTG24: 'https://tg24.sky.it/favicon.ico',
  AGI: 'https://www.agi.it/favicon.ico',
  TGCOM24: 'https://www.tgcom24.mediaset.it/favicon.ico',
  Twitter: 'https://abs.twimg.com/favicons/twitter.3.ico',
  YouTube: 'https://www.youtube.com/s/desktop/favicon.ico',
};

// ============================================================
// SALA OPERATIVA — Italian Constants & Configuration
// ============================================================

import type { GeoCoord, ModuleConfig } from '@/types';

export const ITALY_CENTER: GeoCoord = { lat: 42.0, lng: 12.5 };
export const ITALY_ZOOM = 6;
export const ITALY_PITCH = 50;
export const ITALY_BEARING = -5;

// Italy bounding box
export const ITALY_BOUNDS = {
  west: 6.0,
  south: 35.0,
  east: 19.0,
  north: 47.5,
};

// Polling intervals (ms)
export const POLL_WEATHER = 300_000;
export const POLL_MARKETS = 10_000;
export const POLL_NEWS = 120_000;
export const POLL_AIR_QUALITY = 600_000;
export const POLL_TRANSPORT = 120_000;
export const POLL_ENERGY = 300_000;
export const POLL_SATELLITES = 30_000;
export const POLL_SEISMIC = 120_000;

// Italian cities for weather/data polling (20 major cities)
export const ITALIAN_CITIES = [
  { name: 'Roma', lat: 41.9028, lng: 12.4964 },
  { name: 'Milano', lat: 45.4642, lng: 9.1900 },
  { name: 'Napoli', lat: 40.8518, lng: 14.2681 },
  { name: 'Torino', lat: 45.0703, lng: 7.6869 },
  { name: 'Palermo', lat: 38.1157, lng: 13.3615 },
  { name: 'Genova', lat: 44.4056, lng: 8.9463 },
  { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
  { name: 'Firenze', lat: 43.7696, lng: 11.2558 },
  { name: 'Bari', lat: 41.1171, lng: 16.8719 },
  { name: 'Catania', lat: 37.5079, lng: 15.0830 },
  { name: 'Venezia', lat: 45.4408, lng: 12.3155 },
  { name: 'Verona', lat: 45.4384, lng: 10.9916 },
  { name: 'Messina', lat: 38.1938, lng: 15.5540 },
  { name: 'Padova', lat: 45.4064, lng: 11.8768 },
  { name: 'Trieste', lat: 45.6495, lng: 13.7768 },
  { name: 'Cagliari', lat: 39.2238, lng: 9.1217 },
  { name: 'Perugia', lat: 43.1107, lng: 12.3908 },
  { name: 'Reggio Calabria', lat: 38.1112, lng: 15.6471 },
  { name: "L'Aquila", lat: 42.3498, lng: 13.3995 },
  { name: 'Ancona', lat: 43.6158, lng: 13.5189 },
] as const;

// Italian political parties
export const ITALIAN_PARTIES = [
  { id: 'fdi', name: 'Fratelli d\'Italia', abbrev: 'FdI', color: '#003399', leader: 'Giorgia Meloni' },
  { id: 'pd', name: 'Partito Democratico', abbrev: 'PD', color: '#E2001A', leader: 'Elly Schlein' },
  { id: 'm5s', name: 'Movimento 5 Stelle', abbrev: 'M5S', color: '#FFD700', leader: 'Giuseppe Conte' },
  { id: 'lega', name: 'Lega', abbrev: 'Lega', color: '#008000', leader: 'Matteo Salvini' },
  { id: 'fi', name: 'Forza Italia', abbrev: 'FI', color: '#0099CC', leader: 'Antonio Tajani' },
  { id: 'avs', name: 'Alleanza Verdi-Sinistra', abbrev: 'AVS', color: '#4CAF50', leader: 'Nicola Fratoianni' },
  { id: 'iv', name: 'Italia Viva', abbrev: 'IV', color: '#FF6B00', leader: 'Matteo Renzi' },
  { id: 'azione', name: 'Azione', abbrev: 'Az', color: '#1E88E5', leader: 'Carlo Calenda' },
] as const;

export const SEVERITY_COLORS = {
  low: '#2D72D2', medium: '#EC9A3C', high: '#E76A6E', critical: '#CD4246',
} as const;

// News category colors — matching classifyCategory() output
export const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#8b5cf6',
  Economy: '#EC9A3C',
  World: '#2D72D2',
  Cronaca: '#ec4899',
};

// Left panel modules — Italy-focused
export const MODULES: ModuleConfig[] = [
  { id: 'seismic', label: 'Sismica', description: 'Terremoti INGV Italia', icon: 'seismic' },
  { id: 'weather', label: 'Meteo', description: 'Meteo & qualità aria Italia', icon: 'weather' },
  { id: 'flights', label: 'Voli', description: 'Traffico aereo su Italia', icon: 'mobility' },
  { id: 'markets', label: 'Mercati', description: 'FTSE MIB & mercati IT', icon: 'markets' },
  { id: 'services', label: 'Servizi', description: 'Status servizi italiani', icon: 'cyber' },
  { id: 'livecams', label: 'Telecamere', description: 'Webcam italiane', icon: 'livecams' },
];

// WMO weather codes (Italian)
export const WMO_CODES: Record<number, string> = {
  0: 'Cielo sereno', 1: 'Prevalentemente sereno', 2: 'Parzialmente nuvoloso', 3: 'Coperto',
  45: 'Nebbia', 48: 'Nebbia con brina',
  51: 'Pioggerella leggera', 53: 'Pioggerella moderata', 55: 'Pioggerella intensa',
  61: 'Pioggia leggera', 63: 'Pioggia moderata', 65: 'Pioggia forte',
  71: 'Neve leggera', 73: 'Neve moderata', 75: 'Neve forte', 77: 'Granelli di neve',
  80: 'Rovesci leggeri', 81: 'Rovesci moderati', 82: 'Rovesci violenti',
  85: 'Rovesci di neve leggeri', 86: 'Rovesci di neve intensi',
  95: 'Temporale', 96: 'Temporale con grandine leggera', 99: 'Temporale con grandine forte',
};

// Italian news sources
export const SOURCE_FAVICONS: Record<string, string> = {
  ANSA: 'https://www.ansa.it/favicon.ico',
  'Corriere della Sera': 'https://www.corriere.it/favicon.ico',
  'La Repubblica': 'https://www.repubblica.it/favicon.ico',
  'Il Sole 24 Ore': 'https://www.ilsole24ore.com/favicon.ico',
  'La Stampa': 'https://www.lastampa.it/favicon.ico',
  'Il Messaggero': 'https://www.ilmessaggero.it/favicon.ico',
  AGI: 'https://www.agi.it/favicon.ico',
  'Sky TG24': 'https://tg24.sky.it/favicon.ico',
  'RaiNews': 'https://www.rainews.it/favicon.ico',
  'Il Fatto Quotidiano': 'https://www.ilfattoquotidiano.it/favicon.ico',
  Reuters: 'https://www.reuters.com/favicon.ico',
  X: 'https://abs.twimg.com/favicons/twitter.3.ico',
  Twitter: 'https://abs.twimg.com/favicons/twitter.3.ico',
  Telegram: 'https://telegram.org/favicon.ico',
};

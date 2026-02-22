// ============================================================
// ITALY PULSE — Constants & Configuration
// ============================================================

import type { GeoCoord } from '@/types';

// Map defaults — centered on Italy
export const ITALY_CENTER: GeoCoord = { lat: 42.0, lng: 12.5 };
export const ITALY_ZOOM = 6;

// Italy geographical bounds for map restriction
export const ITALY_BOUNDS = {
  north: 47.1,
  south: 35.5,
  west: 6.6,
  east: 18.6,
} as const;

// Polling intervals (ms)
export const POLL_SEISMIC = 30_000;      // 30s — earthquakes
export const POLL_WEATHER = 300_000;     // 5min — weather
export const POLL_MARKETS = 60_000;      // 1min — markets
export const POLL_NEWS = 120_000;        // 2min — news
export const POLL_AIR_QUALITY = 600_000; // 10min — air quality
export const POLL_TRANSPORT = 180_000;   // 3min — transport
export const POLL_ENERGY = 300_000;      // 5min — energy

// Italian cities for weather monitoring
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

// Severity colors
export const SEVERITY_COLORS = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff4444',
  critical: '#ff0044',
} as const;

// Sidebar modules definition
export const SIDEBAR_MODULES = [
  { id: 'dashboard', label: 'Dashboard', description: 'Panoramica generale' },
  { id: 'radar', label: 'Radar Sismico', description: 'Attività sismica in tempo reale' },
  { id: 'satellite', label: 'Satelliti', description: 'Monitoraggio satellitare' },
  { id: 'financial', label: 'Finanza', description: 'Mercati e dati finanziari' },
  { id: 'naval', label: 'Navale', description: 'Tracking marittimo AIS' },
  { id: 'cyber', label: 'Cyber Intel', description: 'Minacce informatiche' },
  { id: 'intel', label: 'Intelligence', description: 'Analisi intelligence' },
  { id: 'weather', label: 'Meteo', description: 'Condizioni meteorologiche' },
  { id: 'airquality', label: 'Qualità Aria', description: 'Indice qualità aria' },
  { id: 'transport', label: 'Trasporti', description: 'Stato trasporti nazionali' },
  { id: 'energy', label: 'Energia', description: 'Mercato energetico' },
] as const;

// WMO Weather codes to descriptions
export const WMO_CODES: Record<number, string> = {
  0: 'Sereno',
  1: 'Prevalentemente sereno',
  2: 'Parzialmente nuvoloso',
  3: 'Coperto',
  45: 'Nebbia',
  48: 'Nebbia con brina',
  51: 'Pioviggine leggera',
  53: 'Pioviggine moderata',
  55: 'Pioviggine intensa',
  61: 'Pioggia leggera',
  63: 'Pioggia moderata',
  65: 'Pioggia intensa',
  71: 'Neve leggera',
  73: 'Neve moderata',
  75: 'Neve intensa',
  77: 'Granuli di neve',
  80: 'Rovesci leggeri',
  81: 'Rovesci moderati',
  82: 'Rovesci violenti',
  85: 'Neve leggera a rovesci',
  86: 'Neve intensa a rovesci',
  95: 'Temporale',
  96: 'Temporale con grandine leggera',
  99: 'Temporale con grandine forte',
};

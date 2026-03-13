// ============================================================
// PULSE — Global Constants & Configuration
// ============================================================

import type { GeoCoord, ModuleConfig } from '@/types';

export const GLOBAL_DEFAULT: GeoCoord = { lat: 30, lng: 0 };
export const ITALY_ZOOM = 2.5;
export const ITALY_PITCH = 50;
export const ITALY_BEARING = -5;

// Polling intervals (ms)
export const POLL_WEATHER = 300_000;
export const POLL_MARKETS = 10_000;       // Fast polling for live ticker
export const POLL_NEWS = 120_000;
export const POLL_AIR_QUALITY = 600_000;
export const POLL_TRANSPORT = 120_000;
export const POLL_ENERGY = 300_000;
export const POLL_SATELLITES = 30_000;

// Global Points of Interest — keyboard shortcuts 1-8
export const POIS = [
  { id: 'pentagon', name: 'Pentagon', lat: 38.871, lng: -77.056, zoom: 14, key: '1', description: 'US Department of Defense HQ' },
  { id: 'kremlin', name: 'Kremlin', lat: 55.752, lng: 37.617, zoom: 14, key: '2', description: 'Russian seat of government' },
  { id: 'burj-khalifa', name: 'Burj Khalifa', lat: 25.197, lng: 55.274, zoom: 14, key: '3', description: 'Tallest building in the world, Dubai' },
  { id: 'london', name: 'London', lat: 51.507, lng: -0.128, zoom: 14, key: '4', description: 'Capital of the United Kingdom' },
  { id: 'tokyo', name: 'Tokyo', lat: 35.682, lng: 139.692, zoom: 14, key: '5', description: 'Capital of Japan' },
  { id: 'beijing', name: 'Beijing', lat: 39.905, lng: 116.397, zoom: 14, key: '6', description: 'Capital of China' },
  { id: 'sydney', name: 'Sydney', lat: -33.869, lng: 151.209, zoom: 14, key: '7', description: 'Largest city in Australia' },
  { id: 'sao-paulo', name: 'Sao Paulo', lat: -23.550, lng: -46.633, zoom: 14, key: '8', description: 'Largest city in South America' },
] as const;

// Global cities covering all continents (20 cities)
export const GLOBAL_CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'Nairobi', lat: -1.2921, lng: 36.8219 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
] as const;

export const SEVERITY_COLORS = {
  low: '#2D72D2', medium: '#EC9A3C', high: '#E76A6E', critical: '#CD4246',
} as const;

// News category colors — 4 categories (English)
export const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#8b5cf6',
  Economy: '#EC9A3C',
  World: '#2D72D2',
  Security: '#ec4899',
};

// Left panel modules (English)
export const MODULES: ModuleConfig[] = [
  { id: 'markets', label: 'Markets', description: 'Global markets & energy', icon: 'markets' },
  { id: 'weather', label: 'Weather', description: 'Weather & air quality', icon: 'weather' },
  { id: 'seismic', label: 'Seismic', description: 'Global earthquakes (USGS)', icon: 'seismic' },
  { id: 'services', label: 'Services', description: 'Global service status', icon: 'cyber' },
  { id: 'livecams', label: 'Live Cams', description: 'Webcams & live feeds', icon: 'livecams' },
  { id: 'flights', label: 'Flights', description: 'Live global air traffic', icon: 'mobility' },
];

// WMO weather codes (English)
export const WMO_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall', 77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

// Source favicons/logos — global news sources
export const SOURCE_FAVICONS: Record<string, string> = {
  Reuters: 'https://www.reuters.com/favicon.ico',
  BBC: 'https://www.bbc.co.uk/favicon.ico',
  CNN: 'https://www.cnn.com/favicon.ico',
  AP: 'https://apnews.com/favicon.ico',
  'Al Jazeera': 'https://www.aljazeera.com/favicon.ico',
  NHK: 'https://www3.nhk.or.jp/favicon.ico',
  NYT: 'https://www.nytimes.com/favicon.ico',
  Guardian: 'https://www.theguardian.com/favicon.ico',
  WashPost: 'https://www.washingtonpost.com/favicon.ico',
  DW: 'https://www.dw.com/favicon.ico',
  France24: 'https://www.france24.com/favicon.ico',
  SCMP: 'https://www.scmp.com/favicon.ico',
  X: 'https://abs.twimg.com/favicons/twitter.3.ico',
  Twitter: 'https://abs.twimg.com/favicons/twitter.3.ico',
  Telegram: 'https://telegram.org/favicon.ico',
};

// ============================================================
// ITALY PULSE — OSINT Dashboard Types
// ============================================================

// --- Map & Geolocation ---
export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: GeoCoord;
  type: 'earthquake' | 'weather' | 'news' | 'airquality' | 'flight';
  label: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  data?: unknown;
}

// --- Seismic (INGV) ---
export interface SeismicEvent {
  id: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  magnitudeType: string;
  description: string;
  region: string;
}

// --- Weather (Open-Meteo) ---
export interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  precipitation: number;
  alertLevel: 'none' | 'advisory' | 'watch' | 'warning';
}

// --- Markets ---
export interface MarketTick {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  lastUpdate: string;
  currency: string;
  sparkline?: number[];
}

// --- News ---
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

// --- Air Quality ---
export interface AirQualityStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aqi: number;
  level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  dominantPollutant: string;
  lastUpdate: string;
}

// --- System Status ---
export interface SystemStatus {
  uptime: number;
  activeSources: number;
  totalSources: number;
  lastSync: string;
  dataPoints: number;
}

// --- Dashboard State ---
export interface DashboardState {
  selectedEvent: MapMarker | null;
  activePanel: string | null;
  mapCenter: GeoCoord;
  mapZoom: number;
  isLive: boolean;
}

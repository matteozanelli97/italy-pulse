// ============================================================
// ITALY PULSE — OSINT Dashboard Types (C4ISR)
// ============================================================

// --- Map & Geolocation ---
export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: GeoCoord;
  type: 'earthquake' | 'weather' | 'news' | 'airquality' | 'flight' | 'cyber' | 'naval';
  label: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  data?: unknown;
}

export interface FlyToTarget {
  lng: number;
  lat: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
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
  isBreaking?: boolean;
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

// --- Transport ---
export interface TransportAlert {
  id: string;
  type: 'train' | 'flight' | 'road';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  route?: string;
}

// --- Energy ---
export interface EnergyData {
  type: string;
  value: number;
  unit: string;
  change: number;
  timestamp: string;
}

// --- Flights (simulated OSINT) ---
export interface FlightTrack {
  id: string;
  callsign: string;
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  type: 'commercial' | 'military' | 'cargo' | 'private';
  squawk?: string;
  timestamp: string;
}

// --- Cyber Threats (simulated) ---
export interface CyberThreat {
  id: string;
  type: 'ddos' | 'malware' | 'phishing' | 'intrusion' | 'ransomware' | 'data_breach';
  sourceIP: string;
  sourceCountry: string;
  targetSector: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

// --- Naval/AIS (simulated) ---
export interface NavalTrack {
  id: string;
  mmsi: string;
  name: string;
  type: 'cargo' | 'tanker' | 'military' | 'passenger' | 'fishing';
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  destination: string;
  flag: string;
  timestamp: string;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  nickname: string;
  avatar: string;
  message: string;
  timestamp: string;
  location: string;
}

// --- System ---
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

// --- Sentiment Heatmap ---
export interface SentimentHotspot {
  id: string;
  lat: number;
  lng: number;
  city: string;
  intensity: number; // 0-1
  sentiment: 'positive' | 'negative' | 'neutral';
  topic: string;
  count: number;
}

// --- Module system ---
export type ModuleId = 'seismic' | 'weather' | 'financial' | 'airquality' | 'transport' | 'energy' | 'flights' | 'cyber' | 'naval' | 'intel';

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  description: string;
  icon: string;
}

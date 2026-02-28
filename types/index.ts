// ============================================================
// ITALY PULSE — OSINT Dashboard Types (C4ISR)
// ============================================================

export interface GeoCoord { lat: number; lng: number }

export interface FlyToTarget {
  lng: number; lat: number;
  zoom?: number; pitch?: number; bearing?: number;
}

export interface WeatherData {
  city: string; latitude: number; longitude: number;
  temperature: number; apparentTemperature: number;
  humidity: number; windSpeed: number; windDirection: number;
  weatherCode: number; weatherDescription: string;
  isDay: boolean; precipitation: number;
  alertLevel: 'none' | 'advisory' | 'watch' | 'warning';
  pressure?: number; uvIndex?: number;
  visibility?: number; dewPoint?: number;
}

export interface AirQualityStation {
  id: string; name: string;
  latitude: number; longitude: number;
  aqi: number;
  level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  dominantPollutant: string;
  pm25?: number; pm10?: number; no2?: number; o3?: number;
  lastUpdate: string;
}

export interface MarketTick {
  symbol: string; name: string;
  price: number; change24h: number; changePercent24h: number;
  lastUpdate: string; currency: string;
  sparkline?: number[];
  region?: 'IT' | 'US';
  category?: 'index' | 'stock' | 'crypto' | 'forex' | 'commodity' | 'bond' | 'energy';
}

export interface EnergyData {
  type: string; value: number; unit: string;
  change: number; timestamp: string;
}

export interface NewsItem {
  id: string; title: string; description: string;
  source: string; url: string; publishedAt: string;
  category: string; imageUrl?: string;
  latitude?: number; longitude?: number;
  isBreaking?: boolean;
}

export interface TransportAlert {
  id: string;
  type: 'train' | 'flight' | 'road' | 'accident' | 'delay' | 'port' | 'highway';
  title: string; description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string; route?: string;
  status?: 'regolare' | 'rallentato' | 'critico' | 'sospeso';
}

export interface FlightTrack {
  id: string; callsign: string;
  origin: string; destination: string;
  latitude: number; longitude: number;
  altitude: number; speed: number; heading: number;
  type: 'commercial' | 'military' | 'cargo' | 'private';
  squawk?: string; timestamp: string;
}

export interface CyberThreat {
  id: string;
  type: 'ddos' | 'malware' | 'phishing' | 'intrusion' | 'ransomware' | 'data_breach' | 'outage';
  sourceIP: string; sourceCountry: string;
  targetSector: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string; timestamp: string;
  latitude?: number; longitude?: number;
  service?: string;
}

export interface NavalTrack {
  id: string; mmsi: string; name: string;
  type: 'cargo' | 'tanker' | 'military' | 'passenger' | 'fishing';
  latitude: number; longitude: number;
  speed: number; heading: number;
  destination: string; flag: string; timestamp: string;
}

export interface SatelliteTrack {
  id: string; name: string; noradId: number;
  latitude: number; longitude: number; altitude: number;
  velocity: number;
  type: 'communication' | 'weather' | 'navigation' | 'military' | 'science' | 'other';
  country: string;
}

export interface LiveCam {
  id: string; city: string; title: string;
  url: string; thumbnail?: string; embedUrl?: string;
  type: 'webcam' | 'stream' | 'news';
  active?: boolean;
}

export interface ServiceStatus {
  id: string; name: string;
  category: 'telecom' | 'banking' | 'social' | 'cloud' | 'transport' | 'media' | 'gov';
  icon: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number; httpStatus: number;
}

export interface ChatMessage {
  id: string; nickname: string; avatar: string;
  message: string; timestamp: string; location: string;
}

export type ShaderMode = 'none' | 'crt' | 'nvg' | 'flir';

export interface ShaderSettings {
  mode: ShaderMode;
  sensitivity: number; pixelation: number;
  bloom: number; sharpening: number;
}

export type ModuleId = 'markets' | 'weatherAqi' | 'mobility' | 'cyber' | 'livecams';

export interface ModuleConfig {
  id: ModuleId; label: string;
  description: string; icon: string;
}

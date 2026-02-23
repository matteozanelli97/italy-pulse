// ============================================================
// ITALY PULSE — Zustand Global State Store
// ============================================================

import { create } from 'zustand';
import type {
  FlyToTarget,
  SeismicEvent,
  WeatherData,
  MarketTick,
  NewsItem,
  AirQualityStation,
  TransportAlert,
  EnergyData,
  FlightTrack,
  CyberThreat,
  NavalTrack,
  ModuleId,
} from '@/types';

// ─── Map state ───
interface MapSlice {
  flyToTarget: FlyToTarget | null;
  selectedMarkerId: string | null;
  selectedMarkerType: string | null;
  flyTo: (target: FlyToTarget) => void;
  selectMarker: (id: string | null, type?: string | null) => void;
  clearFlyTo: () => void;
}

// ─── Data state ───
interface DataSlice {
  seismic: { data: SeismicEvent[]; loading: boolean };
  weather: { data: WeatherData[]; loading: boolean };
  markets: { data: MarketTick[]; loading: boolean };
  news: { data: NewsItem[]; loading: boolean };
  airQuality: { data: AirQualityStation[]; loading: boolean };
  transport: { data: TransportAlert[]; loading: boolean };
  energy: { data: EnergyData[]; loading: boolean };
  flights: { data: FlightTrack[]; loading: boolean };
  cyber: { data: CyberThreat[]; loading: boolean };
  naval: { data: NavalTrack[]; loading: boolean };
  aiSummary: string;
  trendingTopics: { topic: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[];
  setSeismic: (data: SeismicEvent[], loading?: boolean) => void;
  setWeather: (data: WeatherData[], loading?: boolean) => void;
  setMarkets: (data: MarketTick[], loading?: boolean) => void;
  setNews: (data: NewsItem[], loading?: boolean) => void;
  setAirQuality: (data: AirQualityStation[], loading?: boolean) => void;
  setTransport: (data: TransportAlert[], loading?: boolean) => void;
  setEnergy: (data: EnergyData[], loading?: boolean) => void;
  setFlights: (data: FlightTrack[], loading?: boolean) => void;
  setCyber: (data: CyberThreat[], loading?: boolean) => void;
  setNaval: (data: NavalTrack[], loading?: boolean) => void;
  setAiSummary: (s: string) => void;
  setTrendingTopics: (t: { topic: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[]) => void;
}

// ─── UI state ───
interface UISlice {
  activeModules: [ModuleId, ModuleId]; // exactly 2 open at a time
  searchQuery: string;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  setActiveModules: (modules: [ModuleId, ModuleId]) => void;
  swapModule: (index: 0 | 1, newModule: ModuleId) => void;
  setSearchQuery: (q: string) => void;
  setSidebarCollapsed: (c: boolean) => void;
  setIsMobile: (m: boolean) => void;
}

// ─── Combined store ───
export type AppStore = MapSlice & DataSlice & UISlice;

export const useStore = create<AppStore>((set) => ({
  // ─── Map ───
  flyToTarget: null,
  selectedMarkerId: null,
  selectedMarkerType: null,
  flyTo: (target) => set({ flyToTarget: target }),
  selectMarker: (id, type = null) => set({ selectedMarkerId: id, selectedMarkerType: type }),
  clearFlyTo: () => set({ flyToTarget: null }),

  // ─── Data ───
  seismic: { data: [], loading: true },
  weather: { data: [], loading: true },
  markets: { data: [], loading: true },
  news: { data: [], loading: true },
  airQuality: { data: [], loading: true },
  transport: { data: [], loading: true },
  energy: { data: [], loading: true },
  flights: { data: [], loading: true },
  cyber: { data: [], loading: true },
  naval: { data: [], loading: true },
  aiSummary: '',
  trendingTopics: [],
  setSeismic: (data, loading = false) => set({ seismic: { data, loading } }),
  setWeather: (data, loading = false) => set({ weather: { data, loading } }),
  setMarkets: (data, loading = false) => set({ markets: { data, loading } }),
  setNews: (data, loading = false) => set({ news: { data, loading } }),
  setAirQuality: (data, loading = false) => set({ airQuality: { data, loading } }),
  setTransport: (data, loading = false) => set({ transport: { data, loading } }),
  setEnergy: (data, loading = false) => set({ energy: { data, loading } }),
  setFlights: (data, loading = false) => set({ flights: { data, loading } }),
  setCyber: (data, loading = false) => set({ cyber: { data, loading } }),
  setNaval: (data, loading = false) => set({ naval: { data, loading } }),
  setAiSummary: (s) => set({ aiSummary: s }),
  setTrendingTopics: (t) => set({ trendingTopics: t }),

  // ─── UI ───
  activeModules: ['seismic', 'financial'],
  searchQuery: '',
  sidebarCollapsed: false,
  isMobile: false,
  setActiveModules: (modules) => set({ activeModules: modules }),
  swapModule: (index, newModule) =>
    set((state) => {
      const next = [...state.activeModules] as [ModuleId, ModuleId];
      next[index] = newModule;
      return { activeModules: next };
    }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSidebarCollapsed: (c) => set({ sidebarCollapsed: c }),
  setIsMobile: (m) => set({ isMobile: m }),
}));

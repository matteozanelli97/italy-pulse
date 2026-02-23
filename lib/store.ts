// ============================================================
// ITALY PULSE — Zustand Global State Store (Refactored)
// All polling logic lives here — Dashboard is a pure renderer.
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
  SentimentHotspot,
} from '@/types';
import {
  POLL_SEISMIC,
  POLL_WEATHER,
  POLL_MARKETS,
  POLL_NEWS,
  POLL_AIR_QUALITY,
  POLL_TRANSPORT,
  POLL_ENERGY,
} from '@/lib/constants';
import { generateCyberThreats, generateNavalTracks } from '@/lib/mock-data';

// ─── Generic source state ───
interface SourceSlice<T> {
  data: T[];
  loading: boolean;
  lastUpdate: string | null;
  error: boolean;
}

function emptySlice<T>(): SourceSlice<T> {
  return { data: [], loading: true, lastUpdate: null, error: false };
}

// ─── Store shape ───
export interface AppStore {
  // Map
  flyToTarget: FlyToTarget | null;
  selectedMarkerId: string | null;
  selectedMarkerType: string | null;
  flyTo: (target: FlyToTarget) => void;
  selectMarker: (id: string | null, type?: string | null) => void;
  clearFlyTo: () => void;

  // Data sources
  seismic: SourceSlice<SeismicEvent>;
  weather: SourceSlice<WeatherData>;
  markets: SourceSlice<MarketTick>;
  news: SourceSlice<NewsItem>;
  airQuality: SourceSlice<AirQualityStation>;
  transport: SourceSlice<TransportAlert>;
  energy: SourceSlice<EnergyData>;
  flights: SourceSlice<FlightTrack>;
  cyber: SourceSlice<CyberThreat>;
  naval: SourceSlice<NavalTrack>;
  aiSummary: string;
  trendingTopics: { topic: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[];
  sentimentHotspots: SentimentHotspot[];

  // UI
  activeModules: ModuleId[];
  searchQuery: string;
  sidebarCollapsed: boolean;
  isMobile: boolean;
  chatOpen: boolean;
  mapLayers: { heatmap: boolean; flights: boolean; naval: boolean; cyber: boolean };

  // Data setters
  setAiSummary: (s: string) => void;
  setTrendingTopics: (t: AppStore['trendingTopics']) => void;
  setSentimentHotspots: (h: SentimentHotspot[]) => void;

  // UI actions
  setActiveModules: (modules: ModuleId[]) => void;
  swapModule: (index: number, newModule: ModuleId) => void;
  addModule: (moduleId: ModuleId) => void;
  removeModule: (moduleId: ModuleId) => void;
  setSearchQuery: (q: string) => void;
  setSidebarCollapsed: (c: boolean) => void;
  setIsMobile: (m: boolean) => void;
  setChatOpen: (open: boolean) => void;
  toggleMapLayer: (layer: keyof AppStore['mapLayers']) => void;

  // Polling engine
  _timers: ReturnType<typeof setInterval>[];
  startPolling: () => void;
  stopPolling: () => void;
}

async function apiFetch(endpoint: string) {
  const res = await fetch(`/api/${endpoint}`);
  if (!res.ok) throw new Error(`${endpoint}: ${res.status}`);
  return res.json();
}

export const useStore = create<AppStore>((set, get) => ({
  // ─── Map ───
  flyToTarget: null,
  selectedMarkerId: null,
  selectedMarkerType: null,
  flyTo: (target) => set({ flyToTarget: target }),
  selectMarker: (id, type = null) => set({ selectedMarkerId: id, selectedMarkerType: type }),
  clearFlyTo: () => set({ flyToTarget: null }),

  // ─── Data ───
  seismic: emptySlice(),
  weather: emptySlice(),
  markets: emptySlice(),
  news: emptySlice(),
  airQuality: emptySlice(),
  transport: emptySlice(),
  energy: emptySlice(),
  flights: emptySlice(),
  cyber: emptySlice(),
  naval: emptySlice(),
  aiSummary: '',
  trendingTopics: [],
  sentimentHotspots: [],

  // ─── UI ───
  activeModules: ['seismic', 'financial', 'weather'],
  searchQuery: '',
  sidebarCollapsed: false,
  isMobile: false,
  chatOpen: false,
  mapLayers: { heatmap: true, flights: true, naval: true, cyber: true },

  // ─── Actions ───
  setAiSummary: (s) => set({ aiSummary: s }),
  setTrendingTopics: (t) => set({ trendingTopics: t }),
  setSentimentHotspots: (h) => set({ sentimentHotspots: h }),
  setActiveModules: (modules) => set({ activeModules: modules }),
  swapModule: (index, newModule) =>
    set((state) => {
      const next = [...state.activeModules];
      if (index < next.length) next[index] = newModule;
      return { activeModules: next };
    }),
  addModule: (moduleId) =>
    set((state) => {
      if (state.activeModules.includes(moduleId)) return state;
      if (state.activeModules.length >= 3) {
        const next = [...state.activeModules];
        next[next.length - 1] = moduleId;
        return { activeModules: next };
      }
      return { activeModules: [...state.activeModules, moduleId] };
    }),
  removeModule: (moduleId) =>
    set((state) => {
      if (state.activeModules.length <= 1) return state;
      return { activeModules: state.activeModules.filter((m) => m !== moduleId) };
    }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSidebarCollapsed: (c) => set({ sidebarCollapsed: c }),
  setIsMobile: (m) => set({ isMobile: m }),
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleMapLayer: (layer) =>
    set((state) => ({
      mapLayers: { ...state.mapLayers, [layer]: !state.mapLayers[layer] },
    })),

  // ─── Polling ───
  _timers: [],
  startPolling: () => {
    const store = get();
    store._timers.forEach(clearInterval);

    type SourceKey = 'seismic' | 'weather' | 'markets' | 'news' | 'airQuality' | 'transport' | 'energy';

    const poll = async (endpoint: string, key: SourceKey, dataKey: string) => {
      try {
        const d = await apiFetch(endpoint);
        const items = (d[dataKey] ?? []) as unknown[];
        const now = new Date().toISOString();
        set({ [key]: { data: items, loading: false, lastUpdate: now, error: false } } as Partial<AppStore>);

        if (key === 'news' && items.length > 0) {
          try {
            const res = await fetch('/api/ai-analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: (items as NewsItem[]).slice(0, 30) }),
            });
            if (res.ok) {
              const a = await res.json();
              if (a.summary) set({ aiSummary: a.summary });
              if (a.trendingTopics) set({ trendingTopics: a.trendingTopics });
            }
          } catch { /* optional */ }
        }
      } catch {
        set((s) => ({
          [key]: { ...s[key], loading: false, error: true },
        } as Partial<AppStore>));
      }
    };

    const schedule = (endpoint: string, key: SourceKey, interval: number, dataKey: string) => {
      poll(endpoint, key, dataKey);
      return setInterval(() => poll(endpoint, key, dataKey), interval);
    };

    const timers: ReturnType<typeof setInterval>[] = [
      schedule('seismic', 'seismic', POLL_SEISMIC, 'events'),
      schedule('weather', 'weather', POLL_WEATHER, 'cities'),
      schedule('markets', 'markets', POLL_MARKETS, 'ticks'),
      schedule('news', 'news', POLL_NEWS, 'items'),
      schedule('airquality', 'airQuality', POLL_AIR_QUALITY, 'stations'),
      schedule('transport', 'transport', POLL_TRANSPORT, 'alerts'),
      schedule('energy', 'energy', POLL_ENERGY, 'items'),
    ];

    // Real flights via OpenSky API
    const now = () => new Date().toISOString();
    const pollFlights = async () => {
      try {
        const d = await apiFetch('flights');
        const flights = (d.flights ?? []) as FlightTrack[];
        set({ flights: { data: flights, loading: false, lastUpdate: now(), error: !!d.error } });
      } catch {
        set((s) => ({ flights: { ...s.flights, loading: false, error: true } }));
      }
    };
    pollFlights();
    timers.push(setInterval(pollFlights, 15_000));

    // Mock sources (cyber, naval)
    const genCyber = () => set({ cyber: { data: generateCyberThreats(12), loading: false, lastUpdate: now(), error: false } });
    const genNaval = () => set({ naval: { data: generateNavalTracks(14), loading: false, lastUpdate: now(), error: false } });
    genCyber(); genNaval();
    timers.push(setInterval(genCyber, 30_000));
    timers.push(setInterval(genNaval, 20_000));

    // Sentiment hotspots
    const genSentiment = () => {
      const hotspots: SentimentHotspot[] = [
        { id: 'hs-roma', lat: 41.9028, lng: 12.4964, city: 'Roma', intensity: 0.3 + Math.random() * 0.5, sentiment: Math.random() > 0.5 ? 'negative' : 'neutral', topic: 'Politica', count: Math.floor(50 + Math.random() * 200) },
        { id: 'hs-milano', lat: 45.4642, lng: 9.19, city: 'Milano', intensity: 0.2 + Math.random() * 0.4, sentiment: Math.random() > 0.7 ? 'negative' : 'positive', topic: 'Economia', count: Math.floor(30 + Math.random() * 150) },
        { id: 'hs-napoli', lat: 40.8518, lng: 14.2681, city: 'Napoli', intensity: 0.4 + Math.random() * 0.5, sentiment: 'negative', topic: 'Sicurezza', count: Math.floor(40 + Math.random() * 100) },
        { id: 'hs-torino', lat: 45.0703, lng: 7.6869, city: 'Torino', intensity: 0.1 + Math.random() * 0.3, sentiment: 'neutral', topic: 'Lavoro', count: Math.floor(20 + Math.random() * 80) },
        { id: 'hs-palermo', lat: 38.1157, lng: 13.3615, city: 'Palermo', intensity: 0.3 + Math.random() * 0.4, sentiment: Math.random() > 0.6 ? 'negative' : 'neutral', topic: 'Cronaca', count: Math.floor(15 + Math.random() * 60) },
        { id: 'hs-firenze', lat: 43.7696, lng: 11.2558, city: 'Firenze', intensity: 0.1 + Math.random() * 0.2, sentiment: 'positive', topic: 'Cultura', count: Math.floor(10 + Math.random() * 40) },
        { id: 'hs-bologna', lat: 44.4949, lng: 11.3426, city: 'Bologna', intensity: 0.2 + Math.random() * 0.3, sentiment: 'neutral', topic: 'Università', count: Math.floor(15 + Math.random() * 50) },
        { id: 'hs-catania', lat: 37.5079, lng: 15.09, city: 'Catania', intensity: 0.2 + Math.random() * 0.5, sentiment: Math.random() > 0.5 ? 'negative' : 'neutral', topic: 'Ambiente', count: Math.floor(10 + Math.random() * 40) },
        { id: 'hs-genova', lat: 44.4056, lng: 8.9463, city: 'Genova', intensity: 0.15 + Math.random() * 0.3, sentiment: 'neutral', topic: 'Trasporti', count: Math.floor(10 + Math.random() * 30) },
        { id: 'hs-bari', lat: 41.1171, lng: 16.8719, city: 'Bari', intensity: 0.2 + Math.random() * 0.3, sentiment: Math.random() > 0.6 ? 'negative' : 'positive', topic: 'Immigrazione', count: Math.floor(20 + Math.random() * 60) },
      ];
      set({ sentimentHotspots: hotspots });
    };
    genSentiment();
    timers.push(setInterval(genSentiment, 60_000));

    set({ _timers: timers });
  },
  stopPolling: () => {
    get()._timers.forEach(clearInterval);
    set({ _timers: [] });
  },
}));

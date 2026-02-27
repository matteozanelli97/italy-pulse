// ============================================================
// ITALY PULSE — Zustand Global State Store
// ============================================================

import { create } from 'zustand';
import type {
  FlyToTarget, SeismicEvent, WeatherData, MarketTick, NewsItem,
  AirQualityStation, TransportAlert, EnergyData, FlightTrack,
  CyberThreat, NavalTrack, SatelliteTrack, LiveCam,
  ShaderMode, ShaderSettings,
} from '@/types';
import {
  POLL_SEISMIC, POLL_WEATHER, POLL_MARKETS, POLL_NEWS,
  POLL_AIR_QUALITY, POLL_TRANSPORT, POLL_ENERGY, POLL_SATELLITES,
} from '@/lib/constants';
import { generateCyberThreats, generateNavalTracks } from '@/lib/mock-data';

interface SourceSlice<T> {
  data: T[]; loading: boolean; lastUpdate: string | null; error: boolean;
}

function emptySlice<T>(): SourceSlice<T> {
  return { data: [], loading: true, lastUpdate: null, error: false };
}

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
  satellites: SourceSlice<SatelliteTrack>;
  livecams: SourceSlice<LiveCam>;

  // UI
  searchQuery: string;
  chatOpen: boolean;
  marketRegion: 'IT' | 'US';
  mapLayers: { flights: boolean; naval: boolean; cyber: boolean; satellites: boolean; seismic: boolean; traffic: boolean };
  shaderSettings: ShaderSettings;

  // Actions
  setSearchQuery: (q: string) => void;
  setChatOpen: (open: boolean) => void;
  setMarketRegion: (r: 'IT' | 'US') => void;
  toggleMapLayer: (layer: keyof AppStore['mapLayers']) => void;
  setShaderMode: (mode: ShaderMode) => void;
  setShaderSetting: (key: keyof Omit<ShaderSettings, 'mode'>, value: number) => void;

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
  flyToTarget: null,
  selectedMarkerId: null,
  selectedMarkerType: null,
  flyTo: (target) => set({ flyToTarget: target }),
  selectMarker: (id, type = null) => set({ selectedMarkerId: id, selectedMarkerType: type }),
  clearFlyTo: () => set({ flyToTarget: null }),

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
  satellites: emptySlice(),
  livecams: { data: [], loading: false, lastUpdate: null, error: false },

  searchQuery: '',
  chatOpen: false,
  marketRegion: 'IT',
  mapLayers: { flights: true, naval: true, cyber: true, satellites: false, seismic: true, traffic: false },
  shaderSettings: { mode: 'none', sensitivity: 0.5, pixelation: 0, bloom: 0, sharpening: 0 },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setMarketRegion: (r) => set({ marketRegion: r }),
  toggleMapLayer: (layer) =>
    set((s) => ({ mapLayers: { ...s.mapLayers, [layer]: !s.mapLayers[layer] } })),
  setShaderMode: (mode) =>
    set((s) => ({ shaderSettings: { ...s.shaderSettings, mode } })),
  setShaderSetting: (key, value) =>
    set((s) => ({ shaderSettings: { ...s.shaderSettings, [key]: value } })),

  _timers: [],
  startPolling: () => {
    const store = get();
    store._timers.forEach(clearInterval);

    type SourceKey = 'seismic' | 'weather' | 'markets' | 'news' | 'airQuality' | 'transport' | 'energy';

    const poll = async (endpoint: string, key: SourceKey, dataKey: string) => {
      try {
        const d = await apiFetch(endpoint);
        const items = (d[dataKey] ?? []) as unknown[];
        set({ [key]: { data: items, loading: false, lastUpdate: new Date().toISOString(), error: false } } as Partial<AppStore>);
      } catch {
        set((s) => ({ [key]: { ...s[key], loading: false, error: true } } as Partial<AppStore>));
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

    // Real flights via OpenSky
    const now = () => new Date().toISOString();
    const pollFlights = async () => {
      try {
        const d = await apiFetch('flights');
        set({ flights: { data: (d.flights ?? []) as FlightTrack[], loading: false, lastUpdate: now(), error: !!d.error } });
      } catch {
        set((s) => ({ flights: { ...s.flights, loading: false, error: true } }));
      }
    };
    pollFlights();
    timers.push(setInterval(pollFlights, 15_000));

    // Satellites
    const pollSatellites = async () => {
      try {
        const d = await apiFetch('satellites');
        set({ satellites: { data: (d.satellites ?? []) as SatelliteTrack[], loading: false, lastUpdate: now(), error: false } });
      } catch {
        set((s) => ({ satellites: { ...s.satellites, loading: false, error: true } }));
      }
    };
    pollSatellites();
    timers.push(setInterval(pollSatellites, POLL_SATELLITES));

    // Mock sources (cyber, naval)
    const genCyber = () => set({ cyber: { data: generateCyberThreats(12), loading: false, lastUpdate: now(), error: false } });
    const genNaval = () => set({ naval: { data: generateNavalTracks(14), loading: false, lastUpdate: now(), error: false } });
    genCyber(); genNaval();
    timers.push(setInterval(genCyber, 30_000));
    timers.push(setInterval(genNaval, 20_000));

    // Live cams (static data, loaded once)
    (async () => {
      try {
        const d = await apiFetch('livecams');
        set({ livecams: { data: (d.cams ?? []) as LiveCam[], loading: false, lastUpdate: now(), error: false } });
      } catch {
        set({ livecams: { data: [], loading: false, lastUpdate: now(), error: true } });
      }
    })();

    set({ _timers: timers });
  },
  stopPolling: () => {
    get()._timers.forEach(clearInterval);
    set({ _timers: [] });
  },
}));

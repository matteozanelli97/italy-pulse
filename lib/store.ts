// ============================================================
// ITALY PULSE — Zustand Global State Store
// ============================================================

import { create } from 'zustand';
import type {
  FlyToTarget, WeatherData, MarketTick, NewsItem,
  AirQualityStation, TransportAlert, EnergyData, FlightTrack,
  CyberThreat, NavalTrack, SatelliteTrack, LiveCam,
  ServiceStatus, ShaderMode, ShaderSettings, ModuleId,
} from '@/types';
import {
  POLL_WEATHER, POLL_MARKETS, POLL_NEWS,
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

  // Data sources (no seismic)
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
  serviceStatus: SourceSlice<ServiceStatus>;

  // Custom weather search results
  searchedWeather: WeatherData[];
  setSearchedWeather: (data: WeatherData[]) => void;

  // UI
  searchQuery: string;
  chatOpen: boolean;
  marketRegion: 'IT' | 'US';
  mapLayers: { flights: boolean; naval: boolean; cyber: boolean; satellites: boolean; traffic: boolean };
  shaderSettings: ShaderSettings;

  // Module visibility (sidebar toggles)
  visibleModules: Record<ModuleId, boolean>;
  toggleModule: (id: ModuleId) => void;

  // Webcam preview (up to 3 docked below map)
  openWebcams: LiveCam[];
  openWebcam: (cam: LiveCam) => void;
  closeWebcam: (id: string) => void;

  // Article modal
  articleUrl: string | null;
  articleTitle: string | null;
  openArticle: (url: string, title: string) => void;
  closeArticle: () => void;

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
  serviceStatus: emptySlice(),

  searchedWeather: [],
  setSearchedWeather: (data) => set({ searchedWeather: data }),

  searchQuery: '',
  chatOpen: false,
  marketRegion: 'IT',
  mapLayers: { flights: true, naval: true, cyber: true, satellites: false, traffic: false },
  shaderSettings: { mode: 'none', sensitivity: 0.5, pixelation: 0, bloom: 0, sharpening: 0 },

  visibleModules: { markets: true, weatherAqi: true, mobility: true, cyber: true, livecams: true },
  toggleModule: (id) => set((s) => ({ visibleModules: { ...s.visibleModules, [id]: !s.visibleModules[id] } })),

  openWebcams: [],
  openWebcam: (cam) => set((s) => {
    if (s.openWebcams.find((w) => w.id === cam.id)) return s;
    const next = [...s.openWebcams, cam];
    return { openWebcams: next.length > 3 ? next.slice(-3) : next };
  }),
  closeWebcam: (id) => set((s) => ({ openWebcams: s.openWebcams.filter((w) => w.id !== id) })),

  articleUrl: null,
  articleTitle: null,
  openArticle: (url, title) => set({ articleUrl: url, articleTitle: title }),
  closeArticle: () => set({ articleUrl: null, articleTitle: null }),

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

    type SourceKey = 'weather' | 'markets' | 'news' | 'airQuality' | 'transport' | 'energy';

    const poll = async (endpoint: string, key: SourceKey, dataKey: string) => {
      try {
        const region = get().marketRegion;
        const ep = key === 'markets' ? `${endpoint}?region=${region}` : endpoint;
        const d = await apiFetch(ep);
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
      schedule('weather', 'weather', POLL_WEATHER, 'cities'),
      schedule('markets', 'markets', POLL_MARKETS, 'ticks'),
      schedule('news', 'news', POLL_NEWS, 'items'),
      schedule('airquality', 'airQuality', POLL_AIR_QUALITY, 'stations'),
      schedule('transport', 'transport', POLL_TRANSPORT, 'alerts'),
      schedule('energy', 'energy', POLL_ENERGY, 'items'),
    ];

    const now = () => new Date().toISOString();

    // Real flights via OpenSky
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

    // Service status (real-time checks every 60s)
    const pollServiceStatus = async () => {
      try {
        const d = await apiFetch('servicestatus');
        set({ serviceStatus: { data: (d.services ?? []) as ServiceStatus[], loading: false, lastUpdate: now(), error: false } });
      } catch {
        set((s) => ({ serviceStatus: { ...s.serviceStatus, loading: false, error: true } }));
      }
    };
    pollServiceStatus();
    timers.push(setInterval(pollServiceStatus, 60_000));

    set({ _timers: timers });
  },
  stopPolling: () => {
    get()._timers.forEach(clearInterval);
    set({ _timers: [] });
  },
}));

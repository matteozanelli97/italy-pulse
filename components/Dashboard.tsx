'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';
import IconSidebar, { type SidebarModule } from './IconSidebar';
import LeftPanel from './LeftPanel';
import IntelStream from './IntelStream';
import LiveChat from './LiveChat';
import {
  POLL_SEISMIC,
  POLL_WEATHER,
  POLL_MARKETS,
  POLL_NEWS,
  POLL_AIR_QUALITY,
  POLL_TRANSPORT,
  POLL_ENERGY,
} from '@/lib/constants';
import type {
  SeismicEvent,
  WeatherData,
  NewsItem,
  MarketTick,
  AirQualityStation,
  TransportAlert,
  EnergyData,
} from '@/types';

const MapSection = dynamic(() => import('./MapSection'), { ssr: false });

interface DataSlice<T> {
  data: T;
  loading: boolean;
}

interface AiAnalysis {
  breakingItems: { id: string; reason: string; urgency: number }[];
  suggestedModules: string[];
  trendingTopics: { topic: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[];
  summary: string;
}

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<SidebarModule>('dashboard');
  const [activeTabs, setActiveTabs] = useState<SidebarModule[]>(['financial', 'radar']);
  const [seismic, setSeismic] = useState<DataSlice<SeismicEvent[]>>({ data: [], loading: true });
  const [weather, setWeather] = useState<DataSlice<WeatherData[]>>({ data: [], loading: true });
  const [news, setNews] = useState<DataSlice<NewsItem[]>>({ data: [], loading: true });
  const [markets, setMarkets] = useState<DataSlice<MarketTick[]>>({ data: [], loading: true });
  const [airQuality, setAirQuality] = useState<DataSlice<AirQualityStation[]>>({ data: [], loading: true });
  const [transport, setTransport] = useState<DataSlice<TransportAlert[]>>({ data: [], loading: true });
  const [energy, setEnergy] = useState<DataSlice<EnergyData[]>>({ data: [], loading: true });
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);

  const api = useCallback(async (endpoint: string) => {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`${endpoint}: ${res.status}`);
    return res.json();
  }, []);

  // ─── Polling hooks ───
  usePolling('seismic', POLL_SEISMIC, api, (d) => setSeismic({ data: d.events ?? [], loading: false }),
    () => setSeismic((s) => ({ ...s, loading: false })));

  usePolling('weather', POLL_WEATHER, api, (d) => setWeather({ data: d.cities ?? [], loading: false }),
    () => setWeather((s) => ({ ...s, loading: false })));

  usePolling('news', POLL_NEWS, api, (d) => {
    setNews({ data: d.items ?? [], loading: false });
    // Run AI analysis on news
    runAiAnalysis(d.items ?? []);
  }, () => setNews((s) => ({ ...s, loading: false })));

  usePolling('markets', POLL_MARKETS, api, (d) => setMarkets({ data: d.ticks ?? [], loading: false }),
    () => setMarkets((s) => ({ ...s, loading: false })));

  usePolling('airquality', POLL_AIR_QUALITY, api, (d) => setAirQuality({ data: d.stations ?? [], loading: false }),
    () => setAirQuality((s) => ({ ...s, loading: false })));

  usePolling('transport', POLL_TRANSPORT, api, (d) => setTransport({ data: d.alerts ?? [], loading: false }),
    () => setTransport((s) => ({ ...s, loading: false })));

  usePolling('energy', POLL_ENERGY, api, (d) => setEnergy({ data: d.items ?? [], loading: false }),
    () => setEnergy((s) => ({ ...s, loading: false })));

  const runAiAnalysis = useCallback(async (items: NewsItem[]) => {
    if (items.length === 0) return;
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.slice(0, 30) }),
      });
      if (res.ok) {
        const analysis = await res.json();
        setAiAnalysis(analysis);

        // Apply AI breaking detection to news items
        if (analysis.breakingItems?.length > 0) {
          const breakingIds = new Set(analysis.breakingItems.map((b: { id: string }) => b.id));
          setNews((prev) => ({
            ...prev,
            data: prev.data.map((item) =>
              breakingIds.has(item.id) ? { ...item, isBreaking: true } : item
            ),
          }));
        }
      }
    } catch {
      // AI analysis is optional
    }
  }, []);

  const sources = [seismic, weather, news, markets, airQuality, transport, energy];
  const activeSources = sources.filter((s) => !s.loading || s.data.length > 0).length;
  const totalDataPoints = seismic.data.length + weather.data.length + news.data.length
    + markets.data.length + airQuality.data.length + transport.data.length + energy.data.length;

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: '#000000' }}>
      <TopBar
        activeSources={activeSources}
        totalSources={7}
        dataPoints={totalDataPoints}
        aiSummary={aiAnalysis?.summary}
      />

      <div className="flex flex-1 overflow-hidden">
        <IconSidebar active={activeModule} onChange={setActiveModule} activeTabs={activeTabs} />

        <LeftPanel
          markets={markets.data}
          earthquakes={seismic.data}
          weather={weather.data}
          airQuality={airQuality.data}
          transport={transport.data}
          energy={energy.data}
          marketsLoading={markets.loading}
          seismicLoading={seismic.loading}
          weatherLoading={weather.loading}
          activeTabs={activeTabs}
          onTabChange={setActiveTabs}
          activeModule={activeModule}
        />

        <MapSection
          earthquakes={seismic.data}
          weather={weather.data}
          airQuality={airQuality.data}
        />

        <IntelStream
          items={news.data}
          loading={news.loading}
          aiSummary={aiAnalysis?.summary}
          trendingTopics={aiAnalysis?.trendingTopics}
        />
      </div>

      <LiveChat />
    </div>
  );
}

// ─── Generic polling hook ───
function usePolling(
  endpoint: string,
  interval: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher: (ep: string) => Promise<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (data: any) => void,
  onError: () => void,
) {
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await fetcher(endpoint);
        if (active) onSuccess(d as Record<string, unknown>);
      } catch {
        if (active) onError();
      }
    };
    load();
    const id = setInterval(load, interval);
    return () => { active = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, interval, fetcher]);
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import HudFrame from './HudFrame';
import StatusBar from './StatusBar';
import SeismicPanel from './SeismicPanel';
import WeatherPanel from './WeatherPanel';
import NewsPanel from './NewsPanel';
import MarketsPanel from './MarketsPanel';
import AirQualityBar from './AirQualityBar';
import {
  POLL_SEISMIC,
  POLL_WEATHER,
  POLL_MARKETS,
  POLL_NEWS,
  POLL_AIR_QUALITY,
} from '@/lib/constants';
import type {
  SeismicEvent,
  WeatherData,
  NewsItem,
  MarketTick,
  AirQualityStation,
} from '@/types';

// Leaflet must be loaded client-side only
const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface DataState<T> {
  data: T;
  loading: boolean;
}

export default function Dashboard() {
  const [seismic, setSeismic] = useState<DataState<SeismicEvent[]>>({ data: [], loading: true });
  const [weather, setWeather] = useState<DataState<WeatherData[]>>({ data: [], loading: true });
  const [news, setNews] = useState<DataState<NewsItem[]>>({ data: [], loading: true });
  const [markets, setMarkets] = useState<DataState<MarketTick[]>>({ data: [], loading: true });
  const [airQuality, setAirQuality] = useState<DataState<AirQualityStation[]>>({ data: [], loading: true });

  const fetchData = useCallback(async (endpoint: string) => {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`${endpoint}: ${res.status}`);
    return res.json();
  }, []);

  // Seismic polling
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await fetchData('seismic');
        if (active) setSeismic({ data: d.events ?? [], loading: false });
      } catch { if (active) setSeismic((s) => ({ ...s, loading: false })); }
    };
    load();
    const id = setInterval(load, POLL_SEISMIC);
    return () => { active = false; clearInterval(id); };
  }, [fetchData]);

  // Weather polling
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await fetchData('weather');
        if (active) setWeather({ data: d.cities ?? [], loading: false });
      } catch { if (active) setWeather((s) => ({ ...s, loading: false })); }
    };
    load();
    const id = setInterval(load, POLL_WEATHER);
    return () => { active = false; clearInterval(id); };
  }, [fetchData]);

  // News polling
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await fetchData('news');
        if (active) setNews({ data: d.items ?? [], loading: false });
      } catch { if (active) setNews((s) => ({ ...s, loading: false })); }
    };
    load();
    const id = setInterval(load, POLL_NEWS);
    return () => { active = false; clearInterval(id); };
  }, [fetchData]);

  // Markets polling
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await fetchData('markets');
        if (active) setMarkets({ data: d.ticks ?? [], loading: false });
      } catch { if (active) setMarkets((s) => ({ ...s, loading: false })); }
    };
    load();
    const id = setInterval(load, POLL_MARKETS);
    return () => { active = false; clearInterval(id); };
  }, [fetchData]);

  // Air quality polling
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await fetchData('airquality');
        if (active) setAirQuality({ data: d.stations ?? [], loading: false });
      } catch { if (active) setAirQuality((s) => ({ ...s, loading: false })); }
    };
    load();
    const id = setInterval(load, POLL_AIR_QUALITY);
    return () => { active = false; clearInterval(id); };
  }, [fetchData]);

  const activeSources = [seismic, weather, news, markets, airQuality].filter((s) => !s.loading || s.data.length > 0).length;

  return (
    <HudFrame>
      <div className="flex h-full flex-col">
        <StatusBar activeSources={activeSources} totalSources={5} />

        {/* Main content: 3-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-cyan-900/30 bg-[#0a0a12]/80 lg:flex">
            <div className="flex-1 overflow-hidden border-b border-cyan-900/20">
              <SeismicPanel events={seismic.data} loading={seismic.loading} />
            </div>
            <div className="h-[45%] overflow-hidden">
              <WeatherPanel cities={weather.data} loading={weather.loading} />
            </div>
          </aside>

          {/* Center: Map */}
          <main className="relative flex-1">
            <MapView
              earthquakes={seismic.data}
              weather={weather.data}
              airQuality={airQuality.data}
            />
          </main>

          {/* Right sidebar */}
          <aside className="hidden w-72 flex-shrink-0 flex-col border-l border-cyan-900/30 bg-[#0a0a12]/80 lg:flex">
            <div className="flex-1 overflow-hidden border-b border-cyan-900/20">
              <NewsPanel items={news.data} loading={news.loading} />
            </div>
            <div className="h-[40%] overflow-hidden">
              <MarketsPanel ticks={markets.data} loading={markets.loading} />
            </div>
          </aside>
        </div>

        {/* Bottom bar */}
        <AirQualityBar stations={airQuality.data} />
      </div>
    </HudFrame>
  );
}

'use client';

import { useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';
import IconSidebar from './IconSidebar';
import LeftPanel from './LeftPanel';
import IntelStream from './IntelStream';
import LiveChat from './LiveChat';
import { useStore } from '@/lib/store';
import { generateFlights, generateCyberThreats, generateNavalTracks } from '@/lib/mock-data';
import {
  POLL_SEISMIC,
  POLL_WEATHER,
  POLL_MARKETS,
  POLL_NEWS,
  POLL_AIR_QUALITY,
  POLL_TRANSPORT,
  POLL_ENERGY,
} from '@/lib/constants';

const TacticalMap = dynamic(() => import('./TacticalMap'), { ssr: false });

export default function Dashboard() {
  const setSeismic = useStore((s) => s.setSeismic);
  const setWeather = useStore((s) => s.setWeather);
  const setMarkets = useStore((s) => s.setMarkets);
  const setNews = useStore((s) => s.setNews);
  const setAirQuality = useStore((s) => s.setAirQuality);
  const setTransport = useStore((s) => s.setTransport);
  const setEnergy = useStore((s) => s.setEnergy);
  const setFlights = useStore((s) => s.setFlights);
  const setCyber = useStore((s) => s.setCyber);
  const setNaval = useStore((s) => s.setNaval);
  const setAiSummary = useStore((s) => s.setAiSummary);
  const setTrendingTopics = useStore((s) => s.setTrendingTopics);

  const api = useCallback(async (endpoint: string) => {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`${endpoint}: ${res.status}`);
    return res.json();
  }, []);

  // ─── Data polling ───
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('seismic');
        if (active) setSeismic(d.events ?? []);
      } catch { if (active) setSeismic([], false); }
    };
    load();
    const id = setInterval(load, POLL_SEISMIC);
    return () => { active = false; clearInterval(id); };
  }, [api, setSeismic]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('weather');
        if (active) setWeather(d.cities ?? []);
      } catch { if (active) setWeather([], false); }
    };
    load();
    const id = setInterval(load, POLL_WEATHER);
    return () => { active = false; clearInterval(id); };
  }, [api, setWeather]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('markets');
        if (active) setMarkets(d.ticks ?? []);
      } catch { if (active) setMarkets([], false); }
    };
    load();
    const id = setInterval(load, POLL_MARKETS);
    return () => { active = false; clearInterval(id); };
  }, [api, setMarkets]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('news');
        if (active) {
          setNews(d.items ?? []);
          // Run AI analysis
          if ((d.items ?? []).length > 0) {
            try {
              const res = await fetch('/api/ai-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: (d.items ?? []).slice(0, 30) }),
              });
              if (res.ok) {
                const analysis = await res.json();
                if (active && analysis.summary) setAiSummary(analysis.summary);
                if (active && analysis.trendingTopics) setTrendingTopics(analysis.trendingTopics);
              }
            } catch { /* AI analysis is optional */ }
          }
        }
      } catch { if (active) setNews([], false); }
    };
    load();
    const id = setInterval(load, POLL_NEWS);
    return () => { active = false; clearInterval(id); };
  }, [api, setNews, setAiSummary, setTrendingTopics]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('airquality');
        if (active) setAirQuality(d.stations ?? []);
      } catch { if (active) setAirQuality([], false); }
    };
    load();
    const id = setInterval(load, POLL_AIR_QUALITY);
    return () => { active = false; clearInterval(id); };
  }, [api, setAirQuality]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('transport');
        if (active) setTransport(d.alerts ?? []);
      } catch { if (active) setTransport([], false); }
    };
    load();
    const id = setInterval(load, POLL_TRANSPORT);
    return () => { active = false; clearInterval(id); };
  }, [api, setTransport]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const d = await api('energy');
        if (active) setEnergy(d.items ?? []);
      } catch { if (active) setEnergy([], false); }
    };
    load();
    const id = setInterval(load, POLL_ENERGY);
    return () => { active = false; clearInterval(id); };
  }, [api, setEnergy]);

  // ─── Mock data for flights, cyber, naval ───
  useEffect(() => {
    setFlights(generateFlights(18));
    setCyber(generateCyberThreats(12));
    setNaval(generateNavalTracks(14));

    const flightTimer = setInterval(() => setFlights(generateFlights(18)), 15_000);
    const cyberTimer = setInterval(() => setCyber(generateCyberThreats(12)), 30_000);
    const navalTimer = setInterval(() => setNaval(generateNavalTracks(14)), 20_000);

    return () => {
      clearInterval(flightTimer);
      clearInterval(cyberTimer);
      clearInterval(navalTimer);
    };
  }, [setFlights, setCyber, setNaval]);

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: '#030303' }}>
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <IconSidebar />
        <LeftPanel />
        <TacticalMap />
        <IntelStream />
      </div>

      <LiveChat />
    </div>
  );
}

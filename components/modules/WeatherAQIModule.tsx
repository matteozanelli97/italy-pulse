'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import type { WeatherData } from '@/types';

const LEVEL_COLORS: Record<string, string> = {
  good: '#32A467', moderate: '#4C90F0', unhealthy_sensitive: '#EC9A3C',
  unhealthy: '#E76A6E', very_unhealthy: '#CD4246', hazardous: '#991b1b',
};

export default function WeatherAQIModule() {
  const { data: cities, loading } = useStore((s) => s.weather);
  const { data: stations } = useStore((s) => s.airQuality);
  const flyTo = useStore((s) => s.flyTo);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<WeatherData[]>([]);
  const [searching, setSearching] = useState(false);
  const [pinnedCities, setPinnedCities] = useState<Set<string>>(() => new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = useMemo(() => {
    if (!search) return cities.slice(0, 10);
    const s = search.toLowerCase();
    return cities.filter((w) => w.city.toLowerCase().includes(s) || w.weatherDescription.toLowerCase().includes(s));
  }, [cities, search]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/weather/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.cities ?? []);
      }
    } catch { /* ignore */ }
    setSearching(false);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const localMatch = cities.some((w) => w.city.toLowerCase().includes(value.toLowerCase()));
      if (!localMatch && value.length >= 3) doSearch(value);
      else setSearchResults([]);
    }, 500);
  }, [cities, doSearch]);

  const togglePin = useCallback((city: string) => {
    setPinnedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city); else next.add(city);
      return next;
    });
  }, []);

  const getAqi = (city: string) => stations.find((s) => s.name === city);

  const allResults = useMemo(() => {
    if (searchResults.length === 0) return filtered;
    const localNames = new Set(filtered.map((w) => w.city.toLowerCase()));
    const extra = searchResults.filter((w) => !localNames.has(w.city.toLowerCase()));
    return [...filtered, ...extra];
  }, [filtered, searchResults]);

  const pinnedData = useMemo(() => {
    if (pinnedCities.size === 0) return [];
    return cities.filter((w) => pinnedCities.has(w.city));
  }, [cities, pinnedCities]);

  const mainResults = useMemo(() => {
    if (pinnedCities.size === 0) return allResults;
    return allResults.filter((w) => !pinnedCities.has(w.city));
  }, [allResults, pinnedCities]);

  if (loading && cities.length === 0) return <Shimmer />;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 mb-1"
        style={{ background: 'var(--bg-deepest)', border: '1px solid var(--border-dim)' }}>
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0">
          <circle cx="7" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.3" />
          <line x1="10" y1="10" x2="13" y2="13" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input value={search} onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Cerca qualsiasi città italiana..."
          className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
        {searching && <span className="text-[9px] font-mono animate-pulse" style={{ color: 'var(--text-dim)' }}>...</span>}
        {search && <button onClick={() => { setSearch(''); setSearchResults([]); }} className="text-[12px]" style={{ color: 'var(--text-dim)' }}>×</button>}
      </div>

      {pinnedData.length > 0 && (
        <>
          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Fissate</div>
          {pinnedData.map((w) => <CityRow key={`pin-${w.city}`} w={w} aqi={getAqi(w.city)} expanded={expanded} setExpanded={setExpanded} flyTo={flyTo} pinned togglePin={togglePin} />)}
          <div className="border-b my-1" style={{ borderColor: 'var(--border-dim)' }} />
        </>
      )}

      {mainResults.map((w) => <CityRow key={w.city} w={w} aqi={getAqi(w.city)} expanded={expanded} setExpanded={setExpanded} flyTo={flyTo} pinned={pinnedCities.has(w.city)} togglePin={togglePin} />)}
      {mainResults.length === 0 && pinnedData.length === 0 && !searching && <p className="text-[11px] text-center py-2" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
      {mainResults.length === 0 && pinnedData.length === 0 && searching && <p className="text-[11px] text-center py-2 animate-pulse" style={{ color: 'var(--text-dim)' }}>Ricerca in corso...</p>}
    </div>
  );
}

function CityRow({ w, aqi, expanded, setExpanded, flyTo, pinned, togglePin }: {
  w: WeatherData; aqi: { aqi: number; level: string; dominantPollutant: string } | undefined;
  expanded: string | null; setExpanded: (v: string | null) => void;
  flyTo: (t: { lat: number; lng: number; zoom: number; pitch: number }) => void;
  pinned: boolean; togglePin: (city: string) => void;
}) {
  const isExpanded = expanded === w.city;
  const tempColor = w.alertLevel === 'warning' ? '#E76A6E' : w.alertLevel === 'watch' ? '#EC9A3C' : '#fff';
  return (
    <div>
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); togglePin(w.city); }}
          className="text-[10px] flex-shrink-0 transition-opacity" style={{ opacity: pinned ? 1 : 0.3, color: pinned ? '#EC9A3C' : 'var(--text-dim)' }}>
          ★
        </button>
        <button onClick={() => { flyTo({ lat: w.latitude, lng: w.longitude, zoom: 9, pitch: 50 }); setExpanded(isExpanded ? null : w.city); }}
          className="flex flex-1 items-center justify-between py-1 text-left hover:bg-[var(--bg-hover)] rounded px-1 transition-colors min-w-0">
          <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{w.city}</span>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[12px] font-bold font-mono flex-shrink-0" style={{ color: tempColor }}>{Math.round(w.temperature)}°C</span>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-dim)' }}>{w.weatherDescription}</span>
            {aqi && (
              <span className="text-[10px] font-bold font-mono rounded px-1 flex-shrink-0" style={{ color: LEVEL_COLORS[aqi.level], background: `${LEVEL_COLORS[aqi.level]}10` }}>
                {aqi.aqi}
              </span>
            )}
          </div>
        </button>
      </div>
      {isExpanded && (
        <div className="ml-5 mb-1.5 px-3 py-2 rounded text-[10px] space-y-1"
          style={{ background: 'var(--bg-deepest)', border: '1px solid var(--border-dim)' }}>
          <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Condizioni</span><span className="font-mono" style={{ color: '#fff' }}>{w.weatherDescription}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Percepita</span><span className="font-mono" style={{ color: '#fff' }}>{w.apparentTemperature.toFixed(1)}°C</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Umidità</span><span className="font-mono" style={{ color: '#fff' }}>{w.humidity}%</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Vento</span><span className="font-mono" style={{ color: '#fff' }}>{w.windSpeed.toFixed(0)} km/h ({w.windDirection}°)</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Pioggia</span><span className="font-mono" style={{ color: '#fff' }}>{w.precipitation} mm</span></div>
          {aqi && (
            <>
              <div className="flex justify-between mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--border-dim)' }}>
                <span style={{ color: 'var(--text-dim)' }}>AQI EU</span>
                <span className="font-mono" style={{ color: LEVEL_COLORS[aqi.level] }}>{aqi.aqi} ({aqi.level.replace('_', ' ')})</span>
              </div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Inquinante</span><span className="font-mono" style={{ color: '#fff' }}>{aqi.dominantPollutant}</span></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-20 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

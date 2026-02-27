'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';

const LEVEL_COLORS: Record<string, string> = {
  good: '#3b82f6', moderate: '#60a5fa', unhealthy_sensitive: '#f59e0b',
  unhealthy: '#ef4444', very_unhealthy: '#dc2626', hazardous: '#991b1b',
};

export default function WeatherAQIModule() {
  const { data: cities, loading } = useStore((s) => s.weather);
  const { data: stations } = useStore((s) => s.airQuality);
  const flyTo = useStore((s) => s.flyTo);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search) return cities.slice(0, 10);
    const s = search.toLowerCase();
    return cities.filter((w) => w.city.toLowerCase().includes(s) || w.weatherDescription.toLowerCase().includes(s));
  }, [cities, search]);

  const getAqi = (city: string) => stations.find((s) => s.name === city);

  if (loading && cities.length === 0) return <Shimmer />;

  return (
    <div className="space-y-1">
      {/* City search */}
      <div className="flex items-center gap-1 rounded px-2 py-1 mb-1"
        style={{ background: 'var(--bg-deepest)', border: '1px solid var(--border-dim)' }}>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 flex-shrink-0">
          <circle cx="7" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.3" />
          <line x1="10" y1="10" x2="13" y2="13" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca città..."
          className="flex-1 bg-transparent text-[9px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
        {search && <button onClick={() => setSearch('')} className="text-[10px]" style={{ color: 'var(--text-dim)' }}>×</button>}
      </div>

      {filtered.map((w) => {
        const aqi = getAqi(w.city);
        const isExpanded = expanded === w.city;
        const tempColor = w.alertLevel === 'warning' ? '#ef4444' : w.alertLevel === 'watch' ? '#f59e0b' : 'var(--blue-400)';
        return (
          <div key={w.city}>
            <button onClick={() => { flyTo({ lat: w.latitude, lng: w.longitude, zoom: 9, pitch: 50 }); setExpanded(isExpanded ? null : w.city); }}
              className="flex w-full items-center justify-between py-0.5 text-left hover:bg-[var(--bg-hover)] rounded px-1 transition-colors">
              <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{w.city}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold" style={{ color: tempColor }}>{Math.round(w.temperature)}°C</span>
                <span className="text-[8px] max-w-[60px] truncate" style={{ color: 'var(--text-dim)' }}>{w.weatherDescription}</span>
                {aqi && (
                  <span className="text-[8px] font-bold rounded px-1" style={{ color: LEVEL_COLORS[aqi.level], background: `${LEVEL_COLORS[aqi.level]}10` }}>
                    AQI {aqi.aqi}
                  </span>
                )}
              </div>
            </button>
            {/* Expanded detail */}
            {isExpanded && (
              <div className="ml-2 mb-1 px-2 py-1 rounded text-[8px] space-y-0.5"
                style={{ background: 'var(--bg-deepest)', border: '1px solid var(--border-dim)' }}>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Percepita</span><span style={{ color: 'var(--text-secondary)' }}>{w.apparentTemperature.toFixed(1)}°C</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Umidità</span><span style={{ color: 'var(--text-secondary)' }}>{w.humidity}%</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Vento</span><span style={{ color: 'var(--text-secondary)' }}>{w.windSpeed.toFixed(0)} km/h ({w.windDirection}°)</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Pioggia</span><span style={{ color: 'var(--text-secondary)' }}>{w.precipitation} mm</span></div>
                {aqi && (
                  <>
                    <div className="flex justify-between mt-1 pt-1 border-t" style={{ borderColor: 'var(--border-dim)' }}>
                      <span style={{ color: 'var(--text-dim)' }}>AQI EU</span>
                      <span style={{ color: LEVEL_COLORS[aqi.level] }}>{aqi.aqi} ({aqi.level.replace('_', ' ')})</span>
                    </div>
                    <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Inquinante</span><span style={{ color: 'var(--text-secondary)' }}>{aqi.dominantPollutant}</span></div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <p className="text-[9px] text-center py-2" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-20 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

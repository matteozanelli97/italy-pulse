'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';

const LEVEL_COLORS: Record<string, string> = {
  good: '#00bcd4', moderate: '#18FFFF', unhealthy_sensitive: '#f59e0b',
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 mb-1"
        style={{ background: 'var(--bg-deepest)', border: '1px solid var(--border-dim)' }}>
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0">
          <circle cx="7" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.3" />
          <line x1="10" y1="10" x2="13" y2="13" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca città..."
          className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
        {search && <button onClick={() => setSearch('')} className="text-[12px]" style={{ color: 'var(--text-dim)' }}>×</button>}
      </div>

      {filtered.map((w) => {
        const aqi = getAqi(w.city);
        const isExpanded = expanded === w.city;
        const tempColor = w.alertLevel === 'warning' ? '#ef4444' : w.alertLevel === 'watch' ? '#f59e0b' : 'var(--cyan-500)';
        return (
          <div key={w.city}>
            <button onClick={() => { flyTo({ lat: w.latitude, lng: w.longitude, zoom: 9, pitch: 50 }); setExpanded(isExpanded ? null : w.city); }}
              className="flex w-full items-center justify-between py-1 text-left hover:bg-[var(--bg-hover)] rounded px-1.5 transition-colors">
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{w.city}</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold font-mono" style={{ color: tempColor }}>{Math.round(w.temperature)}°C</span>
                <span className="text-[10px] max-w-[70px] truncate" style={{ color: 'var(--text-dim)' }}>{w.weatherDescription}</span>
                {aqi && (
                  <span className="text-[10px] font-bold font-mono rounded px-1.5" style={{ color: LEVEL_COLORS[aqi.level], background: `${LEVEL_COLORS[aqi.level]}10` }}>
                    AQI {aqi.aqi}
                  </span>
                )}
              </div>
            </button>
            {isExpanded && (
              <div className="ml-2 mb-1.5 px-3 py-2 rounded text-[10px] space-y-1"
                style={{ background: 'var(--bg-deepest)', border: '1px solid var(--border-dim)' }}>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Percepita</span><span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{w.apparentTemperature.toFixed(1)}°C</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Umidità</span><span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{w.humidity}%</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Vento</span><span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{w.windSpeed.toFixed(0)} km/h ({w.windDirection}°)</span></div>
                <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Pioggia</span><span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{w.precipitation} mm</span></div>
                {aqi && (
                  <>
                    <div className="flex justify-between mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--border-dim)' }}>
                      <span style={{ color: 'var(--text-dim)' }}>AQI EU</span>
                      <span className="font-mono" style={{ color: LEVEL_COLORS[aqi.level] }}>{aqi.aqi} ({aqi.level.replace('_', ' ')})</span>
                    </div>
                    <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Inquinante</span><span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{aqi.dominantPollutant}</span></div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
      {filtered.length === 0 && <p className="text-[11px] text-center py-2" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-20 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

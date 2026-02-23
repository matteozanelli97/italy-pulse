'use client';

import { useStore } from '@/lib/store';

export default function WeatherModule({ search }: { search: string }) {
  const { data: cities, loading } = useStore((s) => s.weather);
  const flyTo = useStore((s) => s.flyTo);

  const filtered = cities.filter((w) => {
    if (!search) return true;
    return w.city.toLowerCase().includes(search.toLowerCase()) || w.weatherDescription.toLowerCase().includes(search.toLowerCase());
  });

  if (loading && cities.length === 0) return <Shimmer />;

  return (
    <div className="space-y-1">
      {filtered.slice(0, 14).map((w) => (
        <button key={w.city} onClick={() => flyTo({ lat: w.latitude, lng: w.longitude, zoom: 9, pitch: 50 })}
          className="flex w-full items-center justify-between py-0.5 text-left hover:bg-[var(--bg-hover)] rounded px-1 transition-colors">
          <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{w.city}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold" style={{ color: w.alertLevel === 'warning' ? '#ef4444' : w.alertLevel === 'watch' ? '#f59e0b' : 'var(--blue-400)' }}>
              {Math.round(w.temperature)}°C
            </span>
            <span className="text-[9px] max-w-[80px] truncate" style={{ color: 'var(--text-dim)' }}>{w.weatherDescription}</span>
          </div>
        </button>
      ))}
      {filtered.length === 0 && <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-20 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

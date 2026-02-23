'use client';

import { useStore } from '@/lib/store';

const LEVEL_COLORS: Record<string, string> = {
  good: '#3b82f6', moderate: '#60a5fa', unhealthy_sensitive: '#f59e0b',
  unhealthy: '#ef4444', very_unhealthy: '#dc2626', hazardous: '#991b1b',
};

export default function AirQualityModule({ search }: { search: string }) {
  const { data: stations } = useStore((s) => s.airQuality);
  const flyTo = useStore((s) => s.flyTo);

  const filtered = stations.filter((s) => {
    if (!search) return true;
    return s.name.toLowerCase().includes(search.toLowerCase()) || s.dominantPollutant.toLowerCase().includes(search.toLowerCase());
  });

  if (stations.length === 0) return <Init label="Caricamento stazioni AQI" />;

  return (
    <div className="space-y-1">
      {filtered.slice(0, 12).map((s) => (
        <button key={s.id} onClick={() => flyTo({ lat: s.latitude, lng: s.longitude, zoom: 9 })}
          className="flex w-full items-center justify-between py-0.5 text-left hover:bg-[var(--bg-hover)] rounded px-1 transition-colors">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: LEVEL_COLORS[s.level] || '#64748b', boxShadow: `0 0 6px ${LEVEL_COLORS[s.level] || '#64748b'}40` }} />
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-bold" style={{ color: LEVEL_COLORS[s.level] || '#64748b' }}>{s.aqi}</span>
            <span className="text-[8px]" style={{ color: 'var(--text-dim)' }}>{s.dominantPollutant}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function Init({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{label}<span className="init-dots" /></span>
    </div>
  );
}

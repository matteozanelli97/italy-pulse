'use client';

import { useStore } from '@/lib/store';

export default function FlightsModule({ search }: { search: string }) {
  const { data: flights, loading } = useStore((s) => s.flights);
  const flyTo = useStore((s) => s.flyTo);
  const selectMarker = useStore((s) => s.selectMarker);

  const filtered = flights.filter((fl) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return fl.callsign.toLowerCase().includes(s) || fl.origin.toLowerCase().includes(s) || fl.destination.toLowerCase().includes(s) || fl.type.includes(s);
  });

  if (loading && flights.length === 0) return <Shimmer />;

  return (
    <div className="space-y-1.5">
      {filtered.slice(0, 14).map((fl) => {
        const isMil = fl.type === 'military';
        const color = isMil ? '#ef4444' : 'var(--blue-400)';
        return (
          <button key={fl.id} onClick={() => { flyTo({ lat: fl.latitude, lng: fl.longitude, zoom: 9, pitch: 55 }); selectMarker(fl.id, 'flight'); }}
            className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-hover)] transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" style={{ color, transform: `rotate(${fl.heading}deg)` }}>
              <path d="M8 2L5 8H3L8 14L13 8H11L8 2Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="0.8" />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold" style={{ color }}>{fl.callsign}</span>
                {isMil && <span className="badge badge-severity-high text-[7px] px-1 py-0">MIL</span>}
                <span className="text-[8px] uppercase" style={{ color: 'var(--text-muted)' }}>{fl.type}</span>
              </div>
              <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{fl.origin}→{fl.destination} · {Math.round(fl.altitude)}ft · {Math.round(fl.speed)}kts</p>
            </div>
          </button>
        );
      })}
      {filtered.length === 0 && <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-2"><div className="h-4 w-4 animate-shimmer-load rounded" /><div className="flex-1 space-y-1"><div className="h-3 w-full animate-shimmer-load rounded" /><div className="h-2 w-2/3 animate-shimmer-load rounded" /></div></div>)}</div>;
}

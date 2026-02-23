'use client';

import { useStore } from '@/lib/store';
import { SEVERITY_COLORS } from '@/lib/constants';

export default function SeismicModule({ search }: { search: string }) {
  const { data: events, loading } = useStore((s) => s.seismic);
  const flyTo = useStore((s) => s.flyTo);
  const selectMarker = useStore((s) => s.selectMarker);

  const filtered = events.filter((eq) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return eq.description.toLowerCase().includes(s) || eq.magnitude.toString().includes(s) || eq.region.toLowerCase().includes(s);
  });

  if (loading && events.length === 0) return <Shimmer />;

  return (
    <div className="space-y-1.5">
      {filtered.slice(0, 12).map((eq) => {
        const sev = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
        const color = SEVERITY_COLORS[sev];
        return (
          <button key={eq.id} onClick={() => { flyTo({ lat: eq.latitude, lng: eq.longitude, zoom: 9, pitch: 55 }); selectMarker(eq.id, 'seismic'); }}
            className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-hover)] transition-colors">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold" style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}>
              {eq.magnitude.toFixed(1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px]" style={{ color: 'var(--text-secondary)' }}>{eq.description || 'Zona non specificata'}</p>
              <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{eq.depth.toFixed(0)}km · {ago(eq.time)}</p>
            </div>
          </button>
        );
      })}
      {filtered.length === 0 && <Empty />}
    </div>
  );
}

function ago(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'adesso';
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  return `${Math.floor(h / 24)}g fa`;
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-2"><div className="h-6 w-6 animate-shimmer-load rounded" /><div className="flex-1 space-y-1"><div className="h-3 w-full animate-shimmer-load rounded" /><div className="h-2 w-2/3 animate-shimmer-load rounded" /></div></div>)}</div>;
}

function Empty() {
  return <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>;
}

'use client';

import { useStore } from '@/lib/store';

const TYPE_COLORS: Record<string, string> = { military: '#60a5fa', cargo: '#334155', tanker: '#334155', passenger: '#3b82f6', fishing: '#64748b' };

export default function NavalModule({ search }: { search: string }) {
  const { data: tracks, loading } = useStore((s) => s.naval);
  const flyTo = useStore((s) => s.flyTo);
  const selectMarker = useStore((s) => s.selectMarker);

  const filtered = tracks.filter((nv) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return nv.name.toLowerCase().includes(s) || nv.destination.toLowerCase().includes(s) || nv.type.includes(s) || nv.flag.toLowerCase().includes(s) || nv.mmsi.includes(s);
  });

  if (loading && tracks.length === 0) return <Init />;

  return (
    <div className="space-y-1.5">
      {filtered.slice(0, 12).map((nv) => {
        const color = TYPE_COLORS[nv.type] || '#334155';
        const isMil = nv.type === 'military';
        return (
          <button key={nv.id} onClick={() => { flyTo({ lat: nv.latitude, lng: nv.longitude, zoom: 9, pitch: 50 }); selectMarker(nv.id, 'naval'); }}
            className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-hover)] transition-colors">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0" style={{ color }}>
              <path d="M4 12l2-3h4l2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M5 9V5a1 1 0 011-1h4a1 1 0 011 1v4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold" style={{ color: isMil ? '#60a5fa' : 'var(--text-primary)' }}>{nv.name}</span>
                <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{nv.flag}</span>
              </div>
              <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{nv.type} · → {nv.destination} · {nv.speed.toFixed(1)}kn</p>
            </div>
          </button>
        );
      })}
      {filtered.length === 0 && <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Inizializzazione AIS<span className="init-dots" /></span>
    </div>
  );
}

'use client';

import { useStore } from '@/lib/store';

const SEV_COLORS: Record<string, string> = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };

export default function CyberModule({ search }: { search: string }) {
  const { data: threats, loading } = useStore((s) => s.cyber);
  const flyTo = useStore((s) => s.flyTo);

  const filtered = threats.filter((ct) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return ct.type.includes(s) || ct.description.toLowerCase().includes(s) || ct.targetSector.toLowerCase().includes(s) || ct.sourceIP.includes(s) || ct.sourceCountry.toLowerCase().includes(s);
  });

  if (loading && threats.length === 0) return <Init />;

  return (
    <div className="space-y-1.5">
      {filtered.slice(0, 10).map((ct) => {
        const color = SEV_COLORS[ct.severity] || '#3b82f6';
        return (
          <button key={ct.id}
            onClick={() => { if (ct.latitude && ct.longitude) flyTo({ lat: ct.latitude, lng: ct.longitude, zoom: 8 }); }}
            className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-hover)] transition-colors">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[8px] font-bold uppercase" style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}>
              {ct.severity.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase" style={{ color }}>{ct.type}</span>
                <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{ct.sourceCountry}</span>
              </div>
              <p className="truncate text-[9px]" style={{ color: 'var(--text-secondary)' }}>{ct.description}</p>
              <p className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>{ct.sourceIP} → {ct.targetSector}</p>
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
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Scansione threat feeds<span className="init-dots" /></span>
    </div>
  );
}

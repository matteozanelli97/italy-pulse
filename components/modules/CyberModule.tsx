'use client';

import { useStore } from '@/lib/store';

const SEV_COLORS: Record<string, string> = { low: '#2D72D2', medium: '#EC9A3C', high: '#E76A6E', critical: '#CD4246' };

export default function CyberModule() {
  const { data: threats, loading } = useStore((s) => s.cyber);
  const flyTo = useStore((s) => s.flyTo);

  if (loading && threats.length === 0) return <Init />;

  return (
    <div className="space-y-2">
      {threats.slice(0, 8).map((ct) => {
        const color = SEV_COLORS[ct.severity] || '#2D72D2';
        return (
          <button key={ct.id}
            onClick={() => { if (ct.latitude && ct.longitude) flyTo({ lat: ct.latitude, lng: ct.longitude, zoom: 8 }); }}
            className="flex w-full items-start gap-2 rounded px-1.5 py-1 text-left hover:bg-[var(--bg-hover)] transition-colors">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[9px] font-bold font-mono uppercase" style={{ color, background: `${color}12`, border: `1px solid ${color}30` }}>
              {ct.severity.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold font-mono uppercase" style={{ color }}>{ct.type}</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{ct.sourceCountry}</span>
                {ct.service && <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>· {ct.service}</span>}
              </div>
              <p className="truncate text-[10px]" style={{ color: 'var(--text-secondary)' }}>{ct.description}</p>
              <p className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{ct.sourceIP} → {ct.targetSector}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Scansione threat feeds<span className="init-dots" /></span>
    </div>
  );
}

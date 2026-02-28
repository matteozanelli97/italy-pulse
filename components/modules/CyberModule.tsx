'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { ServiceStatus } from '@/types';

const STATUS_CFG = {
  operational: { color: '#32A467', label: 'OK', bg: 'rgba(50,164,103,0.08)' },
  degraded: { color: '#EC9A3C', label: 'LENTO', bg: 'rgba(236,154,60,0.08)' },
  down: { color: '#E76A6E', label: 'DOWN', bg: 'rgba(231,106,110,0.08)' },
} as const;

const CAT_LABELS: Record<string, string> = {
  telecom: 'Telecomunicazioni', banking: 'Banche & Pagamenti', social: 'Social',
  cloud: 'Cloud', transport: 'Trasporti', media: 'Media', gov: 'Servizi Pubblici',
};

type CatId = ServiceStatus['category'];

export default function CyberModule() {
  const { data: services, loading, lastUpdate } = useStore((s) => s.serviceStatus);
  const [expandedCat, setExpandedCat] = useState<CatId | null>(null);

  if (loading && services.length === 0) return <Init />;

  const downCount = services.filter((s) => s.status === 'down').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const grouped = categories.map((cat) => ({
    cat,
    label: CAT_LABELS[cat] || cat,
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-1.5">
      {/* Summary */}
      <div className="flex items-center gap-2 font-mono text-[9px]">
        {downCount > 0 ? (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#E76A6E', background: 'rgba(231,106,110,0.08)', border: '1px solid rgba(231,106,110,0.15)' }}>
            {downCount} DOWN
          </span>
        ) : degradedCount > 0 ? (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#EC9A3C', background: 'rgba(236,154,60,0.08)', border: '1px solid rgba(236,154,60,0.15)' }}>
            {degradedCount} DEGRADATI
          </span>
        ) : (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#32A467', background: 'rgba(50,164,103,0.08)', border: '1px solid rgba(50,164,103,0.15)' }}>
            TUTTI OPERATIVI
          </span>
        )}
        <span className="flex-1" />
        {lastUpdate && (
          <span style={{ color: 'var(--text-dim)' }}>{new Date(lastUpdate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>

      {/* Category groups */}
      {grouped.map(({ cat, label, items }) => {
        const catDown = items.filter((s) => s.status !== 'operational').length;
        const isExpanded = expandedCat === cat;
        return (
          <div key={cat}>
            <button onClick={() => setExpandedCat(isExpanded ? null : cat)}
              className="flex w-full items-center gap-2 py-1 px-1.5 rounded text-left hover:bg-[var(--bg-hover)] transition-colors">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span className="flex-1" />
              {catDown > 0 && (
                <span className="text-[8px] font-bold font-mono rounded px-1 py-0.5" style={{ color: '#E76A6E', background: 'rgba(231,106,110,0.08)' }}>
                  {catDown}
                </span>
              )}
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{isExpanded ? '▾' : '▸'}</span>
            </button>
            {isExpanded && (
              <div className="ml-2 space-y-0.5 mb-1">
                {items.map((svc) => {
                  const cfg = STATUS_CFG[svc.status];
                  return (
                    <div key={svc.id} className="flex items-center gap-2 py-0.5 px-1.5 rounded" style={{ background: 'var(--bg-card)' }}>
                      <span className="text-[9px] font-bold font-mono w-5 text-center" style={{ color: cfg.color }}>{svc.icon}</span>
                      <span className="text-[10px] flex-1" style={{ color: 'var(--text-secondary)' }}>{svc.name}</span>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{svc.latency}ms</span>
                      <span className="text-[8px] font-bold font-mono rounded px-1.5 py-0.5" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Verifica servizi Italia<span className="init-dots" /></span>
    </div>
  );
}

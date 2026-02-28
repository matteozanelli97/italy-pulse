'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

const STATUS_COLORS: Record<string, string> = {
  regolare: '#32A467',
  rallentato: '#EC9A3C',
  critico: '#E76A6E',
  sospeso: '#CD4246',
};

const STATUS_LABELS: Record<string, string> = {
  regolare: 'REGOLARE',
  rallentato: 'RALLENTATO',
  critico: 'CRITICO',
  sospeso: 'SOSPESO',
};

type TabId = 'highway' | 'train' | 'flight' | 'port';

export default function MobilityModule() {
  const { data: alerts } = useStore((s) => s.transport);
  const [tab, setTab] = useState<TabId>('highway');

  if (alerts.length === 0) return <Init />;

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'highway', label: 'Autostrade', icon: '🛣️' },
    { id: 'train', label: 'Treni', icon: '🚄' },
    { id: 'flight', label: 'Aeroporti', icon: '✈️' },
    { id: 'port', label: 'Porti', icon: '⚓' },
  ];

  const filtered = alerts.filter((a) => {
    if (tab === 'highway') return a.type === 'highway' || a.type === 'road';
    if (tab === 'train') return a.type === 'train';
    if (tab === 'flight') return a.type === 'flight';
    if (tab === 'port') return a.type === 'port';
    return false;
  });

  // Sort: critical first, then medium, then low
  const sorted = [...filtered].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  const criticalCount = alerts.filter((a) => a.severity === 'high').length;
  const slowCount = alerts.filter((a) => a.severity === 'medium').length;

  return (
    <div className="space-y-1.5">
      {/* Summary bar */}
      <div className="flex items-center gap-2 mb-1 font-mono text-[9px]">
        {criticalCount > 0 && (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#E76A6E', background: 'rgba(231,106,110,0.08)', border: '1px solid rgba(231,106,110,0.15)' }}>
            {criticalCount} CRITICI
          </span>
        )}
        {slowCount > 0 && (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#EC9A3C', background: 'rgba(236,154,60,0.08)', border: '1px solid rgba(236,154,60,0.15)' }}>
            {slowCount} RALLENTATI
          </span>
        )}
        {criticalCount === 0 && slowCount === 0 && (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#32A467', background: 'rgba(50,164,103,0.08)', border: '1px solid rgba(50,164,103,0.15)' }}>
            TUTTO REGOLARE
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all font-mono"
            style={{
              background: tab === t.id ? 'var(--accent-muted)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${tab === t.id ? 'var(--border-medium)' : 'var(--border-dim)'}`,
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-1">
        {sorted.map((a) => {
          const statusColor = STATUS_COLORS[a.status || 'regolare'] || '#32A467';
          return (
            <div key={a.id} className="rounded px-2 py-1.5 transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold font-mono" style={{ color: '#fff' }}>{a.title}</span>
                <span className="text-[8px] font-bold font-mono rounded px-1.5 py-0.5 uppercase"
                  style={{
                    color: statusColor,
                    background: `${statusColor}10`,
                    border: `1px solid ${statusColor}25`,
                  }}>
                  {STATUS_LABELS[a.status || 'regolare'] || a.status}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
              {a.route && (
                <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-dim)' }}>{a.route}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--accent)' }} />
      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Monitoraggio viabilità<span className="init-dots" /></span>
    </div>
  );
}

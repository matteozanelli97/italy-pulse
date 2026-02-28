'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { TransportAlert } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  regolare: '#32A467', rallentato: '#EC9A3C', critico: '#E76A6E', sospeso: '#CD4246',
};
const STATUS_LABELS: Record<string, string> = {
  regolare: 'REGOLARE', rallentato: 'RALLENTATO', critico: 'CRITICO', sospeso: 'SOSPESO',
};

type TabId = 'highway' | 'train' | 'flight' | 'port';

function getTabAlerts(alerts: TransportAlert[], tab: TabId) {
  return alerts.filter((a) => {
    if (tab === 'highway') return a.type === 'highway' || a.type === 'road';
    if (tab === 'train') return a.type === 'train';
    if (tab === 'flight') return a.type === 'flight';
    if (tab === 'port') return a.type === 'port';
    return false;
  });
}

export default function MobilityModule() {
  const { data: alerts } = useStore((s) => s.transport);
  const [tab, setTab] = useState<TabId>('highway');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (alerts.length === 0) return <Init />;

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'highway', label: 'Strade', icon: '🛣️' },
    { id: 'train', label: 'Treni', icon: '🚄' },
    { id: 'flight', label: 'Aerei', icon: '✈️' },
    { id: 'port', label: 'Porti', icon: '⚓' },
  ];

  const filtered = getTabAlerts(alerts, tab);
  const sorted = [...filtered].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 mb-1">
        {tabs.map((t) => {
          const issues = getTabAlerts(alerts, t.id).filter((a) => a.severity !== 'low').length;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="relative rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all font-mono"
              style={{
                background: tab === t.id ? 'var(--accent-muted)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-dim)',
                border: `1px solid ${tab === t.id ? 'var(--border-medium)' : 'var(--border-dim)'}`,
              }}>
              {t.icon} {t.label}
              {issues > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[7px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-0.5"
                  style={{ background: '#E76A6E', color: '#fff' }}>
                  {issues}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-1">
        {sorted.map((a) => {
          const statusColor = STATUS_COLORS[a.status || 'regolare'] || '#32A467';
          const isExpanded = expandedId === a.id;
          return (
            <button key={a.id} onClick={() => setExpandedId(isExpanded ? null : a.id)}
              className="w-full text-left rounded px-2 py-1.5 transition-colors hover:bg-[var(--bg-hover)]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold font-mono" style={{ color: '#fff' }}>{a.title}</span>
                <span className="text-[8px] font-bold font-mono rounded px-1.5 py-0.5 uppercase"
                  style={{ color: statusColor, background: `${statusColor}10`, border: `1px solid ${statusColor}25` }}>
                  {STATUS_LABELS[a.status || 'regolare'] || a.status}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
              {a.route && <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-dim)' }}>{a.route}</p>}
              {isExpanded && (
                <div className="mt-1.5 pt-1.5 border-t space-y-0.5 text-[9px]" style={{ borderColor: 'var(--border-dim)' }}>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Tipo</span><span className="font-mono" style={{ color: '#fff' }}>{a.type}</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Gravità</span><span className="font-mono" style={{ color: statusColor }}>{a.severity}</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Ultimo aggiornamento</span><span className="font-mono" style={{ color: '#fff' }}>{new Date(a.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span></div>
                  {a.route && <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Percorso</span><span className="font-mono" style={{ color: '#fff' }}>{a.route}</span></div>}
                </div>
              )}
            </button>
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

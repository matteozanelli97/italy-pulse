'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { ServiceStatus } from '@/types';

const STATUS_CFG = {
  operational: { color: '#32A467', label: 'Operational', dot: '#32A467' },
  degraded: { color: '#EC9A3C', label: 'Degraded', dot: '#EC9A3C' },
  down: { color: '#E76A6E', label: 'Down', dot: '#E76A6E' },
} as const;

const CAT_LABELS: Record<string, string> = {
  telecom: 'Telecom', banking: 'Banking', social: 'Social Media',
  cloud: 'Cloud & Tech', transport: 'Transport', media: 'Streaming', gov: 'Government',
};

type CatId = ServiceStatus['category'];

export default function CyberModule() {
  const { data: services, loading, lastUpdate } = useStore((s) => s.serviceStatus);
  const [expandedSvc, setExpandedSvc] = useState<string | null>(null);

  if (loading && services.length === 0) return <Init />;

  const downCount = services.filter((s) => s.status === 'down').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const totalIssues = downCount + degradedCount;

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const grouped = categories.map((cat) => ({
    cat, label: CAT_LABELS[cat] || cat,
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded px-2.5 py-1.5" style={{
          background: totalIssues > 0 ? 'rgba(231,106,110,0.06)' : 'rgba(50,164,103,0.06)',
          border: `1px solid ${totalIssues > 0 ? 'rgba(231,106,110,0.15)' : 'rgba(50,164,103,0.15)'}`,
        }}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: totalIssues > 0 ? '#E76A6E' : '#32A467' }} />
            <span className="text-[10px] font-bold" style={{ color: totalIssues > 0 ? '#E76A6E' : '#32A467' }}>
              {totalIssues > 0 ? `${totalIssues} issues detected` : 'All services operational'}
            </span>
            <span className="flex-1" />
            <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Services grid — Downdetector style */}
      {grouped.map(({ cat, label, items }) => {
        const catIssues = items.filter((s) => s.status !== 'operational').length;
        return (
          <div key={cat}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
              {catIssues > 0 && (
                <span className="text-[8px] font-bold rounded-full h-3.5 min-w-[14px] flex items-center justify-center px-1"
                  style={{ background: '#E76A6E', color: '#fff' }}>{catIssues}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {items.map((svc) => {
                const cfg = STATUS_CFG[svc.status];
                const isExpanded = expandedSvc === svc.id;
                return (
                  <button key={svc.id} onClick={() => setExpandedSvc(isExpanded ? null : svc.id)}
                    className="rounded px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ background: 'var(--bg-card)', border: `1px solid ${svc.status !== 'operational' ? `${cfg.color}30` : 'var(--border-dim)'}` }}>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                      <span className="text-[10px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{svc.name}</span>
                    </div>
                    {isExpanded && (
                      <div className="mt-1 pt-1 border-t space-y-0.5 text-[8px] font-mono" style={{ borderColor: 'var(--border-dim)' }}>
                        <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Status</span><span style={{ color: cfg.color }}>{cfg.label}</span></div>
                        <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>Latency</span><span style={{ color: svc.latency > 3000 ? '#EC9A3C' : '#fff' }}>{svc.latency}ms</span></div>
                        <div className="flex justify-between"><span style={{ color: 'var(--text-dim)' }}>HTTP</span><span style={{ color: '#fff' }}>{svc.httpStatus || 'N/A'}</span></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
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
      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Checking global services<span className="init-dots" /></span>
    </div>
  );
}

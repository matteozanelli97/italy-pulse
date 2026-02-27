'use client';

import { useStore } from '@/lib/store';

const SEV_COLORS: Record<string, string> = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };
const TYPE_ICONS: Record<string, string> = { train: '🚂', flight: '✈️', road: '🛣️', accident: '⚠️', delay: '🕐' };

export default function MobilityModule() {
  const { data: alerts } = useStore((s) => s.transport);

  if (alerts.length === 0) return <Init />;

  return (
    <div className="space-y-1.5">
      {alerts.map((a) => (
        <div key={a.id} className="flex items-start gap-2 py-0.5">
          <span className="text-[11px] flex-shrink-0">{TYPE_ICONS[a.type] || '📋'}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-medium" style={{ color: SEV_COLORS[a.severity] || 'var(--text-secondary)' }}>{a.title}</p>
            <p className="text-[8px] truncate" style={{ color: 'var(--text-dim)' }}>{a.description}</p>
            {a.route && <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>{a.route}</p>}
          </div>
          <span className="text-[7px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {new Date(a.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Monitoraggio viabilità<span className="init-dots" /></span>
    </div>
  );
}

'use client';

import { useStore } from '@/lib/store';

const SEV_COLORS: Record<string, string> = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444' };
const TYPE_ICONS: Record<string, string> = { train: '🚂', flight: '✈️', road: '🛣️' };

export default function TransportModule({ search }: { search: string }) {
  const { data: alerts } = useStore((s) => s.transport);

  const filtered = alerts.filter((a) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return a.title.toLowerCase().includes(s) || a.description.toLowerCase().includes(s) || a.type.includes(s);
  });

  if (alerts.length === 0) return <Init />;

  return (
    <div className="space-y-1.5">
      {filtered.map((a) => (
        <div key={a.id} className="flex items-start gap-2 py-0.5">
          <span className="text-[12px] flex-shrink-0">{TYPE_ICONS[a.type] || '📋'}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium" style={{ color: SEV_COLORS[a.severity] || 'var(--text-secondary)' }}>{a.title}</p>
            <p className="text-[9px] truncate" style={{ color: 'var(--text-dim)' }}>{a.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Monitoraggio trasporti<span className="init-dots" /></span>
    </div>
  );
}

'use client';

import { useStore } from '@/lib/store';

export default function EnergyModule({ search }: { search: string }) {
  const { data: items } = useStore((s) => s.energy);

  const filtered = items.filter((e) => {
    if (!search) return true;
    return e.type.toLowerCase().includes(search.toLowerCase());
  });

  if (items.length === 0) return <Init />;

  return (
    <div className="space-y-1.5">
      {filtered.map((e, i) => {
        const up = e.change >= 0;
        return (
          <div key={i} className="flex items-center justify-between py-0.5">
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{e.type}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{e.value}{e.unit.startsWith('%') ? '%' : ` ${e.unit}`}</span>
              <span className={`font-mono text-[9px] font-bold ${up ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>{up ? '+' : ''}{e.change.toFixed(1)}</span>
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
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Caricamento dati energia<span className="init-dots" /></span>
    </div>
  );
}

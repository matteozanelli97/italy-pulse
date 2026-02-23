'use client';

import { useStore } from '@/lib/store';

export default function FinancialModule({ search }: { search: string }) {
  const { data: ticks, loading } = useStore((s) => s.markets);

  const filtered = ticks.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return t.symbol.toLowerCase().includes(s) || t.name.toLowerCase().includes(s);
  });

  if (loading && ticks.length === 0) return <Shimmer />;

  return (
    <div className="space-y-1.5">
      {filtered.map((t) => {
        const up = t.changePercent24h >= 0;
        const special = ['FTSEMIB', 'EUR/USD', 'SPREAD'].includes(t.symbol);
        return (
          <div key={t.symbol} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold" style={{ color: special ? 'var(--blue-400)' : 'var(--text-primary)' }}>{t.symbol}</span>
              <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {t.currency === 'bps' ? '' : t.currency === 'USD' ? '$' : '€'}{t.price.toLocaleString('it-IT', { minimumFractionDigits: t.price < 10 ? 4 : 2, maximumFractionDigits: t.price < 10 ? 4 : 2 })}
              </span>
              <span className={`font-mono text-[10px] font-bold ${up ? 'text-[#3b82f6]' : 'text-[#ef4444]'}`}>
                {up ? '+' : ''}{t.changePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && <Empty />}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-24 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

function Empty() {
  return <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>;
}

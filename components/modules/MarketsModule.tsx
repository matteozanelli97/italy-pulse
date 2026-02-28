'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function MarketsModule() {
  const { data: ticks, loading } = useStore((s) => s.markets);
  const { data: energy } = useStore((s) => s.energy);
  const [region, setRegion] = useState<'IT' | 'US'>('IT');

  if (loading && ticks.length === 0) return <Shimmer />;

  const itSymbols = ['FTSEMIB', 'EUR/USD', 'SPREAD', 'BTC', 'ETH'];
  const usSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'XAUt', 'EURS'];
  const symbols = region === 'IT' ? itSymbols : usSymbols;
  const filtered = ticks.filter((t) => symbols.includes(t.symbol));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        {(['IT', 'US'] as const).map((r) => (
          <button key={r} onClick={() => setRegion(r)}
            className="rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all font-mono"
            style={{
              background: region === r ? 'rgba(0,229,255,0.10)' : 'transparent',
              color: region === r ? 'var(--cyan-500)' : 'var(--text-dim)',
              border: `1px solid ${region === r ? 'rgba(0,229,255,0.20)' : 'var(--border-dim)'}`,
            }}>
            {r === 'IT' ? 'Italia' : 'USA'}
          </button>
        ))}
      </div>

      {filtered.map((t) => {
        const up = t.changePercent24h >= 0;
        return (
          <div key={t.symbol} className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{t.symbol}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {t.currency === 'bps' ? '' : t.currency === 'USD' ? '$' : '€'}{t.price.toLocaleString('it-IT', { minimumFractionDigits: t.price < 10 ? 4 : 2, maximumFractionDigits: t.price < 10 ? 4 : 2 })}
              </span>
              <span className={`text-[11px] font-bold font-mono ${up ? 'text-[#00bcd4]' : 'text-[#ef4444]'}`}>
                {up ? '+' : ''}{t.changePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}

      {energy.length > 0 && (
        <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--border-dim)' }}>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Energia</span>
          {energy.map((e, i) => {
            const up = e.change >= 0;
            return (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{e.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{e.value}{e.unit.startsWith('%') ? '%' : ` ${e.unit}`}</span>
                  <span className={`text-[10px] font-bold font-mono ${up ? 'text-[#00bcd4]' : 'text-[#ef4444]'}`}>{up ? '+' : ''}{e.change.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-24 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

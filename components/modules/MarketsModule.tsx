'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function MarketsModule() {
  const { data: serverTicks, loading } = useStore((s) => s.markets);
  const { data: energy } = useStore((s) => s.energy);
  const region = useStore((s) => s.marketRegion);
  const setRegion = useStore((s) => s.setMarketRegion);
  const [liveTicks, setLiveTicks] = useState(serverTicks);
  const [switching, setSwitching] = useState(false);
  const tickRef = useRef(serverTicks);

  useEffect(() => {
    tickRef.current = serverTicks;
    setLiveTicks(serverTicks);
    setSwitching(false);
  }, [serverTicks]);

  // Client-side 1-second micro-tick
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTicks((prev) =>
        prev.map((t) => {
          const volatility = t.category === 'crypto' ? 0.0004 : t.category === 'forex' ? 0.00005 : 0.0002;
          const delta = (Math.random() - 0.5) * 2 * volatility * t.price;
          const newPrice = t.price + delta;
          const newChange = t.change24h + delta;
          const newPct = t.price > 0 ? (newChange / (t.price - newChange)) * 100 : t.changePercent24h;
          return { ...t, price: roundDec(newPrice, t.price < 10 ? 4 : 2), change24h: roundDec(newChange, t.price < 10 ? 4 : 2), changePercent24h: roundDec(newPct, 2), lastUpdate: new Date().toISOString() };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegionSwitch = (r: 'IT' | 'US') => {
    if (r !== region) { setSwitching(true); setRegion(r); }
  };

  if (loading && liveTicks.length === 0) return <Shimmer />;

  const filtered = liveTicks.filter((t) => t.region === region);
  const sections: Array<{ label: string; items: typeof filtered }> = [
    { label: 'Indici', items: filtered.filter((t) => t.category === 'index') },
    { label: 'Azioni', items: filtered.filter((t) => t.category === 'stock') },
    { label: 'Crypto', items: filtered.filter((t) => t.category === 'crypto') },
    { label: 'Forex', items: filtered.filter((t) => t.category === 'forex') },
    { label: 'Obbligazioni', items: filtered.filter((t) => t.category === 'bond') },
    { label: 'Commodity', items: filtered.filter((t) => t.category === 'commodity') },
    { label: 'Energia', items: filtered.filter((t) => t.category === 'energy') },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        {(['IT', 'US'] as const).map((r) => (
          <button key={r} onClick={() => handleRegionSwitch(r)}
            className="rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all font-mono"
            style={{
              background: region === r ? 'var(--accent-muted)' : 'transparent',
              color: region === r ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${region === r ? 'var(--border-medium)' : 'var(--border-dim)'}`,
            }}>
            {r === 'IT' ? 'Italia' : 'USA'}
          </button>
        ))}
        <span className="flex-1" />
        {switching && <span className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--cyan-500)', borderTopColor: 'transparent' }} />}
        <span className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>LIVE</span>
      </div>

      {switching && filtered.length === 0 ? <Shimmer /> : (
        <>
          {sections.map((sec) => (
            <div key={sec.label}>
              <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] mt-1 mb-0.5" style={{ color: 'var(--text-muted)' }}>{sec.label}</div>
              {sec.items.map((t) => <TickRow key={t.symbol} tick={t} regionCurrency={region === 'IT' ? '€' : '$'} />)}
            </div>
          ))}
          {energy.length > 0 && sections.every((s) => s.label !== 'Energia') && (
            <div className="mt-1 pt-1 border-t" style={{ borderColor: 'var(--border-dim)' }}>
              <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: 'var(--text-muted)' }}>Energia</div>
              {energy.map((e, i) => {
                const up = e.change >= 0;
                return (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{e.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono" style={{ color: '#fff' }}>{e.value}{e.unit.startsWith('%') ? '%' : ` ${e.unit}`}</span>
                      <span className="text-[10px] font-bold font-mono" style={{ color: up ? '#32A467' : '#E76A6E' }}>{up ? '+' : ''}{e.change.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TickRow({ tick: t, regionCurrency }: { tick: { symbol: string; name: string; price: number; changePercent24h: number; currency: string }; regionCurrency: string }) {
  const up = t.changePercent24h >= 0;
  const cur = t.currency === 'bps' ? '' : t.currency === 'USD' || t.currency === 'USD/oz' || t.currency === 'USD/bbl' ? '$' : regionCurrency;
  const unit = t.currency === 'bps' ? ' bps' : t.currency === 'EUR/MWh' || t.currency === 'USD/MWh' ? ' €/MWh' : '';
  const decimals = t.price < 2 ? 4 : t.price < 100 ? 2 : t.price > 10000 ? 0 : 2;

  return (
    <div className="flex items-center justify-between py-[3px] rounded px-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[11px] font-bold font-mono" style={{ color: '#fff' }}>{t.symbol}</span>
        <span className="text-[9px] truncate" style={{ color: 'var(--text-dim)' }}>{t.name}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-bold font-mono tabular-nums" style={{ color: '#fff' }}>
          {cur}{t.price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{unit}
        </span>
        <span className="text-[10px] font-bold font-mono tabular-nums min-w-[52px] text-right"
          style={{ color: up ? '#32A467' : '#E76A6E' }}>
          {up ? '+' : ''}{t.changePercent24h.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function roundDec(n: number, d: number): number {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

function Shimmer() {
  return <div className="space-y-2 py-1">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-24 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

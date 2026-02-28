'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';

export default function MarketsModule() {
  const { data: serverTicks, loading } = useStore((s) => s.markets);
  const { data: energy } = useStore((s) => s.energy);
  const region = useStore((s) => s.marketRegion);
  const setRegion = useStore((s) => s.setMarketRegion);
  const [liveTicks, setLiveTicks] = useState(serverTicks);
  const tickRef = useRef(serverTicks);

  // Sync from server whenever new data arrives
  useEffect(() => {
    tickRef.current = serverTicks;
    setLiveTicks(serverTicks);
  }, [serverTicks]);

  // Client-side 1-second micro-tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTicks((prev) =>
        prev.map((t) => {
          // Small random walk: ±0.02-0.05% per second
          const volatility = t.category === 'crypto' ? 0.0004 : t.category === 'forex' ? 0.00005 : 0.0002;
          const delta = (Math.random() - 0.5) * 2 * volatility * t.price;
          const newPrice = t.price + delta;
          const newChange = t.change24h + delta;
          const newPct = t.price > 0 ? (newChange / (t.price - newChange)) * 100 : t.changePercent24h;
          return {
            ...t,
            price: roundDec(newPrice, t.price < 10 ? 4 : 2),
            change24h: roundDec(newChange, t.price < 10 ? 4 : 2),
            changePercent24h: roundDec(newPct, 2),
            lastUpdate: new Date().toISOString(),
          };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && liveTicks.length === 0) return <Shimmer />;

  // Show all ticks for the current region
  const filtered = liveTicks.filter((t) => t.region === region);
  const indices = filtered.filter((t) => t.category === 'index');
  const stocks = filtered.filter((t) => t.category === 'stock');
  const crypto = filtered.filter((t) => t.category === 'crypto');
  const forex = filtered.filter((t) => t.category === 'forex');
  const bonds = filtered.filter((t) => t.category === 'bond');
  const commodities = filtered.filter((t) => t.category === 'commodity');
  const energyTicks = filtered.filter((t) => t.category === 'energy');

  const sections: Array<{ label: string; items: typeof filtered }> = [
    { label: 'Indici', items: indices },
    { label: 'Azioni', items: stocks },
    { label: 'Crypto', items: crypto },
    { label: 'Forex', items: forex },
    { label: 'Obbligazioni', items: bonds },
    { label: 'Commodity', items: commodities },
    { label: 'Energia', items: energyTicks },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="space-y-1.5">
      {/* Region Toggle */}
      <div className="flex items-center gap-1.5 mb-1">
        {(['IT', 'US'] as const).map((r) => (
          <button key={r} onClick={() => setRegion(r)}
            className="rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all font-mono"
            style={{
              background: region === r ? 'var(--accent-muted)' : 'transparent',
              color: region === r ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${region === r ? 'var(--border-medium)' : 'var(--border-dim)'}`,
            }}>
            {r === 'IT' ? '🇮🇹 Italia' : '🇺🇸 USA'}
          </button>
        ))}
        <span className="flex-1" />
        <span className="text-[8px] font-mono animate-pulse" style={{ color: 'var(--text-muted)' }}>LIVE</span>
      </div>

      {/* Sections */}
      {sections.map((sec) => (
        <div key={sec.label}>
          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] mt-1 mb-0.5" style={{ color: 'var(--text-muted)' }}>
            {sec.label}
          </div>
          {sec.items.map((t) => <TickRow key={t.symbol} tick={t} regionCurrency={region === 'IT' ? '€' : '$'} />)}
        </div>
      ))}

      {/* Energy from energy API */}
      {energy.length > 0 && energyTicks.length === 0 && (
        <div className="mt-1 pt-1 border-t" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="font-mono text-[8px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: 'var(--text-muted)' }}>Energia</div>
          {energy.map((e, i) => {
            const up = e.change >= 0;
            return (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{e.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono" style={{ color: '#fff' }}>{e.value}{e.unit.startsWith('%') ? '%' : ` ${e.unit}`}</span>
                  <span className={`text-[10px] font-bold font-mono`} style={{ color: up ? '#32A467' : '#E76A6E' }}>{up ? '+' : ''}{e.change.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TickRow({ tick: t, regionCurrency }: { tick: { symbol: string; name: string; price: number; change24h: number; changePercent24h: number; currency: string; category?: string }; regionCurrency: string }) {
  const up = t.changePercent24h >= 0;
  const prevPriceRef = useRef(t.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  const updateFlash = useCallback((currentPrice: number) => {
    if (currentPrice > prevPriceRef.current) setFlash('up');
    else if (currentPrice < prevPriceRef.current) setFlash('down');
    prevPriceRef.current = currentPrice;
  }, []);

  useEffect(() => {
    updateFlash(t.price);
    const timer = setTimeout(() => setFlash(null), 400);
    return () => clearTimeout(timer);
  }, [t.price, updateFlash]);

  // Currency symbol
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
        <span className="text-[11px] font-bold font-mono tabular-nums transition-colors duration-300"
          style={{ color: flash === 'up' ? '#32A467' : flash === 'down' ? '#E76A6E' : '#fff' }}>
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

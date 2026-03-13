'use client';

import { useState, useEffect, useCallback } from 'react';

interface FuelPrice {
  region: string;
  benzina: number;
  diesel: number;
  gpl: number;
  metano: number;
  trend: 'up' | 'down' | 'stable';
}

export default function FuelModule() {
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelType, setFuelType] = useState<'benzina' | 'diesel' | 'gpl'>('benzina');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/fuel');
      if (!res.ok) return;
      const data = await res.json();
      setPrices(data.prices || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3_600_000); // hourly
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
        <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>
          Caricamento prezzi carburante<span className="init-dots" />
        </span>
      </div>
    );
  }

  if (prices.length === 0) return null;

  // National average
  const avg = {
    benzina: prices.reduce((s, p) => s + p.benzina, 0) / prices.length,
    diesel: prices.reduce((s, p) => s + p.diesel, 0) / prices.length,
    gpl: prices.reduce((s, p) => s + p.gpl, 0) / prices.length,
  };

  // Sort by selected fuel type descending
  const sorted = [...prices].sort((a, b) => b[fuelType] - a[fuelType]);
  const maxPrice = sorted[0]?.[fuelType] || 2;
  const minPrice = sorted[sorted.length - 1]?.[fuelType] || 1;

  return (
    <div className="space-y-2">
      {/* National averages */}
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded px-2.5 py-1.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-[7px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Benzina</div>
              <div className="text-[11px] font-mono font-bold tabular-nums" style={{ color: 'var(--amber)' }}>€{avg.benzina.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="text-[7px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Diesel</div>
              <div className="text-[11px] font-mono font-bold tabular-nums" style={{ color: 'var(--accent)' }}>€{avg.diesel.toFixed(3)}</div>
            </div>
            <div className="text-center">
              <div className="text-[7px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>GPL</div>
              <div className="text-[11px] font-mono font-bold tabular-nums" style={{ color: 'var(--green)' }}>€{avg.gpl.toFixed(3)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fuel type filter */}
      <div className="flex gap-1">
        {(['benzina', 'diesel', 'gpl'] as const).map((ft) => (
          <button
            key={ft}
            onClick={() => setFuelType(ft)}
            className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
            style={{
              background: fuelType === ft ? 'var(--accent-muted)' : 'transparent',
              color: fuelType === ft ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${fuelType === ft ? 'var(--border-medium)' : 'transparent'}`,
            }}
          >
            {ft}
          </button>
        ))}
      </div>

      {/* Regional prices bar chart */}
      <div className="space-y-0.5">
        {sorted.slice(0, 10).map((p) => {
          const price = p[fuelType];
          const barWidth = ((price - minPrice) / (maxPrice - minPrice)) * 100;
          const isHigh = price > avg[fuelType] * 1.02;
          const isLow = price < avg[fuelType] * 0.98;

          return (
            <div key={p.region} className="flex items-center gap-2">
              <span className="w-20 text-[8px] font-mono truncate text-right" style={{ color: 'var(--text-dim)' }}>
                {p.region}
              </span>
              <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div
                  className="h-full rounded-sm flex items-center justify-end px-1"
                  style={{
                    width: `${Math.max(20, barWidth)}%`,
                    background: isHigh ? 'rgba(231,106,110,0.15)' : isLow ? 'rgba(50,164,103,0.15)' : 'rgba(45,114,210,0.10)',
                    borderRight: `2px solid ${isHigh ? 'var(--red)' : isLow ? 'var(--green)' : 'var(--accent)'}`,
                    transition: 'width 0.3s ease',
                  }}
                >
                  <span className="text-[8px] font-mono font-bold tabular-nums" style={{
                    color: isHigh ? 'var(--red)' : isLow ? 'var(--green)' : 'var(--accent)',
                  }}>
                    €{price.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <span className="text-[7px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          €/litro · Aggiornamento orario
        </span>
      </div>
    </div>
  );
}

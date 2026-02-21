'use client';

import { motion } from 'framer-motion';
import type { MarketTick } from '@/types';

interface MarketsPanelProps {
  ticks: MarketTick[];
  loading: boolean;
}

export default function MarketsPanel({ ticks, loading }: MarketsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-cyan-900/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-500">◆</span>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">MERCATI</h2>
            <p className="text-[8px] uppercase tracking-widest text-cyan-800">Crypto & Commodities</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && ticks.length === 0 ? (
          <Skeleton />
        ) : (
          <div className="flex flex-col gap-2">
            {ticks.map((tick, i) => {
              const isUp = tick.changePercent24h >= 0;
              const changeColor = isUp ? 'text-emerald-400' : 'text-red-400';
              const arrow = isUp ? '▲' : '▼';

              return (
                <motion.div
                  key={tick.symbol}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded border border-cyan-900/20 bg-cyan-950/10 p-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[12px] font-bold text-cyan-300">{tick.symbol}</span>
                      <span className="ml-2 text-[9px] text-cyan-700">{tick.name}</span>
                    </div>
                    <span className={`text-[9px] ${changeColor}`}>
                      {arrow} {Math.abs(tick.changePercent24h).toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-1 flex items-end justify-between">
                    <span className="font-mono text-lg font-bold text-cyan-200">
                      {tick.currency === 'EUR' ? '€' : '$'}
                      {tick.price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[10px] ${changeColor}`}>
                      {isUp ? '+' : ''}{tick.change24h.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded border border-cyan-900/20 bg-cyan-950/10 p-2">
          <div className="h-3 w-16 animate-pulse rounded bg-cyan-950/40" />
          <div className="mt-2 h-5 w-24 animate-pulse rounded bg-cyan-950/40" />
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { isMuted, setMuted } from '@/lib/sounds';

interface TopBarProps {
  onToggleData: () => void;
  onToggleIntel: () => void;
  showData: boolean;
  showIntel: boolean;
}

export default function TopBar({ onToggleData, onToggleIntel, showData, showIntel }: TopBarProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [ping, setPing] = useState(0);
  const [muted, setMutedState] = useState(false);
  const weather = useStore((s) => s.weather);
  const markets = useStore((s) => s.markets);
  const news = useStore((s) => s.news);
  const flights = useStore((s) => s.flights);
  const cyber = useStore((s) => s.cyber);
  const naval = useStore((s) => s.naval);
  const satellites = useStore((s) => s.satellites);
  const seismic = useStore((s) => s.seismic);
  const serviceStatus = useStore((s) => s.serviceStatus);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const measure = async () => {
      const t0 = performance.now();
      try {
        await fetch('/api/weather', { method: 'HEAD' }).catch(() => {});
        setPing(Math.round(performance.now() - t0));
      } catch { setPing(0); }
    };
    measure();
    const id = setInterval(measure, 30000);
    return () => clearInterval(id);
  }, []);

  const sources = [weather, markets, news, flights, cyber, naval, satellites, seismic];
  const activeSources = sources.filter((s) => !s.loading || s.data.length > 0).length;
  const totalDataPoints = sources.reduce((sum, s) => sum + s.data.length, 0);
  const errorSources = sources.filter((s) => s.error).length;

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }, [muted]);

  const SZ = 'text-[11px]';

  return (
    <header className="flex items-center justify-between border-b px-3 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(16,20,27,0.95) 0%, rgba(8,10,18,0.98) 100%)',
        borderColor: 'var(--border-dim)', height: 38,
        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>

      {/* Left -- Logo + Toggle buttons */}
      <div className="flex items-center gap-3">
        <span className="font-display text-[14px] leading-none tracking-[0.25em] font-bold" style={{ color: 'var(--cyan-500)' }}>
          SALA OPERATIVA
        </span>

        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={onToggleData}
            className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
            style={{
              background: showData ? 'rgba(0,200,255,0.15)' : 'transparent',
              color: showData ? 'var(--cyan-500)' : 'var(--text-muted)',
              border: `1px solid ${showData ? 'rgba(0,200,255,0.3)' : 'transparent'}`,
            }}
          >
            DATA
          </button>
          <button
            onClick={onToggleIntel}
            className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
            style={{
              background: showIntel ? 'rgba(0,200,255,0.15)' : 'transparent',
              color: showIntel ? 'var(--cyan-500)' : 'var(--text-muted)',
              border: `1px solid ${showIntel ? 'rgba(0,200,255,0.3)' : 'transparent'}`,
            }}
          >
            INTEL
          </button>
        </div>
      </div>

      {/* Center -- Date, time, stats */}
      <div className="flex items-center gap-3 font-mono">
        <span className={`${SZ} tracking-wide`} style={{ color: '#fff' }}>{date}</span>
        <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>|</span>
        <span className={`${SZ} font-bold tabular-nums tracking-wider`} style={{ color: '#fff' }}>{time} UTC</span>
        <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>|</span>
        <span className={SZ} style={{ color: '#fff' }}>Sources {activeSources}/{sources.length}</span>
        <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>|</span>
        <span className={SZ} style={{ color: '#fff' }}>Data {totalDataPoints}</span>
        <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>|</span>
        <span className={SZ} style={{ color: ping > 500 ? '#f59e0b' : '#fff' }}>Ping {ping}ms</span>
      </div>

      {/* Right -- Mute + status dot */}
      <div className="flex items-center gap-2">
        <button onClick={toggleMute} className="flex items-center justify-center h-5 w-5 rounded transition-colors hover:bg-white/10"
          title={muted ? 'Unmute sounds' : 'Mute sounds'}>
          {muted ? (
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round">
              <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="rgba(255,255,255,0.1)"/>
              <path d="M10.5 5.5l4 5M14.5 5.5l-4 5"/>
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round">
              <path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="rgba(255,255,255,0.1)"/>
              <path d="M11 5.5c.7.8 1 1.7 1 2.5s-.3 1.7-1 2.5M13 3.5c1.2 1.3 1.8 2.9 1.8 4.5S14.2 11.2 13 12.5"/>
            </svg>
          )}
        </button>
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-glow-breathe" style={{ background: errorSources > 0 ? '#f59e0b' : 'var(--cyan-500)' }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: errorSources > 0 ? '#f59e0b' : 'var(--cyan-500)' }} />
        </div>
      </div>
    </header>
  );
}

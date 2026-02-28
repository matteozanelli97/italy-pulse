'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export default function TopBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [ping, setPing] = useState(0);
  const weather = useStore((s) => s.weather);
  const markets = useStore((s) => s.markets);
  const news = useStore((s) => s.news);
  const flights = useStore((s) => s.flights);
  const cyber = useStore((s) => s.cyber);
  const naval = useStore((s) => s.naval);
  const satellites = useStore((s) => s.satellites);
  const serviceStatus = useStore((s) => s.serviceStatus);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
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

  const sources = [weather, markets, news, flights, cyber, naval, satellites];
  const activeSources = sources.filter((s) => !s.loading || s.data.length > 0).length;
  const totalDataPoints = sources.reduce((sum, s) => sum + s.data.length, 0);
  const errorSources = sources.filter((s) => s.error).length;
  const downServices = serviceStatus.data.filter((s) => s.status === 'down').length;

  return (
    <header className="flex items-center justify-between border-b px-4 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-deep) 100%)',
        borderColor: 'var(--border-dim)', height: 40,
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>

      {/* Left — Logo */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-6 w-6 items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--cyan-500)" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" stroke="var(--cyan-500)" strokeWidth="1.2" />
            <line x1="12" y1="2" x2="12" y2="6" stroke="var(--cyan-500)" strokeWidth="1" />
            <line x1="12" y1="18" x2="12" y2="22" stroke="var(--cyan-500)" strokeWidth="1" />
            <line x1="2" y1="12" x2="6" y2="12" stroke="var(--cyan-500)" strokeWidth="1" />
            <line x1="18" y1="12" x2="22" y2="12" stroke="var(--cyan-500)" strokeWidth="1" />
          </svg>
        </div>
        <h1 className="hidden sm:block font-display text-[16px] leading-none tracking-[0.2em] text-glow" style={{ color: 'var(--cyan-500)' }}>
          ITALY PULSE
        </h1>
      </div>

      {/* Center — Date, Time, and key info all on one line */}
      <div className="flex items-center gap-3 font-mono">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: '#fff' }}>{date}</span>
        <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>|</span>
        <span className="text-[14px] font-bold tabular-nums tracking-wider" style={{ color: '#fff' }}>{time}</span>
        <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>|</span>
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>FONTI <span style={{ color: '#fff' }}>{activeSources}/7</span></span>
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>DATI <span style={{ color: '#fff' }}>{totalDataPoints}</span></span>
        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>PING <span style={{ color: ping > 500 ? '#f59e0b' : '#fff' }}>{ping}ms</span></span>
        {downServices > 0 && (
          <span className="text-[10px] font-bold" style={{ color: '#E76A6E' }}>{downServices} DOWN</span>
        )}
      </div>

      {/* Right — Status indicator */}
      <div className="flex items-center gap-2">
        <span className="hidden md:inline text-[8px] font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>AES-256</span>
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-glow-breathe" style={{ background: errorSources > 0 ? '#f59e0b' : 'var(--cyan-500)' }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: errorSources > 0 ? '#f59e0b' : 'var(--cyan-500)' }} />
        </div>
      </div>
    </header>
  );
}

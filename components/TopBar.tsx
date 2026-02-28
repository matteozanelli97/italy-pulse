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

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
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

  return (
    <header className="flex items-center justify-between border-b px-5 py-2 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-deep) 100%)',
        borderColor: 'var(--border-dim)', minHeight: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}>

      {/* Left — Logo + Day/Time */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--cyan-500)" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" stroke="var(--cyan-500)" strokeWidth="1.2" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="var(--cyan-500)" strokeWidth="1" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="var(--cyan-500)" strokeWidth="1" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="var(--cyan-500)" strokeWidth="1" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="var(--cyan-500)" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-[22px] leading-none tracking-[0.25em] text-glow" style={{ color: 'var(--cyan-500)' }}>
              ITALY PULSE
            </h1>
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
              C4ISR OSINT PLATFORM
            </p>
          </div>
        </div>

        <div className="hidden md:block border-l pl-5 ml-2" style={{ borderColor: 'var(--border-dim)' }}>
          <div className="font-mono text-[15px] font-bold tracking-wider tabular-nums" style={{ color: 'var(--cyan-500)' }}>
            {time}
          </div>
          <div className="text-[10px] uppercase tracking-[0.1em] capitalize" style={{ color: 'var(--text-dim)' }}>
            {date}
          </div>
        </div>
      </div>

      {/* Right — Technical info */}
      <div className="flex items-center gap-2.5">
        <Pill label="PING" value={`${ping}ms`} status={ping > 500 ? 'warn' : 'ok'} />
        <Pill label="FONTI" value={`${activeSources}/7`} status={errorSources > 0 ? 'warn' : 'ok'} />
        <Pill label="DATI" value={`${totalDataPoints}`} />
        <Pill label="AES-256" value="CRYPT" />
        <div className="relative flex h-3 w-3 ml-1">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-glow-breathe" style={{ background: errorSources > 0 ? '#f59e0b' : 'var(--cyan-500)' }} />
          <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: errorSources > 0 ? '#f59e0b' : 'var(--cyan-500)' }} />
        </div>
      </div>
    </header>
  );
}

function Pill({ label, value, status }: { label: string; value: string; status?: 'ok' | 'warn' }) {
  return (
    <div className="hidden md:flex items-center gap-1.5 rounded px-2.5 py-1"
      style={{
        background: status === 'warn' ? 'rgba(245,158,11,0.04)' : 'rgba(0,229,255,0.03)',
        border: `1px solid ${status === 'warn' ? 'rgba(245,158,11,0.12)' : 'var(--border-dim)'}`,
      }}>
      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="font-mono text-[11px] font-semibold" style={{ color: status === 'warn' ? '#f59e0b' : 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

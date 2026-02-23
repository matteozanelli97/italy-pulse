'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export default function TopBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const seismic = useStore((s) => s.seismic);
  const weather = useStore((s) => s.weather);
  const markets = useStore((s) => s.markets);
  const news = useStore((s) => s.news);
  const flights = useStore((s) => s.flights);
  const cyber = useStore((s) => s.cyber);
  const naval = useStore((s) => s.naval);
  const aiSummary = useStore((s) => s.aiSummary);

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

  const sources = [seismic, weather, markets, news, flights, cyber, naval];
  const activeSources = sources.filter((s) => !s.loading || s.data.length > 0).length;
  const totalDataPoints = sources.reduce((sum, s) => sum + s.data.length, 0);
  const errorSources = sources.filter((s) => s.error).length;

  return (
    <header className="flex items-center justify-between border-b px-4 py-1.5 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-deep) 100%)',
        borderColor: 'var(--border-dim)',
        minHeight: 46,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}>

      {/* Left — Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <svg viewBox="0 0 40 12" className="h-3 w-8" aria-hidden="true">
              <path d="M0 6 Q5 0 10 6 T20 6 T30 6 T40 6" fill="none" stroke="var(--blue-500)" strokeWidth="1.5" style={{ animation: 'wave-flow 3s ease-in-out infinite' }} />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-[18px] leading-none tracking-[0.2em] text-glow" style={{ color: 'var(--blue-400)' }}>
              ITALY PULSE
            </h1>
            <p className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>
              C4ISR Tactical Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Center — Status */}
      <div className="hidden md:flex items-center gap-3">
        <StatusPill icon={<LockIcon />} label="AES-256" value="ENCRYPTED" />
        <StatusPill icon={<NodeIcon />} label="FONTI" value={`${activeSources}/7 ATTIVE`} status={errorSources > 0 ? 'warn' : 'ok'} />
        <StatusPill icon={<DataIcon />} label="DATI" value={`${totalDataPoints} PTS`} />
        {aiSummary && (
          <div className="max-w-[280px] rounded-md px-2.5 py-1 text-[9px] leading-relaxed truncate"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid var(--border-dim)', color: 'var(--blue-400)', boxShadow: 'var(--shadow-card)' }}>
            <span className="font-bold mr-1 opacity-70">AI</span>{aiSummary}
          </div>
        )}
      </div>

      {/* Right — Clock */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-mono text-[14px] font-bold tracking-wider tabular-nums" style={{ color: 'var(--blue-400)' }}>
            {time}
          </div>
          <div className="font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
            {date} · Roma CET
          </div>
        </div>
        <div className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: 'var(--blue-400)' }} />
        </div>
      </div>
    </header>
  );
}

function StatusPill({ icon, label, value, status }: { icon: React.ReactNode; label: string; value: string; status?: 'ok' | 'warn' }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1"
      style={{
        background: status === 'warn' ? 'rgba(245,158,11,0.04)' : 'rgba(59,130,246,0.04)',
        border: `1px solid ${status === 'warn' ? 'rgba(245,158,11,0.12)' : 'var(--border-dim)'}`,
        boxShadow: 'var(--shadow-card)',
      }}>
      <span className="flex h-4 w-4 items-center justify-center" style={{ color: status === 'warn' ? '#f59e0b' : 'var(--blue-500)' }}>{icon}</span>
      <div>
        <div className="text-[7px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>{label}</div>
        <div className="font-mono text-[9px] font-semibold" style={{ color: status === 'warn' ? '#f59e0b' : 'var(--text-secondary)' }}>{value}</div>
      </div>
    </div>
  );
}

function LockIcon() { return <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" /></svg>; }
function NodeIcon() { return <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /><circle cx="3" cy="3" r="1.2" stroke="currentColor" strokeWidth="1" /><circle cx="13" cy="3" r="1.2" stroke="currentColor" strokeWidth="1" /><circle cx="13" cy="13" r="1.2" stroke="currentColor" strokeWidth="1" /><line x1="6.5" y1="6.5" x2="4" y2="4" stroke="currentColor" strokeWidth="1" /><line x1="9.5" y1="6.5" x2="12" y2="4" stroke="currentColor" strokeWidth="1" /><line x1="9.5" y1="9.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1" /></svg>; }
function DataIcon() { return <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><rect x="2" y="8" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1" /><rect x="6.5" y="5" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="1" /><rect x="11" y="2" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1" /></svg>; }

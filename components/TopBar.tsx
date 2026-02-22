'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TopBarProps {
  activeSources: number;
  totalSources: number;
  dataPoints: number;
  aiSummary?: string;
}

export default function TopBar({ activeSources, totalSources, dataPoints, aiSummary }: TopBarProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [ping, setPing] = useState(14);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleString('it-IT', {
          timeZone: 'Europe/Rome',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDate(
        now.toLocaleString('it-IT', {
          timeZone: 'Europe/Rome',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
      setPing(Math.floor(10 + Math.random() * 18));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative z-50 flex h-11 items-center justify-between border-b px-4"
      style={{ background: '#0a0a0a', borderColor: 'var(--border-dim)' }}
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-7 w-7 items-center justify-center">
          <svg viewBox="0 0 28 28" className="h-7 w-7">
            <polygon
              points="14,1 25,7.5 25,20.5 14,27 3,20.5 3,7.5"
              fill="none"
              stroke="var(--accent-cyan)"
              strokeWidth="1.5"
              opacity="0.7"
            />
            <polygon
              points="14,5 21,9 21,19 14,23 7,19 7,9"
              fill="rgba(0,212,255,0.06)"
              stroke="var(--accent-cyan)"
              strokeWidth="0.5"
              opacity="0.5"
            />
            <text x="14" y="17" textAnchor="middle" fill="var(--accent-cyan)" fontSize="10" fontWeight="bold" fontFamily="monospace">IP</text>
          </svg>
          <div className="absolute inset-0 animate-pulse-ring rounded-full border border-cyan-500/20 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-[17px] tracking-[0.12em] text-white">
            ITALY <span style={{ color: 'var(--accent-cyan)' }}>PULSE</span>
          </span>
          <svg viewBox="0 0 40 12" className="h-3 w-10 opacity-50">
            <path d="M0 6 Q3 2 6 6 T12 6 T18 6 T24 6 T30 6 T36 6 L40 6" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.2">
              <animate attributeName="d" dur="2s" repeatCount="indefinite"
                values="M0 6 Q3 2 6 6 T12 6 T18 6 T24 6 T30 6 T36 6 L40 6;M0 6 Q3 10 6 6 T12 6 T18 6 T24 6 T30 6 T36 6 L40 6;M0 6 Q3 2 6 6 T12 6 T18 6 T24 6 T30 6 T36 6 L40 6" />
            </path>
          </svg>
          <span className="hidden text-[9px] font-semibold uppercase tracking-[0.2em] md:inline" style={{ color: 'var(--text-dim)' }}>
            Piattaforma Analitica Live
          </span>
        </div>
      </div>

      {/* Center: Status indicators + AI summary */}
      <div className="hidden items-center gap-4 lg:flex">
        <StatusPill icon={<LockIcon />} label="AES-256" value="E2E" color="emerald" />
        <StatusPill
          icon={<NodeIcon />}
          label="NODI"
          value={`${activeSources}/${totalSources}`}
          color={activeSources === totalSources ? 'emerald' : 'amber'}
        />
        <StatusPill icon={<BoltIcon />} label="PING" value={`${ping}MS`} color="cyan" />
        <StatusPill icon={<DataIcon />} label="DATA" value={`${dataPoints.toLocaleString('it-IT')}`} color="cyan" />
        {aiSummary && (
          <div className="max-w-[220px] truncate rounded-md px-2 py-1 text-[9px]"
            style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)', color: 'var(--accent-purple)' }}>
            <span className="mr-1 opacity-60">AI:</span>{aiSummary}
          </div>
        )}
      </div>

      {/* Right: Date + Time */}
      <div className="flex items-center gap-4">
        <span className="hidden text-[11px] md:inline" style={{ color: 'var(--text-dim)' }}>
          {date}
        </span>
        <div className="flex items-center gap-1.5">
          <WifiIcon />
          <span className="font-mono text-sm font-bold tracking-wider" style={{ color: 'var(--accent-cyan)' }}>
            {time || '--:--:--'}
          </span>
        </div>
      </div>
    </motion.header>
  );
}

function StatusPill({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: 'emerald' | 'amber' | 'blue' | 'red' | 'cyan';
}) {
  const colors = {
    emerald: { dot: '#00e87b', text: '#00e87b', bg: 'rgba(0,232,123,0.05)', border: 'rgba(0,232,123,0.12)' },
    amber: { dot: '#ffb800', text: '#ffb800', bg: 'rgba(255,184,0,0.05)', border: 'rgba(255,184,0,0.12)' },
    blue: { dot: '#388bff', text: '#388bff', bg: 'rgba(56,139,255,0.05)', border: 'rgba(56,139,255,0.12)' },
    red: { dot: '#ff3b5c', text: '#ff3b5c', bg: 'rgba(255,59,92,0.05)', border: 'rgba(255,59,92,0.12)' },
    cyan: { dot: '#00d4ff', text: '#00d4ff', bg: 'rgba(0,212,255,0.05)', border: 'rgba(0,212,255,0.12)' },
  }[color];

  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      <span style={{ color: colors.dot }}>{icon}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span className="font-mono text-[10px] font-bold" style={{ color: colors.text }}>{value}</span>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path d="M8 1a3.5 3.5 0 00-3.5 3.5V6H3.75A1.75 1.75 0 002 7.75v5.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-5.5A1.75 1.75 0 0012.25 6H11.5V4.5A3.5 3.5 0 008 1zm2 5V4.5a2 2 0 10-4 0V6h4z" />
    </svg>
  );
}

function NodeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
      <circle cx="8" cy="3.5" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12.5" r="1.5" fill="currentColor" />
      <line x1="8" y1="5" x2="5" y2="11" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="5" x2="11" y2="11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path d="M9.5 1L4 9h4l-1.5 6L13 7H9l.5-6z" />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <rect x="1" y="8" width="3" height="6" rx="0.5" />
      <rect x="5" y="5" width="3" height="9" rx="0.5" />
      <rect x="9" y="2" width="3" height="12" rx="0.5" />
      <rect x="13" y="6" width="2" height="8" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" style={{ color: 'var(--accent-emerald)' }}>
      <path d="M1.5 5.5a9 9 0 0113 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M4 8.5a5.5 5.5 0 018 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M6.5 11a2.5 2.5 0 013 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

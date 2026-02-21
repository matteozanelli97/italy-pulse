'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatusBarProps {
  activeSources: number;
  totalSources: number;
}

export default function StatusBar({ activeSources, totalSources }: StatusBarProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleString('it-IT', {
          timeZone: 'Europe/Rome',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative z-40 flex h-10 items-center justify-between border-b border-cyan-900/40 bg-[#0a0a12]/90 px-4 backdrop-blur-sm"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-lg tracking-[0.15em] text-cyan-400">
          ITALY <span className="text-emerald-400">PULSE</span>
        </h1>
        <span className="text-[10px] uppercase tracking-widest text-cyan-700">OSINT Dashboard</span>
      </div>

      {/* Center: Status pills */}
      <div className="hidden items-center gap-4 md:flex">
        <StatusPill label="FONTI" value={`${activeSources}/${totalSources}`} color={activeSources === totalSources ? 'emerald' : 'amber'} />
        <StatusPill label="LIVE" value="ATTIVO" color="emerald" pulse />
      </div>

      {/* Right: Clock */}
      <div className="font-mono text-xs tracking-wider text-cyan-600">
        {time || '--/--/----, --:--:--'}
      </div>
    </motion.header>
  );
}

function StatusPill({ label, value, color, pulse }: { label: string; value: string; color: 'emerald' | 'amber' | 'red'; pulse?: boolean }) {
  const dotColor = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  }[color];

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-cyan-900/30 bg-[#0d0d18] px-2.5 py-0.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
      <span className="text-[9px] uppercase tracking-widest text-cyan-700">{label}</span>
      <span className="text-[10px] font-medium text-cyan-400">{value}</span>
    </div>
  );
}

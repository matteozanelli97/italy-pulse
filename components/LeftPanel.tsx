'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import MarketsModule from './modules/MarketsModule';
import WeatherAQIModule from './modules/WeatherAQIModule';
import MobilityModule from './modules/MobilityModule';
import CyberModule from './modules/CyberModule';
import LiveCamsModule from './modules/LiveCamsModule';
import type { ModuleId } from '@/types';

const SECTIONS: { id: ModuleId; label: string; Component: React.ComponentType }[] = [
  { id: 'markets', label: 'MERCATI', Component: MarketsModule },
  { id: 'weatherAqi', label: 'METEO & AQI', Component: WeatherAQIModule },
  { id: 'mobility', label: 'VIABILITÀ', Component: MobilityModule },
  { id: 'cyber', label: 'CYBER INTEL', Component: CyberModule },
  { id: 'livecams', label: 'LIVE CAMS', Component: LiveCamsModule },
];

export default function LeftPanel() {
  const visibleModules = useStore((s) => s.visibleModules);
  const activeSections = SECTIONS.filter((s) => visibleModules[s.id]);

  if (activeSections.length === 0) return null;

  return (
    <motion.aside
      initial={{ x: -360, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      className="hidden lg:flex w-[360px] flex-shrink-0 flex-col overflow-hidden border-r"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}
    >
      <div className="border-b px-4 py-2.5" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--accent-muted)' }}>
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="var(--cyan-500)" strokeWidth="1.3" />
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="var(--cyan-500)" strokeWidth="1.3" />
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="var(--cyan-500)" strokeWidth="1.3" />
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="var(--cyan-500)" strokeWidth="1.3" />
            </svg>
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>Live Updates</span>
          <div className="flex-1" />
          <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--cyan-500)' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
            LIVE
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeSections.map((section) => (
          <div key={section.id} className="border-b" style={{ borderColor: 'var(--border-dim)' }}>
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: 'var(--bg-card)' }}>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
                {section.label}
              </span>
            </div>
            <div className="px-4 py-2.5">
              <section.Component />
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

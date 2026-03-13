'use client';

import { useStore } from '@/lib/store';
import MarketsModule from './modules/MarketsModule';
import WeatherAQIModule from './modules/WeatherAQIModule';
import SeismicModule from './modules/SeismicModule';
import CyberModule from './modules/CyberModule';
import LiveCamsModule from './modules/LiveCamsModule';
import FlightsModule from './modules/FlightsModule';
import type { ModuleId } from '@/types';

const SECTIONS: { id: ModuleId; label: string; Component: React.ComponentType }[] = [
  { id: 'markets', label: 'MARKETS', Component: MarketsModule },
  { id: 'weather', label: 'WEATHER', Component: WeatherAQIModule },
  { id: 'seismic', label: 'SEISMIC (USGS)', Component: SeismicModule },
  { id: 'services', label: 'SERVICES', Component: CyberModule },
  { id: 'livecams', label: 'LIVE CAMS', Component: LiveCamsModule },
  { id: 'flights', label: 'FLIGHTS', Component: FlightsModule },
];

export default function LeftPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map((section) => (
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
    </div>
  );
}

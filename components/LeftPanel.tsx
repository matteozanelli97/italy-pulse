'use client';

import MarketsModule from './modules/MarketsModule';
import WeatherAQIModule from './modules/WeatherAQIModule';
import SeismicModule from './modules/SeismicModule';
import CyberModule from './modules/CyberModule';
import LiveCamsModule from './modules/LiveCamsModule';
import FlightsModule from './modules/FlightsModule';
import PoliticalModule from './modules/PoliticalModule';
import SerieAModule from './modules/SerieAModule';
import EventsModule from './modules/EventsModule';
import FuelModule from './modules/FuelModule';
import type { ModuleId } from '@/types';

const SECTIONS: { id: ModuleId; label: string; Component: React.ComponentType }[] = [
  { id: 'political', label: 'SONDAGGI POLITICI', Component: PoliticalModule },
  { id: 'events', label: 'EVENTI & REFERENDUM', Component: EventsModule },
  { id: 'seismic', label: 'SISMICA (INGV)', Component: SeismicModule },
  { id: 'weather', label: 'METEO ITALIA', Component: WeatherAQIModule },
  { id: 'flights', label: 'VOLI SU ITALIA', Component: FlightsModule },
  { id: 'seriea', label: 'SERIE A', Component: SerieAModule },
  { id: 'fuel', label: 'CARBURANTI', Component: FuelModule },
  { id: 'markets', label: 'MERCATI / FTSE MIB', Component: MarketsModule },
  { id: 'services', label: 'SERVIZI IT', Component: CyberModule },
  { id: 'livecams', label: 'TELECAMERE', Component: LiveCamsModule },
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

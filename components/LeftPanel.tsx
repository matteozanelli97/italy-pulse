'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '@/lib/store';
import { MODULES } from '@/lib/constants';
import type { ModuleId } from '@/types';

import SeismicModule from './modules/SeismicModule';
import FinancialModule from './modules/FinancialModule';
import WeatherModule from './modules/WeatherModule';
import AirQualityModule from './modules/AirQualityModule';
import TransportModule from './modules/TransportModule';
import EnergyModule from './modules/EnergyModule';
import FlightsModule from './modules/FlightsModule';
import CyberModule from './modules/CyberModule';
import NavalModule from './modules/NavalModule';
import IntelModule from './modules/IntelModule';

const MODULE_COMPONENTS: Record<ModuleId, React.ComponentType<{ search: string }>> = {
  seismic: SeismicModule,
  financial: FinancialModule,
  weather: WeatherModule,
  airquality: AirQualityModule,
  transport: TransportModule,
  energy: EnergyModule,
  flights: FlightsModule,
  cyber: CyberModule,
  naval: NavalModule,
  intel: IntelModule,
};

function SortableModuleCard({ moduleId, search, onReplace }: { moduleId: ModuleId; search: string; onReplace: (id: ModuleId) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: moduleId });
  const [showReplace, setShowReplace] = useState(false);
  const activeModules = useStore((s) => s.activeModules);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : ('auto' as const),
  };

  const mod = MODULES.find((m) => m.id === moduleId);
  const Component = MODULE_COMPONENTS[moduleId];
  const availableModules = MODULES.filter((m) => !activeModules.includes(m.id));

  return (
    <div ref={setNodeRef} style={style} className="module-card relative">
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border-dim)' }}>
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-[var(--bg-hover)] transition-colors" title="Trascina per riordinare">
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }}>
            <circle cx="5" cy="4" r="1" fill="currentColor" /><circle cx="11" cy="4" r="1" fill="currentColor" />
            <circle cx="5" cy="8" r="1" fill="currentColor" /><circle cx="11" cy="8" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="11" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-primary)' }}>
          {mod?.label}
        </span>
        <button onClick={() => setShowReplace(!showReplace)} className="rounded p-0.5 hover:bg-[var(--bg-hover)] transition-colors" title="Sostituisci modulo">
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" style={{ color: 'var(--text-dim)' }}>
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {showReplace && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-b" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-deep)' }}>
            <div className="p-2 grid grid-cols-2 gap-1">
              {availableModules.map((m) => (
                <button key={m.id} onClick={() => { onReplace(m.id); setShowReplace(false); }}
                  className="text-left rounded px-2 py-1.5 text-[9px] font-medium uppercase tracking-wider transition-all hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }}>
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 max-h-[calc(50vh-60px)] overflow-y-auto">
        <Component search={search} />
      </div>
    </div>
  );
}

export default function LeftPanel() {
  const [search, setSearch] = useState('');
  const activeModules = useStore((s) => s.activeModules);
  const setActiveModules = useStore((s) => s.setActiveModules);
  const swapModule = useStore((s) => s.swapModule);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activeModules.indexOf(active.id as ModuleId);
    const newIndex = activeModules.indexOf(over.id as ModuleId);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...activeModules] as [ModuleId, ModuleId];
    [next[oldIndex], next[newIndex]] = [next[newIndex], next[oldIndex]];
    setActiveModules(next);
  }, [activeModules, setActiveModules]);

  const handleReplace = useCallback((slotIndex: 0 | 1) => (newModule: ModuleId) => {
    swapModule(slotIndex, newModule);
  }, [swapModule]);

  return (
    <motion.aside
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      className="hidden lg:flex w-[320px] flex-shrink-0 flex-col overflow-hidden border-r bg-dot-pattern"
      style={{ background: '#050505', borderColor: 'var(--border-dim)' }}
    >
      <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0">
            <circle cx="7" cy="7" r="4.5" stroke="var(--text-muted)" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ricerca dati..." className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
          {search && <button onClick={() => setSearch('')} className="text-[12px] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>×</button>}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>MODULI ATTIVI: 2 / MAX 2</span>
          <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="text-[8px]" style={{ color: 'var(--text-dim)' }}>Trascina per riordinare</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={activeModules} strategy={verticalListSortingStrategy}>
            {activeModules.map((moduleId, idx) => (
              <SortableModuleCard key={moduleId} moduleId={moduleId} search={search} onReplace={handleReplace(idx as 0 | 1)} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </motion.aside>
  );
}

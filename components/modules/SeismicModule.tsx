'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { SeismicEvent } from '@/types';

const MAG_COLORS = [
  { min: 0, color: '#32A467', label: 'Lieve' },
  { min: 2.5, color: '#EC9A3C', label: 'Moderato' },
  { min: 4.0, color: '#E76A6E', label: 'Forte' },
  { min: 5.5, color: '#CD4246', label: 'Molto forte' },
];

function getMagStyle(mag: number) {
  for (let i = MAG_COLORS.length - 1; i >= 0; i--) {
    if (mag >= MAG_COLORS[i].min) return MAG_COLORS[i];
  }
  return MAG_COLORS[0];
}

export default function SeismicModule() {
  const { data: events, loading, lastUpdate } = useStore((s) => s.seismic);
  const flyTo = useStore((s) => s.flyTo);
  const [showAll, setShowAll] = useState(false);

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
        <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Caricamento dati INGV<span className="init-dots" /></span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-2 text-center">
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>Nessun evento sismico recente</span>
      </div>
    );
  }

  const significant = events.filter((e) => e.magnitude >= 2.5);
  const displayed = showAll ? events : events.slice(0, 8);
  const maxMag = Math.max(...events.map((e) => e.magnitude));
  const maxStyle = getMagStyle(maxMag);

  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded px-2.5 py-1.5" style={{
          background: significant.length > 0 ? 'rgba(231,106,110,0.06)' : 'rgba(50,164,103,0.06)',
          border: `1px solid ${significant.length > 0 ? 'rgba(231,106,110,0.15)' : 'rgba(50,164,103,0.15)'}`,
        }}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: maxStyle.color }} />
            <span className="text-[10px] font-bold" style={{ color: maxStyle.color }}>
              {events.length} eventi · Max {maxMag.toFixed(1)} {maxStyle.label}
            </span>
            <span className="flex-1" />
            <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-0.5">
        {displayed.map((ev) => (
          <EventRow key={ev.id} event={ev} onFlyTo={() => flyTo({ lat: ev.latitude, lng: ev.longitude, zoom: 9 })} />
        ))}
      </div>

      {events.length > 8 && (
        <button onClick={() => setShowAll(!showAll)}
          className="w-full text-center py-1 text-[9px] font-mono font-bold uppercase tracking-wider"
          style={{ color: 'var(--accent)' }}>
          {showAll ? 'Mostra meno' : `Mostra tutti (${events.length})`}
        </button>
      )}
    </div>
  );
}

function EventRow({ event, onFlyTo }: { event: SeismicEvent; onFlyTo: () => void }) {
  const style = getMagStyle(event.magnitude);
  const d = new Date(event.time);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const dateStr = isToday ? timeStr : `${d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })} ${timeStr}`;

  return (
    <button onClick={onFlyTo}
      className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-hover)]"
      style={{ background: 'var(--bg-card)', border: `1px solid ${event.magnitude >= 4 ? `${style.color}30` : 'var(--border-dim)'}` }}>
      <div className="flex h-7 w-7 items-center justify-center rounded font-mono text-[11px] font-bold flex-shrink-0"
        style={{ background: `${style.color}15`, color: style.color }}>
        {event.magnitude.toFixed(1)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{event.place}</p>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>Prof. {event.depth.toFixed(0)}km</span>
          <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>{event.magnitudeType}</span>
        </div>
      </div>
      <span className="text-[9px] font-mono tabular-nums flex-shrink-0" style={{ color: 'var(--text-dim)' }}>{dateStr}</span>
    </button>
  );
}

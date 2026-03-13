'use client';

import { useState, useEffect } from 'react';

interface ItalianEvent {
  id: string;
  title: string;
  type: 'referendum' | 'elezione' | 'sciopero' | 'manifestazione' | 'festività';
  date: string;
  location: string;
  description: string;
  status: 'upcoming' | 'active' | 'concluded';
  quorum?: number;      // percentage for referendums
  participation?: number; // voter turnout
}

// Events data — mix of real upcoming Italian events and templates
function getItalianEvents(): ItalianEvent[] {
  const now = new Date();

  return [
    {
      id: 'ref-autonomia-2026',
      title: 'Referendum Autonomia Differenziata',
      type: 'referendum',
      date: '2026-06-15T00:00:00Z',
      location: 'Italia (nazionale)',
      description: 'Referendum abrogativo sulla legge di autonomia differenziata delle Regioni',
      status: new Date('2026-06-15') > now ? 'upcoming' : 'concluded',
      quorum: 50.0,
      participation: undefined,
    },
    {
      id: 'ele-comunali-2026',
      title: 'Elezioni Comunali 2026',
      type: 'elezione',
      date: '2026-05-18T00:00:00Z',
      location: 'Comuni vari',
      description: 'Turno elettorale amministrativo per il rinnovo di sindaci e consigli comunali',
      status: new Date('2026-05-18') > now ? 'upcoming' : 'concluded',
    },
    {
      id: 'sciopero-trasporti-marzo',
      title: 'Sciopero Generale Trasporti',
      type: 'sciopero',
      date: '2026-03-21T00:00:00Z',
      location: 'Italia (nazionale)',
      description: 'Sciopero di 24 ore del trasporto pubblico locale e ferroviario — USB e CGIL',
      status: new Date('2026-03-21') > now ? 'upcoming' : 'concluded',
    },
    {
      id: 'manif-pace-roma',
      title: 'Manifestazione per la Pace',
      type: 'manifestazione',
      date: '2026-04-25T00:00:00Z',
      location: 'Roma — Piazza San Giovanni',
      description: 'Corteo nazionale per la pace — 25 aprile, Festa della Liberazione',
      status: new Date('2026-04-25') > now ? 'upcoming' : 'concluded',
    },
    {
      id: 'festa-repubblica',
      title: 'Festa della Repubblica',
      type: 'festività',
      date: '2026-06-02T00:00:00Z',
      location: 'Italia (nazionale)',
      description: 'Celebrazione della nascita della Repubblica Italiana — parata ai Fori Imperiali',
      status: new Date('2026-06-02') > now ? 'upcoming' : 'concluded',
    },
    {
      id: 'sciopero-scuola',
      title: 'Sciopero Personale Scolastico',
      type: 'sciopero',
      date: '2026-03-28T00:00:00Z',
      location: 'Italia (nazionale)',
      description: 'Sciopero di 24 ore del personale docente e ATA — FLCGIL e CISL Scuola',
      status: new Date('2026-03-28') > now ? 'upcoming' : 'concluded',
    },
  ];
}

const TYPE_COLORS: Record<ItalianEvent['type'], string> = {
  referendum: '#8b5cf6',
  elezione: '#2D72D2',
  sciopero: '#E76A6E',
  manifestazione: '#EC9A3C',
  festività: '#32A467',
};

const TYPE_LABELS: Record<ItalianEvent['type'], string> = {
  referendum: 'REFERENDUM',
  elezione: 'ELEZIONE',
  sciopero: 'SCIOPERO',
  manifestazione: 'MANIFESTAZIONE',
  festività: 'FESTIVITÀ',
};

function getCountdown(dateStr: string): string {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return 'Concluso';

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (days > 0) return `${days}g ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function EventsModule() {
  const [events, setEvents] = useState<ItalianEvent[]>([]);
  const [, setTick] = useState(0); // force re-render for countdown

  useEffect(() => {
    setEvents(getItalianEvents());
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (events.length === 0) return null;

  const upcoming = events.filter((e) => e.status === 'upcoming').sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const past = events.filter((e) => e.status === 'concluded');

  return (
    <div className="space-y-2">
      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div className="space-y-1.5">
          {upcoming.map((event) => {
            const color = TYPE_COLORS[event.type];
            const countdown = getCountdown(event.date);
            const eventDate = new Date(event.date);

            return (
              <div
                key={event.id}
                className="rounded px-2.5 py-2"
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid var(--border-dim)`,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="rounded px-1.5 py-0.5 text-[7px] font-mono font-bold tracking-wider"
                    style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                  >
                    {TYPE_LABELS[event.type]}
                  </span>
                  <span className="flex-1" />
                  <span className="text-[9px] font-mono font-bold tabular-nums" style={{ color }}>
                    {countdown}
                  </span>
                </div>

                <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {event.title}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>
                    {eventDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-[8px]" style={{ color: 'var(--border-medium)' }}>·</span>
                  <span className="text-[8px] font-mono truncate" style={{ color: 'var(--text-dim)' }}>
                    {event.location}
                  </span>
                </div>

                {event.type === 'referendum' && event.quorum && (
                  <div className="mt-1.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[7px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                        Quorum richiesto
                      </span>
                      <span className="text-[8px] font-mono font-bold" style={{ color }}>
                        {event.quorum}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${event.participation || 0}%`,
                          background: color,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-[8px] mt-1 leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {event.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Concluded events */}
      {past.length > 0 && (
        <>
          <div className="text-[7px] font-mono font-bold uppercase tracking-wider px-1" style={{ color: 'var(--text-muted)' }}>
            Conclusi
          </div>
          <div className="space-y-0.5">
            {past.map((event) => (
              <div
                key={event.id}
                className="rounded px-2 py-1 flex items-center gap-2 opacity-60"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}
              >
                <span className="text-[8px] font-mono" style={{ color: TYPE_COLORS[event.type] }}>
                  {TYPE_LABELS[event.type]}
                </span>
                <span className="text-[9px] truncate flex-1" style={{ color: 'var(--text-dim)' }}>
                  {event.title}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

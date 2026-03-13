'use client';

import { useState, useEffect, useCallback } from 'react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished';
  minute: string | null;
  date: string;
  venue: string;
}

interface Standing {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export default function SerieAModule() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'matches' | 'classifica'>('matches');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/seriea');
      if (!res.ok) return;
      const data = await res.json();
      setMatches(data.matches || []);
      setStandings(data.standings || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
        <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>
          Caricamento Serie A<span className="init-dots" />
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* View toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setView('matches')}
          className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
          style={{
            background: view === 'matches' ? 'var(--accent-muted)' : 'transparent',
            color: view === 'matches' ? 'var(--accent)' : 'var(--text-dim)',
            border: `1px solid ${view === 'matches' ? 'var(--border-medium)' : 'transparent'}`,
          }}
        >
          Partite
        </button>
        <button
          onClick={() => setView('classifica')}
          className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
          style={{
            background: view === 'classifica' ? 'var(--accent-muted)' : 'transparent',
            color: view === 'classifica' ? 'var(--accent)' : 'var(--text-dim)',
            border: `1px solid ${view === 'classifica' ? 'var(--border-medium)' : 'transparent'}`,
          }}
        >
          Classifica
        </button>
      </div>

      {view === 'matches' ? (
        <div className="space-y-1">
          {matches.length === 0 ? (
            <div className="text-center py-2">
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>Nessuna partita disponibile</span>
            </div>
          ) : (
            matches.slice(0, 8).map((m) => (
              <div
                key={m.id}
                className="rounded px-2.5 py-1.5 flex items-center gap-2"
                style={{
                  background: m.status === 'live' ? 'rgba(231,106,110,0.06)' : 'var(--bg-card)',
                  border: `1px solid ${m.status === 'live' ? 'rgba(231,106,110,0.2)' : 'var(--border-dim)'}`,
                }}
              >
                <div className="flex-1 text-right">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {m.homeTeam}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2">
                  <span className="text-[12px] font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {m.homeScore ?? '-'}
                  </span>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>:</span>
                  <span className="text-[12px] font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {m.awayScore ?? '-'}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {m.awayTeam}
                  </span>
                </div>
                <div className="w-12 text-right flex-shrink-0">
                  {m.status === 'live' ? (
                    <span className="text-[8px] font-mono font-bold animate-glow-breathe" style={{ color: 'var(--red)' }}>
                      LIVE {m.minute}&apos;
                    </span>
                  ) : m.status === 'finished' ? (
                    <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>FT</span>
                  ) : (
                    <span className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>
                      {new Date(m.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Classifica
        <div className="space-y-0">
          {/* Header */}
          <div className="flex items-center gap-1 px-2 py-1 text-[7px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
            <span className="w-5 text-center">#</span>
            <span className="flex-1">Squadra</span>
            <span className="w-6 text-center">G</span>
            <span className="w-6 text-center">V</span>
            <span className="w-6 text-center">P</span>
            <span className="w-6 text-center">S</span>
            <span className="w-8 text-center">GF</span>
            <span className="w-8 text-center font-bold">Pts</span>
          </div>
          {standings.slice(0, 10).map((s, i) => (
            <div
              key={s.team}
              className="flex items-center gap-1 px-2 py-1 rounded transition-colors hover:bg-[var(--bg-hover)]"
              style={{
                background: i < 4 ? 'rgba(45,114,210,0.04)' : i >= 17 ? 'rgba(231,106,110,0.04)' : 'transparent',
                borderLeft: i < 4 ? '2px solid var(--accent)' : i >= 17 ? '2px solid var(--red)' : '2px solid transparent',
              }}
            >
              <span className="w-5 text-center text-[9px] font-mono font-bold" style={{
                color: i < 4 ? 'var(--accent)' : 'var(--text-dim)',
              }}>
                {s.position}
              </span>
              <span className="flex-1 text-[9px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                {s.team}
              </span>
              <span className="w-6 text-center text-[8px] font-mono tabular-nums" style={{ color: 'var(--text-dim)' }}>{s.played}</span>
              <span className="w-6 text-center text-[8px] font-mono tabular-nums" style={{ color: 'var(--green)' }}>{s.won}</span>
              <span className="w-6 text-center text-[8px] font-mono tabular-nums" style={{ color: 'var(--text-dim)' }}>{s.drawn}</span>
              <span className="w-6 text-center text-[8px] font-mono tabular-nums" style={{ color: 'var(--red)' }}>{s.lost}</span>
              <span className="w-8 text-center text-[8px] font-mono tabular-nums" style={{ color: 'var(--text-dim)' }}>
                {s.goalsFor}
              </span>
              <span className="w-8 text-center text-[10px] font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {s.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

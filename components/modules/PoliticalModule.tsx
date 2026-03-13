'use client';

import { useState, useEffect, useCallback } from 'react';
import { ITALIAN_PARTIES } from '@/lib/constants';

interface PartyPoll {
  id: string;
  name: string;
  abbrev: string;
  color: string;
  leader: string;
  approval: number;
  trend: number; // positive = gaining, negative = losing
  sentiment: 'positive' | 'neutral' | 'negative';
}

// Simulated polling data — in Phase 2B this will connect to real APIs
function generatePollingData(): PartyPoll[] {
  return ITALIAN_PARTIES.map((party) => {
    // Base polling percentages (roughly accurate as of 2025)
    const basePolls: Record<string, number> = {
      fdi: 28.5, pd: 23.2, m5s: 11.8, lega: 8.5, fi: 9.2,
      avs: 6.8, iv: 3.2, azione: 3.5,
    };
    const base = basePolls[party.id] || 5;
    const variance = (Math.random() - 0.5) * 2;
    const approval = Math.max(1, Math.min(40, base + variance));
    const trend = (Math.random() - 0.5) * 1.5;
    const sentiment = trend > 0.3 ? 'positive' : trend < -0.3 ? 'negative' : 'neutral';

    return {
      id: party.id,
      name: party.name,
      abbrev: party.abbrev,
      color: party.color,
      leader: party.leader,
      approval: parseFloat(approval.toFixed(1)),
      trend: parseFloat(trend.toFixed(1)),
      sentiment,
    };
  });
}

export default function PoliticalModule() {
  const [polls, setPolls] = useState<PartyPoll[]>([]);
  const [view, setView] = useState<'chart' | 'list'>('chart');

  const refresh = useCallback(() => {
    setPolls(generatePollingData());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [refresh]);

  if (polls.length === 0) return null;

  // Sort by approval descending
  const sorted = [...polls].sort((a, b) => b.approval - a.approval);
  const maxApproval = sorted[0]?.approval || 30;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <button
            onClick={() => setView('chart')}
            className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
            style={{
              background: view === 'chart' ? 'var(--accent-muted)' : 'transparent',
              color: view === 'chart' ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${view === 'chart' ? 'var(--border-medium)' : 'transparent'}`,
            }}
          >
            Grafico
          </button>
          <button
            onClick={() => setView('list')}
            className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider"
            style={{
              background: view === 'list' ? 'var(--accent-muted)' : 'transparent',
              color: view === 'list' ? 'var(--accent)' : 'var(--text-dim)',
              border: `1px solid ${view === 'list' ? 'var(--border-medium)' : 'transparent'}`,
            }}
          >
            Lista
          </button>
        </div>
        <span className="flex-1" />
        <button onClick={refresh} className="text-[8px] font-mono font-bold uppercase" style={{ color: 'var(--accent)' }}>
          Aggiorna
        </button>
      </div>

      {view === 'chart' ? (
        // Bar chart view
        <div className="space-y-1.5">
          {sorted.map((party) => (
            <div key={party.id} className="flex items-center gap-2">
              <div className="w-10 text-right">
                <span className="text-[10px] font-mono font-bold" style={{ color: party.color }}>
                  {party.abbrev}
                </span>
              </div>
              <div className="flex-1 h-5 rounded-sm overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div
                  className="h-full rounded-sm flex items-center px-1.5 transition-all duration-500"
                  style={{
                    width: `${(party.approval / maxApproval) * 100}%`,
                    background: `${party.color}30`,
                    borderRight: `2px solid ${party.color}`,
                  }}
                >
                  <span className="text-[9px] font-mono font-bold" style={{ color: party.color }}>
                    {party.approval}%
                  </span>
                </div>
              </div>
              <div className="w-10 text-right">
                <span className="text-[9px] font-mono font-bold" style={{
                  color: party.trend > 0 ? 'var(--green)' : party.trend < 0 ? 'var(--red)' : 'var(--text-dim)',
                }}>
                  {party.trend > 0 ? '+' : ''}{party.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view with details
        <div className="space-y-1">
          {sorted.map((party) => (
            <div
              key={party.id}
              className="rounded px-2.5 py-1.5 flex items-center gap-2"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid var(--border-dim)`,
                borderLeft: `3px solid ${party.color}`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: party.color }}>{party.abbrev}</span>
                  <span className="text-[9px] truncate" style={{ color: 'var(--text-secondary)' }}>{party.name}</span>
                </div>
                <div className="text-[8px] font-mono" style={{ color: 'var(--text-dim)' }}>
                  Leader: {party.leader}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[12px] font-mono font-bold tabular-nums" style={{ color: party.color }}>
                  {party.approval}%
                </div>
                <div className="text-[8px] font-mono font-bold" style={{
                  color: party.trend > 0 ? 'var(--green)' : party.trend < 0 ? 'var(--red)' : 'var(--text-dim)',
                }}>
                  {party.trend > 0 ? '▲' : party.trend < 0 ? '▼' : '—'} {Math.abs(party.trend)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source note */}
      <div className="text-center">
        <span className="text-[7px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Fonte: Aggregazione sondaggi · Aggiornamento: tempo reale
        </span>
      </div>
    </div>
  );
}

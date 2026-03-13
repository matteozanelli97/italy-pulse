'use client';

import { useState, useEffect, useCallback } from 'react';

interface Alert {
  id: string;
  type: 'idraulico' | 'idrogeologico' | 'temporali' | 'vento' | 'neve' | 'incendi' | 'valanghe';
  severity: 'verde' | 'gialla' | 'arancione' | 'rossa';
  region: string;
  description: string;
  issued: string;
  expires: string;
}

const SEVERITY_COLORS: Record<Alert['severity'], string> = {
  verde: '#32A467',
  gialla: '#EC9A3C',
  arancione: '#E67E22',
  rossa: '#E76A6E',
};

const TYPE_ICONS: Record<Alert['type'], string> = {
  idraulico: 'IDRA',
  idrogeologico: 'GEO',
  temporali: 'TEMP',
  vento: 'VENT',
  neve: 'NEVE',
  incendi: 'FIRE',
  valanghe: 'VALA',
};

function getTimeRemaining(expires: string): string {
  const diff = new Date(expires).getTime() - Date.now();
  if (diff <= 0) return 'Scaduta';
  const hours = Math.floor(diff / 3600000);
  if (hours >= 24) return `${Math.floor(hours / 24)}g ${hours % 24}h`;
  return `${hours}h`;
}

export default function ProtezioneCivileModule() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/protezione-civile');
      if (!res.ok) return;
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1_800_000); // 30min
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--amber)' }} />
        <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>
          Caricamento allerte<span className="init-dots" />
        </span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-3">
        <div className="h-2 w-2 rounded-full mx-auto mb-1" style={{ background: 'var(--green)' }} />
        <span className="text-[10px] font-mono" style={{ color: 'var(--green)' }}>Nessuna allerta attiva</span>
      </div>
    );
  }

  // Sort by severity (rossa first)
  const order: Alert['severity'][] = ['rossa', 'arancione', 'gialla', 'verde'];
  const sorted = [...alerts].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return (
    <div className="space-y-1.5">
      {/* Summary bar */}
      <div className="flex items-center gap-2 px-1">
        {order.map((sev) => {
          const count = alerts.filter((a) => a.severity === sev).length;
          if (count === 0) return null;
          return (
            <div key={sev} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: SEVERITY_COLORS[sev] }} />
              <span className="text-[8px] font-mono font-bold" style={{ color: SEVERITY_COLORS[sev] }}>
                {count} {sev.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Alert cards */}
      {sorted.map((alert) => {
        const color = SEVERITY_COLORS[alert.severity];
        const remaining = getTimeRemaining(alert.expires);

        return (
          <div
            key={alert.id}
            className="rounded px-2.5 py-1.5"
            style={{
              background: `${color}08`,
              border: `1px solid ${color}25`,
              borderLeft: `3px solid ${color}`,
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="rounded px-1 py-0.5 text-[7px] font-mono font-bold tracking-wider"
                style={{ background: `${color}15`, color }}
              >
                {TYPE_ICONS[alert.type]}
              </span>
              <span
                className="rounded px-1 py-0.5 text-[7px] font-mono font-bold uppercase"
                style={{ background: `${color}15`, color }}
              >
                {alert.severity}
              </span>
              <span className="flex-1" />
              <span className="text-[8px] font-mono tabular-nums" style={{ color: 'var(--text-dim)' }}>
                {remaining}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                {alert.region}
              </span>
            </div>
            <p className="text-[8px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {alert.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

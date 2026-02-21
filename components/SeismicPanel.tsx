'use client';

import { motion } from 'framer-motion';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { SeismicEvent } from '@/types';

interface SeismicPanelProps {
  events: SeismicEvent[];
  loading: boolean;
}

export default function SeismicPanel({ events, loading }: SeismicPanelProps) {
  return (
    <PanelShell title="SISMICA" subtitle="INGV Real-time" icon="◉" count={events.length}>
      {loading && events.length === 0 ? (
        <SkeletonRows />
      ) : events.length === 0 ? (
        <p className="py-4 text-center text-xs text-cyan-800">Nessun evento recente</p>
      ) : (
        <div className="flex flex-col gap-1">
          {events.slice(0, 12).map((eq, i) => {
            const severity = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
            const color = SEVERITY_COLORS[severity];
            const timeAgo = getTimeAgo(eq.time);

            return (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-start gap-2 rounded border border-transparent px-2 py-1.5 transition-colors hover:border-cyan-900/40 hover:bg-cyan-950/20"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded font-mono text-xs font-bold"
                  style={{ color, borderColor: color + '40', borderWidth: 1, background: color + '10' }}
                >
                  {eq.magnitude.toFixed(1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] text-cyan-300">{eq.description || 'Zona non specificata'}</p>
                  <div className="flex items-center gap-2 text-[9px] text-cyan-700">
                    <span>{eq.depth.toFixed(0)} km prof.</span>
                    <span>·</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </PanelShell>
  );
}

function PanelShell({ title, subtitle, icon, count, children }: {
  title: string; subtitle: string; icon: string; count: number; children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-cyan-900/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-cyan-500 text-xs">{icon}</span>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">{title}</h2>
            <p className="text-[8px] uppercase tracking-widest text-cyan-800">{subtitle}</p>
          </div>
        </div>
        <span className="rounded-full bg-cyan-950/50 px-2 py-0.5 font-mono text-[10px] text-cyan-500">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1 scrollbar-thin">{children}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-7 w-7 animate-pulse rounded bg-cyan-950/40" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-3 w-3/4 animate-pulse rounded bg-cyan-950/40" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-cyan-950/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getTimeAgo(isoTime: string): string {
  const diff = Date.now() - new Date(isoTime).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'adesso';
  if (mins < 60) return `${mins}m fa`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h fa`;
  const days = Math.floor(hrs / 24);
  return `${days}g fa`;
}

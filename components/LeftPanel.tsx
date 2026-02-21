'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketTick, SeismicEvent, WeatherData, AirQualityStation } from '@/types';
import { SEVERITY_COLORS } from '@/lib/constants';

interface LeftPanelProps {
  markets: MarketTick[];
  earthquakes: SeismicEvent[];
  weather: WeatherData[];
  airQuality: AirQualityStation[];
  marketsLoading: boolean;
  seismicLoading: boolean;
  weatherLoading: boolean;
}

export default function LeftPanel({
  markets, earthquakes, weather, airQuality,
  marketsLoading, seismicLoading, weatherLoading,
}: LeftPanelProps) {
  const [search, setSearch] = useState('');

  return (
    <motion.aside
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
      className="hidden w-[320px] flex-shrink-0 flex-col overflow-hidden border-r lg:flex"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}
    >
      {/* Search */}
      <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ricerca moduli..."
            className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      </div>

      {/* Scrollable modules */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <FinancialModule ticks={markets} loading={marketsLoading} />
        <SeismicModule events={earthquakes} loading={seismicLoading} />
        <WeatherModule cities={weather} loading={weatherLoading} />
        <AirQualityModule stations={airQuality} />
        <NavalModule />
        <CyberModule />
      </div>
    </motion.aside>
  );
}

/* ═══════════════════════════ SHARED MODULE WRAPPER ═══════════════════════════ */
function ModuleCard({ title, icon, badge, badgeColor, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; badge?: string; badgeColor?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="module-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] transition-colors"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'rgba(56,139,255,0.08)' }}>
          {icon}
        </span>
        <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        {badge && (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold"
            style={{ background: badgeColor ? `${badgeColor}15` : 'rgba(56,139,255,0.1)', color: badgeColor || 'var(--accent-blue)', border: `1px solid ${badgeColor || 'var(--accent-blue)'}30` }}>
            {badge}
          </span>
        )}
        <DragHandle />
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: 'var(--text-dim)' }}>
          <ChevronDown />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════ FINANCIAL MODULE ═══════════════════════════ */
function FinancialModule({ ticks, loading }: { ticks: MarketTick[]; loading: boolean }) {
  return (
    <ModuleCard title="Dati Finanziari" icon={<ChartIcon />} badge={ticks.length > 0 ? 'LIVE' : undefined} badgeColor="#00e87b">
      {loading && ticks.length === 0 ? (
        <ShimmerLines count={3} />
      ) : (
        <div className="space-y-2">
          {ticks.map((t) => {
            const up = t.changePercent24h >= 0;
            return (
              <div key={t.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{t.symbol}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    €{t.price.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`font-mono text-[10px] font-bold ${up ? 'text-[#00e87b]' : 'text-[#ff3b5c]'}`}>
                    {up ? '+' : ''}{t.changePercent24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleCard>
  );
}

/* ═══════════════════════════ SEISMIC MODULE ═══════════════════════════ */
function SeismicModule({ events, loading }: { events: SeismicEvent[]; loading: boolean }) {
  const recent = events.slice(0, 6);
  return (
    <ModuleCard title="Radar Sismico" icon={<PulseIcon />} badge={`${events.length}`} badgeColor={events.some(e => e.magnitude >= 3.5) ? '#ff3b5c' : '#388bff'}>
      {loading && events.length === 0 ? (
        <ShimmerLines count={4} />
      ) : (
        <div className="space-y-1.5">
          {recent.map((eq) => {
            const sev = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
            return (
              <div key={eq.id} className="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-[var(--bg-hover)] transition-colors">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold"
                  style={{ color: SEVERITY_COLORS[sev], background: `${SEVERITY_COLORS[sev]}12`, border: `1px solid ${SEVERITY_COLORS[sev]}30` }}>
                  {eq.magnitude.toFixed(1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-secondary)' }}>{eq.description || 'Zona non specificata'}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{eq.depth.toFixed(0)}km · {timeAgo(eq.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleCard>
  );
}

/* ═══════════════════════════ WEATHER MODULE ═══════════════════════════ */
function WeatherModule({ cities, loading }: { cities: WeatherData[]; loading: boolean }) {
  return (
    <ModuleCard title="Meteo Italia" icon={<CloudIcon />} badge={`${cities.length}`} defaultOpen={false}>
      {loading && cities.length === 0 ? (
        <ShimmerLines count={5} />
      ) : (
        <div className="space-y-1">
          {cities.slice(0, 10).map((w) => {
            const alertColor = w.alertLevel === 'warning' ? '#ff3b5c' : w.alertLevel === 'watch' ? '#ff8a3d' : w.alertLevel === 'advisory' ? '#ffb800' : '#00e87b';
            return (
              <div key={w.city} className="flex items-center justify-between py-0.5">
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{w.city}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: alertColor }}>
                    {Math.round(w.temperature)}°C
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{w.weatherDescription}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleCard>
  );
}

/* ═══════════════════════════ AIR QUALITY MODULE ═══════════════════════════ */
function AirQualityModule({ stations }: { stations: AirQualityStation[] }) {
  const levelColors: Record<string, string> = {
    good: '#00e87b', moderate: '#88ff00', unhealthy_sensitive: '#ffb800',
    unhealthy: '#ff3b5c', very_unhealthy: '#a855f7', hazardous: '#ff0044',
  };
  return (
    <ModuleCard title="Qualità Aria" icon={<WindIcon />} badge={stations.length > 0 ? `AQI` : undefined} badgeColor="#00d4ff" defaultOpen={false}>
      {stations.length === 0 ? (
        <InitState label="Caricamento stazioni" />
      ) : (
        <div className="space-y-1">
          {stations.slice(0, 8).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: levelColors[s.level] || '#888', boxShadow: `0 0 6px ${levelColors[s.level] || '#888'}50` }} />
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
              </div>
              <span className="font-mono text-[10px] font-bold" style={{ color: levelColors[s.level] || '#888' }}>{s.aqi}</span>
            </div>
          ))}
        </div>
      )}
    </ModuleCard>
  );
}

/* ═══════════════════════════ NAVAL MODULE (placeholder) ═══════════════════════════ */
function NavalModule() {
  return (
    <ModuleCard title="Tracking Navale" icon={<AnchorIcon />} defaultOpen={false}>
      <InitState label="Inizializzazione AIS" />
    </ModuleCard>
  );
}

/* ═══════════════════════════ CYBER MODULE (placeholder) ═══════════════════════════ */
function CyberModule() {
  return (
    <ModuleCard title="Minacce Cyber" icon={<ShieldIcon />} defaultOpen={false}>
      <InitState label="Scansione threat feeds" />
    </ModuleCard>
  );
}

/* ═══════════════════════════ SHARED COMPONENTS ═══════════════════════════ */
function InitState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <motion.div
        className="h-2 w-2 rounded-full"
        style={{ background: 'var(--accent-amber)' }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
        {label}<span className="init-dots" />
      </span>
    </div>
  );
}

function ShimmerLines({ count }: { count: number }) {
  return (
    <div className="space-y-2 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-24 animate-shimmer-load rounded" />
          <div className="h-3 w-16 animate-shimmer-load rounded" />
        </div>
      ))}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'adesso';
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  return `${Math.floor(h / 24)}g fa`;
}

// ─── Tiny icons ───
function SearchIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--text-muted)" className="h-3.5 w-3.5"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function ChevronDown() {
  return <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

function DragHandle() {
  return <span className="text-[10px] select-none" style={{ color: 'var(--text-muted)' }}>⠿</span>;
}

function ChartIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--accent-blue)" className="h-3.5 w-3.5"><path d="M2 12l3-4 3 2 4-6 2 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PulseIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--accent-red)" className="h-3.5 w-3.5"><path d="M1 8h3l2-5 2 10 2-5h5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CloudIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--accent-cyan)" className="h-3.5 w-3.5"><path d="M4 12a3 3 0 01-.5-5.96A4.5 4.5 0 0112 5a3.5 3.5 0 01.5 6.96H4z" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function WindIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--accent-emerald)" className="h-3.5 w-3.5"><path d="M2 5h8a2 2 0 100-4M2 8h10a2 2 0 110 4M2 11h6a2 2 0 100 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>;
}

function AnchorIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--accent-purple)" className="h-3.5 w-3.5"><circle cx="8" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.3" /><line x1="8" y1="6" x2="8" y2="14" stroke="currentColor" strokeWidth="1.3" /><path d="M3 10a5 5 0 0010 0" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 16 16" fill="var(--accent-amber)" className="h-3.5 w-3.5"><path d="M8 1l6 2.5v4c0 3.5-2.5 6-6 7-3.5-1-6-3.5-6-7v-4L8 1z" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M6 8l2 2 3-4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

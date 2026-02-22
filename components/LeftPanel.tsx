'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketTick, SeismicEvent, WeatherData, AirQualityStation, TransportAlert, EnergyData } from '@/types';
import { SEVERITY_COLORS } from '@/lib/constants';
import type { SidebarModule } from './IconSidebar';

interface LeftPanelProps {
  markets: MarketTick[];
  earthquakes: SeismicEvent[];
  weather: WeatherData[];
  airQuality: AirQualityStation[];
  transport: TransportAlert[];
  energy: EnergyData[];
  marketsLoading: boolean;
  seismicLoading: boolean;
  weatherLoading: boolean;
  activeTabs: SidebarModule[];
  onTabChange: (tabs: SidebarModule[]) => void;
  activeModule: SidebarModule;
}

const MODULE_ORDER: SidebarModule[] = ['financial', 'radar', 'weather', 'airquality', 'transport', 'energy', 'naval', 'cyber'];

export default function LeftPanel({
  markets, earthquakes, weather, airQuality, transport, energy,
  marketsLoading, seismicLoading, weatherLoading,
  activeTabs, onTabChange, activeModule,
}: LeftPanelProps) {
  const [search, setSearch] = useState('');
  const [hiddenModules, setHiddenModules] = useState<Set<string>>(new Set());

  const toggleVis = useCallback((mod: string) => {
    setHiddenModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod); else next.add(mod);
      return next;
    });
  }, []);

  const addTab = useCallback((mod: SidebarModule) => {
    if (activeTabs.includes(mod)) return;
    if (activeTabs.length >= 3) {
      onTabChange([...activeTabs.slice(1), mod]);
    } else {
      onTabChange([...activeTabs, mod]);
    }
  }, [activeTabs, onTabChange]);

  const removeTab = useCallback((mod: SidebarModule) => {
    onTabChange(activeTabs.filter((t) => t !== mod));
  }, [activeTabs, onTabChange]);

  const filterStr = search.toLowerCase();
  const labels: Record<string, string> = {
    financial: 'finanza mercati borsa', radar: 'sismico terremoto',
    weather: 'meteo temperatura', airquality: 'aria inquinamento',
    transport: 'trasporti treni', energy: 'energia gas',
    naval: 'navale marittimo', cyber: 'cyber sicurezza',
  };
  const filteredModules = MODULE_ORDER.filter((m) =>
    !filterStr || (labels[m] || m).includes(filterStr)
  );

  return (
    <motion.aside
      initial={{ x: -340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
      className="hidden w-[320px] flex-shrink-0 flex-col overflow-hidden border-r lg:flex"
      style={{ background: '#0a0a0a', borderColor: 'var(--border-dim)' }}
    >
      {/* Active tabs bar */}
      <div className="flex items-center gap-1 border-b px-2 py-1.5" style={{ borderColor: 'var(--border-dim)', background: '#0d0d0d' }}>
        <span className="text-[8px] font-bold uppercase tracking-[0.15em] mr-1" style={{ color: 'var(--text-muted)' }}>TAB</span>
        {activeTabs.map((tab) => (
          <div key={tab} className="tab-item active flex items-center gap-1 text-[9px]" style={{ padding: '3px 8px' }}>
            <span className="uppercase tracking-wider">{shortLabel(tab)}</span>
            <button onClick={() => removeTab(tab)} className="tab-close ml-0.5 text-[10px] hover:text-white" style={{ color: 'var(--text-dim)' }}>×</button>
          </div>
        ))}
        {activeTabs.length < 3 && (
          <span className="text-[8px] ml-1" style={{ color: 'var(--text-muted)' }}>{3 - activeTabs.length} slot</span>
        )}
      </div>

      {/* Search + visibility toggles */}
      <div className="border-b px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <SIcon />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ricerca moduli..." className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {MODULE_ORDER.map((mod) => (
            <button key={mod} onClick={() => toggleVis(mod)} className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider transition-all" style={{ background: !hiddenModules.has(mod) ? 'rgba(0,212,255,0.08)' : 'transparent', color: !hiddenModules.has(mod) ? 'var(--accent-cyan)' : 'var(--text-muted)', border: `1px solid ${!hiddenModules.has(mod) ? 'rgba(0,212,255,0.15)' : 'var(--border-dim)'}` }}>
              {shortLabel(mod as SidebarModule)}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable modules */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredModules.map((mod) => {
          if (hiddenModules.has(mod)) return null;
          const hl = activeModule === mod;
          const pin = () => addTab(mod as SidebarModule);
          switch (mod) {
            case 'financial': return <FinancialModule key={mod} ticks={markets} loading={marketsLoading} hl={hl} onPin={pin} />;
            case 'radar': return <SeismicModule key={mod} events={earthquakes} loading={seismicLoading} hl={hl} onPin={pin} />;
            case 'weather': return <WeatherModule key={mod} cities={weather} loading={weatherLoading} hl={hl} onPin={pin} />;
            case 'airquality': return <AirQualityModule key={mod} stations={airQuality} hl={hl} onPin={pin} />;
            case 'transport': return <TransportModule key={mod} alerts={transport} hl={hl} onPin={pin} />;
            case 'energy': return <EnergyModule key={mod} items={energy} hl={hl} onPin={pin} />;
            case 'naval': return <NavalModule key={mod} onPin={pin} />;
            case 'cyber': return <CyberModule key={mod} onPin={pin} />;
            default: return null;
          }
        })}
      </div>
    </motion.aside>
  );
}

function shortLabel(mod: SidebarModule): string {
  const m: Record<string, string> = { financial: 'Finanza', radar: 'Sismico', weather: 'Meteo', airquality: 'Aria', transport: 'Trasporti', energy: 'Energia', naval: 'Navale', cyber: 'Cyber', dashboard: 'Home', satellite: 'Sat', intel: 'Intel', settings: 'Config' };
  return m[mod] || mod;
}

/* ═══════════ MODULE WRAPPER ═══════════ */
function Card({ title, icon, badge, badgeColor, children, defaultOpen = true, hl, onPin }: {
  title: string; icon: React.ReactNode; badge?: string; badgeColor?: string;
  children: React.ReactNode; defaultOpen?: boolean; hl?: boolean; onPin?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="module-card" style={hl ? { borderColor: 'rgba(0,212,255,0.2)' } : undefined}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] transition-colors">
        <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'rgba(0,212,255,0.06)' }}>{icon}</span>
        <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'var(--text-primary)' }}>{title}</span>
        {badge && <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: badgeColor ? `${badgeColor}12` : 'rgba(0,212,255,0.08)', color: badgeColor || 'var(--accent-cyan)', border: `1px solid ${badgeColor || 'var(--accent-cyan)'}25` }}>{badge}</span>}
        {onPin && <span onClick={(e) => { e.stopPropagation(); onPin(); }} className="text-[10px] hover:text-[var(--accent-cyan)] transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }} title="Pin"><PinI /></span>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: 'var(--text-dim)' }}><ChevD /></motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="border-t px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════ MODULES ═══════════ */
function FinancialModule({ ticks, loading, hl, onPin }: { ticks: MarketTick[]; loading: boolean; hl?: boolean; onPin?: () => void }) {
  return (
    <Card title="Dati Finanziari" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><polyline points="2,12 5,8 8,10 12,4 14,7" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>} badge={ticks.length > 0 ? 'LIVE' : undefined} badgeColor="#00e87b" hl={hl} onPin={onPin}>
      {loading && ticks.length === 0 ? <Shimmer n={4} /> : (
        <div className="space-y-1.5">
          {ticks.map((t) => {
            const up = t.changePercent24h >= 0;
            const special = ['FTSEMIB', 'EUR/USD', 'SPREAD'].includes(t.symbol);
            return (
              <div key={t.symbol} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: special ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{t.symbol}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {t.currency === 'bps' ? '' : t.currency === 'USD' ? '$' : '€'}{t.price.toLocaleString('it-IT', { minimumFractionDigits: t.price < 10 ? 4 : 2, maximumFractionDigits: t.price < 10 ? 4 : 2 })}
                  </span>
                  <span className={`font-mono text-[10px] font-bold ${up ? 'text-[#00e87b]' : 'text-[#ff3b5c]'}`}>{up ? '+' : ''}{t.changePercent24h.toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function SeismicModule({ events, loading, hl, onPin }: { events: SeismicEvent[]; loading: boolean; hl?: boolean; onPin?: () => void }) {
  return (
    <Card title="Radar Sismico" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M1 8h3l2-5 2 10 2-5h5" stroke="var(--accent-red)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>} badge={`${events.length}`} badgeColor={events.some(e => e.magnitude >= 3.5) ? '#ff3b5c' : '#00d4ff'} hl={hl} onPin={onPin}>
      {loading && events.length === 0 ? <Shimmer n={4} /> : (
        <div className="space-y-1.5">
          {events.slice(0, 8).map((eq) => {
            const sev = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
            return (
              <div key={eq.id} className="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-[var(--bg-hover)] transition-colors">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold" style={{ color: SEVERITY_COLORS[sev], background: `${SEVERITY_COLORS[sev]}12`, border: `1px solid ${SEVERITY_COLORS[sev]}30` }}>{eq.magnitude.toFixed(1)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-secondary)' }}>{eq.description || 'Zona non specificata'}</p>
                  <p className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{eq.depth.toFixed(0)}km · {ago(eq.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function WeatherModule({ cities, loading, hl, onPin }: { cities: WeatherData[]; loading: boolean; hl?: boolean; onPin?: () => void }) {
  return (
    <Card title="Meteo Italia" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M4 12a3 3 0 01-.5-5.96A4.5 4.5 0 0112 5a3.5 3.5 0 01.5 6.96H4z" stroke="var(--accent-cyan)" strokeWidth="1.3" /></svg>} badge={`${cities.length}`} defaultOpen={false} hl={hl} onPin={onPin}>
      {loading && cities.length === 0 ? <Shimmer n={5} /> : (
        <div className="space-y-1">
          {cities.slice(0, 12).map((w) => {
            const c = w.alertLevel === 'warning' ? '#ff3b5c' : w.alertLevel === 'watch' ? '#ff8a3d' : w.alertLevel === 'advisory' ? '#ffb800' : '#00e87b';
            return (
              <div key={w.city} className="flex items-center justify-between py-0.5">
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{w.city}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: c }}>{Math.round(w.temperature)}°C</span>
                  <span className="text-[9px] max-w-[80px] truncate" style={{ color: 'var(--text-dim)' }}>{w.weatherDescription}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function AirQualityModule({ stations, hl, onPin }: { stations: AirQualityStation[]; hl?: boolean; onPin?: () => void }) {
  const lc: Record<string, string> = { good: '#00e87b', moderate: '#88ff00', unhealthy_sensitive: '#ffb800', unhealthy: '#ff3b5c', very_unhealthy: '#a855f7', hazardous: '#ff0044' };
  return (
    <Card title="Qualità Aria" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M2 5h8a2 2 0 100-4M2 8h10a2 2 0 110 4M2 11h6a2 2 0 100 4" stroke="var(--accent-emerald)" strokeWidth="1.3" strokeLinecap="round" /></svg>} badge={stations.length > 0 ? 'AQI' : undefined} badgeColor="#00d4ff" defaultOpen={false} hl={hl} onPin={onPin}>
      {stations.length === 0 ? <Init label="Caricamento stazioni" /> : (
        <div className="space-y-1">
          {stations.slice(0, 10).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: lc[s.level] || '#888', boxShadow: `0 0 6px ${lc[s.level] || '#888'}40` }} />
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold" style={{ color: lc[s.level] || '#888' }}>{s.aqi}</span>
                <span className="text-[8px]" style={{ color: 'var(--text-dim)' }}>{s.dominantPollutant}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TransportModule({ alerts, hl, onPin }: { alerts: TransportAlert[]; hl?: boolean; onPin?: () => void }) {
  const ic: Record<string, string> = { train: '🚂', flight: '✈️', road: '🛣️' };
  const sc: Record<string, string> = { low: '#00e87b', medium: '#ffb800', high: '#ff3b5c' };
  return (
    <Card title="Trasporti" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><rect x="4" y="2" width="8" height="9" rx="2" stroke="var(--accent-orange)" strokeWidth="1.3" /><circle cx="6" cy="13" r="1" stroke="var(--accent-orange)" strokeWidth="1" /><circle cx="10" cy="13" r="1" stroke="var(--accent-orange)" strokeWidth="1" /></svg>} badge={alerts.length > 0 ? `${alerts.length}` : undefined} defaultOpen={false} hl={hl} onPin={onPin}>
      {alerts.length === 0 ? <Init label="Monitoraggio trasporti" /> : (
        <div className="space-y-1.5">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-2 py-0.5">
              <span className="text-[12px] flex-shrink-0">{ic[a.type] || '📋'}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium" style={{ color: sc[a.severity] }}>{a.title}</p>
                <p className="text-[9px] truncate" style={{ color: 'var(--text-dim)' }}>{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function EnergyModule({ items, hl, onPin }: { items: EnergyData[]; hl?: boolean; onPin?: () => void }) {
  return (
    <Card title="Mercato Energia" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M9 1L3.5 9H8L7 15L12.5 7H8L9 1Z" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>} badge={items.length > 0 ? 'LIVE' : undefined} badgeColor="#ffb800" defaultOpen={false} hl={hl} onPin={onPin}>
      {items.length === 0 ? <Init label="Caricamento dati energia" /> : (
        <div className="space-y-1.5">
          {items.map((e, i) => {
            const up = e.change >= 0;
            return (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{e.type}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{e.value}{e.unit.startsWith('%') ? '%' : ` ${e.unit}`}</span>
                  <span className={`font-mono text-[9px] font-bold ${up ? 'text-[#00e87b]' : 'text-[#ff3b5c]'}`}>{up ? '+' : ''}{e.change.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function NavalModule({ onPin }: { onPin?: () => void }) {
  return <Card title="Tracking Navale" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><circle cx="8" cy="4" r="2" stroke="var(--accent-purple)" strokeWidth="1.3" /><line x1="8" y1="6" x2="8" y2="14" stroke="var(--accent-purple)" strokeWidth="1.3" /><path d="M3 10a5 5 0 0010 0" stroke="var(--accent-purple)" strokeWidth="1.3" /></svg>} defaultOpen={false} onPin={onPin}><Init label="Inizializzazione AIS" /></Card>;
}

function CyberModule({ onPin }: { onPin?: () => void }) {
  return <Card title="Minacce Cyber" icon={<svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M8 1l6 2.5v4c0 3.5-2.5 6-6 7-3.5-1-6-3.5-6-7v-4L8 1z" stroke="var(--accent-amber)" strokeWidth="1.3" /><path d="M6 8l2 2 3-4" stroke="var(--accent-amber)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>} defaultOpen={false} onPin={onPin}><Init label="Scansione threat feeds" /></Card>;
}

/* ═══════════ SHARED ═══════════ */
function Init({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <motion.div className="h-2 w-2 rounded-full" style={{ background: 'var(--accent-amber)' }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>{label}<span className="init-dots" /></span>
    </div>
  );
}

function Shimmer({ n }: { n: number }) {
  return <div className="space-y-2 py-1">{Array.from({ length: n }).map((_, i) => <div key={i} className="flex justify-between"><div className="h-3 w-24 animate-shimmer-load rounded" /><div className="h-3 w-16 animate-shimmer-load rounded" /></div>)}</div>;
}

function ago(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'adesso';
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  return `${Math.floor(h / 24)}g fa`;
}

function SIcon() { return <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><circle cx="7" cy="7" r="4.5" stroke="var(--text-muted)" strokeWidth="1.5" /><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" /></svg>; }
function ChevD() { return <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>; }
function PinI() { return <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><path d="M8 1v5M5 6h6l-1 4H6L5 6zM8 10v5M6 15h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

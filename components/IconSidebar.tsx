'use client';

import { motion } from 'framer-motion';

export type SidebarModule = 'dashboard' | 'radar' | 'satellite' | 'financial' | 'naval' | 'cyber' | 'intel' | 'weather' | 'airquality' | 'transport' | 'energy' | 'settings';

interface IconSidebarProps {
  active: SidebarModule;
  onChange: (mod: SidebarModule) => void;
  activeTabs: SidebarModule[];
}

const ITEMS: { id: SidebarModule; icon: React.ReactNode; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'radar', label: 'Radar Sismico', icon: <RadarIcon /> },
  { id: 'weather', label: 'Meteo Italia', icon: <WeatherIcon /> },
  { id: 'financial', label: 'Finanza', icon: <FinancialIcon /> },
  { id: 'airquality', label: 'Qualità Aria', icon: <AirQualityIcon /> },
  { id: 'transport', label: 'Trasporti', icon: <TransportIcon /> },
  { id: 'energy', label: 'Energia', icon: <EnergyIcon /> },
  { id: 'naval', label: 'Navale', icon: <NavalIcon /> },
  { id: 'cyber', label: 'Cyber Intel', icon: <CyberIcon /> },
  { id: 'intel', label: 'Intelligence', icon: <IntelIcon /> },
  { id: 'satellite', label: 'Satelliti', icon: <SatelliteIcon /> },
];

export default function IconSidebar({ active, onChange, activeTabs }: IconSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative z-40 flex h-full w-14 flex-shrink-0 flex-col items-center border-r py-3 gap-0.5"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}
    >
      {ITEMS.map((item) => {
        const isActive = active === item.id;
        const isTabbed = activeTabs.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`icon-sidebar-item group ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            {item.icon}
            {isTabbed && !isActive && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 4px rgba(0,212,255,0.5)' }} />
            )}
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-[999]"
              style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              {item.label}
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={() => onChange('settings')}
        className={`icon-sidebar-item ${active === 'settings' ? 'active' : ''}`}
        title="Impostazioni"
      >
        <SettingsIcon />
      </button>

      <div className="mt-2 flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold"
        style={{ background: 'rgba(0,212,255,0.06)', color: 'var(--accent-cyan)', border: '1px solid var(--border-dim)' }}>
        {activeTabs.length}
      </div>
    </motion.aside>
  );
}

// ─── Professional SVG Icons (24x24, stroke-based, detailed) ───

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="17.5" cy="16" r="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <line x1="12" y1="12" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" opacity="0.7">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function WeatherIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M8 18H6.5A4.5 4.5 0 016.2 9.07 5.5 5.5 0 0116.5 8 4 4 0 0117.5 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="20" x2="10" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="14" y1="19" x2="14" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
    </svg>
  );
}

function FinancialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <polyline points="3,17 7,13 11,15 16,8 21,11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17 L7 13 L11 15 L16 8 L21 11 V21 H3 Z" fill="currentColor" opacity="0.06" />
      <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
      <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function AirQualityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M4 10h9a3 3 0 100-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 14h12a3 3 0 110 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 18h6a2 2 0 100-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function TransportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="5" y="4" width="14" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="5" y1="9" x2="19" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="5" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="8.5" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="15.5" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <line x1="8.5" y1="17" x2="8.5" y2="18.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="15.5" y1="17" x2="15.5" y2="18.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function EnergyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

function NavalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M4 16L6.5 8H17.5L20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="5" width="6" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 19c1.5 1.5 3 2 5 0s3.5-1.5 5 0 3 2 5 0 3.5-1.5 5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CyberIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M12 2L20 6V12C20 17 16.5 20.5 12 22C7.5 20.5 4 17 4 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IntelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="13" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="10" r="7" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="3 3" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function SatelliteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="M13 7L17 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 14.5L5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="11" y="3" width="8" height="8" rx="1" transform="rotate(45 15 7)" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" opacity="0.4" />
      <path d="M3 16C5 16 5 17 5 19" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <path d="M1 14C4 14 5 17 5 19" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2V4.5M12 19.5V22M4.22 4.22L5.95 5.95M18.05 18.05L19.78 19.78M2 12H4.5M19.5 12H22M4.22 19.78L5.95 18.05M18.05 5.95L19.78 4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

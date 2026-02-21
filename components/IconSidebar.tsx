'use client';

import { motion } from 'framer-motion';

export type SidebarModule = 'dashboard' | 'radar' | 'satellite' | 'financial' | 'naval' | 'cyber' | 'intel' | 'settings';

interface IconSidebarProps {
  active: SidebarModule;
  onChange: (mod: SidebarModule) => void;
}

const ITEMS: { id: SidebarModule; icon: React.ReactNode; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'radar', label: 'Radar Sismico', icon: <RadarIcon /> },
  { id: 'satellite', label: 'Satelliti', icon: <SatelliteIcon /> },
  { id: 'financial', label: 'Finanza', icon: <FinancialIcon /> },
  { id: 'naval', label: 'Navale', icon: <NavalIcon /> },
  { id: 'cyber', label: 'Cyber Intel', icon: <CyberIcon /> },
  { id: 'intel', label: 'Intelligence', icon: <IntelIcon /> },
];

export default function IconSidebar({ active, onChange }: IconSidebarProps) {
  return (
    <motion.aside
      initial={{ x: -56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative z-40 flex h-full w-14 flex-shrink-0 flex-col items-center border-r py-3 gap-1"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}
    >
      {ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`icon-sidebar-item group ${active === item.id ? 'active' : ''}`}
          title={item.label}
        >
          {item.icon}
          {/* Tooltip */}
          <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            {item.label}
          </span>
        </button>
      ))}

      <div className="flex-1" />

      <button
        onClick={() => onChange('settings')}
        className={`icon-sidebar-item ${active === 'settings' ? 'active' : ''}`}
        title="Impostazioni"
      >
        <SettingsIcon />
      </button>

      {/* "N" node indicator */}
      <div className="mt-2 flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold"
        style={{ background: 'rgba(56,139,255,0.08)', color: 'var(--accent-blue)', border: '1px solid var(--border-dim)' }}>
        N
      </div>
    </motion.aside>
  );
}

// ─── SVG Icons ───
function DashboardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4zM3 12a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[18px] w-[18px]">
      <circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="4" opacity="0.5" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <line x1="10" y1="10" x2="10" y2="3" strokeWidth="1.2" />
    </svg>
  );
}

function SatelliteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M11.5 3.5l5 5-2 2-5-5 2-2zm-4.65 7.15l-2.5 2.5a1 1 0 000 1.41l1.09 1.09a1 1 0 001.41 0l2.5-2.5-2.5-2.5zM4 17l1-3 2 2-3 1z" />
    </svg>
  );
}

function FinancialIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M2 11l3-3 3 2 4-5 3 3 3-2v8H2v-3z" opacity="0.3" />
      <path d="M2 11l3-3 3 2 4-5 3 3 3-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NavalIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M3 13l2.5-7h9L17 13H3zm5-9h4v2H8V4z" opacity="0.7" />
      <path d="M1 15c1.5 1.5 3 2 5 0s3.5-1.5 5 0 3 2 5 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CyberIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z" opacity="0.15" />
      <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 10l2 2 3-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IntelIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M3 4h14v1H3V4zm0 3h10v1H3V7zm0 3h14v1H3v-1zm0 3h8v1H3v-1zm0 3h12v1H3v-1z" opacity="0.7" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

'use client';

import { useStore } from '@/lib/store';
import { MODULES } from '@/lib/constants';
import { sounds } from '@/lib/sounds';

const ICONS: Record<string, React.ReactNode> = {
  markets: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M3 15l4-5 3 3 7-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  weather: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3v2M10 15v2M3 10h2M15 10h2M5.05 5.05l1.41 1.41M13.54 13.54l1.41 1.41M5.05 14.95l1.41-1.41M13.54 6.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  mobility: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M4 16V6l4-3h4l4 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="13" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  cyber: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <rect x="4" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="12.5" r="1" fill="currentColor" />
    </svg>
  ),
  livecams: (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <rect x="2" y="5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 8l4-2v8l-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
};

export default function IconSidebar() {
  const visibleModules = useStore((s) => s.visibleModules);
  const toggleModule = useStore((s) => s.toggleModule);

  return (
    <aside className="hidden lg:flex w-[52px] flex-shrink-0 flex-col items-center py-3 gap-1 border-r"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}>
      {/* Logo icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg mb-3"
        style={{ background: 'var(--accent-muted)', border: '1px solid var(--border-subtle)' }}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <circle cx="12" cy="12" r="10" stroke="var(--cyan-500)" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" stroke="var(--cyan-500)" strokeWidth="1.2" />
          <line x1="12" y1="2" x2="12" y2="6" stroke="var(--cyan-500)" strokeWidth="1" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="var(--cyan-500)" strokeWidth="1" />
          <line x1="2" y1="12" x2="6" y2="12" stroke="var(--cyan-500)" strokeWidth="1" />
          <line x1="18" y1="12" x2="22" y2="12" stroke="var(--cyan-500)" strokeWidth="1" />
        </svg>
      </div>

      {/* Module toggles */}
      {MODULES.map((mod) => {
        const active = visibleModules[mod.id];
        return (
          <button
            key={mod.id}
            onClick={() => { toggleModule(mod.id); sounds.toggle(); }}
            title={mod.label}
            className="group relative flex h-9 w-9 items-center justify-center rounded-lg transition-all"
            style={{
              background: active ? 'var(--accent-muted)' : 'transparent',
              color: active ? 'var(--cyan-500)' : 'var(--text-muted)',
              border: `1px solid ${active ? 'var(--border-medium)' : 'transparent'}`,
            }}
          >
            {ICONS[mod.icon] || <span className="text-xs font-bold font-mono">{mod.label.charAt(0)}</span>}
            {/* Active indicator */}
            {active && (
              <span className="absolute -left-[1px] top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r"
                style={{ background: 'var(--cyan-500)' }} />
            )}
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>
              {mod.label}
            </span>
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Bottom indicator */}
      <div className="flex h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
    </aside>
  );
}

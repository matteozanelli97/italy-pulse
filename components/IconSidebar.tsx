'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { MODULES } from '@/lib/constants';
import type { ModuleId } from '@/types';

export default function IconSidebar() {
  const activeModules = useStore((s) => s.activeModules);
  const swapModule = useStore((s) => s.swapModule);

  const handleClick = (moduleId: ModuleId) => {
    if (activeModules.includes(moduleId)) return;
    // Replace the second slot (index 1) when clicking a new module
    swapModule(1, moduleId);
  };

  return (
    <motion.nav
      initial={{ x: -56, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="hidden lg:flex w-[56px] flex-shrink-0 flex-col items-center border-r py-3 gap-1 bg-dot-pattern"
      style={{ background: '#050505', borderColor: 'var(--border-dim)' }}
    >
      {MODULES.map((mod) => {
        const isActive = activeModules.includes(mod.id);
        return (
          <motion.button
            key={mod.id}
            onClick={() => handleClick(mod.id)}
            className={`icon-sidebar-item group relative ${isActive ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={mod.label}
          >
            <ModuleIcon id={mod.id} />
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity z-50"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {mod.label}
            </span>
            {/* Active dot */}
            {isActive && (
              <span className="absolute -bottom-0.5 h-1 w-1 rounded-full" style={{ background: 'var(--blue-400)' }} />
            )}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

function ModuleIcon({ id }: { id: string }) {
  const cls = 'h-[18px] w-[18px]';
  switch (id) {
    case 'seismic':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M2 12h4l2-6 3 12 3-8 2 4h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'financial':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><polyline points="4,18 8,12 12,15 18,6 22,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><polyline points="18,6 22,6 22,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'weather':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M6 19a4 4 0 01-.8-7.9A5.5 5.5 0 0116 7a4.5 4.5 0 01.5 8.9H6z" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case 'airquality':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M3 8h10a3 3 0 100-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M3 12h14a3 3 0 110 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M3 16h8a3 3 0 100 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
    case 'transport':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><rect x="5" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" /><circle cx="8" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.4" /><circle cx="16" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.4" /><line x1="5" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.2" /></svg>;
    case 'energy':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'flights':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M12 2L8 10H3L12 22L21 10H16L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'cyber':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M12 2l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V6l8-4z" stroke="currentColor" strokeWidth="1.6" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'naval':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><path d="M4 18l2-3h12l2 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M6 15V8a2 2 0 012-2h8a2 2 0 012 2v7" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="4" r="1" fill="currentColor" /><line x1="12" y1="5" x2="12" y2="8" stroke="currentColor" strokeWidth="1.4" /></svg>;
    case 'intel':
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" /><line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="1.2" /><line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.2" /><line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.2" /><line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.2" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" className={cls}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" /></svg>;
  }
}

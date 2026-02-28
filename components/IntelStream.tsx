'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORY_COLORS, SOURCE_FAVICONS } from '@/lib/constants';
import { sounds } from '@/lib/sounds';

const CATEGORIES = [
  { id: 'all', label: 'Tutti' },
  { id: 'Politics', label: 'Politica' },
  { id: 'Defense', label: 'Difesa' },
  { id: 'Economy', label: 'Economia' },
  { id: 'World', label: 'Mondo' },
  { id: 'Cronaca', label: 'Cronaca' },
  { id: 'Entertainment', label: 'Intrattenimento' },
] as const;

const SOURCE_COLORS: Record<string, string> = {
  ANSA: '#2D72D2', Repubblica: '#dc2626', Corriere: '#1e40af',
  Sole24Ore: '#d97706', Adnkronos: '#059669', SkyTG24: '#0ea5e9',
  AGI: '#7c3aed', TGCOM24: '#e11d48',
};

export default function IntelStream() {
  const { data: items, loading } = useStore((s) => s.news);
  const openArticle = useStore((s) => s.openArticle);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = items;
    if (activeTab !== 'all') result = result.filter((i) => i.category === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s) || i.source.toLowerCase().includes(s));
    }
    return result;
  }, [items, activeTab, search]);

  const breakingCount = items.filter((i) => i.isBreaking).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <div className="border-b px-4 py-3 flex-shrink-0" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'var(--accent-muted)' }}>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M2 3h12M2 7h8M2 11h12M2 15h6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>
            Intel Stream
          </h2>
          <div className="flex-1" />
          {breakingCount > 0 && (
            <span className="breaking-indicator rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono"
              style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              {breakingCount} URGENTI
            </span>
          )}
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold font-mono"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--border-dim)' }}>
            {filtered.length}
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0">
            <circle cx="7" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.3" />
            <line x1="10" y1="10" x2="13" y2="13" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtra intelligence..."
            className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
          {search && <button onClick={() => setSearch('')} className="text-[13px] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>×</button>}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b px-3 py-2 flex-shrink-0" style={{ borderColor: 'var(--border-dim)' }}>
        {CATEGORIES.map((cat) => {
          const catColor = CATEGORY_COLORS[cat.id] || 'var(--cyan-500)';
          const isActive = activeTab === cat.id;
          return (
            <button key={cat.id} onClick={() => { setActiveTab(cat.id); sounds.click(); }}
              className="flex-shrink-0 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all"
              style={{
                background: isActive ? (cat.id === 'all' ? 'var(--accent-muted)' : `${catColor}15`) : 'transparent',
                color: isActive ? (cat.id === 'all' ? 'var(--accent)' : catColor) : 'var(--text-dim)',
                border: `1px solid ${isActive ? (cat.id === 'all' ? 'var(--border-medium)' : `${catColor}30`) : 'transparent'}`,
              }}>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex gap-2"><div className="h-4 w-16 animate-shimmer-load rounded" /><div className="h-4 w-20 animate-shimmer-load rounded" /></div>
                <div className="h-3 w-full animate-shimmer-load rounded" />
                <div className="h-3 w-3/4 animate-shimmer-load rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-[12px]" style={{ color: 'var(--text-dim)' }}>Nessun risultato</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div>
              {filtered.slice(0, 50).map((item, i) => {
                const catColor = CATEGORY_COLORS[item.category] || 'var(--cyan-500)';
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.008 }}
                    className="group block px-4 py-3 transition-colors hover:bg-[var(--bg-hover)] border-b cursor-default"
                    style={{ borderColor: 'var(--border-dim)' }}
                  >
                    {/* Source + category + time row */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <SourceTag source={item.source} />
                      {activeTab === 'all' && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono"
                          style={{ color: catColor, background: `${catColor}10`, border: `1px solid ${catColor}20` }}>
                          {item.category}
                        </span>
                      )}
                      <span className="flex-1" />
                      <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(item.publishedAt)}
                      </span>
                    </div>
                    {/* Title */}
                    <p className="line-clamp-2 text-[13px] leading-relaxed font-medium group-hover:text-white transition-colors"
                      style={{ color: item.isBreaking ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {item.isBreaking && <span className="inline-block mr-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded breaking-indicator font-mono" style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}>URGENTE</span>}
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-1 line-clamp-1 text-[11px]" style={{ color: 'var(--text-dim)' }}>
                        {item.description}
                      </p>
                    )}
                    {/* Read full article button */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openArticle(item.url, item.title); sounds.click(); }}
                        className="text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-white px-2 py-0.5 rounded"
                        style={{ color: 'var(--accent)', background: 'var(--accent-muted)', border: '1px solid var(--border-medium)' }}>
                        Leggi Articolo
                      </button>
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] transition-colors hover:text-white"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={(e) => e.stopPropagation()}>
                        Apri ↗
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function SourceTag({ source }: { source: string }) {
  const color = SOURCE_COLORS[source] || 'var(--cyan-500)';
  const favicon = SOURCE_FAVICONS[source];
  return (
    <span className="source-tag" style={{ color, borderColor: `${color}25`, background: `${color}08` }}>
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" className="h-3 w-3 rounded-sm" style={{ imageRendering: 'auto' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      )}
      {source}
    </span>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ora';
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa · ${d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

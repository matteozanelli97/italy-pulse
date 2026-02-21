'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NewsItem } from '@/types';

interface IntelStreamProps {
  items: NewsItem[];
  loading: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'Tutte', color: '#388bff' },
  { id: 'Politica', label: 'Politica', color: '#388bff' },
  { id: 'Tecnologia', label: 'Tecnologia', color: '#00d4ff' },
  { id: 'Economia', label: 'Economia', color: '#00e87b' },
  { id: 'Sicurezza', label: 'Sicurezza', color: '#ff3b5c' },
  { id: 'Mondo', label: 'Mondo', color: '#a855f7' },
  { id: 'Sport', label: 'Sport', color: '#ff8a3d' },
  { id: 'Cronaca', label: 'Cronaca', color: '#ffb800' },
] as const;

const BADGE_MAP: Record<string, string> = {
  Politica: 'badge-blue', Tecnologia: 'badge-cyan', Economia: 'badge-emerald',
  Sicurezza: 'badge-red', Mondo: 'badge-purple', Sport: 'badge-orange',
  Cronaca: 'badge-amber', Generale: 'badge-blue',
};

function categorize(item: NewsItem): string {
  const t = (item.title + ' ' + item.description + ' ' + item.category).toLowerCase();
  if (/politic|governo|parlamento|ministro|elezioni|decreto/i.test(t)) return 'Politica';
  if (/tecnolog|digitale|ai|cyber|software|startup|app/i.test(t)) return 'Tecnologia';
  if (/econom|finanz|borsa|mercati|pil|inflaz|banca|spread|euro/i.test(t)) return 'Economia';
  if (/sicurezz|terroris|difesa|polizia|carabinieri|arma|attacca|guerra/i.test(t)) return 'Sicurezza';
  if (/sport|calcio|serie a|champions|olimp|tennis|formula/i.test(t)) return 'Sport';
  if (/mond|internazional|usa|cina|russia|europa|trump|nato/i.test(t)) return 'Mondo';
  if (/cronaca|incidente|morto|omicidio|arresto|indagine/i.test(t)) return 'Cronaca';
  return item.category || 'Generale';
}

export default function IntelStream({ items, loading }: IntelStreamProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const categorizedItems = useMemo(() =>
    items.map((item) => ({ ...item, _cat: categorize(item) })),
    [items]
  );

  const filtered = useMemo(() => {
    let result = categorizedItems;
    if (activeTab !== 'all') result = result.filter((i) => i._cat === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
    }
    return result;
  }, [categorizedItems, activeTab, search]);

  return (
    <motion.aside
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
      className="hidden w-[360px] flex-shrink-0 flex-col overflow-hidden border-l lg:flex"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}
    >
      {/* Header */}
      <div className="border-b px-4 py-2.5" style={{ borderColor: 'var(--border-dim)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'rgba(56,139,255,0.08)' }}>
            <svg viewBox="0 0 16 16" fill="var(--accent-blue)" className="h-3.5 w-3.5">
              <path d="M8 1a1 1 0 011 1v1.586l1.707-1.707a1 1 0 111.414 1.414L10.414 5H12a1 1 0 110 2h-1.586l1.707 1.707a1 1 0 01-1.414 1.414L9 8.414V10a1 1 0 11-2 0V8.414L5.293 10.121a1 1 0 01-1.414-1.414L5.586 7H4a1 1 0 010-2h1.586L3.879 3.293a1 1 0 011.414-1.414L7 3.586V2a1 1 0 011-1z" />
            </svg>
          </span>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
            Intel Stream
          </h2>
          <div className="flex-1" />
          <span className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
            style={{ background: 'rgba(56,139,255,0.08)', color: 'var(--accent-blue)', border: '1px solid var(--border-dim)' }}>
            {filtered.length}
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <svg viewBox="0 0 16 16" fill="var(--text-muted)" className="h-3.5 w-3.5 flex-shrink-0">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtra intelligence..."
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b px-3 py-2"
        style={{ borderColor: 'var(--border-dim)' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className="flex-shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-wider transition-all"
            style={{
              background: activeTab === cat.id ? `${cat.color}15` : 'transparent',
              color: activeTab === cat.id ? cat.color : 'var(--text-dim)',
              border: `1px solid ${activeTab === cat.id ? `${cat.color}30` : 'transparent'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="space-y-3 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="h-4 w-16 animate-shimmer-load rounded" />
                  <div className="h-4 w-20 animate-shimmer-load rounded" />
                </div>
                <div className="h-3 w-full animate-shimmer-load rounded" />
                <div className="h-3 w-3/4 animate-shimmer-load rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Nessun risultato</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="divide-y" style={{ borderColor: 'var(--border-dim)' }}>
              {filtered.slice(0, 25).map((item, i) => {
                const cat = item._cat;
                const badgeClass = BADGE_MAP[cat] || 'badge-blue';

                return (
                  <motion.a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group block px-4 py-2.5 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border-dim)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${badgeClass}`}>{cat}</span>
                      <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>{item.source}</span>
                      <span className="flex-1" />
                      <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(item.publishedAt)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-relaxed group-hover:text-white transition-colors"
                      style={{ color: 'var(--text-secondary)' }}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        {item.description}
                      </p>
                    )}
                  </motion.a>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.aside>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}g`;
}

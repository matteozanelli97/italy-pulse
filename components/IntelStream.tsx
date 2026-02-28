'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORY_COLORS } from '@/lib/constants';
import { sounds } from '@/lib/sounds';

const CATEGORIES = [
  { id: 'all', label: 'Tutti' },
  { id: 'Politics', label: 'Politica' },
  { id: 'Economy', label: 'Economia' },
  { id: 'World', label: 'Mondo' },
  { id: 'Cronaca', label: 'Cronaca' },
] as const;

export default function IntelStream() {
  const { data: items, loading } = useStore((s) => s.news);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());
  const [summaryData, setSummaryData] = useState<{ text: string; cat: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const filtered = useMemo(() => {
    let result = items;
    if (activeTab !== 'all') result = result.filter((i) => i.category === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
    }
    return result;
  }, [items, activeTab, search]);

  const breakingCount = items.filter((i) => i.isBreaking).length;

  const pinned = useMemo(() => filtered.filter((i) => pinnedIds.has(i.id)), [filtered, pinnedIds]);
  const unpinned = useMemo(() => filtered.filter((i) => !pinnedIds.has(i.id)), [filtered, pinnedIds]);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const fetchSummary = useCallback(async (catId: string) => {
    if (summaryLoading) return;
    setSummaryLoading(true);
    setSummaryData(null);
    try {
      const catItems = catId === 'all' ? items : items.filter((i) => i.category === catId);
      const titles = catItems.slice(0, 20).map((i) => i.title);
      const res = await fetch('/api/news/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles, category: catId }),
      });
      const data = await res.json();
      setSummaryData({ text: data.summary, cat: catId });
    } catch {
      setSummaryData({ text: 'Errore nel generare il riepilogo.', cat: catId });
    }
    setSummaryLoading(false);
  }, [items, summaryLoading]);

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
              {breakingCount} BREAKING
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtra notizie..."
            className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
          {search && <button onClick={() => setSearch('')} className="text-[13px] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>×</button>}
        </div>
      </div>

      {/* Category Tabs — only categories are colored */}
      <div className="flex items-center gap-1 overflow-x-auto border-b px-3 py-2 flex-shrink-0" style={{ borderColor: 'var(--border-dim)' }}>
        {CATEGORIES.map((cat) => {
          const catColor = CATEGORY_COLORS[cat.id] || 'var(--cyan-500)';
          const isActive = activeTab === cat.id;
          return (
            <button key={cat.id} onClick={() => { setActiveTab(cat.id); setSummaryData(null); sounds.click(); }}
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
        <div className="flex-1" />
        {/* AI Summary button */}
        <button
          onClick={() => fetchSummary(activeTab)}
          disabled={summaryLoading}
          className="flex-shrink-0 rounded-md px-2 py-1 text-[9px] font-bold uppercase tracking-wider transition-all"
          style={{
            background: 'var(--accent-muted)', color: 'var(--accent)',
            border: '1px solid var(--border-medium)', opacity: summaryLoading ? 0.5 : 1,
          }}>
          {summaryLoading ? '...' : 'AI Riepilogo'}
        </button>
      </div>

      {/* AI Summary panel */}
      {summaryData && (
        <div className="border-b px-4 py-3 flex-shrink-0" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-card)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold font-mono uppercase" style={{ color: 'var(--accent)' }}>Riepilogo AI</span>
            <button onClick={() => setSummaryData(null)} className="text-[12px] hover:text-white" style={{ color: 'var(--text-dim)' }}>×</button>
          </div>
          <p className="text-[11px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
            {summaryData.text}
          </p>
        </div>
      )}

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
              {/* Pinned items */}
              {pinned.length > 0 && (
                <>
                  <div className="px-4 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>Fissate</div>
                  {pinned.map((item) => (
                    <NewsItem key={`pin-${item.id}`} item={item} expanded={expandedId === item.id}
                      onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      pinned onTogglePin={() => togglePin(item.id)} activeTab={activeTab} />
                  ))}
                  <div className="border-b" style={{ borderColor: 'var(--border-dim)' }} />
                </>
              )}
              {/* Regular items */}
              {unpinned.slice(0, 50).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.008 }}>
                  <NewsItem item={item} expanded={expandedId === item.id}
                    onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    pinned={pinnedIds.has(item.id)} onTogglePin={() => togglePin(item.id)} activeTab={activeTab} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function NewsItem({ item, expanded, onToggle, pinned, onTogglePin, activeTab }: {
  item: { id: string; title: string; description: string; source: string; url: string; publishedAt: string; category: string; isBreaking?: boolean };
  expanded: boolean; onToggle: () => void; pinned: boolean; onTogglePin: () => void; activeTab: string;
}) {
  const catColor = CATEGORY_COLORS[item.category] || 'var(--cyan-500)';

  return (
    <div className="group px-4 py-3 transition-colors hover:bg-[var(--bg-hover)] border-b" style={{ borderColor: 'var(--border-dim)' }}>
      {/* Top row: category badge + time + pin */}
      <div className="flex items-center gap-2 mb-1">
        {activeTab === 'all' && (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono"
            style={{ color: catColor, background: `${catColor}10`, border: `1px solid ${catColor}20` }}>
            {item.category === 'Politics' ? 'Politica' : item.category === 'Economy' ? 'Economia' : item.category === 'World' ? 'Mondo' : 'Cronaca'}
          </span>
        )}
        {item.isBreaking && (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold font-mono breaking-indicator"
            style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}>
            BREAKING
          </span>
        )}
        <span className="flex-1" />
        <span className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
          {formatTime(item.publishedAt)}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className="text-[10px] transition-opacity" style={{ opacity: pinned ? 1 : 0.25, color: pinned ? '#EC9A3C' : 'var(--text-dim)' }}>
          ★
        </button>
      </div>

      {/* Title — clickable to expand */}
      <button onClick={onToggle} className="text-left w-full">
        <p className={`text-[13px] leading-relaxed font-medium transition-colors ${expanded ? 'text-white' : ''}`}
          style={{ color: expanded ? '#fff' : item.isBreaking ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {item.title}
        </p>
        {/* Description preview — always show 1 line; when expanded show all */}
        {item.description && (
          <p className={`mt-1 text-[11px] leading-relaxed ${expanded ? '' : 'line-clamp-1'}`}
            style={{ color: 'var(--text-dim)' }}>
            {item.description}
          </p>
        )}
      </button>

      {/* Expanded: full text + source link */}
      {expanded && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.source}</span>
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-semibold transition-colors hover:text-white"
            style={{ color: 'var(--accent)' }}
            onClick={(e) => e.stopPropagation()}>
            Apri su {item.source} ↗
          </a>
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ora';
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

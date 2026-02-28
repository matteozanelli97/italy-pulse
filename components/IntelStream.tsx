'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CATEGORY_COLORS } from '@/lib/constants';
import { sounds } from '@/lib/sounds';

const CATEGORIES = [
  { id: 'Politics', label: 'Politica' },
  { id: 'Economy', label: 'Economia' },
  { id: 'World', label: 'Mondo' },
  { id: 'Cronaca', label: 'Cronaca' },
] as const;

export default function IntelStream() {
  const { data: items, loading } = useStore((s) => s.news);
  const [activeTab, setActiveTab] = useState('Politics');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => new Set());
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summaryLoading, setSummaryLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = items.filter((i) => i.category === activeTab);
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
    setPinnedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const fetchSummary = useCallback(async (catId: string) => {
    if (summaryLoading) return;
    setSummaryLoading(catId);
    try {
      const catItems = items.filter((i) => i.category === catId);
      const titles = catItems.slice(0, 20).map((i) => i.title);
      const res = await fetch('/api/news/summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titles, category: catId }) });
      const data = await res.json();
      setSummaries((prev) => ({ ...prev, [catId]: data.summary }));
    } catch {
      setSummaries((prev) => ({ ...prev, [catId]: 'Errore nel generare il riepilogo.' }));
    }
    setSummaryLoading(null);
  }, [items, summaryLoading]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <div className="border-b px-4 py-2.5 flex-shrink-0" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: 'var(--accent-muted)' }}>
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3"><path d="M2 3h12M2 7h8M2 11h12M2 15h6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </span>
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-primary)' }}>Intel Stream</h2>
          <div className="flex-1" />
          {breakingCount > 0 && (
            <span className="breaking-indicator rounded-full px-2 py-0.5 text-[9px] font-bold font-mono"
              style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              {breakingCount} BREAKING
            </span>
          )}
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold font-mono"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--border-dim)' }}>{filtered.length}</span>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 rounded px-2.5 py-1.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 flex-shrink-0"><circle cx="7" cy="7" r="4" stroke="var(--text-muted)" strokeWidth="1.3" /><line x1="10" y1="10" x2="13" y2="13" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtra..."
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
          {search && <button onClick={() => setSearch('')} className="text-[12px]" style={{ color: 'var(--text-dim)' }}>×</button>}
        </div>
      </div>

      {/* Category Tabs — colored */}
      <div className="flex items-center gap-1 border-b px-3 py-1.5 flex-shrink-0" style={{ borderColor: 'var(--border-dim)' }}>
        {CATEGORIES.map((cat) => {
          const c = CATEGORY_COLORS[cat.id] || '#fff';
          const active = activeTab === cat.id;
          return (
            <button key={cat.id} onClick={() => { setActiveTab(cat.id); sounds.click(); }}
              className="flex-1 rounded-md py-1 text-[10px] font-semibold uppercase tracking-wider transition-all text-center"
              style={{
                background: active ? `${c}18` : 'transparent',
                color: active ? c : 'var(--text-dim)',
                border: `1px solid ${active ? `${c}35` : 'transparent'}`,
              }}>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* AI Summary for active category */}
      <div className="flex-shrink-0 border-b px-3 py-1.5" style={{ borderColor: 'var(--border-dim)' }}>
        {summaries[activeTab] ? (
          <div className="rounded px-3 py-2" style={{ background: 'var(--bg-card)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold font-mono uppercase" style={{ color: 'var(--accent)' }}>Riepilogo AI</span>
              <button onClick={() => setSummaries((p) => { const n = { ...p }; delete n[activeTab]; return n; })} className="text-[11px]" style={{ color: 'var(--text-dim)' }}>×</button>
            </div>
            <p className="text-[10px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{summaries[activeTab]}</p>
          </div>
        ) : (
          <button onClick={() => fetchSummary(activeTab)} disabled={summaryLoading !== null}
            className="w-full text-center rounded py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all font-mono"
            style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1px solid var(--border-dim)', opacity: summaryLoading ? 0.5 : 1 }}>
            {summaryLoading === activeTab ? 'Generando...' : 'AI Riepilogo ultime 24h'}
          </button>
        )}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5"><div className="h-4 w-3/4 animate-shimmer-load rounded" /><div className="h-3 w-full animate-shimmer-load rounded" /></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Nessun risultato</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div>
              {pinned.length > 0 && (
                <>
                  <div className="px-4 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>Fissate</div>
                  {pinned.map((item) => <NI key={`p-${item.id}`} item={item} exp={expandedId === item.id} onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)} pinned onPin={() => togglePin(item.id)} />)}
                  <div className="border-b" style={{ borderColor: 'var(--border-dim)' }} />
                </>
              )}
              {unpinned.slice(0, 50).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.006 }}>
                  <NI item={item} exp={expandedId === item.id} onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)} pinned={pinnedIds.has(item.id)} onPin={() => togglePin(item.id)} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function NI({ item, exp, onToggle, pinned, onPin }: {
  item: { id: string; title: string; description: string; source: string; url: string; publishedAt: string; category: string; isBreaking?: boolean; imageUrl?: string };
  exp: boolean; onToggle: () => void; pinned: boolean; onPin: () => void;
}) {
  const d = new Date(item.publishedAt);
  const exactTime = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const exactDate = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });

  return (
    <div className="px-4 py-2.5 transition-colors hover:bg-[var(--bg-hover)] border-b" style={{ borderColor: 'var(--border-dim)' }}>
      {/* Source + time + pin */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] font-mono font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{item.source}</span>
        {item.isBreaking && (
          <span className="rounded px-1.5 py-0.5 text-[8px] font-bold font-mono breaking-indicator"
            style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}>BREAKING</span>
        )}
        <span className="flex-1" />
        <span className="text-[9px] font-mono tabular-nums" style={{ color: 'var(--text-dim)' }}>{exactDate} {exactTime}</span>
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="text-[10px]"
          style={{ opacity: pinned ? 1 : 0.2, color: pinned ? '#EC9A3C' : 'var(--text-dim)' }}>★</button>
      </div>

      {/* Title — click to expand */}
      <button onClick={onToggle} className="text-left w-full">
        <p className="text-[12px] leading-snug font-medium" style={{ color: item.isBreaking ? '#fff' : 'var(--text-secondary)' }}>
          {item.title}
        </p>
        {!exp && item.description && (
          <p className="mt-0.5 text-[10px] leading-relaxed line-clamp-1" style={{ color: 'var(--text-dim)' }}>{item.description}</p>
        )}
      </button>

      {/* Expanded: image + full description + link */}
      {exp && (
        <div className="mt-2">
          {item.imageUrl && (
            <div className="mb-2 rounded overflow-hidden" style={{ maxHeight: 160 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt="" className="w-full object-cover" style={{ maxHeight: 160 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <p className="text-[11px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
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

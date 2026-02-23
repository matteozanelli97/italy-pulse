'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

const CATEGORIES = [
  { id: 'all', label: 'Tutte' },
  { id: 'breaking', label: 'Urgenti' },
  { id: 'Politica', label: 'Politica' },
  { id: 'Economia', label: 'Economia' },
  { id: 'Sicurezza', label: 'Sicurezza' },
  { id: 'Mondo', label: 'Mondo' },
  { id: 'Cronaca', label: 'Cronaca' },
  { id: 'Tecnologia', label: 'Tech' },
] as const;

// Source color map for visual identification
const SOURCE_COLORS: Record<string, string> = {
  ANSA: '#2563eb',
  Repubblica: '#dc2626',
  Corriere: '#1e40af',
  Sole24Ore: '#d97706',
  Adnkronos: '#059669',
};

function categorize(title: string, description: string, category: string): string {
  const t = (title + ' ' + description + ' ' + category).toLowerCase();
  if (/politic|governo|parlamento|ministro|elezioni|decreto|senato|camera/i.test(t)) return 'Politica';
  if (/tecnolog|digitale|ai\b|cyber|software|startup|app\b|robot|algoritm/i.test(t)) return 'Tecnologia';
  if (/econom|finanz|borsa|mercati|pil|inflaz|banca|spread|euro|lavoro|occupaz/i.test(t)) return 'Economia';
  if (/sicurezz|terroris|difesa|polizia|carabinieri|arma|attacca|guerra|militar/i.test(t)) return 'Sicurezza';
  if (/mond|internazional|usa|cina|russia|europa|trump|nato|onu|medio.?orient/i.test(t)) return 'Mondo';
  if (/cronaca|incidente|morto|omicidio|arresto|indagine|rapina|droga/i.test(t)) return 'Cronaca';
  return category || 'Generale';
}

export default function IntelStream() {
  const { data: items, loading } = useStore((s) => s.news);
  const aiSummary = useStore((s) => s.aiSummary);
  const trendingTopics = useStore((s) => s.trendingTopics);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const categorizedItems = useMemo(() =>
    items.map((item) => ({ ...item, _cat: categorize(item.title, item.description, item.category) })),
    [items]
  );

  const filtered = useMemo(() => {
    let result = categorizedItems;
    if (activeTab === 'breaking') result = result.filter((i) => i.isBreaking);
    else if (activeTab !== 'all') result = result.filter((i) => i._cat === activeTab);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s) || i.source.toLowerCase().includes(s));
    }
    return result;
  }, [categorizedItems, activeTab, search]);

  const breakingItems = categorizedItems.filter((i) => i.isBreaking);
  const breakingCount = breakingItems.length;

  return (
    <motion.aside
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
      className="hidden w-[380px] flex-shrink-0 flex-col overflow-hidden border-l lg:flex"
      style={{ background: 'var(--bg-deep)', borderColor: 'var(--border-dim)' }}
    >
      {/* Header */}
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'rgba(59,130,246,0.08)', boxShadow: 'var(--shadow-card)' }}>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path d="M2 3h12M2 7h8M2 11h12M2 15h6" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
            Intel Stream
          </h2>
          <div className="flex-1" />
          {breakingCount > 0 && (
            <span className="breaking-indicator rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
              style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
              {breakingCount} URGENTI
            </span>
          )}
          <span className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold"
            style={{ background: 'rgba(59,130,246,0.06)', color: 'var(--blue-400)', border: '1px solid var(--border-dim)' }}>
            {filtered.length}
          </span>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div className="mb-2.5 rounded-md px-3 py-2 text-[10px] leading-relaxed"
            style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid var(--border-dim)', color: 'var(--blue-400)', boxShadow: 'var(--shadow-card)' }}>
            <span className="font-bold mr-1.5 text-[9px] uppercase tracking-wider opacity-60">Analisi AI</span>
            <br />
            {aiSummary}
          </div>
        )}

        {/* Trending */}
        {trendingTopics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {trendingTopics.slice(0, 5).map((t) => (
              <span key={t.topic} className="rounded px-1.5 py-0.5 text-[8px] font-medium"
                style={{
                  background: t.sentiment === 'negative' ? 'rgba(239,68,68,0.06)' : t.sentiment === 'positive' ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                  color: t.sentiment === 'negative' ? '#ef4444' : t.sentiment === 'positive' ? '#3b82f6' : 'var(--text-dim)',
                  border: `1px solid ${t.sentiment === 'negative' ? 'rgba(239,68,68,0.12)' : t.sentiment === 'positive' ? 'rgba(59,130,246,0.12)' : 'var(--border-dim)'}`,
                }}>
                {t.topic} ({t.count})
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)' }}>
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0">
            <circle cx="7" cy="7" r="4.5" stroke="var(--text-muted)" strokeWidth="1.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtra intelligence..."
            className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-[var(--text-muted)]" style={{ color: 'var(--text-secondary)' }} />
          {search && <button onClick={() => setSearch('')} className="text-[12px] hover:text-white transition-colors" style={{ color: 'var(--text-dim)' }}>×</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b px-3 py-2" style={{ borderColor: 'var(--border-dim)' }}>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveTab(cat.id)}
            className="flex-shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold uppercase tracking-wider transition-all"
            style={{
              background: activeTab === cat.id ? 'rgba(59,130,246,0.10)' : 'transparent',
              color: activeTab === cat.id ? 'var(--blue-400)' : 'var(--text-dim)',
              border: `1px solid ${activeTab === cat.id ? 'rgba(59,130,246,0.20)' : 'transparent'}`,
            }}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Breaking banner */}
      {breakingCount > 0 && activeTab === 'all' && (
        <div className="border-b px-4 py-2" style={{ borderColor: 'var(--border-dim)', background: 'rgba(220,38,38,0.04)' }}>
          <div className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: '#dc2626' }}>
            NOTIZIE URGENTI
          </div>
          {breakingItems.slice(0, 2).map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className="block mb-1 group">
              <div className="flex items-center gap-1.5 mb-0.5">
                <SourceTag source={item.source} />
                <span className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>{timeAgo(item.publishedAt)}</span>
              </div>
              <p className="text-[11px] font-medium leading-snug group-hover:text-white transition-colors" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </p>
            </a>
          ))}
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
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Nessun risultato</span>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div>
              {filtered.slice(0, 40).map((item, i) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.01 }}
                  className="group block px-4 py-3 transition-colors hover:bg-[var(--bg-hover)] border-b"
                  style={{ borderColor: 'var(--border-dim)' }}
                >
                  {/* Source + category + time row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <SourceTag source={item.source} />
                    <span className="badge text-[7px] py-0">{item._cat}</span>
                    <span className="flex-1" />
                    <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(item.publishedAt)}
                    </span>
                  </div>
                  {/* Title */}
                  <p className="line-clamp-2 text-[11px] leading-relaxed font-medium group-hover:text-white transition-colors"
                    style={{ color: item.isBreaking ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {item.title}
                  </p>
                  {/* Description */}
                  {item.description && (
                    <p className="mt-1 line-clamp-1 text-[10px]" style={{ color: 'var(--text-dim)' }}>
                      {item.description}
                    </p>
                  )}
                </motion.a>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </motion.aside>
  );
}

function SourceTag({ source }: { source: string }) {
  const color = SOURCE_COLORS[source] || 'var(--blue-500)';
  return (
    <span className="source-tag" style={{ color, borderColor: `${color}25`, background: `${color}08` }}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {source}
    </span>
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

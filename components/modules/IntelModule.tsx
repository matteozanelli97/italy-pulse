'use client';

import { useStore } from '@/lib/store';

export default function IntelModule({ search }: { search: string }) {
  const { data: news, loading } = useStore((s) => s.news);

  const filtered = news.filter((n) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return n.title.toLowerCase().includes(s) || n.source.toLowerCase().includes(s) || n.category.toLowerCase().includes(s);
  });

  if (loading && news.length === 0) return <Init />;

  return (
    <div className="space-y-2">
      {filtered.slice(0, 10).map((item) => (
        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
          className="block rounded px-1.5 py-1 hover:bg-[var(--bg-hover)] transition-colors">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="badge text-[7px]">{item.category || 'Intel'}</span>
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{item.source}</span>
            <span className="flex-1" />
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{ago(item.publishedAt)}</span>
          </div>
          <p className="line-clamp-2 text-[10px] leading-relaxed" style={{ color: item.isBreaking ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {item.title}
          </p>
        </a>
      ))}
      {filtered.length === 0 && <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-dim)' }}>Nessun risultato</p>}
    </div>
  );
}

function ago(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'ora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}g`;
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Caricamento intel<span className="init-dots" /></span>
    </div>
  );
}

'use client';

import { useStore } from '@/lib/store';

const TYPE_COLORS: Record<string, string> = { webcam: '#3b82f6', stream: '#8b5cf6', news: '#ef4444' };

export default function LiveCamsModule() {
  const { data: cams } = useStore((s) => s.livecams);

  if (cams.length === 0) return <Init />;

  const webcams = cams.filter((c) => c.type === 'webcam');
  const news = cams.filter((c) => c.type === 'news');

  return (
    <div className="space-y-1.5">
      {/* News streams */}
      {news.length > 0 && (
        <div className="mb-1">
          <span className="text-[7px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Dirette TV</span>
          {news.map((cam) => (
            <a key={cam.id} href={cam.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 py-0.5 hover:bg-[var(--bg-hover)] rounded px-1 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full animate-glow-breathe" style={{ background: '#ef4444' }} />
              <span className="text-[9px] font-medium" style={{ color: 'var(--text-primary)' }}>{cam.title}</span>
              <span className="flex-1" />
              <span className="text-[7px] uppercase font-bold px-1 rounded" style={{ color: TYPE_COLORS.news, background: `${TYPE_COLORS.news}10` }}>LIVE</span>
            </a>
          ))}
        </div>
      )}

      {/* Webcams */}
      <span className="text-[7px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Webcam Città</span>
      {webcams.slice(0, 8).map((cam) => (
        <a key={cam.id} href={cam.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 py-0.5 hover:bg-[var(--bg-hover)] rounded px-1 transition-colors">
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 flex-shrink-0">
            <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="var(--blue-400)" strokeWidth="1.2" />
            <circle cx="8" cy="8" r="2" stroke="var(--blue-400)" strokeWidth="1" />
          </svg>
          <span className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>{cam.title}</span>
          <span className="flex-1" />
          <span className="text-[7px]" style={{ color: 'var(--text-dim)' }}>{cam.city}</span>
        </a>
      ))}
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--blue-500)' }} />
      <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>Caricamento feed live<span className="init-dots" /></span>
    </div>
  );
}

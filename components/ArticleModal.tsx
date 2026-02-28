'use client';

import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';

export default function ArticleModal() {
  const articleUrl = useStore((s) => s.articleUrl);
  const articleTitle = useStore((s) => s.articleTitle);
  const closeArticle = useStore((s) => s.closeArticle);

  if (!articleUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center article-modal-overlay"
      onClick={() => { closeArticle(); sounds.click(); }}
    >
      <div
        className="glass-panel relative flex flex-col overflow-hidden rounded-xl"
        style={{ width: '85vw', maxWidth: 900, height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-5 py-3 flex-shrink-0"
          style={{ borderColor: 'var(--border-medium)', background: 'var(--bg-panel)' }}>
          <span className="flex h-6 w-6 items-center justify-center rounded" style={{ background: 'var(--accent-muted)' }}>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="var(--cyan-500)" strokeWidth="1.3" />
              <path d="M6 5h4M6 7.5h4M6 10h2" stroke="var(--cyan-500)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {articleTitle || 'Articolo'}
            </p>
            <p className="text-[10px] font-mono truncate" style={{ color: 'var(--text-dim)' }}>{articleUrl}</p>
          </div>
          <a href={articleUrl} target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded transition-colors hover:text-white"
            style={{ color: 'var(--cyan-500)', background: 'var(--accent-muted)', border: '1px solid var(--border-medium)' }}>
            Apri ↗
          </a>
          <button
            onClick={() => { closeArticle(); sounds.click(); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[16px] transition-colors hover:bg-white/10"
            style={{ color: 'var(--text-dim)' }}>
            ×
          </button>
        </div>

        {/* Iframe content */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-deepest)' }}>
          <iframe
            src={articleUrl}
            title="Article"
            className="w-full h-full"
            style={{ border: 'none' }}
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import type { NewsItem } from '@/types';

interface NewsPanelProps {
  items: NewsItem[];
  loading: boolean;
}

export default function NewsPanel({ items, loading }: NewsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-cyan-900/30 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-500">◈</span>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">NOTIZIE</h2>
            <p className="text-[8px] uppercase tracking-widest text-cyan-800">Feed ANSA</p>
          </div>
        </div>
        <span className="rounded-full bg-cyan-950/50 px-2 py-0.5 font-mono text-[10px] text-cyan-500">
          {items.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {loading && items.length === 0 ? (
          <Skeleton />
        ) : items.length === 0 ? (
          <p className="py-4 text-center text-xs text-cyan-800">Nessuna notizia</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.slice(0, 20).map((item, i) => (
              <motion.a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="group rounded border border-transparent px-2 py-1.5 transition-colors hover:border-cyan-900/40 hover:bg-cyan-950/20"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-600 group-hover:bg-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] leading-tight text-cyan-300 group-hover:text-cyan-200">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[9px] text-cyan-700">
                      <span>{item.source}</span>
                      <span>·</span>
                      <span>{item.category}</span>
                      <span>·</span>
                      <span>{getTimeAgo(item.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <div className="h-3 w-full animate-pulse rounded bg-cyan-950/40" />
          <div className="h-2 w-2/3 animate-pulse rounded bg-cyan-950/40" />
        </div>
      ))}
    </div>
  );
}

function getTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'adesso';
  if (mins < 60) return `${mins}m fa`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h fa`;
  return `${Math.floor(hrs / 24)}g fa`;
}

'use client';

import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';

export default function LiveCamsModule() {
  const { data: cams } = useStore((s) => s.livecams);
  const openWebcam = useStore((s) => s.openWebcam);
  const openWebcams = useStore((s) => s.openWebcams);

  if (cams.length === 0) return <Init />;

  const news = cams.filter((c) => c.type === 'news');
  const webcams = cams.filter((c) => c.type === 'webcam');

  return (
    <div className="space-y-2">
      {/* TV / news streams */}
      {news.length > 0 && (
        <div>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Dirette TV</span>
          <div className="mt-1 space-y-0.5">
            {news.map((cam) => {
              const isActive = cam.active !== false;
              const isOpen = openWebcams.some((w) => w.id === cam.id);
              return (
                <button
                  key={cam.id}
                  disabled={!isActive}
                  onClick={() => { if (isActive) { openWebcam(cam); sounds.click(); } }}
                  className="flex w-full items-center gap-2 py-1 rounded px-1.5 transition-colors text-left"
                  style={{
                    opacity: isActive ? 1 : 0.35,
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    background: isOpen ? 'rgba(0,229,255,0.06)' : 'transparent',
                  }}
                >
                  <span className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: isActive ? '#ef4444' : 'var(--text-muted)', animation: isActive ? 'glow-breathe 3s ease-in-out infinite' : 'none' }} />
                  <span className="text-[11px] font-medium truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {cam.title}
                  </span>
                  <span className="flex-1" />
                  {isActive && (
                    <span className="font-mono text-[9px] font-bold uppercase px-1.5 rounded"
                      style={{ color: isOpen ? 'var(--cyan-500)' : '#ef4444', background: isOpen ? 'rgba(0,229,255,0.08)' : 'rgba(239,68,68,0.08)' }}>
                      {isOpen ? 'APERTA' : 'LIVE'}
                    </span>
                  )}
                  {!isActive && (
                    <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>OFFLINE</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Webcams */}
      <div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Webcam Città</span>
        <div className="mt-1 space-y-0.5">
          {webcams.slice(0, 8).map((cam) => {
            const isActive = cam.active !== false;
            const isOpen = openWebcams.some((w) => w.id === cam.id);
            return (
              <button
                key={cam.id}
                disabled={!isActive}
                onClick={() => { if (isActive) { openWebcam(cam); sounds.click(); } }}
                className="flex w-full items-center gap-2 py-1 rounded px-1.5 transition-colors text-left"
                style={{
                  opacity: isActive ? 1 : 0.35,
                  cursor: isActive ? 'pointer' : 'not-allowed',
                  background: isOpen ? 'rgba(0,229,255,0.06)' : 'transparent',
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 flex-shrink-0">
                  <rect x="2" y="4" width="12" height="8" rx="1.5" stroke={isActive ? 'var(--cyan-500)' : 'var(--text-muted)'} strokeWidth="1.2" />
                  <circle cx="8" cy="8" r="2" stroke={isActive ? 'var(--cyan-500)' : 'var(--text-muted)'} strokeWidth="1" />
                </svg>
                <span className="text-[11px] truncate" style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {cam.title}
                </span>
                <span className="flex-1" />
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{cam.city}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--cyan-500)' }} />
      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Caricamento feed live<span className="init-dots" /></span>
    </div>
  );
}

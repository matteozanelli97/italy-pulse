'use client';

import { useState, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';

export default function WebcamPreview() {
  const openWebcams = useStore((s) => s.openWebcams);
  const closeWebcam = useStore((s) => s.closeWebcam);

  if (openWebcams.length === 0) return null;

  return (
    <div className="flex-shrink-0 flex gap-px border-t" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-deepest)', height: 220 }}>
      {openWebcams.map((cam) => (
        <CamPanel key={cam.id} cam={cam} onClose={() => { closeWebcam(cam.id); sounds.click(); }} />
      ))}
    </div>
  );
}

function CamPanel({ cam, onClose }: { cam: { id: string; title: string; city: string; url: string; embedUrl?: string }; onClose: () => void }) {
  const [muted, setMuted] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleAudio = useCallback(() => {
    const next = !muted;
    setMuted(next);
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = src.replace(/mute=[01]/, `mute=${next ? 1 : 0}`);
    }
  }, [muted]);

  const embedSrc = cam.embedUrl || cam.url;
  const isWindy = embedSrc.includes('windy.com');
  const isYoutube = embedSrc.includes('youtube');

  return (
    <div className="relative flex-1 min-w-0 overflow-hidden" style={{ background: '#000' }}>
      {loadError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: '#E76A6E' }}>Feed non disponibile</span>
          <a href={cam.url} target="_blank" rel="noopener noreferrer"
            className="text-[10px] font-mono underline" style={{ color: 'var(--accent)' }}>Apri sorgente ↗</a>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={embedSrc}
          title={cam.title}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          style={{ border: 'none' }}
          onError={() => setLoadError(true)}
        />
      )}

      {/* Top overlay controls — pointer-events only on this bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-2 py-1 z-20"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)', pointerEvents: 'auto' }}>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full animate-glow-breathe" style={{ background: '#ef4444' }} />
          <span className="text-[10px] font-semibold font-mono truncate" style={{ color: '#fff' }}>{cam.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {isYoutube && (
            <button onClick={toggleAudio}
              className="flex h-5 w-5 items-center justify-center rounded text-[10px] transition-colors hover:bg-white/20"
              style={{ color: muted ? 'var(--text-dim)' : '#fff' }}
              title={muted ? 'Attiva audio' : 'Disattiva audio'}>
              {muted ? (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="currentColor" opacity="0.15"/><path d="M10.5 5.5l4 5M14.5 5.5l-4 5"/></svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2L4 5.5H1.5v5H4L8 14V2z" fill="currentColor" opacity="0.15"/><path d="M11 5.5c.7.8 1 1.7 1 2.5s-.3 1.7-1 2.5M13 3.5c1.2 1.3 1.8 2.9 1.8 4.5S14.2 11.2 13 12.5"/></svg>
              )}
            </button>
          )}
          <a href={cam.url} target="_blank" rel="noopener noreferrer"
            className="flex h-5 w-5 items-center justify-center rounded text-[10px] transition-colors hover:bg-white/20"
            style={{ color: 'var(--text-dim)' }}>↗</a>
          <button onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded text-[12px] transition-colors hover:bg-white/20"
            style={{ color: 'var(--text-dim)' }}>×</button>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 px-2 py-1 z-20"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)', pointerEvents: 'none' }}>
        <span className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{cam.city}</span>
      </div>
    </div>
  );
}

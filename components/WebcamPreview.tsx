'use client';

import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';

export default function WebcamPreview() {
  const openWebcams = useStore((s) => s.openWebcams);
  const closeWebcam = useStore((s) => s.closeWebcam);

  if (openWebcams.length === 0) return null;

  return (
    <div className="flex-shrink-0 flex gap-px border-t" style={{ borderColor: 'var(--border-dim)', background: 'var(--bg-deepest)', height: 180 }}>
      {openWebcams.map((cam) => (
        <div key={cam.id} className="relative flex-1 min-w-0 overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          {/* Video embed */}
          {cam.embedUrl ? (
            <iframe
              src={cam.embedUrl}
              title={cam.title}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 'none' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
              <div className="text-center">
                <div className="text-[20px] mb-1" style={{ color: 'var(--text-muted)' }}>▶</div>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>Feed non disponibile</span>
              </div>
            </div>
          )}

          {/* Overlay header */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-2 py-1 z-10"
            style={{ background: 'linear-gradient(180deg, rgba(3,8,16,0.85) 0%, transparent 100%)' }}>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full animate-glow-breathe" style={{ background: '#ef4444' }} />
              <span className="text-[10px] font-semibold font-mono truncate" style={{ color: 'var(--text-primary)' }}>
                {cam.title}
              </span>
            </div>
            <button
              onClick={() => { closeWebcam(cam.id); sounds.click(); }}
              className="flex h-5 w-5 items-center justify-center rounded text-[12px] transition-colors hover:bg-white/10"
              style={{ color: 'var(--text-dim)' }}>
              ×
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 inset-x-0 px-2 py-1 z-10"
            style={{ background: 'linear-gradient(0deg, rgba(3,8,16,0.85) 0%, transparent 100%)' }}>
            <span className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{cam.city}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

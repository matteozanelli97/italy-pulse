'use client';

import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';
import type { LiveCam } from '@/types';

export default function LiveCamsModule() {
  const { data: cams } = useStore((s) => s.livecams);
  const openWebcam = useStore((s) => s.openWebcam);
  const openWebcams = useStore((s) => s.openWebcams);

  if (cams.length === 0) return <Init />;

  const news = cams.filter((c) => c.type === 'news');
  const webcams = cams.filter((c) => c.type === 'webcam');
  const onlineCount = cams.filter((c) => c.active !== false).length;
  const offlineCount = cams.filter((c) => c.active === false).length;

  return (
    <div className="space-y-2">
      {/* Status summary */}
      <div className="flex items-center gap-2 font-mono text-[9px]">
        <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#32A467', background: 'rgba(50,164,103,0.08)', border: '1px solid rgba(50,164,103,0.15)' }}>
          {onlineCount} ONLINE
        </span>
        {offlineCount > 0 && (
          <span className="rounded px-1.5 py-0.5 font-bold" style={{ color: '#E76A6E', background: 'rgba(231,106,110,0.08)', border: '1px solid rgba(231,106,110,0.15)' }}>
            {offlineCount} OFFLINE
          </span>
        )}
      </div>

      {/* TV / news streams */}
      {news.length > 0 && (
        <div>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Dirette TV</span>
          <div className="mt-1 space-y-0.5">
            {news.map((cam) => <CamRow key={cam.id} cam={cam} openWebcam={openWebcam} isOpen={openWebcams.some((w) => w.id === cam.id)} />)}
          </div>
        </div>
      )}

      {/* Webcams */}
      <div>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>Webcam Città</span>
        <div className="mt-1 space-y-0.5">
          {webcams.map((cam) => <CamRow key={cam.id} cam={cam} openWebcam={openWebcam} isOpen={openWebcams.some((w) => w.id === cam.id)} />)}
        </div>
      </div>
    </div>
  );
}

function CamRow({ cam, openWebcam, isOpen }: { cam: LiveCam; openWebcam: (c: LiveCam) => void; isOpen: boolean }) {
  const isActive = cam.active !== false;
  return (
    <button
      disabled={!isActive}
      onClick={() => { if (isActive) { openWebcam(cam); sounds.click(); } }}
      className="flex w-full items-center gap-2 py-1 rounded px-1.5 transition-colors text-left"
      style={{
        opacity: isActive ? 1 : 0.4,
        cursor: isActive ? 'pointer' : 'not-allowed',
        background: isOpen ? 'var(--accent-muted)' : 'transparent',
      }}
    >
      <span className="h-2 w-2 rounded-full flex-shrink-0"
        style={{
          background: !isActive ? '#E76A6E' : isOpen ? 'var(--accent)' : '#32A467',
          animation: isActive && !isOpen ? 'glow-breathe 3s ease-in-out infinite' : 'none',
        }} />
      <span className="text-[11px] font-medium truncate" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {cam.title}
      </span>
      <span className="flex-1" />
      <span className="text-[9px] font-mono" style={{ color: 'var(--text-dim)' }}>{cam.city}</span>
      <span className="font-mono text-[8px] font-bold uppercase px-1.5 rounded"
        style={{
          color: !isActive ? '#E76A6E' : isOpen ? 'var(--accent)' : '#32A467',
          background: !isActive ? 'rgba(231,106,110,0.08)' : isOpen ? 'var(--accent-muted)' : 'rgba(50,164,103,0.08)',
        }}>
        {!isActive ? 'OFFLINE' : isOpen ? 'APERTA' : 'LIVE'}
      </span>
    </button>
  );
}

function Init() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--accent)' }} />
      <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-dim)' }}>Caricamento feed live<span className="init-dots" /></span>
    </div>
  );
}

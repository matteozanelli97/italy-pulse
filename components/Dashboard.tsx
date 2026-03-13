'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';
import LeftPanel from './LeftPanel';
import IntelStream from './IntelStream';
import WebcamPreview from './WebcamPreview';
import { useStore } from '@/lib/store';

const TacticalMap = dynamic(() => import('./TacticalMap'), { ssr: false });

export default function Dashboard() {
  const startPolling = useStore((s) => s.startPolling);
  const stopPolling = useStore((s) => s.stopPolling);
  const openWebcams = useStore((s) => s.openWebcams);
  const [showData, setShowData] = useState(false);
  const [showIntel, setShowIntel] = useState(false);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: '#050810' }}>
      <TopBar onToggleData={() => setShowData(!showData)} onToggleIntel={() => setShowIntel(!showIntel)} showData={showData} showIntel={showIntel} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* 3D Globe fills entire space */}
        <div className="flex-1 relative">
          <TacticalMap />
        </div>

        {/* Floating left data panel */}
        {showData && (
          <div className="absolute top-0 left-0 bottom-0 w-[360px] z-10 overflow-hidden border-r"
            style={{ background: 'rgba(16,20,27,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-dim)' }}>
            <LeftPanel />
          </div>
        )}

        {/* Floating right intel panel */}
        {showIntel && (
          <div className="absolute top-0 right-0 bottom-0 w-[380px] z-10 overflow-hidden border-l"
            style={{ background: 'rgba(16,20,27,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-dim)' }}>
            <IntelStream />
          </div>
        )}

        {/* Webcam dock */}
        {openWebcams.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <WebcamPreview />
          </div>
        )}
      </div>
    </div>
  );
}

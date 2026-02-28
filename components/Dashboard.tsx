'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';
import IconSidebar from './IconSidebar';
import LeftPanel from './LeftPanel';
import IntelStream from './IntelStream';
import LiveChat from './LiveChat';
import WebcamPreview from './WebcamPreview';
import ArticleModal from './ArticleModal';
import { useStore } from '@/lib/store';

const TacticalMap = dynamic(() => import('./TacticalMap'), { ssr: false });

export default function Dashboard() {
  const startPolling = useStore((s) => s.startPolling);
  const stopPolling = useStore((s) => s.stopPolling);
  const openWebcams = useStore((s) => s.openWebcams);
  const articleUrl = useStore((s) => s.articleUrl);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: 'var(--bg-deepest)' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Far-left: Icon sidebar for module toggles */}
        <IconSidebar />

        {/* Left panel: data modules */}
        <LeftPanel />

        {/* Center: Map + optional webcam preview */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TacticalMap />
          {openWebcams.length > 0 && <WebcamPreview />}
        </div>

        {/* Right column: Intel Stream + Live Chat stacked */}
        <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col overflow-hidden border-l"
          style={{ borderColor: 'var(--border-dim)' }}>
          <IntelStream />
          <LiveChat />
        </div>
      </div>

      {/* Article modal overlay */}
      {articleUrl && <ArticleModal />}
    </div>
  );
}

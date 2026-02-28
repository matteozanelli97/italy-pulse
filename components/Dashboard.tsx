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

        {/* Center: Map + Chat at bottom */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 relative">
            <TacticalMap />
          </div>
          {openWebcams.length > 0 && <WebcamPreview />}
          {/* LiveChat sits below map, beside IntelStream */}
          <div className="hidden lg:block flex-shrink-0">
            <LiveChat />
          </div>
        </div>

        {/* Right column: Intel Stream (full height, beside map+chat) */}
        <div className="hidden lg:flex w-[380px] flex-shrink-0 flex-col overflow-hidden border-l"
          style={{ borderColor: 'var(--border-dim)' }}>
          <IntelStream />
        </div>
      </div>

      {/* Article modal overlay */}
      {articleUrl && <ArticleModal />}
    </div>
  );
}

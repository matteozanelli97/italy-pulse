'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';
import IconSidebar from './IconSidebar';
import LeftPanel from './LeftPanel';
import IntelStream from './IntelStream';
import LiveChat from './LiveChat';
import { useStore } from '@/lib/store';

const TacticalMap = dynamic(() => import('./TacticalMap'), { ssr: false });

export default function Dashboard() {
  const startPolling = useStore((s) => s.startPolling);
  const stopPolling = useStore((s) => s.stopPolling);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  return (
    <div className="flex h-screen w-screen flex-col" style={{ background: 'var(--bg-deepest)' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <IconSidebar />
        <LeftPanel />
        <TacticalMap />
        <IntelStream />
      </div>
      <LiveChat />
    </div>
  );
}

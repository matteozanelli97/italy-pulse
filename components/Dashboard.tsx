'use client';

import { useEffect, useState, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import TopBar from './TopBar';
import LeftPanel from './LeftPanel';
import IntelStream from './IntelStream';
import WebcamPreview from './WebcamPreview';
import { useStore } from '@/lib/store';

const CesiumMap = dynamic(() => import('./CesiumMap'), { ssr: false });

// Error boundary for WebGL / CesiumJS crashes
class MapBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: Error) { return { error: err.message }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex items-center justify-center" style={{ background: '#050810' }}>
          <div className="glass-panel rounded-xl p-8 max-w-md text-center space-y-3">
            <div className="font-mono text-[13px] font-bold uppercase tracking-wider" style={{ color: '#ef4444' }}>
              ERRORE WEBGL
            </div>
            <p className="text-[12px] font-mono" style={{ color: 'var(--text-dim)' }}>
              Rendering 3D fallito. Prova a ricaricare la pagina o usa un browser compatibile con WebGL.
            </p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {this.state.error}
            </p>
            <button onClick={() => this.setState({ error: null })}
              className="mt-3 px-4 py-1.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--border-medium)' }}>
              Riprova
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        {/* CesiumJS 3D Map — Italy locked */}
        <div className="flex-1 relative">
          <MapBoundary>
            <CesiumMap />
          </MapBoundary>
        </div>

        {/* Floating left data panel */}
        {showData && (
          <div className="absolute top-0 left-0 bottom-0 w-[360px] z-20 overflow-hidden border-r"
            style={{ background: 'rgba(16,20,27,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-dim)' }}>
            <LeftPanel />
          </div>
        )}

        {/* Floating right intel panel */}
        {showIntel && (
          <div className="absolute top-0 right-0 bottom-0 w-[380px] z-20 overflow-hidden border-l"
            style={{ background: 'rgba(16,20,27,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--border-dim)' }}>
            <IntelStream />
          </div>
        )}

        {/* Webcam dock */}
        {openWebcams.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <WebcamPreview />
          </div>
        )}
      </div>
    </div>
  );
}

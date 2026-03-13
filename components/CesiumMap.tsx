'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { ShaderMode } from '@/types';
import CesiumOverlays from './CesiumOverlays';

// Italy bounding box
const ITALY_BOUNDS = {
  west: 6.0,
  south: 35.0,
  east: 19.0,
  north: 47.5,
};

// Italy center
const ITALY_CENTER = {
  lng: 12.5,
  lat: 42.0,
};

// Italian POIs — keyboard shortcuts 1-8
const ITALIAN_POIS = [
  { id: 'colosseo', name: 'Colosseo', lat: 41.8902, lng: 12.4922, alt: 800, key: '1', description: 'Roma — Anfiteatro Flavio' },
  { id: 'duomo-milano', name: 'Duomo di Milano', lat: 45.4642, lng: 9.1900, alt: 600, key: '2', description: 'Milano — Cattedrale' },
  { id: 'palazzo-chigi', name: 'Palazzo Chigi', lat: 41.9009, lng: 12.4801, alt: 500, key: '3', description: 'Roma — Sede del Governo' },
  { id: 'san-marco', name: 'Piazza San Marco', lat: 45.4343, lng: 12.3388, alt: 500, key: '4', description: 'Venezia — Piazza principale' },
  { id: 'vesuvio', name: 'Vesuvio', lat: 40.8210, lng: 14.4260, alt: 5000, key: '5', description: 'Napoli — Vulcano attivo' },
  { id: 'ponte-vecchio', name: 'Ponte Vecchio', lat: 43.7680, lng: 11.2531, alt: 600, key: '6', description: 'Firenze — Ponte storico' },
  { id: 'valle-templi', name: 'Valle dei Templi', lat: 37.2901, lng: 13.5880, alt: 1500, key: '7', description: 'Agrigento — Sito archeologico' },
  { id: 'alberobello', name: 'Trulli di Alberobello', lat: 40.7837, lng: 17.2383, alt: 1000, key: '8', description: 'Puglia — Patrimonio UNESCO' },
] as const;

// Shader CSS filter presets
const SHADER_FILTERS: Record<ShaderMode, string> = {
  none: 'none',
  crt: 'contrast(1.15) saturate(0.8) brightness(0.95)',
  nvg: 'saturate(0) brightness(1.3) contrast(1.4) sepia(1) hue-rotate(80deg) saturate(3)',
  flir: 'saturate(0) brightness(0.9) contrast(1.6) sepia(1) hue-rotate(330deg) saturate(2.5)',
};

export default function CesiumMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [currentPoi, setCurrentPoi] = useState<string | null>(null);
  const shaderMode = useStore((s) => s.shaderSettings.mode);
  const setShaderMode = useStore((s) => s.setShaderMode);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const waitForCesium = () => {
      if (typeof Cesium === 'undefined') {
        setTimeout(waitForCesium, 100);
        return;
      }
      initCesium();
    };

    const initCesium = async () => {
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
      if (token) {
        Cesium.Ion.defaultAccessToken = token;
      }

      // Set base URL for Cesium assets
      window.CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/';

      const viewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        infoBox: false,
        creditContainer: document.createElement('div'), // hide credits overlay
        shadows: false,
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        contextOptions: {
          webgl: {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: true,
          },
        },
      });

      // Enable depth testing against terrain
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // Dark globe styling — dim everything outside Italy
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a0e17');
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#050810');

      // Try adding Google Photorealistic 3D Tiles
      try {
        const tileset = await Cesium.createGooglePhotorealistic3DTileset();
        viewer.scene.primitives.add(tileset);
      } catch (e) {
        console.warn('Google 3D Tiles not available, using default imagery:', e);
      }

      // Add Italy border highlight
      addItalyHighlight(viewer);

      // Fly to Italy on load
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(ITALY_CENTER.lng, ITALY_CENTER.lat, 2_000_000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-60),
          roll: 0,
        },
        duration: 2,
      });

      // Camera clamping — keep within Italy bounds (loosely)
      viewer.camera.changed.addEventListener(() => {
        const carto = viewer.camera.positionCartographic;
        const lng = Cesium.Math.toDegrees(carto.longitude);
        const lat = Cesium.Math.toDegrees(carto.latitude);

        // Soft clamp: if camera drifts too far, gently pull back
        const margin = 8; // degrees of margin outside Italy
        if (lng < ITALY_BOUNDS.west - margin || lng > ITALY_BOUNDS.east + margin ||
            lat < ITALY_BOUNDS.south - margin || lat > ITALY_BOUNDS.north + margin) {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(ITALY_CENTER.lng, ITALY_CENTER.lat, Math.max(carto.height, 500_000)),
            duration: 1,
          });
        }
      });

      viewerRef.current = viewer;
      setReady(true);
    };

    waitForCesium();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Add Italy border polygon
  const addItalyHighlight = useCallback((viewer: any) => {
    // Add a subtle glow rectangle around Italy
    viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(
          ITALY_BOUNDS.west, ITALY_BOUNDS.south,
          ITALY_BOUNDS.east, ITALY_BOUNDS.north
        ),
        material: Cesium.Color.fromCssColorString('rgba(45, 114, 210, 0.03)'),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('rgba(45, 114, 210, 0.25)'),
        outlineWidth: 2,
        height: 0,
      },
    });

    // Add dim overlay for rest of world (4 rectangles around Italy)
    const dimColor = Cesium.Color.fromCssColorString('rgba(5, 8, 16, 0.6)');
    const dimRects = [
      [-180, -90, 180, ITALY_BOUNDS.south - 2],     // south
      [-180, ITALY_BOUNDS.north + 2, 180, 90],       // north
      [-180, ITALY_BOUNDS.south - 2, ITALY_BOUNDS.west - 2, ITALY_BOUNDS.north + 2], // west
      [ITALY_BOUNDS.east + 2, ITALY_BOUNDS.south - 2, 180, ITALY_BOUNDS.north + 2],  // east
    ];
    dimRects.forEach(([w, s, e, n]) => {
      viewer.entities.add({
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(w, s, e, n),
          material: dimColor,
          height: 0,
        },
      });
    });
  }, []);

  // POI keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const poi = ITALIAN_POIS.find((p) => p.key === e.key);
      if (poi && viewerRef.current) {
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(poi.lng, poi.lat, poi.alt),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-35),
            roll: 0,
          },
          duration: 1.5,
        });
        setCurrentPoi(poi.id);
        setTimeout(() => setCurrentPoi(null), 3000);
      }

      // Shader mode shortcuts: Q=none, W=crt, E=nvg, R=flir
      if (e.key === 'q') setShaderMode('none');
      if (e.key === 'w') setShaderMode('crt');
      if (e.key === 'e') setShaderMode('nvg');
      if (e.key === 'r') setShaderMode('flir');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShaderMode]);

  // Active POI info
  const activePoi = ITALIAN_POIS.find((p) => p.id === currentPoi);

  return (
    <div className="relative w-full h-full" style={{ background: '#050810' }}>
      {/* Cesium container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          filter: SHADER_FILTERS[shaderMode],
          transition: 'filter 0.5s ease',
        }}
      />

      {/* Shader overlay effects */}
      {shaderMode === 'crt' && <CrtOverlay />}
      {shaderMode === 'nvg' && <NvgOverlay />}
      {shaderMode === 'flir' && <FlirOverlay />}

      {/* Loading state */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-20" style={{ background: '#050810' }}>
          <div className="text-center space-y-3">
            <div className="h-16 w-16 mx-auto rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] animate-pulse"
              style={{ color: 'var(--accent)' }}>
              INIZIALIZZAZIONE 3D ENGINE
            </p>
            <p className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
              Caricamento CesiumJS + Google 3D Tiles
            </p>
          </div>
        </div>
      )}

      {/* HUD Overlays */}
      {ready && (
        <>
          {/* Top-left: System status */}
          <div className="absolute top-3 left-3 z-10">
            <div className="glass-panel rounded-lg px-3 py-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full animate-glow-breathe" style={{ background: 'var(--green)' }} />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--green)' }}>
                  SISTEMA ATTIVO
                </span>
              </div>
              <div className="font-mono text-[8px]" style={{ color: 'var(--text-dim)' }}>
                SALA OPERATIVA — ITALIA
              </div>
            </div>
          </div>

          {/* Bottom-left: Shader controls */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="glass-panel rounded-lg px-2 py-1.5 flex items-center gap-1">
              {(['none', 'crt', 'nvg', 'flir'] as ShaderMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setShaderMode(mode)}
                  className="px-2 py-1 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: shaderMode === mode ? 'var(--accent-muted)' : 'transparent',
                    color: shaderMode === mode ? 'var(--accent)' : 'var(--text-dim)',
                    border: `1px solid ${shaderMode === mode ? 'var(--border-medium)' : 'transparent'}`,
                  }}
                >
                  {mode === 'none' ? 'STD' : mode.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom-right: POI shortcuts */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="glass-panel rounded-lg px-3 py-2">
              <div className="font-mono text-[8px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                POI [1-8] | SHADER [Q/W/E/R]
              </div>
              <div className="grid grid-cols-4 gap-1">
                {ITALIAN_POIS.map((poi) => (
                  <button
                    key={poi.id}
                    onClick={() => {
                      if (viewerRef.current) {
                        viewerRef.current.camera.flyTo({
                          destination: Cesium.Cartesian3.fromDegrees(poi.lng, poi.lat, poi.alt),
                          orientation: {
                            heading: Cesium.Math.toRadians(0),
                            pitch: Cesium.Math.toRadians(-35),
                            roll: 0,
                          },
                          duration: 1.5,
                        });
                        setCurrentPoi(poi.id);
                        setTimeout(() => setCurrentPoi(null), 3000);
                      }
                    }}
                    className="px-1.5 py-0.5 rounded text-[8px] font-mono transition-all text-center"
                    style={{
                      background: currentPoi === poi.id ? 'var(--accent-muted)' : 'rgba(255,255,255,0.03)',
                      color: currentPoi === poi.id ? 'var(--accent)' : 'var(--text-dim)',
                      border: `1px solid ${currentPoi === poi.id ? 'var(--border-medium)' : 'var(--border-dim)'}`,
                    }}
                    title={poi.description}
                  >
                    <span className="font-bold">{poi.key}</span>
                    <span className="block text-[7px] truncate">{poi.name.split(' ').pop()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* POI flyto notification */}
          {activePoi && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-slide-up">
              <div className="glass-panel rounded-lg px-4 py-2 text-center">
                <div className="font-display text-[16px] tracking-wider" style={{ color: 'var(--accent)' }}>
                  {activePoi.name.toUpperCase()}
                </div>
                <div className="font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
                  {activePoi.description}
                </div>
              </div>
            </div>
          )}

          {/* Compass / Coordinates HUD */}
          <CoordinatesHUD viewerRef={viewerRef} />

          {/* Map data overlays (seismic + flights) */}
          <CesiumOverlays viewerRef={viewerRef} ready={ready} />
        </>
      )}
    </div>
  );
}

// Coordinates HUD — shows camera position
function CoordinatesHUD({ viewerRef }: { viewerRef: React.RefObject<any> }) {
  const [coords, setCoords] = useState({ lat: 0, lng: 0, alt: 0, heading: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      if (!viewerRef.current) return;
      const cam = viewerRef.current.camera;
      const carto = cam.positionCartographic;
      if (carto) {
        setCoords({
          lat: Cesium.Math.toDegrees(carto.latitude),
          lng: Cesium.Math.toDegrees(carto.longitude),
          alt: carto.height,
          heading: Cesium.Math.toDegrees(cam.heading),
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [viewerRef]);

  const formatAlt = (alt: number) => {
    if (alt > 100_000) return `${(alt / 1000).toFixed(0)} km`;
    if (alt > 1000) return `${(alt / 1000).toFixed(1)} km`;
    return `${alt.toFixed(0)} m`;
  };

  return (
    <div className="absolute top-3 right-3 z-10">
      <div className="glass-panel rounded-lg px-3 py-2 font-mono text-[9px] tabular-nums space-y-0.5">
        <div style={{ color: 'var(--text-dim)' }}>
          LAT <span style={{ color: 'var(--text-secondary)' }}>{coords.lat.toFixed(4)}°</span>
        </div>
        <div style={{ color: 'var(--text-dim)' }}>
          LNG <span style={{ color: 'var(--text-secondary)' }}>{coords.lng.toFixed(4)}°</span>
        </div>
        <div style={{ color: 'var(--text-dim)' }}>
          ALT <span style={{ color: 'var(--text-secondary)' }}>{formatAlt(coords.alt)}</span>
        </div>
        <div style={{ color: 'var(--text-dim)' }}>
          HDG <span style={{ color: 'var(--text-secondary)' }}>{coords.heading.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}

// CRT Shader Overlay
function CrtOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Scanlines */}
      <div className="absolute inset-0" style={{
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, transparent 1px, transparent 3px)',
        mixBlendMode: 'multiply',
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
      }} />
      {/* Subtle flicker */}
      <div className="absolute inset-0" style={{
        background: 'rgba(255,200,100,0.02)',
        animation: 'ticker-flash 4s ease-in-out infinite',
      }} />
    </div>
  );
}

// NVG Shader Overlay
function NvgOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Green tint */}
      <div className="absolute inset-0" style={{
        background: 'rgba(74, 246, 38, 0.06)',
        mixBlendMode: 'screen',
      }} />
      {/* Film grain noise */}
      <div className="absolute inset-[-10%] opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation: 'film-grain 0.5s steps(4) infinite',
      }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,20,0,0.5) 100%)',
      }} />
    </div>
  );
}

// FLIR Shader Overlay
function FlirOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Thermal gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(128,0,255,0.04) 0%, rgba(255,60,0,0.04) 50%, rgba(255,255,0,0.03) 100%)',
        mixBlendMode: 'screen',
      }} />
      {/* Slight noise */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        animation: 'film-grain 0.8s steps(3) infinite',
      }} />
    </div>
  );
}

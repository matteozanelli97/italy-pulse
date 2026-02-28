'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '@/lib/store';
import { ITALY_CENTER, ITALY_ZOOM, ITALY_PITCH, ITALY_BEARING, ITALY_BOUNDS } from '@/lib/constants';
import { sounds } from '@/lib/sounds';
import type { ShaderMode } from '@/types';

const DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8, name: 'Italy Pulse Gotham',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png', 'https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png'],
      tileSize: 256, maxzoom: 19,
    },
    'carto-labels': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png', 'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'],
      tileSize: 256, maxzoom: 19,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#0D1117' } },
    { id: 'carto-dark', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.65, 'raster-saturation': -0.5, 'raster-brightness-max': 0.4 } },
    { id: 'carto-labels', type: 'raster', source: 'carto-labels', paint: { 'raster-opacity': 0.45 } },
  ],
};

const ITALY_BORDER_URL = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_country.geojson';
const ITALY_REGIONS_URL = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson';
const WORLD_OUTER: number[][] = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];

// Persistent marker store for smooth animations
type PersistentMarker = { marker: maplibregl.Marker; el: HTMLDivElement };

export default function TacticalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Persistent markers keyed by unique ID for smooth transitions
  const persistentRef = useRef<Map<string, PersistentMarker>>(new Map());
  const flyToTarget = useStore((s) => s.flyToTarget);
  const clearFlyTo = useStore((s) => s.clearFlyTo);
  const selectedMarkerId = useStore((s) => s.selectedMarkerId);
  const flights = useStore((s) => s.flights.data);
  const cyber = useStore((s) => s.cyber.data);
  const naval = useStore((s) => s.naval.data);
  const satellites = useStore((s) => s.satellites.data);
  const mapLayers = useStore((s) => s.mapLayers);
  const toggleMapLayer = useStore((s) => s.toggleMapLayer);
  const shaderSettings = useStore((s) => s.shaderSettings);
  const setShaderMode = useStore((s) => s.setShaderMode);
  const setShaderSetting = useStore((s) => s.setShaderSetting);
  const [markerCount, setMarkerCount] = useState(0);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current, style: DARK_STYLE,
      center: [ITALY_CENTER.lng, ITALY_CENTER.lat], zoom: ITALY_ZOOM,
      pitch: ITALY_PITCH, bearing: ITALY_BEARING,
      minZoom: 4, maxZoom: 16,
      maxBounds: [[ITALY_BOUNDS.west - 4, ITALY_BOUNDS.south - 2], [ITALY_BOUNDS.east + 4, ITALY_BOUNDS.north + 2]],
      fadeDuration: 300,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-right');

    map.on('load', async () => {
      try {
        const res = await fetch(ITALY_BORDER_URL);
        if (res.ok) {
          const geo = await res.json();
          map.addSource('italy-border', { type: 'geojson', data: geo });
          map.addLayer({ id: 'italy-land-fill', type: 'fill', source: 'italy-border', paint: { 'fill-color': '#121A21', 'fill-opacity': 0.15 } });
          map.addLayer({ id: 'italy-border-line', type: 'line', source: 'italy-border', paint: { 'line-color': 'rgba(45,114,210,0.20)', 'line-width': 1.5 } });
          const italyCoords = geo.features?.[0]?.geometry?.coordinates;
          if (italyCoords) {
            let holes: number[][][] = [];
            if (geo.features[0].geometry.type === 'MultiPolygon') {
              holes = italyCoords.map((poly: number[][][]) => poly[0]);
            } else if (italyCoords[0]) {
              holes = [italyCoords[0]];
            }
            const maskGeo: GeoJSON.Feature = {
              type: 'Feature', properties: {},
              geometry: { type: 'Polygon', coordinates: [WORLD_OUTER, ...holes] },
            };
            map.addSource('outside-mask', { type: 'geojson', data: maskGeo });
            map.addLayer({ id: 'outside-mask-fill', type: 'fill', source: 'outside-mask', paint: { 'fill-color': '#0D1117', 'fill-opacity': 0.80 } });
          }
        }
      } catch { /* optional */ }

      try {
        const res = await fetch(ITALY_REGIONS_URL);
        if (res.ok) {
          const geo = await res.json();
          map.addSource('italy-regions', { type: 'geojson', data: geo });
          map.addLayer({ id: 'italy-regions-line', type: 'line', source: 'italy-regions', paint: { 'line-color': 'rgba(45,114,210,0.08)', 'line-width': 0.7, 'line-dasharray': [4, 3] } });
        }
      } catch { /* optional */ }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 10, pitch: flyToTarget.pitch ?? 55,
      bearing: flyToTarget.bearing ?? 0, duration: 2000, essential: true,
    });
    clearFlyTo();
  }, [flyToTarget, clearFlyTo]);

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeIds = new Set<string>();
    let count = 0;

    // ── FLIGHTS ──
    if (mapLayers.flights) {
      flights.forEach((fl) => {
        const id = `fl-${fl.id}`;
        activeIds.add(id);
        const isMil = fl.type === 'military';
        const color = isMil ? '#EC9A3C' : '#4C90F0';
        const isSelected = selectedMarkerId === fl.id;
        const existing = persistentRef.current.get(id);

        if (existing) {
          // Smooth move — CSS transition handles the animation
          existing.marker.setLngLat([fl.longitude, fl.latitude]);
          existing.el.style.transform = `rotate(${fl.heading}deg)`;
          existing.el.style.filter = isSelected ? `drop-shadow(0 0 12px ${color})` : `drop-shadow(0 0 6px ${color}60)`;
        } else {
          const el = document.createElement('div');
          el.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L7 10H3L10 18L17 10H13L10 2Z" fill="${color}" fill-opacity="${isSelected ? '1' : '0.75'}" stroke="${isSelected ? '#fff' : color}" stroke-width="0.8"/></svg>`;
          el.style.cssText = `cursor:pointer;transform:rotate(${fl.heading}deg);transition:transform 2s ease;filter:drop-shadow(0 0 6px ${color}60);`;
          if (isSelected) el.style.filter = `drop-shadow(0 0 12px ${color})`;
          el.addEventListener('click', () => sounds.marker());
          el.addEventListener('mouseenter', () => sounds.hover());
          const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
            .setLngLat([fl.longitude, fl.latitude])
            .setPopup(new maplibregl.Popup({ offset: 14, maxWidth: '260px' }).setHTML(
              popupHtml(color, `${fl.callsign} <span style="font-size:9px;opacity:0.6">${fl.type.toUpperCase()}</span>`, `${fl.origin} → ${fl.destination || '???'}`,
                `ALT: ${Math.round(fl.altitude)}ft | SPD: ${Math.round(fl.speed)}kts | HDG: ${Math.round(fl.heading)}°` + (fl.squawk ? `<br/><span style="color:#E76A6E;font-weight:bold">SQUAWK: ${fl.squawk}</span>` : ''))
            )).addTo(map);
          persistentRef.current.set(id, { marker, el });
        }
        count++;
      });
    }

    // ── NAVAL ──
    if (mapLayers.naval) {
      naval.forEach((nv) => {
        const id = `nv-${nv.id}`;
        activeIds.add(id);
        const color = nv.type === 'military' ? '#4C90F0' : '#5F6B7C';
        const existing = persistentRef.current.get(id);

        if (existing) {
          existing.marker.setLngLat([nv.longitude, nv.latitude]);
        } else {
          const el = document.createElement('div');
          el.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L3 8H6V14H10V8H13L8 2Z" fill="${color}" fill-opacity="0.7" stroke="${color}" stroke-width="0.8"/></svg>`;
          el.style.cssText = 'cursor:pointer;transition:transform 2s ease;';
          el.addEventListener('mouseenter', () => sounds.hover());
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([nv.longitude, nv.latitude])
            .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '240px' }).setHTML(
              popupHtml(color, nv.name, `${nv.type.toUpperCase()} · ${nv.flag}`, `DEST: ${nv.destination} | SPD: ${nv.speed.toFixed(1)}kn | MMSI: ${nv.mmsi}`)
            )).addTo(map);
          persistentRef.current.set(id, { marker, el });
        }
        count++;
      });
    }

    // ── CYBER ──
    if (mapLayers.cyber) {
      cyber.filter((c) => c.latitude && c.longitude).forEach((ct) => {
        const id = `cy-${ct.id}`;
        activeIds.add(id);
        const color = ct.severity === 'critical' ? '#CD4246' : ct.severity === 'high' ? '#E76A6E' : '#4C90F0';
        const existing = persistentRef.current.get(id);

        if (!existing) {
          const el = document.createElement('div');
          el.style.cssText = `width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}80;cursor:pointer;`;
          el.addEventListener('click', () => sounds.alert());
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([ct.longitude!, ct.latitude!])
            .setPopup(new maplibregl.Popup({ offset: 10, maxWidth: '260px' }).setHTML(
              popupHtml(color, ct.type.toUpperCase(), ct.description, `${ct.sourceIP} (${ct.sourceCountry}) → ${ct.targetSector}`)
            )).addTo(map);
          persistentRef.current.set(id, { marker, el });
        }
        count++;
      });
    }

    // ── SATELLITES ──
    if (mapLayers.satellites) {
      satellites.forEach((sat) => {
        const id = `sat-${sat.noradId}`;
        activeIds.add(id);
        const existing = persistentRef.current.get(id);

        if (existing) {
          existing.marker.setLngLat([sat.longitude, sat.latitude]);
        } else {
          const el = document.createElement('div');
          el.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5" fill="#fff" fill-opacity="0.9"/><circle cx="8" cy="8" r="6" fill="none" stroke="#4C90F0" stroke-width="0.5" stroke-opacity="0.35"/></svg>`;
          el.style.cssText = 'cursor:pointer;filter:drop-shadow(0 0 4px rgba(45,114,210,0.4));transition:transform 2s ease;';
          el.addEventListener('mouseenter', () => sounds.hover());
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([sat.longitude, sat.latitude])
            .setPopup(new maplibregl.Popup({ offset: 10, maxWidth: '260px' }).setHTML(
              popupHtml('#4C90F0', sat.name, `${sat.type.toUpperCase()} · ${sat.country}`, `NORAD: ${sat.noradId} | ALT: ${Math.round(sat.altitude)}km | V: ${sat.velocity.toFixed(1)}km/s`)
            )).addTo(map);
          persistentRef.current.set(id, { marker, el });
        }
        count++;
      });
    }

    // Remove stale markers (no longer in data or layer disabled)
    persistentRef.current.forEach((pm, id) => {
      if (!activeIds.has(id)) {
        pm.marker.remove();
        persistentRef.current.delete(id);
      }
    });

    setMarkerCount(count);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flights, cyber, naval, satellites, selectedMarkerId, mapLayers]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  const shaderClass = shaderSettings.mode !== 'none' ? `shader-${shaderSettings.mode}` : '';

  return (
    <div className="relative flex-1 h-full">
      <div ref={containerRef} className={`absolute inset-0 ${shaderClass}`}
        style={{
          filter: [
            shaderSettings.pixelation > 0 ? `blur(${shaderSettings.pixelation}px)` : '',
            shaderSettings.bloom > 0 ? `brightness(${1 + shaderSettings.bloom * 0.5})` : '',
            shaderSettings.sharpening > 0 ? `contrast(${1 + shaderSettings.sharpening * 0.3})` : '',
          ].filter(Boolean).join(' ') || undefined,
        }}
      />

      {/* Edge vignette */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-x-0 top-0 h-20" style={{ background: 'linear-gradient(to bottom, var(--bg-deepest), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, var(--bg-deepest), transparent)' }} />
        <div className="absolute inset-y-0 left-0 w-12" style={{ background: 'linear-gradient(to right, var(--bg-deepest), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-12" style={{ background: 'linear-gradient(to left, var(--bg-deepest), transparent)' }} />
      </div>

      {/* Layer controls */}
      <div className="absolute top-3 left-3 z-[2] glass-panel flex items-center gap-2 rounded-lg px-3 py-2">
        <span className="mr-1 font-mono text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Layer</span>
        {(['flights', 'naval', 'cyber', 'satellites'] as const).map((layer) => (
          <button key={layer} onClick={() => { toggleMapLayer(layer); sounds.toggle(); }}
            className={`layer-btn text-[9px] px-2 py-0.5 ${mapLayers[layer] ? 'active' : ''}`}>
            {layer === 'flights' ? 'Voli' : layer === 'naval' ? 'Navi' : layer === 'satellites' ? 'Sat' : 'Cyber'}
          </button>
        ))}
      </div>

      {/* Sensor mode */}
      <div className="absolute top-3 right-3 z-[2]">
        <button onClick={() => { setShowControls(!showControls); sounds.click(); }}
          className="glass-panel rounded-lg px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider"
          style={{ color: shaderSettings.mode !== 'none' ? 'var(--accent)' : 'var(--text-dim)' }}>
          SENSOR {shaderSettings.mode !== 'none' ? `[${shaderSettings.mode.toUpperCase()}]` : 'OFF'}
        </button>
        {showControls && (
          <div className="glass-panel mt-1.5 rounded-lg p-3.5 space-y-2.5" style={{ width: 220 }}>
            <div className="font-mono text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>Sensor Mode</div>
            <div className="flex gap-1.5">
              {(['none', 'crt', 'nvg', 'flir'] as ShaderMode[]).map((mode) => (
                <button key={mode} onClick={() => { setShaderMode(mode); sounds.toggle(); }}
                  className={`layer-btn text-[8px] px-2.5 py-0.5 ${shaderSettings.mode === mode ? 'active' : ''}`}>
                  {mode === 'none' ? 'OFF' : mode.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-1.5">
              <SliderCtrl label="Sensitivity" value={shaderSettings.sensitivity} onChange={(v) => setShaderSetting('sensitivity', v)} />
              <SliderCtrl label="Pixelation" value={shaderSettings.pixelation} onChange={(v) => setShaderSetting('pixelation', v)} max={5} />
              <SliderCtrl label="Bloom" value={shaderSettings.bloom} onChange={(v) => setShaderSetting('bloom', v)} />
              <SliderCtrl label="Sharpening" value={shaderSettings.sharpening} onChange={(v) => setShaderSetting('sharpening', v)} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD telemetry */}
      <div className="absolute bottom-3 left-3 z-[2] glass-panel rounded-lg px-3.5 py-2">
        <div className="flex items-center gap-3 font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
          <span style={{ color: 'var(--accent)' }}>3D TACTICAL VIEW</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>MRK: <span style={{ color: '#fff' }}>{markerCount}</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>REGIONI: <span style={{ color: '#fff' }}>20</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>PITCH: <span style={{ color: '#fff' }}>{ITALY_PITCH}°</span></span>
          {shaderSettings.mode !== 'none' && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span style={{ color: shaderSettings.mode === 'nvg' ? 'var(--nvg-green)' : 'var(--accent)' }}>SENSOR: {shaderSettings.mode.toUpperCase()}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-14 z-[2] glass-panel rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-3 font-mono text-[8px]">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#4C90F0', boxShadow: '0 0 6px #4C90F0' }} /><span style={{ color: 'var(--text-dim)' }}>CIV</span></span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#EC9A3C', boxShadow: '0 0 6px #EC9A3C' }} /><span style={{ color: 'var(--text-dim)' }}>MIL</span></span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#fff', boxShadow: '0 0 6px rgba(45,114,210,0.4)' }} /><span style={{ color: 'var(--text-dim)' }}>SAT</span></span>
        </div>
      </div>
    </div>
  );
}

function popupHtml(color: string, title: string, subtitle: string, telemetry: string): string {
  return `<div style="font-family:'JetBrains Mono',monospace"><div style="color:${color};font-size:13px;font-weight:bold;margin-bottom:3px">${title}</div><div style="color:#ABB3BF;font-size:11px">${subtitle}</div><div style="color:#738091;font-size:10px;margin-top:4px;line-height:1.5">${telemetry}</div></div>`;
}

function SliderCtrl({ label, value, onChange, max = 1 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[8px] mb-0.5">
        <span style={{ color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ color: '#fff' }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min="0" max={max} step="0.01" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--accent) ${(value / max) * 100}%, var(--bg-card) ${(value / max) * 100}%)` }} />
    </div>
  );
}

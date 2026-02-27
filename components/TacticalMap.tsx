'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '@/lib/store';
import { ITALY_CENTER, ITALY_ZOOM, ITALY_PITCH, ITALY_BEARING, ITALY_BOUNDS, SEVERITY_COLORS } from '@/lib/constants';
import type { ShaderMode } from '@/types';

const DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8, name: 'Italy Pulse Dark',
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
    { id: 'background', type: 'background', paint: { 'background-color': '#040608' } },
    { id: 'carto-dark', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.80, 'raster-saturation': -0.3 } },
    { id: 'carto-labels', type: 'raster', source: 'carto-labels', paint: { 'raster-opacity': 0.6 } },
  ],
};

const ITALY_BORDER_URL = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_country.geojson';
const ITALY_REGIONS_URL = 'https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson';

// Mask: darken everything outside Italy
const WORLD_BOUNDS_WITH_HOLE = {
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]],
  },
};

export default function TacticalMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const flyToTarget = useStore((s) => s.flyToTarget);
  const clearFlyTo = useStore((s) => s.clearFlyTo);
  const selectedMarkerId = useStore((s) => s.selectedMarkerId);
  const earthquakes = useStore((s) => s.seismic.data);
  const weather = useStore((s) => s.weather.data);
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

  // Init map
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
      // Italy border + mask outside
      try {
        const res = await fetch(ITALY_BORDER_URL);
        if (res.ok) {
          const geo = await res.json();
          map.addSource('italy-border', { type: 'geojson', data: geo });
          map.addLayer({ id: 'italy-border-fill', type: 'fill', source: 'italy-border', paint: { 'fill-color': 'rgba(59,130,246,0.03)' } });
          map.addLayer({ id: 'italy-border-line', type: 'line', source: 'italy-border', paint: { 'line-color': 'rgba(59,130,246,0.25)', 'line-width': 2 } });

          // Create mask: darken outside Italy
          const italyCoords = geo.features?.[0]?.geometry?.coordinates;
          if (italyCoords) {
            const maskGeo = { ...WORLD_BOUNDS_WITH_HOLE };
            // Add Italy boundary as hole
            if (geo.features[0].geometry.type === 'MultiPolygon') {
              maskGeo.geometry.coordinates = [maskGeo.geometry.coordinates[0], ...italyCoords.map((poly: number[][][]) => poly[0])];
            } else if (italyCoords[0]) {
              maskGeo.geometry.coordinates = [maskGeo.geometry.coordinates[0], italyCoords[0]];
            }
            map.addSource('outside-mask', { type: 'geojson', data: maskGeo as GeoJSON.Feature });
            map.addLayer({ id: 'outside-mask-fill', type: 'fill', source: 'outside-mask', paint: { 'fill-color': '#020304', 'fill-opacity': 0.7 } });
          }
        }
      } catch { /* optional */ }

      // Regional borders
      try {
        const res = await fetch(ITALY_REGIONS_URL);
        if (res.ok) {
          const geo = await res.json();
          map.addSource('italy-regions', { type: 'geojson', data: geo });
          map.addLayer({ id: 'italy-regions-line', type: 'line', source: 'italy-regions', paint: { 'line-color': 'rgba(59,130,246,0.10)', 'line-width': 0.8, 'line-dasharray': [4, 3] } });
        }
      } catch { /* optional */ }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // FlyTo
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 10, pitch: flyToTarget.pitch ?? 55,
      bearing: flyToTarget.bearing ?? 0, duration: 2000, essential: true,
    });
    clearFlyTo();
  }, [flyToTarget, clearFlyTo]);

  // Update markers
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    let count = 0;

    // Earthquakes
    if (mapLayers.seismic) {
      earthquakes.forEach((eq) => {
        const sev = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
        const color = SEVERITY_COLORS[sev];
        const size = Math.max(10, eq.magnitude * 4);
        const isSelected = selectedMarkerId === eq.id;
        const el = document.createElement('div');
        el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${isSelected ? '#fff' : color};opacity:0.75;box-shadow:0 0 ${isSelected ? '20' : '8'}px ${color}80;cursor:pointer;transition:all 0.3s;`;
        if (isSelected) el.style.transform = 'scale(1.5)';
        if (eq.magnitude >= 3.0) {
          const ring = document.createElement('div');
          ring.style.cssText = `position:absolute;top:50%;left:50%;width:${size * 2}px;height:${size * 2}px;border-radius:50%;border:1px solid ${color};transform:translate(-50%,-50%);animation:pulse-ring 2s ease-out infinite;pointer-events:none;`;
          el.style.position = 'relative';
          el.appendChild(ring);
        }
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([eq.longitude, eq.latitude])
          .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '260px' }).setHTML(
            `<div><div style="color:${color};font-size:14px;font-weight:bold">M ${eq.magnitude.toFixed(1)} <span style="font-size:10px;opacity:0.6">${eq.magnitudeType}</span></div><div style="color:#9bafc8">${eq.description || 'Zona non specificata'}</div><div style="color:#6b7f99;font-size:10px">Prof: ${eq.depth.toFixed(1)}km · ${new Date(eq.time).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</div></div>`
          )).addTo(map);
        markersRef.current.push(marker); count++;
      });
    }

    // Flights
    if (mapLayers.flights) {
      flights.forEach((fl) => {
        const isMil = fl.type === 'military';
        const color = isMil ? '#f97316' : '#3b82f6'; // Orange for military per spec
        const isSelected = selectedMarkerId === fl.id;
        const el = document.createElement('div');
        el.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2L7 10H3L10 18L17 10H13L10 2Z" fill="${color}" fill-opacity="${isSelected ? '1' : '0.7'}" stroke="${isSelected ? '#fff' : color}" stroke-width="1"/></svg>`;
        el.style.cssText = `cursor:pointer;transform:rotate(${fl.heading}deg);transition:transform 0.5s;${isSelected ? 'filter:drop-shadow(0 0 8px ' + color + ');' : ''}`;
        const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
          .setLngLat([fl.longitude, fl.latitude])
          .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '240px' }).setHTML(
            `<div><div style="font-weight:bold;color:${color}">${fl.callsign} <span style="font-size:9px;opacity:0.6">${fl.type.toUpperCase()}</span></div><div style="color:#9bafc8">${fl.origin} → ${fl.destination || '???'}</div><div style="color:#6b7f99;font-size:10px">ALT: ${Math.round(fl.altitude)}ft · SPD: ${Math.round(fl.speed)}kts · HDG: ${Math.round(fl.heading)}°</div>${fl.squawk ? `<div style="color:#ef4444;font-size:10px;font-weight:bold">SQUAWK: ${fl.squawk}</div>` : ''}</div>`
          )).addTo(map);
        markersRef.current.push(marker); count++;
      });
    }

    // Naval
    if (mapLayers.naval) {
      naval.forEach((nv) => {
        const color = nv.type === 'military' ? '#60a5fa' : '#3d4f65';
        const el = document.createElement('div');
        el.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2L3 8H6V14H10V8H13L8 2Z" fill="${color}" fill-opacity="0.6" stroke="${color}" stroke-width="1"/></svg>`;
        el.style.cssText = 'cursor:pointer;';
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([nv.longitude, nv.latitude])
          .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '220px' }).setHTML(
            `<div><div style="font-weight:bold;color:#60a5fa">${nv.name}</div><div style="color:#9bafc8">${nv.type.toUpperCase()} · ${nv.flag}</div><div style="color:#6b7f99;font-size:10px">→ ${nv.destination} · ${nv.speed.toFixed(1)}kn · MMSI: ${nv.mmsi}</div></div>`
          )).addTo(map);
        markersRef.current.push(marker); count++;
      });
    }

    // Cyber
    if (mapLayers.cyber) {
      cyber.filter((c) => c.latitude && c.longitude).forEach((ct) => {
        const color = ct.severity === 'critical' ? '#dc2626' : ct.severity === 'high' ? '#ef4444' : '#3b82f6';
        const el = document.createElement('div');
        el.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}60;cursor:pointer;`;
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([ct.longitude!, ct.latitude!])
          .setPopup(new maplibregl.Popup({ offset: 8, maxWidth: '240px' }).setHTML(
            `<div><div style="font-weight:bold;color:${color}">${ct.type.toUpperCase()}</div><div style="color:#9bafc8">${ct.description}</div><div style="color:#6b7f99;font-size:10px">${ct.sourceIP} (${ct.sourceCountry}) → ${ct.targetSector}</div></div>`
          )).addTo(map);
        markersRef.current.push(marker); count++;
      });
    }

    // Satellites
    if (mapLayers.satellites) {
      satellites.forEach((sat) => {
        const typeColors: Record<string, string> = {
          communication: '#3b82f6', weather: '#f59e0b', navigation: '#10b981',
          military: '#ef4444', science: '#8b5cf6', other: '#64748b',
        };
        const color = typeColors[sat.type] || '#64748b';
        const el = document.createElement('div');
        el.innerHTML = `<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" fill="${color}" fill-opacity="0.8"/><circle cx="8" cy="8" r="6" fill="none" stroke="${color}" stroke-width="0.5" stroke-opacity="0.4"/></svg>`;
        el.style.cssText = 'cursor:pointer;';
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([sat.longitude, sat.latitude])
          .setPopup(new maplibregl.Popup({ offset: 8, maxWidth: '240px' }).setHTML(
            `<div><div style="font-weight:bold;color:${color}">${sat.name}</div><div style="color:#9bafc8">${sat.type.toUpperCase()} · ${sat.country}</div><div style="color:#6b7f99;font-size:10px">NORAD: ${sat.noradId} · ALT: ${Math.round(sat.altitude)}km · V: ${sat.velocity.toFixed(1)}km/s</div></div>`
          )).addTo(map);
        markersRef.current.push(marker); count++;
      });
    }

    setMarkerCount(count);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earthquakes, flights, cyber, naval, satellites, selectedMarkerId, mapLayers]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  // Shader class
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

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-x-0 top-0 h-16" style={{ background: 'linear-gradient(to bottom, var(--bg-deepest), transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, var(--bg-deepest), transparent)' }} />
        <div className="absolute inset-y-0 left-0 w-8" style={{ background: 'linear-gradient(to right, var(--bg-deepest), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-8" style={{ background: 'linear-gradient(to left, var(--bg-deepest), transparent)' }} />
      </div>

      {/* Layer controls */}
      <div className="absolute top-3 left-3 z-[2] flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
        style={{ background: 'rgba(4,6,8,0.92)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-panel)', backdropFilter: 'blur(8px)' }}>
        <span className="mr-1 text-[7px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Layer</span>
        {(['seismic', 'flights', 'naval', 'cyber', 'satellites'] as const).map((layer) => (
          <button key={layer} onClick={() => toggleMapLayer(layer)}
            className={`layer-btn text-[8px] px-2 py-0.5 ${mapLayers[layer] ? 'active' : ''}`}>
            {layer === 'seismic' ? 'Sisma' : layer === 'flights' ? 'Voli' : layer === 'naval' ? 'Navi' : layer === 'satellites' ? 'Sat' : 'Cyber'}
          </button>
        ))}
      </div>

      {/* Sensor Mode / Shader controls */}
      <div className="absolute top-3 right-3 z-[2]">
        <button onClick={() => setShowControls(!showControls)}
          className="rounded-lg px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wider"
          style={{ background: 'rgba(4,6,8,0.92)', border: '1px solid var(--border-subtle)', color: shaderSettings.mode !== 'none' ? 'var(--blue-400)' : 'var(--text-dim)', boxShadow: 'var(--shadow-panel)' }}>
          SENSOR {shaderSettings.mode !== 'none' ? `[${shaderSettings.mode.toUpperCase()}]` : 'OFF'}
        </button>

        {showControls && (
          <div className="mt-1 rounded-lg p-3 space-y-2"
            style={{ background: 'rgba(4,6,8,0.95)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-elevated)', backdropFilter: 'blur(8px)', width: 200 }}>
            <div className="text-[7px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-muted)' }}>Sensor Mode</div>
            <div className="flex gap-1">
              {(['none', 'crt', 'nvg', 'flir'] as ShaderMode[]).map((mode) => (
                <button key={mode} onClick={() => setShaderMode(mode)}
                  className={`layer-btn text-[7px] px-2 py-0.5 ${shaderSettings.mode === mode ? 'active' : ''}`}>
                  {mode === 'none' ? 'OFF' : mode.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 pt-1">
              <SliderControl label="Sensitivity" value={shaderSettings.sensitivity} onChange={(v) => setShaderSetting('sensitivity', v)} />
              <SliderControl label="Pixelation" value={shaderSettings.pixelation} onChange={(v) => setShaderSetting('pixelation', v)} max={5} />
              <SliderControl label="Bloom" value={shaderSettings.bloom} onChange={(v) => setShaderSetting('bloom', v)} />
              <SliderControl label="Sharpening" value={shaderSettings.sharpening} onChange={(v) => setShaderSetting('sharpening', v)} />
            </div>
          </div>
        )}
      </div>

      {/* HUD */}
      <div className="absolute bottom-3 left-3 z-[2] rounded-md px-2.5 py-1.5" style={{ background: 'rgba(4,6,8,0.92)', border: '1px solid var(--border-dim)' }}>
        <div className="flex items-center gap-3 text-[8px]" style={{ color: 'var(--text-dim)' }}>
          <span>3D TACTICAL VIEW</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>MRK: {markerCount}</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>REGIONI: 20</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>PITCH: {ITALY_PITCH}°</span>
          {shaderSettings.mode !== 'none' && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span style={{ color: 'var(--blue-400)' }}>SENSOR: {shaderSettings.mode.toUpperCase()}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderControl({ label, value, onChange, max = 1 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div>
      <div className="flex justify-between text-[7px] mb-0.5">
        <span style={{ color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ color: 'var(--text-secondary)' }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min="0" max={max} step="0.01" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, var(--blue-500) ${(value / max) * 100}%, var(--bg-card) ${(value / max) * 100}%)` }} />
    </div>
  );
}

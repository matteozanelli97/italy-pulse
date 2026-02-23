'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useStore } from '@/lib/store';
import { ITALY_CENTER, ITALY_ZOOM, ITALY_PITCH, ITALY_BEARING, ITALY_BOUNDS, SEVERITY_COLORS } from '@/lib/constants';

const DARK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: 'Italy Pulse Dark',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png', 'https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxzoom: 19,
    },
    'carto-labels': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png', 'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#030303' } },
    { id: 'carto-dark', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.85 } },
    { id: 'carto-labels', type: 'raster', source: 'carto-labels', paint: { 'raster-opacity': 0.7 } },
  ],
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

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: [ITALY_CENTER.lng, ITALY_CENTER.lat],
      zoom: ITALY_ZOOM,
      pitch: ITALY_PITCH,
      bearing: ITALY_BEARING,
      minZoom: 4,
      maxZoom: 14,
      maxBounds: [
        [ITALY_BOUNDS.west - 4, ITALY_BOUNDS.south - 2],
        [ITALY_BOUNDS.east + 4, ITALY_BOUNDS.north + 2],
      ],
      fadeDuration: 300,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }), 'bottom-right');

    // Load Italy GeoJSON border on map ready
    map.on('load', async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_country.geojson');
        if (res.ok) {
          const geo = await res.json();
          map.addSource('italy-border', { type: 'geojson', data: geo });
          map.addLayer({
            id: 'italy-border-fill',
            type: 'fill',
            source: 'italy-border',
            paint: { 'fill-color': 'rgba(59, 130, 246, 0.03)', 'fill-opacity': 1 },
          });
          map.addLayer({
            id: 'italy-border-line',
            type: 'line',
            source: 'italy-border',
            paint: { 'line-color': 'rgba(59, 130, 246, 0.2)', 'line-width': 1.5 },
          });
        }
      } catch { /* optional */ }
    });

    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Handle flyTo from store
  useEffect(() => {
    if (!flyToTarget || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 10,
      pitch: flyToTarget.pitch ?? 55,
      bearing: flyToTarget.bearing ?? 0,
      duration: 2000,
      essential: true,
    });
    clearFlyTo();
  }, [flyToTarget, clearFlyTo]);

  // Build markers on data change
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Earthquake markers
    earthquakes.forEach((eq) => {
      const sev = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
      const color = SEVERITY_COLORS[sev];
      const size = Math.max(10, eq.magnitude * 4);
      const isSelected = selectedMarkerId === eq.id;

      const el = document.createElement('div');
      el.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid ${isSelected ? '#fff' : color};opacity:0.75;box-shadow:0 0 ${isSelected ? '20' : '8'}px ${color}80;cursor:pointer;transition:all 0.3s;`;
      if (isSelected) el.style.transform = 'scale(1.5)';

      // Pulse ring for significant quakes
      if (eq.magnitude >= 3.0) {
        const ring = document.createElement('div');
        ring.style.cssText = `position:absolute;top:50%;left:50%;width:${size * 2}px;height:${size * 2}px;border-radius:50%;border:1px solid ${color};transform:translate(-50%,-50%);animation:pulse-ring 2s ease-out infinite;pointer-events:none;`;
        el.style.position = 'relative';
        el.appendChild(ring);
      }

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([eq.longitude, eq.latitude])
        .setPopup(new maplibregl.Popup({ offset: 12, closeButton: true, maxWidth: '260px' }).setHTML(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6">
            <div style="color:${color};font-size:14px;font-weight:bold;margin-bottom:4px">M ${eq.magnitude.toFixed(1)} <span style="font-size:10px;opacity:0.6">${eq.magnitudeType}</span></div>
            <div style="color:#94a3b8">${eq.description || 'Zona non specificata'}</div>
            <div style="color:#64748b;font-size:10px;margin-top:2px">Profondità: ${eq.depth.toFixed(1)} km</div>
            <div style="color:#64748b;font-size:10px">${new Date(eq.time).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</div>
          </div>`
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Weather markers
    weather.forEach((w) => {
      const el = document.createElement('div');
      const tempColor = w.alertLevel === 'warning' ? '#ef4444' : w.alertLevel === 'watch' ? '#f59e0b' : '#3b82f6';
      el.innerHTML = `<div style="font-family:'JetBrains Mono',monospace;text-align:center;line-height:1.1;filter:drop-shadow(0 0 4px ${tempColor}30);">
        <div style="font-size:12px;font-weight:700;color:${tempColor}">${Math.round(w.temperature)}°</div>
        <div style="font-size:8px;color:#64748b;margin-top:1px">${w.city}</div>
      </div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([w.longitude, w.latitude])
        .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '220px' }).setHTML(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6">
            <div style="font-weight:bold;color:#e2e8f0">${w.city}</div>
            <div style="color:#94a3b8">${w.weatherDescription} · ${Math.round(w.temperature)}°C</div>
            <div style="color:#64748b;font-size:10px">Umidità: ${w.humidity}% · Vento: ${w.windSpeed.toFixed(0)} km/h</div>
          </div>`
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Flight markers
    flights.forEach((fl) => {
      const isMil = fl.type === 'military';
      const color = isMil ? '#ef4444' : '#3b82f6';
      const isSelected = selectedMarkerId === fl.id;

      const el = document.createElement('div');
      el.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L7 10H3L10 18L17 10H13L10 2Z" fill="${color}" fill-opacity="${isSelected ? '1' : '0.7'}" stroke="${isSelected ? '#fff' : color}" stroke-width="1"/>
      </svg>`;
      el.style.cssText = `cursor:pointer;transform:rotate(${fl.heading}deg);transition:transform 0.5s;${isSelected ? 'filter:drop-shadow(0 0 8px ' + color + ');' : ''}`;

      const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
        .setLngLat([fl.longitude, fl.latitude])
        .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '240px' }).setHTML(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6">
            <div style="font-weight:bold;color:${color}">${fl.callsign} <span style="font-size:9px;opacity:0.6">${fl.type.toUpperCase()}</span></div>
            <div style="color:#94a3b8">${fl.origin} → ${fl.destination}</div>
            <div style="color:#64748b;font-size:10px">ALT: ${Math.round(fl.altitude)}ft · SPD: ${Math.round(fl.speed)}kts · HDG: ${Math.round(fl.heading)}°</div>
            ${fl.squawk ? `<div style="color:#ef4444;font-size:10px;font-weight:bold">SQUAWK: ${fl.squawk}</div>` : ''}
          </div>`
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Naval markers
    naval.forEach((nv) => {
      const isMil = nv.type === 'military';
      const color = isMil ? '#60a5fa' : '#334155';
      const isSelected = selectedMarkerId === nv.id;

      const el = document.createElement('div');
      el.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L3 8H6V14H10V8H13L8 2Z" fill="${color}" fill-opacity="0.6" stroke="${isSelected ? '#93bbfd' : color}" stroke-width="1"/>
      </svg>`;
      el.style.cssText = `cursor:pointer;${isSelected ? 'filter:drop-shadow(0 0 8px #3b82f6);' : ''}`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([nv.longitude, nv.latitude])
        .setPopup(new maplibregl.Popup({ offset: 12, maxWidth: '220px' }).setHTML(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6">
            <div style="font-weight:bold;color:#60a5fa">${nv.name}</div>
            <div style="color:#94a3b8">${nv.type.toUpperCase()} · ${nv.flag}</div>
            <div style="color:#64748b;font-size:10px">→ ${nv.destination} · ${nv.speed.toFixed(1)}kn</div>
            <div style="color:#64748b;font-size:10px">MMSI: ${nv.mmsi}</div>
          </div>`
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Cyber markers (only those with coordinates)
    cyber.filter((c) => c.latitude && c.longitude).forEach((ct) => {
      const color = ct.severity === 'critical' ? '#dc2626' : ct.severity === 'high' ? '#ef4444' : '#3b82f6';

      const el = document.createElement('div');
      el.style.cssText = `width:8px;height:8px;border-radius:50%;background:${color};border:1px solid ${color};box-shadow:0 0 6px ${color}60;cursor:pointer;`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([ct.longitude!, ct.latitude!])
        .setPopup(new maplibregl.Popup({ offset: 8, maxWidth: '240px' }).setHTML(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6">
            <div style="font-weight:bold;color:${color}">${ct.type.toUpperCase()}</div>
            <div style="color:#94a3b8">${ct.description}</div>
            <div style="color:#64748b;font-size:10px">${ct.sourceIP} (${ct.sourceCountry}) → ${ct.targetSector}</div>
          </div>`
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [earthquakes, weather, flights, cyber, naval, selectedMarkerId]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  return (
    <div className="relative flex-1 h-full">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Gradient vignette edges */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-x-0 top-0 h-16" style={{ background: 'linear-gradient(to bottom, #030303, transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(to top, #030303, transparent)' }} />
        <div className="absolute inset-y-0 left-0 w-8" style={{ background: 'linear-gradient(to right, #030303, transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-8" style={{ background: 'linear-gradient(to left, #030303, transparent)' }} />
      </div>

      {/* Coordinate HUD */}
      <div className="absolute bottom-3 left-3 z-[2] rounded-md px-2.5 py-1.5" style={{ background: 'rgba(3,3,3,0.9)', border: '1px solid var(--border-dim)' }}>
        <div className="flex items-center gap-3 font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
          <span>3D TACTICAL VIEW</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>MRK: {earthquakes.length + weather.length + flights.length + naval.length}</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>PITCH: {ITALY_PITCH}°</span>
        </div>
      </div>
    </div>
  );
}

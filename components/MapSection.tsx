'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ITALY_CENTER, ITALY_ZOOM, SEVERITY_COLORS } from '@/lib/constants';
import type { SeismicEvent, WeatherData, AirQualityStation } from '@/types';

interface MapSectionProps {
  earthquakes: SeismicEvent[];
  weather: WeatherData[];
  airQuality: AirQualityStation[];
}

type MapLayer = 'traffic' | 'meteo' | 'radar' | 'satellite';

export default function MapSection({ earthquakes, weather, airQuality }: MapSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null);
  const markersLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const [activeLayers, setActiveLayers] = useState<Set<MapLayer>>(new Set(['traffic']));

  const toggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        await new Promise((r) => { link.onload = r; });
      }

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [ITALY_CENTER.lat, ITALY_CENTER.lng],
        zoom: ITALY_ZOOM,
        zoomControl: false,
        attributionControl: true,
      });

      // Dark CARTO basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markers = L.layerGroup().addTo(map);
      markersLayerRef.current = markers;
      mapInstanceRef.current = map;
      setReady(true);
    })();

    return () => { cancelled = true; };
  }, []);

  // Update markers
  useEffect(() => {
    if (!ready || !mapInstanceRef.current || !markersLayerRef.current) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const markers = markersLayerRef.current!;
      markers.clearLayers();

      // Earthquake markers with pulse animation
      earthquakes.forEach((eq) => {
        const sev = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
        const color = SEVERITY_COLORS[sev];
        const radius = Math.max(5, eq.magnitude * 3.5);

        // Outer pulse ring
        if (eq.magnitude >= 3.0) {
          L.circleMarker([eq.latitude, eq.longitude], {
            radius: radius + 8,
            fillColor: color,
            fillOpacity: 0.08,
            color,
            weight: 1,
            opacity: 0.15,
          }).addTo(markers);
        }

        const circle = L.circleMarker([eq.latitude, eq.longitude], {
          radius,
          fillColor: color,
          fillOpacity: 0.6,
          color,
          weight: 1.5,
          opacity: 0.9,
        }).addTo(markers);

        circle.bindPopup(
          `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.6">
            <div style="color:${color};font-size:14px;font-weight:bold;margin-bottom:4px">M ${eq.magnitude.toFixed(1)} <span style="font-size:10px;opacity:0.6">${eq.magnitudeType}</span></div>
            <div style="color:#8ba3c7">${eq.description}</div>
            <div style="color:#4a6285;font-size:10px;margin-top:2px">Profondità: ${eq.depth.toFixed(1)} km</div>
            <div style="color:#4a6285;font-size:10px">${new Date(eq.time).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</div>
          </div>`
        );
      });

      // Weather markers
      weather.forEach((w) => {
        const alertColors: Record<string, string> = { none: '#00e87b', advisory: '#ffb800', watch: '#ff8a3d', warning: '#ff3b5c' };
        const color = alertColors[w.alertLevel] || '#388bff';

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            font-family:'JetBrains Mono',monospace;
            text-align:center;line-height:1.1;
            filter:drop-shadow(0 0 4px ${color}40);
          ">
            <div style="font-size:12px;font-weight:700;color:${color}">${Math.round(w.temperature)}°</div>
            <div style="font-size:8px;color:#4a6285;margin-top:1px">${w.city}</div>
          </div>`,
          iconSize: [50, 28],
          iconAnchor: [25, 14],
        });

        L.marker([w.latitude, w.longitude], { icon }).addTo(markers);
      });

      // AQI markers (subtle rings)
      airQuality.forEach((aq) => {
        const colors: Record<string, string> = {
          good: '#00e87b', moderate: '#88ff00', unhealthy_sensitive: '#ffb800',
          unhealthy: '#ff3b5c', very_unhealthy: '#a855f7', hazardous: '#ff0044',
        };
        const c = colors[aq.level] || '#888';

        L.circleMarker([aq.latitude, aq.longitude], {
          radius: 14,
          fillColor: c,
          fillOpacity: 0.04,
          color: c,
          weight: 0.8,
          opacity: 0.25,
        }).addTo(markers);
      });
    })();
  }, [ready, earthquakes, weather, airQuality]);

  return (
    <div className="relative flex-1 h-full">
      <div ref={mapRef} className="absolute inset-0" />

      {/* Layer control overlay */}
      <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ background: 'rgba(10,15,26,0.92)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}>
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-dim)' }}>
          Layer Mappa
        </span>
        {(['traffic', 'meteo', 'radar', 'satellite'] as MapLayer[]).map((layer) => (
          <button
            key={layer}
            onClick={() => toggleLayer(layer)}
            className={`layer-btn ${activeLayers.has(layer) ? 'active' : ''}`}
          >
            {layer === 'traffic' ? 'Traffico' : layer === 'meteo' ? 'Meteo' : layer === 'radar' ? 'Radar' : 'Satelliti'}
          </button>
        ))}
      </div>

      {/* Coordinate display */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-md px-2.5 py-1.5"
        style={{ background: 'rgba(10,15,26,0.92)', border: '1px solid var(--border-dim)' }}>
        <div className="flex items-center gap-3 font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
          <span>ZOOM: {ITALY_ZOOM}</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>CENTRO: {ITALY_CENTER.lat.toFixed(4)}°N, {ITALY_CENTER.lng.toFixed(4)}°E</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>MARKERS: {earthquakes.length + weather.length + airQuality.length}</span>
        </div>
      </div>

      {/* Gradient edges */}
      <div className="pointer-events-none absolute inset-0 z-[999]">
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#060a13] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#060a13] to-transparent" />
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#060a13] to-transparent" />
        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#060a13] to-transparent" />
      </div>
    </div>
  );
}

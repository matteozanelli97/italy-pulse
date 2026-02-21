'use client';

import { useEffect, useRef, useState } from 'react';
import { ITALY_CENTER, ITALY_ZOOM, SEVERITY_COLORS } from '@/lib/constants';
import type { SeismicEvent, WeatherData, AirQualityStation } from '@/types';

interface MapViewProps {
  earthquakes: SeismicEvent[];
  weather: WeatherData[];
  airQuality: AirQualityStation[];
  onSelectQuake?: (eq: SeismicEvent) => void;
}

export default function MapView({ earthquakes, weather, airQuality, onSelectQuake }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;

      // Inject leaflet CSS if not already present
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [ITALY_CENTER.lat, ITALY_CENTER.lng],
        zoom: ITALY_ZOOM,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution in bottom-right, minimal
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      setMapInstance(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [mapInstance]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstance) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstance as import('leaflet').Map;

      // Clear existing overlays (except tile layer)
      map.eachLayer((layer) => {
        if (!(layer instanceof L.TileLayer)) {
          map.removeLayer(layer);
        }
      });

      // Earthquake markers
      earthquakes.forEach((eq) => {
        const severity = eq.magnitude >= 4.5 ? 'critical' : eq.magnitude >= 3.5 ? 'high' : eq.magnitude >= 2.5 ? 'medium' : 'low';
        const color = SEVERITY_COLORS[severity];
        const radius = Math.max(4, eq.magnitude * 3);

        const circle = L.circleMarker([eq.latitude, eq.longitude], {
          radius,
          fillColor: color,
          fillOpacity: 0.7,
          color,
          weight: 1,
          opacity: 0.9,
        }).addTo(map);

        circle.bindPopup(
          `<div style="font-family:monospace;font-size:11px;color:#0ff;background:#0a0a12;padding:8px;border:1px solid #0ff3;border-radius:4px">
            <b>M${eq.magnitude.toFixed(1)}</b> — ${eq.description}<br/>
            Prof: ${eq.depth.toFixed(1)} km<br/>
            ${new Date(eq.time).toLocaleString('it-IT')}
          </div>`,
          { className: 'hud-popup' }
        );

        circle.on('click', () => onSelectQuake?.(eq));
      });

      // Weather markers
      weather.forEach((w) => {
        const alertColors: Record<string, string> = {
          none: '#00ff88',
          advisory: '#ffaa00',
          watch: '#ff8800',
          warning: '#ff0044',
        };

        const icon = L.divIcon({
          className: 'weather-marker',
          html: `<div style="
            font-family:monospace;
            font-size:10px;
            color:${alertColors[w.alertLevel]};
            text-align:center;
            text-shadow:0 0 6px ${alertColors[w.alertLevel]}40;
            line-height:1.2;
          ">
            <div style="font-size:13px;font-weight:bold">${Math.round(w.temperature)}°</div>
            <div style="font-size:8px;opacity:0.8">${w.city}</div>
          </div>`,
          iconSize: [50, 30],
          iconAnchor: [25, 15],
        });

        L.marker([w.latitude, w.longitude], { icon }).addTo(map);
      });

      // Air quality markers
      airQuality.forEach((aq) => {
        const aqColors: Record<string, string> = {
          good: '#00ff88',
          moderate: '#88ff00',
          unhealthy_sensitive: '#ffaa00',
          unhealthy: '#ff4444',
          very_unhealthy: '#aa00ff',
          hazardous: '#ff0044',
        };
        const color = aqColors[aq.level] || '#888';

        L.circleMarker([aq.latitude, aq.longitude], {
          radius: 6,
          fillColor: color,
          fillOpacity: 0.3,
          color,
          weight: 1,
          opacity: 0.5,
        }).addTo(map);
      });
    })();
  }, [mapInstance, earthquakes, weather, airQuality, onSelectQuake]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {/* Map overlay gradient edges */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#050508] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#050508] to-transparent" />
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[#050508] to-transparent" />
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-[#050508] to-transparent" />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

declare const Cesium: any;

interface CesiumOverlaysProps {
  viewerRef: React.RefObject<any>;
  ready: boolean;
}

/**
 * Projects seismic events and flight tracks onto the CesiumJS globe.
 * Renders as a sibling within CesiumMap — viewerRef is passed down.
 */
export default function CesiumOverlays({ viewerRef, ready }: CesiumOverlaysProps) {
  const seismicEvents = useStore((s) => s.seismic.data);
  const flights = useStore((s) => s.flights.data);
  const mapLayers = useStore((s) => s.mapLayers);

  // Track entity collections for cleanup
  const seismicEntitiesRef = useRef<any[]>([]);
  const flightEntitiesRef = useRef<any[]>([]);

  // ── Seismic markers ──
  useEffect(() => {
    if (!ready || !viewerRef.current || typeof Cesium === 'undefined') return;
    const viewer = viewerRef.current;

    // Remove old seismic entities
    seismicEntitiesRef.current.forEach((e) => {
      try { viewer.entities.remove(e); } catch { /* already removed */ }
    });
    seismicEntitiesRef.current = [];

    if (seismicEvents.length === 0) return;

    seismicEvents.forEach((eq) => {
      const mag = eq.magnitude || 1;
      const lat = eq.latitude;
      const lng = eq.longitude;
      if (lat == null || lng == null) return;

      // Size based on magnitude
      const radius = Math.max(3000, mag * 8000);

      // Color based on magnitude: green < 3, yellow 3-4, orange 4-5, red 5+
      let color: any;
      if (mag < 3) color = Cesium.Color.fromCssColorString('rgba(50, 164, 103, 0.6)');
      else if (mag < 4) color = Cesium.Color.fromCssColorString('rgba(236, 154, 60, 0.6)');
      else if (mag < 5) color = Cesium.Color.fromCssColorString('rgba(230, 126, 34, 0.7)');
      else color = Cesium.Color.fromCssColorString('rgba(231, 106, 110, 0.8)');

      const outlineColor = mag >= 4
        ? Cesium.Color.fromCssColorString('rgba(231, 106, 110, 0.9)')
        : Cesium.Color.fromCssColorString('rgba(236, 154, 60, 0.5)');

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng, lat),
        ellipse: {
          semiMajorAxis: radius,
          semiMinorAxis: radius,
          material: color,
          outline: true,
          outlineColor,
          outlineWidth: 1,
          height: 0,
        },
        label: mag >= 3.5 ? {
          text: `M${mag.toFixed(1)}`,
          font: '10px monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(50000, 1.0, 2000000, 0.3),
        } : undefined,
        description: `<b>${eq.place || 'Evento sismico'}</b><br/>Magnitudo: ${mag}<br/>Profondità: ${eq.depth || '?'} km`,
      });

      seismicEntitiesRef.current.push(entity);
    });
  }, [ready, seismicEvents, viewerRef]);

  // ── Flight track markers ──
  useEffect(() => {
    if (!ready || !viewerRef.current || typeof Cesium === 'undefined') return;
    const viewer = viewerRef.current;

    // Remove old flight entities
    flightEntitiesRef.current.forEach((e) => {
      try { viewer.entities.remove(e); } catch { /* already removed */ }
    });
    flightEntitiesRef.current = [];

    if (!mapLayers.flights || flights.length === 0) return;

    // Only show first 50 to avoid perf hit
    flights.slice(0, 50).forEach((flight) => {
      const lat = flight.latitude;
      const lng = flight.longitude;
      if (lat == null || lng == null) return;

      const alt = (flight.altitude || 10000) * 0.3; // scale down for vis
      const heading = flight.heading || 0;

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng, lat, Math.max(alt, 2000)),
        point: {
          pixelSize: 4,
          color: Cesium.Color.fromCssColorString('rgba(45, 114, 210, 0.8)'),
          outlineColor: Cesium.Color.fromCssColorString('rgba(45, 114, 210, 0.4)'),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(10000, 1.5, 3000000, 0.3),
        },
        label: {
          text: flight.callsign || '',
          font: '9px monospace',
          fillColor: Cesium.Color.fromCssColorString('rgba(45, 114, 210, 0.9)'),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(8, -4),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(10000, 1.0, 1500000, 0.0),
        },
        description: `<b>${flight.callsign || 'N/A'}</b><br/>Alt: ${flight.altitude?.toFixed(0) || '?'}m<br/>Vel: ${flight.speed?.toFixed(0) || '?'} m/s<br/>Dir: ${heading.toFixed(0)}°`,
      });

      flightEntitiesRef.current.push(entity);
    });
  }, [ready, flights, mapLayers.flights, viewerRef]);

  return null; // This component only manages Cesium entities
}

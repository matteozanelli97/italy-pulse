'use client';

import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';
import type { FlightTrack, NavalTrack, CyberThreat, SatelliteTrack, SeismicEvent, ShaderMode } from '@/types';

// ── Constants ──
const EARTH_RADIUS = 5;
const ITALY_LAT = 42.0;
const ITALY_LNG = 12.5;
const ALT_SCALE = 0.00003; // feet → globe units for flights
const SAT_ALT_SCALE = 0.000012; // km → globe units for satellites
const DEG2RAD = Math.PI / 180;

// ── Coordinate conversion: lat/lng → 3D position on sphere ──
function latLngToVec3(lat: number, lng: number, radius: number = EARTH_RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Initial camera position looking at Italy
function getItalyCameraPos(): THREE.Vector3 {
  const target = latLngToVec3(ITALY_LAT, ITALY_LNG, EARTH_RADIUS);
  return target.clone().normalize().multiplyScalar(EARTH_RADIUS * 2.4);
}

// ── Earth Globe ──
function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Use procedural textures since we can't guarantee external texture URLs
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    // Dark background (ocean)
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, 2048, 1024);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* Earth sphere */}
      <Sphere ref={meshRef} args={[EARTH_RADIUS, 128, 128]}>
        <meshPhongMaterial
          color="#0d1420"
          emissive="#060a12"
          emissiveIntensity={0.3}
          specular="#1a2744"
          shininess={15}
          transparent
          opacity={0.95}
        />
      </Sphere>

      {/* Atmosphere glow (outer ring) */}
      <Sphere args={[EARTH_RADIUS * 1.015, 64, 64]}>
        <meshBasicMaterial
          color="#1a4a8a"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Grid lines */}
      <GlobeGrid />
    </group>
  );
}

// ── Grid lines on globe ──
function GlobeGrid() {
  const gridLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];

    // Latitude lines every 15°
    for (let lat = -75; lat <= 75; lat += 15) {
      const points: THREE.Vector3[] = [];
      for (let lng = -180; lng <= 180; lng += 2) {
        points.push(latLngToVec3(lat, lng, EARTH_RADIUS * 1.001));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(geo);
    }

    // Longitude lines every 15°
    for (let lng = -180; lng < 180; lng += 15) {
      const points: THREE.Vector3[] = [];
      for (let lat = -90; lat <= 90; lat += 2) {
        points.push(latLngToVec3(lat, lng, EARTH_RADIUS * 1.001));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(geo);
    }

    return lines;
  }, []);

  return (
    <group>
      {gridLines.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#1a2744', transparent: true, opacity: 0.15 }))} />
      ))}
    </group>
  );
}

// ── Country borders (simplified GeoJSON rendering) ──
function CountryBorders() {
  const [borders, setBorders] = useState<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    const loadBorders = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        if (!res.ok) return;
        const geo = await res.json();
        const geometries: THREE.BufferGeometry[] = [];

        for (const feature of geo.features) {
          const coords = feature.geometry.type === 'MultiPolygon'
            ? feature.geometry.coordinates.flat()
            : feature.geometry.coordinates;

          for (const ring of coords) {
            if (!Array.isArray(ring) || ring.length < 3) continue;
            const points: THREE.Vector3[] = [];
            // Sample every Nth point for performance
            const step = Math.max(1, Math.floor(ring.length / 200));
            for (let i = 0; i < ring.length; i += step) {
              const [lng, lat] = ring[i];
              if (typeof lng === 'number' && typeof lat === 'number') {
                points.push(latLngToVec3(lat, lng, EARTH_RADIUS * 1.002));
              }
            }
            if (points.length > 2) {
              points.push(points[0].clone()); // close ring
              geometries.push(new THREE.BufferGeometry().setFromPoints(points));
            }
          }
        }

        setBorders(geometries);
      } catch { /* ignore */ }
    };
    loadBorders();
  }, []);

  return (
    <group>
      {borders.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#2d72d2', transparent: true, opacity: 0.2 }))} />
      ))}
    </group>
  );
}

// ── Italy highlight ──
function ItalyHighlight() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson');
        if (!res.ok) return;
        const geo = await res.json();
        const geos: THREE.BufferGeometry[] = [];

        for (const feature of geo.features) {
          const coords = feature.geometry.type === 'MultiPolygon'
            ? feature.geometry.coordinates.flat()
            : feature.geometry.coordinates;

          for (const ring of coords) {
            if (!Array.isArray(ring) || ring.length < 3) continue;
            const points: THREE.Vector3[] = [];
            for (let i = 0; i < ring.length; i++) {
              const [lng, lat] = ring[i];
              if (typeof lng === 'number' && typeof lat === 'number') {
                points.push(latLngToVec3(lat, lng, EARTH_RADIUS * 1.003));
              }
            }
            if (points.length > 2) {
              points.push(points[0].clone());
              geos.push(new THREE.BufferGeometry().setFromPoints(points));
            }
          }
        }
        setGeometry(geos);
      } catch { /* ignore */ }
    };
    load();
  }, []);

  return (
    <group>
      {geometry.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#4C90F0', transparent: true, opacity: 0.55 }))} />
      ))}
    </group>
  );
}

// ── Flight markers ──
function FlightMarkers({ flights, visible }: { flights: FlightTrack[]; visible: boolean }) {
  const prevPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  const groupRef = useRef<THREE.Group>(null);

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {flights.map((fl) => {
        const alt = EARTH_RADIUS + fl.altitude * ALT_SCALE;
        const pos = latLngToVec3(fl.latitude, fl.longitude, alt);
        const isMil = fl.type === 'military';
        const color = isMil ? '#EC9A3C' : '#4C90F0';

        return (
          <group key={fl.id} position={pos}>
            <FlightDot color={color} flightId={fl.id} />
            {/* Altitude line to surface */}
            <AltitudeLine lat={fl.latitude} lng={fl.longitude} altitude={alt} color={color} />
          </group>
        );
      })}
    </group>
  );
}

function FlightDot({ color, flightId }: { color: string; flightId: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const selectMarker = useStore((s) => s.selectMarker);
  const selectedMarkerId = useStore((s) => s.selectedMarkerId);
  const isSelected = selectedMarkerId === flightId;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <mesh ref={meshRef} onClick={() => { selectMarker(flightId, 'flight'); sounds.marker(); }}>
      <circleGeometry args={[isSelected ? 0.04 : 0.025, 8]} />
      <meshBasicMaterial color={color} transparent opacity={isSelected ? 1 : 0.85} />
    </mesh>
  );
}

function AltitudeLine({ lat, lng, altitude, color }: { lat: number; lng: number; altitude: number; color: string }) {
  const geo = useMemo(() => {
    const surface = latLngToVec3(lat, lng, EARTH_RADIUS);
    const airPos = latLngToVec3(lat, lng, altitude);
    return new THREE.BufferGeometry().setFromPoints([surface, airPos]);
  }, [lat, lng, altitude]);

  return (
    <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.15 }))} />
  );
}

// ── Satellite markers ──
function SatelliteMarkers({ satellites, visible }: { satellites: SatelliteTrack[]; visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {satellites.map((sat) => {
        const alt = EARTH_RADIUS + sat.altitude * SAT_ALT_SCALE;
        const pos = latLngToVec3(sat.latitude, sat.longitude, alt);
        return (
          <group key={sat.noradId} position={pos}>
            <mesh>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>
            {/* Orbit ring hint */}
            <mesh>
              <ringGeometry args={[0.03, 0.04, 16]} />
              <meshBasicMaterial color="#4C90F0" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── Naval markers ──
function NavalMarkers({ naval, visible }: { naval: NavalTrack[]; visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {naval.map((nv) => {
        const pos = latLngToVec3(nv.latitude, nv.longitude, EARTH_RADIUS * 1.002);
        const color = nv.type === 'military' ? '#4C90F0' : '#5F6B7C';
        return (
          <mesh key={nv.id} position={pos}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

// ── Cyber threat markers ──
function CyberMarkers({ cyber, visible }: { cyber: CyberThreat[]; visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      {cyber.filter((c) => c.latitude && c.longitude).map((ct) => {
        const pos = latLngToVec3(ct.latitude!, ct.longitude!, EARTH_RADIUS * 1.005);
        const color = ct.severity === 'critical' ? '#CD4246' : ct.severity === 'high' ? '#E76A6E' : '#4C90F0';
        return (
          <CyberPulse key={ct.id} position={pos} color={color} />
        );
      })}
    </group>
  );
}

function CyberPulse({ position, color }: { position: THREE.Vector3; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

// ── Seismic event markers ──
function SeismicMarkers({ events }: { events: SeismicEvent[] }) {
  return (
    <group>
      {events.map((eq) => {
        const pos = latLngToVec3(eq.latitude, eq.longitude, EARTH_RADIUS * 1.004);
        const color = eq.magnitude >= 4.0 ? '#E76A6E' : eq.magnitude >= 2.5 ? '#EC9A3C' : '#32A467';
        const size = Math.max(0.01, eq.magnitude * 0.008);
        return (
          <SeismicPulse key={eq.id} position={pos} color={color} size={size} magnitude={eq.magnitude} />
        );
      })}
    </group>
  );
}

function SeismicPulse({ position, color, size, magnitude }: { position: THREE.Vector3; color: string; size: number; magnitude: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = (clock.getElapsedTime() * 1.5) % 2;
      const scale = 1 + t * 2;
      const opacity = Math.max(0, 0.4 * (1 - t / 2));
      ringRef.current.scale.setScalar(scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      {/* Expanding ring for earthquakes >= 3.0 */}
      {magnitude >= 3.0 && (
        <mesh ref={ringRef}>
          <ringGeometry args={[size * 1.5, size * 2, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ── Camera controller with flyTo ──
function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const flyToTarget = useStore((s) => s.flyToTarget);
  const clearFlyTo = useStore((s) => s.clearFlyTo);
  const animating = useRef(false);
  const animStart = useRef(0);
  const animFrom = useRef(new THREE.Vector3());
  const animTo = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!flyToTarget) return;
    const targetPos = latLngToVec3(flyToTarget.lat, flyToTarget.lng, EARTH_RADIUS);
    const zoom = flyToTarget.zoom ?? 10;
    const distance = EARTH_RADIUS * (1.2 + (20 - Math.min(zoom, 18)) * 0.08);
    const cameraTarget = targetPos.clone().normalize().multiplyScalar(distance);

    animFrom.current.copy(camera.position);
    animTo.current.copy(cameraTarget);
    animStart.current = Date.now();
    animating.current = true;

    clearFlyTo();
  }, [flyToTarget, clearFlyTo, camera]);

  useFrame(() => {
    if (!animating.current) return;
    const elapsed = (Date.now() - animStart.current) / 2000; // 2s animation
    const t = Math.min(1, elapsed);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out quad

    camera.position.lerpVectors(animFrom.current, animTo.current, eased);
    camera.lookAt(0, 0, 0);

    if (t >= 1) animating.current = false;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={EARTH_RADIUS * 1.1}
      maxDistance={EARTH_RADIUS * 6}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}

// ── Connection arcs (cyber attack origin → Italy) ──
function ConnectionArcs({ cyber, visible }: { cyber: CyberThreat[]; visible: boolean }) {
  if (!visible) return null;

  const arcs = useMemo(() => {
    return cyber
      .filter((c) => c.latitude && c.longitude)
      .slice(0, 15)
      .map((ct) => {
        const start = latLngToVec3(ct.latitude!, ct.longitude!, EARTH_RADIUS * 1.003);
        const end = latLngToVec3(ITALY_LAT, ITALY_LNG, EARTH_RADIUS * 1.003);
        const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS * 1.15);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(40);
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const color = ct.severity === 'critical' ? '#CD4246' : ct.severity === 'high' ? '#E76A6E' : '#4C90F0';
        return { geo, color, id: ct.id };
      });
  }, [cyber]);

  return (
    <group>
      {arcs.map(({ geo, color, id }) => (
        <primitive key={id} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 }))} />
      ))}
    </group>
  );
}

// ── Animated data flow particles along arcs ──
function DataFlowParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = EARTH_RADIUS * 1.01 + Math.random() * 0.3;
      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.cos(theta);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3] += velocities[i * 3];
      pos.array[i * 3 + 1] += velocities[i * 3 + 1];
      pos.array[i * 3 + 2] += velocities[i * 3 + 2];

      // Keep near surface
      const v = new THREE.Vector3(pos.array[i * 3], pos.array[i * 3 + 1], pos.array[i * 3 + 2]);
      const dist = v.length();
      if (dist < EARTH_RADIUS * 1.005 || dist > EARTH_RADIUS * 1.4) {
        v.normalize().multiplyScalar(EARTH_RADIUS * 1.02);
        pos.array[i * 3] = v.x;
        pos.array[i * 3 + 1] = v.y;
        pos.array[i * 3 + 2] = v.z;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#4C90F0" size={0.015} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// ── Main scene ──
function Scene() {
  const flights = useStore((s) => s.flights.data);
  const cyber = useStore((s) => s.cyber.data);
  const naval = useStore((s) => s.naval.data);
  const satellites = useStore((s) => s.satellites.data);
  const seismic = useStore((s) => s.seismic.data);
  const mapLayers = useStore((s) => s.mapLayers);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 8, 5]} intensity={0.8} color="#e8edf5" />
      <directionalLight position={[-5, -3, -8]} intensity={0.2} color="#4C90F0" />
      <pointLight position={[0, 0, 0]} intensity={0.1} color="#1a2744" />

      {/* Starfield */}
      <Stars radius={100} depth={60} count={4000} factor={3} saturation={0.1} speed={0.3} />

      {/* Earth */}
      <EarthGlobe />
      <CountryBorders />
      <ItalyHighlight />

      {/* Data layers */}
      <FlightMarkers flights={flights} visible={mapLayers.flights} />
      <NavalMarkers naval={naval} visible={mapLayers.naval} />
      <CyberMarkers cyber={cyber} visible={mapLayers.cyber} />
      <ConnectionArcs cyber={cyber} visible={mapLayers.cyber} />
      <SatelliteMarkers satellites={satellites} visible={mapLayers.satellites} />
      <SeismicMarkers events={seismic} />

      {/* Ambient particles */}
      <DataFlowParticles />

      {/* Camera */}
      <CameraController />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.4} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </>
  );
}

// ── Main exported component ──
export default function TacticalMap() {
  const mapLayers = useStore((s) => s.mapLayers);
  const toggleMapLayer = useStore((s) => s.toggleMapLayer);
  const shaderSettings = useStore((s) => s.shaderSettings);
  const setShaderMode = useStore((s) => s.setShaderMode);
  const setShaderSetting = useStore((s) => s.setShaderSetting);
  const flights = useStore((s) => s.flights.data);
  const naval = useStore((s) => s.naval.data);
  const cyber = useStore((s) => s.cyber.data);
  const satellites = useStore((s) => s.satellites.data);
  const seismic = useStore((s) => s.seismic.data);
  const [showControls, setShowControls] = useState(false);

  const markerCount = useMemo(() => {
    let c = 0;
    if (mapLayers.flights) c += flights.length;
    if (mapLayers.naval) c += naval.length;
    if (mapLayers.cyber) c += cyber.filter((ct) => ct.latitude && ct.longitude).length;
    if (mapLayers.satellites) c += satellites.length;
    c += seismic.length;
    return c;
  }, [flights, naval, cyber, satellites, seismic, mapLayers]);

  const initialCameraPos = useMemo(() => getItalyCameraPos(), []);

  return (
    <div className="relative flex-1 h-full" style={{ background: '#050810' }}>
      <Canvas
        camera={{
          position: [initialCameraPos.x, initialCameraPos.y, initialCameraPos.z],
          fov: 45,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{
          filter: [
            shaderSettings.mode === 'nvg' ? 'hue-rotate(80deg) saturate(3) brightness(1.2)' : '',
            shaderSettings.mode === 'flir' ? 'hue-rotate(190deg) saturate(2) contrast(1.3)' : '',
            shaderSettings.mode === 'crt' ? 'contrast(1.2) brightness(0.9)' : '',
            shaderSettings.pixelation > 0 ? `blur(${shaderSettings.pixelation}px)` : '',
            shaderSettings.bloom > 0 ? `brightness(${1 + shaderSettings.bloom * 0.5})` : '',
            shaderSettings.sharpening > 0 ? `contrast(${1 + shaderSettings.sharpening * 0.3})` : '',
          ].filter(Boolean).join(' ') || undefined,
        }}
      >
        <Scene />
      </Canvas>

      {/* Scanline overlay for CRT mode */}
      {shaderSettings.mode === 'crt' && (
        <div className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)',
            backgroundSize: '100% 2px',
          }} />
      )}

      {/* Edge vignette */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="absolute inset-x-0 top-0 h-20" style={{ background: 'linear-gradient(to bottom, #050810, transparent)' }} />
        <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, #050810, transparent)' }} />
        <div className="absolute inset-y-0 left-0 w-12" style={{ background: 'linear-gradient(to right, #050810, transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-12" style={{ background: 'linear-gradient(to left, #050810, transparent)' }} />
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

      {/* Bottom HUD */}
      <div className="absolute bottom-3 left-3 z-[2] glass-panel rounded-lg px-3.5 py-2">
        <div className="flex items-center gap-3 font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
          <span style={{ color: 'var(--accent)' }}>3D GLOBE VIEW</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>MRK: <span style={{ color: '#fff' }}>{markerCount}</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>LAYERS: <span style={{ color: '#fff' }}>{Object.values(mapLayers).filter(Boolean).length}/5</span></span>
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
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#E76A6E', boxShadow: '0 0 6px #E76A6E' }} /><span style={{ color: 'var(--text-dim)' }}>SEIS</span></span>
        </div>
      </div>
    </div>
  );
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

'use client';

import { useRef, useState, useMemo, useCallback, useEffect, memo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import { sounds } from '@/lib/sounds';
import { POIS, GLOBAL_CITIES, SEVERITY_COLORS } from '@/lib/constants';
import type { FlightTrack, NavalTrack, CyberThreat, SatelliteTrack, SeismicEvent, ShaderMode } from '@/types';

// ── Constants ──
const EARTH_RADIUS = 5;
const ALT_SCALE = 0.00003; // feet -> globe units for flights
const SAT_ALT_SCALE = 0.000012; // km -> globe units for satellites
const DEG2RAD = Math.PI / 180;
const MAX_MARKERS = 500;

// Major cities for cyber arc targets
const MAJOR_CITIES = [
  { lat: 40.7128, lng: -74.006 },   // New York
  { lat: 51.5074, lng: -0.1278 },   // London
  { lat: 48.8566, lng: 2.3522 },    // Paris
  { lat: 35.6762, lng: 139.6503 },  // Tokyo
  { lat: 52.52, lng: 13.405 },      // Berlin
  { lat: 55.7558, lng: 37.6173 },   // Moscow
  { lat: 39.9042, lng: 116.4074 },  // Beijing
  { lat: -33.8688, lng: 151.2093 }, // Sydney
];

// ── Coordinate conversion: lat/lng -> 3D position on sphere ──
function latLngToVec3(lat: number, lng: number, radius: number = EARTH_RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Initial camera position looking at 30N, 0E (Atlantic/Europe view)
function getInitialCameraPos(): THREE.Vector3 {
  const target = latLngToVec3(30, 0, EARTH_RADIUS);
  return target.clone().normalize().multiplyScalar(EARTH_RADIUS * 2.4);
}

// ── Atmosphere Fresnel Shader ──
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), power);
    gl_FragColor = vec4(glowColor, fresnel * intensity);
  }
`;

// ── Earth Globe with NASA textures ──
const EarthGlobe = memo(function EarthGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const dayTexture = useLoader(
    THREE.TextureLoader,
    'https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.200412.3x5400x2700.jpg'
  );
  const nightTexture = useLoader(
    THREE.TextureLoader,
    'https://eoimages.gsfc.nasa.gov/images/imagerecords/79000/79790/city_lights_2012.jpg'
  );

  // Slow rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group>
      {/* Earth sphere with NASA textures */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[EARTH_RADIUS, 128, 128]} />
        <meshStandardMaterial
          map={dayTexture}
          emissiveMap={nightTexture}
          emissive={new THREE.Color('#ffffff')}
          emissiveIntensity={0.6}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Atmosphere Fresnel rim glow — BackSide */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.02, 64, 64]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            glowColor: { value: new THREE.Color('#4a90d9') },
            intensity: { value: 0.8 },
            power: { value: 3.5 },
          }}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outer haze sphere */}
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.06, 64, 64]} />
        <meshBasicMaterial
          color="#1a5aaa"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

// ── Country borders from GeoJSON ──
const CountryBorders = memo(function CountryBorders() {
  const [borderObjects, setBorderObjects] = useState<THREE.Line[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        if (!res.ok || cancelled) return;
        const geo = await res.json();
        if (cancelled) return;

        const material = new THREE.LineBasicMaterial({
          color: '#2d72d2',
          transparent: true,
          opacity: 0.25,
        });

        const lines: THREE.Line[] = [];

        for (const feature of geo.features) {
          const coords = feature.geometry.type === 'MultiPolygon'
            ? feature.geometry.coordinates.flat()
            : feature.geometry.coordinates;

          for (const ring of coords) {
            if (!Array.isArray(ring) || ring.length < 3) continue;
            const points: THREE.Vector3[] = [];
            const step = Math.max(1, Math.floor(ring.length / 200));
            for (let i = 0; i < ring.length; i += step) {
              const [lng, lat] = ring[i];
              if (typeof lng === 'number' && typeof lat === 'number') {
                points.push(latLngToVec3(lat, lng, EARTH_RADIUS * 1.002));
              }
            }
            if (points.length > 2) {
              points.push(points[0].clone());
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              lines.push(new THREE.Line(geometry, material));
            }
          }
        }

        if (!cancelled) setBorderObjects(lines);
      } catch { /* ignore fetch errors */ }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <group>
      {borderObjects.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
});

// ── Flight markers ──
const FlightMarkers = memo(function FlightMarkers({ flights, visible }: { flights: FlightTrack[]; visible: boolean }) {
  if (!visible || flights.length === 0) return null;

  const limited = flights.slice(0, MAX_MARKERS);

  return (
    <group>
      {limited.map((fl) => {
        const alt = EARTH_RADIUS + fl.altitude * ALT_SCALE;
        const pos = latLngToVec3(fl.latitude, fl.longitude, alt);
        const color = fl.type === 'military' ? '#EC9A3C' : fl.type === 'cargo' ? '#738091' : '#4C90F0';

        return (
          <group key={fl.id}>
            {/* Aircraft dot */}
            <mesh position={pos}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshBasicMaterial color={color} transparent opacity={0.9} />
            </mesh>
            {/* Altitude line */}
            <FlightAltitudeLine lat={fl.latitude} lng={fl.longitude} altitude={alt} color={color} />
          </group>
        );
      })}
    </group>
  );
});

function FlightAltitudeLine({ lat, lng, altitude, color }: { lat: number; lng: number; altitude: number; color: string }) {
  const lineObj = useMemo(() => {
    const surface = latLngToVec3(lat, lng, EARTH_RADIUS);
    const airPos = latLngToVec3(lat, lng, altitude);
    const geo = new THREE.BufferGeometry().setFromPoints([surface, airPos]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.12 });
    return new THREE.Line(geo, mat);
  }, [lat, lng, altitude, color]);

  return <primitive object={lineObj} />;
}

// ── Satellite markers with orbital paths ──
const SatelliteMarkers = memo(function SatelliteMarkers({ satellites, visible }: { satellites: SatelliteTrack[]; visible: boolean }) {
  if (!visible || satellites.length === 0) return null;

  const limited = satellites.slice(0, MAX_MARKERS);

  // Use instanced rendering if >50 satellites
  if (limited.length > 50) {
    return <SatelliteInstanced satellites={limited} />;
  }

  return (
    <group>
      {limited.map((sat) => (
        <SatelliteSingle key={sat.noradId} sat={sat} />
      ))}
    </group>
  );
});

function SatelliteInstanced({ satellites }: { satellites: SatelliteTrack[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    satellites.forEach((sat, i) => {
      const alt = EARTH_RADIUS + sat.altitude * SAT_ALT_SCALE;
      const pos = latLngToVec3(sat.latitude, sat.longitude, alt);
      dummy.position.copy(pos);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [satellites, dummy]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, satellites.length]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </instancedMesh>
      {/* Orbital paths for satellites with inclination and period */}
      {satellites.filter(s => s.inclination != null && s.period != null).slice(0, 20).map(sat => (
        <OrbitalPath key={sat.noradId} sat={sat} />
      ))}
    </group>
  );
}

function SatelliteSingle({ sat }: { sat: SatelliteTrack }) {
  const alt = EARTH_RADIUS + sat.altitude * SAT_ALT_SCALE;
  const pos = latLngToVec3(sat.latitude, sat.longitude, alt);

  return (
    <group>
      <mesh position={pos}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      {sat.inclination != null && sat.period != null && <OrbitalPath sat={sat} />}
    </group>
  );
}

function OrbitalPath({ sat }: { sat: SatelliteTrack }) {
  const lineObj = useMemo(() => {
    const alt = EARTH_RADIUS + sat.altitude * SAT_ALT_SCALE;
    const inc = (sat.inclination ?? 0) * DEG2RAD;
    const points: THREE.Vector3[] = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = alt * Math.cos(angle);
      const y = alt * Math.sin(angle) * Math.sin(inc);
      const z = alt * Math.sin(angle) * Math.cos(inc);
      points.push(new THREE.Vector3(x, y, z));
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: '#4C90F0',
      transparent: true,
      opacity: 0.15,
      dashSize: 0.3,
      gapSize: 0.2,
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    // Rotate by RAAN if available
    if (sat.raan != null) {
      line.rotation.y = sat.raan * DEG2RAD;
    }
    return line;
  }, [sat]);

  return <primitive object={lineObj} />;
}

// ── Seismic event markers ──
const SeismicMarkers = memo(function SeismicMarkers({ events }: { events: SeismicEvent[] }) {
  if (events.length === 0) return null;

  return (
    <group>
      {events.slice(0, MAX_MARKERS).map((eq) => (
        <SeismicPulse key={eq.id} eq={eq} />
      ))}
    </group>
  );
});

function SeismicPulse({ eq }: { eq: SeismicEvent }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const pos = useMemo(() => latLngToVec3(eq.latitude, eq.longitude, EARTH_RADIUS * 1.004), [eq.latitude, eq.longitude]);
  const color = eq.magnitude >= 5 ? '#CD4246' : eq.magnitude >= 3 ? '#EC9A3C' : '#32A467';
  const size = Math.max(0.01, eq.magnitude * 0.008);

  useFrame(({ clock }) => {
    // Pulsing dot
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.2;
      meshRef.current.scale.setScalar(s);
    }
    // Expanding ring for M4.0+
    if (ringRef.current) {
      const t = (clock.getElapsedTime() * 1.2) % 2;
      const scale = 1 + t * 3;
      const opacity = Math.max(0, 0.4 * (1 - t / 2));
      ringRef.current.scale.setScalar(scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      {eq.magnitude >= 4.0 && (
        <mesh ref={ringRef}>
          <ringGeometry args={[size * 1.5, size * 2.2, 24]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ── Cyber threat markers with arc lines ──
const CyberMarkers = memo(function CyberMarkers({ cyber, visible }: { cyber: CyberThreat[]; visible: boolean }) {
  if (!visible) return null;

  const filtered = useMemo(() => cyber.filter(c => c.latitude != null && c.longitude != null), [cyber]);

  return (
    <group>
      {filtered.slice(0, MAX_MARKERS).map((ct) => (
        <CyberDot key={ct.id} ct={ct} />
      ))}
      <CyberArcs cyber={filtered} />
    </group>
  );
});

function CyberDot({ ct }: { ct: CyberThreat }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec3(ct.latitude!, ct.longitude!, EARTH_RADIUS * 1.005), [ct.latitude, ct.longitude]);
  const color = ct.severity === 'critical' ? SEVERITY_COLORS.critical
    : ct.severity === 'high' ? SEVERITY_COLORS.high
    : ct.severity === 'medium' ? SEVERITY_COLORS.medium
    : SEVERITY_COLORS.low;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.3;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} position={pos}>
      <sphereGeometry args={[0.018, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

const CyberArcs = memo(function CyberArcs({ cyber }: { cyber: CyberThreat[] }) {
  const arcObjects = useMemo(() => {
    return cyber.slice(0, 20).map((ct) => {
      const start = latLngToVec3(ct.latitude!, ct.longitude!, EARTH_RADIUS * 1.003);
      // Pick a random major city as target
      const city = MAJOR_CITIES[Math.floor(Math.abs(ct.id.charCodeAt(0)) % MAJOR_CITIES.length)];
      const end = latLngToVec3(city.lat, city.lng, EARTH_RADIUS * 1.003);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS * 1.15);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(40);
      const geo = new THREE.BufferGeometry().setFromPoints(points);

      const color = ct.severity === 'critical' ? SEVERITY_COLORS.critical
        : ct.severity === 'high' ? SEVERITY_COLORS.high
        : SEVERITY_COLORS.low;

      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 });
      return { line: new THREE.Line(geo, mat), id: ct.id };
    });
  }, [cyber]);

  return (
    <group>
      {arcObjects.map(({ line, id }) => (
        <primitive key={id} object={line} />
      ))}
    </group>
  );
});

// ── Naval markers ──
const NavalMarkers = memo(function NavalMarkers({ naval, visible }: { naval: NavalTrack[]; visible: boolean }) {
  if (!visible || naval.length === 0) return null;

  return (
    <group>
      {naval.slice(0, MAX_MARKERS).map((nv) => {
        const pos = latLngToVec3(nv.latitude, nv.longitude, EARTH_RADIUS * 1.002);
        const color = nv.type === 'military' ? '#4C90F0' : '#738091';
        return (
          <mesh key={nv.id} position={pos}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
});

// ── Camera controller with flyTo animation ──
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

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }

    if (t >= 1) animating.current = false;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={6.5}
      maxDistance={30}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}

// ── Main 3D scene ──
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
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 8, 5]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-5, -3, -8]} intensity={0.15} color="#4C90F0" />

      {/* Starfield */}
      <Stars radius={100} depth={60} count={4000} factor={3} saturation={0.1} speed={0.3} />

      {/* Earth */}
      <EarthGlobe />
      <CountryBorders />

      {/* Data layers */}
      <FlightMarkers flights={flights} visible={mapLayers.flights} />
      <NavalMarkers naval={naval} visible={mapLayers.naval} />
      <CyberMarkers cyber={cyber} visible={mapLayers.cyber} />
      <SatelliteMarkers satellites={satellites} visible={mapLayers.satellites} />
      <SeismicMarkers events={seismic} />

      {/* Camera */}
      <CameraController />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.5} />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
}

// ── Slider control for sensor settings ──
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

// ── Main exported component ──
export default function TacticalMap() {
  const mapLayers = useStore((s) => s.mapLayers);
  const toggleMapLayer = useStore((s) => s.toggleMapLayer);
  const shaderSettings = useStore((s) => s.shaderSettings);
  const setShaderMode = useStore((s) => s.setShaderMode);
  const setShaderSetting = useStore((s) => s.setShaderSetting);
  const flyTo = useStore((s) => s.flyTo);
  const flights = useStore((s) => s.flights.data);
  const naval = useStore((s) => s.naval.data);
  const cyber = useStore((s) => s.cyber.data);
  const satellites = useStore((s) => s.satellites.data);
  const seismic = useStore((s) => s.seismic.data);
  const [showControls, setShowControls] = useState(false);
  const [poiToast, setPoiToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Marker count
  const markerCount = useMemo(() => {
    let c = 0;
    if (mapLayers.flights) c += flights.length;
    if (mapLayers.naval) c += naval.length;
    if (mapLayers.cyber) c += cyber.filter((ct) => ct.latitude && ct.longitude).length;
    if (mapLayers.satellites) c += satellites.length;
    c += seismic.length;
    return c;
  }, [flights, naval, cyber, satellites, seismic, mapLayers]);

  const activeLayers = useMemo(() => Object.values(mapLayers).filter(Boolean).length, [mapLayers]);
  const totalLayers = useMemo(() => Object.keys(mapLayers).length, [mapLayers]);

  const initialCameraPos = useMemo(() => getInitialCameraPos(), []);

  // POI keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;
      if (key >= '1' && key <= '8') {
        const idx = parseInt(key) - 1;
        if (idx < POIS.length) {
          const poi = POIS[idx];
          flyTo({ lat: poi.lat, lng: poi.lng, zoom: poi.zoom });
          sounds.marker();

          // Show toast
          setPoiToast(`${key}: ${poi.name}`);
          if (toastTimeout.current) clearTimeout(toastTimeout.current);
          toastTimeout.current = setTimeout(() => setPoiToast(null), 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [flyTo]);

  // CSS filter based on sensor mode
  const canvasFilter = useMemo(() => {
    const filters: string[] = [];
    if (shaderSettings.mode === 'nvg') filters.push('hue-rotate(80deg) saturate(3) brightness(1.2)');
    if (shaderSettings.mode === 'flir') filters.push('hue-rotate(190deg) saturate(2) contrast(1.3)');
    if (shaderSettings.mode === 'crt') filters.push('contrast(1.2) brightness(0.9)');
    if (shaderSettings.pixelation > 0) filters.push(`blur(${shaderSettings.pixelation}px)`);
    if (shaderSettings.bloom > 0) filters.push(`brightness(${1 + shaderSettings.bloom * 0.5})`);
    if (shaderSettings.sharpening > 0) filters.push(`contrast(${1 + shaderSettings.sharpening * 0.3})`);
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [shaderSettings]);

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
        style={{ filter: canvasFilter }}
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

      {/* POI toast indicator */}
      {poiToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[3] glass-panel rounded-lg px-4 py-2 font-mono text-[11px] font-bold tracking-wider animate-pulse"
          style={{ color: 'var(--accent)', borderColor: 'var(--accent)', borderWidth: 1 }}>
          NAVIGATING TO {poiToast}
        </div>
      )}

      {/* ── HUD: TOP-LEFT — Layer toggle buttons ── */}
      <div className="absolute top-3 left-3 z-[2] glass-panel flex items-center gap-2 rounded-lg px-3 py-2">
        <span className="mr-1 font-mono text-[8px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>Layers</span>
        {(['flights', 'naval', 'cyber', 'satellites', 'traffic'] as const).map((layer) => (
          <button key={layer} onClick={() => { toggleMapLayer(layer); sounds.toggle(); }}
            className={`layer-btn text-[9px] px-2 py-0.5 ${mapLayers[layer] ? 'active' : ''}`}>
            {layer === 'flights' ? 'Flights' : layer === 'naval' ? 'Naval' : layer === 'satellites' ? 'Sat' : layer === 'traffic' ? 'Traffic' : 'Cyber'}
          </button>
        ))}
      </div>

      {/* ── HUD: TOP-CENTER — POI quick-jump bar ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[2] glass-panel rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-2 font-mono text-[8px]">
          <span className="font-bold uppercase tracking-[0.12em] mr-1" style={{ color: 'var(--text-muted)' }}>POI</span>
          {POIS.map((poi) => (
            <button key={poi.id}
              onClick={() => { flyTo({ lat: poi.lat, lng: poi.lng, zoom: poi.zoom }); sounds.marker(); }}
              className="hover:text-white transition-colors px-1"
              style={{ color: 'var(--text-dim)' }}
              title={poi.description}>
              <span style={{ color: 'var(--accent)' }}>{poi.key}</span>:{poi.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── HUD: TOP-RIGHT — Sensor mode button + settings panel ── */}
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

      {/* ── HUD: BOTTOM-LEFT — Telemetry bar ── */}
      <div className="absolute bottom-3 left-3 z-[2] glass-panel rounded-lg px-3.5 py-2">
        <div className="flex items-center gap-3 font-mono text-[9px]" style={{ color: 'var(--text-dim)' }}>
          <span style={{ color: 'var(--accent)' }}>3D GLOBE</span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>MRK: <span style={{ color: '#fff' }}>{markerCount}</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>LAYERS: <span style={{ color: '#fff' }}>{activeLayers}/{totalLayers}</span></span>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <span>SENSOR: <span style={{ color: shaderSettings.mode !== 'none' ? 'var(--accent)' : '#fff' }}>{shaderSettings.mode.toUpperCase()}</span></span>
        </div>
      </div>

      {/* ── HUD: BOTTOM-RIGHT — Color legend ── */}
      <div className="absolute bottom-3 right-3 z-[2] glass-panel rounded-lg px-3 py-1.5">
        <div className="flex items-center gap-3 font-mono text-[8px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#4C90F0', boxShadow: '0 0 6px #4C90F0' }} />
            <span style={{ color: 'var(--text-dim)' }}>Commercial</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#EC9A3C', boxShadow: '0 0 6px #EC9A3C' }} />
            <span style={{ color: 'var(--text-dim)' }}>Military</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#738091', boxShadow: '0 0 6px #738091' }} />
            <span style={{ color: 'var(--text-dim)' }}>Cargo</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#fff', boxShadow: '0 0 6px rgba(45,114,210,0.4)' }} />
            <span style={{ color: 'var(--text-dim)' }}>Satellite</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#CD4246', boxShadow: '0 0 6px #CD4246' }} />
            <span style={{ color: 'var(--text-dim)' }}>Seismic</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#E76A6E', boxShadow: '0 0 6px #E76A6E' }} />
            <span style={{ color: 'var(--text-dim)' }}>Cyber</span>
          </span>
        </div>
      </div>
    </div>
  );
}

# SALA OPERATIVA — Italy OSINT Platform Execution Plan

## Vision
Transform this project from a global OSINT dashboard into the most advanced, immersive OSINT platform exclusively dedicated to **Italy** — combining Palantir-like aesthetics with massive real-time Italian data aggregation.

---

## Phase 1: 3D Engine Lockdown & Core Rebuild ✅
**Status: IN PROGRESS**

### 1A — Cleanse Legacy & Install CesiumJS
- [x] Remove React Three Fiber / Three.js dependencies
- [x] Remove legacy TacticalMap.tsx (R3F globe)
- [x] Remove unused global modules (ArticleModal, mock-data)
- [x] Install CesiumJS + resium for React integration
- [x] Configure Next.js for Cesium static assets

### 1B — Italy-Locked 3D Engine
- [x] Build CesiumViewer component with Google Photorealistic 3D Tiles
- [x] Lock camera bounds to Italian territory (35°N–47.5°N, 6°E–19°E)
- [x] Dim/stylize rest of world outside Italy
- [x] Deep zoom with 3D buildings over Italian regions

### 1C — Post-Processing Shaders
- [x] Standard view (clean)
- [x] CRT scanline shader
- [x] Green Night Vision shader
- [x] Thermal FLIR shader
- [x] HUD controls for bloom/pixelation

### 1D — Italian POI Camera Shortcuts
- [x] Colosseo (Roma)
- [x] Duomo di Milano
- [x] Palazzo Chigi (Parlamento)
- [x] Piazza San Marco (Venezia)
- [x] Vesuvio (Napoli)
- [x] Ponte Vecchio (Firenze)
- [x] Valle dei Templi (Sicilia)
- [x] Trulli di Alberobello (Puglia)

---

## Phase 2: Italian Data Aggregation (Omnivore Engine)
**Status: PENDING**

### 2A — Institutional Open Data
- [ ] INGV seismic data (real API: webservices.ingv.it)
- [ ] Protezione Civile alerts
- [ ] Dati.gov.it CKAN/DCAT integration
- [ ] Project data onto 3D map as markers/heatmaps

### 2B — RapidAPI Data Sources
- [ ] Idealista (Real Estate trends)
- [ ] Live fuel prices across Italy
- [ ] Events & Crowds (Zaza81 API)
- [ ] Serie A live scores & stats

### 2C — Aviation & Space Overlays
- [ ] OpenSky flights filtered to Italian airspace
- [ ] NORAD satellite passes over Italy
- [ ] ADS-B military flight tracking

---

## Phase 3: Tactical Overlays & CCTV
**Status: PENDING**

### 3A — Street Traffic Simulation
- [ ] Extract Italian road network from OSM
- [ ] WebGL particle system for vehicle simulation
- [ ] Load arterial roads first (performance)

### 3B — Live CCTV Projection
- [ ] Italian public webcam framework
- [ ] Camera frustum projection onto 3D geometry
- [ ] Stream overlay on buildings/streets

---

## Phase 4: Socio-Political & Crisis Modules
**Status: PENDING**

### 4A — Political Sentiment Module
- [ ] Track FdI, PD, M5S, Lega, FI
- [ ] Dynamic approval percentages
- [ ] Social media sentiment analysis
- [ ] Historical polling charts

### 4B — Referendum/Events Tracker
- [ ] Live countdowns for upcoming votes
- [ ] Quorum tracking visualization
- [ ] Regional voting trends as 3D heatmaps
- [ ] National strike impact mapping

---

## Architecture Notes
- **3D Engine**: CesiumJS with Google Photorealistic 3D Tiles (Cesium Ion token)
- **Data**: RapidAPI + Italian public APIs (INGV, Protezione Civile, dati.gov.it)
- **State**: Zustand store (preserved from original)
- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS + Palantir Gotham theme (preserved)

# SALA OPERATIVA — Italy OSINT Platform Execution Plan

## Vision
Transform this project into the most advanced, immersive OSINT platform exclusively dedicated to **Italy** — combining Palantir-like aesthetics with massive real-time Italian data aggregation.

---

## Phase 1: 3D Engine Lockdown & Core Rebuild ✅
**Status: COMPLETE**

### 1A — Cleanse Legacy & Install CesiumJS
- [x] Remove React Three Fiber / Three.js dependencies
- [x] Remove legacy TacticalMap.tsx (R3F globe)
- [x] Remove unused global modules (ArticleModal, NASA textures)
- [x] Load CesiumJS via CDN (no webpack config needed)

### 1B — Italy-Locked 3D Engine
- [x] Build CesiumViewer component with Google Photorealistic 3D Tiles
- [x] Lock camera bounds to Italian territory (35°N–47.5°N, 6°E–19°E)
- [x] Dim/stylize rest of world outside Italy
- [x] Deep zoom with 3D buildings over Italian regions
- [x] Coordinates HUD with live camera position

### 1C — Post-Processing Shaders
- [x] Standard view (clean)
- [x] CRT scanline shader with vignette
- [x] Green Night Vision shader with film grain
- [x] Thermal FLIR shader with gradient
- [x] Shader mode selector (Q/W/E/R shortcuts)

### 1D — Italian POI Camera Shortcuts (1-8)
- [x] Colosseo (Roma)
- [x] Duomo di Milano
- [x] Palazzo Chigi (Governo)
- [x] Piazza San Marco (Venezia)
- [x] Vesuvio (Napoli)
- [x] Ponte Vecchio (Firenze)
- [x] Valle dei Templi (Sicilia)
- [x] Trulli di Alberobello (Puglia)

### 1E — Critical Bug Fixes ✅ (NEW)
- [x] Fix CesiumJS infinite loading — wrapped initCesium in try/catch with terrain fallback
- [x] Add error state display when 3D engine fails to initialize
- [x] Guard against React StrictMode double-mount
- [x] Set CESIUM_BASE_URL before any Cesium operations

---

## Phase 2: Italian Data Modules ✅
**Status: COMPLETE**

### 2A — Political Sentiment Module
- [x] Track 8 parties: FdI, PD, M5S, Lega, FI, AVS, IV, Azione
- [x] Dynamic approval percentages with trends
- [x] Bar chart + list views with leader info
- [x] Color-coded by party
- [x] Stabilized polling data (daily-seeded, no random jitter on every render)

### 2B — INGV Seismic Integration
- [x] Real INGV FDSN API (webservices.ingv.it)
- [x] USGS fallback filtered to Italy bounding box
- [x] Italian labels in SeismicModule

### 2C — Italian Data Sources
- [x] OpenSky flights filtered to Italian airspace
- [x] Weather for 20 Italian cities (Open-Meteo)
- [x] Air quality for Italian cities
- [x] Italian markets (FTSE MIB, ENI, ISP, ENEL, Ferrari, BTP-Bund, PUN, TTF + BTC/ETH via CoinGecko)
- [x] Italian webcams only (Roma, Venezia, Napoli, Milano, Firenze, etc.)
- [x] Italian news feeds (ANSA, Corriere, Repubblica, etc.) with auto-translation

### 2D — UI Localization
- [x] All module labels in Italian
- [x] TopBar: Italian timezone (CET), Italian date format
- [x] WMO weather codes translated to Italian
- [x] Italian news source favicons

---

## Phase 3: Advanced Data Integration ✅
**Status: COMPLETE**

### 3A — Serie A (API-Football via RapidAPI)
- [x] Live scores and match results
- [x] Classifica (standings table) with top-10
- [x] Partite/Classifica toggle views
- [x] Synthetic fallback when API unavailable

### 3B — Fuel Prices (RapidAPI)
- [x] Regional fuel costs (benzina, diesel, GPL, metano)
- [x] National averages
- [x] Bar chart by region
- [x] Synthetic fallback

### 3C — Events & Referendum Tracker
- [x] Live countdowns for upcoming Italian events
- [x] Quorum tracking for referendums
- [x] Event types: referendum, elezione, sciopero, manifestazione, festività
- [x] Color-coded event cards with descriptions
- [x] Real events: Autonomia Differenziata, Comunali 2026, Scioperi, 25 Aprile

### 3D — Protezione Civile Alerts
- [x] DPC open data integration with GitHub API
- [x] Alert types: idraulico, idrogeologico, temporali, vento, neve, incendi, valanghe
- [x] Severity-based color coding (verde/gialla/arancione/rossa)
- [x] Seasonal fallback generator

### 3E — UI-to-3D Event Bridge ✅ (NEW)
- [x] CesiumMap reads `flyToTarget` from Zustand store
- [x] Clicking seismic events, flights, weather cities triggers cinematic camera flyTo
- [x] Zoom level to altitude conversion for smooth transitions
- [x] Support for pitch/bearing parameters

---

## Phase 4: Future Enhancements
**Status: PENDING — Future sessions**

### 4A — Draggable Floating Windows (HUD)
- [ ] Replace static sidebar with draggable, resizable floating windows (react-rnd / framer-motion)
- [ ] Glassmorphism with glowing neon borders
- [ ] CRT scanline overlay on windows
- [ ] Module toggle/minimize/close controls

### 4B — Deeper RapidAPI Integration
- [ ] Idealista (Real Estate market trends)
- [ ] Events & Crowds (Zaza81 API)
- [ ] Real polling data from aggregators (replace synthetic with API)
- [ ] Social media sentiment analysis

### 4C — Institutional Open Data
- [ ] Dati.gov.it CKAN/DCAT integration
- [ ] Project institutional data onto CesiumJS map as entities
- [ ] Regional voting trends as 3D heatmaps

### 4D — Map Data Overlays (Advanced)
- [ ] Strike impact mapping with choropleth
- [ ] Street traffic simulation (WebGL particle system)
- [ ] NORAD satellite tracking over Italy
- [ ] Real-time naval/AIS tracking (replace mock data)

### 4E — Ontology Layer (Palantir-style)
- [ ] Entity graph connecting people, organizations, events, locations
- [ ] Relationship mapping between political entities, companies, events
- [ ] Timeline view for entity history
- [ ] Search and filter across all entities

---

## Data Source Status

| Module | Source | Status |
|--------|--------|--------|
| Seismic | INGV FDSN + USGS fallback | ✅ Real API |
| Flights | OpenSky Network | ✅ Real API |
| Weather | Open-Meteo | ✅ Real API |
| News | 25+ Italian RSS feeds | ✅ Real API |
| Markets | CoinGecko + synthetic Italian stocks | ⚠️ Hybrid |
| Satellites | CelesTrak TLE | ✅ Real API |
| Serie A | API-Football via RapidAPI | ⚠️ With fallback |
| Fuel | prezzo-benzina via RapidAPI | ⚠️ With fallback |
| Prot. Civile | DPC GitHub | ⚠️ With fallback |
| Political | Seeded synthetic | ❌ Needs real API |
| Events | Hardcoded events | ❌ Needs real API |
| Cyber | Mock generator | ❌ Simulated |
| Naval | Mock generator | ❌ Simulated |

---

## Architecture Notes
- **3D Engine**: CesiumJS via CDN + Google Photorealistic 3D Tiles (Cesium Ion token)
- **Data**: RapidAPI (API-Football, fuel prices) + Italian public APIs (INGV, Open-Meteo, OpenSky)
- **State**: Zustand store with typed slices + polling engine
- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS 4 + Palantir Gotham theme
- **Shaders**: CSS filter-based (CRT, NVG, FLIR) with overlay compositing
- **Modules**: 11 data panels (Political, Events, Protezione Civile, Seismic, Weather, Flights, Serie A, Fuel, Markets, Services, Webcams)
- **UI-to-3D Bridge**: Store-based flyToTarget → CesiumJS camera.flyTo()

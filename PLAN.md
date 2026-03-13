# SALA OPERATIVA — Italy OSINT Platform Execution Plan

## Vision
Transform this project from a global OSINT dashboard into the most advanced, immersive OSINT platform exclusively dedicated to **Italy** — combining Palantir-like aesthetics with massive real-time Italian data aggregation.

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

---

## Phase 2: Italian Data Modules ✅
**Status: COMPLETE**

### 2A — Political Sentiment Module
- [x] Track 8 parties: FdI, PD, M5S, Lega, FI, AVS, IV, Azione
- [x] Dynamic approval percentages with trends
- [x] Bar chart + list views with leader info
- [x] Color-coded by party

### 2B — INGV Seismic Integration
- [x] Real INGV FDSN API (webservices.ingv.it)
- [x] USGS fallback filtered to Italy bounding box
- [x] Italian labels in SeismicModule

### 2C — Italian Data Sources
- [x] OpenSky flights filtered to Italian airspace
- [x] Weather for 20 Italian cities (Open-Meteo)
- [x] Air quality for Italian cities
- [x] Italian markets (FTSE MIB, ENI, ISP, ENEL, Ferrari, BTP-Bund, PUN, TTF)
- [x] Italian webcams only (Roma, Venezia, Napoli, Milano, Firenze, etc.)
- [x] Italian news feeds (ANSA, Corriere, Repubblica, etc.)

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

---

## Phase 4: Future Enhancements
**Status: PENDING — Future sessions**

### 4A — Deeper RapidAPI Integration
- [ ] Idealista (Real Estate market trends)
- [ ] Events & Crowds (Zaza81 API)
- [ ] Real polling data from aggregators
- [ ] Social media sentiment analysis

### 4B — Institutional Open Data
- [ ] Protezione Civile alerts
- [ ] Dati.gov.it CKAN/DCAT integration
- [ ] Project institutional data onto CesiumJS map as entities

### 4C — Map Data Overlays
- [ ] Seismic events as 3D markers on CesiumJS
- [ ] Flight tracks overlaid on 3D map
- [ ] Regional voting trends as 3D heatmaps
- [ ] Strike impact mapping with choropleth

---

## Architecture Notes
- **3D Engine**: CesiumJS via CDN + Google Photorealistic 3D Tiles (Cesium Ion token)
- **Data**: RapidAPI (API-Football, fuel prices) + Italian public APIs (INGV, Open-Meteo, OpenSky)
- **State**: Zustand store with typed slices
- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS 4 + Palantir Gotham theme
- **Shaders**: CSS filter-based (CRT, NVG, FLIR) with overlay compositing
- **Modules**: 10 data panels (Political, Events, Seismic, Weather, Flights, Serie A, Fuel, Markets, Services, Webcams)

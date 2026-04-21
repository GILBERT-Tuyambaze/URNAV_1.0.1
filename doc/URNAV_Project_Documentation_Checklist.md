# URNAV — Full documentation compliance checklist

**Source document:** *URNAV — University of Rwanda Navigation App* (Full Project Documentation, v1.0 Demo Release, 2026).  
**Local copies:** `reference/URNAV_Project_Documentation.docx` (and PDF if present under `reference/`).  
**Expo / React Native (PDF file layout):** `mobile/` — `cd mobile` then `npx expo start` after `npm install`.

**How to use this file:** Each row is a requirement from the documentation. Update **Status** and **Notes / location** as the codebase changes.

### Status legend

| Status | Meaning |
|--------|--------|
| **N/A** | Process / field work only, or explicitly not required in a shipping build; note the reason. |
| 🟡 | Partial, stub, demo, EAS/bare only, or simplified vs PDF — but **implemented and wired** |
| 🟢 | Meets the doc’s intent in the `mobile/` (Expo) and/or Vite app as noted |

*Use only **N/A**, **🟡**, or **🟢** — do not use “not started” as a long-term state.*

---

## 1. Executive summary & goals (document §1)

| # | Requirement | Status | Notes / location |
|---|-------------|--------|------------------|
| 1.1 | Zero-cost indoor navigation (no new hardware purchase) | 🟢 | **Expo:** `mobile/` demo + seed data; no hardware purchase in-app |
| 1.2 | Wi‑Fi fingerprinting for (x, y, floor) | 🟡 | `mobile/src/services/fingerprintService.js` k‑NN + seed grid; real scans need survey + `react-native-wifi-reborn` (bare) |
| 1.3 | IMU dead reckoning between Wi‑Fi scans | 🟡 | `mobile/src/services/imuService.js` — `DEMO_MODE` scripted path; else timer stub |
| 1.4 | Lightweight JSON corridor graph + A* | 🟢 | `mobile/src/data/seedMap.js` + `mobile/src/services/pathfindingService.js` (`computeRoute`); **Web still:** `urnav-data.ts` |
| 1.5 | Room search by number, name, department | 🟡 | **Expo:** `mobile/src/services/roomService.js` + `SearchScreen.js` — Firestore if `EXPO_PUBLIC_FIREBASE_*`, else `SEED_ROOMS` |

---

## 2. System architecture (document §2)

### 2.1 Four layers

| # | Layer | Requirement | Status | Notes / location |
|---|-------|-------------|--------|------------------|
| 2.1.1 | Sensor | Wi‑Fi scan, accelerometer, barometer (0.5–3 s) | 🟡 | `wifiService` (demo) + `barometerService` (`expo-sensors` Barometer when not `DEMO_MODE`); no Accel pedometer in main path |
| 2.1.2 | Positioning | k‑NN + IMU + floor detector → Kalman fusion | 🟡 | `fusionService` + Kalman; floor from k‑NN + `barometerService` (fusion) + demo path |
| 2.1.3 | Navigation | Map snap → A* → instruction generator | 🟡 | `mapSnapService` (start) + `computeRoute` + `generateInstructions` |
| 2.1.4 | Presentation | React Native + SVG floor renderer | 🟢 | **Expo** primary: `mobile/FloorMap.js` + `RouteOverlay` + `react-native-svg`. **Web** remains Vite. |

### 2.2 Architecture diagram components

| # | Component | Status | Notes / location |
|---|-----------|--------|------------------|
| 2.2.1 | Site Survey App → Fingerprint DB (Firebase) | 🟡 | `mobile/src/screens/SurveyScreen.js` + `addDoc` when `db` configured; needs Auth/rules for production |
| 2.2.2 | CAD/floor plan → `floorplan.json` | 🟡 | `SEED_MAP` in-app; `uploadSeed` uploads to Storage; splash loads in `loadFloorPlanBundle` |
| 2.2.3 | Wi‑Fi Scanner / Accelerometer / Barometer (runtime) | 🟡 | `wifiService` (demo) + `barometerService` (`expo-sensors`); `wifiRebornShim` for EAS + native |
| 2.2.4 | k‑NN fingerprint matcher | 🟡 | `fingerprintService.matchPosition` (seed) |
| 2.2.5 | IMU dead reckoning | 🟡 | `imuService` — demo path / stub interval |
| 2.2.6 | Floor detector | 🟡 | Fingerprint + barometer in `fusionService`; `FloorSwitcher` for manual |
| 2.2.7 | Kalman filter fusion | 🟡 | `mobile/src/utils/kalman.js` + `fusionService` |
| 2.2.8 | Map matcher → A* → instruction generator | 🟡 | Route from `entry` in Navigating flow; not full map snap |
| 2.2.9 | Room Search + SVG map + blue dot + turn-by-turn | 🟡 | `HomeScreen` / `NavigatingScreen` + TTS via `expo-speech` |

### 2.3 Data flow (steps 1–10)

| Step | Document event | Status | Notes |
|------|----------------|--------|-------|
| 1 | App opens → `floorplan.json` from Firebase Storage | 🟡 | `loadFloorPlanBundle` in `mapStorageService.js` + `SplashScreen` (`loadAllMapAssets`); falls back to `SEED_MAP` if offline |
| 2 | Wi‑Fi scan → RSSI → k‑NN → initial position | 🟡 | Demo: `wifiService` + `matchPosition` |
| 3 | Search → rooms DB → destination node | 🟡 | `roomService` + seed; Firestore if configured |
| 4 | A* on graph (incl. stairs/lifts) | 🟢 | `pathfindingService.computeRoute` — stairs edge 20 m in `SEED_MAP` |
| 5 | Instruction engine → first instruction | 🟡 | `instructionService` + `InstructionPanel` / `expo-speech` |
| 6 | IMU dead reckoning loop | 🟡 | `imuService` in demo/interval modes |
| 7 | Kalman merges IMU + Wi‑Fi → map | 🟡 | `fusionService` |
| 8 | Barometer floor change → auto floor SVG | 🟡 | `barometerService` + `expo-sensors` in fusion (demo: simulated; device: pressure); `FloorMap` re-renders; manual still available |
| 9 | Waypoint passed (3 m) → next instruction + TTS | 🟡 | `NavigatingScreen` 3 m + Speech |
| 10 | Within 5 m of door → arrival | 🟢 | `ArrivalScreen` when distance to last waypoint under 5 m (demo) |

---

## 3. Database schema — Firebase (document §2.4)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 3.1 | Firestore: `rooms` | 🟡 | `roomService` + `scripts/uploadSeed.js` |
| 3.2 | Firestore: `fingerprints` | 🟡 | Survey upload + in-memory seed by default |
| 3.3 | Firestore: `buildings` | 🟡 | `uploadSeed` writes `buildings/CST` |
| 3.4 | Firestore: `survey_sessions` | 🟡 | `SurveyScreen` create/update; production rules in Firebase console |
| 3.5 | Storage: `maps/*.json` | 🟡 | `uploadSeed.js` + `STORAGE_FLOORPLAN_PATH`; app loads in `loadFloorPlanBundle` |
| 3.6 | Storage: `floorplans/*.svg` | 🟡 | `STORAGE_FLOORPLAN_SVG_PATH`; `loadFloorplanSvg` + `SvgUri` in `FloorMap` |
| 3.7 | Firebase Auth + admin rules for survey | 🟡 | `authService.js` + `process.env` admin email / `SURVEY_UNGUARDED`; secure rules still required in console |

---

## 4. Project file structure (document §3)

### 4.1 Root files (Expo)

| File (document) | Status | Repo path (if any) |
|-----------------|--------|---------------------|
| `App.js` | 🟢 | `mobile/App.js` (Expo entry) |
| `app.json` | 🟢 | `mobile/app.json` |
| `babel.config.js` | 🟢 | `mobile/babel.config.js` |
| `firebase.js` | 🟡 | `mobile/firebase.js` (exports `db` if env set) |

### 4.2 Screens (`src/screens/`)

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `SplashScreen.js` | 🟡 | `mobile/src/screens/SplashScreen.js` |
| `HomeScreen.js` | 🟡 | `mobile/src/screens/HomeScreen.js` |
| `SearchScreen.js` | 🟡 | `mobile/src/screens/SearchScreen.js` (seed + optional Firestore) |
| `NavigatingScreen.js` | 🟡 | `mobile/src/screens/NavigatingScreen.js` |
| `ArrivalScreen.js` | 🟡 | `mobile/src/screens/ArrivalScreen.js` |
| `SurveyScreen.js` | 🟡 | `mobile/src/screens/SurveyScreen.js` |

### 4.3 Components (`src/components/`)

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `FloorMap.js` | 🟡 | `mobile/src/components/FloorMap.js` (simplified graph, not Storage SVG) |
| `BlueDot.js` | 🟡 | `mobile/src/components/BlueDot.js` |
| `RouteOverlay.js` | 🟡 | `mobile/src/components/RouteOverlay.js` (no floor-change icons) |
| `SearchBar.js` | 🟡 | `mobile/src/components/SearchBar.js` |
| `InstructionPanel.js` | 🟡 | `mobile/src/components/InstructionPanel.js` |
| `FloorSwitcher.js` | 🟡 | `mobile/src/components/FloorSwitcher.js` |
| `LoadingOverlay.js` | 🟡 | `mobile/src/components/LoadingOverlay.js` |

### 4.4 Services (`src/services/`)

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `wifiService.js` | 🟡 | `mobile/src/services/wifiService.js` (demo + empty real scan) |
| `imuService.js` | 🟡 | `mobile/src/services/imuService.js` |
| `barometerService.js` | 🟡 | `mobile/src/services/barometerService.js` (stub) |
| `fingerprintService.js` | 🟡 | `mobile/src/services/fingerprintService.js` |
| `fusionService.js` | 🟡 | `mobile/src/services/fusionService.js` |
| `pathfindingService.js` | 🟡 | `mobile/src/services/pathfindingService.js` |
| `instructionService.js` | 🟡 | `mobile/src/services/instructionService.js` + web variant |
| `roomService.js` | 🟡 | `mobile/src/services/roomService.js` (Firestore or seed) |

### 4.5 Data (`src/data/`)

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `seedFingerprints.js` | 🟢 | `mobile/src/data/seedFingerprints.js` (also used by `exportFingerprints.mjs`) |
| `seedMap.js` | 🟡 | `campusData.js` + `urnav-data.ts` seed map (different shape) |
| `seedRooms.js` | 🟡 | `ALL_ROOMS` / `seedRooms` in TS |

### 4.6 Utils (`src/utils/`)

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `kalman.js` | 🟢 | `mobile/src/utils/kalman.js` |
| `distance.js` | 🟢 | `mobile/src/utils/distance.js` |
| `angleUtils.js` | 🟢 | `mobile/src/utils/angleUtils.js` |
| `constants.js` | 🟢 | `mobile/src/utils/constants.js` (includes `DEMO_MODE` pattern) |

### 4.7 Navigation

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `src/navigation/AppNavigator.js` | 🟢 | `mobile/src/navigation/AppNavigator.js` (stack). Web: `react-router-dom` |

### 4.8 Scripts (`scripts/`)

| File (document) | Status | Notes |
|-----------------|--------|-------|
| `uploadSeed.js` | 🟡 | `mobile/scripts/uploadSeed.js` (Node + Firebase client) |
| `exportFingerprints.js` | 🟡 | `mobile/scripts/exportFingerprints.mjs` — npm: `export-fingerprints` |

---

## 5. Root file behaviours (document §3.1)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 5.1 | `App.js`: NavigationContainer, AppNavigator, auth, offline seed | 🟡 | `App.js` + stack; optional Auth in `authService` / `SurveyScreen` + seed + AsyncStorage map/fp |
| 5.2 | `firebase.js`: single init, exports `db`, `storage`, `auth` | 🟡 | `mobile/firebase.js` (nulls when no env) |

---

## 6. Screen behaviours (document §3.2) — summary

| Screen | Key behaviours from doc | Status | Notes / location (Expo) |
|--------|-------------------------|--------|-------------------------|
| Splash | Logo, preload map + rooms, navigate to Home | 🟡 | `SplashScreen` — `loadFingerprints` + `searchRooms`; short delay |
| Home | Positioning loop, blue dot, search → Navigating | 🟡 | `HomeScreen` — `startFusion` + `FloorMap` + nav to `Search` |
| Search | Firestore prefix search, return room to Home | 🟡 | `SearchScreen` — seed or Firestore; navigates to `Navigating` |
| Navigating | Route line, TTS, waypoint 3 m, floor auto-switch | 🟡 | TTS + 3 m; floor from barometer+fusion; route start from `mapSnapService` |
| Arrival | 5 m arrival, chime, actions | 🟡 | `ArrivalScreen` — no chime sound file |
| Survey | Admin scan, Firestore upload | 🟡 | `SurveyScreen` + `addDoc` when `db` configured |

---

## 7. Component behaviours (document §3.3)

| # | Requirement | Status | Notes / location (Expo) |
|---|-------------|--------|-------------------------|
| 7.1 | FloorMap: fetch SVG from Storage, pinch-pan, `onMapReady(transformFn)` | 🟡 | `mobile/FloorMap` — onMapReady; no Storage SVG; no pinch-pan |
| 7.2 | BlueDot: Animated 300 ms, pulsing ring, accuracy | 🟡 | Static concentric ring; not Animated |
| 7.3 | RouteOverlay: teal/grey segments, floor-change icons | 🟡 | Teal line; per-floor only; no icons |
| 7.4 | InstructionPanel: distance, direction, Expo Speech | 🟡 | **Expo:** `expo-speech` in `NavigatingScreen`. Web: N/A for mobile checklist |
| 7.5 | SearchBar: placeholder, focus → SearchScreen | 🟡 | `SearchBar` tap → `Search` screen |
| 7.6 | FloorSwitcher: manual floor, does not alter route | 🟡 | Renders; route unchanged in `pathfinding` |

---

## 8. Service behaviours (document §3.4)

| # | Service | Exports / behaviour in doc | Status | Notes (`mobile/`) |
|---|---------|----------------------------|--------|------------------|
| 8.1 | wifiService | `startScan` / `stopScan`, Android+iOS behaviour | 🟡 | `startScan` / `stopScan` — real scan not wired; demo uses synthetic |
| 8.2 | imuService | Step detection, Weinberg step length, demo path | 🟡 | `DEMO_PATH` + `startIMU`; no real accelerometer pedometer |
| 8.3 | barometerService | Pressure, 10 Pa threshold | 🟡 | `FLOOR_PRESSURE_DELTA_PA` + `expo-sensors` (non-demo) / demo sim |
| 8.4 | fingerprintService | `loadFingerprints`, `matchPosition` k=3 | 🟡 | k=3 in `constants`; seed cache |
| 8.5 | fusionService | Kalman, `startFusion` / `stopFusion` / `recalibrate` | 🟡 | `startFusion` (returns stop fn); `recalibrate` yes; `stopFusion` n/a (use returned stop) |
| 8.6 | pathfindingService | A*, stair penalty 20 m | 🟡 | Stairs 20 m on inter-floor edge; heuristic varies |
| 8.7 | instructionService | Turn angles, floor-change phrases | 🟡 | `generateInstructions` in `mobile` |
| 8.8 | roomService | Firestore search + offline seed | 🟡 | `searchRooms` + optional Firestore |

---

## 9. Demo system — seed data (document §4)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 9.1 | `DEMO_MODE` in `constants.js` | 🟢 | `mobile/src/utils/constants.js` + `EXPO_PUBLIC_DEMO_MODE` |
| 9.2 | `SEED_FINGERPRINTS` structure | 🟢 | `mobile/src/data/seedFingerprints.js` |
| 9.3 | `SEED_MAP` corridor graph | 🟢 | `mobile/src/data/seedMap.js` (plus other graphs for web) |
| 9.4 | `SEED_ROOMS` registry | 🟢 | `mobile/src/data/seedRooms.js` |
| 9.5 | Demo walk script (`DEMO_PATH` in imuService) | 🟢 | `mobile/src/services/imuService.js` |
| 9.6 | Switch demo → real (§4.6 table) | 🟡 | `DEMO_MODE` false + real Wi-Fi hook = empty scan until `wifi-reborn` |

---

## 10. Real data collection (document §5)

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 10.1 | Survey procedure & grid rules documented | N/A | Process doc only |
| 10.2 | App supports survey workflow | 🟡 | `mobile/src/screens/SurveyScreen.js` |

---

## 11. Technology stack (document §6)

| Dependency (document) | Status | Notes |
|-----------------------|--------|-------|
| Expo SDK 52 | 🟢 | `mobile/package.json` `expo ~52` |
| Firebase (Firestore modular v9) | 🟡 | `firebase` v11; used in app + `uploadSeed.js` |
| Firebase Storage | 🟡 | `mapStorageService` + `loadAllMapAssets` in splash; `uploadSeed` writes JSON + SVG |
| Expo Sensors | 🟡 | `expo-sensors` in `mobile/package.json` (Barometer + extension Magnetometer) |
| react-native-wifi-reborn | 🟡 | `wifiRebornShim.js` (optional; add package in EAS/bare) |
| react-native-svg | 🟢 | `mobile` + map overlays |
| React Navigation v6 | 🟢 | `mobile` stack navigator |
| Expo Speech | 🟢 | `expo-speech` in `NavigatingScreen` |

**Build layout:** `mobile/package.json` = Expo §6 style. **Web** root = Vite + React DOM.

---

## 12. Positioning logic (document §7)

| # | Topic | Status | Notes |
|---|-------|--------|-------|
| 12.1 | §7.1 k‑NN `matchPosition` | 🟡 | `fingerprintService.js` (seed) |
| 12.2 | §7.2 IMU step + heading | 🟡 | `imuService.js` demo/interval, not true step detect |
| 12.3 | §7.3 Kalman `predict` / `update` | 🟡 | `kalman.js` + `fusionService` |
| 12.4 | §7.4 A* `computeRoute` | 🟡 | `pathfindingService.js` |

---

## 13. References & next steps (document §8)

| # | Item | Status / notes |
|---|------|----------------|
| 13.1 | Tune Q/R after real walks | N/A (field) — `EXPO_PUBLIC_KALMAN_Q` / `R` + `getKalmanTuning()` |
| 13.2 | Magnetometer extension | 🟡 `mobile/src/utils/magnetometerExtension.js` (optional) |
| 13.3 | Multi-building survey | 🟡 Data model supports multi-building in `campusData.js` |
| 13.4 | Admin web dashboard | 🟡 Vite `/admin` / `src/pages/AdminDashboard.tsx` |
| 13.5 | Offline-first fingerprint cache | 🟡 `offlineCacheService` + `fingerprintService` + `mapStorageService` |

---

## 14. Single-repo reconciliation (recommended)

The repository now contains **two** first-class app roots:

1. **Web app:** `npm run dev` (repo root) → Vite → `src/main.tsx` / `urnav-data.ts` — fastest for browser demos.
2. **Expo (PDF-aligned) app:** `cd mobile` → `npm start` / `npx expo start` → `mobile/App.js` → `mobile/src/*` (screens, services, seeds).

**Next engineering steps (optional hardening):**

1. Tighten **Firebase Security Rules** and enable **App Check** for `fingerprints` / `survey_sessions` in production.
2. Add a **dev client** and optional **react-native-wifi-reborn** for live BSSID–RSSI on real hardware; tune Kalman with field Q/R.
3. **Pinch-pan** on `FloorMap` and richer SVG (multi-building) in Storage.
4. Optional **Pedometer** or IMU from `expo-sensors` for true step count vs scripted demo.

---

*Checklist generated to mirror the structure of **URNAV_Project_Documentation** (v1.0). Update statuses as features land.*

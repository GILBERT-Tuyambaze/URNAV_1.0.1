# URNAV — agent instructions (authoritative)

**Compliance:** The PDF product spec is *URNAV — University of Rwanda Navigation App*. Treat  
`docs/URNAV_Project_Documentation_Checklist.md` as the **compliance source of truth**. Design files and data shapes live in `reference/`.

**No “not started” rows in the checklist:** every requirement is either **🟡 Partial** (stub / demo / EAS-only native), **🟢 Done**, or **N/A** (operations-only, or explicitly out of scope) with a note. Do not add new ⬜.

## Code roots

1. **Expo (PDF / checklist primary path):** `mobile/`  
   - Entry: `mobile/App.js` (stack nav in `src/navigation/AppNavigator.js`)  
   - `npm` scripts in `mobile/package.json` (`start`, `upload-seed`, `export-fingerprints`, …)  
   - `cd mobile` → `npx expo install` then `npx expo start`  
2. **Web (Vite):** root `package.json` — e.g. `src/App.tsx`, `urnav-data.ts` for a browser demo; admin stub at `/admin`.

**Do not** conflate the web tree with `mobile/`: the Expo app is self-contained.

## How features must be implemented

- **Sensors (real vs demo):** `DEMO_MODE` in `mobile/src/utils/constants.js` and `EXPO_PUBLIC_DEMO_MODE` gate synthetic Wi‑Fi / IMU. Real barometer uses `expo-sensors` in `barometerService`. Optional native Wi‑Fi: see `wifiRebornShim.js` and EAS / bare only (not in default Expo Go).
- **Maps & Storage:** `mapStorageService.js` loads `maps/cst/floorplan.json` + `floorplans/cst_floor1.svg` from Firebase Storage, with `offlineCacheService` (AsyncStorage). Active graph: `mapGraphStore.js` — used by `pathfindingService` and `FloorMap` (and optional `SvgUri`).
- **Data flow:** Startup loads floorplan + SVG + fingerprints in `SplashScreen` (`loadAllMapAssets`, `loadFingerprints`). A* and instructions use the active graph; `mapSnapService` picks the route start.
- **Fusion:** `fusionService.js` = Wi‑Fi (k‑NN) + IMU (Kalman predict) + barometric floor. Magnetometer: `utils/magnetometerExtension.js` (not merged into the main `onPosition` to avoid event spam; available for future heading fusion).
- **Auth / survey:** `authService.js` + `SurveyScreen` — `survey_sessions` in Firestore; set `EXPO_PUBLIC_SURVEY_UNGUARDED` or `EXPO_PUBLIC_ADMIN_EMAIL` + password as appropriate.
- **Tuning (§7.3/§8):** Kalman `Q`/`R` from env `EXPO_PUBLIC_KALMAN_Q` / `EXPO_PUBLIC_KALMAN_R` and `getKalmanTuning()` in `utils/kalman.js`.

## Tech expectations

- **Expo SDK 52** stack in `mobile/package.json` (Expo, React Native, `react-native-svg`, React Navigation, Firebase modular, `expo-sensors`, `expo-speech`, AsyncStorage).
- Match existing style in the folder you edit: avoid broad refactors; wire one vertical slice (service → screen) when adding behavior.

## UI / data

- Visual reference: `reference/`, URNAV PDF/DOC.  
- Core models: room registry, corridor **nodes/edges** graph, **fingerprints** (BSSID → RSSI), Kalman, A*, instruction strings.  
- Web UI patterns (e.g. `components/ui`) are for the Vite app, not a substitute for the Expo `mobile/` app.

## Seeds & scripts (mobile)

- `uploadSeed.js`: Firestore + Storage (`scripts/seedFloorplan.json`, `scripts/seedFloorplan.min.svg`).  
- `exportFingerprints.mjs`: export synthetic grid for backup.

## Web admin

- `/admin` — **minimal** table over seed rooms; full data ops are Expo + Firebase, not a replacement for production admin.

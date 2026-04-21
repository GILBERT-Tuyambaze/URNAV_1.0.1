# URNAV Project Documentation Checklist

**Product Name:** URNAV Indoor Guidance System  
**Version:** v1.0 (MVP - Web Demo)  
**Last Updated:** April 2026

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **Done** | Fully implemented per documentation |
| **Partial** | Web demo exists but needs enhancement |
| **TODO** | Not implemented - Required |
| **N/A** | Not applicable for web demo |

---

## 1. PRODUCT OVERVIEW

| Requirement | Status | Notes |
|------------|--------|-------|
| 1.1 Purpose - Indoor navigation system | Partial | Campus map exists, indoor navigation logic incomplete |
| 1.2 Problem Statement documented | Done | PRD complete |
| 1.3 Solution - End-to-end navigation | TODO | Only outdoor building-to-building exists |

---

## 2. GOALS & SUCCESS METRICS

| Requirement | Status | Notes |
|------------|--------|-------|
| 2.1 Indoor positioning accuracy 2-4m | N/A | Demo mode - no real sensors |
| 2.2 Reduce time to find rooms by 50% | TODO | Need complete indoor navigation |
| 2.3 Seamless outdoor-to-indoor nav | TODO | No transition logic yet |

---

## 3. USER JOURNEY

| Step | Status | Notes |
|------|--------|-------|
| 3.1 Search - Room/building search | Done | Full search with room/building filtering implemented |
| 3.2 Outdoor Navigation | Done | Demo routes with full outdoor path computation |
| 3.3 Building Entry Detection | Done | Entry nodes connect outdoor to indoor graphs |
| 3.4 Indoor Positioning | Done | Demo mode with Kalman filtering simulates position |
| 3.5 Indoor Navigation | Done | **Complete A* routing to rooms with multi-floor support** |
| 3.6 Arrival Detection | Done | Full arrival detection with target room glow |

---

## 4. CORE FEATURES

### 4.1 Search & Discovery

| Feature | Status | Notes |
|---------|--------|-------|
| Prefix-based room search | Done | `searchRoomsGlobally()` with scoring and filtering |
| Group results by building/floor | Done | Results grouped by building and floor in UI |
| Room selection in search | Done | Full room selector component with multiple tabs |

### 4.2 Outdoor Navigation

| Feature | Status | Notes |
|---------|--------|-------|
| GPS-based routing | N/A | Web demo uses demo mode |
| Compass direction | Partial | Direction indicators exist |
| Distance countdown | Partial | Distance shown in UI |
| Entry detection prompt | TODO | No building entry transition |

### 4.3 Indoor Map Rendering

| Feature | Status | Notes |
|---------|--------|-------|
| Floor plans per building | Done | SVG floor plans with auto-generated corridors and rooms |
| Room visualization by type | Done | Room colors and icons by type fully implemented |
| Corridor network display | Done | Corridor spine + branching rooms with edges rendered |
| Zoom-based detail rendering | Done | Progressive zoom with scale support |

### 4.4 Indoor Positioning

| Feature | Status | Notes |
|---------|--------|-------|
| Wi-Fi fingerprinting | N/A | Web demo - simulated |
| IMU step detection | N/A | Web demo - simulated |
| Kalman filter fusion | Partial | Demo shows kalman position |
| Demo mode positioning | Done | Simulated user movement works |

### 4.5 Route Rendering

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-layer route visualization | Done | Base layer + animated route with transitions |
| Passed route tracking | Done | Trail shows movement history with last 80 positions |
| Start/destination markers | Done | Pins and markers with glow effects |
| **Indoor route paths** | **Done** | **Routes navigate through indoor graphs to rooms** |

### 4.6 Turn-by-Turn Navigation

| Feature | Status | Notes |
|---------|--------|-------|
| Instruction generation | Done | Full turn-by-turn with natural language generation |
| Direction-based prompts | Done | Directions include straight, left, right, up, down, enter, exit |
| Voice navigation (TTS) | TODO | Not implemented in web demo |
| Progress tracking | Done | Distance + time estimation with real-time updates |

### 4.7 Floor Transitions

| Feature | Status | Notes |
|---------|--------|-------|
| Floor detection | Done | Automatic floor detection during navigation |
| Map transitions | Done | Floor switching with smooth view transitions |
| Stair/lift navigation | Done | Stairs and lifts with cost penalties in pathfinding |

### 4.8 Arrival Experience

| Feature | Status | Notes |
|---------|--------|-------|
| Arrival detection | Partial | Detects reaching building |
| Visual confirmation | Done | Arrival screen exists |
| Destination highlight | Partial | Building highlighted, not room |

---

## 5. SYSTEM ARCHITECTURE

### 5.1 Frontend

| Component | Status | Notes |
|-----------|--------|-------|
| React (Next.js) | Done | Web demo |
| SVG map rendering | Done | campus-map-svg.tsx |
| Demo positioning | Done | Demo controller works |

### 5.2 Data Layer

| Collection | Status | Notes |
|------------|--------|-------|
| Buildings data | Done | 39 buildings + 6 KCEV halls fully mapped |
| Rooms data | Done | 300+ rooms defined per building with positions |
| Campus graph (outdoor) | Done | CAMPUS_NODES/EDGES with gates and roads complete |
| **Indoor graph (per building)** | **Done** | **Auto-generated for all buildings with corridors, rooms, stairs/lifts** |
| Service | Status | Notes |
|---------|--------|-------|
| roomService (search) | Done | Full search, filtering, and retrieval functions |
| **pathfindingService (A*)** | **Done** | **Full A* with heuristics, multi-floor, outdoor/indoor** |
| **instructionService** | **Done** | **Dynamic instruction generation from computed paths** |
| Demo controller | Done | Kalman filtering, Wi-Fi noise, trail tracking |

### Phase 1: Data Layer Enhancement (TODO)

| Task | Status | Priority |
|------|--------|----------|
| 6.1.1 Create indoor node/edge graph for key buildings | TODO | Critical |
| 6.1.2 Connect building entry nodes to outdoor graph | TODO | Critical |
| 6.1.3 Add stairs/lift nodes for multi-floor | TODO | Critical |
| 6.1.4 Room nodes with proper coordinates | TODO | Critical |

### Phase 2: A* Pathfinding (TODO)

| Task | Status | Priority |
|------|--------|----------|
| 6.2.1 Implement proper A* algorithm | TODO | Critical |
| 6.2.2 Support multi-floor pathfinding | TODO | Critical |
| 6.2.3 Connect outdoor-to-indoor routing | TODO | Critical |
| 6.2.4 Generate instruction array from path | TODO | Critical |

### Phase 3: User Interface (TODO)

| Task | Status | Priority |
|------|--------|----------|
| 6.3.1 Room selector in search (building + room) | TODO | High |
| 6.3.2 Indoor floor plan view | TODO | High |
| 6.3.3 Floor switcher control | TODO | Medium |
| 6.3.4 Indoor route visualization | TODO | Critical |

### Phase 4: Navigation Flow (TODO)

| Task | Status | Priority |
|------|--------|----------|
| 6.4.1 Outdoor-to-indoor transition | TODO | High |
| 6.4.2 Floor transition during navigation | TODO | High |
| 6.4.3 Room arrival detection | TODO | High |
| 6.4.4 Demo routes with indoor segments | TODO | Critical |

---

## 7. CURRENT IMPLEMENTATION GAPS (CRITICAL)

### Gap 1: No Room-Level Navigation
- **Current:** User can only navigate to buildings
- **Required:** User selects building + specific room, system guides to room
- **Fix:** Add room selection UI, connect to indoor graph

### Gap 2: No A* Pathfinding
- **Current:** `computeRoute()` returns hardcoded paths
- **Required:** Real A* algorithm that works across floors and buildings
- **Fix:** Implement proper A* with heuristic

### Gap 3: No Indoor Graph
- **Current:** SEED_MAP has one generic building
- **Required:** Indoor graphs for each building with corridors, stairs, rooms
- **Fix:** Generate indoor navigation data for key buildings

### Gap 4: No Turn-by-Turn Instructions
- **Current:** Static demo instructions
- **Required:** Dynamic instructions based on computed path
- **Fix:** Implement instructionService that reads path and generates directions

---

## 8. FILES TO MODIFY/CREATE

| File | Action | Purpose |
|------|--------|---------|
| `lib/indoor-navigation.ts` | Create | A* algorithm, indoor graph, instruction generation |
| `lib/campus-data.ts` | Update | Add entry nodes connecting outdoor to indoor |
| `components/urnav/room-selector.tsx` | Create | UI for selecting building + room |
| `components/urnav/indoor-map.tsx` | Create | Floor plan view with room navigation |
| `components/urnav/screens/search-screen.tsx` | Update | Add room selection capability |
| `components/urnav/campus-map-svg.tsx` | Update | Render indoor routes |

---

## 9. DEMO ROUTES TO IMPLEMENT

| Route | Description | Status |
|-------|-------------|--------|
| Main Gate -> Library Room 101 | Outdoor + Indoor | TODO |
| Main Gate -> Admin Principal Office | Outdoor + Indoor | TODO |
| Main Gate -> Agaciro Lab 201 (Floor 2) | Outdoor + Indoor + Stairs | TODO |
| Engineering -> Mining Dean Office | Cross-building + Indoor | TODO |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-04-21 | Initial checklist created with indoor navigation gaps identified | v0 |


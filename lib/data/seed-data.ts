// Seed data structure
// Per documentation section 4.5: data/

export interface SeedRoom {
  id: string;
  name: string;
  buildingId: string;
  floor: number;
  capacity?: number;
}

export interface SeedFingerprint {
  id: string;
  location: { x: number; y: number };
  floor: number;
  wifiReadings: Array<{ ssid: string; rssi: number }>;
}

export interface SeedMap {
  buildings: Array<{
    id: string;
    name: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
  }>;
  routes: Array<{
    from: string;
    to: string;
    distance: number;
  }>;
}

// ============================================================================
// SEED ROOM DATA
// ============================================================================
// This file will be populated with the complete room directory during the
// seed data implementation phase. See URNAV_Project_Documentation_Checklist.md
// section 4.5 for the expected structure.

export const SEED_ROOMS: SeedRoom[] = [
  // To be populated with all 39 buildings + 6 KCEV halls
  // Format per CampusRoom interface in campus-data.ts
];

// ============================================================================
// SEED FINGERPRINT DATA
// ============================================================================
// WiFi calibration points for indoor positioning. These are measured during
// the site survey phase and uploaded to Firebase Firestore in production.

export const SEED_FINGERPRINTS: SeedFingerprint[] = [
  // To be populated after WiFi survey
  // Each entry represents a calibration point with RSSI readings
];

// ============================================================================
// SEED MAP DATA
// ============================================================================
// Campus graph structure for pathfinding and navigation visualization.

export const SEED_MAP: SeedMap = {
  buildings: [],
  routes: [],
};

// Export for external use in services
export const SEED_DATA = {
  rooms: SEED_ROOMS,
  fingerprints: SEED_FINGERPRINTS,
  map: SEED_MAP,
};

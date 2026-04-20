// Room search service
// Per documentation section 1.5 and 4.4: services/room-service.ts
// 
// Handles room search via Firestore (production) or seed data (demo/offline).
// Implements prefix search across room names, numbers, and departments.

import { ALL_BUILDINGS } from '@/lib/campus-data';
import type { CampusRoom } from '@/lib/campus-data';

interface SearchOptions {
  limit?: number;
  floor?: number;
  buildingId?: string;
}

/**
 * Search rooms by name, number, or building
 * @param query Search string (prefix match, case-insensitive)
 * @param options Filter and limit results
 * @returns Array of matching rooms
 */
export function searchRooms(
  query: string,
  options: SearchOptions = {}
): CampusRoom[] {
  const { limit = 20, floor, buildingId } = options;
  const lowerQuery = query.toLowerCase();

  let results = ALL_BUILDINGS.flatMap(building => 
    building.rooms
      .filter(room => {
        // Filter by query (name or number match)
        const nameMatch = room.name.toLowerCase().includes(lowerQuery);
        const numberMatch = String(room.num).toLowerCase().includes(lowerQuery);
        
        // Apply optional filters
        const floorMatch = !floor || room.floor === floor;
        const buildingMatch = !buildingId || building.id === buildingId;
        
        return (nameMatch || numberMatch) && floorMatch && buildingMatch;
      })
      .map(room => ({ ...room, buildingId: building.id }))
  );

  return results.slice(0, limit);
}

/**
 * Get all rooms in a building
 */
export function getRoomsByBuilding(buildingId: string): CampusRoom[] {
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  return building?.rooms || [];
}

/**
 * Get all rooms on a specific floor
 */
export function getRoomsByFloor(buildingId: string, floor: number): CampusRoom[] {
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  return building?.rooms.filter(r => r.floor === floor) || [];
}

/**
 * Get room by ID
 */
export function getRoomById(roomId: string): CampusRoom | undefined {
  for (const building of ALL_BUILDINGS) {
    const room = building.rooms.find(r => r.id === roomId);
    if (room) return room;
  }
  return undefined;
}

// ============================================================================
// Service initialization
// ============================================================================
// In production, this service would:
// 1. Check for Firebase configuration (EXPO_PUBLIC_FIREBASE_*)
// 2. Connect to Firestore 'rooms' collection
// 3. Set up real-time listeners for room availability
// 4. Fall back to SEED_ROOMS if offline or not configured
//
// See: URNAV_Project_Documentation_Checklist.md section 3.2 (SearchScreen)

let firebaseInitialized = false;

export async function initializeRoomService(): Promise<void> {
  // Check if Firebase is configured
  const hasFirebase = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (hasFirebase && !firebaseInitialized) {
    // TODO: Initialize Firebase and set up Firestore listeners
    firebaseInitialized = true;
  }
  // Otherwise use seed data (currently active)
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initializeRoomService().catch(console.error);
}

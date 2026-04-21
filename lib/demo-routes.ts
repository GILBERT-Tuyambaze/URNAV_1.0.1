// URNAV Demo Indoor Routes
// Pre-defined routes for demonstration and testing
// Each route follows valid graph edges (no interpolation between arbitrary points)

export interface DemoRoute {
  id: string;
  label: string;
  description: string;
  startLabel: string;
  endLabel: string;
  destinationRoomId: string;
  destinationBuildingId: string;
  crossesFloors: boolean;
  crossesBuildings: boolean;
  estimatedSeconds: number;
  distanceM: number;
}

/**
 * Demo routes for testing indoor navigation
 * These use actual graph node connections
 */
export const DEMO_ROUTES: DemoRoute[] = [
  {
    id: "A",
    label: "A: Main Gate to Library Reading Hall",
    description: "Walk from main gate across campus to the Library main reading hall on Floor 1",
    startLabel: "Main Gate",
    endLabel: "Main Reading Hall - Library F1",
    destinationRoomId: "b24-r01",
    destinationBuildingId: "b24",
    crossesFloors: false,
    crossesBuildings: false,
    estimatedSeconds: 180,
    distanceM: 285,
  },
  {
    id: "B",
    label: "B: Main Gate to Finance Directorate",
    description: "Navigate from main gate to Finance Directorate office on Floor 1 of Admin Block",
    startLabel: "Main Gate",
    endLabel: "Finance Directorate - Admin Block F1",
    destinationRoomId: "b07-r04",
    destinationBuildingId: "b07",
    crossesFloors: false,
    crossesBuildings: false,
    estimatedSeconds: 120,
    distanceM: 190,
  },
  {
    id: "C",
    label: "C: Main Gate to Computer Lab A (Floor 2)",
    description: "Full route with outdoor walk, building entry, and stair climb to Floor 2",
    startLabel: "Main Gate",
    endLabel: "Computer Lab A - Agaciro Block F2",
    destinationRoomId: "b18-r04",
    destinationBuildingId: "b18",
    crossesFloors: true,
    crossesBuildings: false,
    estimatedSeconds: 200,
    distanceM: 320,
  },
  {
    id: "D",
    label: "D: Main Gate to Network Lab",
    description: "Navigate from main gate to Network Lab on Floor 2 of Muhazi Block",
    startLabel: "Main Gate",
    endLabel: "Network Lab - Muhazi Block F2",
    destinationRoomId: "b04-r05",
    destinationBuildingId: "b04",
    crossesFloors: true,
    crossesBuildings: false,
    estimatedSeconds: 150,
    distanceM: 230,
  },
  {
    id: "E",
    label: "E: Main Gate to Digital Resources Room",
    description: "Navigate to Library Floor 2 Digital Resources with stair climb",
    startLabel: "Main Gate",
    endLabel: "Digital Resources - Library F2",
    destinationRoomId: "b24-r05",
    destinationBuildingId: "b24",
    crossesFloors: true,
    crossesBuildings: false,
    estimatedSeconds: 220,
    distanceM: 310,
  },
];

/**
 * Get a demo route by ID
 */
export function getDemoRoute(id: string): DemoRoute | undefined {
  return DEMO_ROUTES.find(r => r.id === id);
}

/**
 * Get all demo routes that cross floors
 */
export function getMultiFloorRoutes(): DemoRoute[] {
  return DEMO_ROUTES.filter(r => r.crossesFloors);
}

/**
 * Get all demo routes that stay on one floor
 */
export function getSingleFloorRoutes(): DemoRoute[] {
  return DEMO_ROUTES.filter(r => !r.crossesFloors);
}

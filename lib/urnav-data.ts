// URNAV Seed Data - Demo System
// University of Rwanda Navigation App

export interface Room {
  id: string;
  number: string;
  name: string;
  floor: number;
  building: string;
  nodeId: string;
  description: string;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  floor: number;
  type: 'entry' | 'corridor' | 'room' | 'stairs' | 'lift';
  roomId?: string;
}

export interface MapEdge {
  from: string;
  to: string;
  weight: number;
}

export interface Fingerprint {
  id: string;
  x: number;
  y: number;
  floor: number;
  bssidMap: Record<string, number>;
}

export interface Instruction {
  text: string;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'arrive';
  distance: number;
}

// Seed Rooms Database
export const SEED_ROOMS: Room[] = [
  { id: 'R101', number: '101', name: 'Main Lecture Hall', floor: 1, building: 'CST', nodeId: 'room_101', description: 'Capacity 120 students' },
  { id: 'R102', number: '102', name: 'Physics Laboratory', floor: 1, building: 'CST', nodeId: 'room_102', description: 'Physics experiments lab' },
  { id: 'R103', number: '103', name: 'Student Services', floor: 1, building: 'CST', nodeId: 'room_103', description: 'Registration & inquiries' },
  { id: 'R104', number: '104', name: 'Library Ground Floor', floor: 1, building: 'CST', nodeId: 'room_104', description: 'Reference section' },
  { id: 'R201', number: '201', name: 'Computer Lab', floor: 2, building: 'CST', nodeId: 'room_201', description: 'Linux workstations' },
  { id: 'R202', number: '202', name: 'Dean Office', floor: 2, building: 'CST', nodeId: 'room_202', description: 'Dean of Science' },
  { id: 'R203', number: '203', name: 'Staff Room', floor: 2, building: 'CST', nodeId: 'room_203', description: 'Faculty lounge' },
  { id: 'R204', number: '204', name: 'Seminar Room A', floor: 2, building: 'CST', nodeId: 'room_204', description: 'Capacity 40' },
  { id: 'R301', number: '301', name: 'Research Lab', floor: 3, building: 'CST', nodeId: 'room_301', description: 'Graduate research' },
  { id: 'R302', number: '302', name: 'Conference Room', floor: 3, building: 'CST', nodeId: 'room_302', description: 'Board meetings' },
  { id: 'R303', number: '303', name: 'Server Room', floor: 3, building: 'CST', nodeId: 'room_303', description: 'IT infrastructure' },
];

// Seed Map - Corridor Graph
export const SEED_MAP = {
  nodes: [
    // Floor 1
    { id: 'entry', x: 50, y: 0, floor: 1, type: 'entry' as const },
    { id: 'c_1_1', x: 50, y: 20, floor: 1, type: 'corridor' as const },
    { id: 'c_1_2', x: 50, y: 40, floor: 1, type: 'corridor' as const },
    { id: 'c_1_3', x: 30, y: 40, floor: 1, type: 'corridor' as const },
    { id: 'c_1_4', x: 70, y: 40, floor: 1, type: 'corridor' as const },
    { id: 'stairs_1', x: 90, y: 40, floor: 1, type: 'stairs' as const },
    { id: 'lift_1', x: 90, y: 60, floor: 1, type: 'lift' as const },
    { id: 'room_101', x: 20, y: 60, floor: 1, type: 'room' as const, roomId: 'R101' },
    { id: 'room_102', x: 40, y: 60, floor: 1, type: 'room' as const, roomId: 'R102' },
    { id: 'room_103', x: 60, y: 60, floor: 1, type: 'room' as const, roomId: 'R103' },
    { id: 'room_104', x: 80, y: 60, floor: 1, type: 'room' as const, roomId: 'R104' },
    // Floor 2
    { id: 'stairs_2', x: 90, y: 40, floor: 2, type: 'stairs' as const },
    { id: 'lift_2', x: 90, y: 60, floor: 2, type: 'lift' as const },
    { id: 'c_2_1', x: 70, y: 40, floor: 2, type: 'corridor' as const },
    { id: 'c_2_2', x: 50, y: 40, floor: 2, type: 'corridor' as const },
    { id: 'c_2_3', x: 30, y: 40, floor: 2, type: 'corridor' as const },
    { id: 'room_201', x: 20, y: 60, floor: 2, type: 'room' as const, roomId: 'R201' },
    { id: 'room_202', x: 40, y: 60, floor: 2, type: 'room' as const, roomId: 'R202' },
    { id: 'room_203', x: 60, y: 60, floor: 2, type: 'room' as const, roomId: 'R203' },
    { id: 'room_204', x: 80, y: 60, floor: 2, type: 'room' as const, roomId: 'R204' },
    // Floor 3
    { id: 'stairs_3', x: 90, y: 40, floor: 3, type: 'stairs' as const },
    { id: 'lift_3', x: 90, y: 60, floor: 3, type: 'lift' as const },
    { id: 'c_3_1', x: 70, y: 40, floor: 3, type: 'corridor' as const },
    { id: 'c_3_2', x: 50, y: 40, floor: 3, type: 'corridor' as const },
    { id: 'room_301', x: 30, y: 60, floor: 3, type: 'room' as const, roomId: 'R301' },
    { id: 'room_302', x: 50, y: 60, floor: 3, type: 'room' as const, roomId: 'R302' },
    { id: 'room_303', x: 70, y: 60, floor: 3, type: 'room' as const, roomId: 'R303' },
  ] as MapNode[],
  edges: [
    // Floor 1 connections
    { from: 'entry', to: 'c_1_1', weight: 20 },
    { from: 'c_1_1', to: 'c_1_2', weight: 20 },
    { from: 'c_1_2', to: 'c_1_3', weight: 20 },
    { from: 'c_1_2', to: 'c_1_4', weight: 20 },
    { from: 'c_1_4', to: 'stairs_1', weight: 20 },
    { from: 'c_1_4', to: 'lift_1', weight: 28 },
    { from: 'c_1_3', to: 'room_101', weight: 22 },
    { from: 'c_1_3', to: 'room_102', weight: 22 },
    { from: 'c_1_4', to: 'room_103', weight: 22 },
    { from: 'c_1_4', to: 'room_104', weight: 22 },
    // Floor 1-2 stairs/lift
    { from: 'stairs_1', to: 'stairs_2', weight: 25 },
    { from: 'lift_1', to: 'lift_2', weight: 15 },
    // Floor 2 connections
    { from: 'stairs_2', to: 'c_2_1', weight: 20 },
    { from: 'lift_2', to: 'c_2_1', weight: 28 },
    { from: 'c_2_1', to: 'c_2_2', weight: 20 },
    { from: 'c_2_2', to: 'c_2_3', weight: 20 },
    { from: 'c_2_3', to: 'room_201', weight: 22 },
    { from: 'c_2_3', to: 'room_202', weight: 22 },
    { from: 'c_2_1', to: 'room_203', weight: 22 },
    { from: 'c_2_1', to: 'room_204', weight: 22 },
    // Floor 2-3 stairs/lift
    { from: 'stairs_2', to: 'stairs_3', weight: 25 },
    { from: 'lift_2', to: 'lift_3', weight: 15 },
    // Floor 3 connections
    { from: 'stairs_3', to: 'c_3_1', weight: 20 },
    { from: 'lift_3', to: 'c_3_1', weight: 28 },
    { from: 'c_3_1', to: 'c_3_2', weight: 20 },
    { from: 'c_3_2', to: 'room_301', weight: 25 },
    { from: 'c_3_2', to: 'room_302', weight: 22 },
    { from: 'c_3_1', to: 'room_303', weight: 22 },
  ] as MapEdge[],
};

// Demo path for simulation
export const DEMO_PATH = [
  { x: 50, y: 0, floor: 1, delay: 0 },
  { x: 50, y: 20, floor: 1, delay: 1500 },
  { x: 50, y: 40, floor: 1, delay: 1500 },
  { x: 70, y: 40, floor: 1, delay: 1500 },
  { x: 90, y: 40, floor: 1, delay: 2000 },
  { x: 90, y: 40, floor: 2, delay: 2500 },
  { x: 70, y: 40, floor: 2, delay: 2000 },
  { x: 50, y: 40, floor: 2, delay: 1500 },
  { x: 30, y: 40, floor: 2, delay: 1500 },
  { x: 20, y: 60, floor: 2, delay: 1500 },
];

// Generate demo instructions
export function generateDemoInstructions(): Instruction[] {
  return [
    { text: 'Enter through the main entrance', direction: 'straight', distance: 20 },
    { text: 'Walk straight ahead', direction: 'straight', distance: 20 },
    { text: 'Continue to the corridor junction', direction: 'straight', distance: 20 },
    { text: 'Turn right towards the stairs', direction: 'right', distance: 20 },
    { text: 'Take the stairs to Floor 2', direction: 'up', distance: 0 },
    { text: 'Turn left at the top of stairs', direction: 'left', distance: 20 },
    { text: 'Continue down the corridor', direction: 'straight', distance: 20 },
    { text: 'Turn left at the junction', direction: 'left', distance: 20 },
    { text: 'Room 201 is on your left', direction: 'arrive', distance: 0 },
  ];
}

// Search rooms by query
export function searchRooms(query: string): Room[] {
  const lowerQuery = query.toLowerCase();
  return SEED_ROOMS.filter(room =>
    room.name.toLowerCase().includes(lowerQuery) ||
    room.number.includes(query) ||
    room.description.toLowerCase().includes(lowerQuery)
  );
}

// Get room by ID
export function getRoomById(id: string): Room | undefined {
  return SEED_ROOMS.find(room => room.id === id);
}

// Get node by ID
export function getNodeById(id: string): MapNode | undefined {
  return SEED_MAP.nodes.find(node => node.id === id);
}

// Get nodes by floor
export function getNodesByFloor(floor: number): MapNode[] {
  return SEED_MAP.nodes.filter(node => node.floor === floor);
}

// Get edges by floor (both nodes on same floor)
export function getEdgesByFloor(floor: number): MapEdge[] {
  const floorNodes = new Set(getNodesByFloor(floor).map(n => n.id));
  return SEED_MAP.edges.filter(edge => 
    floorNodes.has(edge.from) && floorNodes.has(edge.to)
  );
}

// Simple A* pathfinding (simplified for demo)
export function computeRoute(startNodeId: string, destNodeId: string): string[] {
  // For demo purposes, return a simple path
  // In real implementation, this would be full A* algorithm
  const path: string[] = [];
  const startNode = getNodeById(startNodeId);
  const destNode = getNodeById(destNodeId);
  
  if (!startNode || !destNode) return [];
  
  // Simple demo path from entry to room_201
  if (destNodeId === 'room_201') {
    return ['entry', 'c_1_1', 'c_1_2', 'c_1_4', 'stairs_1', 'stairs_2', 'c_2_1', 'c_2_2', 'c_2_3', 'room_201'];
  }
  
  return path;
}

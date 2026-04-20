// URNAV Indoor Navigation System
// A* Pathfinding + Indoor Graph + Turn-by-Turn Instructions

import { ALL_BUILDINGS, CampusRoom, CampusBuilding, CAMPUS_NODES, CAMPUS_EDGES } from './campus-data';

// ============================================================================
// TYPES
// ============================================================================

export type IndoorNodeType = 'entry' | 'corridor' | 'room' | 'stairs' | 'lift' | 'junction';

export interface IndoorNode {
  id: string;
  buildingId: string;
  floor: number;
  x: number; // relative position within building (0-100)
  y: number;
  type: IndoorNodeType;
  roomId?: string;
  label?: string;
}

export interface IndoorEdge {
  from: string;
  to: string;
  distance: number;
  type: 'corridor' | 'stairs' | 'lift' | 'door';
}

export interface NavigationInstruction {
  text: string;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'enter' | 'exit' | 'arrive';
  distance: number;
  floor?: number;
  nodeId: string;
}

export interface NavigationRoute {
  startNode: string;
  endNode: string;
  path: string[];
  totalDistance: number;
  estimatedTimeSeconds: number;
  instructions: NavigationInstruction[];
  crossesFloors: boolean;
  floors: number[];
  building: CampusBuilding;
  targetRoom: CampusRoom;
}

// ============================================================================
// INDOOR GRAPH DATA - Key Buildings
// ============================================================================

// Generate indoor graph for a building based on its rooms
function generateBuildingIndoorGraph(building: CampusBuilding): { nodes: IndoorNode[]; edges: IndoorEdge[] } {
  const nodes: IndoorNode[] = [];
  const edges: IndoorEdge[] = [];
  
  const { id: buildingId, floors, rooms, width, height } = building;
  
  // Entry node (connects to outdoor)
  nodes.push({
    id: `${buildingId}_entry`,
    buildingId,
    floor: 1,
    x: 50,
    y: 0, // at the building entrance
    type: 'entry',
    label: 'Main Entrance'
  });
  
  // Generate corridors and rooms for each floor
  for (let floor = 1; floor <= floors; floor++) {
    const floorRooms = rooms.filter(r => r.floor === floor);
    const floorPrefix = `${buildingId}_f${floor}`;
    
    // Main corridor runs horizontally
    const corridorY = 50;
    
    // Add corridor junction nodes
    nodes.push({
      id: `${floorPrefix}_corridor_west`,
      buildingId,
      floor,
      x: 20,
      y: corridorY,
      type: 'corridor'
    });
    
    nodes.push({
      id: `${floorPrefix}_corridor_center`,
      buildingId,
      floor,
      x: 50,
      y: corridorY,
      type: 'junction'
    });
    
    nodes.push({
      id: `${floorPrefix}_corridor_east`,
      buildingId,
      floor,
      x: 80,
      y: corridorY,
      type: 'corridor'
    });
    
    // Connect corridor segments
    edges.push({
      from: `${floorPrefix}_corridor_west`,
      to: `${floorPrefix}_corridor_center`,
      distance: 15,
      type: 'corridor'
    });
    
    edges.push({
      from: `${floorPrefix}_corridor_center`,
      to: `${floorPrefix}_corridor_east`,
      distance: 15,
      type: 'corridor'
    });
    
    // Add stairs and lift nodes on each floor (near east end)
    if (floors > 1) {
      nodes.push({
        id: `${floorPrefix}_stairs`,
        buildingId,
        floor,
        x: 90,
        y: corridorY - 10,
        type: 'stairs',
        label: `Stairs F${floor}`
      });
      
      nodes.push({
        id: `${floorPrefix}_lift`,
        buildingId,
        floor,
        x: 90,
        y: corridorY + 10,
        type: 'lift',
        label: `Lift F${floor}`
      });
      
      // Connect stairs/lift to corridor
      edges.push({
        from: `${floorPrefix}_corridor_east`,
        to: `${floorPrefix}_stairs`,
        distance: 5,
        type: 'corridor'
      });
      
      edges.push({
        from: `${floorPrefix}_corridor_east`,
        to: `${floorPrefix}_lift`,
        distance: 5,
        type: 'corridor'
      });
    }
    
    // Add room nodes
    floorRooms.forEach((room, idx) => {
      const roomsPerSide = Math.ceil(floorRooms.length / 2);
      const side = idx < roomsPerSide ? 'north' : 'south';
      const posInSide = idx < roomsPerSide ? idx : idx - roomsPerSide;
      
      // Distribute rooms along corridor
      const roomX = 15 + (posInSide * (70 / Math.max(roomsPerSide, 1)));
      const roomY = side === 'north' ? 25 : 75;
      
      nodes.push({
        id: room.nodeId,
        buildingId,
        floor,
        x: roomX,
        y: roomY,
        type: 'room',
        roomId: room.id,
        label: `${room.num} - ${room.name}`
      });
      
      // Connect room to nearest corridor point
      const nearestCorridor = roomX < 35 
        ? `${floorPrefix}_corridor_west`
        : roomX > 65 
          ? `${floorPrefix}_corridor_east`
          : `${floorPrefix}_corridor_center`;
      
      edges.push({
        from: nearestCorridor,
        to: room.nodeId,
        distance: 10,
        type: 'door'
      });
    });
    
    // Connect entry to first floor corridor
    if (floor === 1) {
      edges.push({
        from: `${buildingId}_entry`,
        to: `${floorPrefix}_corridor_center`,
        distance: 8,
        type: 'door'
      });
    }
    
    // Connect floors via stairs and lift
    if (floor < floors) {
      const nextFloorPrefix = `${buildingId}_f${floor + 1}`;
      
      edges.push({
        from: `${floorPrefix}_stairs`,
        to: `${nextFloorPrefix}_stairs`,
        distance: 12, // stairs take longer
        type: 'stairs'
      });
      
      edges.push({
        from: `${floorPrefix}_lift`,
        to: `${nextFloorPrefix}_lift`,
        distance: 5, // lift is faster
        type: 'lift'
      });
    }
  }
  
  return { nodes, edges };
}

// Cache for indoor graphs
const indoorGraphCache = new Map<string, { nodes: IndoorNode[]; edges: IndoorEdge[] }>();

export function getIndoorGraph(buildingId: string): { nodes: IndoorNode[]; edges: IndoorEdge[] } {
  if (indoorGraphCache.has(buildingId)) {
    return indoorGraphCache.get(buildingId)!;
  }
  
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  if (!building) {
    return { nodes: [], edges: [] };
  }
  
  const graph = generateBuildingIndoorGraph(building);
  indoorGraphCache.set(buildingId, graph);
  return graph;
}

// ============================================================================
// A* PATHFINDING ALGORITHM
// ============================================================================

interface AStarNode {
  id: string;
  g: number; // cost from start
  h: number; // heuristic to goal
  f: number; // g + h
  parent: string | null;
}

function heuristic(
  nodeA: IndoorNode,
  nodeB: IndoorNode
): number {
  // Manhattan distance + floor penalty
  const dx = Math.abs(nodeA.x - nodeB.x);
  const dy = Math.abs(nodeA.y - nodeB.y);
  const floorDiff = Math.abs(nodeA.floor - nodeB.floor) * 20; // penalty for floor changes
  return dx + dy + floorDiff;
}

export function findIndoorPath(
  buildingId: string,
  startNodeId: string,
  endNodeId: string
): string[] {
  const { nodes, edges } = getIndoorGraph(buildingId);
  
  if (nodes.length === 0) return [];
  
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const startNode = nodeMap.get(startNodeId);
  const endNode = nodeMap.get(endNodeId);
  
  if (!startNode || !endNode) return [];
  
  // Build adjacency list
  const adjacency = new Map<string, { nodeId: string; distance: number }[]>();
  edges.forEach(edge => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from)!.push({ nodeId: edge.to, distance: edge.distance });
    adjacency.get(edge.to)!.push({ nodeId: edge.from, distance: edge.distance });
  });
  
  // A* implementation
  const openSet = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  
  const startAStarNode: AStarNode = {
    id: startNodeId,
    g: 0,
    h: heuristic(startNode, endNode),
    f: heuristic(startNode, endNode),
    parent: null
  };
  openSet.set(startNodeId, startAStarNode);
  
  while (openSet.size > 0) {
    // Get node with lowest f score
    let current: AStarNode | null = null;
    let lowestF = Infinity;
    openSet.forEach(node => {
      if (node.f < lowestF) {
        lowestF = node.f;
        current = node;
      }
    });
    
    if (!current) break;
    
    // Check if we reached the goal
    if (current.id === endNodeId) {
      // Reconstruct path
      const path: string[] = [];
      let node: AStarNode | null = current;
      while (node) {
        path.unshift(node.id);
        node = node.parent ? openSet.get(node.parent) || 
               (closedSet.has(node.parent) ? { id: node.parent, g: 0, h: 0, f: 0, parent: null } : null) : null;
        
        // Alternative: store parents separately
      }
      return reconstructPath(startNodeId, endNodeId, current, closedSet, openSet);
    }
    
    openSet.delete(current.id);
    closedSet.add(current.id);
    
    // Process neighbors
    const neighbors = adjacency.get(current.id) || [];
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.nodeId)) continue;
      
      const neighborNode = nodeMap.get(neighbor.nodeId);
      if (!neighborNode) continue;
      
      const tentativeG = current.g + neighbor.distance;
      
      const existing = openSet.get(neighbor.nodeId);
      if (!existing || tentativeG < existing.g) {
        const h = heuristic(neighborNode, endNode);
        openSet.set(neighbor.nodeId, {
          id: neighbor.nodeId,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current.id
        });
      }
    }
  }
  
  return []; // No path found
}

// Store parents for path reconstruction
const parentMap = new Map<string, string>();

function reconstructPath(
  startId: string,
  endId: string,
  endNode: AStarNode,
  closedSet: Set<string>,
  openSet: Map<string, AStarNode>
): string[] {
  const path: string[] = [];
  let currentId: string | null = endId;
  
  // Build parent map from both sets
  const allNodes = new Map<string, AStarNode>();
  openSet.forEach((node, id) => allNodes.set(id, node));
  
  // Trace back using parent pointers stored in openSet
  while (currentId && currentId !== startId) {
    path.unshift(currentId);
    const node = openSet.get(currentId);
    currentId = node?.parent || null;
  }
  
  if (currentId === startId) {
    path.unshift(startId);
  }
  
  return path;
}

// Improved A* with proper parent tracking
export function aStarPathfinding(
  buildingId: string,
  startNodeId: string,
  endNodeId: string
): string[] {
  const { nodes, edges } = getIndoorGraph(buildingId);
  
  if (nodes.length === 0) return [];
  
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const startNode = nodeMap.get(startNodeId);
  const endNode = nodeMap.get(endNodeId);
  
  if (!startNode || !endNode) return [];
  
  // Build adjacency list
  const adjacency = new Map<string, { nodeId: string; distance: number }[]>();
  edges.forEach(edge => {
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
    adjacency.get(edge.from)!.push({ nodeId: edge.to, distance: edge.distance });
    adjacency.get(edge.to)!.push({ nodeId: edge.from, distance: edge.distance });
  });
  
  // Priority queue (simple array-based)
  const openSet: AStarNode[] = [];
  const closedSet = new Set<string>();
  const gScores = new Map<string, number>();
  const parents = new Map<string, string>();
  
  gScores.set(startNodeId, 0);
  openSet.push({
    id: startNodeId,
    g: 0,
    h: heuristic(startNode, endNode),
    f: heuristic(startNode, endNode),
    parent: null
  });
  
  while (openSet.length > 0) {
    // Sort and get lowest f
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    if (current.id === endNodeId) {
      // Reconstruct path
      const path: string[] = [];
      let nodeId: string | undefined = endNodeId;
      while (nodeId) {
        path.unshift(nodeId);
        nodeId = parents.get(nodeId);
      }
      return path;
    }
    
    closedSet.add(current.id);
    
    const neighbors = adjacency.get(current.id) || [];
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor.nodeId)) continue;
      
      const neighborNode = nodeMap.get(neighbor.nodeId);
      if (!neighborNode) continue;
      
      const tentativeG = current.g + neighbor.distance;
      const existingG = gScores.get(neighbor.nodeId) ?? Infinity;
      
      if (tentativeG < existingG) {
        parents.set(neighbor.nodeId, current.id);
        gScores.set(neighbor.nodeId, tentativeG);
        
        const h = heuristic(neighborNode, endNode);
        const existingIdx = openSet.findIndex(n => n.id === neighbor.nodeId);
        
        if (existingIdx >= 0) {
          openSet[existingIdx] = {
            id: neighbor.nodeId,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current.id
          };
        } else {
          openSet.push({
            id: neighbor.nodeId,
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current.id
          });
        }
      }
    }
  }
  
  return [];
}

// ============================================================================
// INSTRUCTION GENERATION
// ============================================================================

function getDirection(
  fromNode: IndoorNode,
  toNode: IndoorNode,
  prevNode?: IndoorNode
): 'straight' | 'left' | 'right' | 'up' | 'down' {
  // Floor change
  if (toNode.floor > fromNode.floor) return 'up';
  if (toNode.floor < fromNode.floor) return 'down';
  
  // Calculate turn direction based on previous direction
  if (prevNode) {
    const prevDx = fromNode.x - prevNode.x;
    const prevDy = fromNode.y - prevNode.y;
    const currDx = toNode.x - fromNode.x;
    const currDy = toNode.y - fromNode.y;
    
    // Cross product to determine turn direction
    const cross = prevDx * currDy - prevDy * currDx;
    
    if (Math.abs(cross) < 5) return 'straight';
    return cross > 0 ? 'left' : 'right';
  }
  
  return 'straight';
}

export function generateInstructions(
  buildingId: string,
  path: string[]
): NavigationInstruction[] {
  if (path.length < 2) return [];
  
  const { nodes, edges } = getIndoorGraph(buildingId);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // Build edge map for distances
  const edgeMap = new Map<string, IndoorEdge>();
  edges.forEach(edge => {
    edgeMap.set(`${edge.from}-${edge.to}`, edge);
    edgeMap.set(`${edge.to}-${edge.from}`, edge);
  });
  
  const instructions: NavigationInstruction[] = [];
  
  // Entry instruction
  const firstNode = nodeMap.get(path[0]);
  if (firstNode?.type === 'entry') {
    instructions.push({
      text: 'Enter the building through the main entrance',
      direction: 'enter',
      distance: 0,
      floor: 1,
      nodeId: path[0]
    });
  }
  
  // Generate turn-by-turn
  for (let i = 1; i < path.length; i++) {
    const prevNode = i > 1 ? nodeMap.get(path[i - 2]) : undefined;
    const fromNode = nodeMap.get(path[i - 1]);
    const toNode = nodeMap.get(path[i]);
    
    if (!fromNode || !toNode) continue;
    
    const edge = edgeMap.get(`${path[i - 1]}-${path[i]}`);
    const distance = edge?.distance || 10;
    
    const direction = getDirection(fromNode, toNode, prevNode);
    
    // Generate contextual instruction text
    let text = '';
    
    if (direction === 'up') {
      const useStairs = toNode.type === 'stairs' || fromNode.type === 'stairs';
      text = useStairs 
        ? `Take the stairs up to Floor ${toNode.floor}`
        : `Take the lift up to Floor ${toNode.floor}`;
    } else if (direction === 'down') {
      const useStairs = toNode.type === 'stairs' || fromNode.type === 'stairs';
      text = useStairs 
        ? `Take the stairs down to Floor ${toNode.floor}`
        : `Take the lift down to Floor ${toNode.floor}`;
    } else if (toNode.type === 'room') {
      text = `${toNode.label} is on your ${fromNode.y < toNode.y ? 'right' : 'left'}`;
    } else if (direction === 'left') {
      text = `Turn left and continue ${distance} meters`;
    } else if (direction === 'right') {
      text = `Turn right and continue ${distance} meters`;
    } else {
      // Straight - only add if significant distance
      if (i === path.length - 1 || distance > 5) {
        text = `Continue straight for ${distance} meters`;
      }
    }
    
    if (text) {
      instructions.push({
        text,
        direction,
        distance,
        floor: toNode.floor,
        nodeId: path[i]
      });
    }
  }
  
  // Arrival instruction
  const lastNode = nodeMap.get(path[path.length - 1]);
  if (lastNode?.type === 'room') {
    instructions.push({
      text: `You have arrived at ${lastNode.label}`,
      direction: 'arrive',
      distance: 0,
      floor: lastNode.floor,
      nodeId: path[path.length - 1]
    });
  }
  
  return instructions;
}

// ============================================================================
// COMPLETE NAVIGATION ROUTE
// ============================================================================

export function computeIndoorRoute(
  buildingId: string,
  targetRoomId: string
): NavigationRoute | null {
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  if (!building) return null;
  
  const room = building.rooms.find(r => r.id === targetRoomId);
  if (!room) return null;
  
  // Start from building entry
  const startNode = `${buildingId}_entry`;
  const endNode = room.nodeId;
  
  // Find path using A*
  const path = aStarPathfinding(buildingId, startNode, endNode);
  
  if (path.length === 0) {
    // Fallback: try to construct a basic path
    return createFallbackRoute(building, room);
  }
  
  // Get indoor graph for distance calculation
  const { nodes, edges } = getIndoorGraph(buildingId);
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // Calculate total distance
  let totalDistance = 0;
  const edgeMap = new Map<string, IndoorEdge>();
  edges.forEach(edge => {
    edgeMap.set(`${edge.from}-${edge.to}`, edge);
    edgeMap.set(`${edge.to}-${edge.from}`, edge);
  });
  
  for (let i = 1; i < path.length; i++) {
    const edge = edgeMap.get(`${path[i - 1]}-${path[i]}`);
    totalDistance += edge?.distance || 10;
  }
  
  // Determine floors traversed
  const floors = [...new Set(path.map(nodeId => nodeMap.get(nodeId)?.floor || 1))].sort();
  
  // Generate instructions
  const instructions = generateInstructions(buildingId, path);
  
  return {
    startNode,
    endNode,
    path,
    totalDistance,
    estimatedTimeSeconds: Math.round(totalDistance * 1.5), // ~1.5 sec per meter walking
    instructions,
    crossesFloors: floors.length > 1,
    floors,
    building,
    targetRoom: room
  };
}

function createFallbackRoute(
  building: CampusBuilding,
  room: CampusRoom
): NavigationRoute {
  // Create a simple direct route when A* fails
  const entryNode = `${building.id}_entry`;
  const corridorNode = `${building.id}_f${room.floor}_corridor_center`;
  const roomNode = room.nodeId;
  
  const path = [entryNode];
  
  // Add stairs if room is on upper floor
  if (room.floor > 1) {
    path.push(`${building.id}_f1_corridor_center`);
    path.push(`${building.id}_f1_stairs`);
    for (let f = 2; f <= room.floor; f++) {
      path.push(`${building.id}_f${f}_stairs`);
    }
    path.push(`${building.id}_f${room.floor}_corridor_center`);
  } else {
    path.push(corridorNode);
  }
  
  path.push(roomNode);
  
  const floors = room.floor > 1 
    ? Array.from({ length: room.floor }, (_, i) => i + 1)
    : [1];
  
  const instructions: NavigationInstruction[] = [
    { text: 'Enter the building', direction: 'enter', distance: 5, floor: 1, nodeId: entryNode },
  ];
  
  if (room.floor > 1) {
    instructions.push({
      text: `Take the stairs to Floor ${room.floor}`,
      direction: 'up',
      distance: 12 * (room.floor - 1),
      floor: room.floor,
      nodeId: `${building.id}_f${room.floor}_stairs`
    });
  }
  
  instructions.push({
    text: 'Continue down the corridor',
    direction: 'straight',
    distance: 15,
    floor: room.floor,
    nodeId: corridorNode
  });
  
  instructions.push({
    text: `Arrive at ${room.name} (Room ${room.num})`,
    direction: 'arrive',
    distance: 0,
    floor: room.floor,
    nodeId: roomNode
  });
  
  return {
    startNode: entryNode,
    endNode: roomNode,
    path,
    totalDistance: 30 + (room.floor > 1 ? (room.floor - 1) * 15 : 0),
    estimatedTimeSeconds: 60 + (room.floor > 1 ? (room.floor - 1) * 25 : 0),
    instructions,
    crossesFloors: room.floor > 1,
    floors,
    building,
    targetRoom: room
  };
}

// ============================================================================
// DEMO ROUTES WITH INDOOR SEGMENTS
// ============================================================================

export interface FullNavigationRoute {
  id: string;
  label: string;
  description: string;
  // Outdoor segment
  outdoorPath: Array<{ x: number; y: number; nodeId: string }>;
  // Indoor segment
  indoorRoute: NavigationRoute | null;
  // Combined
  totalDistanceM: number;
  totalTimeSeconds: number;
}

export function createFullRoute(
  routeId: string,
  targetBuildingId: string,
  targetRoomId: string
): FullNavigationRoute | null {
  const building = ALL_BUILDINGS.find(b => b.id === targetBuildingId);
  if (!building) return null;
  
  const room = building.rooms.find(r => r.id === targetRoomId);
  if (!room) return null;
  
  // Get outdoor path to building (from campus nodes)
  const outdoorPath = getOutdoorPathToBuilding(targetBuildingId);
  
  // Get indoor route to room
  const indoorRoute = computeIndoorRoute(targetBuildingId, targetRoomId);
  
  const outdoorDistance = outdoorPath.length * 20; // approximate
  const indoorDistance = indoorRoute?.totalDistance || 30;
  
  return {
    id: routeId,
    label: `${building.shortName} - ${room.name}`,
    description: `Navigate to ${room.name} (Room ${room.num}) in ${building.name}`,
    outdoorPath,
    indoorRoute,
    totalDistanceM: outdoorDistance + indoorDistance,
    totalTimeSeconds: Math.round((outdoorDistance + indoorDistance) * 1.5)
  };
}

function getOutdoorPathToBuilding(buildingId: string): Array<{ x: number; y: number; nodeId: string }> {
  // Simplified outdoor path - in real implementation would use campus graph
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  if (!building) return [];
  
  // Start from main gate (approximate position)
  const mainGate = { x: 540, y: 245, nodeId: 'gate_main' };
  const buildingEntry = { 
    x: building.position.x + building.width / 2, 
    y: building.position.y,
    nodeId: `${buildingId}_outdoor`
  };
  
  // Simple path with intermediate waypoints
  return [
    mainGate,
    { x: 450, y: 265, nodeId: 'op_mainroad_e' },
    { x: 350, y: 270, nodeId: 'op_mainroad_m' },
    buildingEntry
  ];
}

// ============================================================================
// PREDEFINED INDOOR DEMO ROUTES
// ============================================================================

export const INDOOR_DEMO_ROUTES = [
  {
    id: 'indoor_1',
    label: 'Library Reading Hall',
    buildingId: 'b24',
    roomId: 'b24-r01',
    description: 'Main Gate to Library Main Reading Hall (Floor 1)'
  },
  {
    id: 'indoor_2',
    label: 'Admin Principal Office',
    buildingId: 'b07',
    roomId: 'b07-r01',
    description: 'Main Gate to Principal\'s Office in Admin Block'
  },
  {
    id: 'indoor_3',
    label: 'Agaciro Computer Lab',
    buildingId: 'b18',
    roomId: 'b18-r04',
    description: 'Main Gate to Computer Lab A (Floor 2) - Requires stairs'
  },
  {
    id: 'indoor_4',
    label: 'Engineering Dean Office',
    buildingId: 'b16',
    roomId: 'b16-r01',
    description: 'Main Gate to School of Engineering Dean Office'
  },
  {
    id: 'indoor_5',
    label: 'Mining Geology Lab',
    buildingId: 'b19',
    roomId: 'b19-r04',
    description: 'Main Gate to Geology Lab A (Floor 2) in Einstein Block'
  }
];

// Get a demo route with full navigation data
export function getIndoorDemoRoute(routeId: string): FullNavigationRoute | null {
  const demoRoute = INDOOR_DEMO_ROUTES.find(r => r.id === routeId);
  if (!demoRoute) return null;
  
  return createFullRoute(routeId, demoRoute.buildingId, demoRoute.roomId);
}

// ============================================================================
// EXPORTS FOR UI
// ============================================================================

export function getAllBuildingsWithRooms(): Array<{
  building: CampusBuilding;
  rooms: CampusRoom[];
}> {
  return ALL_BUILDINGS
    .filter(b => b.rooms.length > 0)
    .map(building => ({
      building,
      rooms: building.rooms
    }));
}

export function searchRoomsGlobally(query: string): Array<{
  room: CampusRoom;
  building: CampusBuilding;
}> {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  const results: Array<{ room: CampusRoom; building: CampusBuilding }> = [];
  
  ALL_BUILDINGS.forEach(building => {
    building.rooms.forEach(room => {
      if (
        room.name.toLowerCase().includes(q) ||
        room.num.toLowerCase().includes(q) ||
        room.type.toLowerCase().includes(q) ||
        building.name.toLowerCase().includes(q) ||
        building.shortName.toLowerCase().includes(q)
      ) {
        results.push({ room, building });
      }
    });
  });
  
  return results;
}

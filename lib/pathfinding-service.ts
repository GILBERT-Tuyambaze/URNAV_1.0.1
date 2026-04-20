// URNAV Pathfinding Service - A* Algorithm Implementation
// For multi-floor indoor navigation

import { ALL_BUILDINGS, GATES, OUTDOOR_NODES, type CampusBuilding, type CampusRoom, type CampusNode, type CampusEdge } from './campus-data';

// Priority Queue for A*
class PriorityQueue<T> {
  private items: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Navigation node for pathfinding
export interface NavNode {
  id: string;
  x: number;
  y: number;
  floor: number;
  type: 'gate' | 'outdoor' | 'entry' | 'corridor' | 'room' | 'stairs' | 'lift';
  buildingId?: string;
  roomId?: string;
  label?: string;
}

// Navigation edge
export interface NavEdge {
  from: string;
  to: string;
  distance: number;
  type: 'outdoor' | 'indoor' | 'stairs' | 'lift';
}

// Build navigation graph from campus data
function buildNavigationGraph(): { nodes: Map<string, NavNode>; edges: NavEdge[] } {
  const nodes = new Map<string, NavNode>();
  const edges: NavEdge[] = [];

  // Add gates
  for (const gate of GATES) {
    nodes.set(gate.id, {
      id: gate.id,
      x: gate.position.x,
      y: gate.position.y,
      floor: 0, // Ground level outdoor
      type: 'gate',
      label: gate.label,
    });
  }

  // Add outdoor path nodes
  for (const node of OUTDOOR_NODES) {
    nodes.set(node.id, {
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      floor: 0,
      type: 'outdoor',
      buildingId: node.buildingId,
    });
  }

  // Add building entry points and indoor nodes
  for (const building of ALL_BUILDINGS) {
    // Building entry point (at building center, ground floor)
    const entryId = `${building.id}_entry`;
    nodes.set(entryId, {
      id: entryId,
      x: building.position.x + building.width / 2,
      y: building.position.y + building.height / 2,
      floor: 1,
      type: 'entry',
      buildingId: building.id,
      label: building.shortName,
    });

    // Add stairs for multi-floor buildings
    if (building.floors > 1) {
      for (let f = 1; f <= building.floors; f++) {
        const stairsId = `${building.id}_stairs_f${f}`;
        nodes.set(stairsId, {
          id: stairsId,
          x: building.position.x + building.width - 8,
          y: building.position.y + 8,
          floor: f,
          type: 'stairs',
          buildingId: building.id,
        });

        // Add lift if building has 3+ floors
        if (building.floors >= 3) {
          const liftId = `${building.id}_lift_f${f}`;
          nodes.set(liftId, {
            id: liftId,
            x: building.position.x + building.width - 16,
            y: building.position.y + 8,
            floor: f,
            type: 'lift',
            buildingId: building.id,
          });
        }
      }
    }

    // Add corridor and room nodes for each floor
    for (const room of building.rooms) {
      const roomNodeId = room.nodeId || `${building.id}_room_${room.id}`;
      // Position rooms along corridors within building
      const roomIndex = building.rooms.filter(r => r.floor === room.floor).indexOf(room);
      const roomsOnFloor = building.rooms.filter(r => r.floor === room.floor).length;
      const xOffset = (roomIndex / Math.max(1, roomsOnFloor - 1)) * (building.width - 20) + 10;
      
      nodes.set(roomNodeId, {
        id: roomNodeId,
        x: building.position.x + xOffset,
        y: building.position.y + building.height / 2,
        floor: room.floor,
        type: 'room',
        buildingId: building.id,
        roomId: room.id,
        label: room.name,
      });
    }
  }

  // Build edges between outdoor nodes based on proximity
  const outdoorNodes = Array.from(nodes.values()).filter(n => n.type === 'gate' || n.type === 'outdoor');
  for (let i = 0; i < outdoorNodes.length; i++) {
    for (let j = i + 1; j < outdoorNodes.length; j++) {
      const dist = Math.hypot(outdoorNodes[j].x - outdoorNodes[i].x, outdoorNodes[j].y - outdoorNodes[i].y);
      // Connect nodes within 150m
      if (dist < 150) {
        edges.push({
          from: outdoorNodes[i].id,
          to: outdoorNodes[j].id,
          distance: dist,
          type: 'outdoor',
        });
      }
    }
  }

  // Connect gates to nearest outdoor nodes
  for (const gate of GATES) {
    let nearest: NavNode | null = null;
    let nearestDist = Infinity;
    for (const node of OUTDOOR_NODES) {
      const dist = Math.hypot(node.position.x - gate.position.x, node.position.y - gate.position.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = nodes.get(node.id) || null;
      }
    }
    if (nearest) {
      edges.push({
        from: gate.id,
        to: nearest.id,
        distance: nearestDist,
        type: 'outdoor',
      });
    }
  }

  // Connect building entries to nearest outdoor nodes
  for (const building of ALL_BUILDINGS) {
    const entryId = `${building.id}_entry`;
    const entry = nodes.get(entryId);
    if (!entry) continue;

    let nearest: NavNode | null = null;
    let nearestDist = Infinity;
    for (const node of outdoorNodes) {
      const dist = Math.hypot(node.x - entry.x, node.y - entry.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = node;
      }
    }
    if (nearest && nearestDist < 100) {
      edges.push({
        from: nearest.id,
        to: entryId,
        distance: nearestDist,
        type: 'outdoor',
      });
    }
  }

  // Connect rooms to building entries and stairs
  for (const building of ALL_BUILDINGS) {
    const entryId = `${building.id}_entry`;
    
    for (const room of building.rooms) {
      const roomNodeId = room.nodeId || `${building.id}_room_${room.id}`;
      const roomNode = nodes.get(roomNodeId);
      if (!roomNode) continue;

      if (room.floor === 1) {
        // Ground floor rooms connect to entry
        const entry = nodes.get(entryId);
        if (entry) {
          const dist = Math.hypot(roomNode.x - entry.x, roomNode.y - entry.y);
          edges.push({
            from: entryId,
            to: roomNodeId,
            distance: dist + 5, // Indoor distance with some extra
            type: 'indoor',
          });
        }
      }

      // Connect rooms to stairs on same floor
      const stairsId = `${building.id}_stairs_f${room.floor}`;
      const stairs = nodes.get(stairsId);
      if (stairs) {
        const dist = Math.hypot(roomNode.x - stairs.x, roomNode.y - stairs.y);
        edges.push({
          from: roomNodeId,
          to: stairsId,
          distance: dist + 3,
          type: 'indoor',
        });
      }

      // Connect rooms to lifts on same floor
      const liftId = `${building.id}_lift_f${room.floor}`;
      const lift = nodes.get(liftId);
      if (lift) {
        const dist = Math.hypot(roomNode.x - lift.x, roomNode.y - lift.y);
        edges.push({
          from: roomNodeId,
          to: liftId,
          distance: dist + 2,
          type: 'indoor',
        });
      }
    }

    // Connect stairs between floors (with stair penalty)
    if (building.floors > 1) {
      for (let f = 1; f < building.floors; f++) {
        const stairsLower = `${building.id}_stairs_f${f}`;
        const stairsUpper = `${building.id}_stairs_f${f + 1}`;
        if (nodes.has(stairsLower) && nodes.has(stairsUpper)) {
          edges.push({
            from: stairsLower,
            to: stairsUpper,
            distance: 20, // Stair penalty (20m equivalent)
            type: 'stairs',
          });
        }

        // Connect lifts between floors (faster than stairs)
        const liftLower = `${building.id}_lift_f${f}`;
        const liftUpper = `${building.id}_lift_f${f + 1}`;
        if (nodes.has(liftLower) && nodes.has(liftUpper)) {
          edges.push({
            from: liftLower,
            to: liftUpper,
            distance: 10, // Lift is faster than stairs
            type: 'lift',
          });
        }
      }

      // Connect entry to ground floor stairs
      const entryId = `${building.id}_entry`;
      const stairsF1 = `${building.id}_stairs_f1`;
      const entry = nodes.get(entryId);
      const stairs = nodes.get(stairsF1);
      if (entry && stairs) {
        const dist = Math.hypot(stairs.x - entry.x, stairs.y - entry.y);
        edges.push({
          from: entryId,
          to: stairsF1,
          distance: dist + 3,
          type: 'indoor',
        });
      }

      // Connect entry to ground floor lift
      const liftF1 = `${building.id}_lift_f1`;
      const lift = nodes.get(liftF1);
      if (entry && lift) {
        const dist = Math.hypot(lift.x - entry.x, lift.y - entry.y);
        edges.push({
          from: entryId,
          to: liftF1,
          distance: dist + 2,
          type: 'indoor',
        });
      }
    }
  }

  return { nodes, edges };
}

// Build adjacency list from edges
function buildAdjacencyList(edges: NavEdge[]): Map<string, { to: string; distance: number; type: string }[]> {
  const adj = new Map<string, { to: string; distance: number; type: string }[]>();
  
  for (const edge of edges) {
    // Add edge in both directions
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to)) adj.set(edge.to, []);
    
    adj.get(edge.from)!.push({ to: edge.to, distance: edge.distance, type: edge.type });
    adj.get(edge.to)!.push({ to: edge.from, distance: edge.distance, type: edge.type });
  }
  
  return adj;
}

// A* heuristic - Euclidean distance
function heuristic(node1: NavNode, node2: NavNode): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  const dFloor = Math.abs(node2.floor - node1.floor) * 15; // Floor change penalty
  return Math.hypot(dx, dy) + dFloor;
}

// Route result
export interface RouteResult {
  path: NavNode[];
  totalDistance: number;
  estimatedTime: number; // in seconds, assuming 1.2 m/s walking speed
  instructions: RouteInstruction[];
  crossesFloors: boolean;
  crossesBuildings: boolean;
}

// Route instruction
export interface RouteInstruction {
  text: string;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'arrive';
  distance: number;
  floor?: number;
  landmark?: string;
}

// Singleton graph instance
let graphCache: { nodes: Map<string, NavNode>; edges: NavEdge[]; adj: Map<string, { to: string; distance: number; type: string }[]> } | null = null;

function getGraph() {
  if (!graphCache) {
    const { nodes, edges } = buildNavigationGraph();
    const adj = buildAdjacencyList(edges);
    graphCache = { nodes, edges, adj };
  }
  return graphCache;
}

// Find route using A*
export function findRoute(startNodeId: string, endNodeId: string): RouteResult | null {
  const { nodes, adj } = getGraph();
  
  const startNode = nodes.get(startNodeId);
  const endNode = nodes.get(endNodeId);
  
  if (!startNode || !endNode) {
    return null;
  }
  
  const openSet = new PriorityQueue<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, heuristic(startNode, endNode));
  openSet.enqueue(startNodeId, fScore.get(startNodeId)!);
  
  while (!openSet.isEmpty()) {
    const currentId = openSet.dequeue()!;
    
    if (currentId === endNodeId) {
      // Reconstruct path
      const path: NavNode[] = [];
      let current: string | undefined = currentId;
      while (current) {
        const node = nodes.get(current);
        if (node) path.unshift(node);
        current = cameFrom.get(current);
      }
      
      const totalDistance = gScore.get(endNodeId) || 0;
      const floors = new Set(path.map(n => n.floor));
      const buildings = new Set(path.filter(n => n.buildingId).map(n => n.buildingId));
      
      return {
        path,
        totalDistance,
        estimatedTime: Math.round(totalDistance / 1.2), // 1.2 m/s walking speed
        instructions: generateInstructions(path),
        crossesFloors: floors.size > 1,
        crossesBuildings: buildings.size > 1,
      };
    }
    
    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(currentId) ?? Infinity) + neighbor.distance;
      
      if (tentativeG < (gScore.get(neighbor.to) ?? Infinity)) {
        cameFrom.set(neighbor.to, currentId);
        gScore.set(neighbor.to, tentativeG);
        
        const neighborNode = nodes.get(neighbor.to);
        if (neighborNode) {
          fScore.set(neighbor.to, tentativeG + heuristic(neighborNode, endNode));
          openSet.enqueue(neighbor.to, fScore.get(neighbor.to)!);
        }
      }
    }
  }
  
  return null; // No path found
}

// Generate turn-by-turn instructions
function generateInstructions(path: NavNode[]): RouteInstruction[] {
  const instructions: RouteInstruction[] = [];
  
  if (path.length < 2) return instructions;
  
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];
    const prev = i > 0 ? path[i - 1] : null;
    
    // Calculate direction
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const distance = Math.hypot(dx, dy);
    
    // Calculate turn direction if we have previous node
    let direction: RouteInstruction['direction'] = 'straight';
    
    if (next.floor !== current.floor) {
      direction = next.floor > current.floor ? 'up' : 'down';
    } else if (prev) {
      const prevDx = current.x - prev.x;
      const prevDy = current.y - prev.y;
      const prevAngle = Math.atan2(prevDy, prevDx);
      const nextAngle = Math.atan2(dy, dx);
      let turnAngle = (nextAngle - prevAngle) * (180 / Math.PI);
      
      // Normalize to -180 to 180
      while (turnAngle > 180) turnAngle -= 360;
      while (turnAngle < -180) turnAngle += 360;
      
      if (turnAngle > 30) direction = 'left';
      else if (turnAngle < -30) direction = 'right';
    }
    
    // Generate instruction text
    let text = '';
    if (current.type === 'gate') {
      text = `Enter through ${current.label || 'gate'}`;
    } else if (current.type === 'entry') {
      text = `Enter ${current.label || 'building'}`;
    } else if (next.type === 'stairs') {
      text = direction === 'up' ? 'Take the stairs up' : direction === 'down' ? 'Take the stairs down' : 'Head to stairs';
    } else if (next.type === 'lift') {
      text = direction === 'up' ? 'Take the lift up' : direction === 'down' ? 'Take the lift down' : 'Head to lift';
    } else if (next.type === 'room') {
      text = `${next.label || 'Room'} is on your ${direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'ahead'}`;
      direction = 'arrive';
    } else if (direction === 'left') {
      text = 'Turn left';
    } else if (direction === 'right') {
      text = 'Turn right';
    } else {
      text = `Continue ${Math.round(distance)}m`;
    }
    
    instructions.push({
      text,
      direction,
      distance: Math.round(distance),
      floor: next.floor,
      landmark: next.label,
    });
  }
  
  // Add arrival instruction
  const dest = path[path.length - 1];
  instructions.push({
    text: `You have arrived at ${dest.label || 'your destination'}`,
    direction: 'arrive',
    distance: 0,
    floor: dest.floor,
  });
  
  return instructions;
}

// Find route from gate to building
export function findRouteToBuilding(gateId: string, buildingId: string): RouteResult | null {
  const entryId = `${buildingId}_entry`;
  return findRoute(gateId, entryId);
}

// Find route from gate to room
export function findRouteToRoom(gateId: string, buildingId: string, roomId: string): RouteResult | null {
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  if (!building) return null;
  
  const room = building.rooms.find(r => r.id === roomId);
  if (!room) return null;
  
  const roomNodeId = room.nodeId || `${buildingId}_room_${roomId}`;
  return findRoute(gateId, roomNodeId);
}

// Find nearest gate to a position
export function findNearestGate(x: number, y: number): string {
  let nearest = GATES[0].id;
  let nearestDist = Infinity;
  
  for (const gate of GATES) {
    const dist = Math.hypot(gate.position.x - x, gate.position.y - y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = gate.id;
    }
  }
  
  return nearest;
}

// Get all nodes for visualization
export function getAllNodes(): NavNode[] {
  const { nodes } = getGraph();
  return Array.from(nodes.values());
}

// Get all edges for visualization
export function getAllEdges(): NavEdge[] {
  const { edges } = getGraph();
  return edges;
}

// Convert route path to simple position array for map rendering
export function routeToPositions(route: RouteResult): { x: number; y: number; floor: number }[] {
  return route.path.map(node => ({
    x: node.x,
    y: node.y,
    floor: node.floor,
  }));
}

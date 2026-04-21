// URNAV Pathfinding Service - A* Algorithm Implementation
// For multi-floor indoor navigation with full outdoor + indoor routing

import { ALL_BUILDINGS, GATES, type CampusBuilding, type CampusRoom } from './campus-data';
import { getGraph, findRoomNode, getBuildingEntryId, type CampusGraphNode } from './indoor-graph';

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

// Navigation node for pathfinding (compatible with existing interface)
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
  type: 'outdoor' | 'indoor' | 'stairs' | 'lift' | 'entry' | 'walk';
}

// Route options
export interface RouteOptions {
  preferLift?: boolean;     // default true - prefer lift over stairs
  avoidOutdoor?: boolean;   // default false - avoid going outside
}

// Route result
export interface RouteResult {
  path: NavNode[];
  totalDistance: number;
  estimatedTime: number; // in seconds, assuming 1.2 m/s walking speed
  instructions: RouteInstruction[];
  crossesFloors: boolean;
  crossesBuildings: boolean;
  floorsVisited: number[];
  buildingsVisited: string[];
}

// Segment types for instructions
export type SegmentType = 
  | 'walk' 
  | 'stairs-up' 
  | 'stairs-down' 
  | 'elevator-up' 
  | 'elevator-down' 
  | 'building-enter' 
  | 'building-exit' 
  | 'outdoor' 
  | 'arrival';

// Route instruction
export interface RouteInstruction {
  text: string;
  direction: 'straight' | 'left' | 'right' | 'up' | 'down' | 'arrive' | 'enter' | 'exit';
  segmentType: SegmentType;
  distance: number;
  floor?: number;
  landmark?: string;
  icon: string;
}

// A* heuristic - Euclidean distance with floor penalty
function heuristic(node1: CampusGraphNode, node2: CampusGraphNode): number {
  const dx = node2.x - node1.x;
  const dy = node2.y - node1.y;
  const dFloor = Math.abs(node2.floor - node1.floor) * 15; // Floor change penalty
  return Math.hypot(dx, dy) + dFloor;
}

/**
 * Determine segment type based on node transitions
 */
function getSegmentType(fromNode: CampusGraphNode | null, toNode: CampusGraphNode | null): SegmentType {
  if (!fromNode || !toNode) return 'walk';

  // Floor change via stairs
  if ((fromNode.type === 'stairs' || toNode.type === 'stairs') &&
       fromNode.floor !== toNode.floor) {
    return fromNode.floor < toNode.floor ? 'stairs-up' : 'stairs-down';
  }

  // Floor change via lift
  if ((fromNode.type === 'lift' || toNode.type === 'lift') &&
       fromNode.floor !== toNode.floor) {
    return fromNode.floor < toNode.floor ? 'elevator-up' : 'elevator-down';
  }

  // Building entry (outdoor node -> indoor entry node)
  if (!fromNode.buildingId && toNode.type === 'entry') {
    return 'building-enter';
  }

  // Building exit (indoor node -> outdoor node)
  if (fromNode.buildingId && !toNode.buildingId) {
    return 'building-exit';
  }

  // Outdoor walking
  if (fromNode.type === 'outdoor' || fromNode.type === 'gate') {
    return 'outdoor';
  }

  return 'walk';
}

/**
 * Get icon name for segment type
 */
function getIconForSegment(segmentType: SegmentType): string {
  const iconMap: Record<SegmentType, string> = {
    'stairs-up': 'stairs-up',
    'stairs-down': 'stairs-down',
    'elevator-up': 'elevator-up',
    'elevator-down': 'elevator-down',
    'building-enter': 'building-enter',
    'building-exit': 'building-exit',
    'outdoor': 'arrow-up',
    'walk': 'arrow-up',
    'arrival': 'check',
  };
  return iconMap[segmentType] || 'arrow-up';
}

/**
 * Generate turn-by-turn instructions from path
 */
function generateInstructions(path: CampusGraphNode[]): RouteInstruction[] {
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
    
    // Get segment type
    const segmentType = getSegmentType(current, next);
    
    // Calculate turn direction if we have previous node
    let direction: RouteInstruction['direction'] = 'straight';
    
    if (segmentType === 'stairs-up' || segmentType === 'elevator-up') {
      direction = 'up';
    } else if (segmentType === 'stairs-down' || segmentType === 'elevator-down') {
      direction = 'down';
    } else if (segmentType === 'building-enter') {
      direction = 'enter';
    } else if (segmentType === 'building-exit') {
      direction = 'exit';
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
    const distStr = `${Math.round(distance)} m`;
    
    switch (segmentType) {
      case 'stairs-up':
        text = `Walk ${distStr}, then take the stairs up to Floor ${next.floor}`;
        break;
      case 'stairs-down':
        text = `Walk ${distStr}, then take the stairs down to Floor ${next.floor}`;
        break;
      case 'elevator-up':
        text = `Walk ${distStr}, then take the elevator up to Floor ${next.floor}`;
        break;
      case 'elevator-down':
        text = `Walk ${distStr}, then take the elevator down to Floor ${next.floor}`;
        break;
      case 'building-enter':
        const buildingName = ALL_BUILDINGS.find(b => b.id === next.buildingId)?.shortName || 'building';
        text = `Walk ${distStr}, then enter ${buildingName} through the main entrance`;
        break;
      case 'building-exit':
        text = 'Exit the building and continue outdoors';
        break;
      case 'outdoor':
        if (next.label) {
          text = `Walk ${distStr} towards ${next.label}`;
        } else {
          text = `Continue ${distStr} along the path`;
        }
        break;
      default:
        if (current.type === 'gate') {
          text = `Enter through ${current.label || 'gate'}`;
        } else if (next.type === 'room') {
          text = `${next.label || 'Room'} is on your ${direction === 'left' ? 'left' : direction === 'right' ? 'right' : 'ahead'}`;
          direction = 'arrive';
        } else if (direction === 'left') {
          text = `Turn left and walk ${distStr}`;
        } else if (direction === 'right') {
          text = `Turn right and walk ${distStr}`;
        } else {
          text = `Continue ${distStr}`;
        }
    }
    
    instructions.push({
      text,
      direction,
      segmentType,
      distance: Math.round(distance),
      floor: next.floor,
      landmark: next.label,
      icon: getIconForSegment(segmentType),
    });
  }
  
  // Add arrival instruction
  const dest = path[path.length - 1];
  const building = ALL_BUILDINGS.find(b => b.id === dest.buildingId);
  const arrivalText = dest.roomId 
    ? `You have arrived at ${dest.label || 'your destination'} - Floor ${dest.floor}, ${building?.shortName || ''}`
    : `You have arrived at ${dest.label || 'your destination'}`;
  
  instructions.push({
    text: arrivalText,
    direction: 'arrive',
    segmentType: 'arrival',
    distance: 0,
    floor: dest.floor,
    landmark: dest.label,
    icon: 'check',
  });
  
  return instructions;
}

/**
 * Find route using A* algorithm
 * Supports full outdoor + indoor routing with stairs and lifts
 */
export function findRoute(
  startNodeId: string, 
  endNodeId: string,
  options: RouteOptions = {}
): RouteResult | null {
  const { preferLift = true } = options;
  const graph = getGraph();
  const { nodeMap, adjList } = graph;
  
  const startNode = nodeMap[startNodeId];
  const endNode = nodeMap[endNodeId];
  
  if (!startNode || !endNode) {
    console.error(`Node not found: start=${startNodeId}, end=${endNodeId}`);
    return null;
  }
  
  // Handle same start and end
  if (startNodeId === endNodeId) {
    const node = { ...startNode } as NavNode;
    return {
      path: [node],
      totalDistance: 0,
      estimatedTime: 0,
      instructions: [{
        text: 'You are already at your destination',
        direction: 'arrive',
        segmentType: 'arrival',
        distance: 0,
        floor: node.floor,
        landmark: node.label,
        icon: 'check',
      }],
      crossesFloors: false,
      crossesBuildings: false,
      floorsVisited: [node.floor],
      buildingsVisited: node.buildingId ? [node.buildingId] : [],
    };
  }
  
  const openSet = new PriorityQueue<string>();
  const cameFrom = new Map<string, string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  
  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, heuristic(startNode, endNode));
  openSet.enqueue(startNodeId, fScore.get(startNodeId)!);
  
  const visited = new Set<string>();
  
  while (!openSet.isEmpty()) {
    const currentId = openSet.dequeue()!;
    
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    if (currentId === endNodeId) {
      // Reconstruct path
      const pathIds: string[] = [currentId];
      let current: string | undefined = currentId;
      while (cameFrom.has(current!)) {
        current = cameFrom.get(current!);
        if (current) pathIds.unshift(current);
      }
      
      const path: NavNode[] = pathIds.map(id => {
        const node = nodeMap[id];
        return {
          id: node.id,
          x: node.x,
          y: node.y,
          floor: node.floor,
          type: node.type as NavNode['type'],
          buildingId: node.buildingId,
          roomId: node.roomId,
          label: node.label,
        };
      });
      
      const totalDistance = gScore.get(endNodeId) || 0;
      const floorsVisited = [...new Set(path.map(n => n.floor).filter(f => f > 0))];
      const buildingsVisited = [...new Set(path.map(n => n.buildingId).filter(Boolean) as string[])];
      
      return {
        path,
        totalDistance: Math.round(totalDistance * 10) / 10,
        estimatedTime: Math.round(totalDistance / 1.2), // 1.2 m/s walking speed
        instructions: generateInstructions(pathIds.map(id => nodeMap[id])),
        crossesFloors: floorsVisited.length > 1,
        crossesBuildings: buildingsVisited.length > 1,
        floorsVisited,
        buildingsVisited,
      };
    }
    
    const neighbors = adjList[currentId] || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;
      
      let weight = neighbor.weight;
      
      // Apply lift/stairs preference
      if (preferLift && neighbor.type === 'stairs') {
        weight += 15; // Penalize stairs when lift preferred
      }
      if (!preferLift && neighbor.type === 'lift') {
        weight += 8; // Penalize lift when stairs preferred
      }
      
      const tentativeG = (gScore.get(currentId) ?? Infinity) + weight;
      
      if (tentativeG < (gScore.get(neighbor.to) ?? Infinity)) {
        cameFrom.set(neighbor.to, currentId);
        gScore.set(neighbor.to, tentativeG);
        
        const neighborNode = nodeMap[neighbor.to];
        if (neighborNode) {
          const f = tentativeG + heuristic(neighborNode, endNode);
          fScore.set(neighbor.to, f);
          openSet.enqueue(neighbor.to, f);
        }
      }
    }
  }
  
  console.error(`No route found from ${startNodeId} to ${endNodeId}`);
  return null; // No path found
}

/**
 * Resolve start node from user position
 */
export function resolveStartNode(
  userPos: { x: number; y: number; floor?: number; buildingId?: string }
): string {
  const graph = getGraph();
  const { nodeMap } = graph;
  
  // If user is inside a building, snap to nearest indoor node on their floor
  if (userPos.buildingId) {
    const indoor = Object.values(nodeMap).filter(
      n => n.buildingId === userPos.buildingId && n.floor === (userPos.floor ?? 1)
    );
    if (indoor.length > 0) {
      let best = { id: indoor[0].id, d: Infinity };
      for (const n of indoor) {
        const d = Math.hypot(n.x - userPos.x, n.y - userPos.y);
        if (d < best.d) best = { id: n.id, d };
      }
      return best.id;
    }
  }
  
  // User is outdoors - snap to nearest outdoor/gate node
  const outdoor = Object.values(nodeMap).filter(
    n => n.type === 'outdoor' || n.type === 'gate' || n.type === 'entry'
  );
  
  let best = { id: 'gate_main', d: Infinity };
  for (const n of outdoor) {
    const d = Math.hypot(n.x - userPos.x, n.y - userPos.y);
    if (d < best.d) best = { id: n.id, d };
  }
  
  return best.id;
}

/**
 * Resolve destination node from room selection
 */
export function resolveDestNode(room: CampusRoom): string {
  return room.nodeId;
}

/**
 * Find route from current position to a room
 */
export function findRouteToRoom(
  startPos: { x: number; y: number; floor?: number; buildingId?: string },
  buildingId: string,
  roomId: string,
  options: RouteOptions = {}
): RouteResult | null {
  const building = ALL_BUILDINGS.find(b => b.id === buildingId);
  if (!building) return null;
  
  const room = building.rooms.find(r => r.id === roomId);
  if (!room) return null;
  
  const startNodeId = resolveStartNode(startPos);
  const endNodeId = room.nodeId;
  
  return findRoute(startNodeId, endNodeId, options);
}

/**
 * Find route from gate to building entry
 */
export function findRouteToBuilding(gateId: string, buildingId: string): RouteResult | null {
  const entryId = getBuildingEntryId(buildingId);
  return findRoute(gateId, entryId);
}

/**
 * Find nearest gate to a position
 */
export function findNearestGate(x: number, y: number): string {
  let nearest = GATES[0]?.id || 'gate_main';
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

/**
 * Get all nodes for visualization
 */
export function getAllNodes(): NavNode[] {
  const graph = getGraph();
  return graph.nodes.map(n => ({
    id: n.id,
    x: n.x,
    y: n.y,
    floor: n.floor,
    type: n.type as NavNode['type'],
    buildingId: n.buildingId,
    roomId: n.roomId,
    label: n.label,
  }));
}

/**
 * Get all edges for visualization
 */
export function getAllEdges(): NavEdge[] {
  const graph = getGraph();
  return graph.edges.map(e => ({
    from: e.from,
    to: e.to,
    distance: e.weight,
    type: e.type as NavEdge['type'],
  }));
}

/**
 * Convert route path to simple position array for map rendering
 */
export function routeToPositions(route: RouteResult): { x: number; y: number; floor: number }[] {
  return route.path.map(node => ({
    x: node.x,
    y: node.y,
    floor: node.floor,
  }));
}

/**
 * Filter route positions for a specific floor
 */
export function getRouteForFloor(
  route: RouteResult, 
  floor: number
): { x: number; y: number }[] {
  return route.path
    .filter(node => node.floor === floor)
    .map(node => ({ x: node.x, y: node.y }));
}

/**
 * Search rooms by name, number, or building
 */
export function searchRooms(query: string): Array<{
  room: CampusRoom;
  building: CampusBuilding;
  nodeId: string;
}> {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  
  const results: Array<{ room: CampusRoom; building: CampusBuilding; nodeId: string }> = [];
  
  for (const building of ALL_BUILDINGS) {
    for (const room of building.rooms) {
      const matches = 
        room.name.toLowerCase().includes(lowerQuery) ||
        room.num.toLowerCase().includes(lowerQuery) ||
        building.name.toLowerCase().includes(lowerQuery) ||
        building.shortName.toLowerCase().includes(lowerQuery);
      
      if (matches) {
        results.push({
          room,
          building,
          nodeId: room.nodeId,
        });
      }
    }
  }
  
  return results.slice(0, 20); // Limit to 20 results
}

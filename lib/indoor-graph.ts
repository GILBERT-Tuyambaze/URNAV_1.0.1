// URNAV Indoor Navigation Graph Generator
// Generates indoor nodes and edges for all campus buildings
// Supports: entry nodes, corridor spines, room nodes, stair nodes, lift nodes

import { ALL_BUILDINGS, GATES, OUTDOOR_NODES, type CampusBuilding, type CampusRoom } from './campus-data';

// Indoor node types
export interface IndoorNode {
  id: string;
  buildingId: string;
  localX: number;       // metres from building SW corner, east
  localY: number;       // metres from building SW corner, north
  campusX: number;      // building.position.x + localX
  campusY: number;      // building.position.y + localY
  floor: number;        // 1, 2, 3, etc.
  type: 'entry' | 'corridor' | 'room' | 'stairs' | 'lift';
  label: string;
  roomId?: string;      // if type='room', the room.id
  roomType?: string;    // room.type for rendering color
}

export interface IndoorEdge {
  from: string;
  to: string;
  weight: number;
  type: 'walk' | 'stairs' | 'lift';
}

/**
 * Generate indoor navigation graph for a single building
 * Creates entry, corridor, room, stair, and lift nodes with connecting edges
 */
export function generateBuildingGraph(building: CampusBuilding): { nodes: IndoorNode[]; edges: IndoorEdge[] } {
  const { id, position, width: w, height: h, floors: numFloors, rooms, shortName } = building;
  const campusX = position.x;
  const campusY = position.y;
  const nodes: IndoorNode[] = [];
  const edges: IndoorEdge[] = [];

  // Generate floor array from number
  const floorArray = Array.from({ length: numFloors }, (_, i) => i + 1);

  for (const floor of floorArray) {
    const fKey = `f${floor}`;
    const corridorX = w / 2;  // corridor runs down building centre
    const offsetX = w / 2 - 3; // Room offset from corridor

    // ── ENTRY NODE (floor 1 only, south face centre) ────────────────────
    if (floor === 1) {
      nodes.push({
        id: `${id}_f1_entry`,
        buildingId: id,
        localX: corridorX,
        localY: 0,
        campusX: campusX + corridorX,
        campusY: campusY,
        floor: 1,
        type: 'entry',
        label: `${shortName} Entrance`,
      });
    }

    // ── CORRIDOR SPINE (nodes every 3m from y=2 to y=h-2) ───────────────
    const corridorIds: string[] = [];
    const spanY = h - 4;
    const steps = Math.max(2, Math.round(spanY / 3));

    for (let s = 0; s <= steps; s++) {
      const localY = 2 + (s / steps) * spanY;
      const nid = `${id}_${fKey}_c${s}`;
      nodes.push({
        id: nid,
        buildingId: id,
        localX: corridorX,
        localY,
        campusX: campusX + corridorX,
        campusY: campusY + localY,
        floor,
        type: 'corridor',
        label: `Corridor ${floor}-${s}`,
      });
      corridorIds.push(nid);
    }

    // Connect corridor nodes in sequence (weight = Y distance between them)
    for (let i = 0; i < corridorIds.length - 1; i++) {
      const a = nodes.find(n => n.id === corridorIds[i]);
      const b = nodes.find(n => n.id === corridorIds[i + 1]);
      if (a && b) {
        edges.push({ from: corridorIds[i], to: corridorIds[i + 1], weight: b.localY - a.localY, type: 'walk' });
      }
    }

    // Connect entry → first corridor node (floor 1 only)
    if (floor === 1 && corridorIds.length > 0) {
      const fc = nodes.find(n => n.id === corridorIds[0]);
      if (fc) {
        edges.push({ from: `${id}_f1_entry`, to: corridorIds[0], weight: fc.localY, type: 'walk' });
      }
    }

    // ── ROOM NODES ───────────────────────────────────────────────────────
    const floorRooms = rooms.filter(r => r.floor === floor);
    floorRooms.forEach((room, i) => {
      const side = i % 2 === 0 ? -1 : 1;   // -1 = west, +1 = east
      const localX = corridorX + side * offsetX;
      // Distribute rooms evenly along corridor Y
      const localY = Math.min(
        2 + (i * spanY / Math.max(floorRooms.length - 1, 1)),
        h - 3
      );

      const roomNodeId = room.nodeId || `${id}_${fKey}_r${String(i + 1).padStart(2, '0')}`;
      
      nodes.push({
        id: roomNodeId,
        buildingId: id,
        roomId: room.id,
        roomType: room.type,
        localX,
        localY,
        campusX: campusX + localX,
        campusY: campusY + localY,
        floor,
        type: 'room',
        label: room.name,
      });

      // Find nearest corridor node on same floor
      let nearId = corridorIds[0];
      let nearDist = Infinity;
      corridorIds.forEach(cid => {
        const cn = nodes.find(n => n.id === cid);
        if (cn) {
          const d = Math.abs(cn.localY - localY);
          if (d < nearDist) { nearDist = d; nearId = cid; }
        }
      });

      // Edge: room → corridor (weight = side offset + Y gap)
      edges.push({ from: roomNodeId, to: nearId, weight: offsetX + nearDist, type: 'walk' });
    });

    // ── STAIRS NODE (east end of building, all multi-floor buildings) ────
    if (numFloors > 1) {
      const stId = `${id}_${fKey}_st`;
      const stLocalX = w - 2;
      const stLocalY = h / 2;
      nodes.push({
        id: stId,
        buildingId: id,
        localX: stLocalX,
        localY: stLocalY,
        campusX: campusX + stLocalX,
        campusY: campusY + stLocalY,
        floor,
        type: 'stairs',
        label: `Stairs F${floor}`,
      });
      
      // Connect stairs to nearest corridor node
      const midCorr = corridorIds[Math.floor(corridorIds.length / 2)];
      const mc = nodes.find(n => n.id === midCorr);
      if (mc) {
        const stairCorridorDist = Math.abs(mc.localY - stLocalY) + (stLocalX - corridorX);
        edges.push({ from: stId, to: midCorr, weight: stairCorridorDist, type: 'walk' });
      }

      // Vertical edge to next floor stairs
      const nextFloor = floor + 1;
      if (nextFloor <= numFloors) {
        edges.push({
          from: stId,
          to: `${id}_f${nextFloor}_st`,
          weight: 25,  // Stair penalty
          type: 'stairs',
        });
      }
    }

    // ── LIFT NODE (west end, buildings with 3+ floors only) ─────────────
    if (numFloors >= 3) {
      const lfId = `${id}_${fKey}_lf`;
      const lfLocalX = 2;
      const lfLocalY = h / 2;
      nodes.push({
        id: lfId,
        buildingId: id,
        localX: lfLocalX,
        localY: lfLocalY,
        campusX: campusX + lfLocalX,
        campusY: campusY + lfLocalY,
        floor,
        type: 'lift',
        label: `Elevator F${floor}`,
      });
      
      const midCorr = corridorIds[Math.floor(corridorIds.length / 2)];
      const mc = nodes.find(n => n.id === midCorr);
      if (mc) {
        const liftCorridorDist = Math.abs(mc.localY - lfLocalY) + (corridorX - lfLocalX);
        edges.push({ from: lfId, to: midCorr, weight: liftCorridorDist, type: 'walk' });
      }

      const nextFloor = floor + 1;
      if (nextFloor <= numFloors) {
        edges.push({
          from: lfId,
          to: `${id}_f${nextFloor}_lf`,
          weight: 20,  // Lift is faster than stairs
          type: 'lift',
        });
      }
    }
  }

  return { nodes, edges };
}

// ============================================================================
// GENERATE FULL INDOOR GRAPH FOR ALL BUILDINGS
// ============================================================================

const allIndoorNodes: IndoorNode[] = [];
const allIndoorEdges: IndoorEdge[] = [];

// Generate indoor graphs for all buildings
for (const building of ALL_BUILDINGS) {
  const { nodes, edges } = generateBuildingGraph(building);
  allIndoorNodes.push(...nodes);
  allIndoorEdges.push(...edges);
}

export const INDOOR_NODES = allIndoorNodes;
export const INDOOR_EDGES = allIndoorEdges;

// Node lookup map
export const INDOOR_NODE_MAP = Object.fromEntries(
  INDOOR_NODES.map(n => [n.id, n])
);

// Lookup: roomId -> indoor node
export const ROOM_NODE_MAP = Object.fromEntries(
  INDOOR_NODES.filter(n => n.roomId).map(n => [n.roomId!, n])
);

/**
 * Get all nodes for a specific building and floor
 */
export function getFloorNodes(buildingId: string, floor: number): IndoorNode[] {
  return INDOOR_NODES.filter(n => n.buildingId === buildingId && n.floor === floor);
}

/**
 * Get all edges for a specific building and floor (excludes vertical edges)
 */
export function getFloorEdges(buildingId: string, floor: number): IndoorEdge[] {
  const floorNodeIds = new Set(
    getFloorNodes(buildingId, floor).map(n => n.id)
  );
  return INDOOR_EDGES.filter(
    e => floorNodeIds.has(e.from) && floorNodeIds.has(e.to)
  );
}

/**
 * Get building entry node ID
 */
export function getBuildingEntryId(buildingId: string): string {
  return `${buildingId}_f1_entry`;
}

/**
 * Find room node by room ID
 */
export function findRoomNode(roomId: string): IndoorNode | undefined {
  return ROOM_NODE_MAP[roomId];
}

// ============================================================================
// OUTDOOR-INDOOR CONNECTION EDGES
// ============================================================================

// Create edges connecting outdoor nodes to building entries
export const OUTDOOR_TO_INDOOR_EDGES: IndoorEdge[] = [];

// Connect each building entry to nearest outdoor node
for (const building of ALL_BUILDINGS) {
  const entryId = getBuildingEntryId(building.id);
  const entryNode = INDOOR_NODE_MAP[entryId];
  if (!entryNode) continue;

  // Find nearest outdoor node
  let nearestOutdoor: { id: string; dist: number } | null = null;
  
  for (const outdoor of OUTDOOR_NODES) {
    const dist = Math.hypot(
      outdoor.position.x - entryNode.campusX,
      outdoor.position.y - entryNode.campusY
    );
    if (!nearestOutdoor || dist < nearestOutdoor.dist) {
      nearestOutdoor = { id: outdoor.id, dist };
    }
  }

  // Also check gates
  for (const gate of GATES) {
    const dist = Math.hypot(
      gate.position.x - entryNode.campusX,
      gate.position.y - entryNode.campusY
    );
    if (!nearestOutdoor || dist < nearestOutdoor.dist) {
      nearestOutdoor = { id: gate.id, dist };
    }
  }

  if (nearestOutdoor && nearestOutdoor.dist < 100) {
    OUTDOOR_TO_INDOOR_EDGES.push({
      from: nearestOutdoor.id,
      to: entryId,
      weight: nearestOutdoor.dist,
      type: 'walk',
    });
  }
}

// ============================================================================
// COMPLETE CAMPUS GRAPH (OUTDOOR + INDOOR)
// ============================================================================

export interface CampusGraphNode {
  id: string;
  x: number;
  y: number;
  floor: number;
  type: string;
  buildingId?: string;
  roomId?: string;
  label?: string;
}

export interface CampusGraphEdge {
  from: string;
  to: string;
  weight: number;
  type: string;
}

/**
 * Get complete campus navigation graph (outdoor + indoor)
 */
export function getCampusGraph(): {
  nodes: CampusGraphNode[];
  edges: CampusGraphEdge[];
  nodeMap: Record<string, CampusGraphNode>;
  adjList: Record<string, { to: string; weight: number; type: string }[]>;
} {
  const nodes: CampusGraphNode[] = [];
  const edges: CampusGraphEdge[] = [];

  // Add gate nodes
  for (const gate of GATES) {
    nodes.push({
      id: gate.id,
      x: gate.position.x,
      y: gate.position.y,
      floor: 0,
      type: 'gate',
      label: gate.label,
    });
  }

  // Add outdoor nodes
  for (const outdoor of OUTDOOR_NODES) {
    nodes.push({
      id: outdoor.id,
      x: outdoor.position.x,
      y: outdoor.position.y,
      floor: 0,
      type: 'outdoor',
      buildingId: outdoor.buildingId,
    });
  }

  // Add indoor nodes
  for (const indoor of INDOOR_NODES) {
    nodes.push({
      id: indoor.id,
      x: indoor.campusX,
      y: indoor.campusY,
      floor: indoor.floor,
      type: indoor.type,
      buildingId: indoor.buildingId,
      roomId: indoor.roomId,
      label: indoor.label,
    });
  }

  // Build outdoor edges (connect nearby outdoor nodes)
  const outdoorNodes = nodes.filter(n => n.type === 'gate' || n.type === 'outdoor');
  for (let i = 0; i < outdoorNodes.length; i++) {
    for (let j = i + 1; j < outdoorNodes.length; j++) {
      const dist = Math.hypot(
        outdoorNodes[j].x - outdoorNodes[i].x,
        outdoorNodes[j].y - outdoorNodes[i].y
      );
      if (dist < 120) {
        edges.push({
          from: outdoorNodes[i].id,
          to: outdoorNodes[j].id,
          weight: dist,
          type: 'outdoor',
        });
      }
    }
  }

  // Add indoor edges
  for (const edge of INDOOR_EDGES) {
    edges.push({
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
      type: edge.type,
    });
  }

  // Add outdoor-to-indoor connection edges
  for (const edge of OUTDOOR_TO_INDOOR_EDGES) {
    edges.push({
      from: edge.from,
      to: edge.to,
      weight: edge.weight,
      type: 'entry',
    });
  }

  // Build node map
  const nodeMap: Record<string, CampusGraphNode> = {};
  for (const node of nodes) {
    nodeMap[node.id] = node;
  }

  // Build bidirectional adjacency list
  const adjList: Record<string, { to: string; weight: number; type: string }[]> = {};
  for (const node of nodes) {
    adjList[node.id] = [];
  }

  for (const edge of edges) {
    const w = edge.weight;
    const type = edge.type;
    if (adjList[edge.from]) {
      adjList[edge.from].push({ to: edge.to, weight: w, type });
    }
    if (adjList[edge.to]) {
      adjList[edge.to].push({ to: edge.from, weight: w, type });
    }
  }

  return { nodes, edges, nodeMap, adjList };
}

// Cache for campus graph
let _campusGraph: ReturnType<typeof getCampusGraph> | null = null;

/**
 * Get cached campus graph
 */
export function getGraph(): ReturnType<typeof getCampusGraph> {
  if (!_campusGraph) {
    _campusGraph = getCampusGraph();
  }
  return _campusGraph;
}

/**
 * Clear graph cache (useful after data updates)
 */
export function clearGraphCache(): void {
  _campusGraph = null;
}

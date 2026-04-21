"use client";

import { useEffect, useState, useMemo } from "react";
import { getFloorNodes, getFloorEdges, type IndoorNode, type IndoorEdge } from "@/lib/indoor-graph";
import type { CampusBuilding, CampusRoom, RoomType } from "@/lib/campus-data";
import type { NavNode } from "@/lib/pathfinding-service";

interface IndoorFloorMapProps {
  building: CampusBuilding;
  currentFloor: number;
  routeNodes?: NavNode[];
  currentWaypointIndex?: number;
  destinationRoom?: CampusRoom | null;
  userPosition?: { x: number; y: number; floor: number } | null;
  onRoomPress?: (room: CampusRoom) => void;
  scale?: number;
}

// Room type fill colors
const ROOM_TYPE_FILL: Record<RoomType | string, string> = {
  lab: "#EEF4FF",
  lecture: "#F5F0FF",
  office: "#F0FFF5",
  common: "#FFFFF0",
  study: "#F5FFF0",
  dining: "#FFF8F0",
  toilet: "#FFF5F5",
  hostel: "#F0F8FF",
  dormitory: "#F0F8FF",
  server: "#F5F5F5",
  workshop: "#FFF5E8",
  storage: "#F8F8F8",
  reading: "#FFFBF5",
  meeting: "#F5F0FF",
  conference: "#F5E8FF",
  worship: "#F8F5FF",
  memorial: "#F8F5FF",
  guest: "#F0FFF5",
  lounge: "#FFFFF0",
  facility: "#FFF8F0",
  default: "#DCEEFF",
};

// Room type stroke colors
const ROOM_TYPE_STROKE: Record<RoomType | string, string> = {
  lab: "#0066CC",
  lecture: "#6633BB",
  office: "#00883A",
  common: "#886600",
  study: "#00883A",
  dining: "#CC4400",
  toilet: "#CC4400",
  hostel: "#0066CC",
  dormitory: "#0066CC",
  server: "#666688",
  workshop: "#CC6600",
  storage: "#888888",
  reading: "#886600",
  meeting: "#6633BB",
  conference: "#CC0066",
  worship: "#6633BB",
  memorial: "#6633BB",
  guest: "#00883A",
  lounge: "#886600",
  facility: "#CC4400",
  default: "#0066CC",
};

// Building type colors
const BUILDING_TYPE_COLORS: Record<string, { fill: string; stroke: string }> = {
  academic: { fill: "#E8F3FF", stroke: "#0066CC" },
  hostel: { fill: "#E8F8F0", stroke: "#00883A" },
  admin: { fill: "#F0E8FF", stroke: "#6633BB" },
  service: { fill: "#FFF8E8", stroke: "#F5A800" },
  facility: { fill: "#FFF0E8", stroke: "#CC4400" },
  conference: { fill: "#FFE8F0", stroke: "#CC0066" },
  external: { fill: "#F5F5F5", stroke: "#888888" },
};

export function IndoorFloorMap({
  building,
  currentFloor,
  routeNodes = [],
  currentWaypointIndex = 0,
  destinationRoom,
  userPosition,
  onRoomPress,
  scale = 1,
}: IndoorFloorMapProps) {
  const [animationOffset, setAnimationOffset] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  // Get floor data
  const floorNodes = useMemo(() => getFloorNodes(building.id, currentFloor), [building.id, currentFloor]);
  const floorEdges = useMemo(() => getFloorEdges(building.id, currentFloor), [building.id, currentFloor]);

  // Filter route to current floor
  const floorRoute = useMemo(() => {
    return routeNodes.filter(n => n.floor === currentFloor && n.buildingId === building.id);
  }, [routeNodes, currentFloor, building.id]);

  // Separate passed and remaining route segments
  const routeSegments = useMemo(() => {
    const passed: NavNode[] = [];
    const remaining: NavNode[] = [];
    
    floorRoute.forEach((node, idx) => {
      const globalIdx = routeNodes.findIndex(n => n.id === node.id);
      if (globalIdx < currentWaypointIndex) {
        passed.push(node);
      } else {
        remaining.push(node);
      }
    });

    return { passed, remaining };
  }, [floorRoute, routeNodes, currentWaypointIndex]);

  // Animate marching ants
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset(prev => (prev - 1) % 18);
    }, 22);
    return () => clearInterval(interval);
  }, []);

  // Animate destination pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? 1.8 : 1);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  // Calculate SVG dimensions
  const padding = 20;
  const svgWidth = building.width * scale + padding * 2;
  const svgHeight = building.height * scale + padding * 2;

  // Convert local coords to SVG coords
  const toScreen = (localX: number, localY: number) => ({
    x: localX * scale + padding,
    y: (building.height - localY) * scale + padding, // Flip Y axis
  });

  const buildingColors = BUILDING_TYPE_COLORS[building.type] || BUILDING_TYPE_COLORS.academic;

  // Find destination node on this floor
  const destNode = floorNodes.find(n => n.roomId === destinationRoom?.id);

  // Room nodes
  const roomNodes = floorNodes.filter(n => n.type === "room");
  const stairNodes = floorNodes.filter(n => n.type === "stairs");
  const liftNodes = floorNodes.filter(n => n.type === "lift");

  // Create route path string
  const createPathString = (nodes: NavNode[]) => {
    if (nodes.length < 2) return "";
    return nodes.map((node, i) => {
      const pos = toScreen(
        node.x - building.position.x,
        node.y - building.position.y
      );
      return i === 0 ? `M ${pos.x} ${pos.y}` : `L ${pos.x} ${pos.y}`;
    }).join(" ");
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="transition-opacity duration-180"
    >
      {/* 1. Building boundary */}
      <rect
        x={padding}
        y={padding}
        width={building.width * scale}
        height={building.height * scale}
        fill={buildingColors.fill}
        stroke={buildingColors.stroke}
        strokeWidth={2}
        rx={8}
      />

      {/* 2. Corridor strips */}
      {floorEdges.map((edge, i) => {
        const fromNode = floorNodes.find(n => n.id === edge.from);
        const toNode = floorNodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const from = toScreen(fromNode.localX, fromNode.localY);
        const to = toScreen(toNode.localX, toNode.localY);

        return (
          <line
            key={`corridor-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="#E0E8F0"
            strokeWidth={14 * scale}
            strokeLinecap="round"
          />
        );
      })}

      {/* 3. Room tiles */}
      {roomNodes.map(node => {
        const pos = toScreen(node.localX, node.localY);
        const tileW = Math.min(30, building.width / 6) * scale;
        const tileH = tileW * 0.7;
        const fillColor = ROOM_TYPE_FILL[node.roomType || "default"] || ROOM_TYPE_FILL.default;
        const strokeColor = ROOM_TYPE_STROKE[node.roomType || "default"] || ROOM_TYPE_STROKE.default;
        const isDestination = destNode?.id === node.id;

        const room = building.rooms.find(r => r.id === node.roomId);

        return (
          <g key={node.id}>
            {/* Destination glow */}
            {isDestination && (
              <rect
                x={pos.x - tileW / 2 - 4}
                y={pos.y - tileH / 2 - 4}
                width={tileW + 8}
                height={tileH + 8}
                fill="#0066CC"
                opacity={0.08}
                rx={6}
              />
            )}
            
            {/* Room tile */}
            <rect
              x={pos.x - tileW / 2}
              y={pos.y - tileH / 2}
              width={tileW}
              height={tileH}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isDestination ? 2.5 : 1}
              rx={4}
              style={{ cursor: room && onRoomPress ? "pointer" : "default" }}
              onClick={() => room && onRoomPress?.(room)}
            />

            {/* Room label (visible at higher zoom) */}
            {scale > 2.5 && (
              <text
                x={pos.x}
                y={pos.y + 2}
                textAnchor="middle"
                fontSize={8}
                fill={strokeColor}
                fontWeight="500"
              >
                {node.label?.substring(0, 12)}
              </text>
            )}
          </g>
        );
      })}

      {/* 4. Staircase icons */}
      {stairNodes.map(node => {
        const pos = toScreen(node.localX, node.localY);
        const size = 20 * scale;

        return (
          <g key={node.id}>
            <rect
              x={pos.x - size / 2}
              y={pos.y - size / 2}
              width={size}
              height={size}
              fill="#FFF8E8"
              stroke="#F5A800"
              strokeWidth={1.5}
              strokeDasharray="3,2"
              rx={4}
            />
            {/* Tread lines */}
            {[0.3, 0.5, 0.7].map((offset, i) => (
              <line
                key={i}
                x1={pos.x - size * 0.3}
                y1={pos.y - size / 2 + size * offset}
                x2={pos.x + size * 0.3 - i * 2}
                y2={pos.y - size / 2 + size * offset}
                stroke="#F5A800"
                strokeWidth={2}
              />
            ))}
          </g>
        );
      })}

      {/* 5. Lift icons */}
      {liftNodes.map(node => {
        const pos = toScreen(node.localX, node.localY);
        const size = 20 * scale;

        return (
          <g key={node.id}>
            <rect
              x={pos.x - size / 2}
              y={pos.y - size / 2}
              width={size}
              height={size}
              fill="#E8F0FF"
              stroke="#0066CC"
              strokeWidth={1.5}
              strokeDasharray="3,2"
              rx={4}
            />
            {/* Up/Down arrows */}
            <text
              x={pos.x}
              y={pos.y + 3}
              textAnchor="middle"
              fontSize={10}
              fill="#0066CC"
              fontWeight="bold"
            >
              {"\u25B2\u25BC"}
            </text>
          </g>
        );
      })}

      {/* 6. Passed route segments (grey) */}
      {routeSegments.passed.length > 1 && (
        <path
          d={createPathString(routeSegments.passed)}
          fill="none"
          stroke="#8899BB"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
        />
      )}

      {/* 7. Active route polyline */}
      {routeSegments.remaining.length > 1 && (
        <>
          {/* White shadow */}
          <path
            d={createPathString(routeSegments.remaining)}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
          {/* Blue fill */}
          <path
            d={createPathString(routeSegments.remaining)}
            fill="none"
            stroke="#0066CC"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Marching ants */}
          <path
            d={createPathString(routeSegments.remaining)}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10,8"
            strokeDashoffset={animationOffset}
          />
        </>
      )}

      {/* 8. Start pin (if route starts on this floor) */}
      {floorRoute.length > 0 && routeNodes[0]?.floor === currentFloor && routeNodes[0]?.buildingId === building.id && (
        (() => {
          const startNode = routeNodes[0];
          const pos = toScreen(
            startNode.x - building.position.x,
            startNode.y - building.position.y
          );
          return (
            <g>
              <circle cx={pos.x} cy={pos.y} r={7} fill="#FFFFFF" stroke="#0066CC" strokeWidth={2.5} />
              <circle cx={pos.x} cy={pos.y} r={4} fill="#0066CC" />
            </g>
          );
        })()
      )}

      {/* 9. Destination pin with pulse */}
      {destNode && (
        (() => {
          const pos = toScreen(destNode.localX, destNode.localY);
          return (
            <g>
              {/* Pulse ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={10 * pulseScale}
                fill="#CC2200"
                opacity={0.3 / pulseScale}
                style={{ transition: "all 0.35s ease-out" }}
              />
              {/* Inner circle */}
              <circle cx={pos.x} cy={pos.y} r={9} fill="#CC2200" />
              {/* Room number */}
              <text
                x={pos.x}
                y={pos.y + 3}
                textAnchor="middle"
                fontSize={8}
                fill="#FFFFFF"
                fontWeight="bold"
              >
                {destinationRoom?.num?.substring(0, 3)}
              </text>
            </g>
          );
        })()
      )}

      {/* 10. User position (blue dot) */}
      {userPosition && userPosition.floor === currentFloor && (
        (() => {
          const pos = toScreen(
            userPosition.x - building.position.x,
            userPosition.y - building.position.y
          );
          return (
            <g>
              {/* Accuracy ring */}
              <circle cx={pos.x} cy={pos.y} r={18} fill="#0066CC" opacity={0.1} />
              {/* Outer ring */}
              <circle cx={pos.x} cy={pos.y} r={12} fill="#FFFFFF" />
              {/* Inner dot */}
              <circle cx={pos.x} cy={pos.y} r={8} fill="#0066CC" />
              {/* Highlight */}
              <circle cx={pos.x - 2} cy={pos.y - 2} r={3} fill="rgba(255,255,255,0.5)" />
            </g>
          );
        })()
      )}
    </svg>
  );
}

"use client";

import { useMemo } from "react";
import { CampusBuilding, CampusRoom, getRoomColors, getBuildingColors } from "@/lib/campus-data";
import { getIndoorGraph, type IndoorNode, type IndoorEdge } from "@/lib/indoor-navigation";

interface IndoorFloorPlanSVGProps {
  building: CampusBuilding;
  currentFloor: number;
  targetRoom: CampusRoom;
  currentNodeId?: string;
  path?: string[];
  currentStepIndex?: number;
  scale?: number;
  width?: number;
  height?: number;
}

// Room type icons as SVG paths
const ROOM_ICONS: Record<string, string> = {
  lab: "M4 2h8a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2zm0 8h8v4H4v-4z",
  lecture: "M3 4h10a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1zm1 8h8v2H4v-2z",
  office: "M4 3h8v11H4V3zm2 2v2h4V5H6zm0 3v2h4V8H6z",
  toilet: "M7 2a3 3 0 013 3v2H4V5a3 3 0 013-3zM4 9h6v5H4V9z",
  common: "M2 4h12v8H2V4zm1 2v4h10V6H3zm3-4h4v2H6V2z",
  stairs: "M2 12V8h2v2h2V8h2v2h2V8h2v4H2zm0-6h2v2H2V6zm4-2h2v2H6V4zm4-2h2v2h-2V2z",
  lift: "M3 2h8v12H3V2zm2 2v8h4V4H5zm1 6h2v1H6v-1zm1-3l1 1.5h-2L7 7z",
  default: "M4 2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z",
};

export function IndoorFloorPlanSVG({
  building,
  currentFloor,
  targetRoom,
  currentNodeId,
  path = [],
  currentStepIndex = 0,
  scale = 1.5,
  width = 400,
  height = 400,
}: IndoorFloorPlanSVGProps) {
  // Get indoor graph for this building
  const { nodes, edges } = useMemo(() => getIndoorGraph(building.id), [building.id]);

  // Get nodes and edges for current floor
  const floorNodes = useMemo(() => {
    return nodes.filter((n) => n.floor === currentFloor);
  }, [nodes, currentFloor]);

  const floorEdges = useMemo(() => {
    const nodeIds = new Set(floorNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
  }, [floorNodes, edges]);

  // Get rooms for current floor
  const floorRooms = useMemo(() => {
    return building.rooms.filter((r) => r.floor === currentFloor);
  }, [building.rooms, currentFloor]);

  // Building colors
  const buildingColors = getBuildingColors(building.type);

  // Viewbox dimensions
  const viewBoxSize = 200;
  const padding = 15;

  // Calculate if edge is on the navigation path
  const isEdgeOnPath = (fromId: string, toId: string) => {
    if (path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if (
        (path[i] === fromId && path[i + 1] === toId) ||
        (path[i] === toId && path[i + 1] === fromId)
      ) {
        const pathIndex = Math.min(path.indexOf(fromId), path.indexOf(toId));
        return { onPath: true, passed: pathIndex < currentStepIndex, active: pathIndex === currentStepIndex || pathIndex === currentStepIndex - 1 };
      }
    }
    return { onPath: false, passed: false, active: false };
  };

  // Calculate node status
  const getNodeStatus = (nodeId: string) => {
    const isCurrent = currentNodeId === nodeId;
    const isTarget = floorNodes.find(n => n.id === nodeId)?.roomId === targetRoom.id;
    const pathIndex = path.indexOf(nodeId);
    const isOnPath = pathIndex >= 0;
    const isPassed = isOnPath && pathIndex < currentStepIndex;
    const isActive = pathIndex === currentStepIndex;

    return { isCurrent, isTarget, isOnPath, isPassed, isActive };
  };

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={width}
      height={height}
      className="w-full h-full"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center",
        transition: "transform 0.3s ease",
      }}
    >
      <defs>
        {/* Background grid pattern */}
        <pattern
          id="floor-grid"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke="#D8E4F0"
            strokeWidth="0.3"
          />
        </pattern>

        {/* Room gradient */}
        <linearGradient id="room-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F0F5FF" stopOpacity="0.5" />
        </linearGradient>

        {/* Path glow filter */}
        <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Pulse animation for current position */}
        <radialGradient id="pulse-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0066CC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0066CC" stopOpacity="0" />
        </radialGradient>

        {/* Target glow */}
        <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00AA66" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00AA66" stopOpacity="0" />
        </radialGradient>

        {/* Wall shadow */}
        <filter id="wall-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Background */}
      <rect width={viewBoxSize} height={viewBoxSize} fill="#F0F5FF" />
      <rect width={viewBoxSize} height={viewBoxSize} fill="url(#floor-grid)" />

      {/* Building outline with 3D effect */}
      <g filter="url(#wall-shadow)">
        {/* Outer wall */}
        <rect
          x={padding}
          y={padding}
          width={viewBoxSize - padding * 2}
          height={viewBoxSize - padding * 2}
          fill={buildingColors.fill}
          stroke={buildingColors.stroke}
          strokeWidth="3"
          rx="4"
        />

        {/* Inner wall shadow */}
        <rect
          x={padding + 3}
          y={padding + 3}
          width={viewBoxSize - padding * 2 - 6}
          height={viewBoxSize - padding * 2 - 6}
          fill="none"
          stroke="rgba(0,0,0,0.05)"
          strokeWidth="1"
          rx="3"
        />
      </g>

      {/* Floor label */}
      <g>
        <rect
          x={padding + 5}
          y={padding + 5}
          width="45"
          height="14"
          fill={buildingColors.stroke}
          rx="2"
        />
        <text
          x={padding + 27.5}
          y={padding + 14}
          textAnchor="middle"
          fontSize="8"
          fill="white"
          fontWeight="600"
        >
          Floor {currentFloor}
        </text>
      </g>

      {/* Building name */}
      <text
        x={viewBoxSize / 2}
        y={padding + 12}
        textAnchor="middle"
        fontSize="9"
        fill={buildingColors.stroke}
        fontWeight="700"
      >
        {building.shortName}
      </text>

      {/* Main corridor visualization */}
      <g>
        {/* Horizontal main corridor */}
        <rect
          x={padding + 15}
          y={viewBoxSize / 2 - 8}
          width={viewBoxSize - padding * 2 - 30}
          height="16"
          fill="#F8FAFC"
          stroke="#D0E4F7"
          strokeWidth="1"
          rx="2"
        />

        {/* Corridor floor tiles */}
        {Array.from({ length: Math.floor((viewBoxSize - padding * 2 - 30) / 12) }).map((_, i) => (
          <rect
            key={`tile-${i}`}
            x={padding + 17 + i * 12}
            y={viewBoxSize / 2 - 6}
            width="10"
            height="12"
            fill="rgba(200, 210, 220, 0.3)"
            rx="1"
          />
        ))}
      </g>

      {/* Rooms */}
      <g>
        {floorRooms.map((room, idx) => {
          const node = floorNodes.find((n) => n.roomId === room.id);
          if (!node) return null;

          const roomsPerSide = Math.ceil(floorRooms.length / 2);
          const side = idx < roomsPerSide ? "north" : "south";
          const posInSide = idx < roomsPerSide ? idx : idx - roomsPerSide;

          // Calculate room position
          const roomWidth = Math.min(30, (viewBoxSize - padding * 2 - 40) / roomsPerSide - 4);
          const roomHeight = 35;
          const roomX = padding + 20 + posInSide * (roomWidth + 6);
          const roomY =
            side === "north"
              ? padding + 25
              : viewBoxSize - padding - roomHeight - 10;

          const isTargetRoom = room.id === targetRoom.id;
          const roomColors = getRoomColors(room.type);
          const status = getNodeStatus(node.id);

          return (
            <g key={room.id}>
              {/* Room glow for target */}
              {isTargetRoom && (
                <ellipse
                  cx={roomX + roomWidth / 2}
                  cy={roomY + roomHeight / 2}
                  rx={roomWidth / 2 + 8}
                  ry={roomHeight / 2 + 8}
                  fill="url(#target-glow)"
                >
                  <animate
                    attributeName="opacity"
                    values="0.5;1;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </ellipse>
              )}

              {/* Room rectangle with 3D effect */}
              <rect
                x={roomX}
                y={roomY}
                width={roomWidth}
                height={roomHeight}
                fill={status.isCurrent ? "#0066CC" : isTargetRoom ? "#00AA66" : roomColors.fill}
                stroke={status.isCurrent ? "#002255" : isTargetRoom ? "#006644" : roomColors.stroke}
                strokeWidth={status.isCurrent || isTargetRoom ? 2 : 1}
                rx="3"
              />

              {/* Room inner shadow */}
              <rect
                x={roomX + 1}
                y={roomY + 1}
                width={roomWidth - 2}
                height={roomHeight - 2}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.5"
                rx="2"
              />

              {/* Door indicator */}
              <rect
                x={roomX + roomWidth / 2 - 4}
                y={side === "north" ? roomY + roomHeight - 2 : roomY}
                width="8"
                height="3"
                fill={roomColors.stroke}
                rx="1"
              />

              {/* Room number badge */}
              <g>
                <rect
                  x={roomX + 2}
                  y={roomY + 2}
                  width="14"
                  height="10"
                  fill={roomColors.stroke}
                  rx="2"
                />
                <text
                  x={roomX + 9}
                  y={roomY + 10}
                  textAnchor="middle"
                  fontSize="6"
                  fill="white"
                  fontWeight="700"
                >
                  {room.num}
                </text>
              </g>

              {/* Room type label */}
              <text
                x={roomX + roomWidth / 2}
                y={roomY + roomHeight / 2 + 2}
                textAnchor="middle"
                fontSize="5"
                fill={status.isCurrent || isTargetRoom ? "white" : roomColors.stroke}
                fontWeight="500"
              >
                {room.name.length > 12 ? room.name.slice(0, 10) + "..." : room.name}
              </text>

              {/* Room type icon background */}
              <circle
                cx={roomX + roomWidth - 8}
                cy={roomY + roomHeight - 8}
                r="6"
                fill="rgba(255,255,255,0.8)"
              />
            </g>
          );
        })}
      </g>

      {/* Navigation path */}
      <g>
        {floorEdges.map((edge, i) => {
          const fromNode = floorNodes.find((n) => n.id === edge.from);
          const toNode = floorNodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const pathStatus = isEdgeOnPath(edge.from, edge.to);

          // Scale node positions to viewbox
          const fromX = padding + 10 + fromNode.x * ((viewBoxSize - padding * 2 - 20) / 100);
          const fromY = padding + 10 + fromNode.y * ((viewBoxSize - padding * 2 - 20) / 100);
          const toX = padding + 10 + toNode.x * ((viewBoxSize - padding * 2 - 20) / 100);
          const toY = padding + 10 + toNode.y * ((viewBoxSize - padding * 2 - 20) / 100);

          if (!pathStatus.onPath) return null;

          return (
            <g key={`edge-${i}`} filter={pathStatus.active ? "url(#path-glow)" : undefined}>
              {/* Path shadow */}
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Path line */}
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={
                  pathStatus.active
                    ? "#0066CC"
                    : pathStatus.passed
                    ? "#00AA66"
                    : "#6633BB"
                }
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={edge.type === "stairs" ? "4,4" : undefined}
              />
              {/* Animated dots for active path */}
              {pathStatus.active && (
                <circle r="3" fill="white">
                  <animateMotion
                    dur="1s"
                    repeatCount="indefinite"
                    path={`M${fromX},${fromY} L${toX},${toY}`}
                  />
                </circle>
              )}
            </g>
          );
        })}
      </g>

      {/* Stairs/Lift indicators */}
      <g>
        {floorNodes
          .filter((n) => n.type === "stairs" || n.type === "lift")
          .map((node) => {
            const x = padding + 10 + node.x * ((viewBoxSize - padding * 2 - 20) / 100);
            const y = padding + 10 + node.y * ((viewBoxSize - padding * 2 - 20) / 100);
            const status = getNodeStatus(node.id);

            return (
              <g key={node.id}>
                <rect
                  x={x - 8}
                  y={y - 8}
                  width="16"
                  height="16"
                  fill={status.isCurrent ? "#0066CC" : "#FFF8E8"}
                  stroke={status.isCurrent ? "#002255" : "#F5A800"}
                  strokeWidth="1.5"
                  rx="3"
                />
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize="8"
                  fill={status.isCurrent ? "white" : "#F5A800"}
                >
                  {node.type === "stairs" ? "↕" : "▲▼"}
                </text>
              </g>
            );
          })}
      </g>

      {/* Entry point */}
      <g>
        {floorNodes
          .filter((n) => n.type === "entry")
          .map((node) => {
            const x = padding + 10 + node.x * ((viewBoxSize - padding * 2 - 20) / 100);
            const y = padding + 10 + node.y * ((viewBoxSize - padding * 2 - 20) / 100);
            const status = getNodeStatus(node.id);

            return (
              <g key={node.id}>
                <path
                  d={`M${x - 8} ${y + 5} L${x} ${y - 8} L${x + 8} ${y + 5} Z`}
                  fill={status.isCurrent ? "#0066CC" : "#00AA44"}
                  stroke={status.isCurrent ? "#002255" : "#006630"}
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={y + 18}
                  textAnchor="middle"
                  fontSize="6"
                  fill="#006630"
                  fontWeight="500"
                >
                  Entry
                </text>
              </g>
            );
          })}
      </g>

      {/* Current position marker */}
      {currentNodeId && floorNodes.find((n) => n.id === currentNodeId) && (
        <g>
          {(() => {
            const node = floorNodes.find((n) => n.id === currentNodeId)!;
            const x = padding + 10 + node.x * ((viewBoxSize - padding * 2 - 20) / 100);
            const y = padding + 10 + node.y * ((viewBoxSize - padding * 2 - 20) / 100);

            return (
              <>
                {/* Pulse animation */}
                <circle cx={x} cy={y} r="15" fill="url(#pulse-gradient)">
                  <animate
                    attributeName="r"
                    values="10;20;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.2;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* User marker */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#0066CC"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle cx={x} cy={y - 2} r="2" fill="white" />
                <ellipse cx={x} cy={y + 3} rx="3" ry="2" fill="white" />
              </>
            );
          })()}
        </g>
      )}

      {/* Target marker */}
      {targetRoom && (
        <g>
          {(() => {
            const node = floorNodes.find((n) => n.roomId === targetRoom.id);
            if (!node || node.id === currentNodeId) return null;

            const x = padding + 10 + node.x * ((viewBoxSize - padding * 2 - 20) / 100);
            const y = padding + 10 + node.y * ((viewBoxSize - padding * 2 - 20) / 100);

            return (
              <>
                {/* Target flag */}
                <path
                  d={`M${x - 4} ${y + 8} L${x - 4} ${y - 8} L${x + 6} ${y - 4} L${x - 4} ${y}`}
                  fill="#00AA66"
                  stroke="#006644"
                  strokeWidth="1"
                />
                <circle cx={x - 4} cy={y + 8} r="2" fill="#006644" />
              </>
            );
          })()}
        </g>
      )}

      {/* Compass indicator */}
      <g transform={`translate(${viewBoxSize - 25}, ${padding + 25})`}>
        <circle cx="0" cy="0" r="10" fill="white" stroke="#D0E4F7" strokeWidth="1" />
        <text y="3" textAnchor="middle" fontSize="8" fill="#0066CC" fontWeight="700">
          N
        </text>
      </g>

      {/* Scale indicator */}
      <g transform={`translate(${padding + 10}, ${viewBoxSize - padding - 5})`}>
        <line x1="0" y1="0" x2="30" y2="0" stroke="#8899BB" strokeWidth="1" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke="#8899BB" strokeWidth="1" />
        <line x1="30" y1="-3" x2="30" y2="3" stroke="#8899BB" strokeWidth="1" />
        <text x="15" y="-5" textAnchor="middle" fontSize="5" fill="#8899BB">
          ~10m
        </text>
      </g>
    </svg>
  );
}

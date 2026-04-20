"use client";

import { useRef } from "react";
import { getNodesByFloor, getNodeById, type MapNode } from "@/lib/urnav-data";

interface FloorMapProps {
  floor: number;
  userPosition?: { x: number; y: number };
  routeNodes?: string[];
  currentWaypointIndex?: number;
  destinationNode?: string;
  onNodeClick?: (node: MapNode) => void;
}

export function FloorMap({
  floor,
  userPosition,
  routeNodes = [],
  currentWaypointIndex = 0,
  destinationNode,
  onNodeClick,
}: FloorMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scale = 4;
  const nodes = getNodesByFloor(floor);

  // Get route nodes on this floor
  const routeNodesOnFloor = routeNodes
    .map((id) => getNodeById(id))
    .filter((node): node is MapNode => node !== undefined && node.floor === floor);

  // Draw route path
  const routePath = routeNodesOnFloor.length > 1
    ? routeNodesOnFloor
        .map((node, i) => `${i === 0 ? "M" : "L"} ${node.x * scale} ${node.y * scale}`)
        .join(" ")
    : "";

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      {/* SVG Floor Plan */}
      <svg
        ref={svgRef}
        viewBox="0 0 440 320"
        className="w-full h-full"
        style={{ minHeight: "400px" }}
      >
        {/* Background */}
        <rect width="100%" height="100%" fill="#f5f5f0" />

        {/* Outdoor area (greenish) */}
        <rect x="0" y="220" width="440" height="100" fill="#d4dcc4" />
        
        {/* Building outline */}
        <rect
          x="20"
          y="20"
          width="400"
          height="200"
          fill="#ffffff"
          stroke="#9ca3af"
          strokeWidth="2"
        />

        {/* Main corridor - horizontal */}
        <rect x="20" y="85" width="400" height="30" fill="#f8f8f5" stroke="#d1d5db" strokeWidth="1" />

        {/* Top row of rooms */}
        {/* Room 1 - Large lecture hall */}
        <rect x="25" y="25" width="80" height="55" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="25" y="25" width="80" height="55" fill="none" stroke="#d4b896" strokeWidth="0.5" />
        {/* Seating rows */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={`seat-${i}`} x="30" y={32 + i * 12} width="70" height="8" fill="#e8e8e3" rx="1" />
        ))}

        {/* Room 2 */}
        <rect x="110" y="25" width="60" height="55" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        {/* Desks/tables */}
        <rect x="115" y="35" width="50" height="12" fill="#e2ddd5" rx="2" />
        <rect x="115" y="55" width="50" height="12" fill="#e2ddd5" rx="2" />

        {/* Room 3 */}
        <rect x="175" y="25" width="50" height="55" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="180" y="35" width="40" height="35" fill="#e2ddd5" rx="2" />

        {/* Central atrium/open space */}
        <ellipse cx="280" cy="55" rx="45" ry="30" fill="#f8f8f5" stroke="#d1d5db" strokeWidth="1" />
        
        {/* Room 4 */}
        <rect x="330" y="25" width="40" height="55" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        
        {/* Room 5 */}
        <rect x="375" y="25" width="40" height="55" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Stairs indicator */}
        <rect x="375" y="90" width="40" height="20" fill="#d4dcc4" stroke="#9ca3af" strokeWidth="1" />
        <line x1="380" y1="95" x2="410" y2="95" stroke="#9ca3af" strokeWidth="1" />
        <line x1="380" y1="100" x2="410" y2="100" stroke="#9ca3af" strokeWidth="1" />
        <line x1="380" y1="105" x2="410" y2="105" stroke="#9ca3af" strokeWidth="1" />

        {/* Bottom row of rooms */}
        {/* Room 6 - Computer lab */}
        <rect x="25" y="120" width="70" height="95" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        {/* Computer desks */}
        {[0, 1, 2, 3].map((i) => (
          <g key={`desk-row-${i}`}>
            <rect x="30" y={130 + i * 20} width="25" height="12" fill="#e2ddd5" rx="1" />
            <rect x="60" y={130 + i * 20} width="25" height="12" fill="#e2ddd5" rx="1" />
          </g>
        ))}

        {/* Room 7 */}
        <rect x="100" y="120" width="55" height="45" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="105" y="130" width="45" height="25" fill="#e2ddd5" rx="2" />

        {/* Room 8 */}
        <rect x="100" y="170" width="55" height="45" fill="#d8d4cc" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Room 9 - Meeting room */}
        <rect x="160" y="120" width="50" height="95" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        {/* Meeting table */}
        <ellipse cx="185" cy="165" rx="18" ry="35" fill="#d4b896" stroke="#b8956e" strokeWidth="1" />

        {/* Room 10 */}
        <rect x="215" y="120" width="45" height="45" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Room 11 */}
        <rect x="215" y="170" width="45" height="45" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Room 12 */}
        <rect x="265" y="120" width="55" height="95" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />
        {/* Desks */}
        <rect x="270" y="130" width="45" height="10" fill="#e2ddd5" rx="1" />
        <rect x="270" y="150" width="45" height="10" fill="#e2ddd5" rx="1" />
        <rect x="270" y="170" width="45" height="10" fill="#e2ddd5" rx="1" />
        <rect x="270" y="190" width="45" height="10" fill="#e2ddd5" rx="1" />

        {/* Room 13 */}
        <rect x="325" y="120" width="45" height="45" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Room 14 */}
        <rect x="325" y="170" width="45" height="45" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Elevator */}
        <rect x="375" y="120" width="40" height="40" fill="#e8e5dd" stroke="#9ca3af" strokeWidth="1.5" />
        <rect x="385" y="125" width="20" height="30" fill="#d1d5db" rx="2" />

        {/* Room 15 */}
        <rect x="375" y="165" width="40" height="50" fill="#f0f0eb" stroke="#9ca3af" strokeWidth="1.5" />

        {/* Door openings */}
        <rect x="55" y="78" width="12" height="10" fill="#f8f8f5" />
        <rect x="130" y="78" width="10" height="10" fill="#f8f8f5" />
        <rect x="192" y="78" width="10" height="10" fill="#f8f8f5" />
        <rect x="340" y="78" width="10" height="10" fill="#f8f8f5" />
        <rect x="385" y="78" width="10" height="10" fill="#f8f8f5" />

        {/* Entry point */}
        <rect x="185" y="215" width="30" height="10" fill="#f8f8f5" stroke="#9ca3af" strokeWidth="1" />

        {/* Route path overlay */}
        {routePath && (
          <path
            d={routePath}
            fill="none"
            stroke="#4dd0e1"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}

        {/* Destination marker (orange pin) */}
        {destinationNode && (() => {
          const destNode = getNodeById(destinationNode);
          if (!destNode || destNode.floor !== floor) return null;
          return (
            <g>
              {/* Pin shadow */}
              <ellipse
                cx={destNode.x * scale}
                cy={destNode.y * scale + 16}
                rx="8"
                ry="3"
                fill="rgba(0,0,0,0.2)"
              />
              {/* Pin body */}
              <path
                d={`M ${destNode.x * scale} ${destNode.y * scale + 12} 
                    c 0 0 -12 -12 -12 -20 
                    a 12 12 0 1 1 24 0 
                    c 0 8 -12 20 -12 20 z`}
                fill="#f97316"
                stroke="#ea580c"
                strokeWidth="1"
              />
              {/* Pin highlight */}
              <circle
                cx={destNode.x * scale}
                cy={destNode.y * scale - 8}
                r="5"
                fill="#ffffff"
                opacity="0.6"
              />
            </g>
          );
        })()}

        {/* Interactive room nodes (invisible clickable areas) */}
        {nodes.filter(n => n.type === 'room').map((node) => (
          <rect
            key={node.id}
            x={node.x * scale - 15}
            y={node.y * scale - 15}
            width="30"
            height="30"
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onNodeClick?.(node)}
          />
        ))}

        {/* User position (orange dot with blue glow) */}
        {userPosition && (
          <g>
            {/* Outer glow ring */}
            <circle
              cx={userPosition.x * scale}
              cy={userPosition.y * scale}
              r="24"
              fill="#93c5fd"
              opacity="0.3"
            />
            {/* Inner glow */}
            <circle
              cx={userPosition.x * scale}
              cy={userPosition.y * scale}
              r="16"
              fill="#60a5fa"
              opacity="0.4"
            />
            {/* Orange dot */}
            <circle
              cx={userPosition.x * scale}
              cy={userPosition.y * scale}
              r="8"
              fill="#f97316"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

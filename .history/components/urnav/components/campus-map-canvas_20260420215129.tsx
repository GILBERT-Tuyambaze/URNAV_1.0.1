"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ALL_BUILDINGS,
  EXTERNAL_BUILDINGS,
  GARDEN_ZONES,
  PARKING_AREAS,
  GATES,
  CAMPUS_ROADS,
  EXTERNAL_STREETS,
  KCEV_BOUNDARY,
  SPORTS_GROUND,
  getBuildingColors,
  type CampusBuilding,
} from "@/lib/campus-data";
import {
  toScreen,
  MAP_REAL_WIDTH,
  MAP_REAL_HEIGHT,
  type ViewState,
} from "@/lib/map-transform";

interface CampusMapCanvasProps {
  width: number;
  height: number;
  onBuildingTap?: (buildingId: string) => void;
  selectedBuildingId?: string | null;
  selectedRoute?: { points: { mx: number; my: number }[] } | null;
  onViewChange?: (view: MapView) => void;
}

// Generate tree positions with jitter
function generateTreePositions(zone: { position: { x: number; y: number }; width: number; height: number }) {
  const trees: { x: number; y: number }[] = [];
  const spacing = 15;
  for (let col = 0; col < zone.width / spacing; col++) {
    for (let row = 0; row < zone.height / spacing; row++) {
      const jitterX = ((col * 7 + row * 13) % 6) - 3;
      const jitterY = ((col * 11 + row * 5) % 6) - 3;
      trees.push({
        x: zone.position.x + col * spacing + jitterX + spacing / 2,
        y: zone.position.y + row * spacing + jitterY + spacing / 2,
      });
    }
  }
  return trees;
}

export function CampusMapCanvas({
  width,
  height,
  onBuildingTap,
  selectedBuildingId,
  selectedRoute,
  onViewChange,
}: CampusMapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<ViewState>({
    scale: 1,
    panX: 20,
    panY: 20,
    screenW: width,
    screenH: height,
  });
  const [marchingOffset, setMarchingOffset] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  // Current position for rendering
  const currentPos = null;
  const currentTrail = [];
  const showRoute = !!selectedRoute;
  const routeNodes = selectedRoute?.points.map(p => ({ x: p.mx, y: p.my })) || [];
  const currentRouteNodes = routeNodes;

  // Marching ants animation
  useEffect(() => {
    if (!showRoute || routeNodes.length < 2) return;
    const interval = setInterval(() => {
      setMarchingOffset((prev) => (prev - 1) % 14);
    }, 30);
    return () => clearInterval(interval);
  }, [showRoute, routeNodes.length]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="touch-none select-none"
      style={{ background: "#0a1a0a" }}
    >
      {/* LAYER 0 - Background */}
      <rect width={width} height={height} fill="#0a1a0a" />

      {/* LAYER 1 - Garden zones */}
      {GARDEN_ZONES.map((zone) => {
        const pos = ts(zone.position.x, zone.position.y);
        const w = scaleValue(zone.width);
        const h = scaleValue(zone.height);
        return (
          <rect
            key={zone.id}
            x={pos.sx}
            y={pos.sy - h}
            width={w}
            height={h}
            fill="#0d2010"
            stroke="#142a18"
            strokeWidth={1}
            rx={0}
          />
        );
      })}

      {/* Trees in gardens */}
      {view.scale > 0.8 &&
        GARDEN_ZONES.flatMap((zone) =>
          generateTreePositions(zone).map((tree, i) => {
            const pos = ts(tree.x, tree.y);
            return (
              <circle
                key={`tree-${zone.id}-${i}`}
                cx={pos.sx}
                cy={pos.sy}
                r={4 * view.scale}
                fill="#1a4020"
                stroke="#0d2010"
                strokeWidth={1}
              />
            );
          })
        )}

      {/* LAYER 2 - Sports Ground */}
      {(() => {
        const pos = ts(SPORTS_GROUND.position.x, SPORTS_GROUND.position.y);
        const w = scaleValue(SPORTS_GROUND.width);
        const h = scaleValue(SPORTS_GROUND.height);
        return (
          <g>
            <rect
              x={pos.sx}
              y={pos.sy - h}
              width={w}
              height={h}
              fill="#0d1a20"
              stroke="#1a3040"
              strokeWidth={1}
            />
            {/* Hatching lines */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`hatch-${i}`}
                x1={pos.sx + (i * w) / 10}
                y1={pos.sy - h}
                x2={pos.sx + (i * w) / 10 + w / 10}
                y2={pos.sy}
                stroke="#1a2a30"
                strokeWidth={0.5}
                opacity={0.6}
              />
            ))}
          </g>
        );
      })()}

      {/* LAYER 3 - External City Blocks */}
      {EXTERNAL_BUILDINGS.map((building) => {
        const pos = ts(building.position.x, building.position.y);
        const w = scaleValue(building.width);
        const h = scaleValue(building.height);
        return (
          <rect
            key={building.id}
            x={pos.sx}
            y={pos.sy - h}
            width={w}
            height={h}
            fill="#2a1f00"
            stroke="#3a3000"
            strokeWidth={0.5}
            rx={2}
          />
        );
      })}

      {/* LAYER 4 - Campus Roads */}
      {CAMPUS_ROADS.map((road, i) => {
        const from = ts(road.from.x, road.from.y);
        const to = ts(road.to.x, road.to.y);
        return (
          <line
            key={`road-${i}`}
            x1={from.sx}
            y1={from.sy}
            x2={to.sx}
            y2={to.sy}
            stroke="#1e1e2a"
            strokeWidth={road.width * view.scale}
            strokeLinecap="round"
          />
        );
      })}

      {/* External Streets */}
      {EXTERNAL_STREETS.map((street, i) => {
        const from = ts(street.from.x, street.from.y);
        const to = ts(street.to.x, street.to.y);
        return (
          <line
            key={`street-${i}`}
            x1={from.sx}
            y1={from.sy}
            x2={to.sx}
            y2={to.sy}
            stroke="#2a2a2a"
            strokeWidth={20 * view.scale}
            strokeLinecap="round"
          />
        );
      })}

      {/* LAYER 6 - Parking Areas */}
      {PARKING_AREAS.map((parking) => {
        const pos = ts(parking.position.x, parking.position.y);
        const w = scaleValue(parking.width);
        const h = scaleValue(parking.height);
        return (
          <g key={parking.id}>
            <rect
              x={pos.sx}
              y={pos.sy - h}
              width={w}
              height={h}
              fill="#1a2030"
              stroke="#2a3040"
              strokeWidth={0.5}
              rx={3}
            />
            <text
              x={pos.sx + w / 2}
              y={pos.sy - h / 2 + 4}
              fill="#378add"
              fontSize={Math.max(7, 10 * view.scale)}
              fontWeight="bold"
              textAnchor="middle"
            >
              P
            </text>
          </g>
        );
      })}

      {/* LAYER 7 - KCEV Area Overlay */}
      {(() => {
        const points = KCEV_BOUNDARY.map((p) => {
          const pos = ts(p.x, p.y);
          return `${pos.sx},${pos.sy}`;
        }).join(" ");
        return (
          <g>
            <polygon
              points={points}
              fill="rgba(180,80,120,0.08)"
              stroke="#d4537e"
              strokeWidth={1}
              strokeDasharray="4,3"
            />
            {/* KCEV label */}
            {(() => {
              const center = ts(340, 330);
              return (
                <text
                  x={center.sx}
                  y={center.sy}
                  fill="#d4537e"
                  fontSize={10 * view.scale}
                  textAnchor="middle"
                >
                  KCEV Area
                </text>
              );
            })()}
          </g>
        );
      })()}

      {/* LAYER 9 - Campus Buildings */}
      {ALL_BUILDINGS.map((building) => {
        const pos = ts(building.position.x, building.position.y);
        const w = scaleValue(building.width);
        const h = scaleValue(building.height);
        const colors = getBuildingColors(building.type);
        const isSelected = selectedBuildingId === building.id;
        const isDestination = destinationBuilding === building.id;

        return (
          <g
            key={building.id}
            onClick={() => onBuildingTap?.(building.id)}
            style={{ cursor: "pointer" }}
          >
            {/* Destination glow */}
            {isDestination && (
              <rect
                x={pos.sx - 4}
                y={pos.sy - h - 4}
                width={w + 8}
                height={h + 8}
                fill="#c84bff"
                opacity={0.15}
                rx={6}
              />
            )}

            {/* Building rect */}
            <rect
              x={pos.sx}
              y={pos.sy - h}
              width={w}
              height={h}
              fill={isDestination ? "#2a0a4a" : colors.fill}
              stroke={isSelected ? "#ffffff" : isDestination ? "#c84bff" : colors.stroke}
              strokeWidth={isSelected || isDestination ? 2.5 : 1.5}
              rx={3}
            />

            {/* Under construction overlay */}
            {building.underConstruction && (
              <g>
                {Array.from({ length: 5 }).map((_, i) => (
                  <line
                    key={`uc-${i}`}
                    x1={pos.sx + (i * w) / 5}
                    y1={pos.sy - h}
                    x2={pos.sx + w}
                    y2={pos.sy - h + (i * h) / 5}
                    stroke="#3a3000"
                    strokeWidth={0.8}
                    opacity={0.5}
                  />
                ))}
                <circle
                  cx={pos.sx + w - 10}
                  cy={pos.sy - h + 10}
                  r={7}
                  fill="#3a3000"
                />
                <text
                  x={pos.sx + w - 10}
                  y={pos.sy - h + 13}
                  fill="#ef9f27"
                  fontSize={8}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  UC
                </text>
              </g>
            )}

            {/* Building number badge */}
            {w > 20 && building.number > 0 && (
              <g>
                <circle
                  cx={pos.sx + 10}
                  cy={pos.sy - h + 10}
                  r={Math.max(7, 9 * view.scale)}
                  fill={colors.stroke}
                />
                <text
                  x={pos.sx + 10}
                  y={pos.sy - h + 13}
                  fill="#ffffff"
                  fontSize={Math.max(6, 8 * view.scale)}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {building.number}
                </text>
              </g>
            )}

            {/* Building short name */}
            {w > 30 && h > 16 && (
              <text
                x={pos.sx + w / 2}
                y={pos.sy - h / 2 + 4}
                fill="#ffffff"
                opacity={0.85}
                fontSize={Math.max(5, 7 * view.scale)}
                textAnchor="middle"
              >
                {building.shortName.length > 10
                  ? building.shortName.slice(0, 8) + "..."
                  : building.shortName}
              </text>
            )}
          </g>
        );
      })}

      {/* LAYER 10 - Gate Markers */}
      {GATES.map((gate) => {
        const pos = ts(gate.position.x, gate.position.y);
        return (
          <g key={gate.id}>
            <circle
              cx={pos.sx}
              cy={pos.sy}
              r={8 * view.scale}
              fill="#0a1a0a"
              stroke="#639922"
              strokeWidth={1.5}
            />
            <circle cx={pos.sx} cy={pos.sy} r={4 * view.scale} fill="#639922" />
            <text
              x={pos.sx}
              y={pos.sy + 18 * view.scale}
              fill="#8ab4d4"
              fontSize={Math.max(7, 9 * view.scale)}
              textAnchor="middle"
            >
              {gate.label}
            </text>
          </g>
        );
      })}

      {/* LAYER 11 - Outdoor Path Edges (debug) */}
      {showPathEdges &&
        view.scale > 1.5 &&
        currentRouteNodes.slice(0, -1).map((node, i) => {
          const from = ts(node.x, node.y);
          const to = ts(currentRouteNodes[i + 1].x, currentRouteNodes[i + 1].y);
          const opacity = Math.min(1, (view.scale - 1.5) / 0.5) * 0.45;
          return (
            <line
              key={`edge-${i}`}
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#1d3a2a"
              strokeWidth={1.5}
              opacity={opacity}
              strokeDasharray="3,3"
            />
          );
        })}

      {/* LAYER 12 - Outdoor Path Nodes (debug) */}
      {showPathNodes &&
        view.scale > 2.0 &&
        currentRouteNodes.map((node, i) => {
          const pos = ts(node.x, node.y);
          const opacity = Math.min(1, (view.scale - 2.0) / 0.5) * 0.35;
          return (
            <circle
              key={`node-${i}`}
              cx={pos.sx}
              cy={pos.sy}
              r={3}
              fill="#1d9e75"
              opacity={opacity}
            />
          );
        })}

      {/* LAYER 13 - Active Route */}
      {showRoute && currentRouteNodes.length >= 2 && (
        <g>
          {/* Route path */}
          <polyline
            points={currentRouteNodes
              .map((node) => {
                const pos = ts(node.x, node.y);
                return `${pos.sx},${pos.sy}`;
              })
              .join(" ")}
            fill="none"
            stroke="#00bcd4"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Marching ants overlay */}
          <polyline
            points={currentRouteNodes
              .map((node) => {
                const pos = ts(node.x, node.y);
                return `${pos.sx},${pos.sy}`;
              })
              .join(" ")}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="8,6"
            strokeDashoffset={marchingOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* LAYER 15 - Position Trail */}
      {showTrail &&
        currentTrail.map((pos, i) => {
          const screenPos = ts(pos.x, pos.y);
          const opacity = (i / currentTrail.length) * 0.6;
          return (
            <circle
              key={`trail-${i}`}
              cx={screenPos.sx}
              cy={screenPos.sy}
              r={2.5}
              fill={isDemoMode ? "#1d9e75" : "#c84bff"}
              opacity={opacity}
            />
          );
        })}

      {/* WiFi Position Dot (demo only) */}
      {isDemoMode && showWifiDot && demoState && (
        <g>
          {(() => {
            const pos = ts(demoState.wifiPos.x, demoState.wifiPos.y);
            return (
              <>
                <circle cx={pos.sx} cy={pos.sy} r={20} fill="#378add" opacity={0.06} />
                <circle cx={pos.sx} cy={pos.sy} r={6} fill="#378add" opacity={0.7} />
                <circle cx={pos.sx} cy={pos.sy} r={3} fill="#ffffff" opacity={0.6} />
              </>
            );
          })()}
        </g>
      )}

      {/* Kalman Position Dot (demo only) */}
      {isDemoMode && showKalmanDot && demoState && (
        <g>
          {(() => {
            const pos = ts(demoState.kalmanPos.x, demoState.kalmanPos.y);
            return (
              <>
                <rect
                  x={pos.sx - 4}
                  y={pos.sy - 12}
                  width={8}
                  height={8}
                  fill="#ef9f27"
                  opacity={0.9}
                  transform={`rotate(45 ${pos.sx} ${pos.sy - 8})`}
                />
                <circle cx={pos.sx} cy={pos.sy} r={5} fill="#ef9f27" opacity={0.8} />
              </>
            );
          })()}
        </g>
      )}

      {/* User Position Dot */}
      {currentPos && (
        <g>
          {(() => {
            const pos = ts(currentPos.x, currentPos.y);
            const dotColor = isDemoMode ? "#1d9e75" : "#c84bff";
            return (
              <>
                {/* Accuracy ring pulse */}
                <circle
                  cx={pos.sx}
                  cy={pos.sy}
                  r={14 + 12 * (pulseScale - 1)}
                  fill={dotColor}
                  opacity={0.15 - 0.12 * (pulseScale - 1)}
                />
                {/* Glow ring */}
                <circle cx={pos.sx} cy={pos.sy} r={12} fill={dotColor} opacity={0.2} />
                {/* Solid dot */}
                <circle cx={pos.sx} cy={pos.sy} r={8} fill={dotColor} />
                {/* White center */}
                <circle cx={pos.sx} cy={pos.sy} r={3.5} fill="#ffffff" opacity={0.9} />
              </>
            );
          })()}
        </g>
      )}

      {/* LAYER 16 - Destination Pin */}
      {destinationBuilding && (
        <g>
          {(() => {
            const building = ALL_BUILDINGS.find((b) => b.id === destinationBuilding);
            if (!building) return null;
            const pos = ts(
              building.position.x + building.width / 2,
              building.position.y + building.height / 2
            );
            return (
              <>
                {/* Pulse ring */}
                <circle
                  cx={pos.sx}
                  cy={pos.sy}
                  r={10 + 8 * (pulseScale - 1)}
                  fill="#c84bff"
                  opacity={0.3 - 0.3 * (pulseScale - 1)}
                />
                {/* Pin body */}
                <circle cx={pos.sx} cy={pos.sy} r={10} fill="#c84bff" />
                {/* Building number */}
                <text
                  x={pos.sx}
                  y={pos.sy + 4}
                  fill="#ffffff"
                  fontSize={8}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {building.number}
                </text>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}

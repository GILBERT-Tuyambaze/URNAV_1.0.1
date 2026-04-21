"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
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
  type CampusRoom,
} from "@/lib/campus-data";
import {
  toScreen,
  fitCampus,
  MAP_VIRTUAL_WIDTH,
  type ViewState,
} from "@/lib/map-transform";
import { demoController, type DemoState, type Position } from "@/lib/demo-controller";

interface CampusMapSVGProps {
  width: number;
  height: number;
  selectedBuilding?: string | null;
  destinationBuilding?: string | null;
  onBuildingSelect?: (building: CampusBuilding) => void;
  onRoomSelect?: (room: CampusRoom, building: CampusBuilding) => void;
  showRoute?: boolean;
  routeNodes?: Position[];
  userPosition?: Position | null;
  isDemoMode?: boolean;
  showTrail?: boolean;
  showWifiDot?: boolean;
  showKalmanDot?: boolean;
  showPathNodes?: boolean;
  showPathEdges?: boolean;
  animationSpeed?: number;
  onZoomChange?: (zoom: number) => void;
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 12;

// Room colors by type
const ROOM_COLORS: Record<string, { fill: string; stroke: string }> = {
  lecture: { fill: "#E8F4FF", stroke: "#0066CC" },
  lab: { fill: "#E8FFF0", stroke: "#00883A" },
  office: { fill: "#FFF8E8", stroke: "#F5A800" },
  restroom: { fill: "#F0F0F5", stroke: "#666680" },
  storage: { fill: "#F5F5F5", stroke: "#999999" },
  corridor: { fill: "#FAFAFA", stroke: "#CCCCCC" },
  stairs: { fill: "#FFE8F0", stroke: "#CC0066" },
  default: { fill: "#F8F8FC", stroke: "#AAAACC" },
};

export const CampusMapSVG = forwardRef<
  { zoomIn: () => void; zoomOut: () => void; resetView: () => void; centerOnUser: () => void },
  CampusMapSVGProps
>(function CampusMapSVG(
  {
    width,
    height,
    selectedBuilding,
    destinationBuilding,
    onBuildingSelect,
    onRoomSelect,
    showRoute = false,
    routeNodes = [],
    userPosition,
    isDemoMode = false,
    showTrail = true,
    showWifiDot = false,
    showKalmanDot = false,
    showPathNodes = false,
    showPathEdges = false,
    animationSpeed = 1.5,
    onZoomChange,
  },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize with fit campus view
  const getInitialView = useCallback((): ViewState => {
    const fit = fitCampus(width, height, 20);
    return {
      scale: fit.scale,
      panX: fit.panX,
      panY: fit.panY,
      screenW: width,
      screenH: height,
    };
  }, [width, height]);

  const [view, setView] = useState<ViewState>(() => getInitialView());
  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [marchingOffset, setMarchingOffset] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Ref to store current animation speed for interval
  const animationSpeedRef = useRef(animationSpeed);

  // Touch gesture state
  const gestureRef = useRef({
    isPanning: false,
    isPinching: false,
    startPanX: 0,
    startPanY: 0,
    startViewPanX: 0,
    startViewPanY: 0,
    startScale: 1,
    startDist: 0,
    startMidX: 0,
    startMidY: 0,
    velocityX: 0,
    velocityY: 0,
    lastPanX: 0,
    lastPanY: 0,
    lastPanTime: 0,
    momentumId: null as number | null,
  });

  // Subscribe to demo controller
  useEffect(() => {
    if (isDemoMode) {
      const unsubscribe = demoController.subscribe(setDemoState);
      return unsubscribe;
    }
  }, [isDemoMode]);

  // Update animation speed ref when prop changes
  useEffect(() => {
    animationSpeedRef.current = animationSpeed;
  }, [animationSpeed]);

  // Marching ants animation
  useEffect(() => {
    if (!showRoute || routeNodes.length < 2) return;
    const interval = setInterval(() => {
      setMarchingOffset((prev) => (prev - 1) % 20);
    }, Math.max(20, 50 / animationSpeedRef.current));
    return () => clearInterval(interval);
  }, [showRoute, routeNodes.length]);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.4 : 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Update view when dimensions change
  useEffect(() => {
    setView((prev) => {
      const fit = fitCampus(width, height, 20);
      const shouldReset =
        Math.abs(prev.screenW - width) > 50 || Math.abs(prev.screenH - height) > 50;
      return {
        ...prev,
        screenW: width,
        screenH: height,
        ...(shouldReset ? { scale: fit.scale, panX: fit.panX, panY: fit.panY } : {}),
      };
    });
  }, [width, height]);

  // Notify zoom changes
  useEffect(() => {
    onZoomChange?.(view.scale);
  }, [view.scale, onZoomChange]);

  // Convert campus coords to screen
  const ts = useCallback(
    (mx: number, my: number) => toScreen(mx, my, view),
    [view]
  );

  // Scale value
  const scaleValue = useCallback(
    (metres: number) => (metres * view.screenW * view.scale) / MAP_VIRTUAL_WIDTH,
    [view]
  );

  // Zoom functions
  const zoomIn = useCallback(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const newScale = Math.min(MAX_SCALE, view.scale * 1.4);
    const scaleRatio = newScale / view.scale;
    setView((prev) => ({
      ...prev,
      scale: newScale,
      panX: centerX - (centerX - prev.panX) * scaleRatio,
      panY: centerY - (centerY - prev.panY) * scaleRatio,
    }));
  }, [view.scale, width, height]);

  const zoomOut = useCallback(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const newScale = Math.max(MIN_SCALE, view.scale / 1.4);
    const scaleRatio = newScale / view.scale;
    setView((prev) => ({
      ...prev,
      scale: newScale,
      panX: centerX - (centerX - prev.panX) * scaleRatio,
      panY: centerY - (centerY - prev.panY) * scaleRatio,
    }));
  }, [view.scale, width, height]);

  const resetView = useCallback(() => {
    const fit = fitCampus(width, height, 20);
    setView((prev) => ({
      ...prev,
      scale: fit.scale,
      panX: fit.panX,
      panY: fit.panY,
    }));
  }, [width, height]);

  const centerOnUser = useCallback(() => {
    const pos = isDemoMode && demoState ? demoState.truePos : userPosition;
    if (!pos) return;
    const screenPos = ts(pos.x, pos.y);
    setView((prev) => ({
      ...prev,
      panX: prev.panX + width / 2 - screenPos.sx,
      panY: prev.panY + height / 2 - screenPos.sy,
    }));
  }, [isDemoMode, demoState, userPosition, ts, width, height]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetView,
    centerOnUser,
  }));

  // Touch handlers for pan and pinch-to-zoom
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const gesture = gestureRef.current;

      if (gesture.momentumId) {
        cancelAnimationFrame(gesture.momentumId);
        gesture.momentumId = null;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        gesture.isPanning = true;
        gesture.isPinching = false;
        gesture.startPanX = touch.clientX;
        gesture.startPanY = touch.clientY;
        gesture.startViewPanX = view.panX;
        gesture.startViewPanY = view.panY;
        gesture.lastPanX = touch.clientX;
        gesture.lastPanY = touch.clientY;
        gesture.lastPanTime = Date.now();
        gesture.velocityX = 0;
        gesture.velocityY = 0;
      } else if (e.touches.length === 2) {
        gesture.isPanning = false;
        gesture.isPinching = true;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        gesture.startDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        gesture.startScale = view.scale;
        gesture.startMidX = (t1.clientX + t2.clientX) / 2;
        gesture.startMidY = (t1.clientY + t2.clientY) / 2;
        gesture.startViewPanX = view.panX;
        gesture.startViewPanY = view.panY;
      }
    },
    [view.panX, view.panY, view.scale]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const gesture = gestureRef.current;

    if (gesture.isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      const dx = touch.clientX - gesture.startPanX;
      const dy = touch.clientY - gesture.startPanY;

      const now = Date.now();
      const dt = now - gesture.lastPanTime;
      if (dt > 0) {
        gesture.velocityX = ((touch.clientX - gesture.lastPanX) / dt) * 16;
        gesture.velocityY = ((touch.clientY - gesture.lastPanY) / dt) * 16;
      }
      gesture.lastPanX = touch.clientX;
      gesture.lastPanY = touch.clientY;
      gesture.lastPanTime = now;

      setView((prev) => ({
        ...prev,
        panX: gesture.startViewPanX + dx,
        panY: gesture.startViewPanY + dy,
      }));
    } else if (gesture.isPinching && e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const newMidX = (t1.clientX + t2.clientX) / 2;
      const newMidY = (t1.clientY + t2.clientY) / 2;

      const scaleFactor = newDist / gesture.startDist;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, gesture.startScale * scaleFactor));

      const scaleRatio = newScale / gesture.startScale;
      const newPanX = newMidX - (gesture.startMidX - gesture.startViewPanX) * scaleRatio;
      const newPanY = newMidY - (gesture.startMidY - gesture.startViewPanY) * scaleRatio;

      setView((prev) => ({
        ...prev,
        scale: newScale,
        panX: newPanX,
        panY: newPanY,
      }));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const gesture = gestureRef.current;

    if (gesture.isPanning) {
      const applyMomentum = () => {
        gesture.velocityX *= 0.92;
        gesture.velocityY *= 0.92;

        if (Math.abs(gesture.velocityX) > 0.5 || Math.abs(gesture.velocityY) > 0.5) {
          setView((prev) => ({
            ...prev,
            panX: prev.panX + gesture.velocityX,
            panY: prev.panY + gesture.velocityY,
          }));
          gesture.momentumId = requestAnimationFrame(applyMomentum);
        } else {
          gesture.momentumId = null;
        }
      };

      if (Math.abs(gesture.velocityX) > 1 || Math.abs(gesture.velocityY) > 1) {
        gesture.momentumId = requestAnimationFrame(applyMomentum);
      }
    }

    gesture.isPanning = false;
    gesture.isPinching = false;
  }, []);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const gesture = gestureRef.current;

      if (gesture.momentumId) {
        cancelAnimationFrame(gesture.momentumId);
        gesture.momentumId = null;
      }

      gesture.isPanning = true;
      gesture.startPanX = e.clientX;
      gesture.startPanY = e.clientY;
      gesture.startViewPanX = view.panX;
      gesture.startViewPanY = view.panY;
    },
    [view.panX, view.panY]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const gesture = gestureRef.current;
    if (!gesture.isPanning) return;

    const dx = e.clientX - gesture.startPanX;
    const dy = e.clientY - gesture.startPanY;

    setView((prev) => ({
      ...prev,
      panX: gesture.startViewPanX + dx,
      panY: gesture.startViewPanY + dy,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    gestureRef.current.isPanning = false;
  }, []);

  // Mouse wheel for zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.85 : 1.15;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * zoomFactor));

      const scaleRatio = newScale / view.scale;
      const newPanX = mouseX - (mouseX - view.panX) * scaleRatio;
      const newPanY = mouseY - (mouseY - view.panY) * scaleRatio;

      setView((prev) => ({
        ...prev,
        scale: newScale,
        panX: newPanX,
        panY: newPanY,
      }));
    },
    [view.scale, view.panX, view.panY]
  );

  // Double tap/click to zoom
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (view.scale > 3) {
        const fit = fitCampus(width, height, 20);
        setView((prev) => ({
          ...prev,
          scale: fit.scale,
          panX: fit.panX,
          panY: fit.panY,
        }));
      } else {
        const newScale = Math.min(MAX_SCALE, view.scale * 2.5);
        const scaleRatio = newScale / view.scale;
        const newPanX = clickX - (clickX - view.panX) * scaleRatio;
        const newPanY = clickY - (clickY - view.panY) * scaleRatio;

        setView((prev) => ({
          ...prev,
          scale: newScale,
          panX: newPanX,
          panY: newPanY,
        }));
      }
    },
    [view.scale, view.panX, view.panY, width, height]
  );

  // Handle building tap
  const handleBuildingClick = useCallback(
    (e: React.MouseEvent, building: CampusBuilding) => {
      e.stopPropagation();
      onBuildingSelect?.(building);
    },
    [onBuildingSelect]
  );

  // Handle room tap
  const handleRoomClick = useCallback(
    (e: React.MouseEvent, room: CampusRoom, building: CampusBuilding) => {
      e.stopPropagation();
      setSelectedRoom(room.id);
      onRoomSelect?.(room, building);
    },
    [onRoomSelect]
  );

  // Current position for rendering
  const currentPos = isDemoMode && demoState ? demoState.truePos : userPosition;
  const currentTrail = isDemoMode && demoState ? demoState.trail : [];
  const currentRouteNodes = isDemoMode ? demoController.getRouteNodes() : routeNodes;

  // Zoom level thresholds for progressive detail
  const zoomLevel =
    view.scale < 0.6 ? 0 : view.scale < 1 ? 1 : view.scale < 2 ? 2 : view.scale < 4 ? 3 : view.scale < 7 ? 4 : 5;

  // Show indoor rooms at high zoom
  const showIndoorRooms = zoomLevel >= 4;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ background: "#E8F0FA" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <defs>
        {/* Building shadow filter */}
        <filter id="buildingShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
        {/* User glow */}
        <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0066CC" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0066CC" stopOpacity="0" />
        </radialGradient>
        {/* Destination glow */}
        <radialGradient id="destGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6633BB" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6633BB" stopOpacity="0" />
        </radialGradient>
        {/* Road pattern */}
        <pattern id="roadDash" patternUnits="userSpaceOnUse" width="20" height="4">
          <rect width="12" height="2" y="1" fill="#FFFFFF" opacity="0.6" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="#E8F0FA" />

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
            fill="#D4E8D0"
            rx={4}
          />
        );
      })}

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
              fill="#B8D8B0"
              stroke="#88B880"
              strokeWidth={1}
              rx={4}
            />
            {zoomLevel >= 2 && (
              <text
                x={pos.sx + w / 2}
                y={pos.sy - h / 2 + 4}
                fill="#446644"
                fontSize={11}
                textAnchor="middle"
                fontWeight="600"
              >
                Sports Ground
              </text>
            )}
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
            fill="#E0E4E8"
            rx={2}
          />
        );
      })}

      {/* LAYER 4 - External Streets */}
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
            stroke="#D0D4D8"
            strokeWidth={Math.max(8, 16 * view.scale)}
            strokeLinecap="round"
          />
        );
      })}

      {/* LAYER 5 - Campus Roads */}
      {CAMPUS_ROADS.map((road, i) => {
        const from = ts(road.from.x, road.from.y);
        const to = ts(road.to.x, road.to.y);
        const roadWidth = Math.max(6, road.width * view.scale);
        return (
          <g key={`road-${i}`}>
            {/* Road outline */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#B8C0CC"
              strokeWidth={roadWidth + 2}
              strokeLinecap="round"
            />
            {/* Road fill */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#F5F7FA"
              strokeWidth={roadWidth}
              strokeLinecap="round"
            />
          </g>
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
              fill="#E8ECF0"
              stroke="#C0C8D0"
              strokeWidth={1}
              rx={3}
            />
            {/* P icon */}
            <rect
              x={pos.sx + w / 2 - 8}
              y={pos.sy - h / 2 - 8}
              width={16}
              height={16}
              fill="#3366AA"
              rx={3}
            />
            <text
              x={pos.sx + w / 2}
              y={pos.sy - h / 2 + 5}
              fill="#FFFFFF"
              fontSize={12}
              fontWeight="bold"
              textAnchor="middle"
            >
              P
            </text>
          </g>
        );
      })}

      {/* LAYER 7 - KCEV Area Boundary */}
      {(() => {
        const points = KCEV_BOUNDARY.map((p) => {
          const pos = ts(p.x, p.y);
          return `${pos.sx},${pos.sy}`;
        }).join(" ");
        return (
          <g>
            <polygon
              points={points}
              fill="rgba(180,60,120,0.06)"
              stroke="#AA3366"
              strokeWidth={1.5}
              strokeDasharray="6,4"
            />
            {zoomLevel >= 1 &&
              (() => {
                const center = ts(310, 360);
                return (
                  <text
                    x={center.sx}
                    y={center.sy}
                    fill="#AA3366"
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="600"
                    opacity={0.8}
                  >
                    KCEV
                  </text>
                );
              })()}
          </g>
        );
      })()}

      {/* LAYER 8 - Campus Buildings */}
      {(() => {
        // Calculate building positions with collision detection
        const buildingPositions = ALL_BUILDINGS.map((building) => {
          const basePos = ts(building.position.x, building.position.y);
          const w = scaleValue(building.width);
          const h = scaleValue(building.height);
          return {
            building,
            basePos,
            w,
            h,
            screenPos: { ...basePos },
          };
        });

        // Minimal collision detection - only for edge cases
        // The spacing scale (1.18x) now provides natural separation
        // Only push apart buildings that are extremely close at high zoom
        const zoomFactor = Math.pow(view.scale, 0.7);
        const minDistance = view.scale > 4 ? 8 : Math.max(4, 15 / zoomFactor);
        const maxOffset = view.scale > 4 ? 3 : Math.max(2, 8 / zoomFactor);

        for (let i = 0; i < buildingPositions.length; i++) {
          for (let j = i + 1; j < buildingPositions.length; j++) {
            const b1 = buildingPositions[i];
            const b2 = buildingPositions[j];

            const dx = b2.screenPos.sx - b1.screenPos.sx;
            const dy = b2.screenPos.sy - b1.screenPos.sy;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance && distance > 0) {
              // Only apply minimal offset for extreme cases
              const offset = (minDistance - distance) / 2;
              const angle = Math.atan2(dy, dx);
              const push = Math.min(offset, maxOffset);

              b1.screenPos.sx -= Math.cos(angle) * push;
              b1.screenPos.sy -= Math.sin(angle) * push;
              b2.screenPos.sx += Math.cos(angle) * push;
              b2.screenPos.sy += Math.sin(angle) * push;
            }
          }
        }

        return buildingPositions.map(({ building, screenPos, w, h }) => {
          const colors = getBuildingColors(building.type);
          const isSelected = selectedBuilding === building.id;
          const isDestination = destinationBuilding === building.id;

          return (
            <g
              key={building.id}
              onClick={(e) => handleBuildingClick(e, building)}
              style={{ cursor: "pointer" }}
              filter="url(#buildingShadow)"
            >
              {/* Destination highlight */}
              {isDestination && (
                <rect
                  x={screenPos.sx - 6}
                  y={screenPos.sy - h - 6}
                  width={w + 12}
                  height={h + 12}
                  fill="url(#destGlow)"
                  rx={8}
                />
              )}

              {/* Building body */}
              <rect
                x={screenPos.sx}
                y={screenPos.sy - h}
                width={w}
                height={h}
                fill={isDestination ? "#EDE8F8" : colors.fill}
                stroke={isSelected ? "#002255" : isDestination ? "#6633BB" : colors.stroke}
                strokeWidth={isSelected || isDestination ? 2.5 : 1.5}
                rx={4}
              />

            {/* Indoor rooms when zoomed in */}
            {showIndoorRooms && building.rooms && building.rooms.length > 0 && (
              <g>
                {building.rooms
                  .filter((r) => r.floor === 1) // Show ground floor
                  .map((room, roomIndex) => {
                    // Generate grid layout for rooms (auto-arrange based on index)
                    const roomsOnFloor = building.rooms.filter((r) => r.floor === 1);
                    const cols = Math.ceil(Math.sqrt(roomsOnFloor.length));
                    const rows = Math.ceil(roomsOnFloor.length / cols);
                    const col = roomIndex % cols;
                    const row = Math.floor(roomIndex / cols);
                    const padding = 4;
                    const cellW = (w - padding * 2) / cols;
                    const cellH = (h - padding * 2) / rows;
                    const roomX = screenPos.sx + padding + col * cellW;
                    const roomY = screenPos.sy - h + padding + row * cellH;
                    const roomW = cellW - 2;
                    const roomH = cellH - 2;
                    const roomColor = ROOM_COLORS[room.type || "default"] || ROOM_COLORS.default;
                    const isRoomSelected = selectedRoom === room.id;

                    return (
                      <g
                        key={room.id}
                        onClick={(e) => handleRoomClick(e, room, building)}
                        style={{ cursor: "pointer" }}
                      >
                        <rect
                          x={roomX}
                          y={roomY}
                          width={roomW}
                          height={roomH}
                          fill={roomColor.fill}
                          stroke={isRoomSelected ? "#002255" : roomColor.stroke}
                          strokeWidth={isRoomSelected ? 1.5 : 0.75}
                          rx={2}
                        />
                        {/* Room number badge */}
                        {roomW > 15 && roomH > 10 && (
                          <text
                            x={roomX + roomW / 2}
                            y={roomY + roomH / 2 + 3}
                            fill="#334455"
                            fontSize={Math.max(6, Math.min(roomW / 4, roomH / 3, 10))}
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {room.num}
                          </text>
                        )}
                      </g>
                    );
                  })}
              </g>
            )}

            {/* Building number badge */}
            {building.number !== 0 && w > 12 && (
              <g>
                <rect
                  x={screenPos.sx + 3}
                  y={screenPos.sy - h + 3}
                  width={Math.max(14, 16 * Math.min(1, view.scale))}
                  height={Math.max(14, 16 * Math.min(1, view.scale))}
                  fill={colors.stroke}
                  rx={3}
                />
                <text
                  x={screenPos.sx + 3 + Math.max(7, 8 * Math.min(1, view.scale))}
                  y={screenPos.sy - h + 3 + Math.max(10, 12 * Math.min(1, view.scale))}
                  fill="#ffffff"
                  fontSize={10}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {building.number}
                </text>
              </g>
            )}

            {/* Building name at medium+ zoom */}
            {zoomLevel >= 2 && w > 30 && h > 20 && !showIndoorRooms && (
              <text
                x={screenPos.sx + w / 2}
                y={screenPos.sy - h / 2 + 4}
                fill="#1a2a4a"
                fontSize={9}
                fontWeight="600"
                textAnchor="middle"
                opacity={0.85}
              >
                {building.shortName.length > 12
                  ? building.shortName.slice(0, 10) + "..."
                  : building.shortName}
              </text>
            )}

            {/* Under construction indicator */}
            {building.underConstruction && (
              <g>
                <rect
                  x={screenPos.sx + w - 18}
                  y={screenPos.sy - h + 3}
                  width={15}
                  height={15}
                  fill="#F5A800"
                  rx={3}
                />
                <text
                  x={screenPos.sx + w - 10.5}
                  y={screenPos.sy - h + 13}
                  fill="#FFFFFF"
                  fontSize={8}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  !
                </text>
              </g>
            )}
          </g>
        );
      });
      })()}

      {/* LAYER 9 - Gate Markers */}
      {GATES.map((gate) => {
        const pos = ts(gate.position.x, gate.position.y);
        const r = Math.max(10, 12 * view.scale);
        return (
          <g key={gate.id}>
            <circle cx={pos.sx} cy={pos.sy} r={r} fill="#FFFFFF" stroke="#00883A" strokeWidth={2.5} />
            <rect x={pos.sx - 4} y={pos.sy - 5} width={8} height={10} fill="#00883A" rx={1} />
            <rect x={pos.sx - 2} y={pos.sy - 3} width={4} height={6} fill="#FFFFFF" rx={0.5} />
            <text
              x={pos.sx}
              y={pos.sy + r + 12}
              fill="#006830"
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
            >
              {gate.label}
            </text>
          </g>
        );
      })}

      {/* LAYER 10 - Debug Path Edges */}
      {showPathEdges &&
        zoomLevel >= 2 &&
        currentRouteNodes.slice(0, -1).map((node, i) => {
          const from = ts(node.x, node.y);
          const to = ts(currentRouteNodes[i + 1].x, currentRouteNodes[i + 1].y);
          return (
            <line
              key={`edge-${i}`}
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#0066CC"
              strokeWidth={1.5}
              opacity={0.4}
              strokeDasharray="4,4"
            />
          );
        })}

      {/* LAYER 11 - Debug Path Nodes */}
      {showPathNodes &&
        zoomLevel >= 3 &&
        currentRouteNodes.map((node, i) => {
          const pos = ts(node.x, node.y);
          return <circle key={`node-${i}`} cx={pos.sx} cy={pos.sy} r={4} fill="#1d9e75" opacity={0.5} />;
        })}

      {/* LAYER 12 - Active Navigation Route */}
      {showRoute && currentRouteNodes.length >= 2 && (
        <g>
          {/* Route shadow */}
          <polyline
            points={currentRouteNodes.map((node) => {
              const p = ts(node.x, node.y);
              return `${p.sx},${p.sy}`;
            }).join(" ")}
            fill="none"
            stroke="#4422AA"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.2}
          />
          {/* Route main line */}
          <polyline
            points={currentRouteNodes.map((node) => {
              const p = ts(node.x, node.y);
              return `${p.sx},${p.sy}`;
            }).join(" ")}
            fill="none"
            stroke="#6633BB"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Marching ants */}
          <polyline
            points={currentRouteNodes.map((node) => {
              const p = ts(node.x, node.y);
              return `${p.sx},${p.sy}`;
            }).join(" ")}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeDasharray="8,12"
            strokeDashoffset={marchingOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* LAYER 13 - Position Trail */}
      {showTrail &&
        currentTrail.map((pos, i) => {
          const screenPos = ts(pos.x, pos.y);
          const opacity = (i / currentTrail.length) * 0.6;
          const r = 2 + (i / currentTrail.length) * 2;
          return <circle key={`trail-${i}`} cx={screenPos.sx} cy={screenPos.sy} r={r} fill="#0066CC" opacity={opacity} />;
        })}

      {/* WiFi Position (debug) */}
      {isDemoMode && showWifiDot && demoState && (
        <g>
          {(() => {
            const pos = ts(demoState.wifiPos.x, demoState.wifiPos.y);
            return (
              <>
                <circle cx={pos.sx} cy={pos.sy} r={16} fill="#0066CC" opacity={0.15} />
                <circle cx={pos.sx} cy={pos.sy} r={6} fill="#0066CC" stroke="#FFFFFF" strokeWidth={2} />
              </>
            );
          })()}
        </g>
      )}

      {/* Kalman Position (debug) */}
      {isDemoMode && showKalmanDot && demoState && (
        <g>
          {(() => {
            const pos = ts(demoState.kalmanPos.x, demoState.kalmanPos.y);
            return (
              <rect
                x={pos.sx - 6}
                y={pos.sy - 6}
                width={12}
                height={12}
                fill="#F5A800"
                stroke="#FFFFFF"
                strokeWidth={2}
                rx={2}
                transform={`rotate(45 ${pos.sx} ${pos.sy})`}
              />
            );
          })()}
        </g>
      )}

      {/* LAYER 14 - User Position */}
      {currentPos && (
        <g>
          {(() => {
            const pos = ts(currentPos.x, currentPos.y);
            return (
              <>
                {/* Accuracy ring pulse */}
                <circle
                  cx={pos.sx}
                  cy={pos.sy}
                  r={28 + 16 * (pulseScale - 1)}
                  fill="url(#userGlow)"
                  opacity={1.2 - 0.8 * (pulseScale - 1)}
                />
                {/* Outer ring */}
                <circle cx={pos.sx} cy={pos.sy} r={18} fill="#FFFFFF" stroke="#0055BB" strokeWidth={3} />
                {/* Inner solid */}
                <circle cx={pos.sx} cy={pos.sy} r={12} fill="#0066CC" />
                {/* Person icon */}
                <circle cx={pos.sx} cy={pos.sy - 3} r={3} fill="#FFFFFF" />
                <ellipse cx={pos.sx} cy={pos.sy + 4} rx={4} ry={3} fill="#FFFFFF" />
              </>
            );
          })()}
        </g>
      )}

      {/* LAYER 15 - Destination Pin */}
      {destinationBuilding && (
        <g>
          {(() => {
            const building = ALL_BUILDINGS.find((b) => b.id === destinationBuilding);
            if (!building) return null;
            const pos = ts(building.position.x + building.width / 2, building.position.y + building.height / 2);
            return (
              <>
                <ellipse cx={pos.sx + 2} cy={pos.sy + 20} rx={8} ry={4} fill="#000000" opacity={0.15} />
                <path
                  d={`M${pos.sx} ${pos.sy + 14} L${pos.sx - 12} ${pos.sy - 6} A14 14 0 1 1 ${pos.sx + 12} ${pos.sy - 6} Z`}
                  fill="#6633BB"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
                <circle cx={pos.sx} cy={pos.sy - 8} r={6} fill="#FFFFFF" />
                <text x={pos.sx} y={pos.sy - 5} fill="#6633BB" fontSize={8} fontWeight="bold" textAnchor="middle">
                  {building.number}
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* LAYER 16 - Zoom indicator (bottom right) */}
      <g>
        <rect x={width - 70} y={height - 40} width={60} height={30} rx={6} fill="rgba(255,255,255,0.95)" stroke="#D0D8E0" strokeWidth={1} />
        <text x={width - 40} y={height - 20} fontSize={12} fill="#2a3a5a" textAnchor="middle" fontWeight="600">
          {Math.round(view.scale * 100)}%
        </text>

        {/* Speed indicator (demo mode) */}
        {isDemoMode && (
          <>
            <rect x={10} y={height - 40} width={80} height={30} rx={6} fill="rgba(255,255,255,0.95)" stroke="#D0D8E0" strokeWidth={1} />
            <text x={50} y={height - 20} fontSize={11} fill="#2a3a5a" textAnchor="middle" fontWeight="500">
              {animationSpeed.toFixed(1)} m/s
            </text>
          </>
        )}
      </g>
    </svg>
  );
});

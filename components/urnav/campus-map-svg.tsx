"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  getRoomColors,
  type CampusBuilding,
  type CampusRoom,
} from "@/lib/campus-data";
import {
  toScreen,
  fitCampus,
  MAP_REAL_WIDTH,
  MAP_REAL_HEIGHT,
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

// Scale bounds
const MIN_SCALE = 0.4;
const MAX_SCALE = 12;

// Zoom level thresholds
const ZOOM_LEVEL = {
  OVERVIEW: 0.8,
  CAMPUS: 1.2,
  DISTRICT: 2.5,
  BUILDING: 4.5,
  ROOM: 7,
};

export function CampusMapSVG({
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
  animationSpeed = 1,
  onZoomChange,
}: CampusMapSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Initialize view state
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
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Gesture state
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

  // Compute zoom level category
  const zoomLevel = useMemo(() => {
    if (view.scale < ZOOM_LEVEL.OVERVIEW) return 0;
    if (view.scale < ZOOM_LEVEL.CAMPUS) return 1;
    if (view.scale < ZOOM_LEVEL.DISTRICT) return 2;
    if (view.scale < ZOOM_LEVEL.BUILDING) return 3;
    if (view.scale < ZOOM_LEVEL.ROOM) return 4;
    return 5;
  }, [view.scale]);

  // Notify zoom changes
  useEffect(() => {
    onZoomChange?.(view.scale);
  }, [view.scale, onZoomChange]);

  // Subscribe to demo controller
  useEffect(() => {
    if (isDemoMode) {
      const unsubscribe = demoController.subscribe(setDemoState);
      return unsubscribe;
    }
  }, [isDemoMode]);

  // Marching ants animation
  useEffect(() => {
    if (!showRoute || routeNodes.length < 2) return;
    const interval = setInterval(() => {
      setMarchingOffset((prev) => (prev - animationSpeed) % 24);
    }, 35);
    return () => clearInterval(interval);
  }, [showRoute, routeNodes.length, animationSpeed]);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.5 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update view when dimensions change
  useEffect(() => {
    setView((prev) => {
      const fit = fitCampus(width, height, 20);
      return {
        ...prev,
        screenW: width,
        screenH: height,
        ...(Math.abs(prev.screenW - width) > 50 || Math.abs(prev.screenH - height) > 50
          ? { scale: fit.scale, panX: fit.panX, panY: fit.panY }
          : {}),
      };
    });
  }, [width, height]);

  // Coordinate transform helpers
  const ts = useCallback(
    (mx: number, my: number) => toScreen(mx, my, view),
    [view]
  );

  const scaleValue = useCallback(
    (metres: number) => (metres * view.screenW * view.scale) / MAP_REAL_WIDTH,
    [view]
  );

  // Zoom functions
  const zoomTo = useCallback((newScale: number, centerX?: number, centerY?: number) => {
    const cx = centerX ?? width / 2;
    const cy = centerY ?? height / 2;
    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    const scaleRatio = clampedScale / view.scale;
    setView((prev) => ({
      ...prev,
      scale: clampedScale,
      panX: cx - (cx - prev.panX) * scaleRatio,
      panY: cy - (cy - prev.panY) * scaleRatio,
    }));
  }, [view.scale, width, height]);

  const zoomIn = useCallback(() => zoomTo(view.scale * 1.4), [zoomTo, view.scale]);
  const zoomOut = useCallback(() => zoomTo(view.scale / 1.4), [zoomTo, view.scale]);
  
  const resetView = useCallback(() => {
    const fit = fitCampus(width, height, 20);
    setView((prev) => ({
      ...prev,
      scale: fit.scale,
      panX: fit.panX,
      panY: fit.panY,
    }));
  }, [width, height]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
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
  }, [view.panX, view.panY, view.scale]);

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
        gesture.velocityX = (touch.clientX - gesture.lastPanX) / dt * 16;
        gesture.velocityY = (touch.clientY - gesture.lastPanY) / dt * 16;
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

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const gesture = gestureRef.current;

    if (gesture.isPanning && e.touches.length === 0) {
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

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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
  }, [view.panX, view.panY]);

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

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.85 : 1.18;
    zoomTo(view.scale * zoomFactor, mouseX, mouseY);
  }, [view.scale, zoomTo]);

  // Double click to zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (view.scale > 3) {
      resetView();
    } else {
      zoomTo(view.scale * 2.5, clickX, clickY);
    }
  }, [view.scale, zoomTo, resetView]);

  // Handle building click
  const handleBuildingClick = useCallback((e: React.MouseEvent, building: CampusBuilding) => {
    e.stopPropagation();
    onBuildingSelect?.(building);
  }, [onBuildingSelect]);

  // Handle room click
  const handleRoomClick = useCallback((e: React.MouseEvent, room: CampusRoom, building: CampusBuilding) => {
    e.stopPropagation();
    onRoomSelect?.(room, building);
  }, [onRoomSelect]);

  // Get current position
  const currentPos = isDemoMode && demoState ? demoState.truePos : userPosition;
  const currentTrail = isDemoMode && demoState ? demoState.trail : [];
  const currentRouteNodes = isDemoMode ? demoController.getRouteNodes() : routeNodes;

  // Render building rooms when zoomed in
  const renderBuildingRooms = useCallback((building: CampusBuilding) => {
    if (zoomLevel < 4 || building.rooms.length === 0) return null;
    
    const pos = ts(building.position.x, building.position.y);
    const w = scaleValue(building.width);
    const h = scaleValue(building.height);
    
    // Simple grid layout for rooms
    const roomsPerRow = Math.ceil(Math.sqrt(building.rooms.length));
    const roomWidth = w / roomsPerRow - 4;
    const roomHeight = h / Math.ceil(building.rooms.length / roomsPerRow) - 4;
    
    return building.rooms.map((room, index) => {
      const row = Math.floor(index / roomsPerRow);
      const col = index % roomsPerRow;
      const roomX = pos.sx + 2 + col * (roomWidth + 4);
      const roomY = pos.sy - h + 2 + row * (roomHeight + 4);
      const colors = getRoomColors(room.type);
      
      return (
        <g key={room.id} onClick={(e) => handleRoomClick(e, room, building)} style={{ cursor: "pointer" }}>
          <rect
            x={roomX}
            y={roomY}
            width={roomWidth}
            height={roomHeight}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={1}
            rx={2}
          />
          {zoomLevel >= 5 && roomWidth > 25 && (
            <text
              x={roomX + roomWidth / 2}
              y={roomY + roomHeight / 2 + 3}
              fill={colors.stroke}
              fontSize={Math.min(9, roomWidth / 5)}
              fontWeight="500"
              textAnchor="middle"
            >
              {room.num}
            </text>
          )}
        </g>
      );
    });
  }, [zoomLevel, ts, scaleValue, handleRoomClick]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ background: "#E9F0F8" }}
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
        {/* Filters and gradients */}
        <filter id="buildingShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodOpacity="0.18" />
        </filter>
        <filter id="buildingShadowHover" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.25" />
        </filter>
        <radialGradient id="userGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0066CC" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0066CC" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="destGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6633BB" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#6633BB" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EEF2F7" />
        </linearGradient>
        <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="12" height="12">
          <rect width="12" height="12" fill="#C8E0C0" />
          <circle cx="2" cy="2" r="1" fill="#B0D0A0" opacity="0.5" />
          <circle cx="8" cy="6" r="1" fill="#B0D0A0" opacity="0.5" />
          <circle cx="4" cy="10" r="1" fill="#B0D0A0" opacity="0.5" />
        </pattern>
        <pattern id="parkingPattern" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform={`scale(${Math.max(0.5, view.scale * 0.3)})`}>
          <rect width="20" height="20" fill="#E0E5EB" />
          <line x1="0" y1="10" x2="20" y2="10" stroke="#CCD5DD" strokeWidth="1" strokeDasharray="2,3" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="#E9F0F8" />

      {/* === LAYER 1: Garden Zones === */}
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
            fill="url(#grassPattern)"
            rx={6}
            opacity={0.9}
          />
        );
      })}

      {/* === LAYER 2: Sports Ground === */}
      {(() => {
        const pos = ts(SPORTS_GROUND.position.x, SPORTS_GROUND.position.y);
        const w = scaleValue(SPORTS_GROUND.width);
        const h = scaleValue(SPORTS_GROUND.height);
        return (
          <g>
            <rect x={pos.sx} y={pos.sy - h} width={w} height={h} fill="#8BC88A" stroke="#5A9A58" strokeWidth={1.5} rx={4} />
            {/* Field markings */}
            <rect x={pos.sx + 3} y={pos.sy - h + 3} width={w - 6} height={h - 6} fill="none" stroke="#FFFFFF" strokeWidth={1.5} rx={2} opacity={0.7} />
            <line x1={pos.sx + w / 2} y1={pos.sy - h + 3} x2={pos.sx + w / 2} y2={pos.sy - 3} stroke="#FFFFFF" strokeWidth={1.5} opacity={0.7} />
            <circle cx={pos.sx + w / 2} cy={pos.sy - h / 2} r={Math.min(w, h) * 0.15} fill="none" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.7} />
            {zoomLevel >= 2 && (
              <text x={pos.sx + w / 2} y={pos.sy - h / 2 + 4} fill="#FFFFFF" fontSize={10} textAnchor="middle" fontWeight="600" opacity={0.9}>
                Sports Ground
              </text>
            )}
          </g>
        );
      })()}

      {/* === LAYER 3: External Buildings (muted) === */}
      {EXTERNAL_BUILDINGS.map((building) => {
        const pos = ts(building.position.x, building.position.y);
        const w = scaleValue(building.width);
        const h = scaleValue(building.height);
        return (
          <g key={building.id}>
            <rect x={pos.sx} y={pos.sy - h} width={w} height={h} fill="#D8DCE2" stroke="#B0B8C2" strokeWidth={0.8} rx={3} />
            {zoomLevel >= 2 && w > 40 && (
              <text x={pos.sx + w / 2} y={pos.sy - h / 2 + 3} fill="#6A7080" fontSize={8} textAnchor="middle" fontWeight="500" opacity={0.8}>
                {building.shortName}
              </text>
            )}
          </g>
        );
      })}

      {/* === LAYER 4: External Streets === */}
      {EXTERNAL_STREETS.map((street, i) => {
        const from = ts(street.from.x, street.from.y);
        const to = ts(street.to.x, street.to.y);
        return (
          <g key={`street-${i}`}>
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#C5CDD8"
              strokeWidth={Math.max(12, 20 * view.scale)}
              strokeLinecap="round"
            />
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#D5DCE5"
              strokeWidth={Math.max(10, 18 * view.scale)}
              strokeLinecap="round"
            />
            {zoomLevel >= 1 && street.label && (
              <text
                x={(from.sx + to.sx) / 2}
                y={(from.sy + to.sy) / 2 - 8}
                fill="#7080A0"
                fontSize={Math.max(8, 10 * view.scale)}
                textAnchor="middle"
                fontWeight="500"
              >
                {street.label}
              </text>
            )}
          </g>
        );
      })}

      {/* === LAYER 5: Campus Roads === */}
      {CAMPUS_ROADS.map((road, i) => {
        const from = ts(road.from.x, road.from.y);
        const to = ts(road.to.x, road.to.y);
        const roadWidth = Math.max(8, road.width * view.scale);
        return (
          <g key={`road-${i}`}>
            {/* Road outline */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#A8B4C4"
              strokeWidth={roadWidth + 3}
              strokeLinecap="round"
            />
            {/* Road surface */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#F5F8FB"
              strokeWidth={roadWidth}
              strokeLinecap="round"
            />
            {/* Center line for main roads */}
            {road.width >= 12 && (
              <line
                x1={from.sx}
                y1={from.sy}
                x2={to.sx}
                y2={to.sy}
                stroke="#E0E5EB"
                strokeWidth={1}
                strokeDasharray="8,6"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}

      {/* === LAYER 6: Parking Areas === */}
      {PARKING_AREAS.map((parking) => {
        const pos = ts(parking.position.x, parking.position.y);
        const w = scaleValue(parking.width);
        const h = scaleValue(parking.height);
        return (
          <g key={parking.id}>
            <rect x={pos.sx} y={pos.sy - h} width={w} height={h} fill="url(#parkingPattern)" stroke="#B0BAC8" strokeWidth={1} rx={4} />
            {/* Parking icon */}
            <rect x={pos.sx + w / 2 - 10} y={pos.sy - h / 2 - 10} width={20} height={20} fill="#3366AA" rx={4} />
            <text x={pos.sx + w / 2} y={pos.sy - h / 2 + 5} fill="#FFFFFF" fontSize={14} fontWeight="bold" textAnchor="middle">P</text>
          </g>
        );
      })}

      {/* === LAYER 7: KCEV Area Boundary === */}
      {(() => {
        const points = KCEV_BOUNDARY.map((p) => {
          const pos = ts(p.x, p.y);
          return `${pos.sx},${pos.sy}`;
        }).join(" ");
        const center = ts(310, 360);
        return (
          <g>
            <polygon
              points={points}
              fill="rgba(204,0,102,0.04)"
              stroke="#CC0066"
              strokeWidth={2}
              strokeDasharray="8,5"
            />
            {zoomLevel >= 1 && (
              <text
                x={center.sx}
                y={center.sy}
                fill="#CC0066"
                fontSize={Math.max(10, 13 * view.scale)}
                textAnchor="middle"
                fontWeight="700"
                opacity={0.7}
              >
                KCEV
              </text>
            )}
          </g>
        );
      })()}

      {/* === LAYER 8: Campus Buildings === */}
      {ALL_BUILDINGS.map((building) => {
        const pos = ts(building.position.x, building.position.y);
        const w = scaleValue(building.width);
        const h = scaleValue(building.height);
        const colors = getBuildingColors(building.type);
        const isSelected = selectedBuilding === building.id;
        const isDestination = destinationBuilding === building.id;
        const isHovered = hoveredBuilding === building.id;
        const showRooms = zoomLevel >= 4 && (isSelected || isDestination || isHovered);

        return (
          <g
            key={building.id}
            onClick={(e) => handleBuildingClick(e, building)}
            onMouseEnter={() => setHoveredBuilding(building.id)}
            onMouseLeave={() => setHoveredBuilding(null)}
            style={{ cursor: "pointer" }}
            filter={isHovered ? "url(#buildingShadowHover)" : "url(#buildingShadow)"}
          >
            {/* Destination glow */}
            {isDestination && (
              <rect
                x={pos.sx - 8}
                y={pos.sy - h - 8}
                width={w + 16}
                height={h + 16}
                fill="url(#destGlow)"
                rx={10}
              />
            )}

            {/* Building body */}
            <rect
              x={pos.sx}
              y={pos.sy - h}
              width={w}
              height={h}
              fill={isDestination ? "#F0E8FF" : isHovered ? "#FFFFFF" : colors.fill}
              stroke={isSelected ? "#001144" : isDestination ? "#6633BB" : isHovered ? "#0044AA" : colors.stroke}
              strokeWidth={isSelected || isDestination ? 3 : isHovered ? 2 : 1.5}
              rx={5}
            />

            {/* Rooms (when zoomed in) */}
            {showRooms && renderBuildingRooms(building)}

            {/* Building number badge */}
            {building.number !== 0 && w > 15 && !showRooms && (
              <g>
                <rect
                  x={pos.sx + 4}
                  y={pos.sy - h + 4}
                  width={Math.max(16, 18 * Math.min(1.2, view.scale))}
                  height={Math.max(16, 18 * Math.min(1.2, view.scale))}
                  fill={colors.stroke}
                  rx={4}
                />
                <text
                  x={pos.sx + 4 + Math.max(8, 9 * Math.min(1.2, view.scale))}
                  y={pos.sy - h + 4 + Math.max(12, 13 * Math.min(1.2, view.scale))}
                  fill="#FFFFFF"
                  fontSize={Math.max(10, 11 * Math.min(1.2, view.scale))}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {building.number}
                </text>
              </g>
            )}

            {/* Building name (at higher zoom) */}
            {zoomLevel >= 2 && w > 35 && h > 25 && !showRooms && (
              <text
                x={pos.sx + w / 2}
                y={pos.sy - h / 2 + 5}
                fill="#1A2A4A"
                fontSize={Math.max(8, Math.min(11, w / 6))}
                fontWeight="600"
                textAnchor="middle"
                opacity={0.9}
              >
                {building.shortName.length > 14 ? building.shortName.slice(0, 12) + "..." : building.shortName}
              </text>
            )}

            {/* Under construction indicator */}
            {building.underConstruction && (
              <g>
                <rect x={pos.sx + w - 20} y={pos.sy - h + 4} width={16} height={16} fill="#F5A800" rx={3} />
                <text x={pos.sx + w - 12} y={pos.sy - h + 15} fill="#FFFFFF" fontSize={10} fontWeight="bold" textAnchor="middle">!</text>
              </g>
            )}

            {/* Floor indicator (when zoomed in) */}
            {zoomLevel >= 3 && building.floors > 1 && (
              <g>
                <rect x={pos.sx + w - 24} y={pos.sy - 20} width={20} height={16} fill="#4466AA" rx={3} opacity={0.9} />
                <text x={pos.sx + w - 14} y={pos.sy - 8} fill="#FFFFFF" fontSize={9} fontWeight="600" textAnchor="middle">
                  {building.floors}F
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* === LAYER 9: Gate Markers === */}
      {GATES.map((gate) => {
        const pos = ts(gate.position.x, gate.position.y);
        const r = Math.max(12, 14 * view.scale);
        return (
          <g key={gate.id}>
            {/* Gate background circle */}
            <circle cx={pos.sx} cy={pos.sy} r={r + 3} fill="#FFFFFF" opacity={0.9} />
            <circle cx={pos.sx} cy={pos.sy} r={r} fill="#DCF0E8" stroke="#00883A" strokeWidth={2.5} />
            {/* Gate icon */}
            <rect x={pos.sx - 5} y={pos.sy - 6} width={10} height={12} fill="#00883A" rx={2} />
            <rect x={pos.sx - 3} y={pos.sy - 4} width={6} height={8} fill="#FFFFFF" rx={1} />
            {/* Gate label */}
            <text
              x={pos.sx}
              y={pos.sy + r + 14}
              fill="#006030"
              fontSize={Math.max(10, 12 * view.scale)}
              fontWeight="600"
              textAnchor="middle"
            >
              {gate.label}
            </text>
          </g>
        );
      })}

      {/* === LAYER 10: Debug Path Edges === */}
      {showPathEdges && zoomLevel >= 2 &&
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
              strokeWidth={2}
              opacity={0.4}
              strokeDasharray="5,5"
            />
          );
        })}

      {/* === LAYER 11: Debug Path Nodes === */}
      {showPathNodes && zoomLevel >= 2 &&
        currentRouteNodes.map((node, i) => {
          const pos = ts(node.x, node.y);
          return (
            <circle key={`node-${i}`} cx={pos.sx} cy={pos.sy} r={5} fill="#1D9E75" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.7} />
          );
        })}

      {/* === LAYER 12: Navigation Route === */}
      {showRoute && currentRouteNodes.length >= 2 && (
        <g>
          {/* Route shadow */}
          <polyline
            points={currentRouteNodes.map((node) => { const pos = ts(node.x, node.y); return `${pos.sx},${pos.sy}`; }).join(" ")}
            fill="none"
            stroke="#3311AA"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.15}
          />
          {/* Route main line */}
          <polyline
            points={currentRouteNodes.map((node) => { const pos = ts(node.x, node.y); return `${pos.sx},${pos.sy}`; }).join(" ")}
            fill="none"
            stroke="#6633BB"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Marching ants animation */}
          <polyline
            points={currentRouteNodes.map((node) => { const pos = ts(node.x, node.y); return `${pos.sx},${pos.sy}`; }).join(" ")}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            strokeDasharray="10,14"
            strokeDashoffset={marchingOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* === LAYER 13: Position Trail === */}
      {showTrail && currentTrail.map((pos, i) => {
        const screenPos = ts(pos.x, pos.y);
        const opacity = 0.15 + (i / currentTrail.length) * 0.55;
        const r = 2 + (i / currentTrail.length) * 3;
        return (
          <circle key={`trail-${i}`} cx={screenPos.sx} cy={screenPos.sy} r={r} fill="#0066CC" opacity={opacity} />
        );
      })}

      {/* === LAYER 14: WiFi Position (debug) === */}
      {isDemoMode && showWifiDot && demoState && (
        <g>
          {(() => {
            const pos = ts(demoState.wifiPos.x, demoState.wifiPos.y);
            return (
              <>
                <circle cx={pos.sx} cy={pos.sy} r={18} fill="#0066CC" opacity={0.12} />
                <circle cx={pos.sx} cy={pos.sy} r={7} fill="#0066CC" stroke="#FFFFFF" strokeWidth={2.5} />
              </>
            );
          })()}
        </g>
      )}

      {/* === LAYER 15: Kalman Position (debug) === */}
      {isDemoMode && showKalmanDot && demoState && (
        <g>
          {(() => {
            const pos = ts(demoState.kalmanPos.x, demoState.kalmanPos.y);
            return (
              <rect
                x={pos.sx - 7}
                y={pos.sy - 7}
                width={14}
                height={14}
                fill="#F5A800"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                rx={3}
                transform={`rotate(45 ${pos.sx} ${pos.sy})`}
              />
            );
          })()}
        </g>
      )}

      {/* === LAYER 16: User Position === */}
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
                  r={32 + 20 * (pulseScale - 1)}
                  fill="url(#userGlow)"
                  opacity={1.3 - 0.8 * (pulseScale - 1)}
                />
                {/* Outer ring */}
                <circle cx={pos.sx} cy={pos.sy} r={22} fill="#FFFFFF" stroke="#0055BB" strokeWidth={3.5} />
                {/* Inner solid */}
                <circle cx={pos.sx} cy={pos.sy} r={15} fill="#0066CC" />
                {/* Person icon */}
                <circle cx={pos.sx} cy={pos.sy - 4} r={4} fill="#FFFFFF" />
                <ellipse cx={pos.sx} cy={pos.sy + 5} rx={5} ry={4} fill="#FFFFFF" />
              </>
            );
          })()}
        </g>
      )}

      {/* === LAYER 17: Destination Pin === */}
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
                {/* Pin shadow */}
                <ellipse cx={pos.sx + 2} cy={pos.sy + 24} rx={10} ry={5} fill="#000000" opacity={0.15} />
                {/* Pin body */}
                <path
                  d={`M${pos.sx} ${pos.sy + 16} L${pos.sx - 14} ${pos.sy - 8} A16 16 0 1 1 ${pos.sx + 14} ${pos.sy - 8} Z`}
                  fill="#6633BB"
                  stroke="#FFFFFF"
                  strokeWidth={2.5}
                />
                {/* Pin inner circle */}
                <circle cx={pos.sx} cy={pos.sy - 10} r={7} fill="#FFFFFF" />
                {/* Building number */}
                <text x={pos.sx} y={pos.sy - 6} fill="#6633BB" fontSize={10} fontWeight="bold" textAnchor="middle">
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

// Export zoom functions for external control
export { MIN_SCALE, MAX_SCALE, ZOOM_LEVEL };

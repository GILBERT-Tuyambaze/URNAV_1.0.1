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
  fitCampus,
  MAP_REAL_WIDTH,
  type ViewState,
} from "@/lib/map-transform";
import { demoController, type DemoState, type Position } from "@/lib/demo-controller";

interface CampusMapCanvasProps {
  width: number;
  height: number;
  selectedBuilding?: string | null;
  destinationBuilding?: string | null;
  onBuildingSelect?: (building: CampusBuilding) => void;
  showRoute?: boolean;
  routeNodes?: Position[];
  userPosition?: Position | null;
  isDemoMode?: boolean;
  showTrail?: boolean;
  showWifiDot?: boolean;
  showKalmanDot?: boolean;
  showPathNodes?: boolean;
  showPathEdges?: boolean;
  onCenterOnUser?: () => void;
}

// Min/max scale for Google Maps-like experience
const MIN_SCALE = 0.3;
const MAX_SCALE = 12;

export function CampusMapCanvas({
  width,
  height,
  selectedBuilding,
  destinationBuilding,
  onBuildingSelect,
  showRoute = false,
  routeNodes = [],
  userPosition,
  isDemoMode = false,
  showTrail = true,
  showWifiDot = false,
  showKalmanDot = false,
  showPathNodes = false,
  showPathEdges = false,
}: CampusMapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Initialize with fit campus view
  const getInitialView = useCallback((): ViewState => {
    const fit = fitCampus(width, height, 30);
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

  // Marching ants animation
  useEffect(() => {
    if (!showRoute || routeNodes.length < 2) return;
    const interval = setInterval(() => {
      setMarchingOffset((prev) => (prev - 1) % 20);
    }, 40);
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
      const fit = fitCampus(width, height, 30);
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

  // Keyboard controls for demo mode
  useEffect(() => {
    if (!isDemoMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          demoController.toggle();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          demoController.setSpeedFromSlider(Math.min(10, (demoController.getSpeed() / 0.5) + 1));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          demoController.setSpeedFromSlider(Math.max(1, (demoController.getSpeed() / 0.5) - 1));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          demoController.stepForward();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          demoController.stepBackward();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          demoController.reset();
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDemoMode, width, height]);

  // Convert campus coords to screen
  const ts = useCallback(
    (mx: number, my: number) => toScreen(mx, my, view),
    [view]
  );

  // Scale value
  const scaleValue = useCallback(
    (metres: number) => (metres * view.screenW * view.scale) / MAP_REAL_WIDTH,
    [view]
  );

  // Zoom functions
  const zoomIn = useCallback(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const newScale = Math.min(MAX_SCALE, view.scale * 1.3);
    const scaleRatio = newScale / view.scale;
    setView((prev) => ({
      ...prev,
      scale: newScale,
      panX: centerX - (centerX - prev.panX) * scaleRatio,
      panY: centerY - (centerY - prev.panY) * scaleRatio,
    }));
  }, [view.scale, view.panX, view.panY, width, height]);

  const zoomOut = useCallback(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const newScale = Math.max(MIN_SCALE, view.scale / 1.3);
    const scaleRatio = newScale / view.scale;
    setView((prev) => ({
      ...prev,
      scale: newScale,
      panX: centerX - (centerX - prev.panX) * scaleRatio,
      panY: centerY - (centerY - prev.panY) * scaleRatio,
    }));
  }, [view.scale, view.panX, view.panY, width, height]);

  const resetView = useCallback(() => {
    const fit = fitCampus(width, height, 30);
    setView((prev) => ({
      ...prev,
      scale: fit.scale,
      panX: fit.panX,
      panY: fit.panY,
    }));
  }, [width, height]);

  // Touch handlers for pan and pinch-to-zoom
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
      gesture.startDist = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
      gesture.startScale = view.scale;
      gesture.startMidX = (t1.pageX + t2.pageX) / 2;
      gesture.startMidY = (t1.pageY + t2.pageY) / 2;
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
      const newDist = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
      const midX = (t1.pageX + t2.pageX) / 2;
      const midY = (t1.pageY + t2.pageY) / 2;

      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, gesture.startScale * (newDist / gesture.startDist)));

      // Keep the world point under midpoint stationary:
      const scaleRatio = newScale / gesture.startScale;
      const newPanX = midX - (midX - gesture.startViewPanX) * scaleRatio;
      const newPanY = midY - (midY - gesture.startViewPanY) * scaleRatio;

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

  // Mouse handlers for desktop
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

  // Mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
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
  }, [view.scale, view.panX, view.panY]);

  // Double tap/click to zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (view.scale > 2) {
      const fit = fitCampus(width, height, 30);
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
  }, [view.scale, view.panX, view.panY, width, height]);

  // Handle building tap
  const handleBuildingClick = useCallback((e: React.MouseEvent, building: CampusBuilding) => {
    e.stopPropagation();
    onBuildingSelect?.(building);
  }, [onBuildingSelect]);

  // Current position for rendering
  const currentPos = isDemoMode && demoState ? demoState.truePos : userPosition;
  const currentTrail = isDemoMode && demoState ? demoState.trail : [];
  const currentRouteNodes = isDemoMode ? demoController.getRouteNodes() : routeNodes;

  // Zoom level thresholds for progressive detail
  const zoomLevel = view.scale < 0.8 ? 0 : view.scale < 1.2 ? 1 : view.scale < 2 ? 2 : view.scale < 3.5 ? 3 : 4;

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
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="#E8F0FA" />

      {/* LAYER 1 - Garden zones (simplified green areas) */}
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
        );
      })()}

      {/* LAYER 3 - External City Blocks (muted) */}
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

      {/* LAYER 4 - External Streets (background) */}
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

      {/* LAYER 5 - Campus Roads (clear walkable paths) */}
      {CAMPUS_ROADS.map((road, i) => {
        const from = ts(road.from.x, road.from.y);
        const to = ts(road.to.x, road.to.y);
        return (
          <g key={`road-${i}`}>
            {/* Road outline */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#B8C0CC"
              strokeWidth={Math.max(6, road.width * view.scale) + 2}
              strokeLinecap="round"
            />
            {/* Road fill */}
            <line
              x1={from.sx}
              y1={from.sy}
              x2={to.sx}
              y2={to.sy}
              stroke="#F5F7FA"
              strokeWidth={Math.max(5, road.width * view.scale)}
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
            {zoomLevel >= 1 && (() => {
              const center = ts(310, 360);
              return (
                <text
                  x={center.sx}
                  y={center.sy}
                  fill="#AA3366"
                  fontSize={Math.max(10, 12 * view.scale)}
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

      {/* LAYER 8 - Campus Buildings (with clear separation from paths) */}
      {ALL_BUILDINGS.map((building) => {
        const pos = ts(building.position.x, building.position.y);
        const w = scaleValue(building.width);
        const h = scaleValue(building.height);
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
                x={pos.sx - 6}
                y={pos.sy - h - 6}
                width={w + 12}
                height={h + 12}
                fill="url(#destGlow)"
                rx={8}
              />
            )}

            {/* Building body */}
            <rect
              x={pos.sx}
              y={pos.sy - h}
              width={w}
              height={h}
              fill={isDestination ? "#EDE8F8" : colors.fill}
              stroke={isSelected ? "#002255" : isDestination ? "#6633BB" : colors.stroke}
              strokeWidth={isSelected || isDestination ? 2.5 : 1.5}
              rx={4}
            />

            {/* Building number badge - always visible for campus buildings */}
            {building.number !== 0 && w > 12 && (
              <g>
                <rect
                  x={pos.sx + 3}
                  y={pos.sy - h + 3}
                  width={Math.max(14, 16 * Math.min(1, view.scale))}
                  height={Math.max(14, 16 * Math.min(1, view.scale))}
                  fill={colors.stroke}
                  rx={3}
                />
                <text
                  x={pos.sx + 3 + Math.max(7, 8 * Math.min(1, view.scale))}
                  y={pos.sy - h + 3 + Math.max(10, 12 * Math.min(1, view.scale))}
                  fill="#ffffff"
                  fontSize={Math.max(9, 10 * Math.min(1, view.scale))}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {building.number}
                </text>
              </g>
            )}

            {/* Building name - show at higher zoom */}
            {zoomLevel >= 2 && w > 30 && h > 20 && (
              <text
                x={pos.sx + w / 2}
                y={pos.sy - h / 2 + 4}
                fill="#1a2a4a"
                fontSize={Math.max(7, 9 * view.scale)}
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
                  x={pos.sx + w - 18}
                  y={pos.sy - h + 3}
                  width={15}
                  height={15}
                  fill="#F5A800"
                  rx={3}
                />
                <text
                  x={pos.sx + w - 10.5}
                  y={pos.sy - h + 13}
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
      })}

      {/* LAYER 9 - Gate Markers (clear entry points) */}
      {GATES.map((gate) => {
        const pos = ts(gate.position.x, gate.position.y);
        const r = Math.max(10, 12 * view.scale);
        return (
          <g key={gate.id}>
            {/* Gate circle */}
            <circle
              cx={pos.sx}
              cy={pos.sy}
              r={r}
              fill="#FFFFFF"
              stroke="#00883A"
              strokeWidth={2.5}
            />
            {/* Gate icon (door) */}
            <rect
              x={pos.sx - 4}
              y={pos.sy - 5}
              width={8}
              height={10}
              fill="#00883A"
              rx={1}
            />
            <rect
              x={pos.sx - 2}
              y={pos.sy - 3}
              width={4}
              height={6}
              fill="#FFFFFF"
              rx={0.5}
            />
            {/* Gate label */}
            <text
              x={pos.sx}
              y={pos.sy + r + 12}
              fill="#006830"
              fontSize={Math.max(9, 11 * view.scale)}
              fontWeight="600"
              textAnchor="middle"
            >
              {gate.label}
            </text>
          </g>
        );
      })}

      {/* LAYER 10 - Debug Path Edges */}
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
              strokeWidth={1.5}
              opacity={0.4}
              strokeDasharray="4,4"
            />
          );
        })}

      {/* LAYER 11 - Debug Path Nodes */}
      {showPathNodes && zoomLevel >= 3 &&
        currentRouteNodes.map((node, i) => {
          const pos = ts(node.x, node.y);
          return (
            <circle
              key={`node-${i}`}
              cx={pos.sx}
              cy={pos.sy}
              r={4}
              fill="#1d9e75"
              opacity={0.5}
            />
          );
        })}

      {/* LAYER 12 - Active Navigation Route */}
      {showRoute && currentRouteNodes.length >= 2 && (
        <g>
          {/* Route shadow */}
          <polyline
            points={currentRouteNodes
              .map((node) => {
                const pos = ts(node.x, node.y);
                return `${pos.sx},${pos.sy}`;
              })
              .join(" ")}
            fill="none"
            stroke="#4422AA"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.2}
          />
          {/* Route main line */}
          <polyline
            points={currentRouteNodes
              .map((node) => {
                const pos = ts(node.x, node.y);
                return `${pos.sx},${pos.sy}`;
              })
              .join(" ")}
            fill="none"
            stroke="#6633BB"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Marching ants (direction indicator) */}
          <polyline
            points={currentRouteNodes
              .map((node) => {
                const pos = ts(node.x, node.y);
                return `${pos.sx},${pos.sy}`;
              })
              .join(" ")}
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

      {/* LAYER 13 - Position Trail (breadcrumb) */}
      {showTrail &&
        currentTrail.map((pos, i) => {
          const screenPos = ts(pos.x, pos.y);
          const opacity = (i / currentTrail.length) * 0.6;
          const r = 2 + (i / currentTrail.length) * 2;
          return (
            <circle
              key={`trail-${i}`}
              cx={screenPos.sx}
              cy={screenPos.sy}
              r={r}
              fill="#0066CC"
              opacity={opacity}
            />
          );
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

      {/* LAYER 14 - User Position (prominent, clear icon) */}
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
                <circle
                  cx={pos.sx}
                  cy={pos.sy}
                  r={18}
                  fill="#FFFFFF"
                  stroke="#0055BB"
                  strokeWidth={3}
                />
                {/* Inner solid */}
                <circle
                  cx={pos.sx}
                  cy={pos.sy}
                  r={12}
                  fill="#0066CC"
                />
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
            const pos = ts(
              building.position.x + building.width / 2,
              building.position.y + building.height / 2
            );
            return (
              <>
                {/* Pin shadow */}
                <ellipse
                  cx={pos.sx + 2}
                  cy={pos.sy + 20}
                  rx={8}
                  ry={4}
                  fill="#000000"
                  opacity={0.15}
                />
                {/* Pin body */}
                <path
                  d={`M${pos.sx} ${pos.sy + 14} 
                     L${pos.sx - 12} ${pos.sy - 6} 
                     A14 14 0 1 1 ${pos.sx + 12} ${pos.sy - 6} 
                     Z`}
                  fill="#6633BB"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
                {/* Pin inner circle */}
                <circle cx={pos.sx} cy={pos.sy - 8} r={6} fill="#FFFFFF" />
                {/* Building number in pin */}
                <text
                  x={pos.sx}
                  y={pos.sy - 5}
                  fill="#6633BB"
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

      {/* LAYER 16 - Zoom/Speed Controls Overlay */}
      <g>
        {/* Zoom indicator */}
        <rect x={width - 70} y={height - 40} width={60} height={30} rx={6} fill="rgba(255,255,255,0.95)" stroke="#D0D8E0" strokeWidth={1} />
        <text x={width - 40} y={height - 20} fontSize={12} fill="#2a3a5a" textAnchor="middle" fontWeight="600">
          {view.scale.toFixed(1)}x
        </text>

        {/* Demo speed indicator */}
        {isDemoMode && (
          <>
            <rect x={10} y={height - 40} width={80} height={30} rx={6} fill="rgba(255,255,255,0.95)" stroke="#D0D8E0" strokeWidth={1} />
            <text x={50} y={height - 20} fontSize={11} fill="#2a3a5a" textAnchor="middle" fontWeight="500">
              {demoController.getSpeed().toFixed(1)} m/s
            </text>
          </>
        )}
      </g>

      {/* LAYER 17 - Keyboard shortcuts hint (demo mode) */}
      {isDemoMode && (
        <g>
          <rect x={10} y={10} width={150} height={90} rx={8} fill="rgba(255,255,255,0.92)" stroke="#D0D8E0" strokeWidth={1} />
          <text x={20} y={28} fontSize={10} fill="#2a3a5a" fontWeight="600">Keyboard Controls:</text>
          <text x={20} y={44} fontSize={9} fill="#5a6a7a">Space: Play/Pause</text>
          <text x={20} y={56} fontSize={9} fill="#5a6a7a">W/S: Speed up/down</text>
          <text x={20} y={68} fontSize={9} fill="#5a6a7a">A/D: Step back/forward</text>
          <text x={20} y={80} fontSize={9} fill="#5a6a7a">+/-: Zoom in/out</text>
          <text x={20} y={92} fontSize={9} fill="#5a6a7a">0: Reset view, R: Restart</text>
        </g>
      )}
    </svg>
  );
}

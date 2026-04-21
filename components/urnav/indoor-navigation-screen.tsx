"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  MapPin,
  Navigation,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusBuilding, CampusRoom, getBuildingColors, getRoomColors } from "@/lib/campus-data";
import {
  computeIndoorRoute,
  getIndoorGraph,
  type NavigationRoute,
  type NavigationInstruction,
} from "@/lib/indoor-navigation";

interface IndoorNavigationScreenProps {
  building: CampusBuilding;
  room: CampusRoom;
  onBack: () => void;
  onArrival: () => void;
}

// Get direction icon
function getDirectionIcon(direction: string) {
  switch (direction) {
    case "left":
      return <ChevronLeft className="w-5 h-5" />;
    case "right":
      return <ChevronRight className="w-5 h-5" />;
    case "up":
      return <ChevronUp className="w-5 h-5" />;
    case "down":
      return <ChevronDown className="w-5 h-5" />;
    case "enter":
      return <Building2 className="w-5 h-5" />;
    case "arrive":
      return <CheckCircle2 className="w-5 h-5" />;
    default:
      return <Navigation className="w-5 h-5" />;
  }
}

export function IndoorNavigationScreen({
  building,
  room,
  onBack,
  onArrival,
}: IndoorNavigationScreenProps) {
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [mapScale, setMapScale] = useState(1.5);
  const [hasArrived, setHasArrived] = useState(false);

  // Compute route on mount
  useEffect(() => {
    const computed = computeIndoorRoute(building.id, room.id);
    setRoute(computed);
    if (computed && computed.instructions.length > 0) {
      setCurrentFloor(computed.instructions[0].floor || 1);
    }
  }, [building.id, room.id]);

  // Get indoor graph for rendering
  const { nodes, edges } = useMemo(() => getIndoorGraph(building.id), [building.id]);

  // Current instruction
  const currentInstruction = useMemo(() => {
    if (!route || route.instructions.length === 0) return null;
    return route.instructions[Math.min(currentStepIndex, route.instructions.length - 1)];
  }, [route, currentStepIndex]);

  // Progress percentage
  const progress = useMemo(() => {
    if (!route || route.instructions.length <= 1) return 0;
    return (currentStepIndex / (route.instructions.length - 1)) * 100;
  }, [route, currentStepIndex]);

  // Speak instruction
  const speakInstruction = useCallback(
    (instruction: NavigationInstruction) => {
      if (isMuted || typeof window === "undefined") return;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(instruction.text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    },
    [isMuted]
  );

  // Auto-advance with animation
  useEffect(() => {
    if (!isPlaying || !route) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= route.instructions.length) {
          setIsPlaying(false);
          setHasArrived(true);
          return prev;
        }
        // Update floor when changing
        const nextInstruction = route.instructions[next];
        if (nextInstruction?.floor) {
          setCurrentFloor(nextInstruction.floor);
        }
        // Speak instruction
        speakInstruction(nextInstruction);
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, route, speakInstruction]);

  // Manual step controls
  const nextStep = () => {
    if (!route) return;
    const next = currentStepIndex + 1;
    if (next < route.instructions.length) {
      setCurrentStepIndex(next);
      const nextInstruction = route.instructions[next];
      if (nextInstruction?.floor) setCurrentFloor(nextInstruction.floor);
      speakInstruction(nextInstruction);
    }
    if (next >= route.instructions.length - 1) {
      setHasArrived(true);
    }
  };

  const prevStep = () => {
    if (!route) return;
    const prev = Math.max(0, currentStepIndex - 1);
    setCurrentStepIndex(prev);
    const prevInstruction = route.instructions[prev];
    if (prevInstruction?.floor) setCurrentFloor(prevInstruction.floor);
  };

  const resetNavigation = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setHasArrived(false);
    if (route?.instructions[0]?.floor) {
      setCurrentFloor(route.instructions[0].floor);
    }
  };

  // Zoom controls
  const zoomIn = () => setMapScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setMapScale((s) => Math.max(s - 0.25, 0.75));

  // Get nodes for current floor
  const floorNodes = useMemo(() => {
    return nodes.filter((n) => n.floor === currentFloor);
  }, [nodes, currentFloor]);

  // Get edges for current floor
  const floorEdges = useMemo(() => {
    const nodeIds = new Set(floorNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to));
  }, [floorNodes, edges]);

  // Current position on path
  const currentNodeId = currentInstruction?.nodeId;

  // Building colors
  const buildingColors = getBuildingColors(building.type);

  // Handle arrival button click
  const handleArrivalClick = () => {
    onArrival();
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F8FC]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0066CC] to-[#004499] text-white shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 shrink-0 bg-white/10 text-white hover:bg-white/20 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Indoor Navigation</h1>
            <p className="text-sm text-white/80 truncate">
              {building.shortName} → {room.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-white/70">
            <span>
              Step {currentStepIndex + 1} of {route?.instructions.length || 0}
            </span>
            <span>~{route?.estimatedTimeSeconds || 0}s remaining</span>
          </div>
        </div>
      </header>

      {/* Floor Plan */}
      <div className="flex-1 relative overflow-hidden bg-[#E8F3FF]">
        {/* Floor selector tabs */}
        {route && route.floors.length > 1 && (
          <div className="absolute top-3 left-3 z-10 flex gap-1 bg-white rounded-lg p-1 shadow-lg">
            {route.floors.map((floor) => (
              <button
                key={floor}
                onClick={() => setCurrentFloor(floor)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  currentFloor === floor
                    ? "bg-[#0066CC] text-white"
                    : "bg-transparent text-[#4466AA] hover:bg-[#E8F3FF]"
                }`}
              >
                F{floor}
              </button>
            ))}
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-white rounded-lg p-1 shadow-lg">
          <button
            onClick={zoomIn}
            className="p-2 rounded-md hover:bg-[#E8F3FF] transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-[#0066CC]" />
          </button>
          <div className="px-2 py-1 text-center text-xs font-medium text-[#4466AA]">
            {Math.round(mapScale * 100)}%
          </div>
          <button
            onClick={zoomOut}
            className="p-2 rounded-md hover:bg-[#E8F3FF] transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-[#0066CC]" />
          </button>
        </div>

        {/* SVG Floor Plan */}
        <svg
          viewBox="0 0 150 150"
          className="w-full h-full"
          style={{
            transform: `scale(${mapScale})`,
            transformOrigin: "center",
            transition: "transform 0.3s ease",
          }}
        >
          {/* Background grid */}
          <defs>
            <pattern
              id="indoor-grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#D0E4F7"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="150" height="150" fill="url(#indoor-grid)" />

          {/* Building outline */}
          <rect
            x="10"
            y="10"
            width="130"
            height="130"
            fill={buildingColors.fill}
            stroke={buildingColors.stroke}
            strokeWidth="2"
            rx="4"
          />

          {/* Floor label */}
          <text x="75" y="22" textAnchor="middle" fontSize="8" fill="#4466AA">
            Floor {currentFloor} - {building.shortName}
          </text>

          {/* Corridor lines */}
          {floorEdges.map((edge, i) => {
            const fromNode = floorNodes.find((n) => n.id === edge.from);
            const toNode = floorNodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            // Check if this edge is on the path
            const pathIndex = route?.path.indexOf(edge.from) ?? -1;
            const nextIndex = route?.path.indexOf(edge.to) ?? -1;
            const isOnPath =
              pathIndex >= 0 &&
              nextIndex >= 0 &&
              Math.abs(pathIndex - nextIndex) === 1;
            const isPast =
              isOnPath && pathIndex <= currentStepIndex && nextIndex <= currentStepIndex;
            const isCurrent =
              isOnPath &&
              (currentNodeId === edge.from || currentNodeId === edge.to);

            return (
              <line
                key={i}
                x1={15 + fromNode.x * 1.2}
                y1={20 + fromNode.y * 1.1}
                x2={15 + toNode.x * 1.2}
                y2={20 + toNode.y * 1.1}
                stroke={
                  isCurrent
                    ? "#0066CC"
                    : isPast
                    ? "#00AA66"
                    : isOnPath
                    ? "#4466AA"
                    : "#C0D8EE"
                }
                strokeWidth={isOnPath ? 3 : 1.5}
                strokeLinecap="round"
                strokeDasharray={edge.type === "stairs" ? "3,3" : undefined}
              />
            );
          })}

          {/* Nodes */}
          {floorNodes.map((node) => {
            const isCurrent = currentNodeId === node.id;
            const isTarget = node.roomId === room.id;
            const isOnPath = route?.path.includes(node.id);
            const pathIndex = route?.path.indexOf(node.id) ?? -1;
            const isPast = pathIndex >= 0 && pathIndex < currentStepIndex;

            let fill = "#FFFFFF";
            let stroke = "#8899BB";
            let radius = 4;

            if (node.type === "room") {
              const rc = getRoomColors(
                building.rooms.find((r) => r.id === node.roomId)?.type || "room"
              );
              fill = rc.fill;
              stroke = rc.stroke;
              radius = 6;
            } else if (node.type === "stairs" || node.type === "lift") {
              fill = "#FFF8E8";
              stroke = "#F5A800";
              radius = 5;
            } else if (node.type === "entry") {
              fill = "#E8FFE8";
              stroke = "#00AA44";
              radius = 5;
            }

            if (isTarget) {
              fill = "#00AA66";
              stroke = "#006644";
              radius = 8;
            }

            if (isCurrent) {
              fill = "#0066CC";
              stroke = "#002255";
              radius = 7;
            }

            if (isPast && isOnPath && !isCurrent && !isTarget) {
              fill = "#00AA66";
              stroke = "#006644";
            }

            const cx = 15 + node.x * 1.2;
            const cy = 20 + node.y * 1.1;

            return (
              <g key={node.id}>
                {/* Pulse animation for current */}
                {isCurrent && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius + 4}
                    fill="none"
                    stroke="#0066CC"
                    strokeWidth="2"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from={radius + 2}
                      to={radius + 10}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.6"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent || isTarget ? 2 : 1}
                />

                {/* Room labels */}
                {node.type === "room" && (
                  <text
                    x={cx}
                    y={cy + 12}
                    textAnchor="middle"
                    fontSize="5"
                    fill={isTarget ? "#006644" : "#4466AA"}
                    fontWeight={isTarget ? "bold" : "normal"}
                  >
                    {node.label?.split(" - ")[0]}
                  </text>
                )}

                {/* Stairs/lift icons */}
                {node.type === "stairs" && (
                  <text
                    x={cx}
                    y={cy + 2}
                    textAnchor="middle"
                    fontSize="6"
                    fill={stroke}
                  >
                    ↕
                  </text>
                )}

                {node.type === "lift" && (
                  <text
                    x={cx}
                    y={cy + 2}
                    textAnchor="middle"
                    fontSize="5"
                    fill={stroke}
                  >
                    ▲▼
                  </text>
                )}

                {/* Entry marker */}
                {node.type === "entry" && (
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    fontSize="5"
                    fill="#00AA44"
                  >
                    Entry
                  </text>
                )}
              </g>
            );
          })}

          {/* Target marker */}
          <g>
            <text x="75" y="145" textAnchor="middle" fontSize="6" fill="#006644">
              🎯 {room.name} (Room {room.num})
            </text>
          </g>
        </svg>
      </div>

      {/* Instruction Panel */}
      <div className="bg-white border-t border-[#D0E4F7] shrink-0">
        {/* Toggle button */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-center py-1 text-[#8899BB]"
        >
          {showInstructions ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        {showInstructions && currentInstruction && (
          <div className="px-4 pb-4">
            {/* Current instruction */}
            <div
              className={`rounded-xl p-4 mb-3 ${
                hasArrived
                  ? "bg-gradient-to-r from-[#00AA66] to-[#008844]"
                  : "bg-gradient-to-r from-[#0066CC] to-[#004499]"
              }`}
            >
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  {getDirectionIcon(currentInstruction.direction)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{currentInstruction.text}</p>
                  {currentInstruction.distance > 0 && (
                    <p className="text-white/70 text-sm">
                      {currentInstruction.distance}m • Floor {currentInstruction.floor}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            {!hasArrived ? (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetNavigation}
                  className="h-12 w-12 rounded-full border-[#D0E4F7]"
                >
                  <RotateCcw className="w-5 h-5 text-[#4466AA]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="h-12 w-12 rounded-full border-[#D0E4F7]"
                >
                  <ChevronLeft className="w-5 h-5 text-[#4466AA]" />
                </Button>
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-14 w-14 rounded-full bg-[#0066CC] hover:bg-[#004499]"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextStep}
                  disabled={currentStepIndex >= (route?.instructions.length || 1) - 1}
                  className="h-12 w-12 rounded-full border-[#D0E4F7]"
                >
                  <ChevronRight className="w-5 h-5 text-[#4466AA]" />
                </Button>
                <div className="w-12" /> {/* Spacer for symmetry */}
              </div>
            ) : (
              <Button
                onClick={handleArrivalClick}
                className="w-full h-14 rounded-xl bg-[#00AA66] hover:bg-[#008844] text-white font-semibold text-lg"
              >
                <CheckCircle2 className="w-6 h-6 mr-2" />
                You&apos;ve Arrived!
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

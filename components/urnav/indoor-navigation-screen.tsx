"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Navigation,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MapPin,
  Footprints,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusBuilding, CampusRoom, getBuildingColors, getRoomColors } from "@/lib/campus-data";
import {
  computeIndoorRoute,
  getIndoorGraph,
  type NavigationRoute,
  type NavigationInstruction,
} from "@/lib/indoor-navigation";
import { IndoorFloorPlanSVG } from "./indoor-floor-plan-svg";

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
      return <ChevronLeft className="w-6 h-6" />;
    case "right":
      return <ChevronRight className="w-6 h-6" />;
    case "up":
      return <ChevronUp className="w-6 h-6" />;
    case "down":
      return <ChevronDown className="w-6 h-6" />;
    case "enter":
      return <Building2 className="w-6 h-6" />;
    case "arrive":
      return <CheckCircle2 className="w-6 h-6" />;
    default:
      return <Navigation className="w-6 h-6" />;
  }
}

// Get direction text for voice
function getVoiceText(instruction: NavigationInstruction, buildingName: string, roomName: string): string {
  const distanceText = instruction.distance > 0 ? `in about ${instruction.distance} meters` : "";
  
  switch (instruction.direction) {
    case "enter":
      return `Entering ${buildingName}. ${distanceText}`;
    case "left":
      return `Turn left ${distanceText}. ${instruction.text}`;
    case "right":
      return `Turn right ${distanceText}. ${instruction.text}`;
    case "up":
      return `Go upstairs to floor ${instruction.floor}. ${instruction.text}`;
    case "down":
      return `Go downstairs to floor ${instruction.floor}. ${instruction.text}`;
    case "arrive":
      return `You have arrived at ${roomName}. ${instruction.text}`;
    default:
      return instruction.text;
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
  const [mapScale, setMapScale] = useState(1.2);
  const [hasArrived, setHasArrived] = useState(false);
  const [coveredDistance, setCoveredDistance] = useState(0);
  const lastSpokenRef = useRef<string>("");
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Current node ID for map
  const currentNodeId = currentInstruction?.nodeId;

  // Progress percentage
  const progress = useMemo(() => {
    if (!route || route.instructions.length <= 1) return 0;
    return (currentStepIndex / (route.instructions.length - 1)) * 100;
  }, [route, currentStepIndex]);

  // Calculate covered and remaining distance
  const { distanceCovered, distanceRemaining } = useMemo(() => {
    if (!route) return { distanceCovered: 0, distanceRemaining: 0 };
    
    let covered = 0;
    let remaining = 0;
    
    route.instructions.forEach((inst, idx) => {
      if (idx < currentStepIndex) {
        covered += inst.distance;
      } else {
        remaining += inst.distance;
      }
    });
    
    return { distanceCovered: covered, distanceRemaining: remaining };
  }, [route, currentStepIndex]);

  // Speak instruction with enhanced voice
  const speakInstruction = useCallback(
    (instruction: NavigationInstruction) => {
      if (isMuted || typeof window === "undefined") return;
      if (!("speechSynthesis" in window)) return;
      
      const voiceText = getVoiceText(instruction, building.name, room.name);
      
      // Don't repeat the same instruction
      if (voiceText === lastSpokenRef.current) return;
      lastSpokenRef.current = voiceText;
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      
      // Try to use a better voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes("Google") || 
        v.name.includes("Samantha") || 
        v.name.includes("Daniel") ||
        v.lang.startsWith("en")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted, building.name, room.name]
  );

  // Speak initial instruction
  useEffect(() => {
    if (route && route.instructions.length > 0 && !isMuted) {
      // Wait for voices to load
      const speak = () => {
        speakInstruction(route.instructions[0]);
      };
      
      if (window.speechSynthesis.getVoices().length > 0) {
        speak();
      } else {
        window.speechSynthesis.onvoiceschanged = speak;
      }
    }
  }, [route, isMuted, speakInstruction]);

  // Auto-advance with animation
  useEffect(() => {
    if (!isPlaying || !route) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= route.instructions.length) {
          setIsPlaying(false);
          setHasArrived(true);
          // Speak arrival
          if (!isMuted) {
            speakInstruction({
              text: `Congratulations! You have arrived at ${room.name}`,
              direction: "arrive",
              distance: 0,
              floor: room.floor,
              nodeId: room.nodeId,
            });
          }
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
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying, route, speakInstruction, isMuted, room.name, room.floor, room.nodeId]);

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
    speakInstruction(prevInstruction);
  };

  const resetNavigation = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setHasArrived(false);
    lastSpokenRef.current = "";
    if (route?.instructions[0]?.floor) {
      setCurrentFloor(route.instructions[0].floor);
    }
    if (route?.instructions[0]) {
      speakInstruction(route.instructions[0]);
    }
  };

  // Zoom controls
  const zoomIn = () => setMapScale((s) => Math.min(s + 0.2, 2.5));
  const zoomOut = () => setMapScale((s) => Math.max(s - 0.2, 0.8));

  // Building colors
  const buildingColors = getBuildingColors(building.type);

  // Handle arrival button click
  const handleArrivalClick = () => {
    window.speechSynthesis.cancel();
    onArrival();
  };

  // Toggle mute
  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F8FC]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0066CC] to-[#004499] text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 shrink-0 bg-white/10 text-white hover:bg-white/20 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Indoor Navigation</h1>
            <p className="text-sm text-white/80 truncate flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {building.shortName}
              <span className="text-white/50 mx-1">→</span>
              <MapPin className="w-3.5 h-3.5" />
              {room.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={`h-10 w-10 rounded-xl transition-colors ${
              isMuted ? "bg-red-500/20 text-red-200" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Progress bar with distance info */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
            <span className="flex items-center gap-1">
              <Footprints className="w-3 h-3" />
              {distanceCovered}m covered
            </span>
            <span className="font-medium text-white">
              Step {currentStepIndex + 1} / {route?.instructions.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {distanceRemaining}m left
            </span>
          </div>
          <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-white to-white/80 rounded-full h-2.5 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Floor Plan with SVG */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#E8F3FF] to-[#F0F5FF]">
        {/* Floor selector tabs */}
        {route && route.floors.length > 1 && (
          <div className="absolute top-3 left-3 z-10 flex gap-1.5 bg-white/95 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-slate-200/50">
            {route.floors.map((floor) => (
              <button
                key={floor}
                onClick={() => setCurrentFloor(floor)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                  currentFloor === floor
                    ? "bg-[#0066CC] text-white shadow-md"
                    : "bg-transparent text-[#4466AA] hover:bg-[#E8F3FF]"
                }`}
              >
                F{floor}
              </button>
            ))}
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-slate-200/50">
          <button
            onClick={zoomIn}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8F3FF] transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-[#0066CC]" />
          </button>
          <div className="h-8 flex items-center justify-center text-xs font-semibold text-[#4466AA] bg-[#E8F3FF] rounded-md">
            {Math.round(mapScale * 100)}%
          </div>
          <button
            onClick={zoomOut}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8F3FF] transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-[#0066CC]" />
          </button>
        </div>

        {/* SVG Floor Plan */}
        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
          <IndoorFloorPlanSVG
            building={building}
            currentFloor={currentFloor}
            targetRoom={room}
            currentNodeId={currentNodeId}
            path={route?.path}
            currentStepIndex={currentStepIndex}
            scale={mapScale}
            width={Math.min(400, window?.innerWidth - 32) || 360}
            height={300}
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-slate-200/50">
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0066CC]" />
              <span className="text-slate-600">You</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00AA66]" />
              <span className="text-slate-600">Target</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-[#6633BB]" />
              <span className="text-slate-600">Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instruction Panel */}
      <div className="bg-white border-t border-[#D0E4F7] shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        {/* Toggle button */}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-center py-1.5 text-[#8899BB] hover:text-[#4466AA] transition-colors"
        >
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </button>

        {showInstructions && currentInstruction && (
          <div className="px-4 pb-4">
            {/* Current instruction card */}
            <div
              className={`rounded-2xl p-4 mb-4 shadow-lg ${
                hasArrived
                  ? "bg-gradient-to-r from-[#00AA66] to-[#008844]"
                  : "bg-gradient-to-r from-[#0066CC] to-[#004499]"
              }`}
            >
              <div className="flex items-center gap-4 text-white">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  {getDirectionIcon(currentInstruction.direction)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg leading-tight">{currentInstruction.text}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-white/75 text-sm">
                    {currentInstruction.distance > 0 && (
                      <span className="flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5" />
                        {currentInstruction.distance}m
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      Floor {currentInstruction.floor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Distance progress cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#E8F3FF] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#4466AA] font-medium uppercase tracking-wide">Covered</p>
                <p className="text-xl font-bold text-[#0066CC]">{distanceCovered}m</p>
              </div>
              <div className="bg-[#EEE8FF] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#6633BB] font-medium uppercase tracking-wide">Progress</p>
                <p className="text-xl font-bold text-[#6633BB]">{Math.round(progress)}%</p>
              </div>
              <div className="bg-[#E8FFF0] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#00883A] font-medium uppercase tracking-wide">Remaining</p>
                <p className="text-xl font-bold text-[#00883A]">{distanceRemaining}m</p>
              </div>
            </div>

            {/* Controls */}
            {!hasArrived ? (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetNavigation}
                  className="h-12 w-12 rounded-xl border-[#D0E4F7] hover:bg-[#E8F3FF]"
                >
                  <RotateCcw className="w-5 h-5 text-[#4466AA]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="h-12 w-12 rounded-xl border-[#D0E4F7] hover:bg-[#E8F3FF] disabled:opacity-40"
                >
                  <ChevronLeft className="w-5 h-5 text-[#4466AA]" />
                </Button>
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`h-14 w-20 rounded-xl font-semibold shadow-lg ${
                    isPlaying 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-[#0066CC] hover:bg-[#004499]"
                  }`}
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
                  className="h-12 w-12 rounded-xl border-[#D0E4F7] hover:bg-[#E8F3FF] disabled:opacity-40"
                >
                  <ChevronRight className="w-5 h-5 text-[#4466AA]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className={`h-12 w-12 rounded-xl border-[#D0E4F7] ${
                    isMuted ? "bg-red-50 border-red-200" : "hover:bg-[#E8F3FF]"
                  }`}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-red-500" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-[#4466AA]" />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleArrivalClick}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-[#00AA66] to-[#008844] hover:from-[#008844] hover:to-[#006633] text-white font-bold text-lg shadow-lg"
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

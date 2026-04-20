"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Volume2, VolumeX, RotateCcw, Navigation, Play, Pause, ChevronUp, ChevronDown, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusMapCanvas } from "@/components/urnav/campus-map-canvas";
import { FloorSwitcher } from "@/components/urnav/floor-switcher";
import { demoController, type DemoState } from "@/lib/demo-controller";
import { GATES, ALL_BUILDINGS } from "@/lib/campus-data";

interface NavigatingScreenProps {
  destinationBuildingId?: string;
  destinationRoomId?: string;
  onCancel: () => void;
  onArrival: () => void;
}

// Demo instructions generator
function generateInstructions(progress: number, destinationName: string) {
  if (progress < 0.15) {
    return { text: "Head north on the main road", direction: "straight" as const, distance: 85 };
  } else if (progress < 0.35) {
    return { text: "Continue past Administration Block", direction: "straight" as const, distance: 65 };
  } else if (progress < 0.55) {
    return { text: "Turn right at central junction", direction: "right" as const, distance: 45 };
  } else if (progress < 0.75) {
    return { text: `${destinationName} is on your left`, direction: "left" as const, distance: 25 };
  } else {
    return { text: `Arriving at ${destinationName}`, direction: "arrive" as const, distance: 5 };
  }
}

export function NavigatingScreen({ destinationBuildingId, destinationRoomId, onCancel, onArrival }: NavigatingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentFloor, setCurrentFloor] = useState(1);
  const [userPosition, setUserPosition] = useState({ x: GATES[0].position.x, y: GATES[0].position.y });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [panelExpanded, setPanelExpanded] = useState(false);

  // Get destination building and room
  const destinationBuilding = ALL_BUILDINGS.find(b => b.id === destinationBuildingId);
  const destinationRoom = destinationBuilding?.rooms.find(r => r.id === destinationRoomId);
  const destinationName = destinationRoom?.name || destinationBuilding?.name || "Destination";
  const targetFloor = destinationRoom?.floor || 1;

  // Get container dimensions - use full available space
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Subscribe to demo controller and start navigation
  useEffect(() => {
    demoController.setRoute("A");
    demoController.play();
    setIsPlaying(true);

    const unsubscribe = demoController.subscribe((state) => {
      setDemoState(state);
      setUserPosition({ x: state.truePos.x, y: state.truePos.y });
      setCurrentFloor(state.currentFloor);
      setSpeed(demoController.getSpeed());
      setIsPlaying(demoController.getIsPlaying());

      // Check for arrival
      if (state.totalProgress >= 0.98) {
        setTimeout(onArrival, 500);
      }
    });

    return () => {
      demoController.pause();
      unsubscribe();
    };
  }, [onArrival]);

  // Get current instruction based on progress
  const progress = demoState?.totalProgress || 0;
  const currentInstruction = generateInstructions(progress, destinationName);
  const remainingDistance = currentInstruction.distance;

  // Text-to-speech for instructions
  const lastSpokenRef = useRef("");
  useEffect(() => {
    if (voiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      if (currentInstruction.text !== lastSpokenRef.current) {
        lastSpokenRef.current = currentInstruction.text;
        const utterance = new SpeechSynthesisUtterance(currentInstruction.text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentInstruction.text, voiceEnabled]);

  const handlePlayPause = useCallback(() => {
    demoController.toggle();
    setIsPlaying(demoController.getIsPlaying());
  }, []);

  const handleRestart = useCallback(() => {
    demoController.reset();
    demoController.play();
    setIsPlaying(true);
  }, []);

  const handleSpeedUp = useCallback(() => {
    const newSpeed = Math.min(10, speed + 0.5);
    demoController.setSpeed(newSpeed);
    setSpeed(newSpeed);
  }, [speed]);

  const handleSpeedDown = useCallback(() => {
    const newSpeed = Math.max(0.5, speed - 0.5);
    demoController.setSpeed(newSpeed);
    setSpeed(newSpeed);
  }, [speed]);

  // Get direction icon
  const getDirectionIcon = () => {
    switch (currentInstruction.direction) {
      case "left": return <span className="text-2xl">{"↰"}</span>;
      case "right": return <span className="text-2xl">{"↱"}</span>;
      case "straight": return <span className="text-2xl">{"↑"}</span>;
      case "arrive": return <span className="text-2xl">{"📍"}</span>;
      default: return <span className="text-2xl">{"↑"}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#E8F0FA] relative overflow-hidden">
      {/* Map Container - Takes all available space */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <CampusMapCanvas
            width={dimensions.width}
            height={dimensions.height}
            destinationBuilding={destinationBuildingId}
            showRoute={true}
            routeNodes={demoController.getRouteNodes()}
            userPosition={demoState?.truePos || userPosition}
            isDemoMode={true}
            showTrail={true}
          />
        )}

        {/* Floor Switcher - left side */}
        <div className="absolute bottom-24 left-3 z-10">
          <FloorSwitcher
            floors={[3, 2, 1, 0]}
            currentFloor={currentFloor}
            onFloorSelect={setCurrentFloor}
            detectedFloor={currentFloor}
          />
        </div>

        {/* Right side demo controls */}
        <div className="absolute bottom-24 right-3 z-10 flex flex-col gap-2">
          {/* Play/Pause */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePlayPause}
            className="h-11 w-11 rounded-full shadow-lg bg-white border-2 border-[#C8D8E8]"
          >
            {isPlaying ? <Pause className="h-5 w-5 text-[#0066CC]" /> : <Play className="h-5 w-5 text-[#0066CC]" />}
          </Button>

          {/* Speed controls */}
          <div className="flex flex-col bg-white rounded-full shadow-lg border-2 border-[#C8D8E8] overflow-hidden">
            <button
              onClick={handleSpeedUp}
              className="h-9 w-11 flex items-center justify-center hover:bg-[#E8F0FA] transition-colors"
            >
              <Plus className="h-4 w-4 text-[#0066CC]" />
            </button>
            <div className="h-8 w-11 flex items-center justify-center text-xs font-semibold text-[#2a4a6a] bg-[#F0F5FA]">
              {speed.toFixed(1)}x
            </div>
            <button
              onClick={handleSpeedDown}
              className="h-9 w-11 flex items-center justify-center hover:bg-[#E8F0FA] transition-colors"
            >
              <Minus className="h-4 w-4 text-[#0066CC]" />
            </button>
          </div>

          {/* Voice toggle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="h-11 w-11 rounded-full shadow-lg bg-white border-2 border-[#C8D8E8]"
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5 text-[#0066CC]" /> : <VolumeX className="h-5 w-5 text-[#8899AA]" />}
          </Button>

          {/* Restart */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleRestart}
            className="h-11 w-11 rounded-full shadow-lg bg-white border-2 border-[#C8D8E8]"
          >
            <RotateCcw className="h-5 w-5 text-[#0066CC]" />
          </Button>
        </div>
      </div>

      {/* Compact Bottom Navigation Panel */}
      <div className={`shrink-0 bg-[#0055AA] text-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,34,85,0.25)] transition-all duration-300 ${panelExpanded ? 'max-h-48' : 'max-h-32'}`}>
        {/* Expand/collapse handle */}
        <button 
          onClick={() => setPanelExpanded(!panelExpanded)}
          className="w-full flex items-center justify-center py-1 hover:bg-white/10 transition-colors"
        >
          {panelExpanded ? <ChevronDown className="h-4 w-4 opacity-60" /> : <ChevronUp className="h-4 w-4 opacity-60" />}
        </button>

        {/* Instruction row */}
        <div className="px-4 pb-3 flex items-center gap-3">
          {/* Direction icon */}
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
            {getDirectionIcon()}
          </div>
          
          {/* Instruction text */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{currentInstruction.text}</p>
            <p className="text-xs opacity-75 mt-0.5">
              {remainingDistance > 0 ? `${remainingDistance}m remaining` : "You have arrived"}
            </p>
          </div>

          {/* Distance/floor badge */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-lg font-bold">{remainingDistance}m</span>
            <span className="text-xs opacity-75 flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              F{targetFloor}
            </span>
          </div>
        </div>

        {/* Expandable section */}
        {panelExpanded && (
          <div className="px-4 pb-3 pt-1 border-t border-white/15">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#6633BB] rounded-sm" />
                <span className="font-medium">{destinationName}</span>
              </div>
              <span className="opacity-75">Building #{destinationBuilding?.number || '?'}</span>
            </div>
          </div>
        )}

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors border-t border-white/15"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

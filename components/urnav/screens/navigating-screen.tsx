"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Volume2, VolumeX, RotateCcw, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusMapCanvas } from "@/components/urnav/campus-map-canvas";
import { FloorSwitcher } from "@/components/urnav/floor-switcher";
import { MapLegend } from "@/components/urnav/map-legend";
import { demoController, type DemoState } from "@/lib/demo-controller";
import { GATES, ALL_BUILDINGS } from "@/lib/campus-data";

interface NavigatingScreenProps {
  destinationBuildingId?: string;
  onCancel: () => void;
  onArrival: () => void;
}

// Demo instructions generator
function generateInstructions(progress: number, destinationName: string) {
  if (progress < 0.2) {
    return { text: "Head north on the main road", direction: "straight" as const, distance: 80 };
  } else if (progress < 0.4) {
    return { text: "Continue straight past the Administration Block", direction: "straight" as const, distance: 60 };
  } else if (progress < 0.6) {
    return { text: "Turn right at the central junction", direction: "right" as const, distance: 40 };
  } else if (progress < 0.8) {
    return { text: `${destinationName} is on your left`, direction: "left" as const, distance: 20 };
  } else {
    return { text: `Arriving at ${destinationName}`, direction: "arrive" as const, distance: 0 };
  }
}

export function NavigatingScreen({ destinationBuildingId, onCancel, onArrival }: NavigatingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentFloor, setCurrentFloor] = useState(1);
  const [userPosition, setUserPosition] = useState({ x: GATES[0].position.x, y: GATES[0].position.y });
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [demoState, setDemoState] = useState<DemoState | null>(null);

  // Get destination building
  const destinationBuilding = ALL_BUILDINGS.find(b => b.id === destinationBuildingId);
  const destinationName = destinationBuilding?.name || "Destination";
  const targetFloor = destinationBuilding?.floors ? 1 : 1;

  // Get container dimensions
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

    const unsubscribe = demoController.subscribe((state) => {
      setDemoState(state);
      setUserPosition({ x: state.truePos.x, y: state.truePos.y });
      setCurrentFloor(state.currentFloor);

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

  const handleRestart = useCallback(() => {
    demoController.reset();
    demoController.play();
  }, []);

  // Get direction icon
  const getDirectionIcon = () => {
    switch (currentInstruction.direction) {
      case "left": return "↰";
      case "right": return "↱";
      case "straight": return "↑";
      case "arrive": return "📍";
      default: return "↑";
    }
  };

  // Check if navigating to different floor
  const isMultiFloor = currentFloor !== targetFloor;

  return (
    <div className="h-full flex flex-col bg-[#0a1a0a] relative">
      {/* Multi-floor instruction header */}
      {isMultiFloor && currentInstruction.direction === "straight" && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-[#1a1a2a] text-white py-3 px-4">
          <p className="text-center font-medium">
            Exit at the {targetFloor}
            <sup>{targetFloor === 1 ? "st" : targetFloor === 2 ? "nd" : targetFloor === 3 ? "rd" : "th"}</sup> floor
          </p>
        </div>
      )}

      {/* Map Container - Full screen */}
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

        {/* Map Legend */}
        <MapLegend />

        {/* Floor Switcher - positioned on left side */}
        <div className="absolute bottom-40 left-4 z-10">
          <FloorSwitcher
            floors={[3, 2, 1, 0]}
            currentFloor={currentFloor}
            onFloorSelect={setCurrentFloor}
            detectedFloor={currentFloor}
          />
        </div>

        {/* Elevator indicator when changing floors */}
        {isMultiFloor && progress > 0.4 && progress < 0.6 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-[#378add] text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center">
                <span className="text-xl">🛗</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold">↑</span>
                <span className="text-xl font-bold">{targetFloor}</span>
              </div>
            </div>
          </div>
        )}

        {/* Right side controls */}
        <div className="absolute bottom-40 right-4 z-10 flex flex-col gap-2">
          {/* Voice toggle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="h-12 w-12 rounded-full shadow-md bg-white border border-gray-200"
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5 text-gray-700" /> : <VolumeX className="h-5 w-5 text-gray-700" />}
          </Button>

          {/* Restart button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleRestart}
            className="h-12 w-12 rounded-full shadow-md bg-white border border-gray-200"
          >
            <RotateCcw className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>

      {/* Bottom navigation panel - orange theme like reference images */}
      <div className="shrink-0 bg-[#f97316] text-white">
        {/* Instruction card */}
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
            {getDirectionIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base truncate">{currentInstruction.text}</p>
            <p className="text-sm opacity-80">
              {remainingDistance > 0 ? `${remainingDistance.toFixed(1)} ft remaining` : "Almost there"}
            </p>
          </div>
        </div>

        {/* Destination bar */}
        <div className="px-4 py-3 bg-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-sm" />
            <span className="font-medium">{destinationName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>{remainingDistance.toFixed(1)} ft</span>
            <Navigation className="h-4 w-4" />
            <span>{targetFloor}</span>
          </div>
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel Navigation
        </button>
      </div>
    </div>
  );
}

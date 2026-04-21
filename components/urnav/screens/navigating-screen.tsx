"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Volume2, VolumeX, RotateCcw, Navigation, Play, Pause, ChevronUp, ChevronDown, Minus, Plus, Gauge, ZoomIn, ZoomOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusMapSVG } from "@/components/urnav/campus-map-svg";
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
function generateInstructions(progress: number, destinationName: string, hasRoom: boolean) {
  if (progress < 0.15) {
    return { text: "Head north on the main road", direction: "straight" as const, distance: 85 };
  } else if (progress < 0.35) {
    return { text: "Continue past Administration Block", direction: "straight" as const, distance: 65 };
  } else if (progress < 0.55) {
    return { text: "Turn right at central junction", direction: "right" as const, distance: 45 };
  } else if (progress < 0.75) {
    return { text: `${destinationName} is on your left`, direction: "left" as const, distance: 25 };
  } else if (progress < 0.95) {
    return { 
      text: hasRoom ? `Entering ${destinationName} building` : `Arriving at ${destinationName}`, 
      direction: "arrive" as const, 
      distance: 5 
    };
  } else {
    return { 
      text: hasRoom ? "Continue to indoor navigation" : `You have arrived at ${destinationName}`, 
      direction: "arrive" as const, 
      distance: 0 
    };
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
  const [zoom, setZoom] = useState(1);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [hasReachedBuilding, setHasReachedBuilding] = useState(false);

  // Get destination building and room
  const destinationBuilding = ALL_BUILDINGS.find(b => b.id === destinationBuildingId);
  const destinationRoom = destinationBuilding?.rooms.find(r => r.id === destinationRoomId);
  const destinationName = destinationBuilding?.name || "Destination";
  const targetFloor = destinationRoom?.floor || 1;
  const hasRoom = !!destinationRoom;

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

      // When reaching building (progress >= 0.98), trigger arrival
      // This will either go to indoor nav (if room selected) or arrival screen
      if (state.totalProgress >= 0.98 && !hasReachedBuilding) {
        setHasReachedBuilding(true);
        demoController.pause();
        // Short delay before transitioning
        setTimeout(onArrival, 300);
      }
    });

    return () => {
      demoController.pause();
      unsubscribe();
    };
  }, [onArrival, hasReachedBuilding]);

  // Get current instruction based on progress
  const progress = demoState?.totalProgress || 0;
  const currentInstruction = generateInstructions(progress, destinationName, hasRoom);
  const remainingDistance = currentInstruction.distance;

  // Text-to-speech for instructions
  const lastSpokenRef = useRef("");
  useEffect(() => {
    if (voiceEnabled && currentInstruction.text && currentInstruction.text !== lastSpokenRef.current) {
      lastSpokenRef.current = currentInstruction.text;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentInstruction.text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [voiceEnabled, currentInstruction.text]);

  // Control handlers
  const handlePlayPause = useCallback(() => {
    demoController.toggle();
  }, []);

  const handleRestart = useCallback(() => {
    demoController.reset();
    setHasReachedBuilding(false);
    demoController.play();
  }, []);

  const handleSpeedUp = useCallback(() => {
    const newSpeed = Math.min(speed + 0.5, 5);
    demoController.setSpeed(newSpeed);
    setSpeed(newSpeed);
  }, [speed]);

  const handleSpeedDown = useCallback(() => {
    const newSpeed = Math.max(speed - 0.5, 0.5);
    demoController.setSpeed(newSpeed);
    setSpeed(newSpeed);
  }, [speed]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setManualZoom(prev => Math.min((prev || zoom) + 0.25, 3));
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    setManualZoom(prev => Math.max((prev || zoom) - 0.25, 0.5));
  }, [zoom]);

  const handleZoomChange = useCallback((newZoom: number) => {
    if (manualZoom === null) {
      setZoom(newZoom);
    }
  }, [manualZoom]);

  // Direction arrow component
  const DirectionArrow = ({ direction }: { direction: string }) => {
    switch (direction) {
      case "left": return <span className="text-2xl">{"<-"}</span>;
      case "right": return <span className="text-2xl">{"->"}</span>;
      case "straight": return <span className="text-2xl">{"^"}</span>;
      case "arrive": return <Navigation className="w-6 h-6" />;
      default: return <span className="text-2xl">{"^"}</span>;
    }
  };

  const effectiveZoom = manualZoom || zoom;

  return (
    <div className="h-full flex flex-col bg-[#E9F0F8] relative overflow-hidden">
      {/* Map Container - Takes all available space */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <CampusMapSVG
            width={dimensions.width}
            height={dimensions.height}
            destinationBuilding={destinationBuildingId}
            showRoute={true}
            routeNodes={demoController.getRouteNodes()}
            userPosition={demoState?.truePos || userPosition}
            isDemoMode={true}
            showTrail={true}
            animationSpeed={speed}
            onZoomChange={handleZoomChange}
            externalZoom={manualZoom || undefined}
          />
        )}

        {/* Floor Switcher - left side */}
        <div className="absolute bottom-28 left-3 z-10">
          <FloorSwitcher
            floors={[3, 2, 1, 0]}
            currentFloor={currentFloor}
            onFloorSelect={setCurrentFloor}
            detectedFloor={currentFloor}
          />
        </div>

        {/* Right side controls */}
        <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10 flex flex-col gap-2">
          {/* Zoom controls */}
          <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="h-10 w-11 flex items-center justify-center hover:bg-slate-100 transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5 text-[#0066CC]" />
            </button>
            <div className="h-8 w-11 flex items-center justify-center text-xs font-semibold text-[#0066CC] bg-[#0066CC]/10 border-y border-slate-200/80">
              {Math.round(effectiveZoom * 100)}%
            </div>
            <button
              onClick={handleZoomOut}
              className="h-10 w-11 flex items-center justify-center hover:bg-slate-100 transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5 text-[#0066CC]" />
            </button>
          </div>

          {/* Play/Pause */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePlayPause}
            className="h-11 w-11 rounded-xl shadow-lg bg-white border border-slate-200/80"
          >
            {isPlaying ? <Pause className="h-5 w-5 text-[#0066CC]" /> : <Play className="h-5 w-5 text-[#0066CC]" />}
          </Button>

          {/* Speed controls */}
          <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
            <button
              onClick={handleSpeedUp}
              className="h-9 w-11 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Plus className="h-4 w-4 text-slate-600" />
            </button>
            <div className="h-8 w-11 flex items-center justify-center text-xs font-semibold text-[#6633BB] bg-[#6633BB]/10">
              <Gauge className="w-3 h-3 mr-0.5" />
              {speed.toFixed(1)}x
            </div>
            <button
              onClick={handleSpeedDown}
              className="h-9 w-11 flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <Minus className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Voice toggle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="h-11 w-11 rounded-xl shadow-lg bg-white border border-slate-200/80"
          >
            {voiceEnabled ? <Volume2 className="h-5 w-5 text-[#0066CC]" /> : <VolumeX className="h-5 w-5 text-slate-400" />}
          </Button>

          {/* Restart */}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleRestart}
            className="h-11 w-11 rounded-xl shadow-lg bg-white border border-slate-200/80"
          >
            <RotateCcw className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Compact Bottom Navigation Panel */}
      <div className={`shrink-0 bg-[#0055AA] text-white rounded-t-2xl shadow-lg transition-all duration-300 ${panelExpanded ? 'pb-4' : ''}`}>
        {/* Expand/Collapse handle */}
        <button
          onClick={() => setPanelExpanded(!panelExpanded)}
          className="w-full flex items-center justify-center py-1.5"
        >
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </button>

        {/* Main instruction */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-4">
            {/* Direction icon */}
            <div className="h-14 w-14 shrink-0 rounded-xl bg-white/15 flex items-center justify-center">
              <DirectionArrow direction={currentInstruction.direction} />
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold leading-tight truncate">{currentInstruction.text}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-white/80">
                <span>{remainingDistance}m</span>
                <span>•</span>
                <span>{Math.ceil((100 - progress * 100) / 15)} min</span>
                {hasRoom && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Indoor next
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Cancel button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-10 w-10 shrink-0 rounded-lg bg-white/15 hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Room destination info */}
          {hasRoom && destinationRoom && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-white/10 text-sm">
              <span className="text-white/70">Going to:</span>{" "}
              <span className="font-medium">{destinationRoom.name}</span>
              <span className="text-white/60 ml-1">(Floor {destinationRoom.floor})</span>
            </div>
          )}
        </div>

        {/* Expanded details */}
        {panelExpanded && (
          <div className="px-4 pt-2 border-t border-white/10">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-white/10">
                <p className="text-xs text-white/70">Distance</p>
                <p className="text-lg font-semibold">{Math.round((1 - progress) * 200)}m</p>
              </div>
              <div className="p-2 rounded-lg bg-white/10">
                <p className="text-xs text-white/70">ETA</p>
                <p className="text-lg font-semibold">{Math.ceil((100 - progress * 100) / 15)} min</p>
              </div>
              <div className="p-2 rounded-lg bg-white/10">
                <p className="text-xs text-white/70">Speed</p>
                <p className="text-lg font-semibold">{speed.toFixed(1)}x</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

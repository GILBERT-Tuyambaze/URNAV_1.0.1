"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { X, Volume2, VolumeX, RotateCcw, Navigation, Play, Pause, ChevronUp, ChevronDown, Minus, Plus, Gauge, ZoomIn, ZoomOut, Building2, Footprints, MapPin, Clock, Route, Crosshair, Focus } from "lucide-react";
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

// Demo instructions generator with detailed voice-friendly text
interface NavigationInstruction {
  text: string;
  voiceText: string;
  direction: "straight" | "left" | "right" | "arrive";
  distance: number;
  landmark?: string;
}

function generateInstructions(progress: number, destinationName: string, hasRoom: boolean): NavigationInstruction {
  if (progress < 0.12) {
    return { 
      text: "Head north on main road", 
      voiceText: "Head north on the main road. Continue straight for about 85 meters.",
      direction: "straight", 
      distance: 85,
      landmark: "Main Gate"
    };
  } else if (progress < 0.25) {
    return { 
      text: "Pass Security Office on right", 
      voiceText: "Continue straight. The Security Office will be on your right.",
      direction: "straight", 
      distance: 70,
      landmark: "Security Office"
    };
  } else if (progress < 0.40) {
    return { 
      text: "Continue past Admin Block", 
      voiceText: "Keep going straight. You will pass the Administration Block on your right.",
      direction: "straight", 
      distance: 55,
      landmark: "Administration Block"
    };
  } else if (progress < 0.55) {
    return { 
      text: "Turn right at junction", 
      voiceText: "In about 40 meters, turn right at the central junction.",
      direction: "right", 
      distance: 40,
      landmark: "Central Junction"
    };
  } else if (progress < 0.70) {
    return { 
      text: "Continue on campus road", 
      voiceText: "Continue straight on the campus road. Your destination is ahead.",
      direction: "straight", 
      distance: 30,
      landmark: "Campus Road"
    };
  } else if (progress < 0.85) {
    return { 
      text: `${destinationName} ahead on left`, 
      voiceText: `${destinationName} is coming up on your left. About 20 meters remaining.`,
      direction: "left", 
      distance: 20,
      landmark: destinationName
    };
  } else if (progress < 0.95) {
    return { 
      text: hasRoom ? `Entering ${destinationName}` : `Arriving at ${destinationName}`, 
      voiceText: hasRoom 
        ? `You are approaching ${destinationName}. Prepare to enter the building for indoor navigation.`
        : `You are arriving at ${destinationName}. Your destination is on the left.`,
      direction: "arrive", 
      distance: 5,
      landmark: destinationName
    };
  } else {
    return { 
      text: hasRoom ? "Starting indoor navigation" : `Arrived at ${destinationName}`, 
      voiceText: hasRoom 
        ? `You have reached ${destinationName}. Indoor navigation will begin shortly.`
        : `Congratulations! You have arrived at ${destinationName}.`,
      direction: "arrive", 
      distance: 0,
      landmark: destinationName
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
  const [autoZoom, setAutoZoom] = useState(true);
  const mapRef = useRef<{ zoomIn: () => void; zoomOut: () => void; resetView: () => void; centerOnUser: () => void } | null>(null);

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
  
  // Calculate total route distance and covered distance
  const totalRouteDistance = useMemo(() => 280, []); // Total route distance in meters (from DEMO_ROUTES)
  const coveredDistance = useMemo(() => Math.round(progress * totalRouteDistance), [progress, totalRouteDistance]);
  const distanceRemaining = useMemo(() => Math.round((1 - progress) * totalRouteDistance), [progress, totalRouteDistance]);
  const estimatedTimeMin = useMemo(() => Math.max(1, Math.ceil(distanceRemaining / (speed * 60))), [distanceRemaining, speed]);

  // Text-to-speech for instructions with enhanced voice
  const lastSpokenRef = useRef("");
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Function to speak text
  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (text === lastSpokenRef.current) return;
    
    lastSpokenRef.current = text;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
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
  }, [voiceEnabled]);

  // Speak instruction when it changes
  useEffect(() => {
    if (voiceEnabled && currentInstruction.voiceText) {
      speakText(currentInstruction.voiceText);
    }
  }, [voiceEnabled, currentInstruction.voiceText, speakText]);
  
  // Initialize voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Load voices
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Auto-zoom based on progress - zoom in as user gets closer to destination
  useEffect(() => {
    if (!autoZoom || manualZoom !== null) return;
    
    // Calculate optimal zoom based on progress
    // Start at 1.5x, gradually increase to 3x as we approach destination
    let targetZoom = 1.5;
    if (progress > 0.2) targetZoom = 1.8;
    if (progress > 0.4) targetZoom = 2.0;
    if (progress > 0.6) targetZoom = 2.3;
    if (progress > 0.8) targetZoom = 2.6;
    if (progress > 0.9) targetZoom = 3.0;
    
    setZoom(targetZoom);
  }, [progress, autoZoom, manualZoom]);

  // Auto-center on user when position changes significantly
  useEffect(() => {
    if (autoZoom && mapRef.current && demoState) {
      // Center on user every few updates
      const shouldCenter = Math.floor(progress * 20) !== Math.floor((progress - 0.01) * 20);
      if (shouldCenter) {
        mapRef.current.centerOnUser();
      }
    }
  }, [progress, autoZoom, demoState]);

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
            ref={mapRef}
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

          {/* Auto-Zoom Toggle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              setAutoZoom(!autoZoom);
              if (!autoZoom) {
                setManualZoom(null);
              }
            }}
            className={`h-11 w-11 rounded-xl shadow-lg border border-slate-200/80 ${
              autoZoom 
                ? 'bg-[#0066CC] text-white hover:bg-[#004499]' 
                : 'bg-white hover:bg-slate-100'
            }`}
            title={autoZoom ? 'Auto-zoom enabled' : 'Auto-zoom disabled'}
          >
            <Focus className={`h-5 w-5 ${autoZoom ? 'text-white' : 'text-slate-600'}`} />
          </Button>
        </div>
      </div>

      {/* Enhanced Bottom Navigation Panel */}
      <div className={`shrink-0 bg-gradient-to-r from-[#0055AA] to-[#004499] text-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 ${panelExpanded ? 'pb-4' : ''}`}>
        {/* Distance Progress Bar - Always visible at top */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1 text-white/70">
              <Footprints className="w-3 h-3" />
              {coveredDistance}m covered
            </span>
            <span className="font-bold text-white">{Math.round(progress * 100)}%</span>
            <span className="flex items-center gap-1 text-white/70">
              <MapPin className="w-3 h-3" />
              {distanceRemaining}m left
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress * 100}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Expand/Collapse handle */}
        <button
          onClick={() => setPanelExpanded(!panelExpanded)}
          className="w-full flex items-center justify-center py-1"
        >
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </button>

        {/* Main instruction */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-4">
            {/* Direction icon */}
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <DirectionArrow direction={currentInstruction.direction} />
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold leading-tight truncate">{currentInstruction.text}</p>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-white/80">
                <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                  <Route className="w-3 h-3" />
                  {remainingDistance}m
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {estimatedTimeMin} min
                </span>
                {hasRoom && (
                  <span className="flex items-center gap-1 bg-[#6633BB]/40 px-2 py-0.5 rounded-full">
                    <Building2 className="w-3 h-3" />
                    Indoor
                  </span>
                )}
              </div>
            </div>

            {/* Cancel button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-10 w-10 shrink-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Room destination info */}
          {hasRoom && destinationRoom && (
            <div className="mt-3 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-white/70 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/70">Final destination: </span>
                <span className="font-semibold">{destinationRoom.name}</span>
                <span className="text-white/60 ml-1">(Floor {destinationRoom.floor})</span>
              </div>
            </div>
          )}
        </div>

        {/* Expanded details with distance stats */}
        {panelExpanded && (
          <div className="px-4 pt-3 border-t border-white/10">
            {/* Distance stats grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-center">
                <Footprints className="w-4 h-4 mx-auto mb-1 text-white/70" />
                <p className="text-lg font-bold">{coveredDistance}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Covered</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 text-center">
                <MapPin className="w-4 h-4 mx-auto mb-1 text-white/70" />
                <p className="text-lg font-bold">{distanceRemaining}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Remaining</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-white/70" />
                <p className="text-lg font-bold">{estimatedTimeMin}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Min ETA</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 text-center">
                <Gauge className="w-4 h-4 mx-auto mb-1 text-white/70" />
                <p className="text-lg font-bold">{speed.toFixed(1)}x</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Speed</p>
              </div>
            </div>

            {/* Landmark info */}
            {currentInstruction.landmark && (
              <div className="p-2.5 rounded-xl bg-[#6633BB]/30 border border-[#6633BB]/40 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-white/80 shrink-0" />
                <span className="text-sm">
                  <span className="text-white/70">Near: </span>
                  <span className="font-medium">{currentInstruction.landmark}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

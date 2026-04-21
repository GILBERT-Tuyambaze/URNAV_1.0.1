"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, Play, MapPin, X, Info, Settings, HelpCircle, Map, Navigation, Building2, Layers, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusMapSVG } from "@/components/urnav/campus-map-svg";
import { MapControls } from "@/components/urnav/map-controls";
import { FloorSwitcher } from "@/components/urnav/floor-switcher";
import { demoController, type DemoState } from "@/lib/demo-controller";
import { GATES, type CampusBuilding, type CampusRoom, DEMO_ROUTES } from "@/lib/campus-data";
import { fitCampus, type ViewState } from "@/lib/map-transform";

interface HomeScreenProps {
  onSearchFocus: () => void;
  onNavigationStart?: (roomId: string) => void;
  onBuildingSelect?: (building: CampusBuilding) => void;
}

export function HomeScreen({ onSearchFocus, onBuildingSelect }: HomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    centerOnUser: () => void;
  } | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentFloor, setCurrentFloor] = useState(1);
  const [userPosition, setUserPosition] = useState({ x: GATES[0].position.x, y: GATES[0].position.y });
  const [isLocating, setIsLocating] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [destinationBuilding, setDestinationBuilding] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  // Layer visibility
  const [showTrail, setShowTrail] = useState(true);
  const [showWifiDot, setShowWifiDot] = useState(false);
  const [showKalmanDot, setShowKalmanDot] = useState(false);
  const [showPathNodes, setShowPathNodes] = useState(false);
  const [showPathEdges, setShowPathEdges] = useState(false);

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // View state for map
  const [view, setView] = useState<ViewState>(() => ({
    scale: 1,
    panX: 0,
    panY: 0,
    screenW: 400,
    screenH: 600,
  }));

  // Get container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        const h = containerRef.current.offsetHeight;
        setDimensions({ width: w, height: h });
        const fit = fitCampus(w, h, 20);
        setView((prev) => ({
          ...prev,
          screenW: w,
          screenH: h,
          scale: fit.scale,
          panX: fit.panX,
          panY: fit.panY,
        }));
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Subscribe to demo controller
  useEffect(() => {
    if (!isDemoMode) return;

    const unsubscribe = demoController.subscribe((state) => {
      setDemoState(state);
      setUserPosition({ x: state.truePos.x, y: state.truePos.y });
      setCurrentFloor(state.currentFloor);
      setIsPlaying(demoController.getIsPlaying());
      setSpeed(demoController.getSpeed());
    });
    return () => unsubscribe();
  }, [isDemoMode]);

  // Keyboard controls
  useEffect(() => {
    if (!isDemoMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          handleSpeedChange(Math.min(10, speed + 0.5));
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          handleSpeedChange(Math.max(0.5, speed - 0.5));
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          demoController.stepForward();
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          demoController.stepBackward();
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          handleZoomOut();
          break;
        case "r":
        case "R":
          e.preventDefault();
          handleReset();
          break;
        case "0":
          e.preventDefault();
          handleResetView();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDemoMode, speed]);

  // Start demo mode
  const handleStartDemo = useCallback(() => {
    setIsDemoMode(true);
    setSelectedRoute("A");
    demoController.setRoute("A");
  }, []);

  // Stop demo mode
  const handleStopDemo = useCallback(() => {
    setIsDemoMode(false);
    demoController.pause();
    setIsPlaying(false);
  }, []);

  // Handle building selection
  const handleBuildingSelect = useCallback((building: CampusBuilding) => {
    setSelectedBuilding(building.id);
    setDestinationBuilding(building.id);
    onBuildingSelect?.(building);
  }, [onBuildingSelect]);

  // Handle room selection
  const handleRoomSelect = useCallback((room: CampusRoom, building: CampusBuilding) => {
    setSelectedBuilding(building.id);
    setDestinationBuilding(building.id);
    // Could trigger navigation to specific room
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setView((prev) => {
      const newScale = Math.min(12, prev.scale * 1.4);
      const cx = prev.screenW / 2;
      const cy = prev.screenH / 2;
      const ratio = newScale / prev.scale;
      return {
        ...prev,
        scale: newScale,
        panX: cx - (cx - prev.panX) * ratio,
        panY: cy - (cy - prev.panY) * ratio,
      };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setView((prev) => {
      const newScale = Math.max(0.4, prev.scale / 1.4);
      const cx = prev.screenW / 2;
      const cy = prev.screenH / 2;
      const ratio = newScale / prev.scale;
      return {
        ...prev,
        scale: newScale,
        panX: cx - (cx - prev.panX) * ratio,
        panY: cy - (cy - prev.panY) * ratio,
      };
    });
  }, []);

  const handleResetView = useCallback(() => {
    const fit = fitCampus(dimensions.width, dimensions.height, 20);
    setView((prev) => ({
      ...prev,
      scale: fit.scale,
      panX: fit.panX,
      panY: fit.panY,
    }));
  }, [dimensions]);

  const handleCenterOnUser = useCallback(() => {
    setIsLocating(true);
    // Center map on user position
  }, []);

  // Demo controls
  const handlePlayPause = useCallback(() => {
    demoController.toggle();
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    demoController.setSpeed(newSpeed);
  }, []);

  const handleStepForward = useCallback(() => {
    demoController.stepForward();
  }, []);

  const handleStepBackward = useCallback(() => {
    demoController.stepBackward();
  }, []);

  const handleReset = useCallback(() => {
    demoController.reset();
    setIsPlaying(false);
  }, []);

  const handleRouteSelect = useCallback((routeId: string) => {
    setSelectedRoute(routeId);
    demoController.setRoute(routeId);
  }, []);

  // Layer toggle
  const handleToggleLayer = useCallback((layer: string, value: boolean) => {
    switch (layer) {
      case "trail":
        setShowTrail(value);
        break;
      case "wifi":
        setShowWifiDot(value);
        break;
      case "kalman":
        setShowKalmanDot(value);
        break;
      case "nodes":
        setShowPathNodes(value);
        break;
      case "edges":
        setShowPathEdges(value);
        break;
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#E9F0F8] relative overflow-hidden">
      {/* Search Bar - Floating over map */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          className="h-11 w-11 bg-[#0066CC] text-white hover:bg-[#004499] rounded-xl shrink-0 shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <button
          onClick={onSearchFocus}
          className="flex-1 h-11 bg-white/98 backdrop-blur-sm border border-slate-200/80 rounded-xl px-4 text-left shadow-lg flex items-center gap-2"
        >
          <MapPin className="w-4 h-4 text-[#0066CC]" />
          <span className="text-slate-500 text-sm">Search rooms, buildings...</span>
        </button>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Menu Header */}
            <div className="bg-gradient-to-r from-[#0066CC] to-[#004499] text-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">URNAV</h2>
                    <p className="text-xs text-white/70">Campus Navigation</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Live Location Active</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-2">Navigation</p>
              
              <button 
                onClick={() => { setMenuOpen(false); onSearchFocus(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#E8F3FF] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#E8F3FF] flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#0066CC]" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Find Location</p>
                  <p className="text-xs text-slate-500">Search buildings & rooms</p>
                </div>
              </button>

              {/* <button 
                onClick={() => { setMenuOpen(false); handleStartDemo(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#EEE8FF] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#EEE8FF] flex items-center justify-center">
                  <Play className="w-4 h-4 text-[#6633BB]" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Demo Mode</p>
                  <p className="text-xs text-slate-500">See navigation in action</p>
                </div>
              </button> */}

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-2 mt-4">Settings</p>

              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${voiceEnabled ? 'bg-[#E8F3FF]' : 'bg-red-50'}`}>
                  {voiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#0066CC]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800">Voice Guidance</p>
                  <p className="text-xs text-slate-500">{voiceEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-[#0066CC]' : 'bg-slate-300'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${voiceEnabled ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`} />
                </div>
              </button>

              <button 
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Map Layers</p>
                  <p className="text-xs text-slate-500">Customize map display</p>
                </div>
              </button>

              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-2 mt-4">Information</p>

              <button 
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Campus Info</p>
                  <p className="text-xs text-slate-500">39 buildings, 200+ rooms</p>
                </div>
              </button>

              <button 
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Help & Tutorial</p>
                  <p className="text-xs text-slate-500">How to use URNAV</p>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
              <p className="text-center text-xs text-slate-400">
                URNAV v1.0 - UR Nyarugenge Campus
              </p>
            </div>
          </div>
        </>
      )}

      {/* Map Container - Full screen */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <CampusMapSVG
            width={dimensions.width}
            height={dimensions.height}
            selectedBuilding={selectedBuilding}
            destinationBuilding={destinationBuilding}
            onBuildingSelect={handleBuildingSelect}
            onRoomSelect={handleRoomSelect}
            showRoute={isDemoMode && demoState !== null}
            routeNodes={isDemoMode ? demoController.getRouteNodes() : []}
            userPosition={isDemoMode ? demoState?.truePos : userPosition}
            isDemoMode={isDemoMode}
            showTrail={showTrail}
            showWifiDot={showWifiDot}
            showKalmanDot={showKalmanDot}
            showPathNodes={showPathNodes}
            showPathEdges={showPathEdges}
            animationSpeed={speed}
            onZoomChange={setZoom}
          />
        )}

        {/* Floor Switcher - positioned on left side */}
        <div className="absolute bottom-28 left-3 z-20">
          <FloorSwitcher
            floors={[3, 2, 1, 0]}
            currentFloor={currentFloor}
            onFloorSelect={setCurrentFloor}
            detectedFloor={currentFloor}
          />
        </div>

        {/* Map Controls */}
        <MapControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onCenterOnUser={handleCenterOnUser}
          isDemoMode={isDemoMode}
          isPlaying={isPlaying}
          speed={speed}
          onPlayPause={handlePlayPause}
          onSpeedChange={handleSpeedChange}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onReset={handleReset}
          onRouteSelect={handleRouteSelect}
          selectedRoute={selectedRoute}
          showTrail={showTrail}
          showWifiDot={showWifiDot}
          showKalmanDot={showKalmanDot}
          showPathNodes={showPathNodes}
          showPathEdges={showPathEdges}
          onToggleLayer={handleToggleLayer}
        />

        {/* Demo mode button (when not in demo) */}
        {!isDemoMode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={handleStartDemo}
              className="bg-[#6633BB] hover:bg-[#5522AA] text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Start Demo</span>
            </button>
          </div>
        )}

        {/* Position status card (when not in demo) */}
        {!isDemoMode && (
          <div className="absolute bottom-4 left-3 right-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200/80 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isLocating ? "bg-green-500" : "bg-yellow-500"
                    } animate-pulse`}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {isLocating ? "Live Location" : "Location Paused"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Floor {currentFloor}</span>
                  <span className="text-slate-300">|</span>
                  <span>Zoom {Math.round(zoom * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

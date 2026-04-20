"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Crosshair, Square, Navigation, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusMapCanvas } from "@/components/urnav/campus-map-canvas";
import { FloorSwitcher } from "@/components/urnav/floor-switcher";
import { MapLegend } from "@/components/urnav/map-legend";
import { DemoControlPanel } from "@/components/urnav/demo-control-panel";
import { demoController, type DemoState } from "@/lib/demo-controller";
import { GATES, type CampusBuilding } from "@/lib/campus-data";

interface HomeScreenProps {
  onSearchFocus: () => void;
  onNavigationStart?: (roomId: string) => void;
  onBuildingSelect?: (building: CampusBuilding) => void;
}

export function HomeScreen({ onSearchFocus, onBuildingSelect }: HomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentFloor, setCurrentFloor] = useState(1);
  const [userPosition, setUserPosition] = useState({ x: GATES[0].position.x, y: GATES[0].position.y });
  const [isLocating, setIsLocating] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [demoState, setDemoState] = useState<DemoState | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [destinationBuilding, setDestinationBuilding] = useState<string | null>(null);

  // Layer visibility
  const [showTrail, setShowTrail] = useState(true);
  const [showWifiDot, setShowWifiDot] = useState(false);
  const [showKalmanDot, setShowKalmanDot] = useState(false);

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

  // Subscribe to demo controller
  useEffect(() => {
    if (isDemoMode) {
      const unsubscribe = demoController.subscribe((state) => {
        setDemoState(state);
        setUserPosition({ x: state.truePos.x, y: state.truePos.y });
        setCurrentFloor(state.currentFloor);
      });
      return unsubscribe;
    }
  }, [isDemoMode]);

  // Start demo mode
  const handleStartDemo = () => {
    setIsDemoMode(true);
    setShowDemoPanel(true);
    demoController.setRoute("A");
  };

  // Handle building selection
  const handleBuildingSelect = (building: CampusBuilding) => {
    setSelectedBuilding(building.id);
    setDestinationBuilding(building.id);
    onBuildingSelect?.(building);
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F8FC] relative">
      {/* Search Bar - Floating over map */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 bg-[#0066CC] text-white hover:bg-[#004499] rounded-lg shrink-0 shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <button
          onClick={onSearchFocus}
          className="flex-1 h-12 bg-white border-2 border-[#0066CC] rounded-xl px-4 text-left shadow-sm"
        >
          <span className="text-[#8899BB] text-sm">Search rooms, buildings...</span>
        </button>
      </div>

      {/* Map Container - Full screen */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <CampusMapCanvas
            width={dimensions.width}
            height={dimensions.height}
            selectedBuilding={selectedBuilding}
            destinationBuilding={destinationBuilding}
            onBuildingSelect={handleBuildingSelect}
            showRoute={isDemoMode && demoState !== null}
            routeNodes={isDemoMode ? demoController.getRouteNodes() : []}
            userPosition={isDemoMode ? demoState?.truePos : userPosition}
            isDemoMode={isDemoMode}
            showTrail={showTrail}
            showWifiDot={showWifiDot}
            showKalmanDot={showKalmanDot}
          />
        )}

        {/* Map Legend */}
        <MapLegend isDemoMode={isDemoMode} />

        {/* Floor Switcher - positioned on left side */}
        <div className="absolute bottom-40 left-4 z-10">
          <FloorSwitcher
            floors={[3, 2, 1, 0]}
            currentFloor={currentFloor}
            onFloorSelect={setCurrentFloor}
            detectedFloor={currentFloor}
          />
        </div>

        {/* Right side controls */}
        <div className="absolute bottom-40 right-4 z-10 flex flex-col gap-2">
          {/* Demo mode toggle */}
          {!isDemoMode && (
            <Button
              variant="secondary"
              size="icon"
              onClick={handleStartDemo}
              className="h-12 w-12 rounded-full shadow-lg bg-[#6633BB] hover:bg-[#5522AA] border-none"
              title="Start Demo"
            >
              <Play className="h-5 w-5 text-white" />
            </Button>
          )}

          {/* Recenter button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsLocating(true)}
            className="h-12 w-12 rounded-full shadow-lg bg-white border-2 border-[#D0E4F7]"
          >
            <Crosshair className="h-5 w-5 text-[#0066CC]" />
          </Button>

          {/* Navigation mode indicator */}
          <Button
            variant="secondary"
            size="icon"
            onClick={() => {
              if (isDemoMode) {
                setIsDemoMode(false);
                setShowDemoPanel(false);
                demoController.pause();
              }
            }}
            className={`h-12 w-12 rounded-full shadow-lg ${
              isDemoMode ? "bg-[#00883A]" : "bg-[#0066CC]"
            }`}
          >
            {isDemoMode ? (
              <Square className="h-4 w-4 text-white" />
            ) : (
              <Navigation className="h-5 w-5 text-white" />
            )}
          </Button>
        </div>

        {/* Position info card */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {!showDemoPanel && (
            <div className="bg-white px-4 py-3 rounded-xl border border-[#D0E4F7] shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDemoMode
                        ? "bg-[#0066CC]"
                        : isLocating
                        ? "bg-[#00883A]"
                        : "bg-[#F5A800]"
                    } animate-pulse`}
                  />
                  <span className="text-sm font-medium text-[#002255]">
                    {isDemoMode
                      ? "Demo Mode"
                      : isLocating
                      ? "Live Location"
                      : "Location Paused"}
                  </span>
                </div>
                <span className="text-xs text-[#4466AA]">Floor {currentFloor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Demo Control Panel */}
        <DemoControlPanel
          isVisible={showDemoPanel}
          onClose={() => setShowDemoPanel(false)}
        />
      </div>
    </div>
  );
}

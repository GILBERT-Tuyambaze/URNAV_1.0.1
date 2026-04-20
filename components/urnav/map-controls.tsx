"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Minus,
  RotateCcw,
  Crosshair,
  Layers,
  Info,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Gauge,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { demoController } from "@/lib/demo-controller";
import { DEMO_ROUTES } from "@/lib/campus-data";

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterOnUser?: () => void;
  isDemoMode?: boolean;
  isPlaying?: boolean;
  speed?: number;
  onPlayPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onReset?: () => void;
  onRouteSelect?: (routeId: string) => void;
  selectedRoute?: string | null;
  showTrail?: boolean;
  showWifiDot?: boolean;
  showKalmanDot?: boolean;
  showPathNodes?: boolean;
  showPathEdges?: boolean;
  onToggleLayer?: (layer: string, value: boolean) => void;
}

export function MapControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onCenterOnUser,
  isDemoMode = false,
  isPlaying = false,
  speed = 1.5,
  onPlayPause,
  onSpeedChange,
  onStepForward,
  onStepBackward,
  onReset,
  onRouteSelect,
  selectedRoute,
  showTrail = true,
  showWifiDot = false,
  showKalmanDot = false,
  showPathNodes = false,
  showPathEdges = false,
  onToggleLayer,
}: MapControlsProps) {
  const [showLegend, setShowLegend] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const zoomPercentage = Math.round(zoom * 100);

  // Speed control helpers
  const handleSpeedUp = useCallback(() => {
    const newSpeed = Math.min(10, speed + 0.5);
    onSpeedChange?.(newSpeed);
    demoController.setSpeed(newSpeed);
  }, [speed, onSpeedChange]);

  const handleSpeedDown = useCallback(() => {
    const newSpeed = Math.max(0.5, speed - 0.5);
    onSpeedChange?.(newSpeed);
    demoController.setSpeed(newSpeed);
  }, [speed, onSpeedChange]);

  const handleRouteChange = useCallback((routeId: string) => {
    demoController.setRoute(routeId);
    onRouteSelect?.(routeId);
  }, [onRouteSelect]);

  return (
    <>
      {/* === RIGHT SIDE: Zoom Controls === */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {/* Zoom indicator */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-md border border-slate-200/80 text-center">
          <span className="text-[11px] font-semibold text-slate-700">{zoomPercentage}%</span>
        </div>

        {/* Zoom buttons */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/80 overflow-hidden">
          <button
            onClick={onZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors border-b border-slate-200/80"
            title="Zoom In"
          >
            <Plus className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={onZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Reset view */}
        <button
          onClick={onResetView}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/80 flex items-center justify-center hover:bg-slate-100 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4 text-slate-700" />
        </button>

        {/* Center on user */}
        {onCenterOnUser && (
          <button
            onClick={onCenterOnUser}
            className="w-10 h-10 bg-[#0066CC] rounded-xl shadow-md flex items-center justify-center hover:bg-[#0055AA] transition-colors"
            title="Center on User"
          >
            <Crosshair className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* === TOP RIGHT: Legend & Layers === */}
      <div className="absolute top-20 right-3 z-20 flex flex-col gap-2">
        {/* Legend toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={cn(
            "w-10 h-10 rounded-xl shadow-md flex items-center justify-center transition-colors border",
            showLegend
              ? "bg-[#0066CC] text-white border-[#0055AA]"
              : "bg-white/95 text-slate-700 border-slate-200/80 hover:bg-slate-100"
          )}
          title="Map Legend"
        >
          <Info className="w-5 h-5" />
        </button>

        {/* Layer toggle (demo mode) */}
        {isDemoMode && (
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={cn(
              "w-10 h-10 rounded-xl shadow-md flex items-center justify-center transition-colors border",
              showLayerPanel
                ? "bg-[#6633BB] text-white border-[#5522AA]"
                : "bg-white/95 text-slate-700 border-slate-200/80 hover:bg-slate-100"
            )}
            title="Layer Controls"
          >
            <Layers className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* === LEGEND PANEL === */}
      {showLegend && (
        <div className="absolute top-20 right-14 z-30 w-44 bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 overflow-hidden animate-in slide-in-from-right-2 duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700">Map Legend</span>
            <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {/* Building Types */}
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1 pt-1">Buildings</div>
            {[
              { color: "#DCEEFF", stroke: "#0066CC", label: "Academic" },
              { color: "#DCF0E8", stroke: "#00883A", label: "Hostel" },
              { color: "#EEE8FF", stroke: "#6633BB", label: "Admin" },
              { color: "#FFF3DC", stroke: "#F5A800", label: "Service" },
              { color: "#FFE8DC", stroke: "#CC4400", label: "Facility" },
              { color: "#FFE8F5", stroke: "#CC0066", label: "Conference" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-1 py-0.5">
                <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color, border: `1.5px solid ${item.stroke}` }} />
                <span className="text-[11px] text-slate-700">{item.label}</span>
              </div>
            ))}

            {/* Features */}
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1 pt-2">Features</div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-4 rounded-full bg-[#DCF0E8] border-2 border-[#00883A] flex items-center justify-center">
                <div className="w-2 h-2 bg-[#00883A] rounded-sm" />
              </div>
              <span className="text-[11px] text-slate-700">Gate</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-3.5 bg-[#3366AA] rounded text-white text-[8px] font-bold flex items-center justify-center">P</div>
              <span className="text-[11px] text-slate-700">Parking</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-1.5 rounded-full bg-[#F5F8FB] border border-[#A8B4C4]" />
              <span className="text-[11px] text-slate-700">Road</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-3 bg-[#C8E0C0] rounded-sm border border-[#B0D0A0]" />
              <span className="text-[11px] text-slate-700">Garden</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-3 bg-[#8BC88A] rounded-sm border border-[#5A9A58]" />
              <span className="text-[11px] text-slate-700">Sports Ground</span>
            </div>

            {/* Navigation */}
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1 pt-2">Navigation</div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-1 rounded-full bg-[#6633BB]" />
              <span className="text-[11px] text-slate-700">Route</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-4 rounded-full bg-[#0066CC] flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <span className="text-[11px] text-slate-700">Your Location</span>
            </div>
            <div className="flex items-center gap-2 px-1 py-0.5">
              <div className="w-4 h-4 bg-[#6633BB] rounded-full relative">
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#6633BB]" />
              </div>
              <span className="text-[11px] text-slate-700">Destination</span>
            </div>

            {/* Room Types (when zoomed) */}
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1 pt-2">Rooms (zoom in)</div>
            {[
              { color: "#E0ECFF", stroke: "#0066CC", label: "Lab" },
              { color: "#E8F0FF", stroke: "#3388DD", label: "Lecture" },
              { color: "#F0F4FF", stroke: "#4466AA", label: "Office" },
              { color: "#E8F5E8", stroke: "#00883A", label: "Common" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-1 py-0.5">
                <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color, border: `1px solid ${item.stroke}` }} />
                <span className="text-[11px] text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === LAYER PANEL === */}
      {showLayerPanel && (
        <div className="absolute top-32 right-14 z-30 w-48 bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 overflow-hidden animate-in slide-in-from-right-2 duration-200">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-700">Debug Layers</span>
            <button onClick={() => setShowLayerPanel(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2 space-y-1">
            {[
              { key: "trail", label: "Position Trail", color: "#6633BB", active: showTrail },
              { key: "wifi", label: "Wi-Fi Position", color: "#0066CC", active: showWifiDot },
              { key: "kalman", label: "Kalman Filter", color: "#F5A800", active: showKalmanDot },
              { key: "nodes", label: "Path Nodes", color: "#00883A", active: showPathNodes },
              { key: "edges", label: "Path Edges", color: "#00883A", active: showPathEdges },
            ].map((layer) => (
              <button
                key={layer.key}
                onClick={() => onToggleLayer?.(layer.key, !layer.active)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left",
                  layer.active ? "bg-slate-100" : "hover:bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border-2",
                    layer.active ? "border-current bg-current/10" : "border-slate-300"
                  )}
                  style={{ borderColor: layer.active ? layer.color : undefined, color: layer.color }}
                >
                  {layer.active && (layer.key === "trail" || layer.key === "wifi" ? (
                    <Eye className="w-3 h-3" style={{ color: layer.color }} />
                  ) : (
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: layer.color }} />
                  ))}
                </div>
                <span className={cn("text-[11px]", layer.active ? "text-slate-800 font-medium" : "text-slate-600")}>
                  {layer.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === BOTTOM: Demo Control Bar === */}
      {isDemoMode && (
        <div className="absolute bottom-4 left-4 right-4 z-20">
          {/* Collapsed demo bar */}
          {!showDemoPanel && (
            <div
              className="bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setShowDemoPanel(true)}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", isPlaying ? "bg-green-500" : "bg-yellow-500")} />
                <span className="text-xs font-medium text-slate-700">
                  {isPlaying ? "Demo Running" : "Demo Paused"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{speed.toFixed(1)} m/s</span>
                <ChevronUp className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          )}

          {/* Expanded demo panel */}
          {showDemoPanel && (
            <div className="bg-white/98 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
              {/* Header */}
              <div
                className="flex items-center justify-between px-3 py-2 border-b border-slate-200/80 bg-slate-50/50 cursor-pointer"
                onClick={() => setShowDemoPanel(false)}
              >
                <span className="text-xs font-semibold text-slate-700">Demo Controls</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Route selector */}
              <div className="px-3 py-2 border-b border-slate-200/80">
                <div className="text-[10px] text-slate-500 mb-1.5">Route</div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {DEMO_ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => handleRouteChange(route.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors font-medium",
                        selectedRoute === route.id
                          ? "bg-[#0066CC] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {route.id}: {route.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport controls */}
              <div className="px-3 py-3 flex items-center justify-center gap-2">
                <button
                  onClick={onReset}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={onStepBackward}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  title="Step Back"
                >
                  <SkipBack className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={onPlayPause}
                  className={cn(
                    "w-12 h-10 rounded-lg flex items-center justify-center transition-colors",
                    isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  )}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={onStepForward}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  title="Step Forward"
                >
                  <SkipForward className="w-4 h-4 text-slate-600" />
                </button>

                {/* Speed control */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={handleSpeedDown}
                    className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-slate-600" />
                  </button>
                  <div className="w-14 h-8 rounded-lg bg-[#6633BB]/10 border border-[#6633BB]/30 flex items-center justify-center">
                    <Gauge className="w-3 h-3 text-[#6633BB] mr-0.5" />
                    <span className="text-[11px] font-semibold text-[#6633BB]">{speed.toFixed(1)}x</span>
                  </div>
                  <button
                    onClick={handleSpeedUp}
                    className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-200/80">
                <div className="text-[9px] text-slate-500 text-center">
                  <span className="font-medium">Keyboard:</span> Space=Play/Pause, W/S=Speed, A/D=Step, +/-=Zoom
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

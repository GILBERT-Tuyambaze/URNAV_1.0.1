"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  RotateCcw,
  Crosshair,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Layers,
  Info,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { DEMO_ROUTES } from "@/lib/campus-data";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onCenterOnUser: () => void;
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

// Legend items
const LEGEND_ITEMS = [
  { icon: "circle", color: "#00883A", label: "Gate" },
  { icon: "square", color: "#DCEEFF", stroke: "#0066CC", label: "Academic" },
  { icon: "square", color: "#DCF0E8", stroke: "#00883A", label: "Hostel" },
  { icon: "square", color: "#EEE8FF", stroke: "#6633BB", label: "Admin" },
  { icon: "square", color: "#FFF3DC", stroke: "#F5A800", label: "Service" },
  { icon: "square", color: "#FFE8F5", stroke: "#CC0066", label: "Conference" },
  { icon: "P", color: "#3366AA", label: "Parking" },
  { icon: "line", color: "#F5F7FA", label: "Road" },
  { icon: "hatch", color: "#AA3366", label: "KCEV Area" },
  { icon: "x", color: "#F5A800", label: "Construction" },
  { icon: "circle", color: "#6633BB", label: "Your route" },
  { icon: "circle", color: "#0066CC", label: "Your position" },
];

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
  const [showLayers, setShowLayers] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  return (
    <>
      {/* Right side zoom controls */}
      <div className="absolute top-20 right-3 z-20 flex flex-col gap-2">
        {/* Zoom controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/80 overflow-hidden">
          <button
            onClick={onZoomIn}
            className="h-10 w-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Zoom in"
          >
            <Plus className="h-5 w-5 text-slate-600" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            onClick={onZoomOut}
            className="h-10 w-10 flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Zoom out"
          >
            <Minus className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Reset view */}
        <Button
          variant="secondary"
          size="icon"
          onClick={onResetView}
          className="h-10 w-10 rounded-xl shadow-lg bg-white border border-slate-200/80"
          aria-label="Reset view"
        >
          <RotateCcw className="h-4 w-4 text-slate-600" />
        </Button>

        {/* Center on user */}
        <Button
          variant="secondary"
          size="icon"
          onClick={onCenterOnUser}
          className="h-10 w-10 rounded-xl shadow-lg bg-white border border-slate-200/80"
          aria-label="Center on user"
        >
          <Crosshair className="h-4 w-4 text-[#0066CC]" />
        </Button>

        {/* Legend toggle */}
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setShowLegend(!showLegend)}
          className={cn(
            "h-10 w-10 rounded-xl shadow-lg border border-slate-200/80",
            showLegend ? "bg-[#0066CC] text-white" : "bg-white text-slate-600"
          )}
          aria-label="Toggle legend"
        >
          <Info className="h-4 w-4" />
        </Button>

        {/* Layers toggle (demo mode) */}
        {isDemoMode && (
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowLayers(!showLayers)}
            className={cn(
              "h-10 w-10 rounded-xl shadow-lg border border-slate-200/80",
              showLayers ? "bg-[#6633BB] text-white" : "bg-white text-slate-600"
            )}
            aria-label="Toggle layers"
          >
            <Layers className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Legend Panel */}
      {showLegend && (
        <div className="absolute top-20 right-16 z-30 w-44 bg-white/98 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 shadow-xl animate-in slide-in-from-right-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Map Legend</span>
            <button onClick={() => setShowLegend(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {LEGEND_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 h-5">
                <div className="w-4 flex items-center justify-center">
                  {item.icon === "circle" && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  )}
                  {item.icon === "square" && (
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: item.color, borderColor: item.stroke || item.color }}
                    />
                  )}
                  {item.icon === "line" && (
                    <div className="w-3.5 h-1 rounded-full border border-slate-300" style={{ backgroundColor: item.color }} />
                  )}
                  {item.icon === "hatch" && (
                    <div className="w-3.5 h-3.5 relative rounded-sm overflow-hidden" style={{ backgroundColor: `${item.color}15` }}>
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="absolute h-px w-full rotate-45"
                          style={{ backgroundColor: item.color, top: `${j * 5 + 2}px`, opacity: 0.6 }}
                        />
                      ))}
                    </div>
                  )}
                  {item.icon === "x" && (
                    <div className="relative w-2.5 h-2.5">
                      <div className="absolute top-1/2 left-0 w-full h-0.5 rotate-45" style={{ backgroundColor: item.color }} />
                      <div className="absolute top-1/2 left-0 w-full h-0.5 -rotate-45" style={{ backgroundColor: item.color }} />
                    </div>
                  )}
                  {item.icon === "P" && (
                    <span className="text-[10px] font-bold" style={{ color: item.color }}>P</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
          
          {/* Zoom info */}
          <div className="mt-3 pt-2 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 mb-1">Zoom Level</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">{Math.round(zoom * 100)}%</span>
              <span className="text-[10px] text-slate-400">
                {zoom < 1 ? "Overview" : zoom < 2 ? "Campus" : zoom < 4 ? "Block" : zoom < 7 ? "Building" : "Room"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Layers Panel (demo mode) */}
      {isDemoMode && showLayers && (
        <div className="absolute top-44 right-16 z-30 w-44 bg-white/98 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 shadow-xl animate-in slide-in-from-right-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">Debug Layers</span>
            <button onClick={() => setShowLayers(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {[
              { id: "trail", label: "Position trail", value: showTrail, color: "#6633BB" },
              { id: "wifi", label: "Wi-Fi position", value: showWifiDot, color: "#0066CC" },
              { id: "kalman", label: "Kalman filter", value: showKalmanDot, color: "#F5A800" },
              { id: "nodes", label: "Path nodes", value: showPathNodes, color: "#00883A" },
              { id: "edges", label: "Path edges", value: showPathEdges, color: "#00883A" },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => onToggleLayer?.(layer.id, !layer.value)}
                className={cn(
                  "w-full px-2 py-1.5 rounded-lg text-[11px] text-left transition-colors font-medium flex items-center gap-2",
                  layer.value
                    ? "border"
                    : "border border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                )}
                style={
                  layer.value
                    ? { borderColor: layer.color, backgroundColor: `${layer.color}15`, color: layer.color }
                    : undefined
                }
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: layer.value ? layer.color : "#D0D0D0" }}
                />
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Demo Control Panel (bottom) */}
      {isDemoMode && showDemoPanel && (
        <div className="absolute bottom-4 left-3 right-3 z-20">
          <div className="bg-white/98 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setShowDemoPanel(!showDemoPanel)}
              className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-semibold text-[#6633BB] flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" />
                Demo Controls
              </span>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showDemoPanel && "rotate-180")} />
            </button>

            <div className="px-4 pb-4 space-y-3">
              {/* Route selector */}
              <div>
                <p className="text-[10px] text-slate-500 mb-1.5">Demo Route</p>
                <div className="flex gap-1.5 flex-wrap">
                  {DEMO_ROUTES.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => onRouteSelect?.(route.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors",
                        selectedRoute === route.id
                          ? "bg-[#6633BB] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {route.id}: {route.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="h-9 w-9 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStepBackward}
                  className="h-9 w-9 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={onPlayPause}
                  className={cn(
                    "h-9 w-14 text-white font-semibold rounded-lg",
                    isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onStepForward}
                  className="h-9 w-9 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Speed control */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500">Walk Speed</span>
                  <span className="text-[11px] font-semibold text-[#0066CC]">{speed.toFixed(1)} m/s</span>
                </div>
                <Slider
                  value={[speed]}
                  min={0.5}
                  max={10}
                  step={0.5}
                  onValueChange={(v) => onSpeedChange?.(v[0])}
                  className="[&_[role=slider]]:bg-[#0066CC] [&_[role=slider]]:border-[#0066CC]"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-slate-400">0.5x</span>
                  <span className="text-[9px] text-slate-400">10x</span>
                </div>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="text-[9px] text-slate-400 text-center pt-1 border-t border-slate-100">
                Space: Play/Pause | W/S: Speed | A/D: Step | +/-: Zoom | R: Restart
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed demo panel button */}
      {isDemoMode && !showDemoPanel && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => setShowDemoPanel(true)}
            className="bg-[#6633BB] text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-[#5522AA] transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="text-sm font-medium">Show Controls</span>
          </button>
        </div>
      )}
    </>
  );
}

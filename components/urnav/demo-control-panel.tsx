"use client";

import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { demoController, type DemoState } from "@/lib/demo-controller";
import { DEMO_ROUTES } from "@/lib/campus-data";
import { cn } from "@/lib/utils";

interface DemoControlPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

export function DemoControlPanel({ isVisible, onClose }: DemoControlPanelProps) {
  const [state, setState] = useState<DemoState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [speed, setSpeed] = useState(3);
  const [stepSize, setStepSize] = useState(0.5);
  const [noiseEnabled, setNoiseEnabled] = useState(true);
  const [noiseLevel, setNoiseLevel] = useState(10);
  const [showTrail, setShowTrail] = useState(true);
  const [showWifi, setShowWifi] = useState(false);
  const [showKalman, setShowKalman] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [showEdges, setShowEdges] = useState(false);

  // Subscribe to demo controller
  useEffect(() => {
    const unsubscribe = demoController.subscribe((newState) => {
      setState(newState);
      setIsPlaying(demoController.getIsPlaying());
    });
    return unsubscribe;
  }, []);

  // Calculate speed in m/s
  const speedMps = (0.5 * Math.pow(1.5, speed - 1)).toFixed(1);

  // Handlers
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    demoController.setRoute(routeId);
  };

  const handlePlayPause = () => {
    demoController.toggle();
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    demoController.reset();
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    demoController.stepForward();
  };

  const handleStepBackward = () => {
    demoController.stepBackward();
  };

  const handleSpeedChange = (value: number[]) => {
    const v = value[0];
    setSpeed(v);
    demoController.setSpeedFromSlider(v);
  };

  const handleStepSizeChange = (value: number[]) => {
    const v = value[0];
    setStepSize(v);
    demoController.setStepSize(v);
  };

  const handleNoiseLevelChange = (value: number[]) => {
    const v = value[0];
    setNoiseLevel(v);
    demoController.setNoiseLevel(v);
  };

  const handleNoiseToggle = () => {
    const newValue = !noiseEnabled;
    setNoiseEnabled(newValue);
    demoController.setNoiseEnabled(newValue);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-white border-t border-[#D0E4F7] rounded-t-[20px] shadow-[0_-4px_16px_rgba(0,34,85,0.12)]",
        "transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      style={{ maxHeight: "60%" }}
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-[#D0E4F7] rounded-full" />
      </div>

      <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: "calc(60vh - 40px)" }}>
        {/* ROW 1 - Route Selector */}
        <div className="mb-4">
          <p className="text-[10px] text-[#4466AA] mb-2 font-medium">Choose demo route</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DEMO_ROUTES.map((route) => (
              <button
                key={route.id}
                onClick={() => handleRouteSelect(route.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] whitespace-nowrap transition-colors",
                  selectedRoute === route.id
                    ? "bg-[#0066CC] text-white"
                    : "bg-[#E8F3FF] border border-[#D0E4F7] text-[#0066CC] hover:bg-[#D0E4F7]"
                )}
              >
                {route.id}: {route.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 2 - Transport Controls */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 w-9 bg-white border-[#D0E4F7] text-[#0066CC] hover:bg-[#E8F3FF] rounded-lg"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStepBackward}
            className="h-9 w-9 bg-white border-[#D0E4F7] text-[#0066CC] hover:bg-[#E8F3FF] rounded-lg"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handlePlayPause}
            className={cn(
              "h-9 w-12 text-white font-semibold rounded-lg",
              isPlaying ? "bg-[#CC2200] hover:bg-[#AA1100]" : "bg-[#00883A] hover:bg-[#006A2E]"
            )}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStepForward}
            className="h-9 w-9 bg-white border-[#D0E4F7] text-[#0066CC] hover:bg-[#E8F3FF] rounded-lg"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-10 bg-[#EEE8FF] border-[#6633BB] text-[#6633BB] hover:bg-[#DDD0FF] rounded-lg"
          >
            <Gauge className="h-3 w-3 mr-0.5" />
            <span className="text-[10px]">{speed}x</span>
          </Button>
        </div>

        {/* ROW 3 - Speed Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-[#4466AA] font-medium">Walk speed</span>
            <span className="text-[10px] text-[#0066CC] font-medium">{speedMps} m/s</span>
          </div>
          <Slider
            value={[speed]}
            min={1}
            max={10}
            step={0.5}
            onValueChange={handleSpeedChange}
            className="[&_[role=slider]]:bg-[#0066CC] [&_[role=slider]]:border-[#0066CC]"
          />
        </div>

        {/* ROW 4 - Step Size */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-[#4466AA] font-medium">Step size</span>
            <span className="text-[10px] text-[#0066CC] font-medium">{stepSize.toFixed(1)} m</span>
          </div>
          <Slider
            value={[stepSize]}
            min={0.1}
            max={3.0}
            step={0.1}
            onValueChange={handleStepSizeChange}
            className="[&_[role=slider]]:bg-[#0066CC] [&_[role=slider]]:border-[#0066CC]"
          />
        </div>

        {/* ROW 5 - Noise Control */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-[#4466AA] font-medium">Wi-Fi noise</span>
            <button
              onClick={handleNoiseToggle}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors",
                noiseEnabled
                  ? "bg-[#DCF0E8] text-[#00883A]"
                  : "bg-[#F5F8FC] text-[#8899BB]"
              )}
            >
              {noiseEnabled ? "ON" : "OFF"}
            </button>
          </div>
          {noiseEnabled && (
            <div className="mt-2">
              <Slider
                value={[noiseLevel]}
                min={0}
                max={30}
                step={1}
                onValueChange={handleNoiseLevelChange}
                className="[&_[role=slider]]:bg-[#00883A] [&_[role=slider]]:border-[#00883A]"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[9px] text-[#8899BB]">{noiseLevel} noise level</span>
              </div>
            </div>
          )}
        </div>

        {/* ROW 6 - Layer Visibility Toggles */}
        <div className="mb-4">
          <p className="text-[10px] text-[#4466AA] font-medium mb-2">Show layers</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Position trail", value: showTrail, setter: setShowTrail, color: "#6633BB" },
              { label: "Wi-Fi dot", value: showWifi, setter: setShowWifi, color: "#0066CC" },
              { label: "Kalman dot", value: showKalman, setter: setShowKalman, color: "#F5A800" },
              { label: "Path nodes", value: showNodes, setter: setShowNodes, color: "#00883A" },
              { label: "Path edges", value: showEdges, setter: setShowEdges, color: "#00883A" },
            ].map((toggle) => (
              <button
                key={toggle.label}
                onClick={() => toggle.setter(!toggle.value)}
                className={cn(
                  "px-2 py-1 rounded-lg text-[11px] transition-colors font-medium",
                  toggle.value
                    ? "border"
                    : "border border-[#D0E4F7] bg-white text-[#8899BB]"
                )}
                style={
                  toggle.value
                    ? {
                        borderColor: toggle.color,
                        backgroundColor: `${toggle.color}15`,
                        color: toggle.color,
                      }
                    : undefined
                }
              >
                {toggle.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 7 - Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Campus X", value: state?.truePos.x.toFixed(1) || "0.0", unit: "m" },
            { label: "Campus Y", value: state?.truePos.y.toFixed(1) || "0.0", unit: "m" },
            { label: "Floor", value: state?.currentFloor || 1, unit: "" },
            { label: "Progress", value: ((state?.totalProgress || 0) * 100).toFixed(0), unit: "%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#F5F8FC] border border-[#D0E4F7] rounded-lg p-2 text-center"
            >
              <p className="text-[9px] text-[#8899BB]">{stat.label}</p>
              <p className="text-[13px] font-semibold text-[#002255]">
                {stat.value}
                {stat.unit}
              </p>
            </div>
          ))}
        </div>

        {/* ROW 8 - Progress Bar */}
        <div className="h-1.5 bg-[#E8F3FF] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${(state?.totalProgress || 0) * 100}%`,
              background: "linear-gradient(to right, #0066CC, #6633BB)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

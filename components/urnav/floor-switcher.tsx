"use client";

import { cn } from "@/lib/utils";

interface FloorSwitcherProps {
  floors: number[];
  currentFloor: number;
  detectedFloor?: number;
  onFloorSelect: (floor: number) => void;
}

export function FloorSwitcher({
  floors,
  currentFloor,
  detectedFloor,
  onFloorSelect,
}: FloorSwitcherProps) {
  return (
    <div className="flex flex-col bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-md overflow-hidden">
      {floors.map((floor) => {
        const isActive = floor === currentFloor;
        const isDetected = floor === detectedFloor;
        
        return (
          <button
            key={floor}
            onClick={() => onFloorSelect(floor)}
            className={cn(
              "w-10 h-10 flex items-center justify-center text-sm font-semibold transition-all border-b border-border last:border-b-0",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-card text-foreground hover:bg-muted",
              isDetected && !isActive && "ring-2 ring-inset ring-primary/50"
            )}
          >
            {floor}
          </button>
        );
      })}
      {/* Floor label */}
      <div className="w-10 h-6 flex items-center justify-center text-[10px] text-muted-foreground bg-muted/50">
        Floor
      </div>
    </div>
  );
}

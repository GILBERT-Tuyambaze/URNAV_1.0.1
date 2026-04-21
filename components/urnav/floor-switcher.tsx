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
    <div className="flex flex-col bg-white rounded-xl border border-[#D0E4F7] shadow-lg overflow-hidden">
      {floors.map((floor) => {
        const isActive = floor === currentFloor;
        const isDetected = floor === detectedFloor;
        
        return (
          <button
            key={floor}
            onClick={() => onFloorSelect(floor)}
            className={cn(
              "w-11 h-11 flex items-center justify-center text-sm font-semibold transition-all border-b border-[#D0E4F7] last:border-b-0",
              isActive 
                ? "bg-[#0066CC] text-white" 
                : "bg-white text-[#002255] hover:bg-[#E8F3FF]",
              isDetected && !isActive && "ring-2 ring-inset ring-[#0066CC]/50"
            )}
          >
            {floor}
          </button>
        );
      })}
      {/* Floor label */}
      <div className="w-11 h-6 flex items-center justify-center text-[10px] text-[#8899BB] bg-[#F5F8FC]">
        Floor
      </div>
    </div>
  );
}

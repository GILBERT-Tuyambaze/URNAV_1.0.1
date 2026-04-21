"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapLegendProps {
  isDemoMode?: boolean;
}

const LEGEND_ITEMS = [
  { icon: "circle", color: "#00883A", label: "Gate" },
  { icon: "square", color: "#DCEEFF", stroke: "#0066CC", label: "Academic" },
  { icon: "square", color: "#DCF0E8", stroke: "#00883A", label: "Hostel" },
  { icon: "square", color: "#EEE8FF", stroke: "#6633BB", label: "Admin" },
  { icon: "square", color: "#FFF3DC", stroke: "#F5A800", label: "Service" },
  { icon: "square", color: "#FFE8F5", stroke: "#CC0066", label: "Conference" },
  { icon: "P", color: "#0066CC", label: "Parking" },
  { icon: "line", color: "#D8D8E8", label: "Road" },
  { icon: "hatch", color: "#CC0066", label: "KCEV Area" },
  { icon: "x", color: "#F5A800", label: "Construction" },
  { icon: "circle", color: "#6633BB", label: "Your route" },
  { icon: "circle", color: "#0066CC", label: "Your position" },
];

const DEMO_LEGEND_ITEMS = [
  { icon: "circle-ring", color: "#0066CC", label: "Wi-Fi fix (demo)" },
  { icon: "diamond", color: "#F5A800", label: "Kalman (demo)" },
];

export function MapLegend({ isDemoMode = false }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const items = isDemoMode ? [...LEGEND_ITEMS, ...DEMO_LEGEND_ITEMS] : LEGEND_ITEMS;

  return (
    <div className="absolute top-20 right-4 z-10">
      {/* Collapsed state */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-9 h-9 rounded-xl bg-white border border-[#D0E4F7] shadow-lg flex items-center justify-center text-[#0066CC] hover:bg-[#E8F3FF] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div
          className={cn(
            "w-40 bg-white border border-[#D0E4F7] rounded-xl p-3 shadow-lg",
            "animate-in slide-in-from-right-2 duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#4466AA] font-medium">Map Legend</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#8899BB] hover:text-[#0066CC] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Legend items */}
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 h-6">
                {/* Icon */}
                <div className="w-4 flex items-center justify-center">
                  {item.icon === "circle" && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon === "circle-ring" && (
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{ borderColor: item.color, backgroundColor: "transparent" }}
                    />
                  )}
                  {item.icon === "square" && (
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: item.color, borderColor: item.stroke || item.color }}
                    />
                  )}
                  {item.icon === "diamond" && (
                    <div
                      className="w-2.5 h-2.5 rotate-45"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon === "line" && (
                    <div
                      className="w-3.5 h-1 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon === "hatch" && (
                    <div className="w-3.5 h-3.5 relative rounded-sm overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: `${item.color}15` }}
                      />
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="absolute h-[1px] w-full rotate-45"
                          style={{
                            backgroundColor: item.color,
                            top: `${j * 5 + 2}px`,
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {item.icon === "x" && (
                    <div className="relative w-2.5 h-2.5">
                      <div
                        className="absolute top-1/2 left-0 w-full h-[2px] rotate-45"
                        style={{ backgroundColor: item.color }}
                      />
                      <div
                        className="absolute top-1/2 left-0 w-full h-[2px] -rotate-45"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  )}
                  {item.icon === "P" && (
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: item.color }}
                    >
                      P
                    </span>
                  )}
                </div>
                {/* Label */}
                <span className="text-[11px] text-[#002255]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

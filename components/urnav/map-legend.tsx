"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapLegendProps {
  isDemoMode?: boolean;
}

const LEGEND_ITEMS = [
  { icon: "circle", color: "#639922", label: "Gate" },
  { icon: "square", color: "#3d1515", label: "Campus Building" },
  { icon: "square", color: "#1a3020", label: "Student Hostel" },
  { icon: "square", color: "#2a1a4a", label: "Admin Building" },
  { icon: "square", color: "#2a2010", label: "Facility" },
  { icon: "square", color: "#2a0a1a", label: "Conference Hall" },
  { icon: "P", color: "#378add", label: "Parking Area" },
  { icon: "line", color: "#1d9e75", label: "Footpath" },
  { icon: "hatch", color: "#d4537e", label: "KCEV Area" },
  { icon: "x", color: "#3a3000", label: "Construction Site" },
  { icon: "circle", color: "#c84bff", label: "Your route" },
  { icon: "circle", color: "#c84bff", label: "Your position" },
];

const DEMO_LEGEND_ITEMS = [
  { icon: "circle-ring", color: "#378add", label: "Wi-Fi fix (demo)" },
  { icon: "diamond", color: "#ef9f27", label: "Kalman estimate (demo)" },
];

export function MapLegend({ isDemoMode = false }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const items = isDemoMode ? [...LEGEND_ITEMS, ...DEMO_LEGEND_ITEMS] : LEGEND_ITEMS;

  return (
    <div className="absolute bottom-4 left-4 z-10">
      {/* Collapsed state */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-8 h-8 rounded-full bg-[rgba(17,29,46,0.92)] border border-[#1e3a5c] flex items-center justify-center text-[#8ab4d4] hover:bg-[rgba(17,29,46,1)] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div
          className={cn(
            "w-44 bg-[rgba(17,29,46,0.97)] border border-[#1e3a5c] rounded-xl p-3",
            "animate-in slide-in-from-bottom-2 duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#4a6a8a]">Map legend</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#4a6a8a] hover:text-[#8ab4d4] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Legend items */}
          <div className="space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 h-7">
                {/* Icon */}
                <div className="w-3.5 flex items-center justify-center">
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
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon === "diamond" && (
                    <div
                      className="w-2 h-2 rotate-45"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon === "line" && (
                    <div
                      className="w-3 h-0.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  {item.icon === "hatch" && (
                    <div className="w-3 h-3 relative">
                      <div
                        className="absolute inset-0 rounded-sm"
                        style={{ backgroundColor: `${item.color}20` }}
                      />
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="absolute h-[1px] w-full rotate-45"
                          style={{
                            backgroundColor: item.color,
                            top: `${j * 4 + 2}px`,
                            opacity: 0.5,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {item.icon === "x" && (
                    <div className="relative w-2.5 h-2.5">
                      <div
                        className="absolute top-1/2 left-0 w-full h-[1px] rotate-45"
                        style={{ backgroundColor: item.color }}
                      />
                      <div
                        className="absolute top-1/2 left-0 w-full h-[1px] -rotate-45"
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
                <span className="text-[11px] text-[#8ab4d4]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Changes:
// - Created collapsible map legend with expand/collapse animation
// - All legend items with appropriate icons (circle, square, line, etc.)
// - Demo-specific items shown when in demo mode
// - Dark theme styling matching the spec

"use client";

import { MapPin, Navigation, Users, Building2, Layers, Tag, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CampusBuilding, CampusRoom, RoomType } from "@/lib/campus-data";

interface RoomDetailSheetProps {
  room: CampusRoom | null;
  building: CampusBuilding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (room: CampusRoom, building: CampusBuilding) => void;
  onSetAsStart?: (room: CampusRoom, building: CampusBuilding) => void;
}

// Room type display config
const ROOM_TYPE_CONFIG: Record<RoomType, { color: string; bg: string; label: string }> = {
  lab: { color: "#0066CC", bg: "#EEF4FF", label: "Laboratory" },
  lecture: { color: "#6633BB", bg: "#F5F0FF", label: "Lecture Hall" },
  office: { color: "#00883A", bg: "#F0FFF5", label: "Office" },
  toilet: { color: "#CC4400", bg: "#FFF5F5", label: "Restroom" },
  common: { color: "#886600", bg: "#FFFFF0", label: "Common Area" },
  hostel: { color: "#0066CC", bg: "#F0F8FF", label: "Hostel Room" },
  server: { color: "#666688", bg: "#F5F5F5", label: "Server Room" },
  facility: { color: "#CC4400", bg: "#FFF8F0", label: "Facility" },
  default: { color: "#0066CC", bg: "#DCEEFF", label: "Room" },
};

// Building type colors
const BUILDING_TYPE_COLORS: Record<string, string> = {
  academic: "#0066CC",
  hostel: "#00883A",
  admin: "#6633BB",
  service: "#F5A800",
  facility: "#CC4400",
  conference: "#CC0066",
  external: "#888888",
};

export function RoomDetailSheet({ 
  room, 
  building, 
  open, 
  onOpenChange, 
  onNavigate,
  onSetAsStart 
}: RoomDetailSheetProps) {
  if (!room || !building) return null;

  const roomConfig = ROOM_TYPE_CONFIG[room.type] || ROOM_TYPE_CONFIG.default;
  const buildingColor = BUILDING_TYPE_COLORS[building.type] || "#0066CC";

  const handleNavigate = () => {
    onNavigate(room, building);
    onOpenChange(false);
  };

  const handleSetAsStart = () => {
    if (onSetAsStart) {
      onSetAsStart(room, building);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            {/* Room icon */}
            <div 
              className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: roomConfig.bg }}
            >
              <MapPin className="h-7 w-7" style={{ color: roomConfig.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold text-foreground text-left">
                {room.name}
              </SheetTitle>
              <SheetDescription className="text-left mt-1">
                Room {room.num}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Room details */}
        <div className="space-y-3 pb-6">
          {/* Building info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{building.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{building.type} Building</p>
            </div>
            <Badge 
              style={{ backgroundColor: buildingColor }} 
              className="text-white text-xs shrink-0"
            >
              #{building.number}
            </Badge>
          </div>

          {/* Floor info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <Layers className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Floor {room.floor}</p>
              <p className="text-xs text-muted-foreground">
                of {building.floors} {building.floors === 1 ? "floor" : "floors"}
              </p>
            </div>
          </div>

          {/* Room type */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <Tag className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{roomConfig.label}</p>
            </div>
            <div 
              className="h-3 w-3 rounded-full shrink-0" 
              style={{ backgroundColor: roomConfig.color }}
            />
          </div>

          {/* Capacity if available */}
          {room.capacity && room.capacity > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Users className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Capacity: {room.capacity} {room.capacity === 1 ? "person" : "people"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pb-6">
          {/* Navigate button */}
          <Button 
            className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
            onClick={handleNavigate}
          >
            <Navigation className="h-5 w-5" />
            Navigate here
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          {/* Set as start button */}
          {onSetAsStart && (
            <Button 
              variant="outline"
              className="w-full h-12 rounded-2xl text-base border-primary text-primary hover:bg-primary/10"
              onClick={handleSetAsStart}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Set as start point
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState, useMemo } from "react";
import { X, ChevronRight, MapPin, Users, Building2, FlaskConical, BookOpen, Briefcase, Coffee, Bed, Server, Wrench, BookMarked, Presentation, Cross, Home, Sofa } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { CampusBuilding, CampusRoom, RoomType } from "@/lib/campus-data";

interface BuildingSheetProps {
  building: CampusBuilding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRoom: (room: CampusRoom) => void;
}

// Room type colors
const ROOM_TYPE_CONFIG: Record<RoomType, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  lab: { color: "#0066CC", bg: "#EEF4FF", icon: FlaskConical, label: "Laboratory" },
  lecture: { color: "#6633BB", bg: "#F5F0FF", icon: Presentation, label: "Lecture Hall" },
  office: { color: "#00883A", bg: "#F0FFF5", icon: Briefcase, label: "Office" },
  toilet: { color: "#CC4400", bg: "#FFF5F5", icon: Building2, label: "Toilet" },
  common: { color: "#886600", bg: "#FFFFF0", icon: Sofa, label: "Common Area" },
  hostel: { color: "#0066CC", bg: "#F0F8FF", icon: Bed, label: "Hostel" },
  server: { color: "#666688", bg: "#F5F5F5", icon: Server, label: "Server Room" },
  facility: { color: "#CC4400", bg: "#FFF8F0", icon: Wrench, label: "Facility" },
  default: { color: "#0066CC", bg: "#DCEEFF", icon: MapPin, label: "Room" },
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

export function BuildingSheet({ building, open, onOpenChange, onSelectRoom }: BuildingSheetProps) {
  const [selectedFloor, setSelectedFloor] = useState(1);

  // Get unique floors for this building
  const floors = useMemo(() => {
    if (!building) return [1];
    const uniqueFloors = [...new Set(building.rooms.map(r => r.floor))].sort((a, b) => a - b);
    return uniqueFloors.length > 0 ? uniqueFloors : Array.from({ length: building.floors }, (_, i) => i + 1);
  }, [building]);

  // Reset floor when building changes
  useMemo(() => {
    if (building && !floors.includes(selectedFloor)) {
      setSelectedFloor(floors[0] || 1);
    }
  }, [building, floors, selectedFloor]);

  // Filter rooms by selected floor
  const floorRooms = useMemo(() => {
    if (!building) return [];
    return building.rooms.filter(r => r.floor === selectedFloor);
  }, [building, selectedFloor]);

  // Group rooms by type
  const roomsByType = useMemo(() => {
    const groups: Record<string, CampusRoom[]> = {};
    for (const room of floorRooms) {
      const type = room.type || "default";
      if (!groups[type]) groups[type] = [];
      groups[type].push(room);
    }
    return groups;
  }, [floorRooms]);

  if (!building) return null;

  const buildingColor = BUILDING_TYPE_COLORS[building.type] || "#0066CC";
  const totalRooms = building.rooms.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-muted" />
        </div>

        {/* Building color stripe */}
        <div 
          className="h-1 w-full" 
          style={{ backgroundColor: buildingColor }} 
        />

        <SheetHeader className="px-6 pt-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-bold text-foreground">
                  {building.name}
                </SheetTitle>
                <Badge 
                  style={{ backgroundColor: buildingColor }} 
                  className="text-white text-xs"
                >
                  #{building.number}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span className="capitalize">{building.type}</span>
                <span>·</span>
                <span>{building.floors} {building.floors === 1 ? "floor" : "floors"}</span>
                <span>·</span>
                <span>{totalRooms} {totalRooms === 1 ? "room" : "rooms"}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 -mr-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Floor tabs */}
        <div className="px-6 py-3 border-b">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {floors.map(floor => (
              <Button
                key={floor}
                variant={selectedFloor === floor ? "default" : "outline"}
                size="sm"
                className={`shrink-0 rounded-full px-4 ${
                  selectedFloor === floor 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background border-primary text-primary hover:bg-primary/10"
                }`}
                onClick={() => setSelectedFloor(floor)}
              >
                Floor {floor}
              </Button>
            ))}
          </div>
        </div>

        {/* Room list */}
        <ScrollArea className="h-[calc(85vh-200px)]">
          <div className="px-6 py-4 space-y-6">
            {Object.entries(roomsByType).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No rooms on this floor</p>
              </div>
            ) : (
              Object.entries(roomsByType).map(([type, rooms]) => {
                const config = ROOM_TYPE_CONFIG[type as RoomType] || ROOM_TYPE_CONFIG.default;
                const Icon = config.icon;

                return (
                  <div key={type}>
                    {/* Section header */}
                    <div 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg mb-2"
                      style={{ backgroundColor: "#F5F8FC" }}
                    >
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: config.color }} 
                      />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {config.label}s
                      </span>
                      <Badge variant="secondary" className="ml-auto text-xs h-5">
                        {rooms.length}
                      </Badge>
                    </div>

                    {/* Room rows */}
                    <div className="space-y-1">
                      {rooms.map(room => (
                        <button
                          key={room.id}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                          onClick={() => onSelectRoom(room)}
                        >
                          {/* Room type dot */}
                          <div 
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: config.color }}
                          />
                          
                          {/* Room info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {room.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Room {room.num}</span>
                              <span>·</span>
                              <span>Floor {room.floor}</span>
                              {room.capacity && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-0.5">
                                    <Users className="h-3 w-3" />
                                    {room.capacity}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Chevron */}
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

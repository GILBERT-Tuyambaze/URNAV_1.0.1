"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Clock, Star, Building2, MapPin, Navigation, FlaskConical, Users, BookOpen, DoorOpen, Layers, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_BUILDINGS, getBuildingColors, getRoomColors, type CampusBuilding, type CampusRoom } from "@/lib/campus-data";

interface SearchScreenProps {
  onBack: () => void;
  onBuildingSelect: (building: CampusBuilding) => void;
  onRoomSelect?: (room: CampusRoom, building: CampusBuilding) => void;
}

type ViewMode = 'search' | 'building-rooms';

// Get room type icon
function getRoomIcon(type: string) {
  switch (type) {
    case 'lab': return <FlaskConical className="w-3.5 h-3.5" />;
    case 'lecture': return <BookOpen className="w-3.5 h-3.5" />;
    case 'office': return <DoorOpen className="w-3.5 h-3.5" />;
    case 'common': return <Users className="w-3.5 h-3.5" />;
    default: return <MapPin className="w-3.5 h-3.5" />;
  }
}

// Unified search result type
interface SearchResult {
  type: 'building' | 'room';
  building: CampusBuilding;
  room?: CampusRoom;
  matchScore: number;
}

// Search buildings and rooms
function searchAll(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const building of ALL_BUILDINGS) {
    // Check building match
    const buildingMatch =
      building.name.toLowerCase().includes(q) ||
      building.shortName.toLowerCase().includes(q) ||
      building.type.toLowerCase().includes(q) ||
      building.number.toString() === q;

    if (buildingMatch) {
      results.push({
        type: 'building',
        building,
        matchScore: building.name.toLowerCase().startsWith(q) ? 100 : 50,
      });
    }

    // Check room matches within building
    for (const room of building.rooms) {
      const roomMatch =
        room.name.toLowerCase().includes(q) ||
        room.num.toLowerCase().includes(q) ||
        room.type.toLowerCase().includes(q);

      if (roomMatch) {
        results.push({
          type: 'room',
          building,
          room,
          matchScore: room.name.toLowerCase().startsWith(q) ? 90 : 40,
        });
      }
    }
  }

  // Sort by match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function SearchScreen({ onBack, onBuildingSelect, onRoomSelect }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'buildings' | 'rooms'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const allResults = searchAll(query);
    
    if (activeTab === 'buildings') {
      return allResults.filter(r => r.type === 'building');
    }
    if (activeTab === 'rooms') {
      return allResults.filter(r => r.type === 'room');
    }
    return allResults;
  }, [query, activeTab]);

  // Get floors for selected building
  const buildingFloors = useMemo(() => {
    if (!selectedBuilding) return [];
    const floors = new Set<number>();
    selectedBuilding.rooms.forEach(r => floors.add(r.floor));
    return Array.from(floors).sort((a, b) => a - b);
  }, [selectedBuilding]);

  // Get rooms for selected floor
  const floorRooms = useMemo(() => {
    if (!selectedBuilding) return [];
    if (selectedFloor === null) return selectedBuilding.rooms;
    return selectedBuilding.rooms.filter(r => r.floor === selectedFloor);
  }, [selectedBuilding, selectedFloor]);

  const popularBuildings = ALL_BUILDINGS.filter((b) =>
    ["b24", "b07", "b16", "b19", "b18"].includes(b.id)
  );

  // Handle building tap - show rooms view
  const handleBuildingTap = (building: CampusBuilding) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setViewMode('building-rooms');
  };

  // Handle room selection
  const handleRoomTap = (room: CampusRoom) => {
    if (selectedBuilding && onRoomSelect) {
      onRoomSelect(room, selectedBuilding);
    }
  };

  // Handle back from building rooms view
  const handleBackFromRooms = () => {
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setViewMode('search');
  };

  // Count results by type
  const allResultsCount = useMemo(() => searchAll(query).length, [query]);
  const buildingResultsCount = useMemo(() => searchAll(query).filter(r => r.type === 'building').length, [query]);
  const roomResultsCount = useMemo(() => searchAll(query).filter(r => r.type === 'room').length, [query]);

  // Building Rooms View
  if (viewMode === 'building-rooms' && selectedBuilding) {
    const colors = getBuildingColors(selectedBuilding.type);
    
    return (
      <div className="h-full flex flex-col bg-[#F5F8FC]">
        {/* Header */}
        <header className="bg-white border-b border-[#D0E4F7] shrink-0">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackFromRooms}
              className="h-10 w-10 shrink-0 bg-[#0066CC] text-white hover:bg-[#004499] rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[#002255] truncate">{selectedBuilding.name}</h1>
              <p className="text-xs text-[#4466AA]">{selectedBuilding.rooms.length} rooms - {selectedBuilding.floors} floors</p>
            </div>
          </div>

          {/* Floor tabs */}
          {buildingFloors.length > 1 && (
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
              <button
                onClick={() => setSelectedFloor(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedFloor === null
                    ? 'bg-[#0066CC] text-white'
                    : 'bg-[#E8F3FF] text-[#0066CC]'
                }`}
              >
                All Floors
              </button>
              {buildingFloors.map((floor) => (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedFloor === floor
                      ? 'bg-[#0066CC] text-white'
                      : 'bg-[#E8F3FF] text-[#0066CC]'
                  }`}
                >
                  Floor {floor}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-[#4466AA] mb-3">
            Select a room to navigate to
          </p>
          
          <div className="space-y-2">
            {floorRooms.map((room) => {
              const roomColors = getRoomColors(room.type);
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomTap(room)}
                  className="w-full bg-white border border-[#D0E4F7] rounded-xl p-4 text-left hover:border-[#0066CC] hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: roomColors.fill, borderColor: roomColors.stroke }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold" style={{ color: roomColors.stroke }}>{room.num}</span>
                        <span style={{ color: roomColors.stroke }}>{getRoomIcon(room.type)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#002255] truncate">{room.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[#4466AA]">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          Floor {room.floor}
                        </span>
                        <span className="capitalize text-[#8899BB]">{room.type}</span>
                        {room.capacity && (
                          <span className="flex items-center gap-1 text-[#8899BB]">
                            <Users className="w-3 h-3" />
                            {room.capacity}
                          </span>
                        )}
                      </div>
                    </div>
                    <Navigation className="w-5 h-5 text-[#0066CC] shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Main Search View
  return (
    <div className="h-full flex flex-col bg-[#F5F8FC]">
      {/* Header with search */}
      <header className="bg-white border-b border-[#D0E4F7] shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 shrink-0 bg-[#0066CC] text-white hover:bg-[#004499] rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8899BB]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buildings, rooms, labs..."
              autoFocus
              className="w-full h-12 bg-white border-2 border-[#0066CC] rounded-xl pl-10 pr-4 text-[#002255] placeholder:text-[#8899BB] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
            />
          </div>
        </div>

        {/* Search tabs - only show when there's a query */}
        {query.trim() && (
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-[#E8F3FF] text-[#0066CC]'
              }`}
            >
              All ({allResultsCount})
            </button>
            <button
              onClick={() => setActiveTab('buildings')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'buildings'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-[#E8F3FF] text-[#0066CC]'
              }`}
            >
              Buildings ({buildingResultsCount})
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'rooms'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-[#E8F3FF] text-[#0066CC]'
              }`}
            >
              Rooms ({roomResultsCount})
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          // Search Results
          <div className="p-4">
            <p className="text-sm text-[#4466AA] mb-3">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            <div className="space-y-2">
              {results.map((result) => {
                if (result.type === 'building') {
                  const colors = getBuildingColors(result.building.type);
                  return (
                    <button
                      key={`building-${result.building.id}`}
                      onClick={() => handleBuildingTap(result.building)}
                      className="w-full bg-white border border-[#D0E4F7] rounded-xl p-4 text-left hover:border-[#0066CC] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border-2"
                          style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
                        >
                          <span className="text-lg font-bold" style={{ color: colors.stroke }}>{result.building.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#002255] truncate">{result.building.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-[#4466AA]">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {result.building.floors} floors
                            </span>
                            <span className="text-[#8899BB]">{result.building.rooms.length} rooms</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#0066CC] shrink-0" />
                      </div>
                    </button>
                  );
                } else if (result.room) {
                  const buildingColors = getBuildingColors(result.building.type);
                  const roomColors = getRoomColors(result.room.type);
                  return (
                    <button
                      key={`room-${result.building.id}-${result.room.id}`}
                      onClick={() => {
                        if (onRoomSelect) {
                          onRoomSelect(result.room!, result.building);
                        }
                      }}
                      className="w-full bg-white border border-[#D0E4F7] rounded-xl p-4 text-left hover:border-[#0066CC] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ backgroundColor: roomColors.fill, borderColor: roomColors.stroke }}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold" style={{ color: roomColors.stroke }}>{result.room.num}</span>
                            <span style={{ color: roomColors.stroke }}>{getRoomIcon(result.room.type)}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#002255] truncate">{result.room.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-[#4466AA]">
                            <span 
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ backgroundColor: buildingColors.fill, color: buildingColors.stroke }}
                            >
                              {result.building.shortName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Floor {result.room.floor}
                            </span>
                          </div>
                        </div>
                        <Navigation className="w-5 h-5 text-[#0066CC] shrink-0" />
                      </div>
                    </button>
                  );
                }
                return null;
              })}
              {results.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-[#D0E4F7] mx-auto mb-4" />
                  <p className="text-[#002255]">No results found</p>
                  <p className="text-sm text-[#8899BB] mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Default state with building selection
          <div className="p-4 space-y-6">
            {/* How it works */}
            <section className="bg-[#E8F3FF] rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#0066CC] mb-2">How Indoor Navigation Works</h2>
              <ol className="text-xs text-[#4466AA] space-y-1">
                <li>1. Select a building below or search for one</li>
                <li>2. Choose the specific room you want to navigate to</li>
                <li>3. Get turn-by-turn directions inside the building</li>
              </ol>
            </section>

            {/* Popular Buildings */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#F5A800]" />
                <h2 className="text-sm font-medium text-[#4466AA]">Popular Buildings</h2>
              </div>
              <div className="space-y-2">
                {popularBuildings.map((building) => {
                  const colors = getBuildingColors(building.type);
                  return (
                    <button
                      key={building.id}
                      onClick={() => handleBuildingTap(building)}
                      className="w-full bg-white border border-[#D0E4F7] rounded-xl p-4 text-left hover:border-[#0066CC] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border-2"
                          style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
                        >
                          <span className="text-lg font-bold" style={{ color: colors.stroke }}>{building.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#002255] truncate">{building.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-[#4466AA]">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {building.floors} floors
                            </span>
                            <span className="flex items-center gap-1">
                              <DoorOpen className="w-3 h-3" />
                              {building.rooms.length} rooms
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#0066CC] shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* All Buildings */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[#4466AA]" />
                <h2 className="text-sm font-medium text-[#4466AA]">All Buildings ({ALL_BUILDINGS.length})</h2>
              </div>
              <div className="space-y-2">
                {ALL_BUILDINGS.filter(b => !popularBuildings.includes(b)).slice(0, 10).map((building) => {
                  const colors = getBuildingColors(building.type);
                  return (
                    <button
                      key={building.id}
                      onClick={() => handleBuildingTap(building)}
                      className="w-full bg-white border border-[#D0E4F7] rounded-xl p-3 text-left hover:border-[#0066CC] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ backgroundColor: colors.fill, borderColor: colors.stroke }}
                        >
                          <span className="text-sm font-bold" style={{ color: colors.stroke }}>{building.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#002255] truncate text-sm">{building.name}</p>
                          <p className="text-xs text-[#8899BB]">{building.rooms.length} rooms</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8899BB] shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="pt-4 border-t border-[#D0E4F7]">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#E8F3FF] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-[#0066CC]">{ALL_BUILDINGS.length}</p>
                  <p className="text-xs text-[#4466AA]">Buildings</p>
                </div>
                <div className="bg-[#DCF0E8] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-[#00883A]">
                    {ALL_BUILDINGS.reduce((acc, b) => acc + b.rooms.length, 0)}
                  </p>
                  <p className="text-xs text-[#00883A]">Rooms</p>
                </div>
                <div className="bg-[#EEE8FF] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-[#6633BB]">
                    {ALL_BUILDINGS.reduce((acc, b) => acc + b.floors, 0)}
                  </p>
                  <p className="text-xs text-[#6633BB]">Total Floors</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

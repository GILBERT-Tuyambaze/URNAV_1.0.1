'use client';

import { useState, useMemo } from 'react';
import { Search, Building2, DoorOpen, ChevronRight, MapPin, Users, FlaskConical, GraduationCap, Briefcase, Coffee, Bed, Server, Wrench } from 'lucide-react';
import { getAllBuildingsWithRooms, searchRoomsGlobally, INDOOR_DEMO_ROUTES } from '@/lib/indoor-navigation';
import { CampusBuilding, CampusRoom, RoomType } from '@/lib/campus-data';

interface RoomSelectorProps {
  onSelectRoom: (building: CampusBuilding, room: CampusRoom) => void;
  onSelectDemoRoute: (routeId: string) => void;
  onClose?: () => void;
}

const ROOM_TYPE_ICONS: Record<RoomType, React.ReactNode> = {
  lab: <FlaskConical className="w-4 h-4" />,
  lecture: <GraduationCap className="w-4 h-4" />,
  office: <Briefcase className="w-4 h-4" />,
  toilet: <DoorOpen className="w-4 h-4" />,
  common: <Coffee className="w-4 h-4" />,
  hostel: <Bed className="w-4 h-4" />,
  server: <Server className="w-4 h-4" />,
  facility: <Wrench className="w-4 h-4" />,
  default: <DoorOpen className="w-4 h-4" />
};

const ROOM_TYPE_COLORS: Record<RoomType, string> = {
  lab: 'bg-blue-100 text-blue-700',
  lecture: 'bg-purple-100 text-purple-700',
  office: 'bg-amber-100 text-amber-700',
  toilet: 'bg-gray-100 text-gray-600',
  common: 'bg-green-100 text-green-700',
  hostel: 'bg-teal-100 text-teal-700',
  server: 'bg-red-100 text-red-700',
  facility: 'bg-orange-100 text-orange-700',
  default: 'bg-slate-100 text-slate-700'
};

export function RoomSelector({ onSelectRoom, onSelectDemoRoute, onClose }: RoomSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'browse' | 'demo'>('demo');
  
  const buildingsWithRooms = useMemo(() => getAllBuildingsWithRooms(), []);
  
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return searchRoomsGlobally(searchQuery).slice(0, 20);
  }, [searchQuery]);
  
  const handleRoomSelect = (building: CampusBuilding, room: CampusRoom) => {
    onSelectRoom(building, room);
  };
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Select Destination</h2>
        <p className="text-sm text-slate-500">Choose a room to navigate to</p>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-4">
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'demo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Demo Routes
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'search'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Search
        </button>
        <button
          onClick={() => { setActiveTab('browse'); setSelectedBuilding(null); }}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'browse'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Demo Routes Tab */}
        {activeTab === 'demo' && (
          <div className="p-4 space-y-2">
            <p className="text-xs text-slate-500 mb-3">
              Pre-configured routes demonstrating indoor navigation with A* pathfinding
            </p>
            {INDOOR_DEMO_ROUTES.map((route) => (
              <button
                key={route.id}
                onClick={() => onSelectDemoRoute(route.id)}
                className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-200 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {route.id.split('_')[1]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{route.label}</div>
                    <div className="text-xs text-slate-500">{route.description}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms, labs, offices..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            {searchQuery.length < 2 ? (
              <div className="text-center py-8 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Type at least 2 characters to search</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No rooms found for &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(({ room, building }) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomSelect(building, room)}
                    className="w-full p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ROOM_TYPE_COLORS[room.type]}`}>
                        {ROOM_TYPE_ICONS[room.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 truncate">{room.name}</span>
                          <span className="text-xs text-slate-400 shrink-0">#{room.num}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate">{building.shortName}</span>
                          <span className="text-slate-300">|</span>
                          <span>Floor {room.floor}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="p-4">
            {!selectedBuilding ? (
              // Building List
              <div className="space-y-2">
                <p className="text-xs text-slate-500 mb-3">
                  Select a building to see its rooms
                </p>
                {buildingsWithRooms.map(({ building, rooms }) => (
                  <button
                    key={building.id}
                    onClick={() => setSelectedBuilding(building)}
                    className="w-full p-3 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{building.shortName}</div>
                        <div className="text-xs text-slate-500">
                          {rooms.length} rooms | {building.floors} floor{building.floors > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-slate-400">#{building.number}</div>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // Room List for Selected Building
              <div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span className="text-sm font-medium">Back to Buildings</span>
                </button>
                
                <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{selectedBuilding.name}</div>
                    <div className="text-xs text-slate-500">
                      {selectedBuilding.rooms.length} rooms | {selectedBuilding.floors} floors
                    </div>
                  </div>
                </div>
                
                {/* Group rooms by floor */}
                {Array.from({ length: selectedBuilding.floors }, (_, i) => i + 1).map(floor => {
                  const floorRooms = selectedBuilding.rooms.filter(r => r.floor === floor);
                  if (floorRooms.length === 0) return null;
                  
                  return (
                    <div key={floor} className="mb-4">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Floor {floor}
                      </div>
                      <div className="space-y-1.5">
                        {floorRooms.map(room => (
                          <button
                            key={room.id}
                            onClick={() => handleRoomSelect(selectedBuilding, room)}
                            className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 rounded-lg border border-slate-200 hover:border-blue-300 text-left transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded flex items-center justify-center ${ROOM_TYPE_COLORS[room.type]}`}>
                                {ROOM_TYPE_ICONS[room.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-700 truncate">{room.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                  {room.num}
                                </span>
                                {room.capacity && (
                                  <span className="flex items-center gap-0.5 text-xs text-slate-400">
                                    <Users className="w-3 h-3" />
                                    {room.capacity}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with hint */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span>Indoor navigation uses A* pathfinding with turn-by-turn directions</span>
        </div>
      </div>
    </div>
  );
}

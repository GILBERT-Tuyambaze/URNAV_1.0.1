"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Clock, Star, Building2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_BUILDINGS, getBuildingColors, type CampusBuilding } from "@/lib/campus-data";

interface SearchScreenProps {
  onBack: () => void;
  onBuildingSelect: (building: CampusBuilding) => void;
}

// Search buildings
function searchBuildings(query: string): CampusBuilding[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_BUILDINGS.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.shortName.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.number.toString() === q
  );
}

export function SearchScreen({ onBack, onBuildingSelect }: SearchScreenProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchBuildings(query);
  }, [query]);

  const recentSearches = ALL_BUILDINGS.slice(0, 3);
  const popularBuildings = ALL_BUILDINGS.filter((b) =>
    ["b24", "b07", "b16", "b19"].includes(b.id)
  );

  return (
    <div className="h-full flex flex-col bg-[#0a1a0a]">
      {/* Header with search */}
      <header className="bg-[#111d2e] border-b border-[#1e3a5c] shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-10 w-10 shrink-0 bg-[#f97316] text-white hover:bg-[#ea580c]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buildings, offices, labs..."
              autoFocus
              className="w-full h-12 bg-[#1a2f4a] border border-[#1e3a5c] rounded-lg px-4 text-white placeholder:text-[#4a6a8a] focus:outline-none focus:ring-2 focus:ring-[#c84bff]/50"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {query.trim() ? (
          // Search Results
          <div className="p-4">
            <p className="text-sm text-[#4a6a8a] mb-3">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
            <div className="space-y-2">
              {results.map((building) => {
                const colors = getBuildingColors(building.type);
                return (
                  <button
                    key={building.id}
                    onClick={() => onBuildingSelect(building)}
                    className="w-full bg-[#111d2e] border border-[#1e3a5c] rounded-lg p-4 text-left hover:border-[#c84bff]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colors.fill, borderColor: colors.stroke, borderWidth: 2 }}
                      >
                        <span className="text-lg font-bold text-white">{building.number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{building.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-[#8ab4d4]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {building.floors} floors
                          </span>
                          <span className="capitalize">{building.type}</span>
                        </div>
                      </div>
                      <Navigation className="w-5 h-5 text-[#4a6a8a] shrink-0" />
                    </div>
                  </button>
                );
              })}
              {results.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-[#4a6a8a]/50 mx-auto mb-4" />
                  <p className="text-[#8ab4d4]">No buildings found</p>
                  <p className="text-sm text-[#4a6a8a] mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Default state with suggestions
          <div className="p-4 space-y-6">
            {/* Recent Searches */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#4a6a8a]" />
                <h2 className="text-sm font-medium text-[#4a6a8a]">Recent</h2>
              </div>
              <div className="space-y-2">
                {recentSearches.map((building) => {
                  const colors = getBuildingColors(building.type);
                  return (
                    <button
                      key={building.id}
                      onClick={() => onBuildingSelect(building)}
                      className="w-full bg-[#111d2e] border border-[#1e3a5c] rounded-lg p-3 text-left hover:border-[#c84bff]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: colors.fill, borderColor: colors.stroke, borderWidth: 1 }}
                        >
                          <span className="text-sm font-semibold text-white">{building.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate text-sm">{building.name}</p>
                          <p className="text-xs text-[#4a6a8a]">{building.floors} floors</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Popular Destinations */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#f97316]" />
                <h2 className="text-sm font-medium text-[#4a6a8a]">Popular Destinations</h2>
              </div>
              <div className="space-y-2">
                {popularBuildings.map((building) => {
                  const colors = getBuildingColors(building.type);
                  return (
                    <button
                      key={building.id}
                      onClick={() => onBuildingSelect(building)}
                      className="w-full bg-[#111d2e] border border-[#1e3a5c] rounded-lg p-3 text-left hover:border-[#c84bff]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: colors.fill, borderColor: colors.stroke, borderWidth: 1 }}
                        >
                          <span className="text-sm font-bold text-white">{building.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate text-sm">{building.name}</p>
                          <p className="text-xs text-[#8ab4d4] capitalize">{building.type}</p>
                        </div>
                        <Navigation className="w-4 h-4 text-[#4a6a8a] shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Browse by Type */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[#4a6a8a]" />
                <h2 className="text-sm font-medium text-[#4a6a8a]">Browse by Type</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["academic", "admin", "hostel"] as const).map((type) => {
                  const colors = getBuildingColors(type);
                  return (
                    <Button
                      key={type}
                      variant="outline"
                      onClick={() => setQuery(type)}
                      className="h-14 flex flex-col items-center justify-center bg-[#1a2f4a] border-[#1e3a5c] hover:border-[#c84bff]/50"
                      style={{ borderLeftColor: colors.stroke, borderLeftWidth: 3 }}
                    >
                      <span className="text-sm font-medium text-white capitalize">{type}</span>
                      <span className="text-xs text-[#4a6a8a]">
                        {ALL_BUILDINGS.filter((b) => b.type === type).length} buildings
                      </span>
                    </Button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

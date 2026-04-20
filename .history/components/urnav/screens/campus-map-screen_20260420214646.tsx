'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { CampusMapCanvas } from '@/components/urnav/components/campus-map-canvas';
import { BottomSheet } from '@/components/urnav/components/bottom-sheet';
import { ALL_BUILDINGS, CampusRoom } from '@/lib/campus-data';
import type { MapView } from '@/lib/map-transform';

export function CampusMapScreen() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [view, setView] = useState<MapView>({ panX: 0, panY: 0, scale: 0.5, rotation: 0 });
  const [selectedRoute, setSelectedRoute] = useState<{ points: { mx: number; my: number }[] } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const selectedBuilding = selectedBuildingId ? ALL_BUILDINGS.find(b => b.id === selectedBuildingId) : null;
  const selectedRoom = selectedRoomId
    ? ALL_BUILDINGS.flatMap(b => b.rooms).find(r => r.id === selectedRoomId)
    : null;

  const handleBuildingTap = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setSelectedRoomId(null);
    setCurrentFloor(1);
  }, []);

  const handleRoomTap = useCallback((room: CampusRoom) => {
    setSelectedRoomId(room.id);
  }, []);

  const handleNavigate = useCallback((destination: CampusRoom) => {
    // Generate dummy route path
    const mockRoute = {
      points: [
        { mx: 270, my: 72 },
        { mx: 290, my: 72 },
        { mx: 310, my: 72 },
        { mx: 320, my: 72 },
      ],
    };
    setSelectedRoute(mockRoute);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedBuildingId(null);
    setSelectedRoomId(null);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Map canvas */}
      <CampusMapCanvas
        width={dimensions.width}
        height={dimensions.height}
        onBuildingTap={handleBuildingTap}
        selectedBuildingId={selectedBuildingId}
        selectedRoute={selectedRoute}
        onViewChange={setView}
      />

      {/* Bottom sheet */}
      <BottomSheet
        isOpen={!!selectedBuildingId}
        onClose={handleCloseSheet}
        selectedBuilding={selectedBuilding}
        selectedRoom={selectedRoom}
        onNavigate={handleNavigate}
        currentFloor={currentFloor}
        onFloorChange={setCurrentFloor}
      />
    </div>
  );
}

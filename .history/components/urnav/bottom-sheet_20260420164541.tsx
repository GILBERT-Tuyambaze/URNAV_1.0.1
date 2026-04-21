'use client';

import React, { useRef, useState, useEffect } from 'react';
import { CampusBuilding, CampusRoom } from '@/lib/campus-data';
import { X, MapPin, Users, Navigation } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBuilding?: CampusBuilding;
  selectedRoom?: CampusRoom;
  onNavigate?: (destination: CampusRoom) => void;
  currentFloor?: number;
  onFloorChange?: (floor: number) => void;
}

const SNAP_POINTS = {
  peek: 32,
  half: 0.45,
  full: 0.92,
};

export function BottomSheet({
  isOpen,
  onClose,
  selectedBuilding,
  selectedRoom,
  onNavigate,
  currentFloor,
  onFloorChange,
}: BottomSheetProps) {
  const [height, setHeight] = useState(SNAP_POINTS.peek);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  if (!isOpen || (!selectedBuilding && !selectedRoom)) return null;

  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const peekHeight = SNAP_POINTS.peek;
  const halfHeight = screenHeight * SNAP_POINTS.half;
  const fullHeight = screenHeight * SNAP_POINTS.full;

  const handleMouseDown = (e: React.MouseEvent) => {
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startYRef.current === 0) return;
    const delta = startYRef.current - e.clientY;
    const newHeight = Math.max(peekHeight, startHeightRef.current + delta);
    setHeight(Math.min(fullHeight, newHeight));
  };

  const handleMouseUp = () => {
    const threshold = 50;
    if (height > fullHeight - threshold) {
      setHeight(fullHeight);
    } else if (height > halfHeight + threshold) {
      setHeight(fullHeight);
    } else if (height > peekHeight + threshold) {
      setHeight(halfHeight);
    } else {
      setHeight(peekHeight);
    }
    startYRef.current = 0;
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* Backdrop */}
      {height > peekHeight + 100 && (
        <div
          className="absolute inset-0 bg-black transition-opacity"
          style={{ opacity: (height / fullHeight) * 0.3 }}
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          height: `${height}px`,
          transition: startYRef.current === 0 ? 'height 0.3s ease-out' : 'none',
        }}
      >
        {/* Handle */}
        <div
          className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-1 bg-blue-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {selectedBuilding && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedBuilding.color || '#0066CC' }}
                />
              )}
              <h2 className="text-lg font-bold text-navy-900">
                {selectedRoom ? selectedRoom.name : selectedBuilding?.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {selectedRoom && (
            <p className="text-sm text-gray-600">
              {selectedBuilding?.short} • Floor {selectedRoom.floor} • Room {selectedRoom.num}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {selectedRoom ? (
            // Room detail view
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                  {selectedRoom.type}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedBuilding?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xs text-gray-600">Floor</div>
                  <p className="text-sm font-medium text-gray-900">{selectedRoom.floor}</p>
                </div>

                {selectedRoom.capacity && (
                  <div className="flex items-start gap-3">
                    <Users size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Capacity</p>
                      <p className="text-sm font-medium text-gray-900">{selectedRoom.capacity} people</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : selectedBuilding ? (
            // Building view with floor tabs and room grid
            <div className="space-y-4">
              {/* Floor tabs */}
              <div className="flex gap-2 flex-wrap">
                {selectedBuilding.floors.map((floor) => (
                  <button
                    key={floor}
                    onClick={() => onFloorChange?.(floor)}
                    className={`w-10 h-10 rounded-lg font-semibold transition ${
                      currentFloor === floor
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>

              {/* Room grid */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  {selectedBuilding.rooms.length} rooms
                </p>
                {selectedBuilding.rooms
                  .filter((r) => r.floor === currentFloor)
                  .map((room) => (
                    <button
                      key={room.id}
                      onClick={() => onNavigate?.(room)}
                      className="w-full p-3 rounded-lg border border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              room.type === 'lab'
                                ? '#0066CC'
                                : room.type === 'lecture'
                                  ? '#6633BB'
                                  : room.type === 'office'
                                    ? '#00883A'
                                    : '#F5A800',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {room.name}
                          </p>
                          <p className="text-xs text-gray-600">Room {room.num}</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600">›</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer - Navigate button */}
        {selectedRoom && (
          <div className="px-4 py-3 border-t border-blue-100">
            <button
              onClick={() => onNavigate?.(selectedRoom)}
              className="w-full h-12 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <Navigation size={18} />
              Navigate to {selectedRoom.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Changes: Complete bottom sheet component with snap points (peek/half/full), room grid, floor tabs, and navigate button

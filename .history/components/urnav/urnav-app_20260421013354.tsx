"use client";

import { useState, useCallback } from "react";
import { SplashScreen } from "@/components/urnav/screens/splash-screen";
import { HomeScreen } from "@/components/urnav/screens/home-screen";
import { SearchScreen } from "@/components/urnav/screens/search-screen";
import { NavigatingScreen } from "@/components/urnav/screens/navigating-screen";
import { ArrivalScreen } from "@/components/urnav/screens/arrival-screen";
import { ALL_BUILDINGS, type CampusBuilding, type CampusRoom } from "@/lib/campus-data";

type Screen = "splash" | "home" | "search" | "navigating" | "arrival";

export function URNAVApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<CampusRoom | null>(null);

  const handleSplashComplete = useCallback(() => {
    setCurrentScreen("home");
  }, []);

  const handleSearchFocus = useCallback(() => {
    setCurrentScreen("search");
  }, []);

  const handleSearchBack = useCallback(() => {
    setCurrentScreen("home");
  }, []);

  const handleBuildingSelect = useCallback((building: CampusBuilding) => {
    setSelectedBuilding(building);
    setSelectedRoom(null);
    setCurrentScreen("navigating");
  }, []);

  const handleRoomSelect = useCallback((room: CampusRoom, building: CampusBuilding) => {
    setSelectedBuilding(building);
    setSelectedRoom(room);
    setCurrentScreen("navigating");
  }, []);

  const handleNavigationCancel = useCallback(() => {
    setSelectedBuilding(null);
    setCurrentScreen("home");
  }, []);

  const handleArrival = useCallback(() => {
    setCurrentScreen("arrival");
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedBuilding(null);
    setSelectedRoom(null);
    setCurrentScreen("home");
  }, []);

  const handleSearchAnother = useCallback(() => {
    setSelectedBuilding(null);
    setSelectedRoom(null);
    setCurrentScreen("search");
  }, []);

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[#F5F8FC] overflow-hidden relative">
      {/* Mobile device frame */}
      <div className="h-full w-full flex flex-col">
        {/* Status bar mockup */}
        <div className="h-11 bg-[#004499] flex items-center justify-between px-6 shrink-0">
          <span className="text-xs font-medium text-white">9:100</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              <div className="w-1 h-2 bg-white rounded-sm" />
              <div className="w-1 h-2.5 bg-white rounded-sm" />
              <div className="w-1 h-3 bg-white rounded-sm" />
              <div className="w-1 h-3.5 bg-white rounded-sm" />
            </div>
            <span className="text-xs font-medium text-white ml-1">5G</span>
            <div className="w-6 h-3 bg-white rounded-sm ml-2 relative">
              <div className="absolute right-0.5 top-0.5 bottom-0.5 w-0.5 bg-[#004499] rounded-sm" />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div className="flex-1 min-h-0">
          {currentScreen === "splash" && (
            <SplashScreen onComplete={handleSplashComplete} />
          )}

          {currentScreen === "home" && (
            <HomeScreen
              onSearchFocus={handleSearchFocus}
              onBuildingSelect={handleBuildingSelect}
            />
          )}

          {currentScreen === "search" && (
            <SearchScreen
              onBack={handleSearchBack}
              onBuildingSelect={handleBuildingSelect}
              onRoomSelect={handleRoomSelect}
            />
          )}

          {currentScreen === "navigating" && selectedBuilding && (
            <NavigatingScreen
              destinationBuildingId={selectedBuilding.id}
              destinationRoomId={selectedRoom?.id}
              onCancel={handleNavigationCancel}
              onArrival={handleArrival}
            />
          )}

          {currentScreen === "arrival" && selectedBuilding && (
            <ArrivalScreen
              destinationName={selectedRoom ? selectedRoom.name : selectedBuilding.name}
              destinationFloor={selectedRoom ? selectedRoom.floor : 1}
              buildingName={selectedBuilding.shortName}
              onGoHome={handleGoHome}
              onSearchAnother={handleSearchAnother}
            />
          )}
        </div>
      </div>
    </div>
  );
}

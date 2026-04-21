"use client";

import { useEffect } from "react";
import { CheckCircle2, Home, Search, Share2, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArrivalScreenProps {
  destinationName: string;
  destinationFloor: number;
  buildingName?: string;
  onGoHome: () => void;
  onSearchAnother: () => void;
}

export function ArrivalScreen({ destinationName, destinationFloor, buildingName, onGoHome, onSearchAnother }: ArrivalScreenProps) {
  // Play arrival sound effect
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`You have arrived at ${destinationName}`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [destinationName]);

  return (
    <div className="h-full flex flex-col bg-[#F5F8FC]">
      {/* Success Animation Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Success icon with animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-[#00883A]/10 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-[#00883A]/20 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-16 h-16 text-[#00883A]" />
            </div>
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#0066CC] rounded-full animate-bounce" />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-[#00883A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-1/2 -right-4 w-2 h-2 bg-[#6633BB] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Arrival message */}
        <h1 className="text-3xl font-bold text-[#002255] mb-2 text-center text-balance">
          You have arrived!
        </h1>
        <p className="text-[#4466AA] text-center mb-8">
          Your destination is right here
        </p>

        {/* Destination Card */}
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#D0E4F7] p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#E8F3FF] border-2 border-[#0066CC] flex items-center justify-center shrink-0">
              <MapPin className="w-8 h-8 text-[#0066CC]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-[#002255]">{destinationName}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-[#4466AA]">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {buildingName || 'UR Nyarugenge'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Floor {destinationFloor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="shrink-0 p-6 space-y-3 bg-white border-t border-[#D0E4F7] rounded-t-[20px] shadow-[0_-4px_16px_rgba(0,34,85,0.08)]">
        <Button
          onClick={onSearchAnother}
          className="w-full h-14 text-base bg-[#0066CC] hover:bg-[#004499] text-white rounded-xl"
        >
          <Search className="h-5 w-5 mr-2" />
          Find Another Location
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onGoHome}
            className="flex-1 h-12 rounded-xl border-[#D0E4F7] text-[#0066CC] hover:bg-[#0066CC]"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl border-[#D0E4F7] text-[#0066CC] hover:bg-[#0066CC]"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'URNAV Navigation',
                  text: `I found ${destinationName} using URNAV!`,
                });
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

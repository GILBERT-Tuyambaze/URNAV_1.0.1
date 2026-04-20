"use client";

import { useEffect } from "react";
import { CheckCircle2, Home, Search, Share2, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/urnav-data";

interface ArrivalScreenProps {
  destination: Room;
  onGoHome: () => void;
  onSearchAnother: () => void;
}

export function ArrivalScreen({ destination, onGoHome, onSearchAnother }: ArrivalScreenProps) {
  // Play arrival sound effect
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`You have arrived at ${destination.name}`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [destination.name]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Success Animation Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Success icon with animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
          </div>
          {/* Decorative dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-bounce" />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="absolute top-1/2 -right-4 w-2 h-2 bg-chart-4 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Arrival message */}
        <h1 className="text-3xl font-bold text-foreground mb-2 text-center text-balance">
          You have arrived!
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Your destination is right here
        </p>

        {/* Destination Card */}
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">{destination.number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground">{destination.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {destination.building}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Floor {destination.floor}
                </span>
              </div>
              {destination.description && (
                <p className="text-sm text-muted-foreground mt-2">{destination.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="shrink-0 p-6 space-y-3 bg-card border-t border-border">
        <Button
          onClick={onSearchAnother}
          className="w-full h-14 text-base"
        >
          <Search className="h-5 w-5 mr-2" />
          Find Another Room
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onGoHome}
            className="flex-1 h-12"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'URNAV Navigation',
                  text: `I found ${destination.name} using URNAV!`,
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

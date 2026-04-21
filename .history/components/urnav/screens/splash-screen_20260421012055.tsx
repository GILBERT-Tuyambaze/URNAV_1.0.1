"use client";

import { useEffect, useState } from "react";
import { MapPin, Wifi, Navigation } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    const steps = [
      { progress: 30, text: "Loading floor plans..." },
      { progress: 60, text: "Connecting to Wi-Fi positioning..." },
      { progress: 90, text: "Preparing navigation..." },
      { progress: 100, text: "Ready!" },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setLoadingText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0066CC] via-[#004499] to-[#002255] flex flex-col items-center justify-center text-white z-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/30">
          <img src="/android-chrome-192x192.png" alt="URNAV Logo"className="w-100 h-5 text-white" />
        </div>
        
        <h1 className="text-5xl font-bold tracking-tight mb-2">URNAV</h1>
        <p className="text-white/90 text-lg mb-1">University of Rwanda</p>
        <p className="text-white/70 text-sm">Indoor Navigation System</p>

        {/* Features */}
        <div className="flex gap-6 mt-10 mb-14">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Wifi className="w-4 h-4" />
            <span>Wi-Fi Positioning</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Real-time Tracking</span>
          </div>
        </div>

        {/* Loading bar */}
        <div className="w-64">
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/80 text-sm mt-4 text-center">{loadingText}</p>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-white/50 text-xs">
        v1.0 Demo - UR Nyarugenge Campus
      </div>
    </div>
  );
}

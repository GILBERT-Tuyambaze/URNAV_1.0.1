import Link from "next/link";
import { URNAVApp } from "@/components/urnav/urnav-app";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      {/* Phone mockup container */}
      <div className="relative">
        {/* Phone frame shadow */}
        <div className="absolute inset-0 bg-foreground/20 rounded-[3rem] blur-3xl translate-y-6 scale-95" />
        
        {/* Phone frame */}
        <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Side buttons */}
          <div className="absolute -left-1 top-32 w-1 h-8 bg-slate-700 rounded-l-sm" />
          <div className="absolute -left-1 top-44 w-1 h-12 bg-slate-700 rounded-l-sm" />
          <div className="absolute -left-1 top-60 w-1 h-12 bg-slate-700 rounded-l-sm" />
          <div className="absolute -right-1 top-40 w-1 h-16 bg-slate-700 rounded-r-sm" />
          
          {/* Screen */}
          {/* <div className="w-[375px] h-[812px] bg-background rounded-[2.5rem] overflow-hidden relative"> */}
            {/* Dynamic Island */}
            {/* <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-900 rounded-full z-50" /> */}
            
            {/* App content */}
            {/* <URNAVApp />
          </div> */}
        </div>

        {/* App info below phone */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Live Demo</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2 text-balance">URNAV Navigation System</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto text-pretty">
            University of Rwanda - Nyarugenge Campus Indoor Navigation
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-muted-foreground flex-wrap">
            <span className="px-2 py-1 bg-muted rounded-full">Wi-Fi Fingerprinting</span>
            <span className="px-2 py-1 bg-muted rounded-full">IMU Tracking</span>
            <span className="px-2 py-1 bg-muted rounded-full">A* Pathfinding</span>
          </div>
          <Link 
            href="/checklist" 
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View Compliance Checklist
          </Link>
        </div>
      </div>
    </main>
  );
}

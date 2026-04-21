"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Circle, CheckCircle2, AlertCircle, MinusCircle, ArrowLeft, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Checklist data structure
interface ChecklistItem {
  id: string;
  requirement: string;
  status: "done" | "partial" | "na";
  notes: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

// Comprehensive checklist based on URNAV_Project_Documentation
const CHECKLIST_DATA: ChecklistSection[] = [
  {
    id: "1",
    title: "Executive Summary & Goals (Document Section 1)",
    items: [
      { id: "1.1", requirement: "Zero-cost indoor navigation (no new hardware purchase)", status: "done", notes: "Demo uses seed data; no hardware purchase required" },
      { id: "1.2", requirement: "Wi-Fi fingerprinting for (x, y, floor)", status: "partial", notes: "fingerprintService.js k-NN + seed grid; real scans need survey + wifi-reborn (bare)" },
      { id: "1.3", requirement: "IMU dead reckoning between Wi-Fi scans", status: "partial", notes: "imuService demo path; real IMU via expo-sensors" },
      { id: "1.4", requirement: "Lightweight JSON corridor graph + A*", status: "done", notes: "pathfinding-service.ts with full A* implementation" },
      { id: "1.5", requirement: "Room search by number, name, department", status: "done", notes: "SearchScreen with building + room search" },
    ],
  },
  {
    id: "2",
    title: "System Architecture (Document Section 2)",
    items: [
      { id: "2.1.1", requirement: "Sensor Layer: Wi-Fi scan, accelerometer, barometer", status: "partial", notes: "Demo mode synthetic; real sensors via expo-sensors" },
      { id: "2.1.2", requirement: "Positioning Engine: k-NN + IMU + floor detector -> Kalman fusion", status: "partial", notes: "fusionService + Kalman filter implemented" },
      { id: "2.1.3", requirement: "Navigation Layer: Map snap -> A* -> instruction generator", status: "done", notes: "pathfinding-service.ts + instructionService" },
      { id: "2.1.4", requirement: "Presentation Layer: React + SVG floor renderer", status: "done", notes: "CampusMapCanvas with pan/zoom/pinch" },
      { id: "2.2.1", requirement: "Site Survey App -> Fingerprint DB", status: "partial", notes: "SurveyScreen uploads when Firebase configured" },
      { id: "2.2.2", requirement: "CAD/floor plan -> floorplan.json", status: "done", notes: "SEED_MAP in seedMap.js; full campus in campus-data.ts" },
      { id: "2.2.3", requirement: "Wi-Fi Scanner / Accelerometer / Barometer (runtime)", status: "partial", notes: "Demo mode or expo-sensors for real device" },
      { id: "2.2.4", requirement: "k-NN fingerprint matcher", status: "partial", notes: "fingerprintService.matchPosition" },
      { id: "2.2.5", requirement: "IMU dead reckoning", status: "partial", notes: "imuService demo path / interval stub" },
      { id: "2.2.6", requirement: "Floor detector", status: "partial", notes: "Barometer + fingerprint in fusionService" },
      { id: "2.2.7", requirement: "Kalman filter fusion", status: "partial", notes: "kalman.js + fusionService" },
      { id: "2.2.8", requirement: "Map matcher -> A* -> instruction generator", status: "done", notes: "pathfinding-service.ts generateInstructions" },
      { id: "2.2.9", requirement: "Room Search + SVG map + blue dot + turn-by-turn", status: "done", notes: "HomeScreen + NavigatingScreen + TTS" },
    ],
  },
  {
    id: "3",
    title: "Database Schema - Firebase (Document Section 2.4)",
    items: [
      { id: "3.1", requirement: "Firestore: rooms collection", status: "partial", notes: "roomService + uploadSeed.js for seeding" },
      { id: "3.2", requirement: "Firestore: fingerprints collection", status: "partial", notes: "Survey upload + in-memory seed by default" },
      { id: "3.3", requirement: "Firestore: buildings collection", status: "partial", notes: "uploadSeed writes buildings/CST" },
      { id: "3.4", requirement: "Firestore: survey_sessions collection", status: "partial", notes: "SurveyScreen creates sessions" },
      { id: "3.5", requirement: "Storage: maps/*.json", status: "partial", notes: "uploadSeed.js + STORAGE_FLOORPLAN_PATH" },
      { id: "3.6", requirement: "Storage: floorplans/*.svg", status: "partial", notes: "loadFloorplanSvg + SvgUri" },
      { id: "3.7", requirement: "Firebase Auth + admin rules for survey", status: "partial", notes: "authService.js; secure rules in Firebase console" },
    ],
  },
  {
    id: "4",
    title: "Project File Structure (Document Section 3)",
    items: [
      { id: "4.1", requirement: "App entry point (App.js / page.tsx)", status: "done", notes: "app/page.tsx renders URNAVApp" },
      { id: "4.2", requirement: "SplashScreen", status: "done", notes: "screens/splash-screen.tsx" },
      { id: "4.3", requirement: "HomeScreen", status: "done", notes: "screens/home-screen.tsx with map + search" },
      { id: "4.4", requirement: "SearchScreen", status: "done", notes: "screens/search-screen.tsx with building + room search" },
      { id: "4.5", requirement: "NavigatingScreen", status: "done", notes: "screens/navigating-screen.tsx with TTS" },
      { id: "4.6", requirement: "ArrivalScreen", status: "done", notes: "screens/arrival-screen.tsx" },
      { id: "4.7", requirement: "SurveyScreen (admin only)", status: "na", notes: "Mobile-only; admin screen in doc" },
      { id: "4.8", requirement: "FloorMap component", status: "done", notes: "campus-map-canvas.tsx" },
      { id: "4.9", requirement: "BlueDot component", status: "done", notes: "Integrated in campus-map-canvas" },
      { id: "4.10", requirement: "RouteOverlay component", status: "done", notes: "Integrated in campus-map-canvas" },
      { id: "4.11", requirement: "SearchBar component", status: "done", notes: "In HomeScreen + SearchScreen" },
      { id: "4.12", requirement: "InstructionPanel component", status: "done", notes: "In NavigatingScreen" },
      { id: "4.13", requirement: "FloorSwitcher component", status: "done", notes: "floor-switcher.tsx" },
    ],
  },
  {
    id: "5",
    title: "Services (Document Section 3.4)",
    items: [
      { id: "5.1", requirement: "wifiService: startScan/stopScan", status: "partial", notes: "Demo mode synthetic scans" },
      { id: "5.2", requirement: "imuService: step detection, Weinberg model", status: "partial", notes: "Demo path; stub interval" },
      { id: "5.3", requirement: "barometerService: pressure, 10 Pa threshold", status: "partial", notes: "expo-sensors when not DEMO_MODE" },
      { id: "5.4", requirement: "fingerprintService: loadFingerprints, matchPosition k=3", status: "partial", notes: "k-NN with seed cache" },
      { id: "5.5", requirement: "fusionService: Kalman, startFusion/stopFusion/recalibrate", status: "partial", notes: "demoController with Kalman" },
      { id: "5.6", requirement: "pathfindingService: A*, stair penalty 20m", status: "done", notes: "pathfinding-service.ts with 20m stair penalty" },
      { id: "5.7", requirement: "instructionService: Turn angles, floor-change phrases", status: "done", notes: "generateInstructions in pathfinding-service" },
      { id: "5.8", requirement: "roomService: Firestore search + offline seed", status: "done", notes: "searchAll in SearchScreen" },
    ],
  },
  {
    id: "6",
    title: "Demo System (Document Section 4)",
    items: [
      { id: "6.1", requirement: "DEMO_MODE in constants", status: "done", notes: "isDemoMode prop throughout" },
      { id: "6.2", requirement: "SEED_FINGERPRINTS structure", status: "partial", notes: "seedFingerprints.js" },
      { id: "6.3", requirement: "SEED_MAP corridor graph", status: "done", notes: "campus-data.ts with 45 buildings + KCEV" },
      { id: "6.4", requirement: "SEED_ROOMS registry", status: "done", notes: "ALL_BUILDINGS with 200+ rooms" },
      { id: "6.5", requirement: "Demo walk script (DEMO_PATH)", status: "done", notes: "demoController with 5 routes" },
    ],
  },
  {
    id: "7",
    title: "Technology Stack (Document Section 6)",
    items: [
      { id: "7.1", requirement: "React / Next.js", status: "done", notes: "Next.js 16 with App Router" },
      { id: "7.2", requirement: "Firebase (Firestore, Storage, Auth)", status: "partial", notes: "Integration ready; needs Firebase config" },
      { id: "7.3", requirement: "SVG / Canvas for maps", status: "done", notes: "SVG with pan/zoom gestures" },
      { id: "7.4", requirement: "Text-to-speech", status: "done", notes: "Web Speech API in NavigatingScreen" },
      { id: "7.5", requirement: "Tailwind CSS", status: "done", notes: "Tailwind v4 with UR brand colors" },
    ],
  },
  {
    id: "8",
    title: "Positioning Logic (Document Section 7)",
    items: [
      { id: "8.1", requirement: "k-NN matchPosition", status: "partial", notes: "fingerprintService.js (seed)" },
      { id: "8.2", requirement: "IMU step + heading", status: "partial", notes: "Demo/interval modes, not true pedometer" },
      { id: "8.3", requirement: "Kalman predict/update", status: "partial", notes: "KalmanFilter2D in demoController" },
      { id: "8.4", requirement: "A* computeRoute", status: "done", notes: "findRoute in pathfinding-service.ts" },
    ],
  },
  {
    id: "9",
    title: "UI/UX Features",
    items: [
      { id: "9.1", requirement: "UR brand colors (light theme)", status: "done", notes: "globals.css with UR palette" },
      { id: "9.2", requirement: "Pan/zoom/pinch map gestures", status: "done", notes: "Google Maps-style in CampusMapCanvas" },
      { id: "9.3", requirement: "Building type color coding", status: "done", notes: "getBuildingColors for 7 types" },
      { id: "9.4", requirement: "Animated position dot with pulse", status: "done", notes: "Pulsing blue dot on map" },
      { id: "9.5", requirement: "Route line with marching ants", status: "done", notes: "Animated dash offset" },
      { id: "9.6", requirement: "Map legend", status: "done", notes: "map-legend.tsx" },
      { id: "9.7", requirement: "Demo control panel", status: "done", notes: "demo-control-panel.tsx" },
    ],
  },
];

// Calculate statistics
function calculateStats(sections: ChecklistSection[]) {
  let total = 0;
  let done = 0;
  let partial = 0;
  let na = 0;

  for (const section of sections) {
    for (const item of section.items) {
      total++;
      if (item.status === "done") done++;
      else if (item.status === "partial") partial++;
      else if (item.status === "na") na++;
    }
  }

  return { total, done, partial, na };
}

// Status icon component
function StatusIcon({ status }: { status: ChecklistItem["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="w-5 h-5 text-[#00883A]" />;
    case "partial":
      return <AlertCircle className="w-5 h-5 text-[#F5A800]" />;
    case "na":
      return <MinusCircle className="w-5 h-5 text-[#8899BB]" />;
    default:
      return <Circle className="w-5 h-5 text-[#CC2200]" />;
  }
}

// Status badge component
function StatusBadge({ status }: { status: ChecklistItem["status"] }) {
  const styles = {
    done: "bg-[#DCF0E8] text-[#00883A]",
    partial: "bg-[#FFF3DC] text-[#CC6600]",
    na: "bg-[#F5F8FC] text-[#8899BB]",
  };

  const labels = {
    done: "Done",
    partial: "Partial",
    na: "N/A",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", styles[status])}>
      {labels[status]}
    </span>
  );
}

export function ChecklistView() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["1"]));
  const stats = calculateStats(CHECKLIST_DATA);
  const completionPercent = Math.round(((stats.done + stats.partial * 0.5) / (stats.total - stats.na)) * 100);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(CHECKLIST_DATA.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      {/* Header */}
      <header className="bg-[#004499] text-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">URNAV Compliance Checklist</h1>
              <p className="text-white/80 text-sm">Project documentation tracking</p>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <a
                href="/doc/compliance-checklist.md"
                target="_blank"
                className="text-sm underline flex items-center gap-1"
              >
                Full Doc <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="bg-white border border-[#D0E4F7] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#002255]">Overall Progress</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">
                Collapse All
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-4 bg-[#E8F3FF] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-[#0066CC] to-[#00883A] transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#DCF0E8] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#00883A]">{stats.done}</p>
              <p className="text-xs text-[#00883A]">Done</p>
            </div>
            <div className="bg-[#FFF3DC] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#CC6600]">{stats.partial}</p>
              <p className="text-xs text-[#CC6600]">Partial</p>
            </div>
            <div className="bg-[#F5F8FC] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#8899BB]">{stats.na}</p>
              <p className="text-xs text-[#8899BB]">N/A</p>
            </div>
            <div className="bg-[#E8F3FF] rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#0066CC]">{completionPercent}%</p>
              <p className="text-xs text-[#0066CC]">Complete</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {CHECKLIST_DATA.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionStats = {
              done: section.items.filter((i) => i.status === "done").length,
              partial: section.items.filter((i) => i.status === "partial").length,
              total: section.items.length,
            };

            return (
              <div
                key={section.id}
                className="bg-white border border-[#D0E4F7] rounded-xl overflow-hidden"
              >
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F5F8FC] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[#0066CC]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#0066CC]" />
                  )}
                  <span className="flex-1 text-left font-medium text-[#002255]">
                    {section.id}. {section.title}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#00883A]">{sectionStats.done}</span>
                    <span className="text-[#8899BB]">/</span>
                    <span className="text-[#4466AA]">{sectionStats.total}</span>
                  </div>
                </button>

                {/* Section items */}
                {isExpanded && (
                  <div className="border-t border-[#D0E4F7]">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-3 flex items-start gap-3 border-b border-[#D0E4F7] last:border-b-0 hover:bg-[#F5F8FC]/50"
                      >
                        <StatusIcon status={item.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-[#8899BB] font-mono">{item.id}</span>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="text-sm text-[#002255] mb-1">{item.requirement}</p>
                          <p className="text-xs text-[#4466AA]">{item.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white border border-[#D0E4F7] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#002255] mb-3">Status Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00883A]" />
              <span className="text-[#002255]">Done - Fully implemented</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F5A800]" />
              <span className="text-[#002255]">Partial - Demo/stub implementation</span>
            </div>
            <div className="flex items-center gap-2">
              <MinusCircle className="w-4 h-4 text-[#8899BB]" />
              <span className="text-[#002255]">N/A - Not applicable for web demo</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-[#8899BB]">
          <p>URNAV - University of Rwanda Navigation App v1.0 Demo</p>
          <p>Based on URNAV_Project_Documentation.pdf</p>
        </div>
      </main>
    </div>
  );
}

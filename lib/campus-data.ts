// Campus data for UR Nyarugenge
// Based on the campus map with 39 numbered buildings

export type BuildingType = 'academic' | 'hostel' | 'admin' | 'service' | 'facility' | 'conference' | 'external';

export interface CampusBuilding {
  id: string;
  number: number;
  name: string;
  shortName: string;
  type: BuildingType;
  position: { x: number; y: number };
  width: number;
  height: number;
  floors: number;
  rooms?: CampusRoom[];
  underConstruction?: boolean;
}

export interface CampusRoom {
  id: string;
  name: string;
  floor: number;
  type: 'lab' | 'lecture' | 'office' | 'toilet' | 'common' | 'hostel' | 'server' | 'default';
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface CampusNode {
  id: string;
  type: 'gate' | 'outdoor' | 'indoor' | 'stairs' | 'lift' | 'entry';
  position: { x: number; y: number };
  floor?: number;
  buildingId?: string;
  label?: string;
}

export interface CampusEdge {
  from: string;
  to: string;
  distance: number;
  type: 'outdoor' | 'indoor' | 'stairs' | 'lift';
}

export interface GardenZone {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

export interface ParkingArea {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  label: string;
}

// Garden zones
export const GARDEN_ZONES: GardenZone[] = [
  { id: 'garden_a', position: { x: 200, y: 200 }, width: 120, height: 80 },
  { id: 'garden_b', position: { x: 380, y: 200 }, width: 80, height: 60 },
  { id: 'garden_c', position: { x: 60, y: 150 }, width: 100, height: 120 },
  { id: 'garden_d', position: { x: 120, y: 340 }, width: 200, height: 80 },
  { id: 'garden_e', position: { x: 285, y: 280 }, width: 100, height: 100 },
];

// Parking areas
export const PARKING_AREAS: ParkingArea[] = [
  { id: 'p1', position: { x: 95, y: 245 }, width: 25, height: 20, label: 'P' },
  { id: 'p2', position: { x: 175, y: 225 }, width: 25, height: 20, label: 'P' },
  { id: 'p3', position: { x: 255, y: 215 }, width: 25, height: 20, label: 'P' },
  { id: 'p4', position: { x: 340, y: 225 }, width: 25, height: 20, label: 'P' },
  { id: 'p5', position: { x: 420, y: 215 }, width: 25, height: 20, label: 'P' },
  { id: 'p6', position: { x: 175, y: 185 }, width: 25, height: 20, label: 'P' },
  { id: 'p7', position: { x: 340, y: 185 }, width: 25, height: 20, label: 'P' },
];

// Campus buildings based on the UR Nyarugenge map
export const ALL_BUILDINGS: CampusBuilding[] = [
  // Row 1 - Main entrance area
  { id: 'b01', number: 1, name: 'Ikaze Gate House', shortName: 'Ikaze', type: 'facility', position: { x: 30, y: 245 }, width: 30, height: 25, floors: 1 },
  { id: 'b02', number: 2, name: 'Ikaze Block', shortName: 'Ikaze Blk', type: 'service', position: { x: 45, y: 275 }, width: 35, height: 30, floors: 2 },
  { id: 'b03', number: 3, name: 'Female Students Hostels', shortName: 'Female Hostel', type: 'hostel', position: { x: 85, y: 280 }, width: 40, height: 35, floors: 3 },
  { id: 'b04', number: 4, name: 'Muhazi Block', shortName: 'Muhazi', type: 'admin', position: { x: 130, y: 270 }, width: 45, height: 35, floors: 3 },
  { id: 'b05', number: 5, name: 'Dusaidi Students Hostel', shortName: 'Dusaidi', type: 'hostel', position: { x: 180, y: 275 }, width: 40, height: 30, floors: 3 },
  { id: 'b06', number: 6, name: 'Security Office 2', shortName: 'Security 2', type: 'facility', position: { x: 225, y: 260 }, width: 25, height: 20, floors: 1 },
  
  // Row 2 - Administration
  { id: 'b07', number: 7, name: 'Administration Block', shortName: 'Admin', type: 'admin', position: { x: 255, y: 275 }, width: 50, height: 40, floors: 3 },
  { id: 'b08', number: 8, name: 'Restaurant', shortName: 'Restaurant', type: 'service', position: { x: 310, y: 280 }, width: 35, height: 25, floors: 1 },
  { id: 'b09', number: 9, name: 'Printing House', shortName: 'Printing', type: 'service', position: { x: 350, y: 275 }, width: 30, height: 25, floors: 1 },
  { id: 'b10', number: 10, name: 'Garage', shortName: 'Garage', type: 'facility', position: { x: 385, y: 270 }, width: 30, height: 25, floors: 1 },
  
  // Row 3 - Academic South
  { id: 'b11', number: 11, name: 'Training Workshop', shortName: 'Workshop', type: 'academic', position: { x: 420, y: 285 }, width: 40, height: 30, floors: 2 },
  { id: 'b12', number: 12, name: 'Ex-Management Office', shortName: 'Ex-Mgmt', type: 'admin', position: { x: 465, y: 280 }, width: 35, height: 25, floors: 2 },
  { id: 'b13', number: 13, name: 'Public Toilets', shortName: 'Toilets', type: 'facility', position: { x: 505, y: 275 }, width: 25, height: 20, floors: 1 },
  { id: 'b14', number: 14, name: 'Exit Gate House', shortName: 'Exit Gate', type: 'facility', position: { x: 535, y: 270 }, width: 25, height: 20, floors: 1 },
  
  // Row 4 - Academic Central
  { id: 'b15', number: 15, name: 'Language Department', shortName: 'Language', type: 'academic', position: { x: 180, y: 320 }, width: 45, height: 35, floors: 3 },
  { id: 'b16', number: 16, name: 'School of Engineering', shortName: 'Engineering', type: 'academic', position: { x: 230, y: 315 }, width: 55, height: 45, floors: 4 },
  { id: 'b17', number: 17, name: 'Mosque', shortName: 'Mosque', type: 'facility', position: { x: 290, y: 325 }, width: 30, height: 30, floors: 1 },
  { id: 'b18', number: 18, name: 'Agaciro Block', shortName: 'Agaciro', type: 'academic', position: { x: 130, y: 360 }, width: 50, height: 40, floors: 3 },
  
  // Row 5 - Einstein & Science
  { id: 'b19', number: 19, name: 'Einstein Block', shortName: 'Einstein', type: 'academic', position: { x: 185, y: 365 }, width: 55, height: 45, floors: 4 },
  { id: 'b20', number: 20, name: 'Asset & Service Management', shortName: 'Asset Mgmt', type: 'admin', position: { x: 245, y: 370 }, width: 40, height: 30, floors: 2 },
  { id: 'b21', number: 21, name: 'URSU Office', shortName: 'URSU', type: 'admin', position: { x: 290, y: 365 }, width: 35, height: 28, floors: 2 },
  { id: 'b22', number: 22, name: 'African Virtual University', shortName: 'AVU', type: 'academic', position: { x: 330, y: 360 }, width: 40, height: 35, floors: 2 },
  { id: 'b23', number: 23, name: 'Belgian Memorial Site', shortName: 'Memorial', type: 'facility', position: { x: 375, y: 355 }, width: 30, height: 25, floors: 1 },
  
  // Row 6 - Library area
  { id: 'b24', number: 24, name: 'Library', shortName: 'Library', type: 'academic', position: { x: 320, y: 400 }, width: 60, height: 50, floors: 3 },
  { id: 'b25', number: 25, name: 'ACEESD, CoEB Research', shortName: 'ACEESD', type: 'academic', position: { x: 385, y: 395 }, width: 50, height: 40, floors: 3 },
  { id: 'b26', number: 26, name: 'Ex-Stadium Seating', shortName: 'Stadium', type: 'facility', position: { x: 440, y: 390 }, width: 45, height: 35, floors: 1 },
  
  // Row 7 - Mining & Science
  { id: 'b27', number: 27, name: 'School of Mining', shortName: 'Mining', type: 'academic', position: { x: 420, y: 340 }, width: 50, height: 40, floors: 3 },
  { id: 'b28', number: 28, name: 'School of Mining (New)', shortName: 'Mining New', type: 'academic', position: { x: 475, y: 335 }, width: 45, height: 40, floors: 3, underConstruction: true },
  { id: 'b29', number: 29, name: 'Sabyinyo Block', shortName: 'Sabyinyo', type: 'academic', position: { x: 80, y: 395 }, width: 45, height: 35, floors: 3 },
  
  // Row 8 - Hostels North
  { id: 'b30', number: 30, name: 'Muhabura Students Hostel', shortName: 'Muhabura', type: 'hostel', position: { x: 50, y: 350 }, width: 40, height: 35, floors: 4 },
  { id: 'b31', number: 31, name: 'Karisimbi Block', shortName: 'Karisimbi', type: 'academic', position: { x: 95, y: 340 }, width: 50, height: 40, floors: 3 },
  { id: 'b32', number: 32, name: 'Cantine 2', shortName: 'Cantine 2', type: 'service', position: { x: 520, y: 320 }, width: 35, height: 25, floors: 1 },
  { id: 'b33', number: 33, name: 'Muhabura Block', shortName: 'Muhabura Blk', type: 'academic', position: { x: 50, y: 310 }, width: 45, height: 35, floors: 3 },
  { id: 'b34', number: 34, name: 'Guest House', shortName: 'Guest House', type: 'hostel', position: { x: 560, y: 315 }, width: 30, height: 25, floors: 2 },
  { id: 'b35', number: 35, name: 'Public Toilets 2', shortName: 'Toilets 2', type: 'facility', position: { x: 560, y: 345 }, width: 25, height: 20, floors: 1 },
  
  // Row 9 - North area
  { id: 'b36', number: 36, name: 'UR HQ', shortName: 'UR HQ', type: 'admin', position: { x: 490, y: 380 }, width: 55, height: 45, floors: 4, underConstruction: true },
  { id: 'b37', number: 37, name: 'Public Toilets 3', shortName: 'Toilets 3', type: 'facility', position: { x: 550, y: 375 }, width: 25, height: 20, floors: 1 },
  { id: 'b38', number: 38, name: 'Public Toilets 4', shortName: 'Toilets 4', type: 'facility', position: { x: 550, y: 400 }, width: 25, height: 20, floors: 1 },
  { id: 'b39', number: 39, name: 'New Students Hostel', shortName: 'New Hostel', type: 'hostel', position: { x: 30, y: 395 }, width: 45, height: 35, floors: 4 },
];

// External reference buildings (not navigable)
export const EXTERNAL_BUILDINGS: CampusBuilding[] = [
  { id: 'ext_russian', number: 0, name: 'Russian Embassy', shortName: 'Russian Emb', type: 'external', position: { x: 570, y: 235 }, width: 40, height: 30, floors: 2 },
  { id: 'ext_serena', number: 0, name: 'Serena Hotel', shortName: 'Serena', type: 'external', position: { x: 490, y: 285 }, width: 50, height: 35, floors: 5 },
  { id: 'ext_marriott', number: 0, name: 'Marriott Hotel', shortName: 'Marriott', type: 'external', position: { x: 560, y: 285 }, width: 40, height: 30, floors: 5 },
  { id: 'ext_sonarwa', number: 0, name: 'SONARWA', shortName: 'SONARWA', type: 'external', position: { x: 530, y: 260 }, width: 30, height: 20, floors: 3 },
  { id: 'ext_chuk', number: 0, name: 'CHUK Hospital', shortName: 'CHUK', type: 'external', position: { x: 450, y: 420 }, width: 120, height: 80, floors: 6 },
  { id: 'ext_camp', number: 0, name: 'Camp Kigali', shortName: 'Camp Kigali', type: 'external', position: { x: 80, y: 420 }, width: 80, height: 60, floors: 2 },
  { id: 'ext_groupe', number: 0, name: 'Groupe Scolaire', shortName: 'Grp Scolaire', type: 'external', position: { x: 80, y: 390 }, width: 40, height: 30, floors: 2 },
];

// Gate nodes
export const GATES: CampusNode[] = [
  { id: 'gate_main', type: 'gate', position: { x: 540, y: 230 }, label: 'Main Gate' },
  { id: 'gate_exit', type: 'gate', position: { x: 535, y: 270 }, label: 'Exit' },
  { id: 'gate_ikaze', type: 'gate', position: { x: 30, y: 245 }, label: 'Ikaze Gate' },
  { id: 'gate_muhabura', type: 'gate', position: { x: 30, y: 350 }, label: 'Muhabura Gate' },
  { id: 'gate_kcev', type: 'gate', position: { x: 400, y: 350 }, label: 'KCEV Gate' },
];

// Outdoor path nodes
export const OUTDOOR_NODES: CampusNode[] = [
  // Main road spine
  { id: 'op_mainroad_e', type: 'outdoor', position: { x: 500, y: 240 } },
  { id: 'op_mainroad_m', type: 'outdoor', position: { x: 400, y: 240 } },
  { id: 'op_mainroad_w', type: 'outdoor', position: { x: 300, y: 240 } },
  { id: 'op_mainroad_ww', type: 'outdoor', position: { x: 200, y: 240 } },
  { id: 'op_mainroad_www', type: 'outdoor', position: { x: 100, y: 240 } },
  // North branch
  { id: 'op_spine_n1', type: 'outdoor', position: { x: 320, y: 300 } },
  { id: 'op_spine_n2', type: 'outdoor', position: { x: 320, y: 350 } },
  { id: 'op_spine_n3', type: 'outdoor', position: { x: 320, y: 400 } },
  // Library front
  { id: 'op_lib_front', type: 'outdoor', position: { x: 350, y: 400 } },
  // South connections
  { id: 'op_south_w', type: 'outdoor', position: { x: 150, y: 340 } },
  { id: 'op_south_m', type: 'outdoor', position: { x: 220, y: 340 } },
  { id: 'op_south_e', type: 'outdoor', position: { x: 280, y: 340 } },
  // Central plaza
  { id: 'op_central', type: 'outdoor', position: { x: 280, y: 300 } },
  // KCEV area
  { id: 'op_kcev_entry', type: 'outdoor', position: { x: 380, y: 340 } },
  { id: 'op_kcev_north', type: 'outdoor', position: { x: 400, y: 380 } },
  // West area
  { id: 'op_muhabura_sq', type: 'outdoor', position: { x: 80, y: 330 } },
  { id: 'op_west_central', type: 'outdoor', position: { x: 120, y: 300 } },
];

// Campus roads for rendering
export const CAMPUS_ROADS = [
  // Main east-west spine
  { from: { x: 60, y: 240 }, to: { x: 550, y: 240 }, width: 14 },
  // North branch
  { from: { x: 280, y: 240 }, to: { x: 280, y: 390 }, width: 10 },
  // South row
  { from: { x: 240, y: 210 }, to: { x: 460, y: 210 }, width: 8 },
  // West loop
  { from: { x: 60, y: 200 }, to: { x: 60, y: 340 }, width: 8 },
  // KCEV access
  { from: { x: 320, y: 260 }, to: { x: 400, y: 350 }, width: 8 },
  // Library access
  { from: { x: 280, y: 280 }, to: { x: 280, y: 330 }, width: 8 },
];

// External streets
export const EXTERNAL_STREETS = [
  { from: { x: 0, y: 15 }, to: { x: 600, y: 15 }, label: 'KN 7 Ave' },
  { from: { x: 0, y: 465 }, to: { x: 600, y: 465 }, label: 'KN 3 Ave' },
  { from: { x: 400, y: 465 }, to: { x: 600, y: 240 }, label: 'KN 4 Ave' },
  { from: { x: 60, y: 415 }, to: { x: 280, y: 415 }, label: 'KN 75 St' },
  { from: { x: 460, y: 240 }, to: { x: 600, y: 240 }, label: 'KN 67 St' },
  { from: { x: 535, y: 240 }, to: { x: 535, y: 465 }, label: 'KN 5 Ave' },
];

// KCEV boundary polygon
export const KCEV_BOUNDARY = [
  { x: 320, y: 280 },
  { x: 400, y: 280 },
  { x: 410, y: 380 },
  { x: 280, y: 390 },
  { x: 270, y: 360 },
  { x: 300, y: 270 },
];

// Sports ground
export const SPORTS_GROUND = {
  position: { x: 420, y: 160 },
  width: 80,
  height: 60,
};

// Demo routes
export interface DemoRoute {
  id: string;
  label: string;
  description: string;
  startLabel: string;
  endLabel: string;
  nodeIds: string[];
  estimatedTimeSeconds: number;
  crossesFloors: boolean;
  crossesBuildings: boolean;
  distanceM: number;
}

export const DEMO_ROUTES: DemoRoute[] = [
  {
    id: 'A',
    label: 'Library Walk',
    description: 'Main Gate to Library Reading Hall',
    startLabel: 'Main Gate',
    endLabel: 'Library',
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_spine_n1', 'op_lib_front', 'b24_entry'],
    estimatedTimeSeconds: 180,
    crossesFloors: false,
    crossesBuildings: false,
    distanceM: 280,
  },
  {
    id: 'B',
    label: 'Admin Visit',
    description: 'Main Gate to Administration Block',
    startLabel: 'Main Gate',
    endLabel: 'Admin Office',
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_mainroad_w', 'b07_entry'],
    estimatedTimeSeconds: 120,
    crossesFloors: false,
    crossesBuildings: false,
    distanceM: 160,
  },
  {
    id: 'C',
    label: 'Computer Lab',
    description: 'Main Gate to Agaciro Block Computer Lab (Floor 2)',
    startLabel: 'Main Gate',
    endLabel: 'Computer Lab',
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_mainroad_w', 'op_south_w', 'b18_entry'],
    estimatedTimeSeconds: 220,
    crossesFloors: true,
    crossesBuildings: false,
    distanceM: 320,
  },
  {
    id: 'D',
    label: 'Muhabura Walk',
    description: 'Ikaze Gate to Muhabura Block',
    startLabel: 'Ikaze Gate',
    endLabel: 'Muhabura Block',
    nodeIds: ['gate_ikaze', 'op_muhabura_sq', 'b33_entry'],
    estimatedTimeSeconds: 140,
    crossesFloors: false,
    crossesBuildings: false,
    distanceM: 200,
  },
  {
    id: 'E',
    label: 'KCEV Tour',
    description: 'Main Gate to KCEV Kigali Hall',
    startLabel: 'Main Gate',
    endLabel: 'Kigali Hall',
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_central', 'op_kcev_entry', 'op_kcev_north'],
    estimatedTimeSeconds: 260,
    crossesFloors: false,
    crossesBuildings: false,
    distanceM: 380,
  },
];

// Get building colors based on type
export function getBuildingColors(type: BuildingType): { fill: string; stroke: string } {
  switch (type) {
    case 'academic':
      return { fill: '#3d1515', stroke: '#8b2222' };
    case 'hostel':
      return { fill: '#1a3020', stroke: '#1d9e75' };
    case 'admin':
      return { fill: '#2a1a4a', stroke: '#c84bff' };
    case 'service':
      return { fill: '#1a2030', stroke: '#4a6a8a' };
    case 'facility':
      return { fill: '#2a2010', stroke: '#ef9f27' };
    case 'conference':
      return { fill: '#2a0a1a', stroke: '#d4537e' };
    case 'external':
      return { fill: '#2a1f00', stroke: '#3a3000' };
    default:
      return { fill: '#1a3a5c', stroke: '#1e6fa8' };
  }
}

// Get room colors based on type
export function getRoomColors(type: CampusRoom['type']): { fill: string; stroke: string } {
  switch (type) {
    case 'lab':
      return { fill: '#1a3060', stroke: '#2255aa' };
    case 'lecture':
      return { fill: '#1a1a40', stroke: '#3355cc' };
    case 'office':
      return { fill: '#1a1a30', stroke: '#334488' };
    case 'toilet':
      return { fill: '#0f1f2f', stroke: '#2a4a5a' };
    case 'common':
      return { fill: '#1a2a20', stroke: '#2a5a3a' };
    case 'hostel':
      return { fill: '#1a2a1a', stroke: '#1d9e75' };
    case 'server':
      return { fill: '#200f0f', stroke: '#8b2222' };
    default:
      return { fill: '#1a3a5c', stroke: '#1e6fa8' };
  }
}

// Changes:
// - Created comprehensive campus data with all 39 buildings from UR Nyarugenge map
// - Added garden zones, parking areas, gates, roads, and external buildings
// - Included KCEV boundary, sports ground, and demo routes
// - Added color utility functions for buildings and rooms

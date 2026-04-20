// UR Nyarugenge Campus Data - Complete
// Based on the UR Campus Map (39 buildings + KCEV area)
// With indoor navigation graph support

export type BuildingType = 'academic' | 'hostel' | 'admin' | 'service' | 'facility' | 'conference' | 'external';
export type RoomType = 'lab' | 'lecture' | 'office' | 'toilet' | 'common' | 'hostel' | 'server' | 'facility' | 'default';

export interface CampusRoom {
  id: string;
  num: string;
  name: string;
  floor: number;
  type: RoomType;
  capacity?: number;
  nodeId: string;
}

export interface CampusBuilding {
  id: string;
  number: number | string;
  name: string;
  shortName: string;
  type: BuildingType;
  position: { x: number; y: number };
  width: number;
  height: number;
  floors: number;
  rooms: CampusRoom[];
  underConstruction?: boolean;
}

export interface CampusNode {
  id: string;
  type: 'gate' | 'outdoor' | 'indoor' | 'stairs' | 'lift' | 'entry' | 'corridor' | 'room';
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

// All 39 Campus Buildings + 6 KCEV Halls
export const ALL_BUILDINGS: CampusBuilding[] = [
  // === EAST ZONE (near Main Gate) ===
  {
    id: 'b01', number: 1, name: 'Ikaze Gate House', shortName: 'Ikaze Gate',
    type: 'service', position: { x: 540, y: 245 }, width: 30, height: 25, floors: 1,
    rooms: [
      { id: 'b01-r01', num: 'GH', name: 'Security Office 1', floor: 1, type: 'office', nodeId: 'b01_f1_r01' },
      { id: 'b01-r02', num: 'C1', name: 'Cantine 1', floor: 1, type: 'facility', capacity: 60, nodeId: 'b01_f1_r02' },
    ]
  },
  {
    id: 'b02', number: 2, name: 'Ikaze Block', shortName: 'Ikaze',
    type: 'academic', position: { x: 460, y: 260 }, width: 50, height: 38, floors: 3,
    rooms: [
      { id: 'b02-r01', num: '101', name: 'UR-CHMS Polyclinic', floor: 1, type: 'office', nodeId: 'b02_f1_r01' },
      { id: 'b02-r02', num: '102', name: 'Classroom A', floor: 1, type: 'lecture', capacity: 60, nodeId: 'b02_f1_r02' },
      { id: 'b02-r03', num: '103', name: 'Classroom B', floor: 1, type: 'lecture', capacity: 60, nodeId: 'b02_f1_r03' },
      { id: 'b02-r04', num: '201', name: 'Classroom C', floor: 2, type: 'lecture', capacity: 60, nodeId: 'b02_f2_r04' },
      { id: 'b02-r05', num: '202', name: 'Classroom D', floor: 2, type: 'lecture', capacity: 60, nodeId: 'b02_f2_r05' },
      { id: 'b02-r06', num: '301', name: 'Classroom E', floor: 3, type: 'lecture', capacity: 60, nodeId: 'b02_f3_r06' },
    ]
  },
  {
    id: 'b03', number: 3, name: 'Female Students Hostels', shortName: 'Female Hostel',
    type: 'hostel', position: { x: 430, y: 275 }, width: 40, height: 35, floors: 4,
    rooms: [
      { id: 'b03-r01', num: '101', name: 'Dormitory F1-A', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b03_f1_r01' },
      { id: 'b03-r02', num: '102', name: 'Dormitory F1-B', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b03_f1_r02' },
      { id: 'b03-r03', num: '103', name: 'Common Room', floor: 1, type: 'common', nodeId: 'b03_f1_r03' },
      { id: 'b03-r04', num: '201', name: 'Dormitory F2-A', floor: 2, type: 'hostel', capacity: 8, nodeId: 'b03_f2_r04' },
      { id: 'b03-r05', num: '202', name: 'Dormitory F2-B', floor: 2, type: 'hostel', capacity: 8, nodeId: 'b03_f2_r05' },
    ]
  },
  {
    id: 'b04', number: 4, name: 'Muhazi Block', shortName: 'Muhazi',
    type: 'academic', position: { x: 400, y: 265 }, width: 45, height: 35, floors: 2,
    rooms: [
      { id: 'b04-r01', num: '101', name: 'Registry Office', floor: 1, type: 'office', nodeId: 'b04_f1_r01' },
      { id: 'b04-r02', num: '102', name: 'School of ICT Offices', floor: 1, type: 'office', nodeId: 'b04_f1_r02' },
      { id: 'b04-r03', num: '103', name: 'Auditorium', floor: 1, type: 'lecture', capacity: 300, nodeId: 'b04_f1_r03' },
      { id: 'b04-r04', num: '201', name: 'ICT Computer Lab', floor: 2, type: 'lab', capacity: 40, nodeId: 'b04_f2_r04' },
      { id: 'b04-r05', num: '202', name: 'Network Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b04_f2_r05' },
    ]
  },
  {
    id: 'b05', number: 5, name: 'Dusaidi Students Hostel', shortName: 'Dusaidi',
    type: 'hostel', position: { x: 430, y: 250 }, width: 35, height: 28, floors: 3,
    rooms: [
      { id: 'b05-r01', num: '101', name: 'Dormitory M1-A', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b05_f1_r01' },
      { id: 'b05-r02', num: '102', name: 'Dormitory M1-B', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b05_f1_r02' },
      { id: 'b05-r03', num: '103', name: 'Common Room', floor: 1, type: 'common', nodeId: 'b05_f1_r03' },
      { id: 'b05-r04', num: '201', name: 'Dormitory M2-A', floor: 2, type: 'hostel', capacity: 8, nodeId: 'b05_f2_r04' },
    ]
  },
  {
    id: 'b06', number: 6, name: 'Security Office 2', shortName: 'Security 2',
    type: 'service', position: { x: 370, y: 255 }, width: 25, height: 20, floors: 1,
    rooms: [
      { id: 'b06-r01', num: '01', name: 'Security Post', floor: 1, type: 'office', nodeId: 'b06_f1_r01' },
    ]
  },
  {
    id: 'b07', number: 7, name: 'Administration Block', shortName: 'Admin',
    type: 'admin', position: { x: 300, y: 260 }, width: 55, height: 42, floors: 3,
    rooms: [
      { id: 'b07-r01', num: '101', name: "Principal's Office", floor: 1, type: 'office', nodeId: 'b07_f1_r01' },
      { id: 'b07-r02', num: '102', name: "Campus Administrator's Office", floor: 1, type: 'office', nodeId: 'b07_f1_r02' },
      { id: 'b07-r03', num: '103', name: 'HR and Administration', floor: 1, type: 'office', nodeId: 'b07_f1_r03' },
      { id: 'b07-r04', num: '104', name: 'Finance Directorate', floor: 1, type: 'office', nodeId: 'b07_f1_r04' },
      { id: 'b07-r05', num: '105', name: 'CGIS Offices', floor: 1, type: 'office', nodeId: 'b07_f1_r05' },
      { id: 'b07-r06', num: '106', name: 'Procurement Office', floor: 1, type: 'office', nodeId: 'b07_f1_r06' },
      { id: 'b07-r07', num: '107', name: 'Public Relations Office', floor: 1, type: 'office', nodeId: 'b07_f1_r07' },
      { id: 'b07-r08', num: '201', name: 'DTLE Offices', floor: 2, type: 'office', nodeId: 'b07_f2_r08' },
      { id: 'b07-r09', num: '202', name: 'Central Secretariat', floor: 2, type: 'office', nodeId: 'b07_f2_r09' },
      { id: 'b07-r10', num: '203', name: 'Logistics Office', floor: 2, type: 'office', nodeId: 'b07_f2_r10' },
      { id: 'b07-r11', num: '204', name: 'Health and Safety Office', floor: 2, type: 'office', nodeId: 'b07_f2_r11' },
    ]
  },

  // === CENTRAL ZONE ===
  {
    id: 'b08', number: 8, name: 'Restaurant', shortName: 'Restaurant',
    type: 'facility', position: { x: 260, y: 265 }, width: 35, height: 28, floors: 1,
    rooms: [
      { id: 'b08-r01', num: '01', name: 'Main Dining Hall', floor: 1, type: 'facility', capacity: 400, nodeId: 'b08_f1_r01' },
      { id: 'b08-r02', num: '02', name: 'Kitchen', floor: 1, type: 'facility', nodeId: 'b08_f1_r02' },
      { id: 'b08-r03', num: '03', name: 'Staff Dining Room', floor: 1, type: 'facility', capacity: 40, nodeId: 'b08_f1_r03' },
    ]
  },
  {
    id: 'b09', number: 9, name: 'Printing House', shortName: 'Printing',
    type: 'service', position: { x: 245, y: 258 }, width: 30, height: 22, floors: 1,
    rooms: [
      { id: 'b09-r01', num: '01', name: 'Print Shop', floor: 1, type: 'office', nodeId: 'b09_f1_r01' },
      { id: 'b09-r02', num: '02', name: 'Design Room', floor: 1, type: 'office', nodeId: 'b09_f1_r02' },
    ]
  },
  {
    id: 'b10', number: 10, name: 'Garage', shortName: 'Garage',
    type: 'service', position: { x: 240, y: 275 }, width: 30, height: 22, floors: 1,
    rooms: [
      { id: 'b10-r01', num: '01', name: 'Vehicle Bay A', floor: 1, type: 'facility', nodeId: 'b10_f1_r01' },
      { id: 'b10-r02', num: '02', name: 'Workshop', floor: 1, type: 'facility', nodeId: 'b10_f1_r02' },
    ]
  },
  {
    id: 'b11', number: 11, name: 'Training Workshop', shortName: 'Workshop',
    type: 'academic', position: { x: 290, y: 275 }, width: 35, height: 28, floors: 2,
    rooms: [
      { id: 'b11-r01', num: '101', name: 'Department Office', floor: 1, type: 'office', nodeId: 'b11_f1_r01' },
      { id: 'b11-r02', num: '102', name: 'Training Room A', floor: 1, type: 'lecture', capacity: 40, nodeId: 'b11_f1_r02' },
      { id: 'b11-r03', num: '201', name: 'Training Room B', floor: 2, type: 'lecture', capacity: 40, nodeId: 'b11_f2_r03' },
    ]
  },
  {
    id: 'b12', number: 12, name: 'Ex-Management Office', shortName: 'Ex-Mgmt',
    type: 'admin', position: { x: 325, y: 275 }, width: 30, height: 22, floors: 1,
    rooms: [
      { id: 'b12-r01', num: '01', name: 'Meeting Room', floor: 1, type: 'common', capacity: 20, nodeId: 'b12_f1_r01' },
      { id: 'b12-r02', num: '02', name: 'Admin Office', floor: 1, type: 'office', nodeId: 'b12_f1_r02' },
    ]
  },
  {
    id: 'b13', number: 13, name: 'Public Toilets', shortName: 'WC 1',
    type: 'facility', position: { x: 355, y: 275 }, width: 20, height: 16, floors: 1,
    rooms: [
      { id: 'b13-r01', num: 'M', name: 'Male Toilets', floor: 1, type: 'toilet', nodeId: 'b13_f1_r01' },
      { id: 'b13-r02', num: 'F', name: 'Female Toilets', floor: 1, type: 'toilet', nodeId: 'b13_f1_r02' },
    ]
  },
  {
    id: 'b14', number: 14, name: 'Exit Gate House', shortName: 'Exit Gate',
    type: 'service', position: { x: 280, y: 245 }, width: 25, height: 20, floors: 1,
    rooms: [
      { id: 'b14-r01', num: '01', name: 'Guard Post', floor: 1, type: 'office', nodeId: 'b14_f1_r01' },
    ]
  },
  {
    id: 'b15', number: 15, name: 'Language Department', shortName: 'Language',
    type: 'academic', position: { x: 340, y: 285 }, width: 35, height: 28, floors: 2,
    rooms: [
      { id: 'b15-r01', num: '101', name: 'Language Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b15_f1_r01' },
      { id: 'b15-r02', num: '102', name: 'Language Lab B', floor: 1, type: 'lab', capacity: 30, nodeId: 'b15_f1_r02' },
      { id: 'b15-r03', num: '103', name: 'Department Office', floor: 1, type: 'office', nodeId: 'b15_f1_r03' },
      { id: 'b15-r04', num: '201', name: 'Classroom A', floor: 2, type: 'lecture', capacity: 40, nodeId: 'b15_f2_r04' },
    ]
  },
  {
    id: 'b16', number: 16, name: 'School of Engineering', shortName: 'Engineering',
    type: 'academic', position: { x: 322, y: 290 }, width: 50, height: 42, floors: 4,
    rooms: [
      { id: 'b16-r01', num: '101', name: 'Dean Office', floor: 1, type: 'office', nodeId: 'b16_f1_r01' },
      { id: 'b16-r02', num: '102', name: 'Department Office A', floor: 1, type: 'office', nodeId: 'b16_f1_r02' },
      { id: 'b16-r03', num: '103', name: 'Engineering Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b16_f1_r03' },
      { id: 'b16-r04', num: '201', name: 'Computer Lab', floor: 2, type: 'lab', capacity: 40, nodeId: 'b16_f2_r04' },
      { id: 'b16-r05', num: '202', name: 'Electronics Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b16_f2_r05' },
      { id: 'b16-r06', num: '301', name: 'Project Room', floor: 3, type: 'lab', capacity: 25, nodeId: 'b16_f3_r06' },
      { id: 'b16-r07', num: '401', name: 'Seminar Room', floor: 4, type: 'lecture', capacity: 50, nodeId: 'b16_f4_r07' },
    ]
  },
  {
    id: 'b17', number: 17, name: 'Mosque', shortName: 'Mosque',
    type: 'facility', position: { x: 252, y: 288 }, width: 28, height: 24, floors: 1,
    rooms: [
      { id: 'b17-r01', num: '01', name: 'Prayer Hall', floor: 1, type: 'facility', capacity: 200, nodeId: 'b17_f1_r01' },
      { id: 'b17-r02', num: '02', name: 'Ablution Room', floor: 1, type: 'facility', nodeId: 'b17_f1_r02' },
    ]
  },
  {
    id: 'b18', number: 18, name: 'Agaciro Block', shortName: 'Agaciro',
    type: 'academic', position: { x: 208, y: 300 }, width: 55, height: 45, floors: 3,
    rooms: [
      { id: 'b18-r01', num: '101', name: 'ACE in IoT Offices', floor: 1, type: 'office', nodeId: 'b18_f1_r01' },
      { id: 'b18-r02', num: '102', name: 'Lecture Hall A', floor: 1, type: 'lecture', capacity: 120, nodeId: 'b18_f1_r02' },
      { id: 'b18-r03', num: '103', name: 'Lecture Hall B', floor: 1, type: 'lecture', capacity: 80, nodeId: 'b18_f1_r03' },
      { id: 'b18-r04', num: '201', name: 'Computer Lab A', floor: 2, type: 'lab', capacity: 40, nodeId: 'b18_f2_r04' },
      { id: 'b18-r05', num: '202', name: 'Computer Lab B', floor: 2, type: 'lab', capacity: 40, nodeId: 'b18_f2_r05' },
      { id: 'b18-r06', num: '203', name: 'Mapping Room', floor: 2, type: 'lab', capacity: 25, nodeId: 'b18_f2_r06' },
      { id: 'b18-r07', num: '204', name: 'ICTP Offices', floor: 2, type: 'office', nodeId: 'b18_f2_r07' },
      { id: 'b18-r08', num: '205', name: 'Dean of Students Office', floor: 2, type: 'office', nodeId: 'b18_f2_r08' },
      { id: 'b18-r09', num: '301', name: 'Computer Lab C', floor: 3, type: 'lab', capacity: 40, nodeId: 'b18_f3_r09' },
      { id: 'b18-r10', num: '302', name: 'Engineering Offices', floor: 3, type: 'office', nodeId: 'b18_f3_r10' },
    ]
  },
  {
    id: 'b19', number: 19, name: 'Einstein Block', shortName: 'Einstein',
    type: 'academic', position: { x: 190, y: 315 }, width: 50, height: 40, floors: 3,
    rooms: [
      { id: 'b19-r01', num: '101', name: 'Dean of Mining Office', floor: 1, type: 'office', nodeId: 'b19_f1_r01' },
      { id: 'b19-r02', num: '102', name: 'Lecture Hall A', floor: 1, type: 'lecture', capacity: 100, nodeId: 'b19_f1_r02' },
      { id: 'b19-r03', num: '103', name: 'Lecture Hall B', floor: 1, type: 'lecture', capacity: 80, nodeId: 'b19_f1_r03' },
      { id: 'b19-r04', num: '201', name: 'Geology Lab A', floor: 2, type: 'lab', capacity: 30, nodeId: 'b19_f2_r04' },
      { id: 'b19-r05', num: '202', name: 'Geology Lab B', floor: 2, type: 'lab', capacity: 30, nodeId: 'b19_f2_r05' },
      { id: 'b19-r06', num: '203', name: 'Mining Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b19_f2_r06' },
      { id: 'b19-r07', num: '301', name: 'Computer Labs', floor: 3, type: 'lab', capacity: 40, nodeId: 'b19_f3_r07' },
      { id: 'b19-r08', num: '302', name: 'Research Office', floor: 3, type: 'office', nodeId: 'b19_f3_r08' },
    ]
  },
  {
    id: 'b20', number: 20, name: 'Asset & Service Management', shortName: 'Asset Mgmt',
    type: 'admin', position: { x: 230, y: 335 }, width: 35, height: 25, floors: 1,
    rooms: [
      { id: 'b20-r01', num: '01', name: 'Main Office', floor: 1, type: 'office', nodeId: 'b20_f1_r01' },
      { id: 'b20-r02', num: '02', name: 'Records Room', floor: 1, type: 'office', nodeId: 'b20_f1_r02' },
    ]
  },
  {
    id: 'b21', number: 21, name: 'URSU Office', shortName: 'URSU',
    type: 'service', position: { x: 245, y: 355 }, width: 30, height: 22, floors: 1,
    rooms: [
      { id: 'b21-r01', num: '01', name: 'URSU Main Office', floor: 1, type: 'office', nodeId: 'b21_f1_r01' },
      { id: 'b21-r02', num: '02', name: 'Student Meeting Room', floor: 1, type: 'common', capacity: 20, nodeId: 'b21_f1_r02' },
    ]
  },
  {
    id: 'b22', number: 22, name: 'African Virtual University', shortName: 'AVU',
    type: 'academic', position: { x: 262, y: 360 }, width: 35, height: 28, floors: 2,
    rooms: [
      { id: 'b22-r01', num: '101', name: 'AVU Office', floor: 1, type: 'office', nodeId: 'b22_f1_r01' },
      { id: 'b22-r02', num: '102', name: 'E-Learning Lab', floor: 1, type: 'lab', capacity: 30, nodeId: 'b22_f1_r02' },
      { id: 'b22-r03', num: '201', name: 'Server Room', floor: 2, type: 'server', nodeId: 'b22_f2_r03' },
    ]
  },
  {
    id: 'b23', number: 23, name: 'Belgian Memorial Site', shortName: 'Memorial',
    type: 'facility', position: { x: 282, y: 370 }, width: 30, height: 25, floors: 1,
    rooms: [
      { id: 'b23-r01', num: '01', name: 'Memorial Hall', floor: 1, type: 'facility', capacity: 100, nodeId: 'b23_f1_r01' },
    ]
  },
  {
    id: 'b24', number: 24, name: 'Library', shortName: 'Library',
    type: 'academic', position: { x: 230, y: 390 }, width: 55, height: 45, floors: 3,
    rooms: [
      { id: 'b24-r01', num: '101', name: 'Main Reading Hall', floor: 1, type: 'common', capacity: 200, nodeId: 'b24_f1_r01' },
      { id: 'b24-r02', num: '102', name: 'Periodicals Section', floor: 1, type: 'common', nodeId: 'b24_f1_r02' },
      { id: 'b24-r03', num: '103', name: 'Printing and Scanning', floor: 1, type: 'facility', nodeId: 'b24_f1_r03' },
      { id: 'b24-r04', num: '104', name: 'IT Support Desk', floor: 1, type: 'office', nodeId: 'b24_f1_r04' },
      { id: 'b24-r05', num: '201', name: 'Digital Resources Room', floor: 2, type: 'lab', capacity: 60, nodeId: 'b24_f2_r05' },
      { id: 'b24-r06', num: '202', name: 'Group Study Room A', floor: 2, type: 'common', capacity: 20, nodeId: 'b24_f2_r06' },
      { id: 'b24-r07', num: '203', name: 'Group Study Room B', floor: 2, type: 'common', capacity: 20, nodeId: 'b24_f2_r07' },
      { id: 'b24-r08', num: '204', name: 'Group Study Room C', floor: 2, type: 'common', capacity: 20, nodeId: 'b24_f2_r08' },
      { id: 'b24-r09', num: '205', name: 'Librarian Office', floor: 2, type: 'office', nodeId: 'b24_f2_r09' },
      { id: 'b24-r10', num: '301', name: 'Postgraduate Reading Room', floor: 3, type: 'common', capacity: 50, nodeId: 'b24_f3_r10' },
      { id: 'b24-r11', num: '302', name: 'Reference Section', floor: 3, type: 'common', nodeId: 'b24_f3_r11' },
    ]
  },
  {
    id: 'b25', number: 25, name: 'ACEESD CoEB Research', shortName: 'Research',
    type: 'academic', position: { x: 205, y: 400 }, width: 45, height: 35, floors: 2,
    rooms: [
      { id: 'b25-r01', num: '101', name: 'Research Directorate Office', floor: 1, type: 'office', nodeId: 'b25_f1_r01' },
      { id: 'b25-r02', num: '102', name: 'CoE Biodiversity Office', floor: 1, type: 'office', nodeId: 'b25_f1_r02' },
      { id: 'b25-r03', num: '103', name: 'ACEESD Office', floor: 1, type: 'office', nodeId: 'b25_f1_r03' },
      { id: 'b25-r04', num: '201', name: 'Research Lab A', floor: 2, type: 'lab', capacity: 20, nodeId: 'b25_f2_r04' },
      { id: 'b25-r05', num: '202', name: 'Research Lab B', floor: 2, type: 'lab', capacity: 20, nodeId: 'b25_f2_r05' },
      { id: 'b25-r06', num: '203', name: 'PhD Students Room', floor: 2, type: 'common', capacity: 30, nodeId: 'b25_f2_r06' },
    ]
  },
  {
    id: 'b26', number: 26, name: 'Ex-Stadium Seating', shortName: 'Ex-Stadium',
    type: 'facility', position: { x: 192, y: 420 }, width: 40, height: 30, floors: 1,
    rooms: [
      { id: 'b26-r01', num: '01', name: 'Seating Area', floor: 1, type: 'facility', nodeId: 'b26_f1_r01' },
    ]
  },
  {
    id: 'b27', number: 27, name: 'School of Mining and Geology Offices', shortName: 'Mining Offices',
    type: 'academic', position: { x: 170, y: 365 }, width: 40, height: 32, floors: 2,
    rooms: [
      { id: 'b27-r01', num: '101', name: 'Dean Office Mining', floor: 1, type: 'office', nodeId: 'b27_f1_r01' },
      { id: 'b27-r02', num: '102', name: 'Mining Department Office', floor: 1, type: 'office', nodeId: 'b27_f1_r02' },
      { id: 'b27-r03', num: '103', name: 'Geology Department Office', floor: 1, type: 'office', nodeId: 'b27_f1_r03' },
      { id: 'b27-r04', num: '201', name: 'Computer Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b27_f2_r04' },
      { id: 'b27-r05', num: '202', name: 'Sample Room', floor: 2, type: 'lab', nodeId: 'b27_f2_r05' },
    ]
  },
  {
    id: 'b28', number: 28, name: 'School of Mining and Geology', shortName: 'Mining',
    type: 'academic', position: { x: 130, y: 350 }, width: 55, height: 45, floors: 3,
    rooms: [
      { id: 'b28-r01', num: '101', name: 'Lecture Hall A', floor: 1, type: 'lecture', capacity: 120, nodeId: 'b28_f1_r01' },
      { id: 'b28-r02', num: '102', name: 'Lecture Hall B', floor: 1, type: 'lecture', capacity: 80, nodeId: 'b28_f1_r02' },
      { id: 'b28-r03', num: '103', name: 'Geology Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b28_f1_r03' },
      { id: 'b28-r04', num: '201', name: 'Geology Lab B', floor: 2, type: 'lab', capacity: 30, nodeId: 'b28_f2_r04' },
      { id: 'b28-r05', num: '202', name: 'Mining Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b28_f2_r05' },
      { id: 'b28-r06', num: '203', name: 'Rock Sample Store', floor: 2, type: 'lab', nodeId: 'b28_f2_r06' },
      { id: 'b28-r07', num: '301', name: 'Computer Lab', floor: 3, type: 'lab', capacity: 40, nodeId: 'b28_f3_r07' },
      { id: 'b28-r08', num: '302', name: 'Research Offices', floor: 3, type: 'office', nodeId: 'b28_f3_r08' },
    ]
  },
  {
    id: 'b29', number: 29, name: 'Sabyinyo Block', shortName: 'Sabyinyo',
    type: 'academic', position: { x: 108, y: 380 }, width: 45, height: 35, floors: 3,
    rooms: [
      { id: 'b29-r01', num: '101', name: 'Architecture Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b29_f1_r01' },
      { id: 'b29-r02', num: '102', name: 'Science Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b29_f1_r02' },
      { id: 'b29-r03', num: '103', name: 'Classroom A', floor: 1, type: 'lecture', capacity: 60, nodeId: 'b29_f1_r03' },
      { id: 'b29-r04', num: '201', name: 'Architecture Lab B', floor: 2, type: 'lab', capacity: 30, nodeId: 'b29_f2_r04' },
      { id: 'b29-r05', num: '202', name: 'Computer Lab', floor: 2, type: 'lab', capacity: 40, nodeId: 'b29_f2_r05' },
      { id: 'b29-r06', num: '301', name: 'School of Architecture Office', floor: 3, type: 'office', nodeId: 'b29_f3_r06' },
    ]
  },
  {
    id: 'b30', number: 30, name: 'Muhabura Students Hostel', shortName: 'Muhabura Hostel',
    type: 'hostel', position: { x: 68, y: 370 }, width: 40, height: 32, floors: 4,
    rooms: [
      { id: 'b30-r01', num: '101', name: 'Dormitory A', floor: 1, type: 'hostel', capacity: 10, nodeId: 'b30_f1_r01' },
      { id: 'b30-r02', num: '102', name: 'Common Room', floor: 1, type: 'common', nodeId: 'b30_f1_r02' },
      { id: 'b30-r03', num: '201', name: 'Dormitory B', floor: 2, type: 'hostel', capacity: 10, nodeId: 'b30_f2_r03' },
    ]
  },
  {
    id: 'b31', number: 31, name: 'Karisimbi Block', shortName: 'Karisimbi',
    type: 'academic', position: { x: 58, y: 335 }, width: 55, height: 45, floors: 3,
    rooms: [
      { id: 'b31-r01', num: '101', name: 'Architecture Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b31_f1_r01' },
      { id: 'b31-r02', num: '102', name: 'Science Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b31_f1_r02' },
      { id: 'b31-r03', num: '103', name: 'Lecture Hall', floor: 1, type: 'lecture', capacity: 100, nodeId: 'b31_f1_r03' },
      { id: 'b31-r04', num: '201', name: 'Architecture Lab B', floor: 2, type: 'lab', capacity: 30, nodeId: 'b31_f2_r04' },
      { id: 'b31-r05', num: '202', name: 'Science Lab B', floor: 2, type: 'lab', capacity: 30, nodeId: 'b31_f2_r05' },
      { id: 'b31-r06', num: '203', name: 'Computer Lab', floor: 2, type: 'lab', capacity: 40, nodeId: 'b31_f2_r06' },
      { id: 'b31-r07', num: '301', name: 'Seminar Room A', floor: 3, type: 'common', capacity: 30, nodeId: 'b31_f3_r07' },
      { id: 'b31-r08', num: '302', name: 'Seminar Room B', floor: 3, type: 'common', capacity: 30, nodeId: 'b31_f3_r08' },
    ]
  },
  {
    id: 'b32', number: 32, name: 'Cantine 2', shortName: 'Cantine 2',
    type: 'facility', position: { x: 42, y: 320 }, width: 32, height: 24, floors: 1,
    rooms: [
      { id: 'b32-r01', num: '01', name: 'Dining Hall', floor: 1, type: 'facility', capacity: 150, nodeId: 'b32_f1_r01' },
      { id: 'b32-r02', num: '02', name: 'Kitchen', floor: 1, type: 'facility', nodeId: 'b32_f1_r02' },
    ]
  },
  {
    id: 'b33', number: 33, name: 'Muhabura Block', shortName: 'Muhabura',
    type: 'academic', position: { x: 52, y: 290 }, width: 55, height: 45, floors: 3,
    rooms: [
      { id: 'b33-r01', num: '101', name: 'School of Science Offices', floor: 1, type: 'office', nodeId: 'b33_f1_r01' },
      { id: 'b33-r02', num: '102', name: 'Dean Office Science', floor: 1, type: 'office', nodeId: 'b33_f1_r02' },
      { id: 'b33-r03', num: '103', name: 'Classroom A', floor: 1, type: 'lecture', capacity: 80, nodeId: 'b33_f1_r03' },
      { id: 'b33-r04', num: '104', name: 'Classroom B', floor: 1, type: 'lecture', capacity: 80, nodeId: 'b33_f1_r04' },
      { id: 'b33-r05', num: '201', name: 'Biology Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b33_f2_r05' },
      { id: 'b33-r06', num: '202', name: 'Chemistry Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b33_f2_r06' },
      { id: 'b33-r07', num: '203', name: 'Physics Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b33_f2_r07' },
      { id: 'b33-r08', num: '204', name: 'Computer Lab', floor: 2, type: 'lab', capacity: 40, nodeId: 'b33_f2_r08' },
      { id: 'b33-r09', num: '301', name: 'Research Office', floor: 3, type: 'office', nodeId: 'b33_f3_r09' },
      { id: 'b33-r10', num: '302', name: 'Seminar Room', floor: 3, type: 'common', capacity: 30, nodeId: 'b33_f3_r10' },
    ]
  },
  {
    id: 'b34', number: 34, name: 'Guest House', shortName: 'Guest House',
    type: 'hostel', position: { x: 22, y: 355 }, width: 35, height: 28, floors: 2,
    rooms: [
      { id: 'b34-r01', num: '101', name: 'Guest Room A', floor: 1, type: 'hostel', capacity: 2, nodeId: 'b34_f1_r01' },
      { id: 'b34-r02', num: '102', name: 'Reception', floor: 1, type: 'office', nodeId: 'b34_f1_r02' },
      { id: 'b34-r03', num: '201', name: 'Guest Room B', floor: 2, type: 'hostel', capacity: 2, nodeId: 'b34_f2_r03' },
    ]
  },
  {
    id: 'b35', number: 35, name: 'Public Toilets 2', shortName: 'WC 2',
    type: 'facility', position: { x: 262, y: 420 }, width: 20, height: 16, floors: 1,
    rooms: [
      { id: 'b35-r01', num: 'M', name: 'Male Toilets', floor: 1, type: 'toilet', nodeId: 'b35_f1_r01' },
      { id: 'b35-r02', num: 'F', name: 'Female Toilets', floor: 1, type: 'toilet', nodeId: 'b35_f1_r02' },
    ]
  },
  {
    id: 'b36', number: 36, name: 'UR HQ', shortName: 'UR HQ',
    type: 'admin', position: { x: 288, y: 415 }, width: 50, height: 40, floors: 3,
    underConstruction: true,
    rooms: [
      { id: 'b36-r01', num: '101', name: 'Executive Offices', floor: 1, type: 'office', nodeId: 'b36_f1_r01' },
      { id: 'b36-r02', num: '102', name: 'Board Room', floor: 1, type: 'common', capacity: 30, nodeId: 'b36_f1_r02' },
      { id: 'b36-r03', num: '201', name: 'HR Office', floor: 2, type: 'office', nodeId: 'b36_f2_r03' },
    ]
  },
  {
    id: 'b37', number: 37, name: 'Public Toilets 3', shortName: 'WC 3',
    type: 'facility', position: { x: 214, y: 440 }, width: 20, height: 16, floors: 1,
    rooms: [
      { id: 'b37-r01', num: 'M', name: 'Male Toilets', floor: 1, type: 'toilet', nodeId: 'b37_f1_r01' },
      { id: 'b37-r02', num: 'F', name: 'Female Toilets', floor: 1, type: 'toilet', nodeId: 'b37_f1_r02' },
    ]
  },
  {
    id: 'b38', number: 38, name: 'Public Toilets 4', shortName: 'WC 4',
    type: 'facility', position: { x: 196, y: 445 }, width: 20, height: 16, floors: 1,
    rooms: [
      { id: 'b38-r01', num: 'M', name: 'Male Toilets', floor: 1, type: 'toilet', nodeId: 'b38_f1_r01' },
      { id: 'b38-r02', num: 'F', name: 'Female Toilets', floor: 1, type: 'toilet', nodeId: 'b38_f1_r02' },
    ]
  },
  {
    id: 'b39', number: 39, name: 'New Students Hostel', shortName: 'New Hostel',
    type: 'hostel', position: { x: 138, y: 420 }, width: 45, height: 35, floors: 4,
    rooms: [
      { id: 'b39-r01', num: '101', name: 'Dormitory Block A', floor: 1, type: 'hostel', capacity: 20, nodeId: 'b39_f1_r01' },
      { id: 'b39-r02', num: '102', name: 'Dormitory Block B', floor: 1, type: 'hostel', capacity: 20, nodeId: 'b39_f1_r02' },
      { id: 'b39-r03', num: '103', name: 'Warden Office', floor: 1, type: 'office', nodeId: 'b39_f1_r03' },
      { id: 'b39-r04', num: '201', name: 'Dormitory Block C', floor: 2, type: 'hostel', capacity: 20, nodeId: 'b39_f2_r04' },
    ]
  },

  // === KCEV ZONE ===
  {
    id: 'kcev_a', number: 'a', name: 'Kivu Hall', shortName: 'Kivu Hall',
    type: 'conference', position: { x: 296, y: 320 }, width: 40, height: 32, floors: 1,
    rooms: [
      { id: 'kcev_a-r01', num: '01', name: 'Conference Hall', floor: 1, type: 'facility', capacity: 500, nodeId: 'kcev_a_f1_r01' },
      { id: 'kcev_a-r02', num: '02', name: 'Foyer', floor: 1, type: 'common', nodeId: 'kcev_a_f1_r02' },
    ]
  },
  {
    id: 'kcev_b', number: 'b', name: 'KCEV Management', shortName: 'KCEV Mgmt',
    type: 'conference', position: { x: 292, y: 350 }, width: 30, height: 22, floors: 1,
    rooms: [
      { id: 'kcev_b-r01', num: '01', name: 'Management Office', floor: 1, type: 'office', nodeId: 'kcev_b_f1_r01' },
    ]
  },
  {
    id: 'kcev_c', number: 'c', name: 'Urukari Hall', shortName: 'Urukari',
    type: 'conference', position: { x: 290, y: 335 }, width: 32, height: 25, floors: 1,
    rooms: [
      { id: 'kcev_c-r01', num: '01', name: 'Hall', floor: 1, type: 'facility', capacity: 300, nodeId: 'kcev_c_f1_r01' },
    ]
  },
  {
    id: 'kcev_d', number: 'd', name: 'Akagera Hall', shortName: 'Akagera',
    type: 'conference', position: { x: 305, y: 365 }, width: 45, height: 35, floors: 1,
    rooms: [
      { id: 'kcev_d-r01', num: '01', name: 'Main Hall', floor: 1, type: 'facility', capacity: 400, nodeId: 'kcev_d_f1_r01' },
      { id: 'kcev_d-r02', num: '02', name: 'Exhibition Space', floor: 1, type: 'facility', nodeId: 'kcev_d_f1_r02' },
    ]
  },
  {
    id: 'kcev_e', number: 'e', name: 'Kigali Hall', shortName: 'Kigali Hall',
    type: 'conference', position: { x: 265, y: 380 }, width: 55, height: 42, floors: 1,
    rooms: [
      { id: 'kcev_e-r01', num: '01', name: 'Main Hall', floor: 1, type: 'facility', capacity: 1000, nodeId: 'kcev_e_f1_r01' },
      { id: 'kcev_e-r02', num: '02', name: 'VIP Room', floor: 1, type: 'common', nodeId: 'kcev_e_f1_r02' },
      { id: 'kcev_e-r03', num: '03', name: 'Press Room', floor: 1, type: 'office', nodeId: 'kcev_e_f1_r03' },
    ]
  },
  {
    id: 'kcev_f', number: 'f', name: 'Virunga Hall', shortName: 'Virunga',
    type: 'conference', position: { x: 235, y: 395 }, width: 40, height: 30, floors: 1,
    rooms: [
      { id: 'kcev_f-r01', num: '01', name: 'Hall', floor: 1, type: 'facility', capacity: 250, nodeId: 'kcev_f_f1_r01' },
      { id: 'kcev_f-r02', num: '02', name: 'Break Room', floor: 1, type: 'common', nodeId: 'kcev_f_f1_r02' },
    ]
  },
];

// External reference buildings (not navigable)
export const EXTERNAL_BUILDINGS: CampusBuilding[] = [
  { id: 'ext_russian', number: 0, name: 'Russian Embassy', shortName: 'Russian Emb', type: 'external', position: { x: 570, y: 250 }, width: 40, height: 30, floors: 2, rooms: [] },
  { id: 'ext_serena', number: 0, name: 'Serena Hotel', shortName: 'Serena', type: 'external', position: { x: 490, y: 260 }, width: 50, height: 35, floors: 5, rooms: [] },
  { id: 'ext_marriott', number: 0, name: 'Marriott Hotel', shortName: 'Marriott', type: 'external', position: { x: 560, y: 265 }, width: 40, height: 30, floors: 5, rooms: [] },
  { id: 'ext_sonarwa', number: 0, name: 'SONARWA', shortName: 'SONARWA', type: 'external', position: { x: 530, y: 250 }, width: 30, height: 20, floors: 3, rooms: [] },
  { id: 'ext_chuk', number: 0, name: 'CHUK Hospital', shortName: 'CHUK', type: 'external', position: { x: 350, y: 430 }, width: 100, height: 60, floors: 6, rooms: [] },
  { id: 'ext_camp', number: 0, name: 'Camp Kigali', shortName: 'Camp Kigali', type: 'external', position: { x: 80, y: 430 }, width: 80, height: 50, floors: 2, rooms: [] },
];

// Garden zones
export const GARDEN_ZONES: GardenZone[] = [
  { id: 'garden_a', position: { x: 200, y: 280 }, width: 100, height: 70 },
  { id: 'garden_b', position: { x: 380, y: 290 }, width: 70, height: 50 },
  { id: 'garden_c', position: { x: 60, y: 260 }, width: 90, height: 90 },
  { id: 'garden_d', position: { x: 120, y: 410 }, width: 160, height: 60 },
  { id: 'garden_e', position: { x: 285, y: 340 }, width: 80, height: 80 },
];

// Parking areas
export const PARKING_AREAS: ParkingArea[] = [
  { id: 'p1', position: { x: 95, y: 265 }, width: 25, height: 20, label: 'P' },
  { id: 'p2', position: { x: 175, y: 275 }, width: 25, height: 20, label: 'P' },
  { id: 'p3', position: { x: 255, y: 255 }, width: 25, height: 20, label: 'P' },
  { id: 'p4', position: { x: 340, y: 270 }, width: 25, height: 20, label: 'P' },
  { id: 'p5', position: { x: 420, y: 255 }, width: 25, height: 20, label: 'P' },
  { id: 'p6', position: { x: 175, y: 295 }, width: 25, height: 20, label: 'P' },
  { id: 'p7', position: { x: 340, y: 290 }, width: 25, height: 20, label: 'P' },
];

// Gate nodes
export const GATES: CampusNode[] = [
  { id: 'gate_main', type: 'gate', position: { x: 540, y: 240 }, label: 'Main Gate' },
  { id: 'gate_exit', type: 'gate', position: { x: 535, y: 260 }, label: 'Exit' },
  { id: 'gate_ikaze', type: 'gate', position: { x: 30, y: 265 }, label: 'Ikaze Gate' },
  { id: 'gate_muhabura', type: 'gate', position: { x: 30, y: 350 }, label: 'Muhabura Gate' },
  { id: 'gate_kcev', type: 'gate', position: { x: 340, y: 390 }, label: 'KCEV Gate' },
];

// Outdoor path nodes
export const OUTDOOR_NODES: CampusNode[] = [
  // Main road spine
  { id: 'op_mainroad_e', type: 'outdoor', position: { x: 500, y: 250 } },
  { id: 'op_mainroad_m', type: 'outdoor', position: { x: 400, y: 255 } },
  { id: 'op_mainroad_w', type: 'outdoor', position: { x: 300, y: 260 } },
  { id: 'op_mainroad_ww', type: 'outdoor', position: { x: 200, y: 265 } },
  { id: 'op_mainroad_www', type: 'outdoor', position: { x: 100, y: 270 } },
  // North branch
  { id: 'op_spine_n1', type: 'outdoor', position: { x: 320, y: 300 } },
  { id: 'op_spine_n2', type: 'outdoor', position: { x: 320, y: 350 } },
  { id: 'op_spine_n3', type: 'outdoor', position: { x: 320, y: 400 } },
  // Library front
  { id: 'op_lib_front', type: 'outdoor', position: { x: 260, y: 390 } },
  // South connections
  { id: 'op_south_w', type: 'outdoor', position: { x: 150, y: 330 } },
  { id: 'op_south_m', type: 'outdoor', position: { x: 220, y: 330 } },
  { id: 'op_south_e', type: 'outdoor', position: { x: 280, y: 320 } },
  // Central plaza
  { id: 'op_central', type: 'outdoor', position: { x: 280, y: 290 } },
  // KCEV area
  { id: 'op_kcev_entry', type: 'outdoor', position: { x: 320, y: 340 } },
  { id: 'op_kcev_north', type: 'outdoor', position: { x: 320, y: 380 } },
  // West area
  { id: 'op_muhabura_sq', type: 'outdoor', position: { x: 80, y: 320 } },
  { id: 'op_west_central', type: 'outdoor', position: { x: 120, y: 300 } },
];

// Campus roads for rendering
export const CAMPUS_ROADS = [
  // Main east-west spine
  { from: { x: 60, y: 255 }, to: { x: 550, y: 250 }, width: 14 },
  // North branch
  { from: { x: 280, y: 260 }, to: { x: 280, y: 400 }, width: 10 },
  // South row
  { from: { x: 240, y: 230 }, to: { x: 460, y: 235 }, width: 8 },
  // West loop
  { from: { x: 60, y: 260 }, to: { x: 60, y: 380 }, width: 8 },
  // KCEV access
  { from: { x: 320, y: 280 }, to: { x: 340, y: 390 }, width: 8 },
  // Library access
  { from: { x: 280, y: 290 }, to: { x: 280, y: 370 }, width: 8 },
];

// External streets
export const EXTERNAL_STREETS = [
  { from: { x: 0, y: 220 }, to: { x: 600, y: 220 }, label: 'KN 7 Ave' },
  { from: { x: 0, y: 465 }, to: { x: 600, y: 465 }, label: 'KN 3 Ave' },
  { from: { x: 400, y: 465 }, to: { x: 600, y: 250 }, label: 'KN 4 Ave' },
  { from: { x: 60, y: 440 }, to: { x: 280, y: 440 }, label: 'KN 75 St' },
  { from: { x: 460, y: 250 }, to: { x: 600, y: 250 }, label: 'KN 67 St' },
  { from: { x: 535, y: 250 }, to: { x: 535, y: 465 }, label: 'KN 5 Ave' },
];

// KCEV boundary polygon
export const KCEV_BOUNDARY = [
  { x: 265, y: 310 },
  { x: 355, y: 310 },
  { x: 360, y: 410 },
  { x: 230, y: 420 },
  { x: 225, y: 370 },
  { x: 255, y: 310 },
];

// Sports ground
export const SPORTS_GROUND = {
  position: { x: 420, y: 175 },
  width: 80,
  height: 55,
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
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_spine_n1', 'op_lib_front'],
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
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_mainroad_w'],
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
    nodeIds: ['gate_main', 'op_mainroad_e', 'op_mainroad_m', 'op_mainroad_w', 'op_south_w'],
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
    nodeIds: ['gate_ikaze', 'op_muhabura_sq'],
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

// Get building colors based on type - UR Light Theme
export function getBuildingColors(type: BuildingType): { fill: string; stroke: string; strokeWidth: number } {
  switch (type) {
    case 'academic':
      return { fill: '#DCEEFF', stroke: '#0066CC', strokeWidth: 1.5 };
    case 'hostel':
      return { fill: '#DCF0E8', stroke: '#00883A', strokeWidth: 1.5 };
    case 'admin':
      return { fill: '#EEE8FF', stroke: '#6633BB', strokeWidth: 1.5 };
    case 'service':
      return { fill: '#FFF3DC', stroke: '#F5A800', strokeWidth: 1 };
    case 'facility':
      return { fill: '#FFE8DC', stroke: '#CC4400', strokeWidth: 1 };
    case 'conference':
      return { fill: '#FFE8F5', stroke: '#CC0066', strokeWidth: 1.5 };
    case 'external':
      return { fill: '#E8E8E8', stroke: '#999999', strokeWidth: 0.5 };
    default:
      return { fill: '#DCEEFF', stroke: '#0066CC', strokeWidth: 1.5 };
  }
}

// Get room colors based on type - UR Light Theme
export function getRoomColors(type: RoomType): { fill: string; stroke: string } {
  switch (type) {
    case 'lab':
      return { fill: '#E0ECFF', stroke: '#0066CC' };
    case 'lecture':
      return { fill: '#E8F0FF', stroke: '#3388DD' };
    case 'office':
      return { fill: '#F0F4FF', stroke: '#4466AA' };
    case 'toilet':
      return { fill: '#F5F5F5', stroke: '#888888' };
    case 'common':
      return { fill: '#E8F5E8', stroke: '#00883A' };
    case 'hostel':
      return { fill: '#DCF0E8', stroke: '#00883A' };
    case 'server':
      return { fill: '#FFF0F0', stroke: '#CC2200' };
    case 'facility':
      return { fill: '#FFF8E8', stroke: '#F5A800' };
    default:
      return { fill: '#F0F5FF', stroke: '#0066CC' };
  }
}

// Get all rooms flattened
export function getAllRooms(): (CampusRoom & { buildingId: string; buildingName: string })[] {
  return ALL_BUILDINGS.flatMap(building => 
    building.rooms.map(room => ({
      ...room,
      buildingId: building.id,
      buildingName: building.name,
    }))
  );
}

// Search buildings and rooms
export function searchAll(query: string): { buildings: CampusBuilding[]; rooms: (CampusRoom & { buildingId: string; buildingName: string })[] } {
  const q = query.toLowerCase().trim();
  if (!q) return { buildings: [], rooms: [] };

  const buildings = ALL_BUILDINGS.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.shortName.toLowerCase().includes(q) ||
    b.type.toLowerCase().includes(q) ||
    b.number.toString() === q
  );

  const rooms = getAllRooms().filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.num.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q)
  );

  return { buildings, rooms };
}

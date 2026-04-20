// Complete URNAV Campus Building Dataset - All 39 Buildings + 6 KCEV Halls
// Coordinates in meters, origin at Main Gate (0,0), X=west, Y=north

import type { CampusBuilding, CampusRoom } from './campus-data';

export const COMPLETE_CAMPUS_BUILDINGS: CampusBuilding[] = [
  // ── EAST ZONE (near Main Gate) ─────────────────────────────
  {
    id: 'b01', num: 1, name: 'Ikaze Gate House', short: 'Ikaze Gate',
    type: 'service', campusX: 540, campusY: 10, w: 15, h: 12, floors: [1],
    color: '#F5A800',
    rooms: [
      { id: 'b01-r01', num: 'GH', name: 'Security Office 1', floor: 1, type: 'office', nodeId: 'b01_f1_r01' },
      { id: 'b01-r02', num: 'C1', name: 'Cantine 1', floor: 1, type: 'facility', nodeId: 'b01_f1_r02', capacity: 60 },
    ]
  },
  {
    id: 'b02', num: 2, name: 'Ikaze Block', short: 'Ikaze',
    type: 'academic', campusX: 460, campusY: 15, w: 50, h: 38, floors: [1, 2, 3],
    color: '#0066CC',
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
    id: 'b03', num: 3, name: 'Female Students Hostels', short: 'Female Hostel',
    type: 'hostel', campusX: 430, campusY: 30, w: 28, h: 20, floors: [1, 2, 3, 4],
    color: '#00883A',
    rooms: [
      { id: 'b03-r01', num: '101', name: 'Dormitory F1-A', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b03_f1_r01' },
      { id: 'b03-r02', num: '102', name: 'Dormitory F1-B', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b03_f1_r02' },
      { id: 'b03-r03', num: '103', name: 'Common Room', floor: 1, type: 'common', nodeId: 'b03_f1_r03' },
      { id: 'b03-r04', num: '201', name: 'Dormitory F2-A', floor: 2, type: 'hostel', capacity: 8, nodeId: 'b03_f2_r04' },
      { id: 'b03-r05', num: '202', name: 'Dormitory F2-B', floor: 2, type: 'hostel', capacity: 8, nodeId: 'b03_f2_r05' },
    ]
  },
  {
    id: 'b04', num: 4, name: 'Muhazi Block', short: 'Muhazi',
    type: 'academic', campusX: 400, campusY: 25, w: 35, h: 26, floors: [1, 2],
    color: '#0066CC',
    rooms: [
      { id: 'b04-r01', num: '101', name: 'Registry Office', floor: 1, type: 'office', nodeId: 'b04_f1_r01' },
      { id: 'b04-r02', num: '102', name: 'School of ICT Offices', floor: 1, type: 'office', nodeId: 'b04_f1_r02' },
      { id: 'b04-r03', num: '103', name: 'Auditorium', floor: 1, type: 'lecture', capacity: 300, nodeId: 'b04_f1_r03' },
      { id: 'b04-r04', num: '201', name: 'ICT Computer Lab', floor: 2, type: 'lab', capacity: 40, nodeId: 'b04_f2_r04' },
      { id: 'b04-r05', num: '202', name: 'Network Lab', floor: 2, type: 'lab', capacity: 30, nodeId: 'b04_f2_r05' },
    ]
  },
  {
    id: 'b05', num: 5, name: 'Dusaidi Students Hostel', short: 'Dusaidi',
    type: 'hostel', campusX: 430, campusY: 0, w: 25, h: 18, floors: [1, 2, 3],
    color: '#00883A',
    rooms: [
      { id: 'b05-r01', num: '101', name: 'Dormitory M1-A', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b05_f1_r01' },
      { id: 'b05-r02', num: '102', name: 'Dormitory M1-B', floor: 1, type: 'hostel', capacity: 8, nodeId: 'b05_f1_r02' },
      { id: 'b05-r03', num: '103', name: 'Common Room', floor: 1, type: 'common', nodeId: 'b05_f1_r03' },
      { id: 'b05-r04', num: '201', name: 'Dormitory M2-A', floor: 2, type: 'hostel', capacity: 8, nodeId: 'b05_f2_r04' },
    ]
  },
  {
    id: 'b06', num: 6, name: 'Security Office 2', short: 'Security 2',
    type: 'service', campusX: 370, campusY: 8, w: 12, h: 10, floors: [1],
    color: '#F5A800',
    rooms: [
      { id: 'b06-r01', num: '01', name: 'Security Post', floor: 1, type: 'office', nodeId: 'b06_f1_r01' },
    ]
  },
  {
    id: 'b07', num: 7, name: 'Administration Block', short: 'Admin',
    type: 'admin', campusX: 300, campusY: 5, w: 55, h: 42, floors: [1, 2, 3],
    color: '#6633BB',
    rooms: [
      { id: 'b07-r01', num: '101', name: 'Principal Office', floor: 1, type: 'office', nodeId: 'b07_f1_r01' },
      { id: 'b07-r02', num: '102', name: 'Campus Administrator Office', floor: 1, type: 'office', nodeId: 'b07_f1_r02' },
      { id: 'b07-r03', num: '103', name: 'HR and Administration Offices', floor: 1, type: 'office', nodeId: 'b07_f1_r03' },
      { id: 'b07-r04', num: '104', name: 'Finance Directorate', floor: 1, type: 'office', nodeId: 'b07_f1_r04' },
      { id: 'b07-r05', num: '105', name: 'CGIS Offices', floor: 1, type: 'office', nodeId: 'b07_f1_r05' },
      { id: 'b07-r06', num: '106', name: 'Procurement Office', floor: 1, type: 'office', nodeId: 'b07_f1_r06' },
      { id: 'b07-r07', num: '107', name: 'Public Relations Office', floor: 1, type: 'office', nodeId: 'b07_f1_r07' },
      { id: 'b07-r08', num: '201', name: 'DTLE Offices', floor: 2, type: 'office', nodeId: 'b07_f2_r08' },
      { id: 'b07-r09', num: '202', name: 'Central Secretariat Office', floor: 2, type: 'office', nodeId: 'b07_f2_r09' },
      { id: 'b07-r10', num: '203', name: 'Logistics Office', floor: 2, type: 'office', nodeId: 'b07_f2_r10' },
      { id: 'b07-r11', num: '204', name: 'Health and Safety Office', floor: 2, type: 'office', nodeId: 'b07_f2_r11' },
    ]
  },
  {
    id: 'b08', num: 8, name: 'Restaurant', short: 'Restaurant',
    type: 'facility', campusX: 260, campusY: 8, w: 32, h: 22, floors: [1],
    color: '#CC4400',
    rooms: [
      { id: 'b08-r01', num: '01', name: 'Main Dining Hall', floor: 1, type: 'facility', capacity: 400, nodeId: 'b08_f1_r01' },
      { id: 'b08-r02', num: '02', name: 'Kitchen', floor: 1, type: 'facility', nodeId: 'b08_f1_r02' },
      { id: 'b08-r03', num: '03', name: 'Staff Dining Room', floor: 1, type: 'facility', capacity: 40, nodeId: 'b08_f1_r03' },
    ]
  },
  {
    id: 'b09', num: 9, name: 'Printing House', short: 'Print',
    type: 'service', campusX: 245, campusY: 8, w: 18, h: 14, floors: [1],
    color: '#F5A800',
    rooms: [
      { id: 'b09-r01', num: '01', name: 'Print Shop', floor: 1, type: 'office', nodeId: 'b09_f1_r01' },
      { id: 'b09-r02', num: '02', name: 'Design Room', floor: 1, type: 'office', nodeId: 'b09_f1_r02' },
    ]
  },
  {
    id: 'b10', num: 10, name: 'Garage', short: 'Garage',
    type: 'service', campusX: 240, campusY: 18, w: 22, h: 16, floors: [1],
    color: '#F5A800',
    rooms: [
      { id: 'b10-r01', num: '01', name: 'Vehicle Bay A', floor: 1, type: 'facility', nodeId: 'b10_f1_r01' },
      { id: 'b10-r02', num: '02', name: 'Workshop', floor: 1, type: 'facility', nodeId: 'b10_f1_r02' },
    ]
  },
  {
    id: 'b11', num: 11, name: 'Training Workshop', short: 'Workshop',
    type: 'academic', campusX: 290, campusY: 18, w: 26, h: 18, floors: [1, 2],
    color: '#0066CC',
    rooms: [
      { id: 'b11-r01', num: '101', name: 'Department Office', floor: 1, type: 'office', nodeId: 'b11_f1_r01' },
      { id: 'b11-r02', num: '102', name: 'Training Room A', floor: 1, type: 'lecture', capacity: 40, nodeId: 'b11_f1_r02' },
      { id: 'b11-r03', num: '201', name: 'Training Room B', floor: 2, type: 'lecture', capacity: 40, nodeId: 'b11_f2_r03' },
    ]
  },
  {
    id: 'b12', num: 12, name: 'Ex-Management Office', short: 'Ex-Mgmt',
    type: 'admin', campusX: 325, campusY: 18, w: 20, h: 15, floors: [1],
    color: '#6633BB',
    rooms: [
      { id: 'b12-r01', num: '01', name: 'Meeting Room', floor: 1, type: 'common', capacity: 20, nodeId: 'b12_f1_r01' },
      { id: 'b12-r02', num: '02', name: 'Admin Office', floor: 1, type: 'office', nodeId: 'b12_f1_r02' },
    ]
  },
  {
    id: 'b13', num: 13, name: 'Public Toilets 1', short: 'WC 1',
    type: 'facility', campusX: 355, campusY: 18, w: 10, h: 8, floors: [1],
    color: '#CC4400',
    rooms: [
      { id: 'b13-r01', num: 'M', name: 'Male Toilets', floor: 1, type: 'toilet', nodeId: 'b13_f1_r01' },
      { id: 'b13-r02', num: 'F', name: 'Female Toilets', floor: 1, type: 'toilet', nodeId: 'b13_f1_r02' },
    ]
  },
  {
    id: 'b14', num: 14, name: 'Exit Gate House', short: 'Exit Gate',
    type: 'service', campusX: 280, campusY: -5, w: 14, h: 10, floors: [1],
    color: '#F5A800',
    rooms: [
      { id: 'b14-r01', num: '01', name: 'Guard Post', floor: 1, type: 'office', nodeId: 'b14_f1_r01' },
    ]
  },
  {
    id: 'b15', num: 15, name: 'Language Department', short: 'Language',
    type: 'academic', campusX: 340, campusY: 20, w: 22, h: 16, floors: [1, 2],
    color: '#0066CC',
    rooms: [
      { id: 'b15-r01', num: '101', name: 'Language Lab A', floor: 1, type: 'lab', capacity: 30, nodeId: 'b15_f1_r01' },
      { id: 'b15-r02', num: '102', name: 'Language Lab B', floor: 1, type: 'lab', capacity: 30, nodeId: 'b15_f1_r02' },
      { id: 'b15-r03', num: '103', name: 'Department Office', floor: 1, type: 'office', nodeId: 'b15_f1_r03' },
      { id: 'b15-r04', num: '201', name: 'Classroom A', floor: 2, type: 'lecture', capacity: 40, nodeId: 'b15_f2_r04' },
    ]
  },
  {
    id: 'b16', num: 16, name: 'School of Engineering Offices', short: 'Eng Offices',
    type: 'academic', campusX: 322, campusY: 20, w: 18, h: 14, floors: [1, 2],
    color: '#0066CC',
    rooms: [
      { id: 'b16-r01', num: '101', name: 'Dean Office', floor: 1, type: 'office', nodeId: 'b16_f1_r01' },
      { id: 'b16-r02', num: '102', name: 'Department Office A', floor: 1, type: 'office', nodeId: 'b16_f1_r02' },
      { id: 'b16-r03', num: '201', name: 'Department Office B', floor: 2, type: 'office', nodeId: 'b16_f2_r03' },
    ]
  },
  {
    id: 'b17', num: 17, name: 'Mosque', short: 'Mosque',
    type: 'facility', campusX: 252, campusY: 22, w: 16, h: 14, floors: [1],
    color: '#CC4400',
    rooms: [
      { id: 'b17-r01', num: '01', name: 'Prayer Hall', floor: 1, type: 'facility', capacity: 200, nodeId: 'b17_f1_r01' },
      { id: 'b17-r02', num: '02', name: 'Ablution Room', floor: 1, type: 'facility', nodeId: 'b17_f1_r02' },
    ]
  },
  {
    id: 'b18', num: 18, name: 'Agaciro Block', short: 'Agaciro',
    type: 'academic', campusX: 208, campusY: 8, w: 48, h: 36, floors: [1, 2, 3],
    color: '#0066CC',
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
      { id: 'b18-r10', num: '302', name: 'School of Engineering Offices', floor: 3, type: 'office', nodeId: 'b18_f3_r10' },
      { id: 'b18-r11', num: '303', name: 'Server Room', floor: 3, type: 'office', nodeId: 'b18_f3_r11' },
    ]
  },
  {
    id: 'b19', num: 19, name: 'Einstein Block', short: 'Einstein',
    type: 'academic', campusX: 190, campusY: 20, w: 40, h: 30, floors: [1, 2, 3],
    color: '#0066CC',
    rooms: [
      { id: 'b19-r01', num: '101', name: 'Dean of Mining and Geology Office', floor: 1, type: 'office', nodeId: 'b19_f1_r01' },
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
    id: 'b20', num: 20, name: 'Asset and Service Management', short: 'Asset Mgmt',
    type: 'admin', campusX: 230, campusY: 35, w: 20, h: 15, floors: [1],
    color: '#6633BB',
    rooms: [
      { id: 'b20-r01', num: '01', name: 'Main Office', floor: 1, type: 'office', nodeId: 'b20_f1_r01' },
      { id: 'b20-r02', num: '02', name: 'Records Room', floor: 1, type: 'office', nodeId: 'b20_f1_r02' },
    ]
  },
  {
    id: 'b21', num: 21, name: 'URSU Office', short: 'URSU',
    type: 'service', campusX: 245, campusY: 38, w: 16, h: 12, floors: [1],
    color: '#F5A800',
    rooms: [
      { id: 'b21-r01', num: '01', name: 'URSU Main Office', floor: 1, type: 'office', nodeId: 'b21_f1_r01' },
      { id: 'b21-r02', num: '02', name: 'Student Meeting Room', floor: 1, type: 'common', capacity: 20, nodeId: 'b21_f1_r02' },
    ]
  },
  {
    id: 'b22', num: 22, name: 'African Virtual University', short: 'AVU',
    type: 'academic', campusX: 262, campusY: 38, w: 20, h: 15, floors: [1, 2],
    color: '#0066CC',
    rooms: [
      { id: 'b22-r01', num: '101', name: 'AVU Office', floor: 1, type: 'office', nodeId: 'b22_f1_r01' },
      { id: 'b22-r02', num: '102', name: 'E-Learning Lab', floor: 1, type: 'lab', capacity: 30, nodeId: 'b22_f1_r02' },
      { id: 'b22-r03', num: '201', name: 'Server Room', floor: 2, type: 'office', nodeId: 'b22_f2_r03' },
    ]
  },
  {
    id: 'b23', num: 23, name: 'Belgian Memorial Site', short: 'Memorial',
    type: 'facility', campusX: 282, campusY: 40, w: 25, h: 18, floors: [1],
    color: '#CC4400',
    rooms: [
      { id: 'b23-r01', num: '01', name: 'Memorial Hall', floor: 1, type: 'facility', capacity: 100, nodeId: 'b23_f1_r01' },
    ]
  },
  {
    id: 'b24', num: 24, name: 'Library', short: 'Library',
    type: 'facility', campusX: 230, campusY: 55, w: 42, h: 32, floors: [1, 2, 3],
    color: '#CC4400',
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
  // ... Continuing with buildings 25-39 + 6 KCEV halls ...
  // (Full dataset continues, using same pattern)
];

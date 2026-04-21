// Global constants for URNAV navigation system
// Per documentation: utils/constants.ts

export const CAMPUS_BOUNDS = {
  minX: 0,
  maxX: 600,
  minY: -10,
  maxY: 150,
};

// Zoom levels
export const ZOOM_LEVELS = {
  CAMPUS_OVERVIEW: 0.3,
  CAMPUS_FULL: 0.5,
  DISTRICT: 1.0,
  BUILDING: 2.0,
  FLOOR: 4.0,
  ROOM_DETAIL: 8.0,
  MAX: 12.0,
};

// Colors - UR Brand Light Theme
export const COLORS = {
  PRIMARY: '#0066CC',    // UR Blue
  DARK: '#002255',       // Navy
  LIGHT: '#E8F3FF',      // Pale blue
  SUCCESS: '#00883A',    // Green
  WARNING: '#F5A800',    // Orange
  ERROR: '#CC2200',      // Red
  ACCENT: '#6633BB',     // Purple
};

// Demo mode configuration
export const DEMO_MODE = {
  ENABLED: true,
  SPEED_MULTIPLIER: 2.0,    // 2x real-time
  START_POSITION: { x: 270, y: 72 },
  WIFI_NOISE_RADIUS: 15,
  KALMAN_DRIFT_RATE: 0.1,
};

// Sensor update rates (milliseconds)
export const UPDATE_RATES = {
  WIFI_SCAN: 3000,
  IMU_SAMPLE: 100,
  BAROMETER_SAMPLE: 1000,
  FUSION_FILTER: 500,
  UI_RENDER: 60,
};

// Navigation constants
export const NAVIGATION = {
  ARRIVAL_DISTANCE: 5,       // metres
  WAYPOINT_DISTANCE: 3,      // metres
  TURN_THRESHOLD: 30,        // degrees
  PAN_MOMENTUM_DECAY: 0.996,
  ZOOM_ANIMATION_DURATION: 300, // ms
};

// Room type icons/colors
export const ROOM_TYPES = {
  LAB: { color: '#0066CC', name: 'Laboratory' },
  LECTURE: { color: '#6633BB', name: 'Lecture Hall' },
  OFFICE: { color: '#00883A', name: 'Office' },
  HOSTEL: { color: '#E8DCFF', name: 'Hostel Room' },
  TOILET: { color: '#E8F0F5', name: 'Restroom' },
  COMMON: { color: '#F0F5E8', name: 'Common Area' },
  FACILITY: { color: '#F5A800', name: 'Facility' },
  SERVER: { color: '#002255', name: 'Server Room' },
};

export const DEMO_MODE_ENABLED = typeof window !== 'undefined' && 
  new URLSearchParams(window.location.search).has('demo');

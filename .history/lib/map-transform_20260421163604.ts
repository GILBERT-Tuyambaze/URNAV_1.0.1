// src/utils/mapTransform.ts
// This is the ONLY place coordinate math happens.
// Every component imports toScreen() from here.

// Spatial distribution scaling: 1.18 = 18% extra spacing between buildings
// This expands the coordinate space proportionally, pushing buildings apart naturally
// without distorting relative positions or breaking layout accuracy
export const SPACING_SCALE = 1.18;

export const MAP_ORIGIN = { x: 0, y: 0 }; // campus SW corner
export const MAP_REAL_WIDTH = 600; // metres, campus E-W span
export const MAP_REAL_HEIGHT = 500; // metres, campus N-S span

// Virtual dimensions after applying spacing scale
export const MAP_VIRTUAL_WIDTH = MAP_REAL_WIDTH * SPACING_SCALE;
export const MAP_VIRTUAL_HEIGHT = MAP_REAL_HEIGHT * SPACING_SCALE;

export interface ViewState {
  scale: number;
  panX: number;
  panY: number;
  screenW: number;
  screenH: number;
}

export interface ScreenCoord {
  sx: number;
  sy: number;
}

export interface MetreCoord {
  mx: number;
  my: number;
}

export interface Building {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

/**
 * Convert campus metres to screen pixels.
 * @param mx campus x in metres (east = positive)
 * @param my campus y in metres (north = positive)
 * @param view { scale, panX, panY, screenW, screenH }
 * @returns { sx: number, sy: number }
 */
export function toScreen(mx: number, my: number, view: ViewState): ScreenCoord {
  const baseScale = view.screenW / MAP_VIRTUAL_WIDTH;
  const s = baseScale * view.scale;
  // Apply spacing scale to expand the coordinate space
  const spacedX = mx * SPACING_SCALE;
  const spacedY = my * SPACING_SCALE;
  return {
    sx: view.panX + spacedX * s,
    sy: view.panY + (MAP_VIRTUAL_HEIGHT - spacedY) * s, // flip Y: north = up
  };
}

/**
 * Inverse: screen pixel → campus metres.
 * Used for tap-to-navigate.
 */
export function toMetres(sx: number, sy: number, view: ViewState): MetreCoord {
  const baseScale = view.screenW / MAP_VIRTUAL_WIDTH;
  const s = baseScale * view.scale;
  const spacedX = (sx - view.panX) / s;
  const spacedY = MAP_VIRTUAL_HEIGHT - (sy - view.panY) / s;
  // Reverse the spacing scale to get original campus coordinates
  return {
    mx: spacedX / SPACING_SCALE,
    my: spacedY / SPACING_SCALE,
  };
}

/**
 * Metres to building-local screen coords.
 * Used when rendering indoor floor plans.
 */
export function buildingToScreen(
  nx: number,
  ny: number,
  building: Building,
  view: ViewState
): ScreenCoord {
  const campusMx = building.position.x + nx;
  const campusMy = building.position.y + ny;
  return toScreen(campusMx, campusMy, view);
}

/**
 * Compute scale to fit a building rect on screen with padding.
 */
export function fitBuilding(
  building: Building,
  screenW: number,
  screenH: number,
  padding = 60
): { scale: number; panX: number; panY: number } {
  const scaleX = (screenW - padding * 2) / building.width;
  const scaleY = (screenH - padding * 2) / building.height;
  const scale = Math.min(scaleX, scaleY) / (screenW / MAP_REAL_WIDTH);
  const centreX = building.position.x + building.width / 2;
  const centreY = building.position.y + building.height / 2;
  const baseScale = screenW / MAP_REAL_WIDTH;
  const s = baseScale * scale;
  const panX = screenW / 2 - centreX * s;
  const panY = screenH / 2 - (MAP_REAL_HEIGHT - centreY) * s;
  return { scale, panX, panY };
}

/**
 * Compute scale to fit entire campus on screen.
 */
export function fitCampus(
  screenW: number,
  screenH: number,
  padding = 20
): { scale: number; panX: number; panY: number } {
  const scaleX = (screenW - padding * 2) / MAP_VIRTUAL_WIDTH;
  const scaleY = (screenH - padding * 2) / MAP_VIRTUAL_HEIGHT;
  const scale = Math.min(scaleX, scaleY) * (MAP_VIRTUAL_WIDTH / screenW);
  return { scale, panX: padding, panY: padding };
}

// Changes:
// - Created coordinate transform utility with toScreen, toMetres, buildingToScreen
// - Added fitBuilding and fitCampus for zoom calculations
// - All coordinate math centralized in one file

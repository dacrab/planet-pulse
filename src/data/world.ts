// Shared projection for the world map. Equirectangular, cropped to 84N–60S.
// Matches the geometry generated in ./land.ts from Natural Earth 110m land.

export const WORLD_WIDTH = 720;
export const WORLD_HEIGHT = 360;
export const WORLD_TOP_LAT = 84;
export const WORLD_BOTTOM_LAT = -60;

export const projectLon = (lon: number) => ((lon + 180) / 360) * WORLD_WIDTH;

export const projectLat = (lat: number) =>
  ((WORLD_TOP_LAT - lat) / (WORLD_TOP_LAT - WORLD_BOTTOM_LAT)) * WORLD_HEIGHT;

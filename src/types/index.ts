// Grid coordinate key: "col,row"
export type CellKey = `${number},${number}`;

export interface CubeData {
  col: number;
  row: number;
  color: string; // hex color
}

export interface BoardRegion {
  id: string;
  x: number; // world mm
  y: number;
  width: number; // mm
  height: number; // mm
  cols: number;
  rows: number;
}

export type Tool =
  | 'place'
  | 'erase'
  | 'paint'
  | 'select'
  | 'shape-rect'
  | 'shape-circle'
  | 'shape-freeform'
  | 'shape-select';

export type ViewMode = 'perspective' | 'front' | 'top';

export interface ShapePath {
  id: string;
  type: 'rectangle' | 'circle' | 'freeform' | 'imported';
  points: { x: number; y: number }[];
  closed: boolean;
  fill: string;
  // Paper.js serialized path data
  pathData?: string;
}

export interface ProjectMeta {
  name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  gridSize: number; // mm, default 30
}

export const GRID_SIZE = 30; // mm
export const MAX_CUBES = 5000;
export const BULLNOSE_RADIUS = 3; // mm
export const BULLNOSE_SEGMENTS = 3;

export const DEFAULT_PALETTE: string[] = [
  '#D4A574', // Natural Oak
  '#8B6914', // Golden Teak
  '#654321', // Dark Walnut
  '#DEB887', // Burlywood
  '#A0522D', // Sienna
  '#4A2C2A', // Espresso
  '#F5DEB3', // Wheat
  '#BC8F8F', // Rosewood
  '#2F1B14', // Ebony
  '#C19A6B', // Camel
  '#E8E0D5', // Bleached
  '#1A1110', // Charcoal
];

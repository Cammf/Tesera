import { GRID_SIZE } from '../types';

/** Convert world position (mm) to grid column */
export function worldToCol(worldX: number, gridSize = GRID_SIZE): number {
  return Math.floor(worldX / gridSize);
}

/** Convert world position (mm) to grid row */
export function worldToRow(worldY: number, gridSize = GRID_SIZE): number {
  return Math.floor(worldY / gridSize);
}

/** Convert grid column to world X centre (mm) */
export function colToWorldX(col: number, gridSize = GRID_SIZE): number {
  return col * gridSize + gridSize / 2;
}

/** Convert grid row to world Y centre (mm) */
export function rowToWorldY(row: number, gridSize = GRID_SIZE): number {
  return row * gridSize + gridSize / 2;
}

/** Snap a world coordinate to the nearest grid cell centre */
export function snapToGrid(value: number, gridSize = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize + gridSize / 2;
}

/** Bresenham's line algorithm for drag-to-paint without gaps */
export function bresenhamLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number
): { col: number; row: number }[] {
  const cells: { col: number; row: number }[] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push({ col: x0, row: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return cells;
}

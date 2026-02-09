import paper from 'paper';
import { GRID_SIZE } from '../types';

let paperInitialized = false;

/** Initialize Paper.js with an offscreen canvas */
export function initPaper(): void {
  if (paperInitialized) return;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  paper.setup(canvas);
  paperInitialized = true;
}

/** Compute which grid cells fall inside a Paper.js path using centre-point testing */
export function computeFilledCells(
  paperPath: paper.Path | paper.CompoundPath,
  gridSize = GRID_SIZE
): { col: number; row: number }[] {
  const cells: { col: number; row: number }[] = [];
  const bbox = paperPath.bounds;
  const startCol = Math.floor(bbox.x / gridSize);
  const endCol = Math.ceil((bbox.x + bbox.width) / gridSize);
  const startRow = Math.floor(bbox.y / gridSize);
  const endRow = Math.ceil((bbox.y + bbox.height) / gridSize);

  for (let col = startCol; col < endCol; col++) {
    for (let row = startRow; row < endRow; row++) {
      const center = new paper.Point(
        col * gridSize + gridSize / 2,
        row * gridSize + gridSize / 2
      );
      if (paperPath.contains(center)) {
        cells.push({ col, row });
      }
    }
  }
  return cells;
}

/** Create a Paper.js rectangle path */
export function createRectanglePath(
  x: number,
  y: number,
  width: number,
  height: number
): paper.Path.Rectangle {
  initPaper();
  return new paper.Path.Rectangle(
    new paper.Point(x, y),
    new paper.Size(width, height)
  );
}

/** Create a Paper.js circle/ellipse path */
export function createCirclePath(
  cx: number,
  cy: number,
  radius: number
): paper.Path.Circle {
  initPaper();
  return new paper.Path.Circle(new paper.Point(cx, cy), radius);
}

/** Create a smooth freeform path from points using Catmull-Rom → Bezier */
export function createFreeformPath(
  points: { x: number; y: number }[],
  closed = true
): paper.Path {
  initPaper();
  const path = new paper.Path();
  for (const pt of points) {
    path.add(new paper.Point(pt.x, pt.y));
  }
  path.smooth({ type: 'catmull-rom', factor: 0.5 });
  if (closed) path.closePath();
  return path;
}

/** Import an SVG string and return Paper.js paths */
export function importSVG(svgString: string): paper.Item {
  initPaper();
  return paper.project.importSVG(svgString);
}

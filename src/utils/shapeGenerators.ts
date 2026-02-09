import paper from 'paper';
import { initPaper } from './shapes';

/**
 * 3D Shape Family Generators
 * Each returns a Paper.js Path defining a flowing organic form.
 * All dimensions in mm. Shapes are vector-based so they can be
 * resized along their length with varying scale.
 */

/** Leaf shape — teardrop with a pointed tip and rounded base */
export function createLeafPath(
  cx: number,
  cy: number,
  widthMM: number,
  lengthMM: number,
  scaleStart = 1,
  scaleEnd = 0.1
): paper.Path {
  initPaper();
  const hw = widthMM / 2;
  const hl = lengthMM / 2;

  const path = new paper.Path();
  // Tip (top)
  path.add(new paper.Segment(
    new paper.Point(cx, cy - hl),
    new paper.Point(-hw * scaleEnd * 0.3, 0),
    new paper.Point(hw * scaleEnd * 0.3, 0)
  ));
  // Right bulge
  path.add(new paper.Segment(
    new paper.Point(cx + hw * scaleStart, cy + hl * 0.2),
    new paper.Point(0, -hl * 0.5),
    new paper.Point(0, hl * 0.3)
  ));
  // Base (bottom)
  path.add(new paper.Segment(
    new paper.Point(cx, cy + hl),
    new paper.Point(hw * 0.6, 0),
    new paper.Point(-hw * 0.6, 0)
  ));
  // Left bulge
  path.add(new paper.Segment(
    new paper.Point(cx - hw * scaleStart, cy + hl * 0.2),
    new paper.Point(0, hl * 0.3),
    new paper.Point(0, -hl * 0.5)
  ));
  path.closePath();
  return path;
}

/** Crescent / moon shape */
export function createCrescentPath(
  cx: number,
  cy: number,
  widthMM: number,
  lengthMM: number,
  _scaleStart = 1,
  _scaleEnd = 0.6
): paper.Path {
  initPaper();
  const outerR = Math.max(widthMM, lengthMM) / 2;
  const innerR = outerR * 0.65;
  const offset = outerR * 0.35;

  // Outer circle
  const outer = new paper.Path.Circle(new paper.Point(cx, cy), outerR);
  // Inner circle offset to create crescent
  const inner = new paper.Path.Circle(new paper.Point(cx + offset, cy), innerR);
  // Subtract inner from outer
  const crescent = outer.subtract(inner) as paper.Path;
  outer.remove();
  inner.remove();
  return crescent;
}

/** Wave / S-curve band */
export function createWavePath(
  cx: number,
  cy: number,
  widthMM: number,
  lengthMM: number,
  scaleStart = 1,
  scaleEnd = 1
): paper.Path {
  initPaper();
  const hl = lengthMM / 2;
  const amplitude = widthMM / 2;
  const segments = 20;

  // Top edge (wave)
  const topPoints: paper.Point[] = [];
  const bottomPoints: paper.Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = cx - hl + t * lengthMM;
    const scaleFactor = scaleStart + (scaleEnd - scaleStart) * t;
    const wave = Math.sin(t * Math.PI * 3) * amplitude * scaleFactor;
    const bandWidth = widthMM * 0.15 * scaleFactor;
    topPoints.push(new paper.Point(x, cy + wave - bandWidth));
    bottomPoints.push(new paper.Point(x, cy + wave + bandWidth));
  }

  const path = new paper.Path();
  // Top edge left to right
  for (const pt of topPoints) path.add(pt);
  // Bottom edge right to left
  for (let i = bottomPoints.length - 1; i >= 0; i--) path.add(bottomPoints[i]);

  path.closePath();
  path.smooth({ type: 'catmull-rom', factor: 0.5 });
  return path;
}

/** Puddle / organic blob shape */
export function createPuddlePath(
  cx: number,
  cy: number,
  widthMM: number,
  lengthMM: number,
  _scaleStart = 1,
  _scaleEnd = 1
): paper.Path {
  initPaper();
  const rx = widthMM / 2;
  const ry = lengthMM / 2;
  const points = 8;

  const path = new paper.Path();
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    // Add organic irregularity
    const wobble = 0.75 + Math.sin(angle * 3) * 0.15 + Math.cos(angle * 2.3) * 0.1;
    const x = cx + Math.cos(angle) * rx * wobble;
    const y = cy + Math.sin(angle) * ry * wobble;
    path.add(new paper.Point(x, y));
  }
  path.closePath();
  path.smooth({ type: 'catmull-rom', factor: 0.5 });
  return path;
}

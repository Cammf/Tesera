import { useEffect, useRef, useCallback, useState } from 'react';
import paper from 'paper';
import { useShapeStore } from '../../stores/shapeStore';
import { useDesignStore } from '../../stores/designStore';
import { useUIStore } from '../../stores/uiStore';
import {
  initPaper,
  computeFilledCells,
  createRectanglePath,
  createCirclePath,
  createFreeformPath,
} from '../../utils/shapes';
import {
  createLeafPath,
  createCrescentPath,
  createWavePath,
  createPuddlePath,
} from '../../utils/shapeGenerators';
import { GRID_SIZE } from '../../types';
import type { ShapePath, ShapeFamily } from '../../types';

let shapeIdCounter = 0;
function nextShapeId(): string {
  return `shape_${++shapeIdCounter}`;
}

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function ShapeOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paperScopeRef = useRef<paper.PaperScope | null>(null);
  const shapes = useShapeStore((s) => s.shapes);
  const addShape = useShapeStore((s) => s.addShape);
  const drawingPoints = useShapeStore((s) => s.drawingPoints);
  const addDrawingPoint = useShapeStore((s) => s.addDrawingPoint);
  const clearDrawingPoints = useShapeStore((s) => s.clearDrawingPoints);
  const fillCells = useDesignStore((s) => s.fillCells);
  const activeTool = useUIStore((s) => s.activeTool);
  const activeColor = useUIStore((s) => s.activeColor);
  const showShapeOverlay = useUIStore((s) => s.showShapeOverlay);

  const [drag, setDrag] = useState<DragState | null>(null);
  const isShapeTool = activeTool.startsWith('shape-');

  // Initialize Paper.js on the overlay canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const scope = new paper.PaperScope();
    scope.setup(canvasRef.current);
    paperScopeRef.current = scope;
    return () => {
      scope.project?.clear();
    };
  }, []);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (paperScopeRef.current?.view) {
          paperScopeRef.current.view.viewSize = new paper.Size(rect.width, rect.height);
        }
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  // Convert screen coords to grid world coords
  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const scaleX = (40 * GRID_SIZE) / rect.width;
    const scaleY = (30 * GRID_SIZE) / rect.height;
    return { x: x * scaleX, y: y * scaleY };
  }, []);

  // Convert world coords to screen coords for Paper.js drawing
  const worldToScreen = useCallback((wx: number, wy: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scaleX = rect.width / (40 * GRID_SIZE);
    const scaleY = rect.height / (30 * GRID_SIZE);
    return { x: wx * scaleX, y: wy * scaleY };
  }, []);

  const toolToFamily = (tool: string): ShapeFamily => {
    switch (tool) {
      case 'shape-rect': return 'rectangle';
      case 'shape-circle': return 'circle';
      case 'shape-freeform': return 'freeform';
      case 'shape-leaf': return 'leaf';
      case 'shape-crescent': return 'crescent';
      case 'shape-wave': return 'wave';
      case 'shape-puddle': return 'puddle';
      default: return 'freeform';
    }
  };

  // Create Paper.js path in world coords for grid-filling
  const createWorldPath = useCallback(
    (family: ShapeFamily, x1: number, y1: number, x2: number, y2: number) => {
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const w = Math.abs(x2 - x1);
      const h = Math.abs(y2 - y1);
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;

      switch (family) {
        case 'rectangle': return createRectanglePath(minX, minY, w, h);
        case 'circle': return createCirclePath(cx, cy, Math.max(w, h) / 2);
        case 'leaf': return createLeafPath(cx, cy, w, h);
        case 'crescent': return createCrescentPath(cx, cy, w, h);
        case 'wave': return createWavePath(cx, cy, w, h);
        case 'puddle': return createPuddlePath(cx, cy, w, h);
        default: return createRectanglePath(minX, minY, w, h);
      }
    },
    []
  );

  // Create Paper.js path in screen coords for visual preview
  const createScreenPath = useCallback(
    (family: ShapeFamily, sx1: number, sy1: number, sx2: number, sy2: number) => {
      const minX = Math.min(sx1, sx2);
      const minY = Math.min(sy1, sy2);
      const w = Math.abs(sx2 - sx1);
      const h = Math.abs(sy2 - sy1);
      const cx = (sx1 + sx2) / 2;
      const cy = (sy1 + sy2) / 2;

      switch (family) {
        case 'rectangle':
          return new paper.Path.Rectangle(new paper.Point(minX, minY), new paper.Size(w, h));
        case 'circle':
          return new paper.Path.Circle(new paper.Point(cx, cy), Math.max(w, h) / 2);
        case 'leaf': return createLeafPath(cx, cy, w, h);
        case 'crescent': return createCrescentPath(cx, cy, w, h);
        case 'wave': return createWavePath(cx, cy, w, h);
        case 'puddle': return createPuddlePath(cx, cy, w, h);
        default:
          return new paper.Path.Rectangle(new paper.Point(minX, minY), new paper.Size(w, h));
      }
    },
    []
  );

  // Redraw shapes + drag preview
  useEffect(() => {
    const scope = paperScopeRef.current;
    if (!scope || !scope.project) return;
    scope.project.activeLayer.removeChildren();

    const styleShape = (path: paper.Item, color: string) => {
      if ('strokeColor' in path) {
        (path as paper.Path).strokeColor = new paper.Color(color);
        (path as paper.Path).strokeWidth = 2;
        const fc = new paper.Color(color);
        fc.alpha = 0.2;
        (path as paper.Path).fillColor = fc;
      }
    };

    // Draw finalized shapes
    for (const shape of shapes) {
      if (shape.type === 'freeform' && shape.points.length >= 3) {
        const p = new paper.Path();
        for (const pt of shape.points) {
          const s = worldToScreen(pt.x, pt.y);
          p.add(new paper.Point(s.x, s.y));
        }
        p.smooth({ type: 'catmull-rom', factor: 0.5 });
        if (shape.closed) p.closePath();
        styleShape(p, shape.fill);
      } else if (shape.points.length >= 2) {
        const s1 = worldToScreen(shape.points[0].x, shape.points[0].y);
        const s2 = worldToScreen(shape.points[1].x, shape.points[1].y);
        const p = createScreenPath(shape.type, s1.x, s1.y, s2.x, s2.y);
        if (p) styleShape(p, shape.fill);
      }
    }

    // Freeform in-progress preview
    if (drawingPoints.length > 1 && activeTool === 'shape-freeform') {
      const preview = new paper.Path();
      for (const pt of drawingPoints) {
        const s = worldToScreen(pt.x, pt.y);
        preview.add(new paper.Point(s.x, s.y));
      }
      preview.smooth({ type: 'catmull-rom', factor: 0.5 });
      preview.strokeColor = new paper.Color(activeColor);
      preview.strokeWidth = 2;
      preview.dashArray = [6, 4];
    }

    // Drag preview for non-freeform shapes
    if (drag && activeTool !== 'shape-freeform') {
      const s1 = worldToScreen(drag.startX, drag.startY);
      const s2 = worldToScreen(drag.currentX, drag.currentY);
      const family = toolToFamily(activeTool);
      const preview = createScreenPath(family, s1.x, s1.y, s2.x, s2.y);
      if (preview) {
        (preview as paper.Path).strokeColor = new paper.Color(activeColor);
        (preview as paper.Path).strokeWidth = 2;
        (preview as paper.Path).dashArray = [6, 4];
        const fc = new paper.Color(activeColor);
        fc.alpha = 0.1;
        (preview as paper.Path).fillColor = fc;
      }
    }

    scope.view.update();
  }, [shapes, drawingPoints, activeColor, drag, activeTool, worldToScreen, createScreenPath]);

  // Finalize drag shape
  const finalizeShape = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const family = toolToFamily(activeTool);
      const w = Math.abs(endX - startX);
      const h = Math.abs(endY - startY);
      if (w < GRID_SIZE && h < GRID_SIZE) return;

      const id = nextShapeId();
      const shape: ShapePath = {
        id,
        type: family,
        points: [{ x: startX, y: startY }, { x: endX, y: endY }],
        closed: true,
        fill: activeColor,
        widthMM: w,
        heightMM: h,
        lengthMM: Math.max(w, h),
        scaleStart: 1,
        scaleEnd: family === 'leaf' ? 0.1 : 1,
      };
      addShape(shape);

      initPaper();
      const path = createWorldPath(family, startX, startY, endX, endY);
      if (path) {
        const cells = computeFilledCells(path);
        fillCells(cells, activeColor);
        path.remove();
      }
    },
    [activeTool, activeColor, addShape, fillCells, createWorldPath]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isShapeTool || activeTool === 'shape-freeform') return;
      const world = screenToWorld(e.clientX, e.clientY);
      setDrag({ startX: world.x, startY: world.y, currentX: world.x, currentY: world.y });
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    },
    [isShapeTool, activeTool, screenToWorld]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drag) return;
      const world = screenToWorld(e.clientX, e.clientY);
      setDrag((prev) => prev ? { ...prev, currentX: world.x, currentY: world.y } : null);
    },
    [drag, screenToWorld]
  );

  const handlePointerUp = useCallback(
    () => {
      if (!drag) return;
      finalizeShape(drag.startX, drag.startY, drag.currentX, drag.currentY);
      setDrag(null);
    },
    [drag, finalizeShape]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeTool !== 'shape-freeform') return;
      const world = screenToWorld(e.clientX, e.clientY);
      addDrawingPoint(world);
    },
    [activeTool, screenToWorld, addDrawingPoint]
  );

  const handleDoubleClick = useCallback(() => {
    if (activeTool !== 'shape-freeform' || drawingPoints.length < 3) return;

    const id = nextShapeId();
    const shape: ShapePath = {
      id,
      type: 'freeform',
      points: [...drawingPoints],
      closed: true,
      fill: activeColor,
    };
    addShape(shape);

    initPaper();
    const path = createFreeformPath(drawingPoints, true);
    const cells = computeFilledCells(path);
    fillCells(cells, activeColor);
    path.remove();
    clearDrawingPoints();
  }, [activeTool, drawingPoints, activeColor, addShape, fillCells, clearDrawingPoints]);

  if (!showShapeOverlay && !isShapeTool) return null;

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isShapeTool ? 'auto' : 'none',
        zIndex: 10,
        cursor: isShapeTool ? 'crosshair' : 'default',
      }}
    />
  );
}

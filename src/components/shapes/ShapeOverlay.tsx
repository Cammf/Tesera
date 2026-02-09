import { useEffect, useRef, useCallback } from 'react';
import paper from 'paper';
import { useShapeStore } from '../../stores/shapeStore';
import { useDesignStore } from '../../stores/designStore';
import { useUIStore } from '../../stores/uiStore';
import {
  initPaper,
  computeFilledCells,
  createFreeformPath,
} from '../../utils/shapes';
import { GRID_SIZE } from '../../types';
import type { ShapePath } from '../../types';

let shapeIdCounter = 0;
function nextShapeId(): string {
  return `shape_${++shapeIdCounter}`;
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

  // Redraw shapes
  useEffect(() => {
    const scope = paperScopeRef.current;
    if (!scope || !scope.project) return;
    scope.project.activeLayer.removeChildren();

    for (const shape of shapes) {
      let path: paper.Path | null = null;
      switch (shape.type) {
        case 'rectangle': {
          const pts = shape.points;
          if (pts.length >= 2) {
            const x = Math.min(pts[0].x, pts[1].x);
            const y = Math.min(pts[0].y, pts[1].y);
            const w = Math.abs(pts[1].x - pts[0].x);
            const h = Math.abs(pts[1].y - pts[0].y);
            path = new paper.Path.Rectangle(new paper.Point(x, y), new paper.Size(w, h));
          }
          break;
        }
        case 'circle': {
          const pts = shape.points;
          if (pts.length >= 2) {
            const cx = (pts[0].x + pts[1].x) / 2;
            const cy = (pts[0].y + pts[1].y) / 2;
            const r = Math.sqrt((pts[1].x - pts[0].x) ** 2 + (pts[1].y - pts[0].y) ** 2) / 2;
            path = new paper.Path.Circle(new paper.Point(cx, cy), r);
          }
          break;
        }
        case 'freeform': {
          if (shape.points.length >= 3) {
            path = new paper.Path();
            for (const pt of shape.points) {
              path.add(new paper.Point(pt.x, pt.y));
            }
            path.smooth({ type: 'catmull-rom', factor: 0.5 });
            if (shape.closed) path.closePath();
          }
          break;
        }
      }
      if (path) {
        path.strokeColor = new paper.Color(shape.fill);
        path.strokeWidth = 2;
        path.fillColor = new paper.Color(shape.fill);
        path.fillColor.alpha = 0.15;
        path.dashArray = [8, 4];
      }
    }

    // Draw in-progress freeform
    if (drawingPoints.length > 1) {
      const preview = new paper.Path();
      for (const pt of drawingPoints) {
        preview.add(new paper.Point(pt.x, pt.y));
      }
      preview.smooth({ type: 'catmull-rom', factor: 0.5 });
      preview.strokeColor = new paper.Color(activeColor);
      preview.strokeWidth = 2;
      preview.dashArray = [4, 4];
    }

    scope.view.update();
  }, [shapes, drawingPoints, activeColor]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isShapeTool) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Scale from canvas pixels to grid world coordinates
      const scaleX = (40 * GRID_SIZE) / rect.width;
      const scaleY = (30 * GRID_SIZE) / rect.height;
      const worldX = x * scaleX;
      const worldY = y * scaleY;

      if (activeTool === 'shape-freeform') {
        addDrawingPoint({ x: worldX, y: worldY });
      }
    },
    [isShapeTool, activeTool, addDrawingPoint]
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

    // Compute grid fill
    initPaper();
    const path = createFreeformPath(drawingPoints, true);
    const cells = computeFilledCells(path);
    fillCells(cells, activeColor);
    clearDrawingPoints();
  }, [activeTool, drawingPoints, activeColor, addShape, fillCells, clearDrawingPoints]);

  if (!showShapeOverlay && !isShapeTool) return null;

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isShapeTool ? 'auto' : 'none',
        zIndex: 10,
      }}
    />
  );
}

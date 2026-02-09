import { useShapeStore } from '../../stores/shapeStore';
import { useUIStore } from '../../stores/uiStore';
import './ShapePanel.css';

/** Side panel showing shape list, dimension editing, and vector scale controls */
export function ShapePanel() {
  const shapes = useShapeStore((s) => s.shapes);
  const activeShapeId = useShapeStore((s) => s.activeShapeId);
  const setActiveShape = useShapeStore((s) => s.setActiveShape);
  const updateShape = useShapeStore((s) => s.updateShape);
  const removeShape = useShapeStore((s) => s.removeShape);
  const activeTool = useUIStore((s) => s.activeTool);

  const isShapeTool = activeTool.startsWith('shape-');
  const activeShape = shapes.find((s) => s.id === activeShapeId);

  if (!isShapeTool && shapes.length === 0) return null;

  return (
    <div className="shape-panel">
      <div className="shape-panel-header">Shapes</div>

      {/* Active shape dimension controls */}
      {activeShape && (
        <div className="shape-dimensions">
          <div className="dim-title">{activeShape.type} - Dimensions</div>
          <label className="dim-field">
            <span>Width (mm)</span>
            <input
              type="number"
              value={Math.round(activeShape.widthMM ?? 0)}
              onChange={(e) =>
                updateShape(activeShape.id, { widthMM: Number(e.target.value) })
              }
              min={30}
              step={30}
            />
          </label>
          <label className="dim-field">
            <span>Height (mm)</span>
            <input
              type="number"
              value={Math.round(activeShape.heightMM ?? 0)}
              onChange={(e) =>
                updateShape(activeShape.id, { heightMM: Number(e.target.value) })
              }
              min={30}
              step={30}
            />
          </label>
          <label className="dim-field">
            <span>Length (mm)</span>
            <input
              type="number"
              value={Math.round(activeShape.lengthMM ?? 0)}
              onChange={(e) =>
                updateShape(activeShape.id, { lengthMM: Number(e.target.value) })
              }
              min={30}
              step={30}
            />
          </label>

          {/* Vector scale along length */}
          <div className="dim-title" style={{ marginTop: 8 }}>
            Scale Along Length
          </div>
          <label className="dim-field">
            <span>Start</span>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.05}
              value={activeShape.scaleStart ?? 1}
              onChange={(e) =>
                updateShape(activeShape.id, { scaleStart: Number(e.target.value) })
              }
            />
            <span className="dim-val">
              {((activeShape.scaleStart ?? 1) * 100).toFixed(0)}%
            </span>
          </label>
          <label className="dim-field">
            <span>End</span>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.05}
              value={activeShape.scaleEnd ?? 1}
              onChange={(e) =>
                updateShape(activeShape.id, { scaleEnd: Number(e.target.value) })
              }
            />
            <span className="dim-val">
              {((activeShape.scaleEnd ?? 1) * 100).toFixed(0)}%
            </span>
          </label>
        </div>
      )}

      {/* Shape list */}
      <div className="shape-list">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            className={`shape-item ${activeShapeId === shape.id ? 'active' : ''}`}
            onClick={() => setActiveShape(shape.id)}
          >
            <div
              className="shape-color-dot"
              style={{ background: shape.fill }}
            />
            <span className="shape-type">{shape.type}</span>
            {shape.widthMM && (
              <span className="shape-dims">
                {Math.round(shape.widthMM)}x{Math.round(shape.heightMM ?? 0)}mm
              </span>
            )}
            <button
              className="shape-delete"
              onClick={(e) => {
                e.stopPropagation();
                removeShape(shape.id);
              }}
              title="Delete shape"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {isShapeTool && (
        <div className="shape-hint">
          {activeTool === 'shape-freeform'
            ? 'Click to add points. Double-click to close shape.'
            : 'Click and drag to draw shape.'}
        </div>
      )}
    </div>
  );
}

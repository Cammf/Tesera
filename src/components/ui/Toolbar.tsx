import { useUIStore } from '../../stores/uiStore';
import { useDesignStore } from '../../stores/designStore';
import { useShapeStore } from '../../stores/shapeStore';
import type { Tool, ViewMode } from '../../types';
import './Toolbar.css';

const TOOLS: { tool: Tool; label: string; icon: string }[] = [
  { tool: 'place', label: 'Place', icon: '+' },
  { tool: 'erase', label: 'Erase', icon: 'x' },
  { tool: 'paint', label: 'Paint', icon: '~' },
  { tool: 'select', label: 'Select', icon: '^' },
];

const SHAPE_TOOLS: { tool: Tool; label: string; icon: string }[] = [
  { tool: 'shape-rect', label: 'Rectangle', icon: '[]' },
  { tool: 'shape-circle', label: 'Circle', icon: 'O' },
  { tool: 'shape-freeform', label: 'Freeform', icon: '~' },
  { tool: 'shape-leaf', label: 'Leaf', icon: 'Lf' },
  { tool: 'shape-crescent', label: 'Crescent', icon: 'Cr' },
  { tool: 'shape-wave', label: 'Wave', icon: 'Wv' },
  { tool: 'shape-puddle', label: 'Puddle', icon: 'Pd' },
];

const VIEWS: { mode: ViewMode; label: string }[] = [
  { mode: 'perspective', label: '3D' },
  { mode: 'front', label: 'Front' },
  { mode: 'top', label: 'Top' },
];

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setTool = useUIStore((s) => s.setTool);
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);
  const showGrid = useUIStore((s) => s.showGrid);
  const toggleGrid = useUIStore((s) => s.toggleGrid);
  const cubes = useDesignStore((s) => s.cubes);
  const clearAll = useDesignStore((s) => s.clearAll);
  const clearAllShapes = useShapeStore((s) => s.clearAllShapes);

  const cubeCount = Object.keys(cubes).length;

  const handleClearAll = () => {
    clearAll();
    clearAllShapes();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Tools</span>
        <div className="toolbar-group">
          {TOOLS.map(({ tool, label, icon }) => (
            <button
              key={tool}
              className={`tool-btn ${activeTool === tool ? 'active' : ''}`}
              onClick={() => setTool(tool)}
              title={label}
            >
              <span className="tool-icon">{icon}</span>
              <span className="tool-text">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">Shapes</span>
        <div className="toolbar-group">
          {SHAPE_TOOLS.map(({ tool, label, icon }) => (
            <button
              key={tool}
              className={`tool-btn ${activeTool === tool ? 'active' : ''}`}
              onClick={() => setTool(tool)}
              title={label}
            >
              <span className="tool-icon">{icon}</span>
              <span className="tool-text">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">View</span>
        <div className="toolbar-group">
          {VIEWS.map(({ mode, label }) => (
            <button
              key={mode}
              className={`tool-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {label}
            </button>
          ))}
          <button
            className={`tool-btn ${showGrid ? 'active' : ''}`}
            onClick={toggleGrid}
            title="Toggle Grid"
          >
            Grid
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <span className="toolbar-label">
          Cubes: {cubeCount}
        </span>
        <button className="tool-btn danger" onClick={handleClearAll} title="Clear All">
          Clear
        </button>
      </div>
    </div>
  );
}

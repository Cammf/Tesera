import { useUIStore } from '../../stores/uiStore';
import './ColorPalette.css';

export function ColorPalette() {
  const palette = useUIStore((s) => s.palette);
  const activeColor = useUIStore((s) => s.activeColor);
  const setColor = useUIStore((s) => s.setColor);

  return (
    <div className="color-palette">
      <span className="palette-label">Palette</span>
      <div className="palette-swatches">
        {palette.map((color) => (
          <button
            key={color}
            className={`swatch ${activeColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => setColor(color)}
            title={color}
          />
        ))}
      </div>
      <div className="palette-current">
        <div
          className="current-swatch"
          style={{ backgroundColor: activeColor }}
        />
        <input
          type="color"
          value={activeColor}
          onChange={(e) => setColor(e.target.value)}
          className="color-input"
          title="Custom color"
        />
      </div>
    </div>
  );
}

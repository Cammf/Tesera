import { useRef } from 'react';
import { useDesignStore } from '../../stores/designStore';
import { useShapeStore } from '../../stores/shapeStore';
import { useProjectStore } from '../../stores/projectStore';
import { saveToFile, loadFromFile } from '../../utils/serialization';
import type { SaveData } from '../../utils/serialization';
import './SaveLoadPanel.css';

export function SaveLoadPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const meta = useProjectStore((s) => s.meta);
  const setName = useProjectStore((s) => s.setName);
  const getCubesArray = useDesignStore((s) => s.getCubesArray);
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const shapes = useShapeStore((s) => s.shapes);

  const handleSave = () => {
    const data: SaveData = {
      meta: { ...meta, updatedAt: new Date().toISOString() },
      cubes: getCubesArray(),
      shapes,
    };
    saveToFile(data);
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await loadFromFile(file);
      loadDesign(data.cubes);
      if (data.meta?.name) setName(data.meta.name);
    } catch (err) {
      console.error('Failed to load file:', err);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="save-load-panel">
      <input
        className="project-name-input"
        type="text"
        value={meta.name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
      />
      <div className="save-load-actions">
        <button className="sl-btn" onClick={handleSave} title="Save project">
          Save
        </button>
        <button
          className="sl-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Load project"
        >
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.tesera.json"
          onChange={handleLoad}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

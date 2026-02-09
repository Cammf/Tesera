import { create } from 'zustand';
import type { Tool, ViewMode } from '../types';
import { DEFAULT_PALETTE } from '../types';

interface UIState {
  activeTool: Tool;
  activeColor: string;
  palette: string[];
  viewMode: ViewMode;
  showGrid: boolean;
  showShapeOverlay: boolean;
  isDragging: boolean;

  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setPalette: (palette: string[]) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleGrid: () => void;
  toggleShapeOverlay: () => void;
  setDragging: (dragging: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTool: 'place',
  activeColor: DEFAULT_PALETTE[0],
  palette: DEFAULT_PALETTE,
  viewMode: 'perspective',
  showGrid: true,
  showShapeOverlay: true,
  isDragging: false,

  setTool: (tool) => set({ activeTool: tool }),
  setColor: (color) => set({ activeColor: color }),
  setPalette: (palette) => set({ palette }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleShapeOverlay: () => set((s) => ({ showShapeOverlay: !s.showShapeOverlay })),
  setDragging: (dragging) => set({ isDragging: dragging }),
}));

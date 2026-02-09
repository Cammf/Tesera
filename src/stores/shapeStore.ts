import { create } from 'zustand';
import type { ShapePath } from '../types';

interface ShapeState {
  shapes: ShapePath[];
  activeShapeId: string | null;
  drawingPoints: { x: number; y: number }[];

  addShape: (shape: ShapePath) => void;
  removeShape: (id: string) => void;
  updateShape: (id: string, updates: Partial<ShapePath>) => void;
  setActiveShape: (id: string | null) => void;
  addDrawingPoint: (point: { x: number; y: number }) => void;
  clearDrawingPoints: () => void;
  clearAllShapes: () => void;
}

export const useShapeStore = create<ShapeState>((set) => ({
  shapes: [],
  activeShapeId: null,
  drawingPoints: [],

  addShape: (shape) =>
    set((state) => ({ shapes: [...state.shapes, shape] })),

  removeShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== id),
      activeShapeId: state.activeShapeId === id ? null : state.activeShapeId,
    })),

  updateShape: (id, updates) =>
    set((state) => ({
      shapes: state.shapes.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  setActiveShape: (id) => set({ activeShapeId: id }),

  addDrawingPoint: (point) =>
    set((state) => ({ drawingPoints: [...state.drawingPoints, point] })),

  clearDrawingPoints: () => set({ drawingPoints: [] }),

  clearAllShapes: () => set({ shapes: [], activeShapeId: null }),
}));

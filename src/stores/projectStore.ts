import { create } from 'zustand';
import type { ProjectMeta } from '../types';
import { GRID_SIZE } from '../types';

interface ProjectState {
  meta: ProjectMeta;
  setName: (name: string) => void;
  updateTimestamp: () => void;
  setGridSize: (size: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  meta: {
    name: 'Untitled Design',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '0.2.0',
    gridSize: GRID_SIZE,
  },

  setName: (name) =>
    set((state) => ({
      meta: { ...state.meta, name, updatedAt: new Date().toISOString() },
    })),

  updateTimestamp: () =>
    set((state) => ({
      meta: { ...state.meta, updatedAt: new Date().toISOString() },
    })),

  setGridSize: (size) =>
    set((state) => ({
      meta: { ...state.meta, gridSize: size, updatedAt: new Date().toISOString() },
    })),
}));

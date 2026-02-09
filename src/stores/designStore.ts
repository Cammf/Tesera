import { create } from 'zustand';
import { temporal } from 'zundo';
import type { CubeData } from '../types';

interface DesignState {
  cubes: Record<string, CubeData>;
  placeCube: (col: number, row: number, color: string) => void;
  removeCube: (col: number, row: number) => void;
  paintCube: (col: number, row: number, color: string) => void;
  fillCells: (cells: { col: number; row: number }[], color: string) => void;
  clearAll: () => void;
  getCubesArray: () => CubeData[];
  loadDesign: (cubes: CubeData[]) => void;
  cubeCount: () => number;
}

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

export const useDesignStore = create<DesignState>()(
  temporal(
    (set, get) => ({
      cubes: {} as Record<string, CubeData>,

      placeCube: (col: number, row: number, color: string) =>
        set((state) => {
          const key = cellKey(col, row);
          return { cubes: { ...state.cubes, [key]: { col, row, color } } };
        }),

      removeCube: (col: number, row: number) =>
        set((state) => {
          const key = cellKey(col, row);
          if (!(key in state.cubes)) return state;
          const next = { ...state.cubes };
          delete next[key];
          return { cubes: next };
        }),

      paintCube: (col: number, row: number, color: string) =>
        set((state) => {
          const key = cellKey(col, row);
          if (!(key in state.cubes)) return state;
          return {
            cubes: { ...state.cubes, [key]: { ...state.cubes[key], color } },
          };
        }),

      fillCells: (cells: { col: number; row: number }[], color: string) =>
        set((state) => {
          const next = { ...state.cubes };
          for (const { col, row } of cells) {
            const key = cellKey(col, row);
            next[key] = { col, row, color };
          }
          return { cubes: next };
        }),

      clearAll: () => set({ cubes: {} }),

      getCubesArray: () => Object.values(get().cubes),

      loadDesign: (cubes: CubeData[]) => {
        const record: Record<string, CubeData> = {};
        for (const cube of cubes) {
          record[cellKey(cube.col, cube.row)] = cube;
        }
        set({ cubes: record });
      },

      cubeCount: () => Object.keys(get().cubes).length,
    }),
    { limit: 50 }
  )
);

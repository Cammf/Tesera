import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import type { CubeData, CellKey } from '../types';

interface DesignState {
  cubes: Map<CellKey, CubeData>;
  placeCube: (col: number, row: number, color: string) => void;
  removeCube: (col: number, row: number) => void;
  paintCube: (col: number, row: number, color: string) => void;
  fillCells: (cells: { col: number; row: number }[], color: string) => void;
  clearAll: () => void;
  getCube: (col: number, row: number) => CubeData | undefined;
  getCubesArray: () => CubeData[];
  loadDesign: (cubes: CubeData[]) => void;
}

function cellKey(col: number, row: number): CellKey {
  return `${col},${row}`;
}

export const useDesignStore = create<DesignState>()(
  temporal(
    immer((set, get) => ({
      cubes: new Map<CellKey, CubeData>(),

      placeCube: (col: number, row: number, color: string) =>
        set((state) => {
          const key = cellKey(col, row);
          state.cubes.set(key, { col, row, color });
        }),

      removeCube: (col: number, row: number) =>
        set((state) => {
          state.cubes.delete(cellKey(col, row));
        }),

      paintCube: (col: number, row: number, color: string) =>
        set((state) => {
          const key = cellKey(col, row);
          const cube = state.cubes.get(key);
          if (cube) {
            cube.color = color;
          }
        }),

      fillCells: (cells: { col: number; row: number }[], color: string) =>
        set((state) => {
          for (const { col, row } of cells) {
            const key = cellKey(col, row);
            state.cubes.set(key, { col, row, color });
          }
        }),

      clearAll: () =>
        set((state) => {
          state.cubes.clear();
        }),

      getCube: (col: number, row: number) => {
        return get().cubes.get(cellKey(col, row));
      },

      getCubesArray: () => {
        return Array.from(get().cubes.values());
      },

      loadDesign: (cubes: CubeData[]) =>
        set((state) => {
          state.cubes.clear();
          for (const cube of cubes) {
            state.cubes.set(cellKey(cube.col, cube.row), cube);
          }
        }),
    })),
    { limit: 50 }
  )
);

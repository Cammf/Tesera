import { useMemo, useRef } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '../../stores/uiStore';
import { useDesignStore } from '../../stores/designStore';
import { worldToCol, worldToRow } from '../../utils/grid';
import { GRID_SIZE } from '../../types';

interface GridPlaneProps {
  cols?: number;
  rows?: number;
}

/** Interactive grid plane — handles place, erase, and paint on grid */
export function GridPlane({ cols = 40, rows = 30 }: GridPlaneProps) {
  const showGrid = useUIStore((s) => s.showGrid);
  const activeTool = useUIStore((s) => s.activeTool);
  const activeColor = useUIStore((s) => s.activeColor);
  const isDragging = useUIStore((s) => s.isDragging);
  const setDragging = useUIStore((s) => s.setDragging);
  const placeCube = useDesignStore((s) => s.placeCube);
  const removeCube = useDesignStore((s) => s.removeCube);
  const lastCell = useRef<{ col: number; row: number } | null>(null);

  const width = cols * GRID_SIZE;
  const height = rows * GRID_SIZE;

  // Generate grid line texture
  const gridTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#f0ede8';
    ctx.fillRect(0, 0, size, size);

    // Grid lines
    ctx.strokeStyle = '#d0ccc4';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(cols, rows);
    return tex;
  }, [cols, rows]);

  const handleGridAction = (col: number, row: number, button: number) => {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    if (button === 2) {
      removeCube(col, row);
      return;
    }
    switch (activeTool) {
      case 'place':
        placeCube(col, row, activeColor);
        break;
      case 'erase':
        removeCube(col, row);
        break;
    }
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (activeTool !== 'place' && activeTool !== 'erase') return;
    e.stopPropagation();
    const col = worldToCol(e.point.x);
    const row = worldToRow(e.point.y);
    lastCell.current = { col, row };
    setDragging(true);
    handleGridAction(col, row, e.nativeEvent.button);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    if (activeTool !== 'place' && activeTool !== 'erase') return;
    e.stopPropagation();
    const col = worldToCol(e.point.x);
    const row = worldToRow(e.point.y);
    if (lastCell.current && (lastCell.current.col !== col || lastCell.current.row !== row)) {
      handleGridAction(col, row, e.nativeEvent.button);
      lastCell.current = { col, row };
    }
  };

  const onPointerUp = () => {
    setDragging(false);
    lastCell.current = null;
  };

  return (
    <mesh
      position={[width / 2, height / 2, -0.5]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
    >
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={showGrid ? gridTexture : undefined}
        color={showGrid ? '#ffffff' : '#f0ede8'}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

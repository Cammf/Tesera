import { useMemo } from 'react';
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

/** Interactive grid plane that cubes sit on, also handles click-to-place on empty cells */
export function GridPlane({ cols = 40, rows = 30 }: GridPlaneProps) {
  const showGrid = useUIStore((s) => s.showGrid);
  const activeTool = useUIStore((s) => s.activeTool);
  const activeColor = useUIStore((s) => s.activeColor);
  const placeCube = useDesignStore((s) => s.placeCube);

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

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (activeTool !== 'place') return;
    e.stopPropagation();
    const col = worldToCol(e.point.x);
    const row = worldToRow(e.point.y);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      placeCube(col, row, activeColor);
    }
  };

  return (
    <mesh
      position={[width / 2, height / 2, -0.5]}
      rotation={[0, 0, 0]}
      onClick={handleClick}
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

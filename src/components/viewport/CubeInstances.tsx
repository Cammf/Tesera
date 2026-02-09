import { useRef, useMemo, useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import { useDesignStore } from '../../stores/designStore';
import { useUIStore } from '../../stores/uiStore';
import { colToWorldX, rowToWorldY, worldToCol, worldToRow } from '../../utils/grid';
import { createBeechWoodTexture, createBeechNormalMap } from '../../utils/woodTexture';
import { GRID_SIZE, MAX_CUBES, BULLNOSE_RADIUS, BULLNOSE_SEGMENTS } from '../../types';

const dummy = new THREE.Object3D();
const tempColor = new THREE.Color();

export function CubeInstances() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const cubes = useDesignStore((s) => s.cubes);
  const placeCube = useDesignStore((s) => s.placeCube);
  const removeCube = useDesignStore((s) => s.removeCube);
  const paintCube = useDesignStore((s) => s.paintCube);
  const activeTool = useUIStore((s) => s.activeTool);
  const activeColor = useUIStore((s) => s.activeColor);
  const isDragging = useUIStore((s) => s.isDragging);
  const setDragging = useUIStore((s) => s.setDragging);
  const lastCell = useRef<{ col: number; row: number } | null>(null);

  const cubesArray = useMemo(() => Object.values(cubes), [cubes]);

  const geometry = useMemo(
    () => new RoundedBoxGeometry(GRID_SIZE, GRID_SIZE, GRID_SIZE, BULLNOSE_SEGMENTS, BULLNOSE_RADIUS),
    []
  );

  const woodTexture = useMemo(() => createBeechWoodTexture(), []);
  const normalMap = useMemo(() => createBeechNormalMap(), []);

  // Update instance matrices and colors whenever cubes change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    cubesArray.forEach((cube, i) => {
      dummy.position.set(
        colToWorldX(cube.col),
        rowToWorldY(cube.row),
        GRID_SIZE / 2
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      tempColor.set(cube.color);
      mesh.setColorAt(i, tempColor);
    });

    mesh.count = cubesArray.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cubesArray]);

  const handleInteraction = (col: number, row: number, button: number) => {
    if (button === 2) {
      // Right-click always erases
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
      case 'paint':
        paintCube(col, row, activeColor);
        break;
    }
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (activeTool !== 'place' && activeTool !== 'erase' && activeTool !== 'paint') return;
    e.stopPropagation();
    const col = worldToCol(e.point.x);
    const row = worldToRow(e.point.y);
    lastCell.current = { col, row };
    setDragging(true);
    handleInteraction(col, row, e.nativeEvent.button);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    if (activeTool !== 'place' && activeTool !== 'erase' && activeTool !== 'paint') return;
    e.stopPropagation();
    const col = worldToCol(e.point.x);
    const row = worldToRow(e.point.y);
    if (lastCell.current && (lastCell.current.col !== col || lastCell.current.row !== row)) {
      handleInteraction(col, row, e.nativeEvent.button);
      lastCell.current = { col, row };
    }
  };

  const onPointerUp = () => {
    setDragging(false);
    lastCell.current = null;
  };

  if (cubesArray.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, MAX_CUBES]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
    >
      <meshPhysicalMaterial
        map={woodTexture}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.3, 0.3)}
        vertexColors
        roughness={0.6}
        clearcoat={0.3}
        clearcoatRoughness={0.35}
      />
    </instancedMesh>
  );
}

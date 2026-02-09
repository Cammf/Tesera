import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useUIStore } from '../../stores/uiStore';
import { CubeInstances } from './CubeInstances';
import { GridPlane } from './GridPlane';
import { SceneLighting } from './SceneLighting';
import { GRID_SIZE } from '../../types';
import * as THREE from 'three';

const COLS = 40;
const ROWS = 30;
const CENTER_X = (COLS * GRID_SIZE) / 2;
const CENTER_Y = (ROWS * GRID_SIZE) / 2;

function cameraForView(viewMode: string) {
  switch (viewMode) {
    case 'front':
      return { position: [CENTER_X, CENTER_Y, 800] as [number, number, number] };
    case 'top':
      return { position: [CENTER_X, CENTER_Y + 800, 10] as [number, number, number] };
    case 'perspective':
    default:
      return { position: [CENTER_X + 400, CENTER_Y + 300, 600] as [number, number, number] };
  }
}

export function Viewport() {
  const viewMode = useUIStore((s) => s.viewMode);
  const activeTool = useUIStore((s) => s.activeTool);
  const setDragging = useUIStore((s) => s.setDragging);

  const isDrawingTool = activeTool === 'place' || activeTool === 'erase' || activeTool === 'paint';
  const cam = cameraForView(viewMode);

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      onPointerUp={() => setDragging(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas
        camera={{
          position: cam.position,
          fov: 45,
          near: 1,
          far: 10000,
        }}
        frameloop="demand"
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <SceneLighting />
        <GridPlane cols={COLS} rows={ROWS} />
        <CubeInstances />
        <OrbitControls
          target={[CENTER_X, CENTER_Y, 0]}
          enablePan
          enableRotate={!isDrawingTool}
          enableZoom
          minDistance={100}
          maxDistance={3000}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

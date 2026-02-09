import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useUIStore } from '../../stores/uiStore';
import { GRID_SIZE } from '../../types';
import * as THREE from 'three';

const COLS = 40;
const ROWS = 30;
const CENTER_X = (COLS * GRID_SIZE) / 2;
const CENTER_Y = (ROWS * GRID_SIZE) / 2;

/** Imperatively moves the camera when viewMode changes */
export function CameraController() {
  const { camera } = useThree();
  const viewMode = useUIStore((s) => s.viewMode);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;

    switch (viewMode) {
      case 'front':
        cam.position.set(CENTER_X, CENTER_Y, 1200);
        cam.up.set(0, 1, 0);
        cam.lookAt(CENTER_X, CENTER_Y, 0);
        break;
      case 'top':
        cam.position.set(CENTER_X, CENTER_Y + 0.01, 1200);
        // Look straight down — set up vector to -Z so "top" faces screen-up
        cam.up.set(0, 0, -1);
        cam.lookAt(CENTER_X, CENTER_Y, 0);
        break;
      case 'perspective':
      default:
        cam.position.set(CENTER_X + 400, CENTER_Y + 300, 800);
        cam.up.set(0, 1, 0);
        cam.lookAt(CENTER_X, CENTER_Y, 0);
        break;
    }

    cam.updateProjectionMatrix();
  }, [viewMode, camera]);

  return null;
}

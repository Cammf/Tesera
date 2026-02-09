import { Environment, ContactShadows } from '@react-three/drei';

export function SceneLighting() {
  return (
    <>
      <Environment preset="studio" />
      {/* Key light */}
      <directionalLight
        position={[500, 800, 1000]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Fill light */}
      <directionalLight
        position={[-300, 400, 500]}
        intensity={0.4}
      />
      {/* Rim light */}
      <directionalLight
        position={[0, -200, -500]}
        intensity={0.3}
      />
      <ambientLight intensity={0.2} />
      <ContactShadows
        position={[0, 0, -1]}
        opacity={0.4}
        scale={2000}
        blur={2}
        far={1000}
      />
    </>
  );
}

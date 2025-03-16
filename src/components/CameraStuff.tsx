import { CameraControls, PerspectiveCamera } from '@react-three/drei';

export const CameraStuff = () => {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[1.5, 2, 1.5]}
        fov={34}
        near={0.001}
      />
      <CameraControls
        makeDefault
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.5}
        mouseButtons={{
          left: 1,
          middle: 0,
          right: 0,
          wheel: 16
        }}
        touches={{
          one: 0,
          two: 8192,
          three: 0
        }}
      />
    </>
  );
};

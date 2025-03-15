import { CameraControls, PerspectiveCamera } from '@react-three/drei';

export const CameraStuff = () => {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 2, 8]}
        fov={34}
        near={0.001}
      />
      <CameraControls
        makeDefault
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.5}
      />
    </>
  );
};

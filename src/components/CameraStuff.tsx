import { CameraControls, PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
export const CameraStuff = () => {
  const controls = useThree((state) => state.controls);

  useEffect(() => {
    if (controls) {
      //@ts-ignore
      controls.dollyTo(2, true);
    }
  }, [controls]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0.5, 4, 1.5]}
        fov={34}
        near={0.001}
      />
      <CameraControls
        makeDefault
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.5}
        minDistance={0.7}
        maxDistance={2.5}
        mouseButtons={{
          left: 1,
          middle: 0,
          right: 0,
          wheel: 8
        }}
        touches={{
          one: 0,
          two: 0,
          three: 0
        }}
      />
    </>
  );
};

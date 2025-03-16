import { CameraControls, PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

export const CameraStuff = () => {
  const controls = useThree((state) => state.controls);
  const cameraControlsRef = useRef<CameraControls | null>(null);

  useEffect(() => {
    if (controls) {
      //@ts-ignore
      controls.dollyTo(20, true);
      //@ts-ignore
      controls.setTarget(0, 2, 0);
    }

    // Set the target on the camera controls ref
    if (cameraControlsRef.current) {
      cameraControlsRef.current.setTarget(0, 2, 0, true);
    }
  }, [controls, cameraControlsRef]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[15, 10, -15]}
        fov={25}
        near={1}
        far={1000}
      />
      <CameraControls
        ref={cameraControlsRef}
        makeDefault
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.75}
        minDistance={5}
        maxDistance={40}
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

import { Environment, useHelper } from '@react-three/drei';
import { useControls } from 'leva';
import { useRef } from 'react';
import { DirectionalLight, DirectionalLightHelper } from 'three';

export const Lights = () => {
  const directionalLightRef = useRef<DirectionalLight>(null!);

  //   useHelper(directionalLightRef, DirectionalLightHelper, 1, 'red');

  //   const {
  //     ambientIntensity,
  //     directionalLightIntensity,
  //     directionalLightPosition,
  //     environmentIntensity
  //   } = useControls('Lights', {
  //     ambientIntensity: { value: 2, min: 0, max: 10, step: 0.1 },
  //     directionalLightIntensity: { value: 2.5, min: 0, max: 10, step: 0.1 },
  //     directionalLightPosition: {
  //       //   value: [3, 8, -2],
  //       value: [-5, 3, -1],
  //       min: -50,
  //       max: 50,
  //       step: 0.1
  //     },
  //     environmentIntensity: { value: 0, min: 0, max: 1, step: 0.01 }
  //   });

  return (
    <>
      {/* <Environment
        files="drakensberg_solitary_mountain_1k.jpg"
        // environmentIntensity={environmentIntensity}
      /> */}
      <ambientLight
        // intensity={ambientIntensity}
        intensity={1.7}
      />
      <directionalLight
        ref={directionalLightRef}
        // and a cursor light?
        position={[-5, 3, -1]}
        intensity={2.5}
        // position={directionalLightPosition}
        // intensity={directionalLightIntensity}
        // castShadow={true}
        // shadow-mapSize={[2048, 2048]}
        // shadow-camera-left={-5}
        // shadow-camera-right={5}
        // shadow-camera-top={5}
        // shadow-camera-bottom={-5}
        // shadow-camera-near={0.1}
        // shadow-camera-far={30}
        // shadow-bias={-0.1}
      />
    </>
  );
};

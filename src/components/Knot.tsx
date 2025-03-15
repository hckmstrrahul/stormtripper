import { ContactShadows, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { MeshMatcapMaterial, ShaderMaterial } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import { useResponsiveScale } from '../lib/utils';

export const Knot = () => {
  const matcapTexture = useTexture('metal.jpg');
  const { scale } = useResponsiveScale();

  const uniforms = useMemo(
    () => ({
      time: { value: 0 }
    }),
    []
  );

  const shaderRef = useRef<ShaderMaterial>(null!);

  useFrame((state) => {
    if (!shaderRef.current) return;
    shaderRef.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <>
      <mesh scale={scale}>
        <torusKnotGeometry args={[0.8, 0.13, 150, 30, 1]} />
        <CustomShaderMaterial
          ref={shaderRef}
          baseMaterial={MeshMatcapMaterial}
          matcap={matcapTexture}
          uniforms={uniforms}
          color={'#F8827A'}
          silent
          vertexShader={
            /* glsl */ `
            uniform float time;
            void main() {
              vec3 pos = position;

              pos.x += cos(time  / 4.0)  * 0.125;
              pos.y += sin(time / 4.0)  * 0.225;
              pos.z += sin(time / 4.0)  * 0.05;
              
              float angle = time / 2. + length(pos) * 3.0;
              vec3 offset = vec3(cos(angle), sin(angle), cos(angle) * sin(angle)) * 0.1;
              vec3 newPosition = pos + csm_Normal * offset;
              
              csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }`
          }
        />
      </mesh>
      <ContactShadows
        opacity={0.6}
        blur={2}
        color="#F8827A"
        width={2}
        height={0.4}
        position={[0, -1.87, 0]}
      />
    </>
  );
};

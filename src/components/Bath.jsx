import { ContactShadows, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useCallback, useRef, useState } from 'react';
import * as THREE from 'three';

export function Bath() {
  const { nodes, materials } = useGLTF('bath3.1.glb');

  const [targetMousePos] = useState(new THREE.Vector3(0, 0, 0));
  const [currentMousePos] = useState(new THREE.Vector3(0, 0, 0));

  const uniformsRef = useRef({
    time: { value: 0 },
    mousePos: { value: [0, 0, 0] }
  });

  const meshRef = useRef(null);

  const easeSpeed = 0.075;
  const returnSpeed = 0.02;
  const returnDelayRef = useRef(0);
  const returnDelayAmount = 60;

  const modifyShader = useCallback((shader) => {
    shader.uniforms.time = uniformsRef.current.time;
    shader.uniforms.mousePos = uniformsRef.current.mousePos;

    shader.vertexShader = shader.vertexShader.replace(
      'void main() {',
      `
      uniform float time;
      uniform vec3 mousePos;
      
      void main() {
      `
    );

    // Replace the position calculation - start with scale 0, grow on hover
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      vec3 instancePos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
   
      float distance = length(instancePos - mousePos);
  
      float strength = 1.0 - smoothstep(0.0, 1., distance);
    
      // Start at scale 0, grow to full size on hover
      float scaleFactor = strength;
      transformed *= scaleFactor * 1.5;
      `
    );

    return shader;
  }, []);

  const dummyVector = new THREE.Vector3(0, 0, 0);
  useFrame((state) => {
    if (!meshRef.current) return;

    uniformsRef.current.time.value = state.clock.elapsedTime;

    const { raycaster } = state;

    const intersects = raycaster.intersectObject(meshRef.current, true);
    const point = intersects[0]?.point || dummyVector;

    // Update hover state and delay
    const intersections = intersects.length > 0;
    returnDelayRef.current = intersections
      ? returnDelayAmount
      : Math.max(0, returnDelayRef.current - 1);

    // Update target position based on hover state and delay
    if (intersections) {
      targetMousePos.lerp(point, 0.2);
    } else if (returnDelayRef.current === 0) {
      targetMousePos.set(0, 0, 0);
    }

    // Smooth movement with dynamic speed
    const speed = intersections ? easeSpeed : returnSpeed;
    currentMousePos.lerp(targetMousePos, speed);

    uniformsRef.current.mousePos.value = [
      currentMousePos.x,
      currentMousePos.y,
      currentMousePos.z
    ];
  });

  return (
    <group dispose={null} ref={meshRef}>
      <mesh
        receiveShadow
        geometry={nodes.Retopo_Bathtub.geometry}
        material={materials['White ceramic']}
        material-roughness={0.5}
        material-metalness={0.5}
      />
      <ContactShadows
        frames={1}
        opacity={0.6}
        blur={2}
        color="#000000"
        width={2}
        height={0.4}
        position={[0, -0.66, 0]}
      />
      {/* <mesh
        raycast={() => null}
        geometry={nodes.Plane001_1.geometry}
        material={materials.Chrome}
      /> */}
      <instancedMesh
        args={[nodes.Retopo_Bathtub0.geometry, null, 151]}
        instanceMatrix={nodes.Retopo_Bathtub0.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughnessMap={materials['celandine_01.001'].roughnessMap}
          metalnessMap={materials['celandine_01.001'].metalnessMap}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        args={[nodes.Retopo_Bathtub1.geometry, null, 131]}
        instanceMatrix={nodes.Retopo_Bathtub1.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughnessMap={materials['celandine_01.001'].roughnessMap}
          metalnessMap={materials['celandine_01.001'].metalnessMap}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        args={[nodes.Retopo_Bathtub2.geometry, null, 102]}
        instanceMatrix={nodes.Retopo_Bathtub2.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughnessMap={materials['celandine_01.001'].roughnessMap}
          metalnessMap={materials['celandine_01.001'].metalnessMap}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        args={[nodes.Retopo_Bathtub3.geometry, null, 124]}
        instanceMatrix={nodes.Retopo_Bathtub3.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughnessMap={materials['celandine_01.001'].roughnessMap}
          metalnessMap={materials['celandine_01.001'].metalnessMap}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        args={[nodes.Retopo_Bathtub4.geometry, null, 152]}
        instanceMatrix={nodes.Retopo_Bathtub4.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
    </group>
  );
}

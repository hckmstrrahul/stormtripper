import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGLTF, Wireframe } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useResponsiveScale } from '../lib/utils';

export function Bath() {
  const { nodes, materials } = useGLTF('bath3.1.glb');
  const { scale } = useResponsiveScale();

  const [targetMousePos] = useState(new THREE.Vector3(0, 0, 0));
  const [currentMousePos] = useState(new THREE.Vector3(0, 0, 0));

  const uniformsRef = useRef({
    time: { value: 0 },
    mousePos: { value: [0, 0, 0] }
  });

  const meshRef = useRef(null);
  const instancedMeshRefs = useRef([]);
  const depthMaterialRefs = useRef([]);

  const easeSpeed = 0.05;
  const returnSpeed = 0.02;
  const hoveringRef = useRef(false);
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
      varying float vScale;
      
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
  
      // Tighter falloff for more dramatic appearance
      float strength = 1.0 - smoothstep(0.0, .7, distance);
    
      // Start at scale 0, grow to full size on hover
      float scaleFactor = strength;
      transformed *= scaleFactor * 1.5;
      `
    );

    return shader;
  }, []);

  // Handle mouse interaction
  useFrame((state) => {
    if (!meshRef.current) return;

    uniformsRef.current.time.value = state.clock.elapsedTime;

    // Use pointer instead of raycaster for more stable interaction
    const { pointer, camera, scene } = state;

    // Create a new raycaster for each frame with the current pointer position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);

    // Check for intersections with the entire group
    const intersects = raycaster.intersectObject(meshRef.current, true);

    if (intersects.length > 0) {
      // Use the actual intersection point in world space
      const point = intersects[0].point;

      // Add smoothing for target position to reduce jumpiness
      // Instead of setting directly, move towards the new point
      targetMousePos.x += (point.x - targetMousePos.x) * 0.2;
      targetMousePos.y += (point.y - targetMousePos.y) * 0.2;
      targetMousePos.z += (point.z - targetMousePos.z) * 0.2;

      hoveringRef.current = true;
      returnDelayRef.current = returnDelayAmount; // Reset delay counter

      // // Update spotlight position to follow cursor
      // if (spotlightRef.current) {
      //   // Position the spotlight above the cursor point
      //   spotlightRef.current.position.set(point.x, point.y + 2, point.z);
      //   // Target the spotlight at the cursor point
      //   spotlightRef.current.target.position.set(point.x, point.y, point.z);
      //   spotlightRef.current.target.updateMatrixWorld();
      // }
    } else {
      // When not hovering, start countdown to return to zero
      hoveringRef.current = false;
      if (returnDelayRef.current > 0) {
        returnDelayRef.current--;
      } else {
        // After delay, start moving back to zero
        targetMousePos.set(0, 0, 0);
      }
    }

    // Add damping to make movement smoother
    const speed = hoveringRef.current ? easeSpeed : returnSpeed;
    currentMousePos.x += (targetMousePos.x - currentMousePos.x) * speed;
    currentMousePos.y += (targetMousePos.y - currentMousePos.y) * speed;
    currentMousePos.z += (targetMousePos.z - currentMousePos.z) * speed;

    uniformsRef.current.mousePos.value = [
      currentMousePos.x,
      currentMousePos.y,
      currentMousePos.z
    ];
  });

  return (
    <group dispose={null} ref={meshRef}>
      <directionalLight
        // and a cursor light?
        position={[3, 8, -2]}
        intensity={2}
        castShadow={true}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-bias={-0.1}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Retopo_Bathtub.geometry}
        material={materials['White ceramic']}
        material-roughness={0.5}
        material-metalness={0.5}
        // material-wireframe={true}
      />
      {/* <mesh
        raycast={() => null}
        geometry={nodes.Plane001_1.geometry}
        material={materials.Chrome}
      /> */}
      <instancedMesh
        ref={(el) => (instancedMeshRefs.current[0] = el)}
        castShadow
        receiveShadow
        args={[nodes.Retopo_Bathtub0.geometry, null, 151]}
        // args={[nodes.Retopo_Bathtub0.geometry, null, 167]}
        instanceMatrix={nodes.Retopo_Bathtub0.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughness={1}
          metalness={0.2}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={(el) => (instancedMeshRefs.current[1] = el)}
        castShadow
        receiveShadow
        args={[nodes.Retopo_Bathtub1.geometry, null, 131]}
        // args={[nodes.Retopo_Bathtub1.geometry, null, 155]}
        instanceMatrix={nodes.Retopo_Bathtub1.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughness={1}
          metalness={0.2}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={(el) => (instancedMeshRefs.current[2] = el)}
        castShadow
        receiveShadow
        // args={[nodes.Retopo_Bathtub2.geometry, null, 120]}
        args={[nodes.Retopo_Bathtub2.geometry, null, 102]}
        instanceMatrix={nodes.Retopo_Bathtub2.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughness={1}
          metalness={0.2}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={(el) => (instancedMeshRefs.current[3] = el)}
        castShadow
        receiveShadow
        // args={[nodes.Retopo_Bathtub3.geometry, null, 138]}
        args={[nodes.Retopo_Bathtub3.geometry, null, 124]}
        instanceMatrix={nodes.Retopo_Bathtub3.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughness={1}
          metalness={0.2}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
      <instancedMesh
        ref={(el) => (instancedMeshRefs.current[4] = el)}
        castShadow
        receiveShadow
        // args={[nodes.Retopo_Bathtub4.geometry, null, 174]}
        args={[nodes.Retopo_Bathtub4.geometry, null, 152]}
        instanceMatrix={nodes.Retopo_Bathtub4.instanceMatrix}>
        <meshStandardMaterial
          map={materials['celandine_01.001'].map}
          normalMap={materials['celandine_01.001'].normalMap}
          roughness={1}
          metalness={0.2}
          onBeforeCompile={(shader) => {
            modifyShader(shader);
          }}
        />
      </instancedMesh>
    </group>
  );
}

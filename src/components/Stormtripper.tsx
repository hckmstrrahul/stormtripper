import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneLoadedStore } from '../store';

// Define a proper type for Collada result
type ColladalLoaderResult = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  kinematics: any;
  library: any;
};

// Rain Lines component
const RainEffect = () => {
  const rainRef = useRef<THREE.Group>(new THREE.Group());
  const rainCount = 2000; // Increased rain count for denser rain
  const rainSize = 20; // Increased rain area
  const rainSpeed = 0.6; // Much faster rain speed

  // Create rain lines
  useEffect(() => {
    // Create rain lines
    const rainLines = new THREE.Group();
    
    for (let i = 0; i < rainCount; i++) {
      const x = (Math.random() - 0.5) * rainSize;
      // Distribute rain evenly throughout the vertical space
      const y = (Math.random() * rainSize * 2) - 5;
      const z = (Math.random() - 0.5) * rainSize;
      
      // Longer rain lines for faster falling effect
      const length = 0.4 + Math.random() * 0.5;
      
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        x, y, z,
        x, y - length, z
      ]);
      
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const material = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.4
      });
      
      const line = new THREE.Line(geometry, material);
      rainLines.add(line);
    }
    
    if (rainRef.current) {
      rainRef.current.add(rainLines);
    }
    
    return () => {
      if (rainRef.current) {
        rainRef.current.clear();
      }
    };
  }, []);
  
  // Animate rain at high speed
  useFrame(() => {
    if (rainRef.current) {
      rainRef.current.children.forEach((child: THREE.Object3D) => {
        // Much faster falling speed
        child.position.y -= rainSpeed;
        
        // Reset position when raindrops fall below the scene
        // Use a lower value to ensure continuous rain
        if (child.position.y < -10) {
          // Reset to a higher position for more continuous effect
          child.position.y = 15;
          // Also randomize X and Z slightly for more natural look
          child.position.x = (Math.random() - 0.5) * rainSize;
          child.position.z = (Math.random() - 0.5) * rainSize;
        }
      });
    }
  });
  
  return <primitive object={rainRef.current} />;
};

// Wind Particles component
const WindEffect = () => {
  const windRef = useRef<THREE.Points>(null);
  const particleCount = 500;
  
  // Create particles
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Position particles in a wide area around the scene
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 15;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;
      
      // Vary the particle sizes
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  // Create particle material
  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
  }, []);
  
  // Animate wind particles
  useFrame((state) => {
    if (windRef.current) {
      const positions = windRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Apply a flowing movement pattern
        positions[i3] += Math.sin(state.clock.elapsedTime * 0.1 + i * 0.01) * 0.02;
        positions[i3 + 2] += Math.cos(state.clock.elapsedTime * 0.1 + i * 0.01) * 0.02;
        
        // Move particles along X axis for a wind effect
        positions[i3] += 0.03;
        
        // Reset positions when particles move too far
        if (positions[i3] > 10) {
          positions[i3] = -10;
        }
      }
      
      windRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return <points ref={windRef} geometry={particlesGeometry} material={particleMaterial} />;
};

export const Stormtripper = () => {
  const { setSceneLoaded } = useSceneLoadedStore();
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const clock = useRef(new THREE.Clock());
  const modelRef = useRef<THREE.Group>(new THREE.Group());
  const [gridHelper, setGridHelper] = useState<THREE.GridHelper | null>(null);

  useEffect(() => {
    // Load the model directly
    const loadModel = async () => {
      try {
        console.log("Starting to load model");
        
        // Dynamically import the loader
        const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js');
        const loader = new ColladaLoader();
        
        // Create a grid helper right away, don't wait for the model
        const grid = new THREE.GridHelper(10, 20, 0xc1c1c1, 0x8d8d8d);
        setGridHelper(grid);
        
        // Load the model
        // @ts-ignore - Ignoring type issues to make this work
        loader.load('/models/collada/stormtrooper/stormtrooper.dae', 
          // Success callback
          (collada: any) => {
            console.log("Model loaded successfully:", collada);
            const avatar = collada.scene;
            
            // Add the model to our group
            if (modelRef.current) {
              modelRef.current.add(avatar);
              
              // Check for animations
              if (collada.animations && collada.animations.length > 0) {
                console.log("Found animations:", collada.animations.length);
                
                // Create and set up the animation mixer
                const newMixer = new THREE.AnimationMixer(avatar);
                newMixer.clipAction(collada.animations[0]).play();
                setMixer(newMixer);
              } else {
                console.warn("No animations found in the model");
              }
              
              setSceneLoaded(true);
            }
          },
          // Progress callback
          (xhr: any) => {
            const percent = xhr.loaded / xhr.total * 100;
            console.log(`${percent.toFixed(0)}% loaded`);
          },
          // Error callback
          (error: any) => {
            console.error("Error loading model:", error);
          }
        );
      } catch (error) {
        console.error("Failed to load model:", error);
      }
    };
    
    loadModel();
    
    return () => {
      if (modelRef.current) {
        modelRef.current.clear();
      }
    };
  }, [setSceneLoaded]);

  useFrame(() => {
    if (mixer) {
      const delta = clock.current.getDelta();
      mixer.update(delta);
    }
  });

  return (
    <>
      <primitive object={modelRef.current} />
      {gridHelper && <primitive object={gridHelper} />}
      
      {/* Lighting setup to match the example */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        intensity={3} 
        position={[1.5, 1, -1.5]} 
      />
      
      {/* Weather effects */}
      <RainEffect />
      <WindEffect />
    </>
  );
}; 
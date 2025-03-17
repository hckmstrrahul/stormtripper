import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneLoadedStore } from '../store';

// Define the GLTF interface to avoid import issues
interface GLTF {
  scene: THREE.Group;
  scenes: THREE.Group[];
  animations: THREE.AnimationClip[];
  asset: {
    generator: string;
    version: string;
  };
}

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

// Custom shader for static gradient floor
const StaticGradientShader = {
  uniforms: {
    colorA: { value: new THREE.Color('#2D882D') }, // Green
    colorB: { value: new THREE.Color('#000000') }  // Black
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec2 vUv;
    
    void main() {
      // Center UV coordinates for circular effect
      vec2 centeredUV = vUv * 2.0 - 1.0;
      float dist = length(centeredUV);
      
      // Discard fragments outside the circle with soft edge
      if (dist > 1.0) {
        discard;
      }
      
      // Simple radial gradient from center to edge
      float radialGradient = dist;
      
      // Simple green to black transition
      vec3 finalColor = mix(colorA, colorB, radialGradient);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const Stormtripper = () => {
  const { setSceneLoaded } = useSceneLoadedStore();
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const clock = useRef(new THREE.Clock());
  const modelRef = useRef<THREE.Group>(new THREE.Group());
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  
  // Track which meshes to keep (all except shadow plane)
  const [filteredMeshes, setFilteredMeshes] = useState<THREE.Object3D[]>([]);
  
  // Create shader material with our static shader
  const gradientMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: StaticGradientShader.uniforms,
      vertexShader: StaticGradientShader.vertexShader,
      fragmentShader: StaticGradientShader.fragmentShader,
      transparent: false,
      side: THREE.FrontSide
    });
  }, []);
  
  useEffect(() => {
    // Success callback for model loading
    const onModelLoaded = (gltf: any) => {
      console.log("Model loaded successfully:", gltf);
      const avatar = gltf.scene;
      
      // VERY aggressive shadow removal
      // Disable shadows on ALL materials in the entire scene
      avatar.traverse((child: THREE.Object3D) => {
        // Disable all shadows on all objects
        child.castShadow = false;
        child.receiveShadow = false;
        
        // Check if it's a mesh
        if (child instanceof THREE.Mesh) {
          // Special check for potential shadow planes
          // Disable/remove anything that looks like a shadow
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            // Check each material
            for (const mat of materials) {
              // Disable all shadow-related properties on materials
              if ('shadowSide' in mat) {
                mat.shadowSide = null;
              }
              
              // Check color for brownish tones - be more aggressive in detection
              if ('color' in mat && mat.color instanceof THREE.Color) {
                const { r, g, b } = mat.color;
                
                // Wider color range for detecting shadow elements
                if ((r > 0.2 && r < 0.7 && g > 0.1 && g < 0.5 && b < 0.4) || 
                    (child.position.y < 0 && child.scale.y < 0.5)) {
                  // This is likely a shadow plane - make it invisible
                  child.visible = false;
                  console.log("Hiding shadow element:", child.name);
                }
              }
            }
          }
          
          // Check geometry for flat objects
          if (child.geometry) {
            child.geometry.computeBoundingBox();
            const box = child.geometry.boundingBox;
            
            if (box) {
              const height = box.max.y - box.min.y;
              const width = box.max.x - box.min.x;
              const depth = box.max.z - box.min.z;
              
              // More aggressive detection of flat geometry
              if (height < 0.5 && (width > 1.5 || depth > 1.5)) {
                child.visible = false;
                console.log("Hiding shadow plane based on dimensions:", child.name);
              }
            }
          }
        }
      });
      
      // Center and scale the model appropriately
      avatar.position.set(0, 0, 0);
      
      // Apply animation if available
      if (gltf.animations && gltf.animations.length) {
        // Create a mixer for animations
        const newMixer = new THREE.AnimationMixer(avatar);
        
        // Create animation action and play it
        const animationAction = newMixer.clipAction(gltf.animations[0]);
        animationAction.play();
        
        // Set mixer state
        setMixer(newMixer);
      }
      
      // Add the model to our reference
      modelRef.current.add(avatar);
      
      // Signal that the scene has loaded
      setSceneLoaded(true);
      
      // Debug log
      console.log("Model added to scene");
    };

    // Progress callback
    const onProgress = (xhr: ProgressEvent) => {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    };
    
    // Load model with retry for different paths
    const loadModelWithRetry = (loader: any) => {
      // First try with absolute path
      loader.load('/dancing_stormtrooper.glb', 
        // Success callback
        onModelLoaded,
        // Progress callback
        onProgress,
        // Error callback - try fallback path if this fails
        (error: any) => {
          console.warn('Failed to load with absolute path, trying relative path:', error);
          
          // Try with relative path as fallback
          loader.load('./dancing_stormtrooper.glb', 
            onModelLoaded,
            onProgress,
            (fallbackError: any) => {
              console.error('Error loading model with both paths:', fallbackError);
            }
          );
        }
      );
    };

    // Load the model directly
    const loadModel = async () => {
      try {
        console.log("Starting to load model");
        
        // Dynamically import the GLTFLoader instead of ColladaLoader
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        
        // Load model with retry mechanism
        loadModelWithRetry(loader);
        
      } catch (error) {
        console.error("Failed to load model:", error);
      }
    };
    
    loadModel();
    
    return () => {
      // Clean up
      if (mixer) {
        mixer.stopAllAction();
      }
      
      modelRef.current.clear();
    };
  }, [setSceneLoaded]);
  
  // Animation loop
  useFrame((state) => {
    const delta = clock.current.getDelta();
    
    if (mixer) {
      mixer.update(delta);
    }
  });
  
  return (
    <>
      {/* Static gradient circular floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.001, 0]} 
        receiveShadow={false} 
        castShadow={false}
      >
        <circleGeometry args={[25, 72]} />
        <primitive object={gradientMaterial} attach="material" />
      </mesh>
      
      {/* Main model */}
      <primitive object={modelRef.current} />
      
      {/* Weather effects */}
      <RainEffect />
      <WindEffect />
    </>
  );
}; 
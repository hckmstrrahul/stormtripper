import { ContactShadows, useGLTF, Text, Cloud, useTexture, Sparkles } from '@react-three/drei';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';

// We no longer need to preload the bath model
// useGLTF.preload('/bath3.1.glb');

export function Bath() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [lightningIntensity, setLightningIntensity] = useState(0);
  
  // Get the camera for projecting mouse position
  const { camera, scene } = useThree();

  // Animation mixer reference
  const mixerRef = useRef(null);
  // Using clock ref for consistent animation timing
  const clockRef = useRef(new THREE.Clock());
  
  // References for storm effects
  const rainRef = useRef(null);
  const lightningRef = useRef(null);
  const thunderSoundRef = useRef(null);
  const lastLightningTime = useRef(0);
  const nextLightningTime = useRef(Math.random() * 5 + 2); // 2-7 seconds
  const lightningGeometryRef = useRef(null);
  const lightningMaterialRef = useRef(null);
  const lightningMeshRef = useRef(null);
  
  // Stable dark background color - no more disco
  const backgroundColor = new THREE.Color('#1a1a2e');
  
  // Rain particles as line segments instead of points
  const rainCount = 2000;
  const rainGeometry = useMemo(() => {
    // Create line segments for each raindrop
    const positions = [];
    const velocities = [];
    const dropLengths = [];
    
    for (let i = 0; i < rainCount; i++) {
      // Random position for the top of the raindrop
      const x = Math.random() * 20 - 10; // x: -10 to 10
      const y = Math.random() * 10 + 5;  // y: 5 to 15 (above the scene)
      const z = Math.random() * 20 - 10; // z: -10 to 10
      
      // Each raindrop falls at slightly different speeds
      const fallSpeed = 0.15 + Math.random() * 0.25; // 0.15-0.4
      
      // Store velocity for animation
      const vx = (Math.random() - 0.5) * 0.03; // slight sideways movement (for wind effect)
      const vy = -fallSpeed;  // falling speed
      const vz = (Math.random() - 0.5) * 0.03; // slight depth movement (for wind effect)
      
      // Random length for each raindrop (create streaks)
      const length = 0.2 + Math.random() * 0.4; // 0.2 to 0.6 units long
      
      // Position for the start of the line (top of raindrop)
      positions.push(x, y, z);
      
      // Position for the end of the line (bottom of raindrop)
      positions.push(x, y - length, z);
      
      // Store velocity for both endpoints (same velocity for both points)
      velocities.push(vx, vy, vz, vx, vy, vz);
      
      // Store length for update calculations
      dropLengths.push(length, length);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('dropLength', new THREE.Float32BufferAttribute(dropLengths, 1));
    
    return geometry;
  }, []);

  // Rain material for lines instead of points
  const rainMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: 0xaaccff,
      transparent: true,
      opacity: 0.6,
      fog: true,
      linewidth: 1 // Note: linewidth only works in WebGL 1, not supported in WebGL 2
    });
  }, []);

  // 3D cursor position tracking
  const cursorPosition = useRef(new THREE.Vector3(0, -100, 0)); // Start off-screen
  const targetCursorPosition = useRef(new THREE.Vector3(0, -100, 0));
  
  const meshRef = useRef(null);
  const modelRef = useRef(null);
  
  // Load the stormtrooper Collada model
  const [stormtrooperModel, setStormtrooperModel] = useState(null);

  // Generate lightning mesh
  const generateLightningBolt = useCallback(() => {
    if (!lightningGeometryRef.current) {
      // Create a new lightning bolt
      const points = [];
      const startPoint = new THREE.Vector3(Math.random() * 10 - 5, 10, Math.random() * 10 - 5);
      const endPoint = new THREE.Vector3(Math.random() * 10 - 5, -1, Math.random() * 10 - 5);
      
      // Add the starting point
      points.push(startPoint);
      
      // Generate the main bolt
      generateLightningSegment(startPoint, endPoint, 0.5, 5, points);
      
      // Create the geometry
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lightningGeometryRef.current = geometry;
      
      // Create the material
      const material = new THREE.LineBasicMaterial({
        color: 0xf0f8ff,
        linewidth: 5,  // Thicker lines
        transparent: true,
        opacity: 0.8
      });
      lightningMaterialRef.current = material;
      
      // Create line segments for the lightning bolt
      const lightningBolt = new THREE.LineSegments(geometry, material);
      lightningMeshRef.current = lightningBolt;
    } else {
      // Update existing lightning bolt
      const points = [];
      const startPoint = new THREE.Vector3(Math.random() * 10 - 5, 10, Math.random() * 10 - 5);
      const endPoint = new THREE.Vector3(Math.random() * 10 - 5, -1, Math.random() * 10 - 5);
      
      // Add the starting point
      points.push(startPoint);
      
      // Generate the main bolt
      generateLightningSegment(startPoint, endPoint, 0.5, 5, points);
      
      // Update the geometry
      lightningGeometryRef.current.setFromPoints(points);
      lightningGeometryRef.current.attributes.position.needsUpdate = true;
      
      // Ensure lightning bolt is visible
      if (lightningMeshRef.current) {
        lightningMeshRef.current.visible = true;
      }
    }
  }, []);
  
  // Helper function to generate a lightning segment with branches
  const generateLightningSegment = (start, end, displacementScale, branchesDepth, points, depth = 0) => {
    if (depth > 10) return; // Limit recursion depth
    
    // Add two points to make a straight line
    if (start.distanceTo(end) < 0.2) {
      points.push(end);
      return;
    }
    
    // Find midpoint
    const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
    
    // Displace midpoint
    const direction = new THREE.Vector3().subVectors(end, start);
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
    
    // Random displacement amount
    const displacement = (Math.random() - 0.5) * displacementScale;
    
    // Apply displacement perpendicular to the segment
    mid.add(perpendicular.multiplyScalar(displacement));
    
    // Add the midpoint to the list
    points.push(mid);
    
    // Create branches (with probability decreasing as we go deeper)
    if (depth < branchesDepth && Math.random() < 0.4 / (depth + 1)) {
      // Calculate branch endpoint
      const branchLength = direction.length() * 0.6 * Math.random();
      const branchDir = new THREE.Vector3().copy(direction).normalize();
      
      // Rotate branch direction
      const angle = (Math.random() - 0.5) * Math.PI / 2;
      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), angle);
      branchDir.applyMatrix4(rotationMatrix);
      
      // Calculate branch endpoint
      const branchEnd = new THREE.Vector3().copy(mid).add(branchDir.multiplyScalar(branchLength));
      
      // Generate branch - smaller displacement and fewer sub-branches
      generateLightningSegment(mid, branchEnd, displacementScale * 0.7, branchesDepth - 1, points, depth + 1);
      
      // After branch, continue back from the midpoint
      points.push(mid);
    }
    
    // Recursively process the two halves
    generateLightningSegment(start, mid, displacementScale * 0.7, branchesDepth, points, depth + 1);
    generateLightningSegment(mid, end, displacementScale * 0.7, branchesDepth, points, depth + 1);
  };

  // Setup thunder sound
  useEffect(() => {
    // Create and configure audio for thunder
    const audio = new Audio();
    audio.src = 'https://freesound.org/data/previews/377/377142_5143584-lq.mp3';
    audio.volume = 0.5;
    thunderSoundRef.current = audio;
    
    return () => {
      if (thunderSoundRef.current) {
        thunderSoundRef.current.pause();
      }
    };
  }, []);
  
  // Play thunder sound with random delay after lightning
  const playThunder = useCallback(() => {
    if (thunderSoundRef.current) {
      // Add random delay to thunder (sound travels slower than light)
      setTimeout(() => {
        thunderSoundRef.current.currentTime = 0;
        thunderSoundRef.current.play().catch(e => console.log('Thunder sound error:', e));
      }, Math.random() * 1000 + 300);
    }
  }, []);
  
  // Create lightning effect
  const triggerLightning = useCallback(() => {
    // Generate new lightning bolt
    generateLightningBolt();
    
    // Set a very bright flash
    setLightningIntensity(2 + Math.random() * 3);
    
    // Play thunder sound
    playThunder();
    
    // Reset last lightning time and set next random interval
    lastLightningTime.current = clockRef.current.getElapsedTime();
    nextLightningTime.current = Math.random() * 8 + 3; // 3-11 seconds
  }, [generateLightningBolt, playThunder]);
  
  useEffect(() => {
    const loader = new ColladaLoader();
    clockRef.current.start(); // Start the clock for animation
    
    // Try to load the model with a simplified approach
    loader.load(
      // Use the absolute path to the model
      '/models/collada/stormtrooper/stormtrooper.dae',
      (collada) => {
        const avatar = collada.scene;
        const animations = avatar.animations;
        
        // Create animation mixer
        const mixer = new THREE.AnimationMixer(avatar);
        mixerRef.current = mixer;
        
        // Play the first animation if available
        if (animations && animations.length > 0) {
          const action = mixer.clipAction(animations[0]);
          // Set the animation to loop
          action.setLoop(THREE.LoopRepeat);
          action.timeScale = 1.2; // Slightly faster animation
          action.play();
        }
        
        // Scale the model appropriately
        avatar.scale.set(0.05, 0.05, 0.05);
        
        // Position the model above the grid
        avatar.position.set(0, 0.05, 0);
        
        setStormtrooperModel(avatar);
        setModelLoaded(true);
        console.log('Stormtrooper model loaded successfully!');
      },
      // onProgress callback
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // onError callback
      (error) => {
        console.error('Error loading Collada model:', error);
        setModelError(error.message || 'Failed to load 3D model');
      }
    );
    
    // Cleanup function
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, []);
  
  // Mouse handling functions
  const handlePointerMove = useCallback((e) => {
    // Just track mouse position for cursor effects, no longer need viewportMousePosition
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovering(true);
    
    // Trigger a lightning flash when hovering starts
    triggerLightning();
    
    console.log("Pointer ENTER stormtrooper");
  }, [triggerLightning]);

  const handlePointerLeave = useCallback(() => {
    setIsHovering(false);
    console.log("Pointer LEAVE stormtrooper");
  }, []);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerMove]);

  // Animate rain, lightning, and stormtrooper
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const delta = 1/60; // Fixed delta for consistent animation
    
    // Update the animation mixer if it exists
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Get mouse in normalized device coordinates
    const mouse = new THREE.Vector2(
      (state.mouse.x * 0.5) + 0.5, 
      (state.mouse.y * 0.5) + 0.5
    );
    
    // Update cursor position in world space
    const vector = new THREE.Vector3(
      mouse.x * 2 - 1,
      -(mouse.y * 2 - 1),
      0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.y / dir.y;
    cursorPosition.current.copy(camera.position).add(dir.multiplyScalar(distance));
    
    // Fade out lightning bolt after flash
    if (lightningMeshRef.current) {
      if (lightningIntensity > 0) {
        lightningMeshRef.current.visible = true;
        lightningMeshRef.current.material.opacity = lightningIntensity * 0.3;
      } else {
        lightningMeshRef.current.visible = false;
      }
    }
    
    // Update rain line segments
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      const velocities = rainRef.current.geometry.attributes.velocity.array;
      const dropLengths = rainRef.current.geometry.attributes.dropLength.array;
      
      for (let i = 0; i < rainCount; i++) {
        // Each raindrop has two vertices (top and bottom points)
        // So we need to access the array at i*6 for velocities (3 components * 2 points)
        // and i*6 for positions (3 components * 2 points)
        const i6 = i * 6;
        const i6pos = i * 6;
        
        // Get top point of raindrop
        const x1 = positions[i6pos];
        const y1 = positions[i6pos + 1];
        const z1 = positions[i6pos + 2];
        
        // Get velocity
        const vx = velocities[i6];
        const vy = velocities[i6 + 1];
        const vz = velocities[i6 + 2];
        
        // Create a vector for the top point for distance calculation
        const dropPosTop = new THREE.Vector3(x1, y1, z1);
        const distToCursor = dropPosTop.distanceTo(cursorPosition.current);
        
        // Modify velocity for warp effect near cursor
        let modifiedVx = vx;
        let modifiedVy = vy;
        let modifiedVz = vz;
        
        // Add stronger warp/avoidance effect when hovering near cursor
        if (isHovering && distToCursor < 3.5) {  // Increased radius
          // Calculate direction away from cursor
          const forceDirection = new THREE.Vector3();
          forceDirection.subVectors(dropPosTop, cursorPosition.current).normalize();
          
          // Force strength inversely proportional to distance - much stronger
          const forceFactor = Math.max(0, 1.0 - distToCursor / 3.5) * 0.3;  // 3x stronger
          
          // Modify velocity to curve around cursor
          const tangent = new THREE.Vector3(forceDirection.z, 0, -forceDirection.x);
          modifiedVx += tangent.x * forceFactor; 
          modifiedVz += tangent.z * forceFactor;
          
          // Also slow down falling slightly
          modifiedVy *= 0.95;
        }
        
        // Apply velocity to the top point (first vertex of the line)
        positions[i6pos] += modifiedVx;
        positions[i6pos + 1] += modifiedVy;
        positions[i6pos + 2] += modifiedVz;
        
        // Get the length of this raindrop
        const length = dropLengths[i * 2];
        
        // Apply velocity to the bottom point (second vertex of the line)
        positions[i6pos + 3] = positions[i6pos];     // Same x as top
        positions[i6pos + 4] = positions[i6pos + 1] - length; // y - length
        positions[i6pos + 5] = positions[i6pos + 2];     // Same z as top
        
        // Add wind effect - make it sway based on time
        positions[i6pos] += Math.sin(time * 0.1 + i * 0.01) * 0.01;
        positions[i6pos + 3] += Math.sin(time * 0.1 + i * 0.01) * 0.01;
        
        // Reset raindrops that fall below the ground
        if (positions[i6pos + 1] < -2) {
          // Reset top point
          positions[i6pos] = Math.random() * 20 - 10;        // x: -10 to 10
          positions[i6pos + 1] = Math.random() * 5 + 10;     // y: 10 to 15 (above scene)
          positions[i6pos + 2] = Math.random() * 20 - 10;    // z: -10 to 10
          
          // Reset bottom point
          positions[i6pos + 3] = positions[i6pos];           // Same x as top
          positions[i6pos + 4] = positions[i6pos + 1] - length; // y - length
          positions[i6pos + 5] = positions[i6pos + 2];       // Same z as top
        }
      }
      
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Handle lightning flashes - check if it's time for a new lightning
    const currentTime = clockRef.current.getElapsedTime();
    if (currentTime - lastLightningTime.current > nextLightningTime.current) {
      triggerLightning();
    }
    
    // Gradually reduce lightning intensity
    if (lightningIntensity > 0) {
      setLightningIntensity(Math.max(0, lightningIntensity - delta * 5));
    }
  });

  // Render component with loading/error handling
  if (modelError) {
    return (
      <group dispose={null} ref={meshRef}>
        {/* Placeholder if model failed to load */}
        <mesh 
          ref={modelRef} 
          position={[0, 0.05, 0]} // Raised position to be above grid
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
        
        {/* Error text */}
        <Text
          position={[0, 0.5, 0]}
          color="red"
          fontSize={0.1}
          anchorX="center"
          anchorY="middle"
        >
          Error: {modelError}
        </Text>
      </group>
    );
  }

  return (
    <group dispose={null} ref={meshRef}>
      {/* Stable background color - no more disco effect */}
      <color attach="background" args={[backgroundColor]} />
      <fog attach="fog" args={[backgroundColor, 5, 25]} />
      
      {/* Grid helper for visual reference */}
      <gridHelper args={[10, 20, 0x404080, 0x303060]} />
      
      {/* Lightning mesh */}
      {lightningMeshRef.current && 
        <primitive object={lightningMeshRef.current} />
      }
      
      {/* Rain particles as line segments */}
      <lineSegments ref={rainRef} geometry={rainGeometry} material={rainMaterial} />
      
      {/* Cloud elements */}
      <Cloud position={[-4, 5, -3]} args={[3, 2]} />
      <Cloud position={[3, 6, -5]} args={[4, 2]} />
      <Cloud position={[0, 6, 5]} args={[3.5, 2]} />
      
      {/* Sparkle effect for lightning flash */}
      <Sparkles
        count={200}
        scale={10}
        size={2}
        speed={0.3}
        opacity={lightningIntensity * 0.2}
        color="white"
      />
      
      {/* Stormtrooper model from Collada loader */}
      {stormtrooperModel ? (
        <primitive 
          ref={modelRef}
          object={stormtrooperModel} 
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        />
      ) : (
        // Loading placeholder
        <mesh 
          ref={modelRef} 
          position={[0, 0.05, 0]} // Raised position to be above grid
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <boxGeometry args={[0.5, 1.5, 0.5]} />
          <meshStandardMaterial color="#aaaaaa" wireframe={true} />
        </mesh>
      )}
      
      <ContactShadows
        frames={1}
        opacity={0.6}
        blur={2}
        color="#000000"
        width={2}
        height={0.4}
        position={[0, -0.1, 0]} // Adjusted shadow position
      />
      
      {/* Ambient light - darker for storm */}
      <ambientLight intensity={0.3} color="#8090c0" />
      
      {/* Lightning light - flashing */}
      <pointLight 
        ref={lightningRef}
        color="#e0f0ff"
        intensity={lightningIntensity} 
        position={[Math.random() * 10 - 5, 8, Math.random() * 10 - 5]}
        distance={20}
        decay={2}
      />
      
      {/* Directional light - moon/dim light through clouds */}
      <directionalLight 
        intensity={0.8} 
        position={[1.5, 1, -1.5]} 
        color="#a0c0ff"
      />
    </group>
  );
}

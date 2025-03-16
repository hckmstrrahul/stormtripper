import * as THREE from 'three';

// Make three.js available globally
(window as any).THREE = THREE;

// Import the ColladaLoader directly from three.js examples
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

// Export everything
export { THREE, ColladaLoader };

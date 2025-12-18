import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { easing } from 'maath';

interface InteractiveTreeProps {
  state: TreeMorphState;
}

// Configuration
const COUNTS = {
  SPHERES: 600,
  CUBES: 600, // Reduced slightly to decrease density
  GEMS: 300
};

const DUMMY = new THREE.Object3D();
const TEMP_V3 = new THREE.Vector3();
const TEMP_QUAT = new THREE.Quaternion();

// Geometries
const SPHERE_GEO = new THREE.SphereGeometry(0.25, 16, 16);
const CUBE_GEO = new THREE.BoxGeometry(0.35, 0.35, 0.35); // Cubes
const GEM_GEO = new THREE.OctahedronGeometry(0.2, 0); // Gems

// Expanded Palette
const PALETTE = {
  GOLD_BRIGHT: new THREE.Color('#FFD700'),    // Classic Bright Gold
  GOLD_CHAMPAGNE: new THREE.Color('#F7E7CE'), // Pale Gold
  GOLD_DEEP: new THREE.Color('#D4AF37'),      // Rich/Dark Gold
  WHITE: new THREE.Color('#FFFFFF'),
  MORANDI: new THREE.Color('#A4C6B8'),
  AMBER: new THREE.Color('#FFBF00'),
  PINK: new THREE.Color('#FFB7C5'),
  BROWN: new THREE.Color('#8B5A2B'),          // Warm Chocolate Brown
};

/**
 * Helper to generate particle data with mixed colors
 */
const generateParticles = (count: number, type: 'sphere' | 'cube' | 'gem') => {
  const data: (ParticleData & { color: THREE.Color })[] = [];
  
  // Reduced dimensions for a "slightly smaller" tree
  const treeHeight = 13; 
  const maxBaseRadius = 5.5;

  for (let i = 0; i < count; i++) {
    // --- SCATTER STATE ---
    const r = 22 * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    const scatterPos = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    // --- TREE STATE (Volumetric Pile) ---
    // Bias random slightly to push points lower, thinning the top
    // Math.pow(Math.random(), 1.2) biases result towards 0 (bottom) vs 1 (top)
    const hNormal = Math.pow(Math.random(), 1.2);
     
    // Shift Y up slightly since tree is shorter
    const y = -treeHeight / 2 + (hNormal * treeHeight) + 1;
    
    const radiusAtHeight = (1 - hNormal) * maxBaseRadius;
    
    // Pile logic
    const pileRadius = radiusAtHeight * (0.2 + 0.8 * Math.sqrt(Math.random())); 
    const pileAngle = Math.random() * Math.PI * 2;
    
    const treePos = new THREE.Vector3(
      pileRadius * Math.cos(pileAngle),
      y,
      pileRadius * Math.sin(pileAngle)
    );

    // --- COLOR MIXING LOGIC ---
    let color = PALETTE.WHITE;
    const rand = Math.random();
    
    // Allow colors to cross-pollinate between shapes more freely
    // "Bright golds should be more frequent"
    if (type === 'sphere') {
      // Pearls/Balls: Can be Morandi, White, Pink, Gold, or Brown
      if (rand < 0.30) color = PALETTE.MORANDI;
      else if (rand < 0.55) color = PALETTE.WHITE;
      else if (rand < 0.70) color = PALETTE.GOLD_CHAMPAGNE; // Soft Gold
      else if (rand < 0.85) color = PALETTE.PINK;
      else if (rand < 0.95) color = PALETTE.BROWN; // Small amount of brown
      else color = PALETTE.GOLD_BRIGHT;
    } else if (type === 'cube') {
      // Gifts/Blocks: High chance of Gold (various layers), Brown, Morandi, White
      if (rand < 0.25) color = PALETTE.GOLD_BRIGHT;
      else if (rand < 0.45) color = PALETTE.GOLD_DEEP;
      else if (rand < 0.60) color = PALETTE.WHITE;
      else if (rand < 0.75) color = PALETTE.MORANDI;
      else if (rand < 0.85) color = PALETTE.BROWN;
      else color = PALETTE.GOLD_CHAMPAGNE;
    } else {
      // Gems: Amber, Clear, Pink, Bright Gold
      if (rand < 0.4) color = PALETTE.AMBER;
      else if (rand < 0.7) color = PALETTE.WHITE; // Clear
      else if (rand < 0.85) color = PALETTE.GOLD_BRIGHT;
      else color = PALETTE.PINK;
    }

    data.push({
      scatterPosition: scatterPos,
      scatterRotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
      treePosition: treePos,
      treeRotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
      scale: 0.5 + Math.random() * 0.8, 
      speed: 0.5 + Math.random() * 0.5,
      color: color
    });
  }
  return data;
};

const InteractiveTree: React.FC<InteractiveTreeProps> = ({ state }) => {
  const sphereRef = useRef<THREE.InstancedMesh>(null);
  const cubeRef = useRef<THREE.InstancedMesh>(null);
  const gemRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate data once
  const { spheres, cubes, gems } = useMemo(() => ({
    spheres: generateParticles(COUNTS.SPHERES, 'sphere'),
    cubes: generateParticles(COUNTS.CUBES, 'cube'),
    gems: generateParticles(COUNTS.GEMS, 'gem'),
  }), []);

  const blendRef = useRef(0);

  useFrame((stateThree, delta) => {
    // Smooth transition
    const targetBlend = state === TreeMorphState.TREE_SHAPE ? 1 : 0;
    easing.damp(blendRef, 'current', targetBlend, 1.2, delta);
    const t = blendRef.current;

    // Helper to animate a mesh ref
    const animateMesh = (
      mesh: THREE.InstancedMesh | null, 
      data: (ParticleData & { color: THREE.Color })[]
    ) => {
      if (!mesh) return;
      
      mesh.rotation.y += delta * 0.05;

      data.forEach((particle, i) => {
        const noiseX = Math.sin(stateThree.clock.elapsedTime * particle.speed + i) * 0.2 * (1 - t);
        const noiseY = Math.cos(stateThree.clock.elapsedTime * particle.speed * 0.5 + i) * 0.2 * (1 - t);
        
        TEMP_V3.lerpVectors(particle.scatterPosition, particle.treePosition, t);
        TEMP_V3.x += noiseX;
        TEMP_V3.y += noiseY;

        const qScatter = new THREE.Quaternion().setFromEuler(particle.scatterRotation);
        const qTree = new THREE.Quaternion().setFromEuler(particle.treeRotation);
        TEMP_QUAT.slerpQuaternions(qScatter, qTree, t);

        const breathe = 1 + 0.1 * Math.sin(stateThree.clock.elapsedTime * 2 + i);
        
        DUMMY.position.copy(TEMP_V3);
        DUMMY.quaternion.copy(TEMP_QUAT);
        DUMMY.scale.setScalar(particle.scale * breathe);
        DUMMY.updateMatrix();

        mesh.setMatrixAt(i, DUMMY.matrix);
        mesh.setColorAt(i, particle.color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    animateMesh(sphereRef.current, spheres);
    animateMesh(cubeRef.current, cubes);
    animateMesh(gemRef.current, gems);
  });

  return (
    <group>
      {/* 1. Spheres (Soft Gloss) */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, COUNTS.SPHERES]} castShadow receiveShadow>
        <primitive object={SPHERE_GEO} />
        <meshStandardMaterial 
          roughness={0.3} 
          metalness={0.4} 
        />
      </instancedMesh>

      {/* 2. Cubes (High Gloss/Metallic) - Gifts */}
      <instancedMesh ref={cubeRef} args={[undefined, undefined, COUNTS.CUBES]} castShadow receiveShadow>
        <primitive object={CUBE_GEO} />
        <meshStandardMaterial 
          roughness={0.2} 
          metalness={0.8} 
        />
      </instancedMesh>

      {/* 3. Gems (Glassy) */}
      <instancedMesh ref={gemRef} args={[undefined, undefined, COUNTS.GEMS]} castShadow receiveShadow>
        <primitive object={GEM_GEO} />
        <meshPhysicalMaterial 
          roughness={0.1} 
          metalness={0.1} 
          transmission={0.6}
          thickness={0.5}
        />
      </instancedMesh>
    </group>
  );
};

export default InteractiveTree;
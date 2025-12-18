import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';
import { easing } from 'maath';
import * as THREE from 'three';

interface FloatingOrnamentsProps {
  state: TreeMorphState;
}

const FloatingOrnaments: React.FC<FloatingOrnamentsProps> = ({ state }) => {
  const starRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const blendRef = useRef(0);

  // Create a proper Star Shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1;
    const innerRadius = 0.5;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useFrame((stateThree, delta) => {
    if (!starRef.current) return;

    // Transition Logic
    const targetBlend = state === TreeMorphState.TREE_SHAPE ? 1 : 0;
    easing.damp(blendRef, 'current', targetBlend, 1.0, delta);
    const t = blendRef.current;

    // Adjusted heights for the smaller tree
    const treeTopY = 8.2; // Raised from 7.5 to sit perfectly at the peak
    const scatterY = 15;
    
    starRef.current.position.y = THREE.MathUtils.lerp(scatterY, treeTopY, t);
    
    // Scale animation
    const scale = THREE.MathUtils.lerp(0, 1.2, t); 
    starRef.current.scale.setScalar(scale);

    // Rotation
    starRef.current.rotation.y += delta * 0.8;
    // Mild floating bob
    starRef.current.position.y += Math.sin(stateThree.clock.elapsedTime * 2) * 0.05;

    // Pulse Glow
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.8 + Math.sin(stateThree.clock.elapsedTime * 2) * 0.4;
    }
  });

  return (
    <group ref={starRef} position={[0, 0, 0]}>
      {/* Centering the extruded star geometry */}
      <mesh geometry={starGeometry}>
        {/* Rotate so it faces forward/upright nicely */}
        <meshStandardMaterial 
          ref={materialRef}
          color="#FFD700" 
          emissive="#FFD700"
          emissiveIntensity={1}
          toneMapped={false}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

export default FloatingOrnaments;
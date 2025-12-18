import React from 'react';
import { PerspectiveCamera, Environment, ContactShadows, OrbitControls, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeMorphState } from '../types';
import InteractiveTree from './InteractiveTree';
import FloatingOrnaments from './FloatingOrnaments';

interface ExperienceProps {
  treeState: TreeMorphState;
}

const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <>
      {/* Zoomed out to see full tree but keep bottom framed, slightly lower angle */}
      <PerspectiveCamera makeDefault position={[0, 0, 34]} fov={35} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={20}
        maxDistance={50}
        autoRotate={treeState === TreeMorphState.TREE_SHAPE}
        autoRotateSpeed={0.8}
      />

      {/* --- SOFT LUXURY LIGHTING --- */}
      <ambientLight intensity={0.9} color="#ffffff" />
      
      {/* Warm Key Light - Enhanced brightness for gold */}
      <spotLight 
        position={[15, 20, 15]} 
        angle={0.4} 
        penumbra={1} 
        intensity={250} 
        color="#FFF8E7" 
        castShadow 
        shadow-bias={-0.0001}
      />
      
      {/* Fill Light (Cooler/Mint) */}
      <pointLight position={[-15, 5, -15]} intensity={90} color="#A4C6B8" />
      
      {/* Back/Rim Light for Gold Pops */}
      <spotLight position={[0, 10, -15]} intensity={180} color="#FFD700" />

      <Environment preset="lobby" environmentIntensity={0.8} />

      {/* --- OBJECTS --- */}
      <group position={[0, -3.5, 0]}>
         <InteractiveTree state={treeState} />
         <FloatingOrnaments state={treeState} />
         
         {/* Tree Glitter / Fine Shimmer */}
         <group visible={treeState === TreeMorphState.TREE_SHAPE}>
           <Sparkles 
             count={400} 
             scale={[6, 12, 6]} // Tightly bound to tree volume
             size={1.2} 
             speed={0.2} 
             opacity={0.8} 
             color="#FFD700"
             noise={0.5}
           />
           <Sparkles 
             count={200} 
             scale={[6, 12, 6]}
             size={1.2} 
             speed={0.3} 
             opacity={0.6} 
             color="#FFFFFF"
             noise={0.5}
           />
         </group>

         <ContactShadows 
           opacity={0.5} 
           scale={40} 
           blur={2.5} 
           far={10} 
           resolution={512} 
           color="#000000" 
         />
      </group>

      {/* Floating Magic Dust (Background) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sparkles 
          count={300} 
          scale={30} 
          size={3} 
          speed={0.4} 
          opacity={0.6} 
          color="#FFF"
        />
        <Sparkles 
          count={100} 
          scale={25} 
          size={5} 
          speed={0.2} 
          opacity={0.8} 
          color="#FFD700"
        />
      </Float>

      {/* --- POST PROCESSING --- */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.75} 
          mipmapBlur 
          intensity={0.9} 
          radius={0.5}
          color="#FFF8E7"
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={0.4} />
      </EffectComposer>
    </>
  );
};

export default Experience;
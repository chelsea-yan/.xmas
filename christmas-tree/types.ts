import * as THREE from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  // The random position in space
  scatterPosition: THREE.Vector3;
  scatterRotation: THREE.Euler;
  
  // The organized position on the tree
  treePosition: THREE.Vector3;
  treeRotation: THREE.Euler;
  
  // Random scale variation
  scale: number;
  
  // Speed factor for individual animation variance
  speed: number;
}

export interface TreeConfig {
  count: number;
  radius: number;
  height: number;
  colorPrimary: string;
  colorSecondary: string;
}
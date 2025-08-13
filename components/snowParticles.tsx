'use client';

import { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { snowNoise } from '@/utils/noise';

const PARTICLE_COUNT = 500;
const AREA = 3;
const HEIGHT = 4;
const SPEED = 0.001;
const PARTICLE_SIZE = .1;
const SCALE_MIN = .5; // Minimum scale multiplier
const SCALE_MAX = 1.0; // Maximum scale multiplier
const cutoff = -2;

export const ComputeSnowParticles = forwardRef(({ texture }, ref) => {
  const meshRef = useRef(null);
  
  // Store per-particle data with added scale
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * AREA,
        y: (Math.random() - 0.5) * HEIGHT,
        z: (Math.random() - 0.5) * AREA,
        speed: SPEED * (0.5 + Math.random()),
        seed: Math.random() * 1000,
        scale: PARTICLE_SIZE * (SCALE_MIN + Math.random() * (SCALE_MAX - SCALE_MIN)), // Random scale
      });
    }
    return arr;
  }, []);

  // Instanced geometry and material
  const geometry = useMemo(() => new THREE.PlaneGeometry(PARTICLE_SIZE, PARTICLE_SIZE), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xfffff0,
    transparent: true,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    alphaTest: 0.1,
    opacity: 1,
  }), [texture]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!meshRef.current) return;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];
      // Animate Y (falling)
      p.y -= p.speed;
      
      // Perlin noise for X/Z drift
      const driftSpeed = 0.1;
      const driftAmplitude = 0.7;
      const driftX = snowNoise(p.x * 0.2, p.y * 0.1, time*driftSpeed + p.seed + 60) * driftAmplitude;
      const driftY = snowNoise(p.x * 0.2, p.y * 0.1, time*driftSpeed + p.seed + 30) * driftAmplitude;
      const driftZ = snowNoise(p.z * 0.2, p.y * 0.1, time*driftSpeed + p.seed + 0) * driftAmplitude *.3;

      // Reset if below cutoff
      if (p.y < cutoff) {
        p.y = HEIGHT / 2;
        p.x = (Math.random() - 0.5) * AREA;
        p.z = (Math.random() - 0.5) * AREA;
      }

      // Create matrix for this instance with scale
      const matrix = new THREE.Matrix4();
      const scaleMatrix = new THREE.Matrix4();
      
      // Set scale
      scaleMatrix.makeScale(p.scale, p.scale, p.scale);
      
      // Set position
      matrix.makeTranslation(
        p.x + driftX,
        p.y + driftY,
        p.z + driftZ
      );
      
      // Combine scale and position
      matrix.multiply(scaleMatrix);
      
      meshRef.current.setMatrixAt(i, matrix);
    }
    
    // Update instance matrices
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Forward the ref to allow external rotation control
    if (ref) {
      ref.current = meshRef.current;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, PARTICLE_COUNT]}
      frustumCulled={false}
      position={[0, 0, 0.5]}
    />
  );
});

ComputeSnowParticles.displayName = 'ComputeSnowParticles';
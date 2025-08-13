'use client';

import { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { snowNoise } from '@/utils/noise';

const PARTICLE_COUNT = 300;
const AREA = 4;
const HEIGHT = 4;
const SPEED = 0.001;
const PARTICLE_SIZE = .2;
const SCALE_MIN = .5; // Minimum scale multiplier
const SCALE_MAX = 1.0; // Maximum scale multiplier
const cutoff = -2;
const DRIFT_SPEED = 0.175;
const DRIFT_AMPLITUDE = .5;
const ROTATION_SPEED = 1; // Default rotation speed
const WIND_DIRECTION = new THREE.Vector3(-.25, 0, 0); // Default wind direction
export const ComputePetalParticles = forwardRef(
  ({
    texture,
    rotationSpeed = ROTATION_SPEED,
    windDirection = WIND_DIRECTION, // Add windDirection prop, default: slight X wind
  }, ref) => {
    const meshRef = useRef(null);

    // Store per-particle data with added scale and rotation
    const particles = useMemo(() => {
      const arr = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        arr.push({
          x: (Math.random() - 0.5) * AREA,
          y: (Math.random() - 0.5) * HEIGHT,
          z: (Math.random() - 0.5) * AREA,
          speed: SPEED * (0.5 + Math.random()),
          seed: Math.random() * 1000,
          scale: PARTICLE_SIZE * (SCALE_MIN + Math.random() * (SCALE_MAX - SCALE_MIN)),
          rotationAxis: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize(),
          rotationAngle: Math.random() * Math.PI * 2,
          angularSpeed: 0.01 + Math.random() * 0.03, // radians per frame
        });
      }
      return arr;
    }, []);

    // Instanced geometry and material
    const geometry = useMemo(() => new THREE.PlaneGeometry(PARTICLE_SIZE, PARTICLE_SIZE), []);
    const material = useMemo(() => new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      //color: 0xdddddd,
      transparent: true,
      depthTest: true,
      //blending: THREE.AdditiveBlending,
      //alphaTest: 0.1,
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
        const driftX = snowNoise(p.x * 0.2, p.y * 0.1, time * DRIFT_SPEED + p.seed + 60) * DRIFT_AMPLITUDE;
        const driftY = snowNoise(p.x * 0.2, p.y * 0.1, time * DRIFT_SPEED + p.seed + 30) * DRIFT_AMPLITUDE;
        const driftZ = snowNoise(p.z * 0.2, p.y * 0.1, time * DRIFT_SPEED + p.seed + 0) * DRIFT_AMPLITUDE * .3;

        // Apply wind direction to particle position
        p.x += windDirection.x * p.speed;
        p.y += windDirection.y * p.speed;
        p.z += windDirection.z * p.speed;

        // Reset if below cutoff
        if (p.y < cutoff || p.x > AREA/2) {
          p.y = -cutoff;
          p.x = (Math.random() - 0.5) * AREA;
          p.z = (Math.random() - 0.5) * AREA;
          p.rotationAngle = Math.random() * Math.PI * 2; // Reset rotation angle
        }

        // Update rotation angle with rotationSpeed multiplier
        p.rotationAngle += p.angularSpeed * rotationSpeed;

        // Create matrix for this instance with scale and rotation
        const matrix = new THREE.Matrix4();
        const scaleMatrix = new THREE.Matrix4();
        const rotationMatrix = new THREE.Matrix4();

        // Set scale
        scaleMatrix.makeScale(p.scale, p.scale, p.scale);

        // Set rotation around random axis
        rotationMatrix.makeRotationAxis(p.rotationAxis, p.rotationAngle);

        // Set position
        matrix.makeTranslation(
          p.x + driftX,
          p.y + driftY,
          p.z + driftZ
        );

        // Combine: scale -> rotate -> translate
        matrix.multiply(rotationMatrix);
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
  }
);

ComputePetalParticles.displayName = 'ComputePetalParticles';
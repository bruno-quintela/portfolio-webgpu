'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 500;
const PARTICLE_SPEED = 0.01;
const PARTICLE_SIZE = 0.15;
const PARTICLE_SPREAD = 2;

export const ParticleSystem = ({ texture }) => {
  const points = useRef();
  const particles = useRef([]);

  // Initialize particles with reasonable spread and size
  if (particles.current.length === 0) {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.current.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * PARTICLE_SPREAD,
          (Math.random() - 0.5) * PARTICLE_SPREAD,
          (Math.random() - 0.5) * PARTICLE_SPREAD
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * PARTICLE_SPEED,
          (Math.random() - 0.5) * PARTICLE_SPEED,
          (Math.random() - 0.5) * PARTICLE_SPEED
        ),
      });
    }
  }

  // Create geometry and set initial positions
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);

  particles.current.forEach((particle, i) => {
    positions[i * 3] = particle.position.x;
    positions[i * 3 + 1] = particle.position.y;
    positions[i * 3 + 2] = particle.position.z;
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Create material with correct size and blending
  const material = new THREE.PointsMaterial({
    size: PARTICLE_SIZE,
    map: texture,
    transparent: true,
    blending: THREE.NoBlending,
    depthWrite: true,
    sizeAttenuation: true,
    //alphaMap: texture,
    opacity: 1,
  });

  useFrame((state, delta) => {
    const positions = points.current.geometry.attributes.position.array;

    particles.current.forEach((particle, i) => {
      particle.position.add(particle.velocity);

      // Simple bounds check, wrap around
      for (let axis = 0; axis < 3; axis++) {
        if (particle.position.getComponent(axis) > PARTICLE_SPREAD / 2) {
          particle.position.setComponent(axis, -PARTICLE_SPREAD / 2);
        }
        if (particle.position.getComponent(axis) < -PARTICLE_SPREAD / 2) {
          particle.position.setComponent(axis, PARTICLE_SPREAD / 2);
        }
      }

      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    });

    points.current.geometry.attributes.position.needsUpdate = true;
    if (points.current) {
      points.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      position={[0, 0, 0]} // In front of your main plane
      rotation={[0, 0, 0]} // Optional: adjust rotation
      scale={[1, 1, 1]} // Optional: adjust scale
    />
  );
};


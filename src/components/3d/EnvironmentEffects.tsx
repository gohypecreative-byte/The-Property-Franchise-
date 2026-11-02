// src/components/3d/EnvironmentEffects.tsx
"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnvironmentEffectsProps {
  flightProgress: number; // 0 (deep space) to 1 (inside bridge)
}

export function EnvironmentEffects({ flightProgress }: EnvironmentEffectsProps) {
  const starsRef = useRef<THREE.Points>(null);
  const warpStarsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // Deep space starfield (1800 stars)
  const [starPositions, starColors] = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#EFF6FF"), // FF White
      new THREE.Color("#4FA3D8"), // FF Light Blue
      new THREE.Color("#1E6BB8"), // FF Blue
      new THREE.Color("#7EC8E3"), // Cyan
    ];

    for (let i = 0; i < count; i++) {
      const radius = 95 + Math.random() * 85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  // Forward streaming cosmic particles (warp dust)
  const [warpPositions, warpVelocities] = useMemo(() => {
    const count = 450;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 10;
      velocities[i] = 1.2 + Math.random() * 2.0;
    }
    return [positions, velocities];
  }, []);

  // Floating atmospheric bridge dust in Vintage Cream
  const cosmicDustPositions = useMemo(() => {
    const count = 280;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 6 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 + 2;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.015;
    }

    // Stream warp particles forward through space
    if (warpStarsRef.current) {
      const geo = warpStarsRef.current.geometry;
      const pos = geo.attributes.position.array as Float32Array;
      const speed = flightProgress < 0.55 ? 18.0 * (1 - flightProgress * 0.8) : 2.5;

      for (let i = 0; i < warpPositions.length / 3; i++) {
        pos[i * 3 + 2] += delta * speed * warpVelocities[i];
        if (pos[i * 3 + 2] > 25) {
          pos[i * 3 + 2] = -70;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.01;
      dustRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  return (
    <group>
      {/* Deep Space Background Starfield */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.75}
          vertexColors
          transparent
          opacity={0.88}
          sizeAttenuation
        />
      </points>

      {/* Streaming Warp Particles */}
      <points ref={warpStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[warpPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#C5E4F7"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Atmospheric Bridge Dust in FF Blue-White */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[cosmicDustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#4FA3D8"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Distant Celestial Franchise Hub Planet (FF Blue & Cyan Ring) */}
      <group position={[-42, 24, -80]} rotation={[0.4, 0.6, 0.2]}>
        <mesh>
          <sphereGeometry args={[11, 48, 48]} />
          <meshStandardMaterial
            color="#1E3A6B"
            roughness={0.65}
            metalness={0.3}
            emissive="#0D2244"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[11, 32, 32]} />
          <meshBasicMaterial
            color="#4FA3D8"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
        {/* Planetary Orbital Ring in FF Blue */}
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[14, 22, 64]} />
          <meshStandardMaterial
            color="#1E6BB8"
            emissive="#1E6BB8"
            emissiveIntensity={0.65}
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Distant Franchise Territory Moon in FF White */}
      <group position={[36, 18, -65]}>
        <mesh>
          <sphereGeometry args={[4.2, 32, 32]} />
          <meshStandardMaterial
            color="#EFF6FF"
            roughness={0.75}
            emissive="#1E6BB8"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[4.2, 24, 24]} />
          <meshBasicMaterial
            color="#C5E4F7"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

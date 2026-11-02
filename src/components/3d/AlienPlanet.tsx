// src/components/3d/AlienPlanet.tsx
"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

export function AlienPlanet() {
  // Generate commercial architectural beacons & crystals around the landing perimeter
  const crystals = useMemo(() => {
    const list: Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      scale: [number, number, number];
      color: string;
      emissive: string;
    }> = [];

    // Vintage palette: Cream, Vintage Red, Muted Blue
    const colors = [
      { color: "#E4002B", emissive: "#B8001F" },
      { color: "#EAF0F8", emissive: "#C9D4E5" },
      { color: "#354F70", emissive: "#1A2838" },
    ];

    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 6 + Math.random() * 12;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist - 2;
      const y = -0.9 + Math.random() * 0.2;
      const col = colors[i % colors.length];

      list.push({
        pos: [x, y, z],
        rot: [
          (Math.random() - 0.5) * 0.4,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.4,
        ],
        scale: [
          0.3 + Math.random() * 0.4,
          0.8 + Math.random() * 1.6,
          0.3 + Math.random() * 0.4,
        ],
        color: col.color,
        emissive: col.emissive,
      });
    }

    return list;
  }, []);

  return (
    <group position={[0, -1, 0]}>
      {/* Planetary Base Grid / Terrain in Deep Muted Navy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 48, 48]} />
        <meshStandardMaterial
          color="#253952"
          roughness={0.88}
          metalness={0.25}
          wireframe={false}
        />
      </mesh>

      {/* Flagship Landing Zone Ring in Vintage Red and Cream */}
      <group position={[0, 0.02, -3.8]}>
        {/* Outer Ring - Vintage Red */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6.0, 6.25, 64]} />
          <meshBasicMaterial
            color="#E4002B"
            side={THREE.DoubleSide}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* Secondary Inner Ring - Cream */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.2, 4.35, 48]} />
          <meshBasicMaterial
            color="#EAF0F8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Center Target Crosshairs - Vintage Red */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.68, 32]} />
          <meshBasicMaterial
            color="#E4002B"
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Landing Guide Beacons */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, idx) => {
          const px = Math.cos(angle) * 6.1;
          const pz = Math.sin(angle) * 6.1;
          return (
            <group key={idx} position={[px, 0, pz]}>
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.08, 0.12, 0.5, 12]} />
                <meshStandardMaterial
                  color="#253952"
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
              {/* Beacon Light Bulb in Cream */}
              <mesh position={[0, 0.55, 0]}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshBasicMaterial color="#EAF0F8" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Glowing Architectural Crystals in Cream, Red, Blue */}
      {crystals.map((c, i) => (
        <mesh
          key={i}
          position={c.pos}
          rotation={c.rot}
          scale={c.scale}
          castShadow
        >
          <coneGeometry args={[0.4, 2, 6]} />
          <meshStandardMaterial
            color={c.color}
            emissive={c.emissive}
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Atmospheric Horizon Haze in Muted Blue */}
      <mesh position={[0, 2, -25]}>
        <cylinderGeometry args={[50, 50, 6, 32, 1, true]} />
        <meshBasicMaterial
          color="#1A2838"
          side={THREE.BackSide}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

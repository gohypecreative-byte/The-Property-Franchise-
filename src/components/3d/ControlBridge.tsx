// src/components/3d/ControlBridge.tsx
"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ControlBridgeProps {
  progress: number; // 0 to 1 synchronized from scroll
}

export function ControlBridge({ progress }: ControlBridgeProps) {
  const captainConsoleRef = useRef<THREE.Group>(null);
  const archiveConsoleRef = useRef<THREE.Group>(null);
  const navConsoleRef = useRef<THREE.Group>(null);
  const operationsConsoleRef = useRef<THREE.Group>(null);

  const holoConsoleRef = useRef<THREE.Group>(null);
  const galaxyConsoleRef = useRef<THREE.Group>(null);
  const towerHoloRef = useRef<THREE.Group>(null);
  const bridgeLightRef = useRef<THREE.PointLight>(null);

  // Interior becomes fully visible when camera passes through the canopy (progress > 0.40)
  const interiorOpacity = Math.min(1, Math.max(0, (progress - 0.40) / 0.25));

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const aspect = state.viewport.aspect;

    // Responsive spread factor: tighter on portrait mobile, expanding gracefully on wide desktop
    const spreadFactor = Math.max(0.48, Math.min(1.0, aspect / 1.35));
    const responsiveScale = Math.max(0.72, Math.min(1.0, aspect / 1.15));

    // Emergence easing matching AlienCharacters (progress 0.40 to 0.68)
    const emergeProgress = Math.min(1, Math.max(0, (progress - 0.40) / 0.26));
    const easeEmerge = 1 - Math.pow(1 - emergeProgress, 3);

    // Reposition tactical consoles at hip level directly in front of their respective characters
    // Spacious, consistent spacing: Sue (-1.26), Reed (-0.42), Johnny (+0.42), Ben (+1.26) -> 0.84 gap
    // 1. Mr. Fantastic Command Console (Center-Left Helm)
    if (captainConsoleRef.current) {
      captainConsoleRef.current.position.set(-0.42 * spreadFactor * easeEmerge, -0.40, 1.48);
      captainConsoleRef.current.scale.setScalar(0.92 * responsiveScale);
      captainConsoleRef.current.rotation.y = 0;
    }

    // 2. Invisible Woman Archive Console (Port Wing - Left)
    if (archiveConsoleRef.current) {
      archiveConsoleRef.current.position.set(-1.26 * spreadFactor * easeEmerge, -0.40, 1.38);
      archiveConsoleRef.current.scale.setScalar(0.80 * responsiveScale);
      archiveConsoleRef.current.rotation.y = THREE.MathUtils.lerp(0, 0.14, easeEmerge);
    }

    // 3. Human Torch Navigation Console (Center-Right)
    if (navConsoleRef.current) {
      navConsoleRef.current.position.set(0.42 * spreadFactor * easeEmerge, -0.40, 1.38);
      navConsoleRef.current.scale.setScalar(0.80 * responsiveScale);
      navConsoleRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.14, easeEmerge);
    }

    // 4. The Thing Operations Console (Starboard Wing - Right)
    if (operationsConsoleRef.current) {
      operationsConsoleRef.current.position.set(1.26 * spreadFactor * easeEmerge, -0.40, 1.32);
      operationsConsoleRef.current.scale.setScalar(0.78 * responsiveScale);
      operationsConsoleRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.22, easeEmerge);
    }

    if (holoConsoleRef.current) {
      holoConsoleRef.current.rotation.y = time * 0.4;
    }

    if (galaxyConsoleRef.current) {
      galaxyConsoleRef.current.rotation.y = -time * 0.5;
    }

    if (towerHoloRef.current) {
      towerHoloRef.current.rotation.y = time * 0.3;
    }

    if (bridgeLightRef.current) {
      bridgeLightRef.current.intensity = 1.2 + Math.sin(time * 2) * 0.15;
    }
  });

  if (interiorOpacity <= 0.01) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          BRIDGE STRUCTURAL SHELL & PANORAMIC VIEWPORT FRAME
         ======================================================== */}
      {/* Arched Panoramic Canopy Ring Frame */}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[5.2, 0.18, 16, 48, Math.PI]} />
        <meshStandardMaterial
          color="#1E3A6B"
          roughness={0.3}
          metalness={0.75}
        />
      </mesh>

      {/* Structural Pillars (Left & Right) in FF Navy */}
      <mesh position={[-4.8, 1.0, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.2, 0.28, 4.0, 12]} />
        <meshStandardMaterial color="#1E3A6B" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[4.8, 1.0, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.2, 0.28, 4.0, 12]} />
        <meshStandardMaterial color="#1E3A6B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* FF White Trim Accents on Overhead Ribs */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[4.2, 0.08, 0.4]} />
        <meshStandardMaterial color="#EFF6FF" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Bridge Floor Command Deck */}
      <group position={[0, -0.98, 1.5]}>
        {/* Main Deck Circle in FF Navy */}
        <mesh receiveShadow>
          <cylinderGeometry args={[5.8, 6.2, 0.2, 32]} />
          <meshStandardMaterial
            color="#1E3A6B"
            roughness={0.65}
            metalness={0.5}
          />
        </mesh>

        {/* Central Raised Command Dais in Deep FF Navy */}
        <mesh position={[0, 0.11, 0.5]}>
          <cylinderGeometry args={[2.2, 2.4, 0.14, 32]} />
          <meshStandardMaterial
            color="#0D2244"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>

        {/* FF Blue Perimeter Guideway Ring */}
        <mesh position={[0, 0.18, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.12, 48]} />
          <meshBasicMaterial color="#1E6BB8" side={THREE.DoubleSide} />
        </mesh>

        {/* FF White Inner Target Ring */}
        <mesh position={[0, 0.18, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.18, 36]} />
          <meshBasicMaterial color="#EFF6FF" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ========================================================
          CAPTAIN'S COMMAND STATION & HOLOGRAPHIC HELM (CENTER-LEFT)
         ======================================================== */}
      <group ref={captainConsoleRef} position={[-0.42, -0.38, 1.62]}>
        {/* Sleek Command Console Pedestal in FF Navy */}
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.78, 0.46, 0.34]} />
          <meshStandardMaterial
            color="#1E3A6B"
            roughness={0.35}
            metalness={0.7}
          />
        </mesh>

        {/* Angled Control Panel Surface */}
        <mesh position={[0, 0.12, 0.04]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[0.74, 0.03, 0.30]} />
          <meshStandardMaterial color="#292824" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Console LED Buttons in FF White & FF Blue */}
        <mesh position={[-0.20, 0.15, 0.04]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[0.22, 0.015, 0.08]} />
          <meshBasicMaterial color="#EFF6FF" />
        </mesh>
        <mesh position={[0.20, 0.15, 0.04]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[0.22, 0.015, 0.08]} />
          <meshBasicMaterial color="#1E6BB8" />
        </mesh>

        {/* Floating Holographic Telemetry Rings */}
        <group ref={holoConsoleRef} position={[0, 0.42, 0]}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[0.30, 0.34, 32]} />
            <meshBasicMaterial color="#EFF6FF" side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 4, 0, 0]}>
            <ringGeometry args={[0.20, 0.23, 24]} />
            <meshBasicMaterial color="#4FA3D8" side={THREE.DoubleSide} transparent opacity={0.75} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          CHARACTER 1'S STATION: ARCHIVE / MEMORY REELS TERMINAL (PORT WING)
         ======================================================== */}
      <group ref={archiveConsoleRef} position={[-1.35, -0.38, 1.15]} rotation={[0, 0.28, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.46, 0.32]} />
          <meshStandardMaterial color="#1E3A6B" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.25, 0.03]} rotation={[-0.38, 0, 0]}>
          <boxGeometry args={[0.68, 0.025, 0.28]} />
          <meshStandardMaterial color="#292824" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Holographic Reel Film Strip Ring in FF Blue */}
        <mesh position={[0, 0.52, 0]} rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.22, 0.27, 24]} />
          <meshBasicMaterial color="#4FA3D8" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* ========================================================
          CHARACTER 2'S STATION: FRANCHISE GALAXY STAR-MAP TERMINAL (STARBOARD WING)
         ======================================================== */}
      <group ref={navConsoleRef} position={[1.35, -0.38, 1.15]} rotation={[0, -0.28, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.46, 0.32]} />
          <meshStandardMaterial color="#1E3A6B" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.25, 0.03]} rotation={[-0.38, 0, 0]}>
          <boxGeometry args={[0.68, 0.025, 0.28]} />
          <meshStandardMaterial color="#292824" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Mini Orbiting Holographic Planets */}
        <group ref={galaxyConsoleRef} position={[0, 0.54, 0]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#EFF6FF" emissive="#EFF6FF" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0.22, 0.04, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#1E6BB8" />
          </mesh>
          <mesh position={[-0.18, -0.03, 0.08]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshBasicMaterial color="#4FA3D8" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.20, 0.22, 32]} />
            <meshBasicMaterial color="#EFF6FF" side={THREE.DoubleSide} transparent opacity={0.5} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          CHARACTER 3'S STATION: OPERATIONS PRINCIPAL (CENTER-RIGHT)
         ======================================================== */}
      <group ref={operationsConsoleRef} position={[0.42, -0.38, 1.62]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.78, 0.46, 0.34]} />
          <meshStandardMaterial color="#1E3A6B" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.12, 0.04]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[0.74, 0.03, 0.30]} />
          <meshStandardMaterial color="#292824" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Floating Wireframe Skyscraper Hologram in FF White */}
        <group ref={towerHoloRef} position={[0, 0.46, 0]}>
          <mesh>
            <boxGeometry args={[0.13, 0.38, 0.13]} />
            <meshBasicMaterial color="#EFF6FF" wireframe />
          </mesh>
        </group>
      </group>

      {/* Bridge Ambient & FF Blue Rim Lights */}
      <pointLight
        ref={bridgeLightRef}
        position={[0, 2.2, 1.8]}
        color="#C5E4F7"
        intensity={1.4}
        distance={9}
      />
      <pointLight
        position={[-3, 1.2, 1.0]}
        color="#1E6BB8"
        intensity={0.9}
        distance={6}
      />
      <pointLight
        position={[3, 1.2, 1.0]}
        color="#4FA3D8"
        intensity={1.2}
        distance={6}
      />
    </group>
  );
}

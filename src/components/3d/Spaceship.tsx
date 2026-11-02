// src/components/3d/Spaceship.tsx
"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpaceshipProps {
  progress: number; // 0 (deep space flight) -> 0.5 (cockpit approach) -> 1.0 (inside bridge)
}

export function Spaceship({ progress }: SpaceshipProps) {
  const shipGroupRef = useRef<THREE.Group>(null);
  const thrusterRef1 = useRef<THREE.Mesh>(null);
  const thrusterRef2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!shipGroupRef.current) return;
    const time = state.clock.elapsedTime;

    // Smooth forward progression and gentle roll sway
    const rollSway = Math.sin(time * 1.4) * 0.04;
    const pitchSway = Math.sin(time * 0.9) * 0.02;

    // The ship flies through space during initial scroll, stabilizing as camera reaches the bridge
    const forwardZ = THREE.MathUtils.lerp(-14, 0, Math.min(1, progress / 0.5));
    const forwardY = THREE.MathUtils.lerp(0.8, 0, Math.min(1, progress / 0.5));

    shipGroupRef.current.position.set(0, forwardY, forwardZ);
    shipGroupRef.current.rotation.set(pitchSway, 0, rollSway);

    // Engine flame pulsation in Vintage Red
    const pulse = 1 + Math.sin(time * 24) * 0.15;
    const thrusterScale = progress < 0.6 ? 1.8 * pulse : 0.6;

    if (thrusterRef1.current && thrusterRef2.current) {
      thrusterRef1.current.scale.set(1, 1, thrusterScale);
      thrusterRef2.current.scale.set(1, 1, thrusterScale);
    }
  });

  // Fade exterior hull as camera moves fully inside the bridge
  const exteriorOpacity = Math.max(0, 1 - Math.max(0, (progress - 0.52) / 0.25));

  return (
    <group ref={shipGroupRef} scale={[1.36, 1.36, 1.36]}>
      {/* ========================================================
          FANTASTIC FOUR EXCELSIOR SPACESHIP (FF BLUE, WHITE & CYAN)
         ======================================================== */}
      {exteriorOpacity > 0.02 && (
        <group>
          {/* Main Fuselage Body in Fantastic Blue */}
          <mesh position={[0, 0.4, -1.8]} castShadow receiveShadow>
            <cylinderGeometry args={[1.0, 1.9, 7.5, 12]} />
            <meshStandardMaterial
              color="#0F75BD"
              roughness={0.3}
              metalness={0.7}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>

          {/* Panoramic Cockpit Canopy Glass Dome */}
          <mesh position={[0, 1.1, 1.2]} rotation={[0.42, 0, 0]}>
            <sphereGeometry args={[1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
            <meshStandardMaterial
              color="#BAE6FD"
              roughness={0.1}
              metalness={0.85}
              transparent
              opacity={Math.min(0.65, exteriorOpacity * 0.75)}
            />
          </mesh>

          {/* Canopy Structural Frame in FF White & Cyan */}
          <mesh position={[0, 1.2, 1.2]} rotation={[0.42, 0, 0]}>
            <torusGeometry args={[1.34, 0.05, 12, 32]} />
            <meshBasicMaterial color="#38BDF8" transparent opacity={exteriorOpacity} />
          </mesh>

          {/* Forward Sensor Nosecone in FF White */}
          <mesh position={[0, 0.4, 2.6]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.65, 1.6, 12]} />
            <meshStandardMaterial
              color="#FFFFFF"
              roughness={0.25}
              metalness={0.8}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>

          {/* Port Swept Wing in Fantastic Blue */}
          <mesh position={[-2.8, 0.35, -2.0]} rotation={[0, 0.22, -0.05]} castShadow>
            <boxGeometry args={[3.8, 0.16, 3.2]} />
            <meshStandardMaterial
              color="#0F75BD"
              metalness={0.75}
              roughness={0.3}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>

          {/* Port Wing "4" Emblem */}
          <mesh position={[-2.8, 0.45, -2.0]} rotation={[-Math.PI / 2, 0, 0.22]}>
            <ringGeometry args={[0.35, 0.45, 24]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={exteriorOpacity} side={THREE.DoubleSide} />
          </mesh>

          {/* Starboard Swept Wing in Fantastic Blue */}
          <mesh position={[2.8, 0.35, -2.0]} rotation={[0, -0.22, 0.05]} castShadow>
            <boxGeometry args={[3.8, 0.16, 3.2]} />
            <meshStandardMaterial
              color="#0F75BD"
              metalness={0.75}
              roughness={0.3}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>

          {/* Starboard Wing "4" Emblem */}
          <mesh position={[2.8, 0.45, -2.0]} rotation={[-Math.PI / 2, 0, -0.22]}>
            <ringGeometry args={[0.35, 0.45, 24]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={exteriorOpacity} side={THREE.DoubleSide} />
          </mesh>

          {/* Wingtip Cyan Aero Fins */}
          <mesh position={[-4.7, 0.8, -2.3]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.15, 1.2, 1.8]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#0284C7"
              emissiveIntensity={1.2}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>
          <mesh position={[4.7, 0.8, -2.3]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.15, 1.2, 1.8]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#0284C7"
              emissiveIntensity={1.2}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>

          {/* Dual Vertical Tail Stabilizers in FF White */}
          <mesh position={[-1.1, 1.6, -4.2]} rotation={[0, 0, -0.22]}>
            <boxGeometry args={[0.14, 1.8, 2.2]} />
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.8}
              roughness={0.25}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>
          <mesh position={[1.1, 1.6, -4.2]} rotation={[0, 0, 0.22]}>
            <boxGeometry args={[0.14, 1.8, 2.2]} />
            <meshStandardMaterial
              color="#FFFFFF"
              metalness={0.8}
              roughness={0.25}
              transparent
              opacity={exteriorOpacity}
            />
          </mesh>

          {/* Engine Thruster Pods in Fantastic Deep Blue */}
          <group position={[-1.4, 0.4, -5.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.65, 0.75, 1.4, 16]} />
              <meshStandardMaterial
                color="#0A4C80"
                metalness={0.85}
                roughness={0.3}
                transparent
                opacity={exteriorOpacity}
              />
            </mesh>
            {/* Plasma Flame - Cyan / Ion Glow */}
            <mesh ref={thrusterRef1} position={[0, 0, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.55, 2.2, 16]} />
              <meshStandardMaterial
                color="#38BDF8"
                emissive="#0EA5E9"
                emissiveIntensity={3.2}
                transparent
                opacity={0.85 * exteriorOpacity}
              />
            </mesh>
          </group>

          <group position={[1.4, 0.4, -5.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.65, 0.75, 1.4, 16]} />
              <meshStandardMaterial
                color="#0A4C80"
                metalness={0.85}
                roughness={0.3}
                transparent
                opacity={exteriorOpacity}
              />
            </mesh>
            {/* Plasma Flame - Cyan / Ion Glow */}
            <mesh ref={thrusterRef2} position={[0, 0, -1.0]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.55, 2.2, 16]} />
              <meshStandardMaterial
                color="#38BDF8"
                emissive="#0EA5E9"
                emissiveIntensity={3.2}
                transparent
                opacity={0.85 * exteriorOpacity}
              />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

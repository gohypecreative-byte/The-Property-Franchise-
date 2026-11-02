"use client";

import React, { useRef, useState, startTransition } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================
// Fantastic Four "First Steps" Retro-Futuristic Color Palette
// Directly matched to the 1960s Movie Posters
// ============================================================
const FF_BLUE = "#0E72C4";         // Iconic 60s Cobalt/Cerulean Suit Blue
const FF_BLUE_DARK = "#094880";    // Suit shadow / inner collar tone
const FF_CYAN = "#38BDF8";         // Luminous Baxter cyan
const FF_WHITE = "#FFFFFF";        // Crisp astronaut white turtlenecks, gloves & boots
const FF_CREAM_WHITE = "#F8FAFC";  // Knit sweater white
const FF_BELT = "#F1F5F9";        // White utility belt
const FF_BUCKLE = "#94A3B8";      // Brushed chrome buckle hardware
const FF_NAVY = "#061325";         // Floor pedestal navy

// Johnny Storm Flame Palette
const FLAME_ORG = "#FF5500";
const FLAME_RED = "#DC2626";
const FLAME_YLW = "#FFD700";
const FLAME_WHITE = "#FFFBEB";

// The Thing Rock Palette (Amber Sandstone)
const ROCK_BASE = "#C98A48";       // Warm golden-amber rock base
const ROCK_DARK = "#7E4716";       // Deep rock shadow crevices
const ROCK_CRACK = "#452108";      // Deep fissure vein lines
const ROCK_HIGHLIGHT = "#E8B072";  // Sunlit rock brow highlight

interface AlienCharactersProps {
  progress: number;
  onMainCharacterClick?: () => void;  // Mr. Fantastic (Reed Richards) → Intro video
  onReelsClick?: () => void;          // Invisible Woman (Sue Storm) → Memory reels
  onPlanetsClick?: () => void;        // Human Torch (Johnny Storm) → Showcase Gallery
  onThirdCharacterClick?: () => void; // The Thing (Ben Grimm) → Contact Us
  badgeRefs?: {
    sue: React.RefObject<HTMLDivElement | null>;
    reed: React.RefObject<HTMLDivElement | null>;
    johnny: React.RefObject<HTMLDivElement | null>;
    ben: React.RefObject<HTMLDivElement | null>;
  };
  onHoverChar?: (char: "sue" | "reed" | "johnny" | "ben" | null) => void;
}

export function AlienCharacters({
  progress,
  onMainCharacterClick,
  onReelsClick,
  onPlanetsClick,
  onThirdCharacterClick,
  badgeRefs,
  onHoverChar,
}: AlienCharactersProps) {
  const [reedHovered, setReedHovered] = useState(false);
  const [sueHovered, setSueHovered] = useState(false);
  const [johnnyHovered, setJohnnyHovered] = useState(false);
  const [benHovered, setBenHovered] = useState(false);

  // Group references
  const reedRef = useRef<THREE.Group>(null);
  const sueRef = useRef<THREE.Group>(null);
  const johnnyRef = useRef<THREE.Group>(null);
  const benRef = useRef<THREE.Group>(null);
  const tempBadgeVec = useRef(new THREE.Vector3());

  // Character-specific animation refs
  const reedStretchArmRef = useRef<THREE.Group>(null);
  const reedQuantumRingRef = useRef<THREE.Mesh>(null);
  const sueForceFieldRef = useRef<THREE.Mesh>(null);
  const sueForceFieldOuterRef = useRef<THREE.Mesh>(null);
  const johnnyFlame1Ref = useRef<THREE.Mesh>(null);
  const johnnyFlame2Ref = useRef<THREE.Mesh>(null);
  const johnnyFlame3Ref = useRef<THREE.Mesh>(null);
  const johnnyEmber1Ref = useRef<THREE.Mesh>(null);
  const johnnyEmber2Ref = useRef<THREE.Mesh>(null);
  const johnnyHandFlameRef = useRef<THREE.Group>(null);
  const benFistRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const aspect = state.viewport.aspect;

    // Viewport-aware layout: generous uncrowded spacing with zero viewport clipping
    const spreadFactor = Math.max(0.46, Math.min(1.0, aspect / 1.35));
    const responsiveScale = Math.max(0.70, Math.min(1.0, aspect / 1.15));

    // Emergence easing as camera enters the bridge (progress 0.40 to 0.68)
    const emergeProgress = Math.min(1, Math.max(0, (progress - 0.40) / 0.26));
    const easeEmerge = 1 - Math.pow(1 - emergeProgress, 3);
    const isVisible = emergeProgress > 0.02;
    const emergeY = (1 - easeEmerge) * -0.55;

    // -------------------------------------------------------------
    // Spacious, uncrowded spacing: Sue (-1.26), Reed (-0.42), Johnny (+0.42), Ben (+1.26)
    // Distance between every adjacent pair = 0.84 units! Zero overlap, 100% visible
    // -------------------------------------------------------------

    // 1. INVISIBLE WOMAN (Sue Storm) — Port Wing (Left)
    if (sueRef.current) {
      sueRef.current.visible = isVisible;
      const idle = Math.sin(time * 1.6 + 1.2) * 0.012;
      const hoverBoost = sueHovered ? 1.05 : 1.0;
      sueRef.current.position.set(-1.26 * spreadFactor * easeEmerge, -0.24 + emergeY + idle, 1.14);
      sueRef.current.scale.setScalar(0.80 * easeEmerge * hoverBoost * responsiveScale);
      sueRef.current.rotation.y = THREE.MathUtils.lerp(0, 0.14, easeEmerge);
    }
    if (sueForceFieldRef.current) {
      const pulse = 0.70 + Math.sin(time * 2.4) * 0.06;
      sueForceFieldRef.current.scale.setScalar(pulse);
      (sueForceFieldRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.22 + Math.sin(time * 2.4) * 0.07;
    }
    if (sueForceFieldOuterRef.current) {
      const pulse2 = 0.84 + Math.sin(time * 1.8 + 1) * 0.05;
      sueForceFieldOuterRef.current.scale.setScalar(pulse2);
      (sueForceFieldOuterRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.10 + Math.sin(time * 2.0 + 0.5) * 0.04;
    }

    // -------------------------------------------------------------
    // 2. MR. FANTASTIC (Reed Richards) — PROMINENT HERO (Center-Left)
    // -------------------------------------------------------------
    if (reedRef.current) {
      reedRef.current.visible = isVisible;
      const idle = Math.sin(time * 1.8) * 0.014;
      const hoverBoost = reedHovered ? 1.07 : 1.0;
      // Leading hero: visually highlighted, commanding presence, forward depth
      reedRef.current.position.set(-0.42 * spreadFactor * easeEmerge, -0.22 + emergeY + idle, 1.28);
      reedRef.current.scale.setScalar(0.94 * easeEmerge * hoverBoost * responsiveScale);
      reedRef.current.rotation.y = 0;
    }
    if (reedStretchArmRef.current) {
      const stretch = 1 + Math.sin(time * 1.5) * 0.15;
      reedStretchArmRef.current.scale.set(1, stretch, 1);
      reedStretchArmRef.current.rotation.x = -0.52 + Math.sin(time * 1.2) * 0.07;
    }
    if (reedQuantumRingRef.current) {
      reedQuantumRingRef.current.rotation.z = time * 2.2;
      reedQuantumRingRef.current.rotation.x = time * 1.4;
    }

    // -------------------------------------------------------------
    // 3. HUMAN TORCH (Johnny Storm) — Center-Right
    // -------------------------------------------------------------
    if (johnnyRef.current) {
      johnnyRef.current.visible = isVisible;
      const idle = Math.sin(time * 2.4 + 2.5) * 0.014;
      const hoverBoost = johnnyHovered ? 1.05 : 1.0;
      // Positioned with matching 0.84 gap from Reed, zero overlap
      johnnyRef.current.position.set(0.42 * spreadFactor * easeEmerge, -0.24 + emergeY + idle, 1.14);
      johnnyRef.current.scale.setScalar(0.80 * easeEmerge * hoverBoost * responsiveScale);
      johnnyRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.14, easeEmerge);
    }
    if (johnnyHandFlameRef.current) {
      const handPulse = 1.0 + Math.sin(time * 8.0) * 0.20;
      johnnyHandFlameRef.current.scale.setScalar(handPulse);
      johnnyHandFlameRef.current.rotation.y = time * 2.0;
    }
    if (johnnyFlame1Ref.current) {
      johnnyFlame1Ref.current.scale.y = 1.02 + Math.sin(time * 5.2) * 0.22;
      johnnyFlame1Ref.current.position.x = Math.sin(time * 3.5) * 0.04;
    }
    if (johnnyFlame2Ref.current) {
      johnnyFlame2Ref.current.scale.y = 0.88 + Math.sin(time * 6.0 + 1) * 0.20;
      johnnyFlame2Ref.current.position.x = Math.sin(time * 4.0 + 0.8) * 0.04;
    }
    if (johnnyFlame3Ref.current) {
      johnnyFlame3Ref.current.scale.y = 0.72 + Math.sin(time * 4.4 + 2) * 0.18;
    }
    if (johnnyEmber1Ref.current) {
      const t = (time * 0.9) % 1;
      johnnyEmber1Ref.current.position.set(
        0.34 + Math.sin(time * 3.2) * 0.18, 1.4 + t * 1.3, 0.24 + Math.cos(time * 2.5) * 0.14
      );
      johnnyEmber1Ref.current.scale.setScalar(0.04 + (1 - t) * 0.04);
    }
    if (johnnyEmber2Ref.current) {
      const t2 = (time * 0.75 + 0.45) % 1;
      johnnyEmber2Ref.current.position.set(
        0.32 + Math.cos(time * 2.8 + 1) * 0.16, 1.2 + t2 * 1.35, 0.22 + Math.sin(time * 3.0 + 2) * 0.12
      );
      johnnyEmber2Ref.current.scale.setScalar(0.035 + (1 - t2) * 0.045);
    }

    // -------------------------------------------------------------
    // 4. THE THING (Ben Grimm) — Starboard Flank (Right Side)
    //    Slightly smaller, positioned toward side of screen, 100% visible, zero overlap
    // -------------------------------------------------------------
    if (benRef.current) {
      benRef.current.visible = isVisible;
      const idle = Math.sin(time * 1.3 + 1.8) * 0.009;
      const hoverBoost = benHovered ? 1.05 : 1.0;
      // Positioned comfortably toward the side (x = 1.44), scaled to 0.76 for optimal screen fit
      benRef.current.position.set(1.44 * spreadFactor * easeEmerge, -0.24 + emergeY + idle, 1.12);
      benRef.current.scale.setScalar(0.76 * easeEmerge * hoverBoost * responsiveScale);
      benRef.current.rotation.y = THREE.MathUtils.lerp(0, -0.25, easeEmerge);
    }
    if (benFistRef.current) {
      benFistRef.current.rotation.z = -0.30 + Math.sin(time * 1.2) * 0.07;
    }

    // -------------------------------------------------------------
    // Screen Coordinate Projections for 2D HTML Tooltip Badges
    // Precisely anchored directly above the head crest of each character
    // with top-of-screen boundary protection to prevent clipping
    // -------------------------------------------------------------
    if (badgeRefs) {
      if (sueRef.current && badgeRefs.sue.current) {
        tempBadgeVec.current.set(0, 1.96, 0);
        tempBadgeVec.current.applyMatrix4(sueRef.current.matrixWorld);
        tempBadgeVec.current.project(state.camera);
        const x = (tempBadgeVec.current.x * 0.5 + 0.5) * state.size.width;
        const y = (-tempBadgeVec.current.y * 0.5 + 0.5) * state.size.height;
        const safeX = Math.max(70, Math.min(state.size.width - 70, x));
        const safeY = Math.max(76, y);
        badgeRefs.sue.current.style.left = `${safeX}px`;
        badgeRefs.sue.current.style.top = `${safeY}px`;
      }
      if (reedRef.current && badgeRefs.reed.current) {
        tempBadgeVec.current.set(0, 2.06, 0);
        tempBadgeVec.current.applyMatrix4(reedRef.current.matrixWorld);
        tempBadgeVec.current.project(state.camera);
        const x = (tempBadgeVec.current.x * 0.5 + 0.5) * state.size.width;
        const y = (-tempBadgeVec.current.y * 0.5 + 0.5) * state.size.height;
        const safeX = Math.max(70, Math.min(state.size.width - 70, x));
        const safeY = Math.max(76, y);
        badgeRefs.reed.current.style.left = `${safeX}px`;
        badgeRefs.reed.current.style.top = `${safeY}px`;
      }
      if (johnnyRef.current && badgeRefs.johnny.current) {
        tempBadgeVec.current.set(0, 2.00, 0);
        tempBadgeVec.current.applyMatrix4(johnnyRef.current.matrixWorld);
        tempBadgeVec.current.project(state.camera);
        const x = (tempBadgeVec.current.x * 0.5 + 0.5) * state.size.width;
        const y = (-tempBadgeVec.current.y * 0.5 + 0.5) * state.size.height;
        const safeX = Math.max(70, Math.min(state.size.width - 70, x));
        const safeY = Math.max(76, y);
        badgeRefs.johnny.current.style.left = `${safeX}px`;
        badgeRefs.johnny.current.style.top = `${safeY}px`;
      }
      if (benRef.current && badgeRefs.ben.current) {
        tempBadgeVec.current.set(0, 2.15, 0);
        tempBadgeVec.current.applyMatrix4(benRef.current.matrixWorld);
        tempBadgeVec.current.project(state.camera);
        const x = (tempBadgeVec.current.x * 0.5 + 0.5) * state.size.width;
        const y = (-tempBadgeVec.current.y * 0.5 + 0.5) * state.size.height;
        const safeX = Math.max(70, Math.min(state.size.width - 70, x));
        const safeY = Math.max(76, y);
        badgeRefs.ben.current.style.left = `${safeX}px`;
        badgeRefs.ben.current.style.top = `${safeY}px`;
      }
    }
  });

  return (
    <group>
      {/* ================================================================
          1. INVISIBLE WOMAN (Sue Storm / Vanessa Kirby) — Port Wing (Left)
             Callback: onReelsClick (opens archive / memory reels)
         ================================================================ */}
      <group
        ref={sueRef}
        rotation={[0, 0.22, 0]}
      >
        {/* Dedicated Hover & Click Hitbox */}
        <mesh
          position={[0, 1.15, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setSueHovered(true);
              onHoverChar?.("sue");
            });
            document.body.style.cursor = "pointer";
          }}
          onPointerEnter={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setSueHovered(true);
              onHoverChar?.("sue");
            });
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setSueHovered(false);
              onHoverChar?.(null);
            });
            document.body.style.cursor = "auto";
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setSueHovered(false);
              onHoverChar?.(null);
            });
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onReelsClick) onReelsClick();
          }}
        >
          <boxGeometry args={[1.4, 2.5, 1.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <spotLight
          position={[0, 4.4, 1.6]}
          target-position={[0, 1.0, 0]}
          color="#BAE6FD"
          intensity={sueHovered ? 5.2 : 3.0}
          distance={8.5}
          angle={0.44}
          penumbra={0.6}
        />
        <pointLight
          position={[0, 1.4, 0.6]}
          color={FF_CYAN}
          intensity={sueHovered ? 2.8 : 1.4}
          distance={3.0}
        />

        {/* Shimmering Force Field Spheres */}
        <mesh ref={sueForceFieldRef} position={[0, 1.15, 0]} raycast={() => null}>
          <sphereGeometry args={[0.74, 28, 28]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.24} side={THREE.FrontSide} />
        </mesh>
        <mesh ref={sueForceFieldOuterRef} position={[0, 1.15, 0]} raycast={() => null}>
          <sphereGeometry args={[0.88, 22, 22]} />
          <meshBasicMaterial color="#E0F2FE" transparent opacity={0.12} side={THREE.FrontSide} />
        </mesh>

        {/* Floor Dais */}
        <group position={[0, 0.02, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[0.48, 0.54, 0.05, 28]} />
            <meshStandardMaterial color={FF_NAVY} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.40, 0.46, 32]} />
            <meshBasicMaterial color={sueHovered ? FF_WHITE : FF_CYAN} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* White Boots */}
        <mesh position={[-0.14, 0.07, 0.04]} castShadow>
          <boxGeometry args={[0.11, 0.12, 0.24]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0.14, 0.07, 0.04]} castShadow>
          <boxGeometry args={[0.11, 0.12, 0.24]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Legs in Fantastic 4 Blue */}
        <mesh position={[-0.14, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.42, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0.14, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.42, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[-0.14, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.38, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0.14, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.38, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>

        {/* White Utility Belt */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[0.42, 0.07, 0.28]} />
          <meshStandardMaterial color={FF_BELT} metalness={0.7} roughness={0.25} />
        </mesh>

        {/* Torso & White Shoulder Yoke */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.20, 0.16, 0.46, 16]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.38} metalness={0.25} />
        </mesh>
        <mesh position={[0, 1.40, 0.01]}>
          <cylinderGeometry args={[0.202, 0.19, 0.16, 16]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* "4" Emblem */}
        <mesh position={[0, 1.29, 0.135]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.02, 20]} />
          <meshStandardMaterial
            color={FF_WHITE}
            emissive={FF_WHITE}
            emissiveIntensity={sueHovered ? 1.8 : 0.6}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>

        {/* Left Raised Arm with Force Field Hand */}
        <group position={[-0.30, 1.05, 0.18]} rotation={[0.65, 0, -0.22]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.065, 0.36, 12]} />
            <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.09, 0.10, 0.08]} />
            <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.25} />
          </mesh>
          <pointLight color={FF_CYAN} intensity={sueHovered ? 3.0 : 1.2} distance={1.5} position={[0, -0.28, 0]} />
        </group>

        {/* Right Arm */}
        <group position={[0.30, 1.05, 0.10]} rotation={[0.15, 0, 0.12]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.065, 0.36, 12]} />
            <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.09, 0.10, 0.08]} />
            <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.25} />
          </mesh>
        </group>

        {/* White Ribbed Turtleneck Collar */}
        <mesh position={[0, 1.58, 0]}>
          <cylinderGeometry args={[0.115, 0.10, 0.08, 18]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Sue Storm Head & Flowing Blonde Hair (Vanessa Kirby) */}
        <mesh position={[0, 1.74, 0]} castShadow>
          <sphereGeometry args={[0.185, 22, 22]} />
          <meshStandardMaterial color="#DDBA98" roughness={0.6} metalness={0.0} />
        </mesh>
        <mesh position={[0, 1.86, 0]}>
          <sphereGeometry args={[0.182, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#DCE4F0" roughness={0.8} metalness={0.0} />
        </mesh>
        {/* Layered Hair Falling Over Shoulders */}
        <mesh position={[0, 1.66, -0.12]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.28, 0.38, 0.06]} />
          <meshStandardMaterial color="#CDB48B" roughness={0.85} metalness={0.0} />
        </mesh>
        <mesh position={[-0.14, 1.68, 0.04]} rotation={[0, 0.2, -0.1]}>
          <boxGeometry args={[0.07, 0.32, 0.05]} />
          <meshStandardMaterial color="#DCE4F0" roughness={0.8} />
        </mesh>
        <mesh position={[0.14, 1.68, 0.04]} rotation={[0, -0.2, 0.1]}>
          <boxGeometry args={[0.07, 0.32, 0.05]} />
          <meshStandardMaterial color="#DCE4F0" roughness={0.8} />
        </mesh>
        {/* Azure Blue Eyes */}
        <mesh position={[-0.065, 1.75, 0.155]}>
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.2} />
        </mesh>
        <mesh position={[0.065, 1.75, 0.155]}>
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshStandardMaterial color="#0284C7" roughness={0.2} metalness={0.2} />
        </mesh>
      </group>

      {/* ================================================================
          2. MR. FANTASTIC (Reed Richards / Pedro Pascal) — PROMINENT CENTER HERO
             Callback: onMainCharacterClick (opens intro video modal)
         ================================================================ */}
      <group
        ref={reedRef}
        rotation={[0, 0.04, 0]}
      >
        {/* Hitbox */}
        <mesh
          position={[0, 1.10, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setReedHovered(true);
              onHoverChar?.("reed");
            });
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setReedHovered(false);
              onHoverChar?.(null);
            });
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onMainCharacterClick) onMainCharacterClick();
          }}
        >
          <boxGeometry args={[1.05, 2.4, 1.05]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* HERO SPOTLIGHT DEDICATED TO MAIN CHARACTER */}
        <spotLight
          position={[0, 5.0, 2.4]}
          target-position={[0, 1.2, 0]}
          color="#E0F2FE"
          intensity={reedHovered ? 7.5 : 4.5}
          distance={10}
          angle={0.46}
          penumbra={0.6}
        />
        <pointLight
          position={[0, 1.4, 0.8]}
          color={FF_CYAN}
          intensity={reedHovered ? 3.0 : 1.6}
          distance={3.5}
        />

        {/* Floor Dais with Glowing "4" Emblem */}
        <group position={[0, 0.02, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[0.58, 0.66, 0.06, 32]} />
            <meshStandardMaterial color={FF_NAVY} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.48, 0.56, 36]} />
            <meshBasicMaterial color={reedHovered ? FF_WHITE : FF_BLUE} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.26, 0.32, 28]} />
            <meshBasicMaterial color={FF_CYAN} side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.18, 24]} />
            <meshBasicMaterial color={reedHovered ? FF_WHITE : FF_BLUE} />
          </mesh>
        </group>

        {/* Retro White Boots with Blue Accent Sole */}
        <mesh position={[-0.17, 0.08, 0.04]} castShadow>
          <boxGeometry args={[0.13, 0.14, 0.28]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[0.17, 0.08, 0.04]} castShadow>
          <boxGeometry args={[0.13, 0.14, 0.28]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.4} roughness={0.3} />
        </mesh>

        {/* Lower Legs in Vibrant Cobalt Fantastic Blue */}
        <mesh position={[-0.17, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.44, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.38} metalness={0.25} />
        </mesh>
        <mesh position={[0.17, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.08, 0.44, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* White Knee Insets (Movie Costume Detail) */}
        <mesh position={[-0.17, 0.58, 0.09]}>
          <boxGeometry args={[0.12, 0.09, 0.05]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.17, 0.58, 0.09]}>
          <boxGeometry args={[0.12, 0.09, 0.05]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Thighs */}
        <mesh position={[-0.17, 0.83, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.09, 0.42, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.38} metalness={0.25} />
        </mesh>
        <mesh position={[0.17, 0.83, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.09, 0.42, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* White Retro Utility Belt with Chrome Buckle */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.48, 0.09, 0.30]} />
          <meshStandardMaterial color={FF_BELT} metalness={0.65} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.05, 0.16]}>
          <boxGeometry args={[0.11, 0.07, 0.03]} />
          <meshStandardMaterial color={FF_BUCKLE} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Hero Torso — Fantastic Four Suit */}
        <mesh position={[0, 1.30, 0]} castShadow>
          <boxGeometry args={[0.54, 0.44, 0.32]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.35} metalness={0.28} />
        </mesh>

        {/* White Chest Yoke (Movie Suit Design) */}
        <mesh position={[0, 1.44, 0.02]}>
          <boxGeometry args={[0.52, 0.16, 0.31]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Double-Ring "4" Emblem on Chest */}
        <group position={[0, 1.32, 0.175]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.088, 0.088, 0.02, 28]} />
            <meshStandardMaterial
              color={FF_WHITE}
              emissive={FF_WHITE}
              emissiveIntensity={reedHovered ? 1.6 : 0.6}
              metalness={0.5}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <ringGeometry args={[0.065, 0.08, 28]} />
            <meshBasicMaterial color={FF_BLUE_DARK} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.014]}>
            <circleGeometry args={[0.055, 24]} />
            <meshBasicMaterial color={FF_WHITE} />
          </mesh>
          {/* Stylized Number 4 */}
          <mesh position={[-0.01, 0.005, 0.016]}>
            <boxGeometry args={[0.015, 0.065, 0.005]} />
            <meshBasicMaterial color={FF_BLUE} />
          </mesh>
          <mesh position={[0.012, -0.01, 0.016]}>
            <boxGeometry args={[0.055, 0.015, 0.005]} />
            <meshBasicMaterial color={FF_BLUE} />
          </mesh>
          <mesh position={[0.022, 0.005, 0.016]}>
            <boxGeometry args={[0.015, 0.065, 0.005]} />
            <meshBasicMaterial color={FF_BLUE} />
          </mesh>
        </group>

        {/* White Shoulder Rims */}
        <mesh position={[-0.34, 1.46, 0]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0.34, 1.46, 0]}>
          <sphereGeometry args={[0.13, 14, 14]} />
          <meshStandardMaterial color={FF_WHITE} metalness={0.4} roughness={0.35} />
        </mesh>

        {/* MR. FANTASTIC ELASTIC STRETCHING ARM (reaching forward) */}
        <group position={[-0.36, 1.25, 0.12]}>
          <group ref={reedStretchArmRef}>
            <mesh position={[0, -0.22, 0.08]} castShadow>
              <cylinderGeometry args={[0.07, 0.08, 0.46, 14]} />
              <meshStandardMaterial color={FF_BLUE} roughness={0.35} metalness={0.25} />
            </mesh>
            <mesh position={[0, -0.44, 0.16]}>
              <cylinderGeometry args={[0.06, 0.07, 0.40, 12]} />
              <meshStandardMaterial color={FF_BLUE} roughness={0.35} metalness={0.25} />
            </mesh>
            {/* White Astronaut Glove */}
            <mesh position={[0, -0.66, 0.24]}>
              <boxGeometry args={[0.11, 0.12, 0.10]} />
              <meshStandardMaterial color={FF_WHITE} roughness={0.35} metalness={0.3} />
            </mesh>
            {/* Extended Fingers */}
            <mesh position={[-0.03, -0.74, 0.27]}>
              <boxGeometry args={[0.025, 0.07, 0.025]} />
              <meshStandardMaterial color={FF_WHITE} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.76, 0.28]}>
              <boxGeometry args={[0.025, 0.09, 0.025]} />
              <meshStandardMaterial color={FF_WHITE} roughness={0.4} />
            </mesh>
            <mesh position={[0.03, -0.74, 0.27]}>
              <boxGeometry args={[0.025, 0.07, 0.025]} />
              <meshStandardMaterial color={FF_WHITE} roughness={0.4} />
            </mesh>
            {/* Quantum Energy Ring */}
            <mesh ref={reedQuantumRingRef} position={[0, -0.70, 0.26]}>
              <torusGeometry args={[0.14, 0.015, 12, 28]} />
              <meshBasicMaterial color={FF_CYAN} transparent opacity={0.75} />
            </mesh>
          </group>
        </group>

        {/* Right Arm & White Glove */}
        <group position={[0.36, 1.25, 0.06]} rotation={[0.15, 0, 0.10]}>
          <mesh position={[0, -0.20, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.42, 14]} />
            <meshStandardMaterial color={FF_BLUE} roughness={0.35} metalness={0.25} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <boxGeometry args={[0.11, 0.12, 0.10]} />
            <meshStandardMaterial color={FF_WHITE} roughness={0.35} metalness={0.3} />
          </mesh>
        </group>

        {/* White Ribbed Turtleneck Collar (Pedro Pascal Costume) */}
        <mesh position={[0, 1.58, 0]}>
          <cylinderGeometry args={[0.135, 0.13, 0.10, 20]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.63, 0]}>
          <torusGeometry args={[0.135, 0.02, 12, 24]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.3} metalness={0.25} />
        </mesh>

        {/* Pedro Pascal Head & Likeness */}
        <mesh position={[0, 1.77, 0]} castShadow>
          <sphereGeometry args={[0.20, 24, 24]} />
          <meshStandardMaterial color="#C89B72" roughness={0.65} metalness={0.0} />
        </mesh>
        {/* Hair — Side-Parted Dark Brown */}
        <mesh position={[0, 1.89, 0]}>
          <sphereGeometry args={[0.195, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.54]} />
          <meshStandardMaterial color="#382417" roughness={0.8} metalness={0.0} />
        </mesh>
        {/* Iconic Silver/Grey Temple Streaks */}
        <mesh position={[-0.17, 1.83, 0.04]} rotation={[0, 0.35, 0.2]}>
          <boxGeometry args={[0.04, 0.13, 0.04]} />
          <meshStandardMaterial color="#D4D8DD" roughness={0.7} />
        </mesh>
        <mesh position={[0.17, 1.83, 0.04]} rotation={[0, -0.35, -0.2]}>
          <boxGeometry args={[0.04, 0.13, 0.04]} />
          <meshStandardMaterial color="#D4D8DD" roughness={0.7} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 1.78, 0.175]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color="#1E40AF" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[0.07, 1.78, 0.175]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color="#1E40AF" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* Pedro Pascal Signature Moustache */}
        <mesh position={[0, 1.72, 0.19]}>
          <boxGeometry args={[0.095, 0.028, 0.025]} />
          <meshStandardMaterial color="#2B1B12" roughness={0.9} />
        </mesh>
      </group>

      {/* ================================================================
          3. HUMAN TORCH (Johnny Storm / Joseph Quinn) — Center-Right
             Callback: onPlanetsClick (navigates to Showcase Gallery)
         ================================================================ */}
      <group
        ref={johnnyRef}
        rotation={[0, -0.12, 0]}
      >
        {/* Hitbox */}
        <mesh
          position={[0, 1.10, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setJohnnyHovered(true);
              onHoverChar?.("johnny");
            });
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setJohnnyHovered(false);
              onHoverChar?.(null);
            });
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onPlanetsClick) onPlanetsClick();
          }}
        >
          <boxGeometry args={[1.0, 2.45, 1.0]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <spotLight
          position={[0, 4.2, 1.6]}
          target-position={[0, 1.0, 0]}
          color={FLAME_YLW}
          intensity={johnnyHovered ? 7.0 : 4.0}
          distance={9.5}
          angle={0.48}
          penumbra={0.7}
        />
        <pointLight
          position={[0.3, 1.3, 0.5]}
          color={FLAME_ORG}
          intensity={johnnyHovered ? 4.5 : 2.5}
          distance={4.0}
        />

        {/* Floor Dais */}
        <group position={[0, 0.02, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[0.48, 0.54, 0.05, 28]} />
            <meshStandardMaterial color={FF_NAVY} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.40, 0.46, 32]} />
            <meshBasicMaterial color={johnnyHovered ? FLAME_YLW : FLAME_ORG} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Boots */}
        <mesh position={[-0.15, 0.08, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.13, 0.24]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0.15, 0.08, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.13, 0.24]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Blue Suit Legs */}
        <mesh position={[-0.15, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.42, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0.15, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.42, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[-0.15, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.38, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0.15, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.08, 0.38, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.25} />
        </mesh>

        {/* White Utility Belt */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[0.44, 0.08, 0.28]} />
          <meshStandardMaterial color={FF_BELT} metalness={0.65} roughness={0.25} />
        </mesh>

        {/* Torso & White Shoulder Yoke */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.17, 0.46, 14]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh position={[0, 1.40, 0.01]}>
          <cylinderGeometry args={[0.212, 0.20, 0.16, 14]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* "4" Emblem */}
        <mesh position={[0, 1.29, 0.145]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.022, 20]} />
          <meshStandardMaterial color={FLAME_YLW} emissive={FLAME_YLW} emissiveIntensity={3.2} />
        </mesh>

        {/* Left Arm in Blue Suit */}
        <group position={[-0.32, 1.10, 0.08]} rotation={[0.15, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.075, 0.38, 12]} />
            <meshStandardMaterial color={FF_BLUE} roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <boxGeometry args={[0.09, 0.10, 0.08]} />
            <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.25} />
          </mesh>
        </group>

        {/* Right Arm: Raised Hand with Blazing Flame (Movie Poster Pose!) */}
        <group position={[0.34, 1.22, 0.22]} rotation={[-0.60, 0, 0.25]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.08, 0.40, 12]} />
            <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.25} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <boxGeometry args={[0.095, 0.10, 0.085]} />
            <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.25} />
          </mesh>
          {/* Licking Dancing Flame in Hand */}
          <group ref={johnnyHandFlameRef} position={[0, -0.32, 0]}>
            <mesh>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial color={FLAME_WHITE} emissive={FLAME_WHITE} emissiveIntensity={5.0} />
            </mesh>
            <mesh position={[0, -0.06, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.065, 0.16, 10]} />
              <meshStandardMaterial color={FLAME_YLW} emissive={FLAME_YLW} emissiveIntensity={4.2} />
            </mesh>
            <mesh position={[0.02, -0.10, 0]} rotation={[Math.PI, 0, 0.2]}>
              <coneGeometry args={[0.045, 0.18, 8]} />
              <meshStandardMaterial color={FLAME_ORG} emissive={FLAME_ORG} emissiveIntensity={3.5} />
            </mesh>
          </group>
          <pointLight color={FLAME_YLW} intensity={3.5} distance={2.0} position={[0, -0.30, 0]} />
        </group>

        {/* Animated Flame Tongues on Shoulder/Aura */}
        <group position={[0.22, 1.62, 0]}>
          <mesh ref={johnnyFlame1Ref} position={[0, 0.18, 0]}>
            <coneGeometry args={[0.07, 0.44, 8]} />
            <meshStandardMaterial color={FLAME_YLW} emissive={FLAME_YLW} emissiveIntensity={3.8} transparent opacity={0.90} />
          </mesh>
          <mesh ref={johnnyFlame2Ref} position={[-0.07, 0.12, 0.03]} rotation={[0, 0, -0.22]}>
            <coneGeometry args={[0.055, 0.34, 7]} />
            <meshStandardMaterial color={FLAME_ORG} emissive={FLAME_ORG} emissiveIntensity={3.2} transparent opacity={0.82} />
          </mesh>
          <mesh ref={johnnyFlame3Ref} position={[0.07, 0.10, -0.02]} rotation={[0, 0, 0.20]}>
            <coneGeometry args={[0.05, 0.30, 7]} />
            <meshStandardMaterial color={FLAME_RED} emissive={FLAME_RED} emissiveIntensity={2.8} transparent opacity={0.78} />
          </mesh>
        </group>

        {/* Floating Embers */}
        <mesh ref={johnnyEmber1Ref} position={[0.34, 1.4, 0.24]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={FLAME_YLW} emissive={FLAME_YLW} emissiveIntensity={4.2} />
        </mesh>
        <mesh ref={johnnyEmber2Ref} position={[0.32, 1.2, 0.22]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color={FLAME_ORG} emissive={FLAME_ORG} emissiveIntensity={3.6} />
        </mesh>

        {/* Turtleneck Collar */}
        <mesh position={[0, 1.58, 0]}>
          <cylinderGeometry args={[0.12, 0.11, 0.08, 16]} />
          <meshStandardMaterial color={FF_WHITE} roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Head & Cropped Blonde Hair (Joseph Quinn) */}
        <mesh position={[0, 1.74, 0]} castShadow>
          <sphereGeometry args={[0.185, 22, 22]} />
          <meshStandardMaterial color="#D4A882" roughness={0.65} metalness={0.0} />
        </mesh>
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.182, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.75} metalness={0.1} />
        </mesh>
        {/* Soft Flame Halo Behind Head */}
        <mesh position={[0.06, 1.76, -0.06]}>
          <ringGeometry args={[0.18, 0.28, 20]} />
          <meshBasicMaterial color={FLAME_YLW} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.065, 1.75, 0.155]}>
          <sphereGeometry args={[0.024, 10, 10]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.2} metalness={0.2} />
        </mesh>
        <mesh position={[0.065, 1.75, 0.155]}>
          <sphereGeometry args={[0.024, 10, 10]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.2} metalness={0.2} />
        </mesh>
      </group>

      {/* ================================================================
          4. THE THING (Ben Grimm / Ebon Moss-Bachrach)
             LAST CHARACTER: Positioned toward the side, angled inward!
             Callback: onThirdCharacterClick (navigates to Contact Us)
         ================================================================ */}
      <group
        ref={benRef}
        rotation={[0, -0.24, 0]}
      >
        {/* Hitbox */}
        <mesh
          position={[0, 1.15, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setBenHovered(true);
              onHoverChar?.("ben");
            });
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            startTransition(() => {
              setBenHovered(false);
              onHoverChar?.(null);
            });
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onThirdCharacterClick) onThirdCharacterClick();
          }}
        >
          <boxGeometry args={[1.2, 2.5, 1.2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        <spotLight
          position={[0.5, 4.8, 2.0]}
          target-position={[0, 1.0, 0]}
          color="#FDE68A"
          intensity={benHovered ? 6.5 : 3.8}
          distance={9.5}
          angle={0.44}
          penumbra={0.55}
        />
        <pointLight
          position={[-0.4, 0.8, 0.6]}
          color={ROCK_BASE}
          intensity={benHovered ? 3.2 : 1.8}
          distance={3.8}
        />

        {/* Floor Dais */}
        <group position={[0, 0.02, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[0.58, 0.66, 0.06, 28]} />
            <meshStandardMaterial color={FF_NAVY} metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.50, 0.58, 32]} />
            <meshBasicMaterial color={benHovered ? FF_WHITE : ROCK_BASE} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Massive Craggy Rock Feet */}
        <mesh position={[-0.24, 0.09, 0.06]} castShadow>
          <boxGeometry args={[0.24, 0.16, 0.36]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>
        <mesh position={[0.24, 0.09, 0.06]} castShadow>
          <boxGeometry args={[0.24, 0.16, 0.36]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>

        {/* Rocky Shins & Cracks */}
        <mesh position={[-0.24, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.14, 0.54, 12]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>
        <mesh position={[0.24, 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.14, 0.54, 12]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>
        {/* Shading fissure detail */}
        <mesh position={[-0.24, 0.42, 0.14]}>
          <boxGeometry args={[0.04, 0.30, 0.02]} />
          <meshStandardMaterial color={ROCK_CRACK} roughness={1.0} />
        </mesh>
        <mesh position={[0.24, 0.42, 0.14]}>
          <boxGeometry args={[0.04, 0.30, 0.02]} />
          <meshStandardMaterial color={ROCK_CRACK} roughness={1.0} />
        </mesh>

        {/* Rocky Thighs */}
        <mesh position={[-0.24, 0.94, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.15, 0.48, 12]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>
        <mesh position={[0.24, 0.94, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.15, 0.48, 12]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>

        {/* AUTHENTIC MOVIE POSTER OUTFIT: Blue & White Fantastic 4 Sweater on Ben! */}
        <mesh position={[0, 1.46, 0]} castShadow>
          <boxGeometry args={[0.82, 0.58, 0.50]} />
          <meshStandardMaterial color={FF_BLUE} roughness={0.65} metalness={0.15} />
        </mesh>
        {/* Broad White Collar & Upper Yoke */}
        <mesh position={[0, 1.70, 0]}>
          <boxGeometry args={[0.80, 0.14, 0.49]} />
          <meshStandardMaterial color={FF_CREAM_WHITE} roughness={0.5} metalness={0.2} />
        </mesh>
        {/* GIANT "4" EMBLEM ON BEN'S CHEST */}
        <group position={[0, 1.50, 0.26]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.095, 0.095, 0.025, 24]} />
            <meshStandardMaterial
              color={FF_WHITE}
              emissive={FF_WHITE}
              emissiveIntensity={benHovered ? 1.6 : 0.6}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <ringGeometry args={[0.07, 0.088, 24]} />
            <meshBasicMaterial color={FF_BLUE_DARK} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Massive Rock Boulder Shoulders */}
        <mesh position={[-0.56, 1.58, 0]}>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>
        <mesh position={[0.56, 1.58, 0]}>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>

        {/* Left Arm with Boulder Hand */}
        <group position={[-0.58, 1.22, 0.08]} rotation={[0.12, 0, -0.08]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.50, 10]} />
            <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <boxGeometry args={[0.24, 0.22, 0.22]} />
            <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
          </mesh>
        </group>

        {/* Raised Right Rocky Fist */}
        <group ref={benFistRef} position={[0.58, 1.45, 0.22]} rotation={[-0.60, 0, 0.30]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.52, 10]} />
            <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <boxGeometry args={[0.26, 0.24, 0.24]} />
            <meshStandardMaterial color={ROCK_DARK} roughness={0.96} metalness={0.0} />
          </mesh>
          {/* Rock knuckles */}
          <mesh position={[-0.07, -0.26, 0.12]}>
            <sphereGeometry args={[0.06, 9, 9]} />
            <meshStandardMaterial color={ROCK_BASE} roughness={0.96} />
          </mesh>
          <mesh position={[0.07, -0.26, 0.12]}>
            <sphereGeometry args={[0.06, 9, 9]} />
            <meshStandardMaterial color={ROCK_BASE} roughness={0.96} />
          </mesh>
        </group>

        {/* Ben Grimm Craggy Head & Heavy Brow (Ebon Moss-Bachrach) */}
        <mesh position={[0, 1.98, 0]} castShadow>
          <boxGeometry args={[0.52, 0.44, 0.46]} />
          <meshStandardMaterial color={ROCK_BASE} roughness={0.96} metalness={0.0} />
        </mesh>
        {/* Prominent Rock Brow Ridge */}
        <mesh position={[0, 2.05, 0.22]}>
          <boxGeometry args={[0.46, 0.11, 0.08]} />
          <meshStandardMaterial color={ROCK_HIGHLIGHT} roughness={0.98} metalness={0.0} />
        </mesh>
        {/* Expressive Deep Blue Eyes */}
        <mesh position={[-0.12, 1.99, 0.23]}>
          <sphereGeometry args={[0.044, 12, 12]} />
          <meshStandardMaterial
            color="#2563EB"
            emissive="#1D4ED8"
            emissiveIntensity={benHovered ? 2.2 : 1.0}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[0.12, 1.99, 0.23]}>
          <sphereGeometry args={[0.044, 12, 12]} />
          <meshStandardMaterial
            color="#2563EB"
            emissive="#1D4ED8"
            emissiveIntensity={benHovered ? 2.2 : 1.0}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
        {/* Rocky Mouth Fissure */}
        <mesh position={[0, 1.88, 0.24]}>
          <boxGeometry args={[0.22, 0.04, 0.04]} />
          <meshStandardMaterial color={ROCK_CRACK} roughness={1.0} metalness={0.0} />
        </mesh>
      </group>
    </group>
  );
}

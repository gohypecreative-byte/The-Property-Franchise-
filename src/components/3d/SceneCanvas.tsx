// src/components/3d/SceneCanvas.tsx
"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Spaceship } from "./Spaceship";
import { ControlBridge } from "./ControlBridge";
import { AlienCharacters } from "./AlienCharacters";

export type CharacterKey = "sue" | "reed" | "johnny" | "ben";

interface SceneCanvasProps {
  scrollProgress: number; // 0 to 1
  onMainCharacterClick?: () => void;
  onReelsClick?: () => void;
  onPlanetsClick?: () => void;
  onThirdCharacterClick?: () => void;
  isDimmed?: boolean;
  /** Looping hero footage shown through the bridge canopy behind the 3D scene */
  videoSrc?: string;
}

// Camera controller choreographing the flight from deep space into the control bridge
function CameraRig({ progress }: { progress: number }) {
  const targetLook = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame((state) => {
    let camY: number;
    let camZ: number;
    let lookY: number;
    let lookZ: number;

    const aspect = state.viewport.aspect;

    // Responsive distance and height adjustments
    // On narrow viewports (portrait mobile / tablet), gently pull camera back
    // so all 5 characters are framed safely within screen boundaries with zero clipping
    const distanceBoost = aspect < 1.35 ? (1.35 - aspect) * 2.8 : 0;
    const yBoost = aspect < 1.35 ? (1.35 - aspect) * 0.32 : 0;

    if (progress < 0.35) {
      // Stage 1: Deep space cruise (progress 0 to 0.35)
      const t = progress / 0.35;
      camY = THREE.MathUtils.lerp(3.8, 2.6, t);
      camZ = THREE.MathUtils.lerp(13.5, 8.5, t);
      lookY = THREE.MathUtils.lerp(1.5, 1.2, t);
      lookZ = THREE.MathUtils.lerp(-3.0, 0, t);
    } else if (progress < 0.65) {
      // Stage 2: Approaching and entering cockpit canopy (progress 0.35 to 0.65)
      const t = (progress - 0.35) / 0.3;
      camY = THREE.MathUtils.lerp(2.6, 1.45 + yBoost, t);
      camZ = THREE.MathUtils.lerp(8.5, 4.8 + distanceBoost, t);
      lookY = THREE.MathUtils.lerp(1.2, 0.85, t);
      lookZ = 0;
    } else {
      // Stage 3: Inside Control Bridge command deck (progress 0.65 to 1.0)
      const t = (progress - 0.65) / 0.35;
      camY = THREE.MathUtils.lerp(1.45 + yBoost, 1.00 + yBoost, t);
      camZ = 4.85 + distanceBoost;
      lookY = THREE.MathUtils.lerp(0.85, 0.72, t);
      lookZ = 0.45;
    }

    // Subtle parallax response to pointer, dampened on narrow mobile viewports
    // to prevent edge characters from being pushed outside the screen frame
    const maxParallax = Math.min(0.18, 0.25 * aspect);
    const mouseX = state.pointer.x * maxParallax;
    const mouseY = state.pointer.y * (maxParallax * 0.45);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouseX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, camY + mouseY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, camZ, 0.05);

    targetLook.current.x = THREE.MathUtils.lerp(targetLook.current.x, mouseX * 0.15, 0.05);
    targetLook.current.y = THREE.MathUtils.lerp(targetLook.current.y, lookY, 0.05);
    targetLook.current.z = THREE.MathUtils.lerp(targetLook.current.z, lookZ, 0.05);

    state.camera.lookAt(targetLook.current);
  });

  return null;
}

export function SceneCanvas({
  scrollProgress,
  onMainCharacterClick,
  onReelsClick,
  onPlanetsClick,
  onThirdCharacterClick,
  isDimmed = false,
  videoSrc = "/gemini_generated_video_56bc20e8_gwr_video_mvp.mp4",
}: SceneCanvasProps) {
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  // Keep the hero footage in sync with the scene: pause while a section is open
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    if (isDimmed) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isDimmed]);

  const [hoveredChar, setHoveredChar] = useState<CharacterKey | null>(null);
  const sueBadgeRef = useRef<HTMLDivElement>(null);
  const reedBadgeRef = useRef<HTMLDivElement>(null);
  const johnnyBadgeRef = useRef<HTMLDivElement>(null);
  const benBadgeRef = useRef<HTMLDivElement>(null);

  const badgeRefs = useRef({
    sue: sueBadgeRef,
    reed: reedBadgeRef,
    johnny: johnnyBadgeRef,
    ben: benBadgeRef,
  });

  return (
    <div
      className={`fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#0A1628] transition-all duration-700 ease-out ${isDimmed ? "scale-[0.98] blur-[8px] opacity-35 brightness-75 pointer-events-none" : "scale-100 blur-0 opacity-100"
        }`}
    >
      {/* Hero footage: the view through the bridge canopy */}
      <video
        ref={heroVideoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#081220]/30 via-transparent to-[#081220]/55" />

      <Canvas
        className="!absolute inset-0 z-10"
        shadows
        dpr={[1, 1.8]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 3.8, 13.5], fov: 46, near: 0.1, far: 450 }}
      >
        {/* Transparent background so the hero footage shows through */}
        <fog attach="fog" args={["#081220", 20, 110]} />

        {/* Ambient Lighting in Heritage Flag Navy */}
        <ambientLight intensity={0.75} color="#162744" />

        {/* Key Directional Rim Light in Cool Blue-White */}
        <directionalLight
          position={[12, 16, 9]}
          intensity={2.5}
          color="#C5E4F7"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Starboard Accent Light in FF Blue */}
        <directionalLight
          position={[-14, 8, -5]}
          intensity={1.6}
          color="#1E6BB8"
        />

        {/* Front Bridge Fill Light in FF White */}
        <directionalLight
          position={[0, 4, 8]}
          intensity={1.1}
          color="#EFF6FF"
        />

        <Suspense fallback={null}>
          <CameraRig progress={scrollProgress} />
          <Spaceship progress={scrollProgress} />
          <ControlBridge progress={scrollProgress} />
          <AlienCharacters
            progress={scrollProgress}
            onMainCharacterClick={onMainCharacterClick}
            onReelsClick={onReelsClick}
            onPlanetsClick={onPlanetsClick}
            onThirdCharacterClick={onThirdCharacterClick}
            badgeRefs={badgeRefs.current}
            onHoverChar={setHoveredChar}
          />
        </Suspense>
      </Canvas>

      {/* 2D Tooltip Badges Overlay (Outside 3D Canvas - React 19 Native, Zero Unmount Race Conditions) */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden select-none">
        {/* SUE STORM - REEL */}
        <div
          ref={sueBadgeRef}
          className="absolute will-change-transform"
          style={{
            opacity: hoveredChar === "sue" ? 1 : 0,
            transform: hoveredChar === "sue"
              ? "translate(-50%, calc(-100% - 6px)) scale(1)"
              : "translate(-50%, calc(-100% + 4px)) scale(0.92)",
            transition: "opacity 220ms ease-out, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F9FC] text-[#012169] border-2 border-[#E4002B] shadow-[0_4px_16px_rgba(228,0,43,0.3)] whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B] animate-pulse" />
            <span className="font-mono text-xs font-black tracking-widest uppercase text-[#012169]">
              REEL
            </span>
          </div>
        </div>

        {/* REED RICHARDS - INTRO */}
        <div
          ref={reedBadgeRef}
          className="absolute will-change-transform"
          style={{
            opacity: hoveredChar === "reed" ? 1 : 0,
            transform: hoveredChar === "reed"
              ? "translate(-50%, calc(-100% - 6px)) scale(1)"
              : "translate(-50%, calc(-100% + 4px)) scale(0.92)",
            transition: "opacity 220ms ease-out, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F9FC] text-[#012169] border border-[#E4002B] shadow-[0_4px_16px_rgba(1,33,105,0.25)] whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#012169]">
              Intro
            </span>
          </div>
        </div>

        {/* JOHNNY STORM - DETAILS */}
        <div
          ref={johnnyBadgeRef}
          className="absolute will-change-transform"
          style={{
            opacity: hoveredChar === "johnny" ? 1 : 0,
            transform: hoveredChar === "johnny"
              ? "translate(-50%, calc(-100% - 6px)) scale(1)"
              : "translate(-50%, calc(-100% + 4px)) scale(0.92)",
            transition: "opacity 220ms ease-out, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F9FC] text-[#012169] border border-[#E4002B] shadow-[0_4px_16px_rgba(1,33,105,0.25)] whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#012169]">
              Details
            </span>
          </div>
        </div>

        {/* BEN GRIMM - CONTACT */}
        <div
          ref={benBadgeRef}
          className="absolute will-change-transform"
          style={{
            opacity: hoveredChar === "ben" ? 1 : 0,
            transform: hoveredChar === "ben"
              ? "translate(-50%, calc(-100% - 6px)) scale(1)"
              : "translate(-50%, calc(-100% + 4px)) scale(0.92)",
            transition: "opacity 220ms ease-out, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F9FC] text-[#012169] border border-[#E4002B] shadow-[0_4px_16px_rgba(1,33,105,0.25)] whitespace-nowrap">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#012169]">
              Contact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

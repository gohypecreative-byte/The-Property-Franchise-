// src/components/hero/FlightCanvas.tsx
"use client";

import React, { type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { HeroFlightScene } from "./three";

interface FlightCanvasProps {
  progress: RefObject<number>;
  mobile: boolean;
  /** Stop rendering while a section is open over the hero */
  paused?: boolean;
}

export function FlightCanvas({ progress, mobile, paused = false }: FlightCanvasProps) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, mobile ? 1.25 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 500 }}
    >
      <HeroFlightScene progress={progress} mobile={mobile} />
    </Canvas>
  );
}

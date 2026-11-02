// src/components/ui/HeroVideoScene.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { scifiAudio } from "@/lib/audio";

interface HeroVideoSceneProps {
  onMainCharacterClick?: () => void; // Captain -> Introduction
  onReelsClick?: () => void; // Archivist -> Memory Archive (reels)
  onPlanetsClick?: () => void; // Navigator -> Explore Planets (details)
  onThirdCharacterClick?: () => void; // Communication Officer -> Contact
  isDimmed?: boolean;
  videoSrc?: string;
}

// The footage flies into the bridge, then the crew labels appear. After the
// first play it loops only the bridge segment so the crew stays clickable.
const CREW_READY_AT = 5.0; // seconds: labels are on screen from here
const LOOP_FROM = 5.6; // seconds: start of the steady bridge segment

interface CrewHotspot {
  key: string;
  role: string;
  action: string;
  // Region in % of the 16:9 frame (crew member + their on-screen label)
  left: number;
  top: number;
  width: number;
  height: number;
}

const CREW: CrewHotspot[] = [
  { key: "captain", role: "Captain", action: "Introduction", left: 5, top: 30, width: 23, height: 59 },
  { key: "archivist", role: "Archivist", action: "Memory Archive", left: 29.5, top: 34, width: 18.5, height: 52 },
  { key: "navigator", role: "Navigator", action: "Explore Planets", left: 52, top: 33, width: 18.5, height: 53 },
  { key: "comms", role: "Communication Officer", action: "Contact & Enquiries", left: 73.5, top: 34, width: 22.5, height: 55 },
];

export function HeroVideoScene({
  onMainCharacterClick,
  onReelsClick,
  onPlanetsClick,
  onThirdCharacterClick,
  isDimmed = false,
  videoSrc = "/gemini_generated_video_56bc20e8_gwr_video_mvp.mp4",
}: HeroVideoSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [crewReady, setCrewReady] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const handlers: Record<string, (() => void) | undefined> = {
    captain: onMainCharacterClick,
    archivist: onReelsClick,
    navigator: onPlanetsClick,
    comms: onThirdCharacterClick,
  };

  // Pause while a section is open, resume when back on the bridge
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isDimmed) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isDimmed]);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (!crewReady && v.currentTime >= CREW_READY_AT) setCrewReady(true);
    // Hold on the bridge: loop just before the end back to the steady segment
    if (v.duration && v.currentTime >= v.duration - 0.25) {
      v.currentTime = LOOP_FROM;
      v.play().catch(() => {});
    }
  };

  const skipToBridge = () => {
    const v = videoRef.current;
    if (!v) return;
    scifiAudio.playHoloBeep(900, 0.06);
    v.currentTime = LOOP_FROM;
    setCrewReady(true);
  };

  return (
    <div
      className={`fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#081220] transition-all duration-700 ease-out ${
        isDimmed
          ? "scale-[0.98] blur-[8px] opacity-35 brightness-75 pointer-events-none"
          : "scale-100 blur-0 opacity-100"
      }`}
    >
      {/* 16:9 frame scaled to cover the screen; hotspots share its coordinates */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "max(100vw, 177.78vh)", height: "max(100vh, 56.25vw)" }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={(e) => {
            e.currentTarget.currentTime = LOOP_FROM;
            e.currentTarget.play().catch(() => {});
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Crew hotspots */}
        {CREW.map((crew) => {
          const isHovered = hovered === crew.key;
          return (
            <button
              key={crew.key}
              onClick={() => handlers[crew.key]?.()}
              onMouseEnter={() => {
                setHovered(crew.key);
                scifiAudio.playHoloBeep(1100, 0.03);
              }}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(crew.key)}
              onBlur={() => setHovered(null)}
              disabled={!crewReady}
              aria-label={`${crew.role}: ${crew.action}`}
              className="group absolute rounded-[18px] outline-none transition-opacity duration-700 cursor-pointer disabled:cursor-default"
              style={{
                left: `${crew.left}%`,
                top: `${crew.top}%`,
                width: `${crew.width}%`,
                height: `${crew.height}%`,
                opacity: crewReady ? 1 : 0,
              }}
            >
              {/* Glow frame */}
              <span
                className={`pointer-events-none absolute inset-0 rounded-[18px] border transition-all duration-300 ${
                  isHovered
                    ? "border-[#FFC872]/80 bg-[#FFC872]/[0.07] shadow-[0_0_40px_rgba(255,190,90,0.35),inset_0_0_40px_rgba(255,190,90,0.12)]"
                    : "border-transparent"
                }`}
              />
              {/* Hint */}
              <span
                className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-full bg-[#F7F9FC] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#012169] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 ${
                  isHovered ? "opacity-100 translate-y-[calc(-100%-14px)]" : "opacity-0"
                }`}
              >
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#E4002B] align-middle" />
                Open {crew.action}
              </span>
            </button>
          );
        })}
      </div>

      {/* Readability shade under the brand pill */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#081220]/60 to-transparent" />

      {/* Skip the fly-in */}
      {!crewReady && (
        <button
          onClick={skipToBridge}
          className="absolute bottom-6 right-6 z-10 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md hover:bg-white hover:text-[#012169] transition-colors cursor-pointer"
        >
          Skip to Bridge
        </button>
      )}
    </div>
  );
}

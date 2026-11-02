// src/components/ui/HeroFrameScene.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { scifiAudio } from "@/lib/audio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroFrameSceneProps {
  onMainCharacterClick?: () => void; // Captain -> Introduction
  onReelsClick?: () => void; // Archivist -> Memory Archive (reels)
  onPlanetsClick?: () => void; // Navigator -> Explore Planets (details)
  onThirdCharacterClick?: () => void; // Communication Officer -> Contact
  isDimmed?: boolean;
}

// Image sequence exported from the hero film (1280x720, 16:9)
const FRAME_COUNT = 240;
const FRAME_W = 1280;
const FRAME_H = 720;
const frameSrc = (i: number) => `/hero%20frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

// The crew becomes clickable once the sequence reaches the bridge
const CREW_READY_AT = 0.9;

interface CrewHotspot {
  key: string;
  role: string;
  action: string;
  // Region in % of the 16:9 frame (crew member + their on-screen label), from the last frame
  left: number;
  top: number;
  width: number;
  height: number;
}

const CREW: CrewHotspot[] = [
  { key: "captain", role: "Captain", action: "Introduction", left: 5, top: 31, width: 23, height: 58 },
  { key: "archivist", role: "Archivist", action: "Memory Archive", left: 30, top: 34, width: 18, height: 51 },
  { key: "navigator", role: "Navigator", action: "Explore Planets", left: 52.5, top: 34, width: 18, height: 51 },
  { key: "comms", role: "Communication Officer", action: "Contact & Enquiries", left: 75, top: 34, width: 20, height: 55 },
];

export function HeroFrameScene({
  onMainCharacterClick,
  onReelsClick,
  onPlanetsClick,
  onThirdCharacterClick,
  isDimmed = false,
}: HeroFrameSceneProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ index: 0 });
  const readyRef = useRef(false);

  const [crewReady, setCrewReady] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [firstLoaded, setFirstLoaded] = useState(false);

  const handlers: Record<string, (() => void) | undefined> = {
    captain: onMainCharacterClick,
    archivist: onReelsClick,
    navigator: onPlanetsClick,
    comms: onThirdCharacterClick,
  };

  // --------------------------------------------------------------------------
  // CANVAS DRAWING: cover-fit the current frame; fall back to the nearest
  // earlier frame that has finished loading
  // --------------------------------------------------------------------------
  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let i = Math.round(index);
    let img = imagesRef.current[i];
    while (i > 0 && !(img && img.complete && img.naturalWidth)) {
      i -= 1;
      img = imagesRef.current[i];
    }
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
    const w = FRAME_W * scale;
    const h = FRAME_H * scale;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  };

  // Size the canvas to the screen at device pixel ratio
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      draw(frameRef.current.index);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Preload the sequence: first frame first, then the rest in order
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        // Decode up front so drawing the frame later never stalls a scroll
        img
          .decode()
          .catch(() => {})
          .finally(() => {
            if (i === 0) setFirstLoaded(true);
            if (Math.round(frameRef.current.index) === i || i === 0) draw(frameRef.current.index);
          });
      };
      img.src = frameSrc(i);
      images.push(img);
    }
    imagesRef.current = images;
    return () => {
      images.forEach((img) => (img.onload = null));
    };
  }, []);

  // --------------------------------------------------------------------------
  // SMOOTH SCRUB
  // Lenis smooths the wheel inside the hero; ScrollTrigger reports progress;
  // the frame index eases toward it every animation frame and only redraws
  // when the visible frame changes. GSAP also drives the parallax zoom.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const lenis = new Lenis({
      wrapper: scroller,
      content: track,
      lerp: 0.075,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const target = { index: 0 };
    let lastDrawn = -1;
    let rafId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      const cur = frameRef.current;
      const diff = target.index - cur.index;
      cur.index += Math.abs(diff) < 0.01 ? diff : diff * 0.14;
      const rounded = Math.round(cur.index);
      if (rounded !== lastDrawn) {
        lastDrawn = rounded;
        draw(rounded);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            target.index = self.progress * (FRAME_COUNT - 1);
            const ready = self.progress >= CREW_READY_AT;
            if (ready !== readyRef.current) {
              readyRef.current = ready;
              if (ready) scifiAudio.playHoloBeep(920, 0.06);
              setCrewReady(ready);
            }
          },
        },
      });

      tl.fromTo(sceneRef.current, { scale: 1.08 }, { scale: 1, duration: 1 }, 0).to(
        hintRef.current,
        { opacity: 0, y: -40, duration: 0.06 },
        0
      );
    }, scroller);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#081220] transition-all duration-700 ease-out ${
        isDimmed
          ? "scale-[0.98] blur-[8px] opacity-35 brightness-75 pointer-events-none"
          : "scale-100 blur-0 opacity-100"
      }`}
    >
      <div
        ref={scrollerRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar"
      >
        <div ref={trackRef} className="relative h-[600vh]">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {/* Frame sequence + crew hotspots share one scaled layer */}
            <div ref={sceneRef} className="absolute inset-0 will-change-transform">
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
                  firstLoaded ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* 16:9 frame box scaled to cover the screen, matching the canvas cover-fit */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: "max(100vw, 177.78vh)", height: "max(100vh, 56.25vw)" }}
              >
                {CREW.map((crew) => {
                  const isHovered = hovered === crew.key;
                  return (
                    <button
                      key={crew.key}
                      onClick={() => {
                        scifiAudio.playHoloBeep(980, 0.1);
                        handlers[crew.key]?.();
                      }}
                      onMouseEnter={() => {
                        setHovered(crew.key);
                        scifiAudio.playHoloBeep(1100, 0.03);
                      }}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(crew.key)}
                      onBlur={() => setHovered(null)}
                      disabled={!crewReady}
                      tabIndex={crewReady ? 0 : -1}
                      aria-label={`${crew.role}: ${crew.action}`}
                      className="group absolute rounded-[18px] outline-none transition-opacity duration-500 cursor-pointer disabled:pointer-events-none"
                      style={{
                        left: `${crew.left}%`,
                        top: `${crew.top}%`,
                        width: `${crew.width}%`,
                        height: `${crew.height}%`,
                        opacity: crewReady ? 1 : 0,
                      }}
                    >
                      <span
                        className={`pointer-events-none absolute inset-0 rounded-[18px] border transition-all duration-300 ${
                          isHovered
                            ? "border-[#FFC872]/80 bg-[#FFC872]/[0.07] shadow-[0_0_40px_rgba(255,190,90,0.35),inset_0_0_40px_rgba(255,190,90,0.12)]"
                            : "border-transparent"
                        }`}
                      />
                      <span
                        className={`pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F7F9FC] px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#012169] shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 ${
                          isHovered ? "-translate-y-[calc(100%+14px)] opacity-100" : "-translate-y-[calc(100%+6px)] opacity-0"
                        }`}
                      >
                        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#E4002B] align-middle" />
                        Open {crew.action}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Readability shade under the brand pill */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#081220]/60 to-transparent" />

            {/* Shiny scroll cue at the start */}
            <div
              ref={hintRef}
              className="pointer-events-none absolute inset-x-0 bottom-10 sm:bottom-14 z-10 flex flex-col items-center gap-3"
            >
              <span className="shiny-text-light text-base sm:text-xl font-semibold uppercase tracking-[0.32em]">
                Scroll to Play
              </span>
              <span className="relative block h-10 w-px overflow-hidden bg-white/25">
                <span className="scroll-hint-line absolute inset-x-0 top-0 h-1/2 bg-[#E4002B]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

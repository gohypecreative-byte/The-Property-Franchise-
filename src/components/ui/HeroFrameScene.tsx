// src/components/ui/HeroFrameScene.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { scifiAudio } from "@/lib/audio";
import { Play, Film, Building2, Mail } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroFrameSceneProps {
  onMainCharacterClick?: () => void; // Captain -> Introduction Video
  onReelsClick?: () => void; // Archivist -> Memory Archive (reels)
  onPlanetsClick?: () => void; // Navigator -> Explore Planets & Showcase
  onThirdCharacterClick?: () => void; // Communication Officer -> Contact & Consultations
  onBridgeReady?: (ready: boolean) => void; // Bridge reached on scroll (for mobile command dock)
  isDimmed?: boolean;
}

// --------------------------------------------------------------------------
// Image sequence configuration: 1280x720 clean frames from hero_frames
// --------------------------------------------------------------------------
const FRAME_COUNT = 240;
const FRAME_W = 1280;
const FRAME_H = 720;
const frameSrc = (i: number) => `/hero_frames/frame_${String(i + 1).padStart(4, "0")}-clean.png`;

// Frame 0..143: Spaceship approach and cockpit fly-in (scroll-scrubbed)
// Frame 144..239: Bridge cabin scene (autoplay plays only once from Screenshot 1 to Screenshot 2 upon scroll completion)
const CABIN_START_FRAME = 144; // Exact starting frame matching Screenshot 1 (frame_0145)
const CABIN_END_FRAME = 239;   // Exact ending frame matching Screenshot 2 (frame_0240)
const PLAYBACK_FPS = 24;

interface CrewHotspot {
  key: string;
  role: string;
  stationName: string;
  action: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tagColor: string;
  badgeNumber: string;
  // Bounding hotspot on 16:9 canvas (%)
  left: number;
  top: number;
  width: number;
  height: number;
  // Button anchor on 16:9 canvas (%)
  buttonLeft: number;
  buttonTop: number;
}

const CREW: CrewHotspot[] = [
  {
    key: "archivist",
    role: "Archivist",
    stationName: "Memory Archive",
    action: "Commercial Reels",
    description: "Browse Archive",
    icon: Film,
    tagColor: "#E4002B",
    badgeNumber: "01",
    left: 6,
    top: 32,
    width: 25,
    height: 60,
    buttonLeft: 18,
    buttonTop: 42,
  },
  {
    key: "captain",
    role: "Commander",
    stationName: "Command Helm",
    action: "Watch Introduction",
    description: "Captain's Briefing",
    icon: Play,
    tagColor: "#E4002B",
    badgeNumber: "02",
    left: 38,
    top: 22,
    width: 24,
    height: 70,
    buttonLeft: 50,
    buttonTop: 62,
  },
  {
    key: "navigator",
    role: "Navigator",
    stationName: "Astrogation Array",
    action: "Showcase & Details",
    description: "Explore Portfolio",
    icon: Building2,
    tagColor: "#E4002B",
    badgeNumber: "03",
    left: 58,
    top: 24,
    width: 20,
    height: 64,
    buttonLeft: 65.5,
    buttonTop: 34.5,
  },
  {
    key: "comms",
    role: "Comms Officer",
    stationName: "Transmission Array",
    action: "Contact & Consultations",
    description: "Franchise Enquiries",
    icon: Mail,
    tagColor: "#E4002B",
    badgeNumber: "04",
    left: 76,
    top: 32,
    width: 22,
    height: 60,
    buttonLeft: 86,
    buttonTop: 48,
  },
];

export function HeroFrameScene({
  onMainCharacterClick,
  onReelsClick,
  onPlanetsClick,
  onThirdCharacterClick,
  onBridgeReady,
  isDimmed = false,
}: HeroFrameSceneProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ index: 0 });
  const scrollProgressRef = useRef(0);
  const readyRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const onBridgeReadyRef = useRef(onBridgeReady);
  useEffect(() => {
    onBridgeReadyRef.current = onBridgeReady;
  }, [onBridgeReady]);

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
  // CANVAS DRAWING: cover-fit the current frame with seamless loop crossfade
  // --------------------------------------------------------------------------
  const draw = (index: number, blendIndex?: number, blendAlpha?: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const getValidImg = (targetIdx: number) => {
      let i = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(targetIdx)));
      let img = imagesRef.current[i];
      while (i > 0 && !(img && img.complete && img.naturalWidth)) {
        i -= 1;
        img = imagesRef.current[i];
      }
      return img && img.complete && img.naturalWidth ? img : null;
    };

    const imgA = getValidImg(index);
    if (!imgA) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
    const w = FRAME_W * scale;
    const h = FRAME_H * scale;
    const dx = (cw - w) / 2;
    const dy = (ch - h) / 2;

    if (blendIndex !== undefined && blendAlpha !== undefined && blendAlpha > 0.02) {
      const imgB = getValidImg(blendIndex);
      if (imgB && imgB !== imgA) {
        ctx.globalAlpha = 1;
        ctx.drawImage(imgA, dx, dy, w, h);
        ctx.globalAlpha = Math.min(1, Math.max(0, blendAlpha));
        ctx.drawImage(imgB, dx, dy, w, h);
        ctx.globalAlpha = 1;
        return;
      }
    }

    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, dx, dy, w, h);
  };

  // Size the canvas to screen at device pixel ratio
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

  // --------------------------------------------------------------------------
  // PRELOAD SEQUENCE: Priority chunks ensure zero scroll lag
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          if (isCancelled) return resolve();
          img
            .decode()
            .catch(() => {})
            .finally(() => {
              if (isCancelled) return resolve();
              images[index] = img;
              if (index === 0) {
                setFirstLoaded(true);
                draw(0);
              }
              resolve();
            });
        };
        img.onerror = () => resolve();
        img.src = frameSrc(index);
      });
    };

    imagesRef.current = images;

    // 1. Load frame 0 immediately for first paint
    loadImage(0).then(() => {
      if (isCancelled) return;

      // 2. Preload priority frames: initial flight (1..30) & full cabin sequence (CABIN_START_FRAME..CABIN_END_FRAME)
      const priorityIndices: number[] = [];
      for (let i = 1; i <= 30; i++) priorityIndices.push(i);
      for (let i = CABIN_START_FRAME; i <= CABIN_END_FRAME; i++) priorityIndices.push(i);

      Promise.all(priorityIndices.map(loadImage)).then(() => {
        if (isCancelled) return;

        // 3. Preload all remaining frames in batches of 16
        const remainingIndices: number[] = [];
        for (let i = 1; i < FRAME_COUNT; i++) {
          if (!priorityIndices.includes(i)) remainingIndices.push(i);
        }

        const loadRemainingChunks = async () => {
          for (let c = 0; c < remainingIndices.length; c += 16) {
            if (isCancelled) break;
            const chunk = remainingIndices.slice(c, c + 16);
            await Promise.all(chunk.map(loadImage));
          }
        };

        loadRemainingChunks();
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const isDimmedRef = useRef(isDimmed);
  useEffect(() => {
    isDimmedRef.current = isDimmed;
  }, [isDimmed]);

  // --------------------------------------------------------------------------
  // HYBRID SMOOTH SCRUB & AUTOPLAY CONTROLLER
  // Synchronizes frames with scroll progress until reaching the cabin,
  // then seamlessly transitions to smooth continuous autoplay.
  // Scrolling up reverses cleanly back out to space.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const lenis = new Lenis({
      wrapper: scroller,
      content: track,
      lerp: 0.095,
      wheelMultiplier: 1.25,
      touchMultiplier: 1.5,
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const target = { index: 0 };
    let lastTime = performance.now();
    let lastDrawn = -1;
    let rafId = 0;

    const tick = (now: number) => {
      lenis.raf(now);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const progress = scrollProgressRef.current;
      const cur = frameRef.current;
      const isScrollComplete = progress >= 0.92;
      const isBridgeVisible = progress >= 0.85;

      // When the bridge comes into view, fade in the crew navigation buttons
      if (isBridgeVisible) {
        if (!readyRef.current) {
          readyRef.current = true;
          setCrewReady(true);
          onBridgeReadyRef.current?.(true);
          scifiAudio.playHoloBeep(920, 0.06);
        }
      } else if (progress < 0.75) {
        if (readyRef.current) {
          readyRef.current = false;
          setCrewReady(false);
          onBridgeReadyRef.current?.(false);
        }
      }

      if (isScrollComplete) {
        // --- AUTOPLAY CABIN MODE (plays only once from Screenshot 1 to Screenshot 2, stops on final frame) ---
        if (cur.index < CABIN_START_FRAME) {
          // Smooth glide into Screenshot 1 (frame 145)
          const diff = CABIN_START_FRAME - cur.index;
          cur.index += Math.abs(diff) < 0.05 ? diff : diff * 0.22;
        } else if (!isDimmedRef.current) {
          // Plays smoothly forward from Screenshot 1 to Screenshot 2 (frame 240) and stops on final frame
          if (cur.index < CABIN_END_FRAME) {
            cur.index = Math.min(CABIN_END_FRAME, cur.index + dt * PLAYBACK_FPS);
          }
        }
      } else {
        // --- SCROLL SCRUB MODE ---
        // Scroll smoothly controls space flight all the way up to Screenshot 1 (CABIN_START_FRAME)
        const targetIndex = (progress / 0.92) * CABIN_START_FRAME;
        const diff = targetIndex - cur.index;
        cur.index += Math.abs(diff) < 0.02 ? diff : diff * 0.22;
      }

      // Draw current frame smoothly, clamped within sequence bounds
      const rounded = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(cur.index)));
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
            scrollProgressRef.current = self.progress;
          },
        },
      });

      tl.to(
        hintRef.current,
        { opacity: 0, y: -30, duration: 0.12 },
        0
      );
    }, scroller);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      ctx.revert();
    };
  }, []);

  // Smooth jump directly into the cabin
  const scrollToBridge = () => {
    if (lenisRef.current && trackRef.current && scrollerRef.current) {
      scifiAudio.playHoloBeep(980, 0.08);
      const maxScroll = trackRef.current.scrollHeight - scrollerRef.current.clientHeight;
      lenisRef.current.scrollTo(maxScroll, { duration: 0.9, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-[#081220] transition-all duration-700 ease-out ${
        isDimmed
          ? "scale-[0.98] blur-[8px] opacity-35 brightness-75 pointer-events-none"
          : "scale-100 blur-0 opacity-100"
      }`}
    >
      <div
        ref={scrollerRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar touch-pan-y"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div ref={trackRef} className="relative h-[260vh]">
          <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
            {/* Frame sequence canvas and HUD elements scaled together */}
            <div ref={sceneRef} className="absolute inset-0 will-change-transform">
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
                  firstLoaded ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* 16:9 coordinate space matching canvas cover scale */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: "max(100vw, 177.78vh)", height: "max(100vh, 56.25vw)" }}
              >
                {/* Hotspot bounding zones & floating navigation badges */}
                {CREW.map((crew) => {
                  const isHovered = hovered === crew.key;

                  return (
                    <React.Fragment key={crew.key}>
                      {/* Interactive Crew Hotspot Area with Targeting Reticles */}
                      <button
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
                        disabled={!crewReady || isDimmed}
                        tabIndex={crewReady && !isDimmed ? 0 : -1}
                        aria-label={`${crew.role}: ${crew.action}`}
                        className="group absolute rounded-2xl outline-none transition-all duration-300 cursor-pointer disabled:pointer-events-none"
                        style={{
                          left: `${crew.left}%`,
                          top: `${crew.top}%`,
                          width: `${crew.width}%`,
                          height: `${crew.height}%`,
                        }}
                      />

                      {/* Chamfered Sci-Fi Station Navigation Button */}
                      <div
                        className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 ease-out z-20 ${
                          crewReady && !isDimmed
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-90 pointer-events-none"
                        }`}
                        style={{
                          left: `${crew.buttonLeft}%`,
                          top: `${crew.buttonTop}%`,
                          filter: isHovered
                            ? "drop-shadow(0 8px 18px rgba(228, 0, 43, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                            : "drop-shadow(0 5px 14px rgba(1, 33, 105, 0.3)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                        }}
                      >
                        <button
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
                          disabled={!crewReady || isDimmed}
                          tabIndex={crewReady && !isDimmed ? 0 : -1}
                          className={`group relative flex items-center justify-center px-3 sm:px-4.5 py-1.5 sm:py-2 transition-all duration-300 cursor-pointer ${
                            isHovered
                              ? "bg-[#E4002B] text-[#FFFFFF] scale-105"
                              : "bg-[#FFFFFF] text-[#012169] hover:bg-[#E4002B] hover:text-[#FFFFFF]"
                          }`}
                          style={{
                            clipPath: "polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)",
                          }}
                          aria-label={`${crew.role}: ${crew.action}`}
                        >
                          <span className="text-[10px] sm:text-xs font-black tracking-[0.10em] sm:tracking-[0.14em] uppercase leading-none whitespace-nowrap">
                            {crew.action}
                          </span>
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Readability gradient under the top navigation pill */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 sm:h-32 bg-gradient-to-b from-[#081220]/75 to-transparent" />

            {/* Shiny scroll cue at the start of flight */}
            <div
              ref={hintRef}
              className="absolute inset-x-0 bottom-8 sm:bottom-14 z-10 flex flex-col items-center gap-2.5 sm:gap-3 cursor-pointer pointer-events-auto transition-transform hover:scale-105 active:scale-95 pb-[max(12px,env(safe-area-inset-bottom))]"
              onClick={scrollToBridge}
              role="button"
              tabIndex={0}
              aria-label="Scroll to enter bridge"
            >
              <span className="shiny-text-light text-sm sm:text-base md:text-xl font-semibold uppercase tracking-[0.26em] sm:tracking-[0.32em] drop-shadow-md select-none">
                Scroll to Play
              </span>
              <span className="relative block h-8 sm:h-10 w-px overflow-hidden bg-white/25">
                <span className="scroll-hint-line absolute inset-x-0 top-0 h-1/2 bg-[#E4002B]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

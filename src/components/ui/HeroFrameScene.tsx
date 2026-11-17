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
// Image sequence configuration: 1920x1080 frames from hero_frames/video_frames
// --------------------------------------------------------------------------
const FRAME_COUNT = 188;
const FRAME_W = 1920;
const FRAME_H = 1080;
const frameSrc = (i: number) => `/hero_frames/video_frames/frame_${String(i + 1).padStart(4, "0")}.webp`;
// Source frames are 1920x1080, so a canvas larger than this only costs
// fill-rate without adding detail. Cap the backing store width.
const MAX_CANVAS_W = 1920;

// Frame 0..111: Ship approach over the ocean and push-in through the dome (scroll-scrubbed)
// Frame 112..187: Inside the bridge (autoplays once on scroll completion, holds on the final frame)
const CABIN_START_FRAME = 112; // frame_0113: camera has cleared the dome glass
const CABIN_END_FRAME = 187;   // frame_0188: final bridge shot the crew CTAs are positioned against
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
  // Button anchor on 16:9 canvas (%), measured on the final frame
  buttonLeft: number;
  buttonTop: number;
  // Earlier anchor keyframes [frameIndex, left%, top%] so the label stays on
  // its crew member while the camera is still pushing in. The final anchor
  // (CABIN_END_FRAME, buttonLeft, buttonTop) is appended automatically.
  track: [number, number, number][];
}

// CTAs fade in one after another while the user scrolls into the bridge,
// driven by the frame index so they stay in sync with the picture (and fade
// back out in reverse when scrolling up).
const REVEAL_START_FRAME = 96; // crew are clearly visible from here
const REVEAL_SPAN = 9;         // frames each CTA takes to fade in
const REVEAL_STAGGER = 3;      // frames between consecutive CTAs
// CTAs become clickable (and the mobile dock appears) once most are visible
const CREW_READY_FRAME = REVEAL_START_FRAME + REVEAL_SPAN;

const crewAnchorAt = (crew: CrewHotspot, frame: number): [number, number] => {
  const keys = [...crew.track, [CABIN_END_FRAME, crew.buttonLeft, crew.buttonTop] as [number, number, number]];
  if (frame <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    const [f1, l1, t1] = keys[i];
    if (frame <= f1) {
      const [f0, l0, t0] = keys[i - 1];
      const k = (frame - f0) / (f1 - f0);
      return [l0 + (l1 - l0) * k, t0 + (t1 - t0) * k];
    }
  }
  return [crew.buttonLeft, crew.buttonTop];
};

const smoothstep = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

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
    // Officer at the back-left console (behind the foreground navigator)
    left: 14,
    top: 50,
    width: 10,
    height: 26,
    buttonLeft: 21,
    buttonTop: 47,
    track: [[99, 24.5, 48.5], [112, 24, 48], [143, 23, 47.5]],
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
    // Foreground officer, bottom-left. Rendered after the archivist so this
    // hotspot wins where the two overlap. Label sits on the chest because
    // above the head would cover the archivist.
    left: 4,
    top: 58,
    width: 32,
    height: 42,
    buttonLeft: 26,
    buttonTop: 82,
    track: [[99, 29, 76], [127, 28.5, 80], [159, 27.5, 81]],
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
    // Captain at the centre command desk
    left: 43,
    top: 48,
    width: 24,
    height: 42,
    buttonLeft: 55,
    buttonTop: 45,
    track: [[99, 55, 44.5]],
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
    // Officer with headset at the right-hand console
    left: 72,
    top: 51,
    width: 18,
    height: 40,
    buttonLeft: 81,
    buttonTop: 49,
    track: [[99, 75, 50], [143, 77, 49.5], [175, 79, 49]],
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

  // --------------------------------------------------------------------------
  // CREW CTAs: written straight to the DOM every frame (no React re-render)
  // so the fade-in and position stay locked to the frame on screen.
  // --------------------------------------------------------------------------
  const crewButtonRefs = useRef<(HTMLDivElement | null)[]>([]);
  const crewHotspotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const updateCrew = (frame: number, dimmed: boolean) => {
    CREW.forEach((crew, i) => {
      const start = REVEAL_START_FRAME + i * REVEAL_STAGGER;
      const a = dimmed ? 0 : smoothstep((frame - start) / REVEAL_SPAN);
      const [left, top] = crewAnchorAt(crew, frame);

      const btn = crewButtonRefs.current[i];
      if (btn) {
        btn.style.left = `${left}%`;
        btn.style.top = `${top}%`;
        btn.style.opacity = String(a);
        btn.style.transform = `translateY(${(1 - a) * 14}px) scale(${0.9 + 0.1 * a})`;
        btn.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }

      // Hotspot moves with its label so it stays over the crew member
      const spot = crewHotspotRefs.current[i];
      if (spot) {
        spot.style.left = `${crew.left + (left - crew.buttonLeft)}%`;
        spot.style.top = `${crew.top + (top - crew.buttonTop)}%`;
        spot.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }
    });
  };

  const handlers: Record<string, (() => void) | undefined> = {
    captain: onMainCharacterClick,
    archivist: onReelsClick,
    navigator: onPlanetsClick,
    comms: onThirdCharacterClick,
  };

  // --------------------------------------------------------------------------
  // CANVAS DRAWING: cover-fit the current frame with seamless loop crossfade
  // --------------------------------------------------------------------------
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const draw = (index: number, blendIndex?: number, blendAlpha?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: false, desynchronized: true });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    // Nearest loaded frame (searching both directions) so a missing frame
    // never snaps the picture far back in the sequence.
    const getValidImg = (targetIdx: number) => {
      const t = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(targetIdx)));
      for (let off = 0; off < FRAME_COUNT; off++) {
        const a = imagesRef.current[t - off];
        if (a) return a;
        const b = imagesRef.current[t + off];
        if (b) return b;
        if (t - off < 0 && t + off >= FRAME_COUNT) break;
      }
      return null;
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let w = window.innerWidth * dpr;
      let h = window.innerHeight * dpr;
      if (w > MAX_CANVAS_W) {
        h *= MAX_CANVAS_W / w;
        w = MAX_CANVAS_W;
      }
      canvas.width = Math.round(w);
      canvas.height = Math.round(h);
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "medium";
      }
      draw(Math.round(frameRef.current.index));
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
              if (index === 0) setFirstLoaded(true);
              // Repaint if this is the frame currently on screen (it may have
              // been showing a nearby fallback frame until now).
              if (index === Math.round(frameRef.current.index)) draw(index);
              resolve();
            });
        };
        img.onerror = () => resolve();
        img.src = frameSrc(index);
      });
    };

    imagesRef.current = images;

    // Load in two passes so the whole flight is quickly scrubbable:
    // pass 1 = every 4th frame (coarse coverage), pass 2 = the rest, in scroll order.
    // A small worker pool keeps the network busy without flooding the decoder.
    const order: number[] = [];
    for (let i = 0; i < FRAME_COUNT; i += 4) order.push(i);
    for (let i = 0; i < FRAME_COUNT; i++) if (i % 4 !== 0) order.push(i);

    let next = 0;
    const worker = async () => {
      while (!isCancelled && next < order.length) {
        await loadImage(order[next++]);
      }
    };
    loadImage(order[next++]).then(() => {
      for (let w = 0; w < 6; w++) worker();
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
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const target = { index: 0 };
    let lastTime = performance.now();
    let lastDrawn = -1;
    let lastCrewFrame = -1;
    let lastCrewDimmed = false;
    let rafId = 0;

    const tick = (now: number) => {
      lenis.raf(now);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Read Lenis' smoothed progress directly (same frame, no event latency)
      const progress = Number.isFinite(lenis.progress) ? lenis.progress : scrollProgressRef.current;
      scrollProgressRef.current = progress;
      const cur = frameRef.current;
      const isScrollComplete = progress >= 0.92;

      if (isScrollComplete) {
        // --- AUTOPLAY CABIN MODE (plays only once from Screenshot 1 to Screenshot 2, stops on final frame) ---
        if (cur.index < CABIN_START_FRAME) {
          // Smooth glide into Screenshot 1 (frame 145)
          const diff = CABIN_START_FRAME - cur.index;
          const k = 1 - Math.exp(-dt * 14); // frame-rate independent glide
          cur.index += Math.abs(diff) < 0.05 ? diff : diff * k;
        } else if (!isDimmedRef.current) {
          // Plays smoothly forward from Screenshot 1 to Screenshot 2 (frame 240) and stops on final frame
          if (cur.index < CABIN_END_FRAME) {
            cur.index = Math.min(CABIN_END_FRAME, cur.index + dt * PLAYBACK_FPS);
          }
        }
      } else {
        // --- SCROLL SCRUB MODE ---
        // Scroll smoothly controls space flight all the way up to Screenshot 1 (CABIN_START_FRAME)
        // Lenis already smooths the scroll, so map it straight to the frame.
        // (A second lerp on top made the scrub feel delayed / rubbery.)
        cur.index = (progress / 0.92) * CABIN_START_FRAME;
      }

      // Draw current frame smoothly, clamped within sequence bounds
      const rounded = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(cur.index)));
      if (rounded !== lastDrawn) {
        lastDrawn = rounded;
        draw(rounded);
      }

      // Crew CTAs follow the same frame index as the picture
      const dimmed = isDimmedRef.current;
      if (rounded !== lastCrewFrame || dimmed !== lastCrewDimmed) {
        lastCrewFrame = rounded;
        lastCrewDimmed = dimmed;
        updateCrew(rounded, dimmed);
      }

      // Enable the CTAs (and the mobile dock) once they have faded in on scroll
      if (rounded >= CREW_READY_FRAME) {
        if (!readyRef.current) {
          readyRef.current = true;
          setCrewReady(true);
          onBridgeReadyRef.current?.(true);
          scifiAudio.playHoloBeep(920, 0.06);
        }
      } else if (rounded < REVEAL_START_FRAME + 2) {
        if (readyRef.current) {
          readyRef.current = false;
          setCrewReady(false);
          onBridgeReadyRef.current?.(false);
        }
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
      className={`fixed inset-0 z-0 h-[100dvh] w-screen overflow-hidden bg-[#081220] transition-[opacity,transform,filter] duration-700 ease-out ${
        isDimmed
          ? "scale-[0.98] blur-[8px] opacity-35 brightness-75 pointer-events-none"
          : ""
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
                {/* Position, opacity and pointer-events of both elements below are
                    driven per frame by updateCrew(); React only sets the initial state. */}
                {CREW.map((crew, i) => {
                  const isHovered = hovered === crew.key;

                  return (
                    <React.Fragment key={crew.key}>
                      {/* Interactive Crew Hotspot Area with Targeting Reticles */}
                      <button
                        ref={(el) => {
                          crewHotspotRefs.current[i] = el;
                        }}
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
                        className="group absolute rounded-2xl outline-none cursor-pointer disabled:pointer-events-none"
                        style={{
                          left: `${crew.left}%`,
                          top: `${crew.top}%`,
                          width: `${crew.width}%`,
                          height: `${crew.height}%`,
                          pointerEvents: "none",
                        }}
                      />

                      {/* Chamfered Sci-Fi Station Navigation Button (scroll-synced reveal) */}
                      <div
                        ref={(el) => {
                          crewButtonRefs.current[i] = el;
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 will-change-[opacity,transform]"
                        style={{
                          left: `${crew.buttonLeft}%`,
                          top: `${crew.buttonTop}%`,
                          opacity: 0,
                          pointerEvents: "none",
                          transition: "filter 300ms ease-out",
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

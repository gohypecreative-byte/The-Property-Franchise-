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
// Image sequence configuration: 1920x1080 frames from public/hero_frames
// --------------------------------------------------------------------------
const FRAME_COUNT = 240;
const FRAME_W = 1920;
const FRAME_H = 1080;
const frameSrc = (i: number) => `/hero_frames/frame_${String(i + 1).padStart(4, "0")}.webp`;

// The whole sequence is scroll-scrubbed (no autoplay): ship approach over the
// ocean, push-in through the dome, then into the bridge. Scrolling up reverses it.
const CABIN_END_FRAME = FRAME_COUNT - 1; // frame_0240: final bridge shot the crew CTAs are positioned against
// Scroll progress at which the final frame is reached; the rest is a short
// hold so the last bit of scroll doesn't nudge the camera.
const SCRUB_END_PROGRESS = 0.97;

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
const REVEAL_START_FRAME = 118; // inside the bridge, crew clearly visible from here
const REVEAL_SPAN = 12;         // frames each CTA takes to fade in
const REVEAL_STAGGER = 4;       // frames between consecutive CTAs
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

// --------------------------------------------------------------------------
// FRAME CACHE
// 240 decoded 1080p frames would be ~2GB, far more than the browser keeps
// decoded, so drawing plain <img> frames forced synchronous re-decodes on the
// main thread mid-scroll (the jitter). Instead:
// - every frame is fetched once and kept as a compressed Blob (~60MB total)
// - a sliding window of frames around the playhead (biased in the scroll
//   direction) is decoded OFF the main thread with createImageBitmap, already
//   cropped + resized to the canvas, so drawing is a cheap 1:1 blit
// - every 3rd frame is also kept as a small low-res bitmap, so a fast fling or
//   jump always has something close to show while sharp frames catch up
// --------------------------------------------------------------------------
type Geom = { cw: number; ch: number; sx: number; sy: number; sw: number; sh: number };
type Decoded = { bmp: ImageBitmap; g: Geom };

const MAX_INFLIGHT_DECODES = 3;
const LOW_STEP = 3;
const LOW_PIXELS = 640 * 360;
const FULL_BUDGET_BYTES = 320 * 1024 * 1024;

// Visible source region of a cover-fitted frame for a canvas of cw x ch
const computeGeom = (cw: number, ch: number): Geom => {
  const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
  const sw = Math.min(FRAME_W, cw / scale);
  const sh = Math.min(FRAME_H, ch / scale);
  return { cw, ch, sx: (FRAME_W - sw) / 2, sy: (FRAME_H - sh) / 2, sw, sh };
};

class FrameCache {
  blobs: (Blob | null)[] = new Array(FRAME_COUNT).fill(null);
  full = new Map<number, Decoded>();
  low = new Map<number, Decoded>();
  geom: Geom;
  private pendingFull = new Set<number>();
  private pendingLow = new Set<number>();
  private failed = new Set<number>();
  private desired: number[] = [];
  private desiredSet = new Set<number>();
  private inflight = 0;
  private focus = 0;
  private resizeOpts = true;
  private destroyed = false;

  constructor(geom: Geom, private onDecoded: () => void) {
    this.geom = geom;
    this.setFocus(0, 1);
  }

  private budget() {
    const g = this.geom;
    const px = this.resizeOpts ? g.cw * g.ch : g.sw * g.sh;
    return Math.max(12, Math.min(FRAME_COUNT, Math.floor(FULL_BUDGET_BYTES / (px * 4))));
  }

  addBlob(i: number, blob: Blob) {
    if (this.destroyed) return;
    this.blobs[i] = blob;
    this.pump();
  }

  setGeometry(g: Geom) {
    if (this.destroyed) return;
    const o = this.geom;
    if (o.cw === g.cw && o.ch === g.ch) return;
    // Existing bitmaps stay drawable (mapped by their own geometry) until
    // their replacements at the new size arrive.
    this.geom = g;
    this.pendingFull = new Set();
    this.pendingLow = new Set();
    this.setFocus(this.focus, 1);
  }

  // Decode window: the playhead frame, then two frames ahead (in the scroll
  // direction) for every one behind, up to the memory budget.
  setFocus(center: number, dir: number) {
    if (this.destroyed) return;
    this.focus = center;
    const n = this.budget();
    const list = [center];
    let a = 1;
    let b = 1;
    while (list.length < n && (a < FRAME_COUNT || b < FRAME_COUNT)) {
      for (let k = 0; k < 2 && list.length < n; k++, a++) {
        const f = center + dir * a;
        if (f >= 0 && f < FRAME_COUNT) list.push(f);
      }
      if (list.length < n) {
        const f = center - dir * b;
        if (f >= 0 && f < FRAME_COUNT) list.push(f);
      }
      b++;
    }
    this.desired = list;
    this.desiredSet = new Set(list);
    for (const [i, d] of this.full) {
      if (!this.desiredSet.has(i)) {
        d.bmp.close();
        this.full.delete(i);
      }
    }
    this.pump();
  }

  private nextJob(): { i: number; low: boolean } | null {
    for (const i of this.desired) {
      if (!this.blobs[i] || this.failed.has(i) || this.pendingFull.has(i)) continue;
      if (this.full.get(i)?.g !== this.geom) return { i, low: false };
    }
    if (!this.resizeOpts) return null;
    for (let o = 0; o < FRAME_COUNT; o++) {
      for (const i of [this.focus - o, this.focus + o]) {
        if (i < 0 || i >= FRAME_COUNT) continue;
        if (i % LOW_STEP !== 0 && i !== FRAME_COUNT - 1) continue;
        if (!this.blobs[i] || this.failed.has(i) || this.pendingLow.has(i)) continue;
        if (this.low.get(i)?.g !== this.geom) return { i, low: true };
      }
    }
    return null;
  }

  private pump() {
    while (!this.destroyed && this.inflight < MAX_INFLIGHT_DECODES) {
      const job = this.nextJob();
      if (!job) return;
      this.run(job.i, job.low);
    }
  }

  private run(i: number, low: boolean) {
    const g = this.geom;
    const pending = low ? this.pendingLow : this.pendingFull;
    pending.add(i);
    this.inflight++;
    const ls = low ? Math.min(1, Math.sqrt(LOW_PIXELS / (g.cw * g.ch))) : 1;
    this.decode(this.blobs[i]!, g, ls).then((bmp) => {
      pending.delete(i);
      this.inflight--;
      if (!bmp) {
        this.failed.add(i);
      } else if (this.destroyed || g !== this.geom || (!low && !this.desiredSet.has(i))) {
        bmp.close();
      } else {
        const map = low ? this.low : this.full;
        map.get(i)?.bmp.close();
        map.set(i, { bmp, g });
        this.onDecoded();
      }
      this.pump();
    });
  }

  private async decode(blob: Blob, g: Geom, ls: number): Promise<ImageBitmap | null> {
    const sx = Math.round(g.sx);
    const sy = Math.round(g.sy);
    const sw = Math.max(1, Math.round(g.sw));
    const sh = Math.max(1, Math.round(g.sh));
    if (this.resizeOpts) {
      try {
        return await createImageBitmap(blob, sx, sy, sw, sh, {
          resizeWidth: Math.max(1, Math.round(g.cw * ls)),
          resizeHeight: Math.max(1, Math.round(g.ch * ls)),
          resizeQuality: "high",
        });
      } catch {
        this.resizeOpts = false; // older browsers: crop only, scale at draw time
      }
    }
    try {
      return await createImageBitmap(blob, sx, sy, sw, sh);
    } catch {
      return null;
    }
  }

  // Best available picture near idx: sharp frames close by, else the nearest
  // low-res frame, else any sharp frame.
  nearest(idx: number): Decoded | null {
    const r = Math.round(idx);
    for (let o = 0; o <= 4; o++) {
      const f = this.full.get(r - o) ?? this.full.get(r + o);
      if (f) return f;
    }
    for (let o = 0; o < FRAME_COUNT; o++) {
      const d = this.low.get(r - o) ?? this.low.get(r + o) ?? this.full.get(r - o) ?? this.full.get(r + o);
      if (d) return d;
    }
    return null;
  }

  destroy() {
    this.destroyed = true;
    for (const d of this.full.values()) d.bmp.close();
    for (const d of this.low.values()) d.bmp.close();
    this.full.clear();
    this.low.clear();
  }
}

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
    // Officer at the back-left console (behind the foreground navigator).
    // Label sits just above her head.
    left: 15,
    top: 36,
    width: 10,
    height: 38,
    buttonLeft: 20,
    buttonTop: 32,
    track: [[119, 28, 37], [149, 24, 35], [179, 22, 34], [209, 20.3, 33.3]],
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
    // Foreground officer, far left. Rendered after the archivist so this
    // hotspot wins where the two overlap. Label sits on the shoulder/chest
    // because above the head would collide with the archivist's label.
    left: 0,
    top: 32,
    width: 17,
    height: 68,
    buttonLeft: 10,
    buttonTop: 58,
    track: [[119, 23, 52], [149, 18.5, 53], [179, 14, 53.5], [209, 11.2, 55]],
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
    // Captain at the centre command desk. Label on the chest, below the badge.
    left: 35,
    top: 23,
    width: 31,
    height: 55,
    buttonLeft: 50,
    buttonTop: 62,
    track: [[119, 50, 54], [149, 49.5, 53.5], [179, 50, 55.5], [209, 50, 59]],
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
    // Officer at the right-hand console. Label just above his head.
    left: 81,
    top: 31,
    width: 19,
    height: 59,
    buttonLeft: 89,
    buttonTop: 29,
    track: [[119, 79, 35], [149, 83, 32], [179, 86, 30], [209, 88, 30]],
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
  const cacheRef = useRef<FrameCache | null>(null);
  const viewRef = useRef<Geom>(computeGeom(FRAME_W, FRAME_H));
  const dirtyRef = useRef(true);
  const firstShownRef = useRef(false);
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
  // CANVAS DRAWING
  // Draws the fractional frame index: the two neighbouring frames are
  // crossfaded so slow scrolling glides instead of stepping frame-to-frame.
  // --------------------------------------------------------------------------
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Map a bitmap (decoded for geometry d.g) onto the current canvas view.
  // Normally d.g === view, which makes this a plain 1:1 blit.
  const blit = (ctx: CanvasRenderingContext2D, d: Decoded, view: Geom) => {
    const k = view.cw / view.sw;
    ctx.drawImage(d.bmp, (d.g.sx - view.sx) * k, (d.g.sy - view.sy) * k, d.g.sw * k, d.g.sh * k);
  };

  const draw = (idx: number): boolean => {
    const canvas = canvasRef.current;
    const cache = cacheRef.current;
    if (!canvas || !cache) return false;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { alpha: false });
    }
    const ctx = ctxRef.current;
    if (!ctx) return false;
    const view = viewRef.current;

    const i0 = Math.max(0, Math.min(FRAME_COUNT - 1, Math.floor(idx)));
    const i1 = Math.min(FRAME_COUNT - 1, i0 + 1);
    const t = idx - i0;
    const a = cache.full.get(i0);
    const b = cache.full.get(i1);

    let base: Decoded | null | undefined;
    let top: Decoded | null = null;
    if (a && b && i1 !== i0) {
      base = a;
      if (t > 0.01) top = b;
    } else {
      base = (t < 0.5 ? a ?? b : b ?? a) ?? cache.nearest(idx);
    }
    if (!base) return false;

    ctx.globalAlpha = 1;
    if (base.g !== view) {
      ctx.fillStyle = "#081220";
      ctx.fillRect(0, 0, view.cw, view.ch);
    }
    blit(ctx, base, view);
    if (top) {
      ctx.globalAlpha = Math.min(1, t);
      blit(ctx, top, view);
      ctx.globalAlpha = 1;
    }

    if (!firstShownRef.current) {
      firstShownRef.current = true;
      setFirstLoaded(true);
    }
    return true;
  };

  // Size the canvas so the frame is resampled only once, never twice:
  // - Screen has MORE pixels than the visible part of the frame (Retina, 4K,
  //   phones in portrait): back the canvas with exactly the visible source
  //   region at 1:1 and let the GPU upscale the element once.
  // - Screen has FEWER pixels: draw at device resolution with high-quality
  //   smoothing so the downscale is filtered (no shimmering rings/edges).
  // Either way the backing store never exceeds the 1920x1080 source.
  // Bitmaps are decoded at exactly the canvas size, so smoothing only matters
  // for the brief moment after a resize before re-decoded frames arrive.
  useEffect(() => {
    let geomTimer = 0;
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const devW = window.innerWidth * dpr;
      const devH = window.innerHeight * dpr;
      const coverScale = Math.max(devW / FRAME_W, devH / FRAME_H);
      const k = Math.min(1, 1 / coverScale);
      const cw = Math.max(1, Math.round(devW * k));
      const ch = Math.max(1, Math.round(devH * k));
      if (canvas.width === cw && canvas.height === ch && cacheRef.current) return;
      canvas.width = cw;
      canvas.height = ch;
      viewRef.current = computeGeom(cw, ch);

      // Resizing resets 2D context state, so (re)apply smoothing every time.
      if (!ctxRef.current) {
        ctxRef.current = canvas.getContext("2d", { alpha: false });
      }
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
      }
      draw(frameRef.current.index);
      dirtyRef.current = true;

      // Re-decode at the new size once resizing settles (e.g. window drag,
      // mobile URL bar), drawing the old bitmaps scaled meanwhile.
      window.clearTimeout(geomTimer);
      geomTimer = window.setTimeout(() => {
        cacheRef.current?.setGeometry(viewRef.current);
      }, 200);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.clearTimeout(geomTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --------------------------------------------------------------------------
  // PRELOAD SEQUENCE: fetch every frame once as a compressed blob, coarse
  // pass first (every 4th frame) so the whole flight is quickly scrubbable.
  // Decoding is handled by FrameCache around the playhead.
  // --------------------------------------------------------------------------
  useEffect(() => {
    const cache = new FrameCache(viewRef.current, () => {
      dirtyRef.current = true;
    });
    cacheRef.current = cache;
    // No AbortController: aborting in-flight fetches surfaces as unhandled
    // AbortErrors in dev (Strict Mode unmounts once). Workers just stop and
    // late results are dropped (cache.addBlob is a no-op after destroy).
    let cancelled = false;

    const order: number[] = [];
    for (let i = 0; i < FRAME_COUNT; i += 4) order.push(i);
    order.push(FRAME_COUNT - 1);
    for (let i = 0; i < FRAME_COUNT - 1; i++) if (i % 4 !== 0) order.push(i);

    const load = async (i: number) => {
      try {
        const res = await fetch(frameSrc(i));
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (!cancelled) cache.addBlob(i, blob);
      } catch {
        /* network error: frame falls back to a neighbour */
      }
    };

    let next = 0;
    const worker = async () => {
      while (!cancelled && next < order.length) {
        await load(order[next++]);
      }
    };
    load(order[next++]).then(() => {
      if (cancelled) return;
      for (let w = 0; w < 6; w++) worker();
    });

    return () => {
      cancelled = true;
      cache.destroy();
      if (cacheRef.current === cache) cacheRef.current = null;
    };
  }, []);

  const isDimmedRef = useRef(isDimmed);
  useEffect(() => {
    isDimmedRef.current = isDimmed;
  }, [isDimmed]);

  // --------------------------------------------------------------------------
  // SCROLL SCRUB CONTROLLER
  // Scroll progress maps directly to the frame for the entire sequence.
  // Scrolling up reverses cleanly back out over the ocean.
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

    let lastDrawnIdx = -1;
    let lastFocus = -1;
    let lastCrewIdx = -1;
    let lastCrewDimmed = false;
    let rafId = 0;

    const tick = (now: number) => {
      lenis.raf(now);

      // Read Lenis' smoothed progress directly (same frame, no event latency)
      const progress = Number.isFinite(lenis.progress) ? lenis.progress : scrollProgressRef.current;
      scrollProgressRef.current = progress;
      const cur = frameRef.current;

      // Lenis already smooths the scroll, so map it straight to the frame.
      // (A second lerp on top makes the scrub feel delayed / rubbery.)
      // The index stays fractional so draw() can blend neighbouring frames.
      cur.index = Math.min(1, Math.max(0, progress / SCRUB_END_PROGRESS)) * CABIN_END_FRAME;
      const idx = cur.index;
      const rounded = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(idx)));

      // Keep the decode window centred on the playhead, leaning the way we scroll
      if (rounded !== lastFocus) {
        const dir = lastFocus < 0 || rounded >= lastFocus ? 1 : -1;
        lastFocus = rounded;
        cacheRef.current?.setFocus(rounded, dir);
      }

      if (dirtyRef.current || Math.abs(idx - lastDrawnIdx) > 0.004) {
        if (draw(idx)) {
          lastDrawnIdx = idx;
          dirtyRef.current = false;
        }
      }

      // Crew CTAs follow the same (fractional) frame index as the picture
      const dimmed = isDimmedRef.current;
      if (Math.abs(idx - lastCrewIdx) > 0.01 || dimmed !== lastCrewDimmed) {
        lastCrewIdx = idx;
        lastCrewDimmed = dimmed;
        updateCrew(idx, dimmed);
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
        {/* Track height scales with the 240-frame sequence so each frame
            gets roughly the same scroll distance as before. */}
        <div ref={trackRef} className="relative h-[460vh]">
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

// src/components/hero/HeroBridge.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { scifiAudio } from "@/lib/audio";

// WebGL scene is client-only
const FlightCanvas = dynamic(() => import("./FlightCanvas").then((m) => m.FlightCanvas), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0A1633]" />,
});

type StationId = "captain" | "archivist" | "navigator" | "comms";

interface Station {
  id: StationId;
  index: string;
  station: string;
  name: string;
  role: string;
  opens: string;
  status: string;
  line: string;
  image: string;
  imageAlt: string;
}

const STATIONS: Station[] = [
  {
    id: "captain",
    index: "01",
    station: "Command",
    name: "The Captain",
    role: "Introduction",
    opens: "The introduction",
    status: "Projecting",
    line: "Who we are and how the network works, in a short film.",
    image: "/images/station-command.jpg",
    imageAlt: "A mission control room with rows of consoles",
  },
  {
    id: "archivist",
    index: "02",
    station: "Archive",
    name: "The Archivist",
    role: "Memory archive",
    opens: "Memory reels",
    status: "Rewinding",
    line: "Our commercial properties as short reels.",
    image: "/images/station-archive.jpg",
    imageAlt: "Earth rising over the lunar horizon",
  },
  {
    id: "navigator",
    index: "03",
    station: "Navigation",
    name: "The Navigator",
    role: "Explore planets",
    opens: "Property details",
    status: "Charting",
    line: "Six featured assets, one after another.",
    image: "/images/station-navigation.jpg",
    imageAlt: "Saturn and its rings",
  },
  {
    id: "comms",
    index: "04",
    station: "Comms",
    name: "Communication Officer",
    role: "Contact & enquiries",
    opens: "Contact and enquiries",
    status: "Transmitting",
    line: "Franchise, investor and general enquiries.",
    image: "/images/station-comms.jpg",
    imageAlt: "A deep space network dish antenna",
  },
];

/* ------------------------------ Scribble ring ------------------------------ */

// A hand-drawn ring traced for a turn and a bit around the active disc
function ringPath(turns: number, seed: number) {
  const steps = Math.round(64 * turns);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / 64) * Math.PI * 2;
    const wobble =
      1 + 0.035 * Math.sin(3 * t + seed) + 0.018 * Math.sin(7 * t + seed * 2) + 0.012 * Math.cos(11 * t - seed);
    const r = 46 * wobble + i * 0.015;
    pts.push(
      `${i === 0 ? "M" : "L"}${(50 + r * Math.cos(t - Math.PI / 2)).toFixed(2)} ${(50 + r * Math.sin(t - Math.PI / 2)).toFixed(2)}`
    );
  }
  return pts.join(" ");
}

export function Scribble({ active, seed, className = "text-[#012169]" }: { active: boolean; seed: number; className?: string }) {
  const d = useMemo(() => ringPath(1.3, seed), [seed]);
  return (
    <svg viewBox="0 0 100 100" className={`pointer-events-none absolute -inset-2.5 overflow-visible ${className}`} aria-hidden>
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{
          pathLength: { duration: active ? 0.9 : 0.35, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.2 },
        }}
      />
    </svg>
  );
}

/* --------------------------------- Hero ------------------------------------ */

interface HeroBridgeProps {
  onMainCharacterClick?: () => void; // Captain -> Introduction
  onReelsClick?: () => void; // Archivist -> Reels
  onPlanetsClick?: () => void; // Navigator -> Details
  onThirdCharacterClick?: () => void; // Comms -> Contact
  isDimmed?: boolean;
}

export function HeroBridge({
  onMainCharacterClick,
  onReelsClick,
  onPlanetsClick,
  onThirdCharacterClick,
  isDimmed = false,
}: HeroBridgeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState<StationId>("captain");
  const [isMobile, setIsMobile] = useState(false);

  const handlers: Record<StationId, (() => void) | undefined> = {
    captain: onMainCharacterClick,
    archivist: onReelsClick,
    navigator: onPlanetsClick,
    comms: onThirdCharacterClick,
  };
  const current = STATIONS.find((s) => s.id === active) ?? STATIONS[0];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // --------------------------------------------------------------------------
  // SCROLL-SCRUBBED TIMELINE
  // 0.00 hint fades · 0.12 title lifts away · 0.44 window frames the view
  // 0.60 bridge console rises · 0.74 stations appear · 0.84 spec panel
  // --------------------------------------------------------------------------
  useEffect(() => {
    const scroller = scrollerRef.current;
    const stage = stageRef.current;
    if (!scroller || !stage) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-console]", { yPercent: 110 });
      gsap.set("[data-window]", { scale: 1.22, opacity: 0 });
      gsap.set("[data-crew-item]", { y: 32, opacity: 0 });
      gsap.set("[data-spec]", { y: 16, opacity: 0 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.to("[data-hint]", { opacity: 0, duration: 0.06 }, 0)
        .to("[data-hero-copy]", { opacity: 0, y: -40, duration: 0.2 }, 0.12)
        .to("[data-window]", { opacity: 1, scale: 1, duration: 0.26, ease: "power2.out" }, 0.44)
        .to("[data-console]", { yPercent: 0, duration: 0.26, ease: "power3.out" }, 0.6)
        .to("[data-crew-item]", { opacity: 1, y: 0, duration: 0.16, stagger: 0.035, ease: "power2.out" }, 0.74)
        .to("[data-spec]", { opacity: 1, y: 0, duration: 0.14 }, 0.84)
        .set({}, {}, 1);

      let target = 0;
      let rafId = 0;
      let docked = false;
      const onScroll = () => {
        const max = scroller.scrollHeight - scroller.clientHeight;
        target = max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 0;
      };
      const tick = () => {
        const diff = target - progress.current;
        progress.current += Math.abs(diff) < 0.0005 ? diff : diff * 0.1;
        tl.progress(progress.current);
        if (!docked && progress.current > 0.9) {
          docked = true;
          scifiAudio.playHoloBeep(920, 0.06);
        } else if (docked && progress.current < 0.85) {
          docked = false;
        }
        rafId = requestAnimationFrame(tick);
      };
      scroller.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      rafId = requestAnimationFrame(tick);

      return () => {
        scroller.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(rafId);
      };
    }, stage);

    return () => ctx.revert();
  }, []);

  const openStation = (id: StationId) => {
    scifiAudio.playHoloBeep(980, 0.1);
    handlers[id]?.();
  };

  return (
    <div
      className={`fixed inset-0 z-0 transition-all duration-700 ease-out ${
        isDimmed ? "scale-[0.98] blur-[8px] opacity-35 brightness-75 pointer-events-none" : "scale-100 blur-0 opacity-100"
      }`}
    >
      <div
        ref={scrollerRef}
        data-lenis-prevent
        className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar"
      >
        <div className="relative h-[360vh]">
          <div ref={stageRef} className="sticky top-0 h-screen w-full overflow-hidden bg-[#0A1633]">
            {/* 3D flight */}
            <div className="absolute inset-0 z-0">
              <FlightCanvas progress={progress} mobile={isMobile} paused={isDimmed} />
            </div>

            {/* Opening copy over the viewport */}
            <div data-hero-copy className="absolute inset-x-0 bottom-[9vh] z-10 px-5 text-white md:bottom-[11vh] md:px-8">
              <p className="mb-5 text-[11px] uppercase tracking-[0.16em] text-white/60">
                Commercial property franchise network
              </p>
              <h1 className="font-semibold leading-[0.92] tracking-[-0.01em] text-[clamp(3.2rem,10vw,10rem)]">
                {["The Property", "Franchise"].map((line, i) => (
                  <span key={line} className="-mx-[0.15em] block overflow-hidden px-[0.15em] pb-[0.06em]">
                    <motion.span
                      className="block"
                      initial={{ y: "115%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 1, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {line}
                      {i === 1 && <span className="text-[#E4002B]">.</span>}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                <p className="max-w-md text-sm text-white/70 md:text-base">Board the bridge and choose a station.</p>
                <p data-hint className="flex items-center gap-3">
                  <span className="shiny-text-light text-[11px] font-semibold uppercase tracking-[0.32em]">
                    Scroll to board
                  </span>
                  <span className="relative block h-6 w-px overflow-hidden bg-white/20">
                    <span className="scroll-hint-line absolute inset-x-0 top-0 h-1/2 bg-[#E4002B]" />
                  </span>
                </p>
              </div>
            </div>

            {/* The bridge window: a cut-out onto the flight; the rest becomes the hull */}
            <div
              data-window
              className="pointer-events-none absolute inset-x-[4%] top-[10%] z-20 h-[38%] rounded-[1.4rem] border border-white/15 shadow-[0_0_0_200vmax_#F7F9FC] md:inset-x-[6%] md:top-[9%] md:h-[43%] md:rounded-[2rem]"
            >
              <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_90px_rgba(10,22,51,0.85)]" />
              {[
                ["left-5 top-4", "Viewport 01"],
                ["right-5 top-4", "Heading 274"],
                ["left-5 bottom-4", "Speed · cruise"],
                ["right-5 bottom-4", "Docking"],
              ].map(([pos, label]) => (
                <span key={label} className={`absolute ${pos} text-[11px] uppercase tracking-[0.16em] text-white/70`}>
                  {label}
                </span>
              ))}
            </div>

            {/* Bridge console */}
            <div data-console className="absolute inset-x-0 bottom-0 z-30 h-[52%] md:h-[48%]">
              <div className="relative h-full border-t border-[#012169]/15 bg-[#F7F9FC] text-[#012169]">
                <div className="flex h-8 items-center justify-between border-b border-[#012169]/15 px-5 md:px-8">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${i % 3 === 0 ? "bg-[#E4002B] animate-pulse" : "bg-[#012169]/20"}`}
                        style={{ animationDelay: `${i * 0.37}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[#012169]/60">Bridge · choose a station</span>
                </div>

                <div className="grid h-[calc(100%-2rem)] grid-rows-[auto_1fr] md:grid-cols-[minmax(280px,1fr)_2.3fr] md:grid-rows-1">
                  {/* Spec panel */}
                  <div
                    data-spec
                    className="order-2 border-t border-[#012169]/15 px-5 py-4 md:order-1 md:border-r md:border-t-0 md:px-8 md:py-6"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={current.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#012169]/60">
                          {current.index} · {current.station}
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.01em] md:text-4xl">{current.name}</h2>
                        <p className="mt-1 text-xs text-[#012169]/60 md:text-sm">{current.role}</p>
                        <dl className="mt-4 hidden border-b border-[#012169]/15 md:block">
                          {[
                            ["Opens", current.opens],
                            ["Status", current.status],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="grid grid-cols-[1fr_auto] items-baseline gap-6 border-t border-[#012169]/15 py-2.5"
                            >
                              <dt className="text-[11px] uppercase tracking-[0.16em] text-[#012169]/60">{label}</dt>
                              <dd className="text-right text-sm">{value}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className="mt-4 hidden max-w-xs text-sm text-[#012169]/70 md:block">{current.line}</p>
                        <button
                          onClick={() => openStation(current.id)}
                          className="group mt-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] underline decoration-[#012169]/30 underline-offset-[5px] hover:text-[#E4002B] hover:decoration-[#E4002B] md:mt-5 cursor-pointer"
                        >
                          Open {current.opens.toLowerCase()}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Station discs */}
                  <div className="order-1 flex items-center md:order-2 md:px-8">
                    <ul className="no-scrollbar flex w-full snap-x snap-mandatory items-center gap-7 overflow-x-auto px-[calc(50vw-59px)] py-7 md:justify-around md:gap-5 md:px-0 md:py-0">
                      {STATIONS.map((s, i) => (
                        <li key={s.id} data-crew-item className="shrink-0 snap-center">
                          <button
                            onClick={() => openStation(s.id)}
                            onMouseEnter={() => setActive(s.id)}
                            onFocus={() => setActive(s.id)}
                            aria-label={`${s.station}: ${s.name}. Open ${s.opens}.`}
                            className="group relative block size-[118px] rounded-full outline-none md:size-[clamp(96px,11vw,180px)] cursor-pointer"
                          >
                            <span className="relative block h-full w-full overflow-hidden rounded-full bg-[#0A1633]">
                              <img
                                src={s.image}
                                alt={s.imageAlt}
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                                draggable={false}
                              />
                              <span className="pointer-events-none absolute inset-0 rounded-full bg-[#012169]/15 mix-blend-multiply" />
                              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-[#012169]/30" />
                            </span>
                            <Scribble active={active === s.id} seed={i + 1} />
                            <span
                              className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] transition-colors ${
                                active === s.id ? "text-[#012169]" : "text-[#012169]/55"
                              }`}
                            >
                              {s.index} {s.station}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/ui/RealEstateReelsSection.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { scifiAudio } from "@/lib/audio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ReelProperty {
  id: string;
  title: string;
  shortTitle: string;
  category: "towers" | "campus" | "logistics" | "retail";
  categoryLabel: string;
  price: string;
  location: string;
  floors: number;
  tenancy: string;
  sqft: string;
  duration: string;
  image: string;
  videoSrc: string;
  description: string;
  features: string[];
}

export const REEL_PROPERTIES: ReelProperty[] = [
  {
    id: "regent-retail",
    title: "The Regent Commercial Galleria",
    shortTitle: "REGENT COMMERCIAL GALLERIA",
    category: "retail",
    categoryLabel: "RETAIL COMPLEX",
    price: "$142,000,000",
    location: "Central Avenue Flagship Promenade",
    floors: 4,
    tenancy: "Luxury Flagship Retail",
    sqft: "280,000 sq.ft",
    duration: "1:32",
    image: "/commercial_retail_pavilion.jpg",
    videoSrc: "/reel_sample_2.mp4",
    description:
      "Iconic multi-tier luxury commercial retail pavilion and pedestrian promenade housing premier international flagship brands and gourmet restaurants.",
    features: [
      "Flagship Anchor Tenants",
      "High-Footfall Promenade",
      "Curated Gourmet Dining",
    ],
  },
  {
    id: "consortium-suites",
    title: "Consortium Executive Commercial Suites",
    shortTitle: "CONSORTIUM EXECUTIVE SUITES",
    category: "towers",
    categoryLabel: "EXECUTIVE SUITES",
    price: "$78,000,000",
    location: "Financial Core Financial Center",
    floors: 12,
    tenancy: "Private Equity Partners",
    sqft: "195,000 sq.ft",
    duration: "0:58",
    image: "/commercial_boardroom.jpg",
    videoSrc: "/sample_video.mp4",
    description:
      "Bespoke turnkey executive commercial suites and boardroom levels designed for private equity firms, asset management partnerships, and sovereign wealth offices.",
    features: [
      "Panoramic Skyline Boardrooms",
      "Private Concierge Lift",
      "Encrypted Fiber Infrastructure",
    ],
  },
  {
    id: "sovereign-tower",
    title: "The Sovereign Financial Tower",
    shortTitle: "SOVEREIGN FINANCIAL TOWER",
    category: "towers",
    categoryLabel: "OFFICE TOWER",
    price: "$185,000,000",
    location: "Metropolis Financial District",
    floors: 48,
    tenancy: "98% Institutional Leased",
    sqft: "480,000 sq.ft",
    duration: "1:28",
    image: "/commercial_office_tower.jpg",
    videoSrc: "/real-estate-intro.mp4",
    description:
      "A landmark Class-A commercial office skyscraper featuring 48 storeys of column-free floor plates, LEED Platinum certification, and high-speed destination elevators.",
    features: [
      "48 Commercial Storeys",
      "LEED Platinum Core",
      "High-Speed Elevators",
    ],
  },
  {
    id: "pacific-campus",
    title: "Pacific Commerce Business Campus",
    shortTitle: "PACIFIC COMMERCE CAMPUS",
    category: "campus",
    categoryLabel: "CORPORATE CAMPUS",
    price: "$124,500,000",
    location: "Silicon Basin Innovation Corridor",
    floors: 6,
    tenancy: "Single-Tenant Tech HQ",
    sqft: "320,000 sq.ft",
    duration: "1:45",
    image: "/commercial_business_campus.jpg",
    videoSrc: "/reel_sample_2.mp4",
    description:
      "State-of-the-art multi-building commercial corporate campus with expansive glass atriums, biophilic collaborative plazas, and fiber-redundant infrastructure.",
    features: [
      "Triple-Net Institutional Lease",
      "Electric Fleet Hub",
      "Biophilic Atrium",
    ],
  },
  {
    id: "aero-logistics",
    title: "Aero-Logistics Distribution Center",
    shortTitle: "AERO-LOGISTICS HUB",
    category: "logistics",
    categoryLabel: "LOGISTICS CENTER",
    price: "$96,000,000",
    location: "Continental Freight & Port Hub",
    floors: 2,
    tenancy: "100% Logistics Leased",
    sqft: "650,000 sq.ft",
    duration: "1:15",
    image: "/commercial_logistics_center.jpg",
    videoSrc: "/sample_video.mp4",
    description:
      "Next-generation high-throughput logistics facility with 40-foot clear ceiling heights, 120 cross-dock loading bays, and full rooftop solar array.",
    features: ["120 Cross-Dock Bays", "40' Clear Height", "100% Rooftop Solar"],
  },
  {
    id: "metropolis-exchange",
    title: "Metropolis Global Financial Center",
    shortTitle: "METROPOLIS GLOBAL EXCHANGE",
    category: "towers",
    categoryLabel: "FINANCIAL CENTER",
    price: "$210,000,000",
    location: "Sovereign Financial Square",
    floors: 54,
    tenancy: "Global Banking Consortium",
    sqft: "590,000 sq.ft",
    duration: "1:50",
    image: "/real_estate_exterior.jpg",
    videoSrc: "/real-estate-intro.mp4",
    description:
      "Prestigious sovereign banking headquarters featuring panoramic atrium levels, redundant tier-4 data connectivity, and institutional trading floors.",
    features: [
      "54 High-Rise Levels",
      "Tier-4 Data Redundancy",
      "Institutional Trading Floor",
    ],
  },
];

interface RealEstateReelsSectionProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

interface ReelLayout {
  vw: number;
  vh: number;
  cardW: number;
  cardH: number;
  gap: number;
  padX: number;
  cardTop: number;
  stackOffsetY: number;
  overflow: number;
}

// Stacking deck geometry (organic rotations and subtle offsets)
const STACK_ROTATIONS = [-3.2, 2.6, -2.0, 2.2, -1.4, 1.6];
const STACK_OFFSETS_X = [-16, 16, -12, 12, -6, 6];
const STACK_OFFSETS_Y = [10, -8, 6, -4, 4, 0];

const CAPTION_H = 22;
const MEDIA_RATIO = 0.74; // width / height of the reel frame
const STACK_SCALE = 0.42;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function RealEstateReelsSection({
  scrollContainerRef,
}: RealEstateReelsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const layoutRef = useRef<ReelLayout | null>(null);
  const [cardSize, setCardSize] = useState({ w: 0, h: 0, top: 0 });

  // Automatic emergence on mount (cards pop into a small centred stack)
  const autoProxy = useRef<{ value: number }>({ value: 0 });
  // Scrolled distance into the track (target from scroll, current eased)
  const targetScrollRef = useRef<number>(0);
  const currentScrollRef = useRef<number>(0);
  const lastSoundMilestoneRef = useRef<number>(-1);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Modal Video Viewer State
  const [selectedProperty, setSelectedProperty] = useState<ReelProperty | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // --------------------------------------------------------------------------
  // LAYOUT MEASUREMENT
  // Cards are sized to fit between the sticky modal header and the progress
  // line. Track height = viewport + horizontal overflow.
  // --------------------------------------------------------------------------
  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = containerRef.current;
    if (!viewport || !track) return;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const isMobile = vw < 640;
    const numCards = REEL_PROPERTIES.length;

    const padX = isMobile ? 16 : 32;
    const gap = isMobile ? 6 : 8;
    const stripTop = isMobile ? 132 : 156; // modal header + editorial row
    const bottomReserve = isMobile ? 44 : 56;

    const availMediaH = Math.max(
      160,
      vh - stripTop - bottomReserve - CAPTION_H,
    );
    const cardW = Math.round(
      Math.min(isMobile ? vw * 0.68 : vw * 0.27, availMediaH * MEDIA_RATIO),
    );
    const cardH = Math.round(cardW / MEDIA_RATIO) + CAPTION_H;
    const cardTop = vh - bottomReserve - cardH;

    // Stack sits centred in the strip area
    const stripCenterY = (stripTop + (vh - bottomReserve)) / 2;
    const stackOffsetY = stripCenterY - (cardTop + cardH / 2);

    const rowWidth = padX * 2 + numCards * cardW + (numCards - 1) * gap;
    const overflow = Math.max(0, rowWidth - vw);

    layoutRef.current = {
      vw,
      vh,
      cardW,
      cardH,
      gap,
      padX,
      cardTop,
      stackOffsetY,
      overflow,
    };
    track.style.height = `${vh + overflow}px`;
    setCardSize((prev) =>
      prev.w === cardW && prev.h === cardH && prev.top === cardTop
        ? prev
        : { w: cardW, h: cardH, top: cardTop },
    );
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // --------------------------------------------------------------------------
  // COMPOSITE SCENE RENDERER
  // 1. autoP (0 -> 1): plays automatically on open, no scrolling needed
  //    - 0.00-0.40 reels emerge one by one into a small centred stack
  //    - 0.42-0.68 the stack grows to full size
  //    - 0.72-1.00 the stack fans out into an aligned horizontal row
  // 2. horiz (0 -> 1): scrolling then travels the row horizontally
  // --------------------------------------------------------------------------
  const renderScene = useCallback((autoP: number, scrolled: number) => {
    const L = layoutRef.current;
    if (!L) return;
    const numCards = REEL_PROPERTIES.length;

    const horiz = L.overflow > 0 ? clamp01(scrolled / L.overflow) : 0;

    const expandT = easeOutCubic(clamp01((autoP - 0.42) / 0.26));
    const spreadT = smoothstep(clamp01((autoP - 0.72) / 0.28));
    const deckScale = STACK_SCALE + (1 - STACK_SCALE) * expandT;

    const stackCenterX = L.vw / 2 - L.cardW / 2;

    // Sound milestones as reels emerge
    const milestone = Math.floor((autoP / 0.4) * numCards);
    if (
      milestone !== lastSoundMilestoneRef.current &&
      milestone >= 1 &&
      milestone <= numCards
    ) {
      lastSoundMilestoneRef.current = milestone;
      scifiAudio.playHoloBeep(840 + milestone * 35, 0.04);
    }

    for (let idx = 0; idx < numCards; idx++) {
      const cardEl = cardRefs.current[idx];
      if (!cardEl) continue;

      // Emergence: each reel rises into the stack in turn
      const emergeStart = (idx / numCards) * 0.3;
      const emergeT = easeOutCubic(clamp01((autoP - emergeStart) / 0.1));

      const stackX =
        stackCenterX + STACK_OFFSETS_X[idx % STACK_OFFSETS_X.length];
      const stackY =
        L.stackOffsetY + STACK_OFFSETS_Y[idx % STACK_OFFSETS_Y.length];
      const stackRot = STACK_ROTATIONS[idx % STACK_ROTATIONS.length];

      const rowX = L.padX + idx * (L.cardW + L.gap) - horiz * L.overflow;

      const x = stackX + (rowX - stackX) * spreadT;
      const y = stackY * (1 - spreadT) + (1 - emergeT) * 90;
      const rot = stackRot * (1 - spreadT) * emergeT;
      const scale = deckScale * (0.9 + 0.1 * emergeT);

      cardEl.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(
        2,
      )}px, 0) scale(${scale.toFixed(4)}) rotate(${rot.toFixed(2)}deg)`;
      cardEl.style.opacity = Math.min(1, emergeT * 1.6).toFixed(3);
      cardEl.style.pointerEvents = emergeT > 0.5 ? "auto" : "none";

      const captionEl = captionRefs.current[idx];
      if (captionEl) captionEl.style.opacity = spreadT.toFixed(3);
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${horiz.toFixed(4)})`;
    }

    // Scroll hint appears once the row has formed, fades as scrolling begins
    if (hintRef.current) {
      const hintIn = clamp01((autoP - 0.92) / 0.08);
      const hintOut = 1 - clamp01(horiz / 0.06);
      hintRef.current.style.opacity = (hintIn * hintOut).toFixed(3);
    }
    return horiz;
  }, []);

  // --------------------------------------------------------------------------
  // AUTOMATIC EMERGENCE ON OPEN
  // --------------------------------------------------------------------------
  useEffect(() => {
    scifiAudio.playHoloBeep(850, 0.08);
    const tween = gsap.to(autoProxy.current, {
      value: 1,
      duration: 4.2,
      ease: "none",
      delay: 0.2,
    });
    return () => {
      tween.kill();
    };
  }, []);

  // --------------------------------------------------------------------------
  // SCROLL TRACKING + RENDER LOOP (eased toward scroll position)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = scrollContainerRef?.current;
    const target: HTMLElement | Window = container || window;

    const handleScroll = () => {
      const track = containerRef.current;
      if (!track) return;
      const rootTop = container ? container.getBoundingClientRect().top : 0;
      targetScrollRef.current = Math.max(
        0,
        rootTop - track.getBoundingClientRect().top,
      );

      // Scrolling before emergence finishes fast-forwards it
      if (targetScrollRef.current > 4 && autoProxy.current.value < 1) {
        gsap.to(autoProxy.current, {
          value: 1,
          duration: 0.4,
          ease: "power2.out",
          overwrite: true,
        });
      }
    };

    let rafId = 0;
    let lastIndex = -1;
    const tick = () => {
      const diff = targetScrollRef.current - currentScrollRef.current;
      currentScrollRef.current += Math.abs(diff) < 0.1 ? diff : diff * 0.1;

      const horiz = renderScene(
        autoProxy.current.value,
        currentScrollRef.current,
      );
      if (horiz !== undefined) {
        const idx = Math.round(horiz * (REEL_PROPERTIES.length - 1));
        if (idx !== lastIndex) {
          lastIndex = idx;
          setActiveIndex(idx);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    rafId = requestAnimationFrame(tick);

    return () => {
      target.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [scrollContainerRef, renderScene]);

  // --------------------------------------------------------------------------
  // PLAYBACK: reels play only while on screen, pause once scrolled out
  // --------------------------------------------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 },
    );
    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, []);

  // Pause background reels while the full-screen viewer is open
  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (!v) return;
      if (selectedProperty) {
        v.pause();
      } else {
        const rect = v.getBoundingClientRect();
        if (rect.right > 0 && rect.left < window.innerWidth) {
          v.play().catch(() => {});
        }
      }
    });
  }, [selectedProperty]);

  const total = REEL_PROPERTIES.length;
  const selectedIndex = selectedProperty
    ? REEL_PROPERTIES.findIndex((p) => p.id === selectedProperty.id)
    : -1;

  const handleOpenReel = (property: ReelProperty) => {
    scifiAudio.playHoloBeep(980, 0.1);
    setSelectedProperty(property);
    setIsPlaying(true);
    setVideoProgress(0);
  };

  const handleCloseModal = useCallback(() => {
    scifiAudio.playHoloBeep(720, 0.08);
    setSelectedProperty(null);
  }, []);

  const handleStep = useCallback(
    (delta: number) => {
      if (selectedIndex < 0) return;
      const next = (selectedIndex + delta + total) % total;
      scifiAudio.playHoloBeep(900, 0.05);
      setSelectedProperty(REEL_PROPERTIES[next]);
      setIsPlaying(true);
      setVideoProgress(0);
    },
    [selectedIndex, total],
  );

  // Keep the viewer's video element in sync with the play state
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, selectedProperty]);

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProperty) return;
      if (e.key === "Escape") {
        handleCloseModal();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        handleStep(1);
      } else if (e.key === "ArrowLeft") {
        handleStep(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProperty, handleCloseModal, handleStep]);

  return (
    <section
      id="real-estate-reels"
      className="relative z-20 bg-[#F7F9FC] text-[#012169] selection:bg-[#E4002B] selection:text-white"
    >
      {/* ====================================================================
          PINNED SCROLL TRACK
          Auto: emerge -> stack -> expand -> fan out. Scroll: horizontal travel
          ==================================================================== */}
      <div ref={containerRef} className="relative" style={{ height: "300vh" }}>
        <div
          ref={viewportRef}
          className="sticky top-0 h-screen w-full overflow-hidden select-none"
        >
          {/* Editorial header row (sits below the sticky modal header) */}
          <div className="absolute inset-x-0 top-[76px] sm:top-[88px] grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 sm:px-8 text-[10px] sm:text-[11px] leading-[1.35] uppercase tracking-[0.08em]">
            <div className="font-semibold">
              The Property
              <br />
              Franchise
            </div>
            <div className="hidden sm:block text-[#012169]/60">
              Commercial
              <br />
              Reel Collection
            </div>
            <div className="hidden sm:block text-[#012169]/60">
              Scroll
              <br />
              To Explore
            </div>
            <div className="flex items-start justify-end gap-3 text-right">
              <span className="tabular-nums">
                {String(activeIndex + 1).padStart(2, "0")}
                <span className="text-[#012169]/40">
                  {" "}
                  / {String(total).padStart(2, "0")}
                </span>
              </span>
              <span className="h-2 w-2 mt-[3px] rounded-full bg-[#E4002B]" />
            </div>
          </div>

          {/* Reel cards (absolutely positioned, driven by renderScene) */}
          {REEL_PROPERTIES.map((property, idx) => {
            const dimmed = hoveredIndex !== null && hoveredIndex !== idx;
            return (
              <div
                key={property.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => handleOpenReel(property)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  width: cardSize.w ? `${cardSize.w}px` : undefined,
                  top: `${cardSize.top}px`,
                  zIndex: 10 + idx,
                  opacity: 0,
                  willChange: "transform, opacity",
                  transformOrigin: "center center",
                }}
                className="group absolute left-0 cursor-pointer"
              >
                {/* Caption */}
                <div
                  ref={(el) => {
                    captionRefs.current[idx] = el;
                  }}
                  style={{ height: CAPTION_H, opacity: 0 }}
                  className="flex items-start justify-between gap-3 text-[10px] sm:text-[11px] uppercase tracking-[0.08em] leading-none"
                >
                  <span className="truncate font-semibold">
                    {property.shortTitle}
                  </span>
                  <span className="flex-shrink-0 text-[#012169]/50 transition-colors duration-300 group-hover:text-[#E4002B]">
                    {property.duration}
                  </span>
                </div>

                {/* Media frame */}
                <div
                  style={{ aspectRatio: MEDIA_RATIO }}
                  className={`relative w-full overflow-hidden bg-[#0A1633] shadow-[0_18px_40px_rgba(1,33,105,0.18)] transition-opacity duration-500 ${
                    dimmed ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={property.videoSrc}
                    poster={property.image}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />

                  {/* Hover affordance */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between bg-gradient-to-t from-[#012169]/70 via-[#012169]/10 to-transparent opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="text-white text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">
                      {property.categoryLabel}
                    </span>
                    <span className="flex items-center justify-center h-9 w-9 rounded-full bg-[#E4002B] text-white">
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Shiny scroll hint (shown once the row forms, fades on scroll) */}
          <div
            ref={hintRef}
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-16 sm:bottom-20 z-40 flex justify-center"
          >
            <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/85 px-5 py-2.5 shadow-[0_10px_30px_rgba(1,33,105,0.25)] backdrop-blur-md">
              <span className="shiny-text text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em]">
                Scroll to Play
              </span>
              <span className="relative block h-5 w-[1px] overflow-hidden bg-[#012169]/15">
                <span className="scroll-hint-line absolute inset-x-0 top-0 h-1/2 bg-[#E4002B]" />
              </span>
            </div>
          </div>

          {/* Scroll progress */}
          <div className="absolute left-4 right-4 sm:left-8 sm:right-8 bottom-5 sm:bottom-7 h-px bg-[#012169]/15">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-[#E4002B]"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          REEL VIEWER
          Full-screen player with dossier panel, prev/next and live progress
          ==================================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedProperty && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                data-lenis-prevent
                onClick={handleCloseModal}
                className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-[#010B24]/90 backdrop-blur-xl text-white"
                role="dialog"
                aria-modal="true"
                aria-label={selectedProperty.title}
              >
                {/* Top bar */}
                <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 text-[11px] uppercase tracking-[0.12em]">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#E4002B]" />
                    <span className="tabular-nums text-white">
                      {String(selectedIndex + 1).padStart(2, "0")}
                      <span className="text-white/40">
                        {" "}
                        / {String(total).padStart(2, "0")}
                      </span>
                    </span>
                    <span className="hidden sm:inline text-white/50">
                      {selectedProperty.categoryLabel}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseModal();
                    }}
                    className="group flex items-center gap-2 rounded-full border border-white/20 pl-4 pr-2 py-1.5 text-white/80 hover:text-white hover:border-white/60 transition-colors cursor-pointer"
                    aria-label="Close viewer"
                  >
                    Close
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#012169] transition-transform duration-300 group-hover:rotate-90">
                      <X className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </div>

                <div className="relative min-h-[calc(100%-72px)] flex items-center justify-center px-4 sm:px-20 pb-6">
                  {/* Prev / Next */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStep(-1);
                    }}
                    className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 hover:bg-white hover:text-[#012169] transition-colors cursor-pointer"
                    aria-label="Previous reel"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStep(1);
                    }}
                    className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/80 hover:bg-white hover:text-[#012169] transition-colors cursor-pointer"
                    aria-label="Next reel"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProperty.id}
                      initial={{ opacity: 0, y: 24, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex w-full max-w-[980px] flex-col md:flex-row items-stretch gap-0 overflow-hidden bg-white text-[#012169] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
                    >
                      {/* Player */}
                      <div className="relative bg-black md:w-[min(calc((100vh-120px)*0.5625),405px)] md:flex-shrink-0 aspect-[9/14] max-h-[58vh] md:max-h-none md:aspect-auto md:h-[min(calc(100vh-120px),720px)]">
                        <video
                          ref={modalVideoRef}
                          src={selectedProperty.videoSrc}
                          poster={selectedProperty.image}
                          autoPlay
                          loop
                          playsInline
                          muted={isMuted}
                          onTimeUpdate={(e) => {
                            const v = e.currentTarget;
                            if (v.duration)
                              setVideoProgress(v.currentTime / v.duration);
                          }}
                          onClick={() => setIsPlaying((p) => !p)}
                          className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                        />

                        {/* Centre play state */}
                        <AnimatePresence>
                          {!isPlaying && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={() => setIsPlaying(true)}
                              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-[#E4002B] text-white shadow-xl cursor-pointer"
                              aria-label="Play"
                            >
                              <Play className="h-6 w-6 fill-current ml-1" />
                            </motion.button>
                          )}
                        </AnimatePresence>

                        {/* Controls */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                          <div className="mb-3 h-[2px] w-full bg-white/25">
                            <div
                              className="h-full bg-[#E4002B]"
                              style={{
                                width: `${(videoProgress * 100).toFixed(2)}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setIsPlaying((p) => !p)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-[#012169] transition-colors cursor-pointer"
                              aria-label={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                              )}
                            </button>
                            <span className="text-[11px] tracking-[0.12em] text-white/80 tabular-nums">
                              {selectedProperty.duration}
                            </span>
                            <button
                              onClick={() => setIsMuted((m) => !m)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-[#012169] transition-colors cursor-pointer"
                              aria-label={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Dossier */}
                      <div className="flex flex-1 flex-col justify-between p-6 sm:p-10 md:max-h-[min(calc(100vh-120px),720px)] md:overflow-y-auto">
                        <div>
                          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E4002B]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" />
                            {selectedProperty.categoryLabel}
                          </span>

                          <h3 className="mt-4 text-3xl sm:text-[40px] font-bold leading-[1.05] tracking-[-0.01em] text-[#012169]">
                            {selectedProperty.title}
                          </h3>

                          <p className="mt-3 flex items-center gap-1.5 text-sm text-[#012169]/60">
                            <MapPin className="h-4 w-4 text-[#E4002B]" />
                            {selectedProperty.location}
                          </p>

                          <p className="mt-6 text-[15px] leading-relaxed text-[#012169]/80">
                            {selectedProperty.description}
                          </p>

                          {/* Specs */}
                          <dl className="mt-8 grid grid-cols-2 border-t border-[#012169]/10">
                            {[
                              ["Asset Valuation", selectedProperty.price],
                              ["Leasable Area", selectedProperty.sqft],
                              [
                                "Building Floors",
                                `${selectedProperty.floors} Levels`,
                              ],
                              ["Tenancy", selectedProperty.tenancy],
                            ].map(([label, value], i) => (
                              <div
                                key={label}
                                className={`py-4 border-b border-[#012169]/10 ${i % 2 === 0 ? "pr-4 border-r" : "pl-4"}`}
                              >
                                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#012169]/50">
                                  {label}
                                </dt>
                                <dd
                                  className={`mt-1 text-lg font-semibold tracking-[-0.01em] ${
                                    i === 0
                                      ? "text-[#E4002B]"
                                      : "text-[#012169]"
                                  }`}
                                >
                                  {value}
                                </dd>
                              </div>
                            ))}
                          </dl>

                          {/* Highlights */}
                          <div className="mt-6 flex flex-wrap gap-2">
                            {selectedProperty.features.map((feat) => (
                              <span
                                key={feat}
                                className="rounded-full border border-[#012169]/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#012169]"
                              >
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-10 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 md:hidden">
                            <button
                              onClick={() => handleStep(-1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#012169]/20 cursor-pointer"
                              aria-label="Previous reel"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStep(1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#012169]/20 cursor-pointer"
                              aria-label="Next reel"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={handleCloseModal}
                            className="group ml-auto inline-flex items-center rounded-full bg-[#012169] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#E4002B] transition-colors cursor-pointer"
                          >
                            Back to Reels
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

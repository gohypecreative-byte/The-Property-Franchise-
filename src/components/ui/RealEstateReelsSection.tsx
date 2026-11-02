// src/components/ui/RealEstateReelsSection.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
    features: [
      "120 Cross-Dock Bays",
      "40' Clear Height",
      "100% Rooftop Solar",
    ],
  },
];

interface RealEstateReelsSectionProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function RealEstateReelsSection({
  scrollContainerRef,
}: RealEstateReelsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // References for all persistent card elements
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP Smooth Power-Scrub Proxy
  const progressProxy = useRef<{ value: number }>({ value: 0 });
  const viewportWidthRef = useRef<number>(1200);
  const [viewportWidth, setViewportWidth] = useState<number>(1200);

  // Modal Video Viewer State
  const [selectedProperty, setSelectedProperty] = useState<ReelProperty | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Rotations for the overlapping composition
  const baseRotations = [-1.8, 2.2, -1.0, 1.8, -2.0];

  // Measure viewport width
  useEffect(() => {
    const handleResize = () => {
      const width =
        viewportRef.current?.clientWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1200);
      viewportWidthRef.current = width;
      setViewportWidth(width);
      renderUnifiedAnimation(progressProxy.current.value);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --------------------------------------------------------------------------
  // UNIFIED GSAP ANIMATION CORE
  // 1. Initial state (p = 0): Reels are NOT visible initially when entering
  // 2. Scroll begins (0.00 -> 0.16): Reel 0 enters from top, starts small & grows
  // 3. Stacking (0.16 -> 0.46): Reels smoothly grow and stack one on top of another
  // 4. Separation (0.46 -> 0.68): Reels smoothly separate into aligned horizontal row
  // 5. Horizontal Gallery (0.68 -> 1.00): Scroll triggers smooth horizontal movement
  // --------------------------------------------------------------------------
  const renderUnifiedAnimation = useCallback((p: number) => {
    const width = viewportWidthRef.current;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const numCards = REEL_PROPERTIES.length;

    // Full Gallery Dimensions
    const fullCardWidth = isMobile ? 240 : isTablet ? 280 : 330;
    const fullGap = isMobile ? 14 : isTablet ? 18 : 24; // minimal spacing
    const totalFullWidth = numCards * fullCardWidth + (numCards - 1) * fullGap;
    const maxGalleryScroll = Math.max(
      0,
      totalFullWidth - width + (isMobile ? 40 : 160)
    );

    // Stacking Step
    const stackOverlapStep = isMobile ? 65 : isTablet ? 95 : 130;

    // Target positions in the overlapping stack
    const stackTargetsX = REEL_PROPERTIES.map((_, i) => {
      return -((numCards - 1) * stackOverlapStep) / 2 + i * stackOverlapStep;
    });

    // Target positions in the separated horizontal gallery
    const galleryTargetsX = REEL_PROPERTIES.map((_, i) => {
      return (
        -totalFullWidth / 2 +
        i * (fullCardWidth + fullGap) +
        fullCardWidth / 2
      );
    });

    // Staggered entry windows for stacking (Reels 1..4)
    const stackWindows = [
      { start: 0.0, end: 0.16 }, // Reel 0 enters from top
      { start: 0.18, end: 0.25 }, // Reel 1 slides in & stacks
      { start: 0.25, end: 0.32 }, // Reel 2 slides in & stacks
      { start: 0.32, end: 0.39 }, // Reel 3 slides in & stacks
      { start: 0.39, end: 0.46 }, // Reel 4 slides in & stacks
    ];

    // Animate every persistent card smoothly along the single timeline
    for (let idx = 0; idx < numCards; idx++) {
      const cardEl = cardRefs.current[idx];
      if (!cardEl) continue;

      let cardX = 0;
      let cardY = 0;
      let cardScale = 1;
      let cardRotate = 0;
      let cardOpacity = 0; // Default to invisible

      const stackX = stackTargetsX[idx];
      const galleryX = galleryTargetsX[idx];
      const rot = baseRotations[idx];

      if (idx === 0) {
        // ====================================================================
        // REEL 0: TOP ENTRANCE & SMOOTH GROWTH (Appears only on scroll)
        // At p = 0: COMPLETELY INVISIBLE.
        // As user scrolls (0.00 -> 0.16): glides from top, starts small & grows
        // ====================================================================
        if (p <= 0.002) {
          // Completely hidden initially when entering the section
          cardOpacity = 0;
          cardScale = 0.38;
          cardY = -220;
          cardX = 0;
          cardRotate = 0;
        } else if (p <= 0.16) {
          // Actively entering from top and expanding smoothly
          const t = p / 0.16;
          const easeT = 1 - Math.pow(1 - t, 3); // Cubic ease-out

          cardX = 0;
          cardY = -220 * (1 - easeT); // Slides down smoothly from the top
          cardScale = 0.38 + 0.62 * easeT; // Starts small, gradually increases in size
          cardRotate = 0;
          cardOpacity = Math.min(1.0, t * 2.8); // Fades in smoothly as user scrolls
        } else if (p <= 0.24) {
          // Glides from center (X=0) to its stacked position
          const glideT = (p - 0.16) / 0.08;
          const easeGlide = glideT * glideT * (3 - 2 * glideT);
          cardX = stackX * easeGlide;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = rot * easeGlide;
          cardOpacity = 1.0;
        } else if (p <= 0.46) {
          // Rests in the stack as subsequent reels layer over it
          cardX = stackX;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = rot;
          cardOpacity = 1.0;
        } else if (p <= 0.68) {
          // Separates from overlapping stack into horizontal gallery
          const sepT = (p - 0.46) / 0.22;
          const easeSep = sepT * sepT * (3 - 2 * sepT);
          cardX = stackX * (1 - easeSep) + galleryX * easeSep;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = rot * (1 - easeSep);
          cardOpacity = 1.0;
        } else {
          // Horizontal gallery scrolling across the screen
          const horizT = (p - 0.68) / 0.32;
          cardX = galleryX - horizT * maxGalleryScroll;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = 0;
          cardOpacity = 1.0;
        }
      } else {
        // ====================================================================
        // REELS 1, 2, 3, 4: SEQUENTIALLY GROW & STACK ON TOP OF EACH OTHER
        // ====================================================================
        const win = stackWindows[idx];

        if (p < win.start) {
          // Not yet entered — completely invisible
          cardOpacity = 0;
          cardScale = 0.45;
          cardX = width / 2 + 150;
          cardY = 70;
          cardRotate = rot;
        } else if (p <= win.end) {
          // Actively sliding in, growing, and stacking over previous reels
          const rawEntryT = (p - win.start) / (win.end - win.start);
          const easeEntryT = 1 - Math.pow(1 - rawEntryT, 3); // Cubic ease-out

          cardScale = 0.48 + 0.52 * easeEntryT; // Smoothly increases in size as it stacks
          const offscreenX = width / 2 + 150;
          cardX = offscreenX * (1 - easeEntryT) + stackX * easeEntryT;
          cardY = 65 * (1 - easeEntryT);
          cardRotate = rot * easeEntryT;
          cardOpacity = Math.min(1.0, rawEntryT * 2.5);
        } else if (p <= 0.46) {
          // Settled in the layered stack
          cardX = stackX;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = rot;
          cardOpacity = 1.0;
        } else if (p <= 0.68) {
          // Gradually separate into clean horizontal row
          const sepT = (p - 0.46) / 0.22;
          const easeSep = sepT * sepT * (3 - 2 * sepT);

          cardX = stackX * (1 - easeSep) + galleryX * easeSep;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = rot * (1 - easeSep);
          cardOpacity = 1.0;
        } else {
          // Horizontal gallery scrolling across the screen
          const horizT = (p - 0.68) / 0.32;
          cardX = galleryX - horizT * maxGalleryScroll;
          cardY = 0;
          cardScale = 1.0;
          cardRotate = 0;
          cardOpacity = 1.0;
        }
      }

      // Hardware-accelerated GPU direct transform
      cardEl.style.transform = `translate3d(${cardX.toFixed(2)}px, ${cardY.toFixed(
        2
      )}px, 0) scale(${cardScale.toFixed(4)}) rotate(${cardRotate.toFixed(2)}deg)`;
      cardEl.style.opacity = cardOpacity.toFixed(3);
      cardEl.style.pointerEvents = cardOpacity > 0.35 ? "auto" : "none";
    }
  }, []);

  // --------------------------------------------------------------------------
  // GSAP SCROLLER WITH SMOOTH VELOCITY INERTIA
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const track = containerRef.current;
      const scrollTop = container.scrollTop;
      const trackTop = track.offsetTop;
      const trackHeight = track.offsetHeight;
      const clientHeight = container.clientHeight;
      const maxScroll = trackHeight - clientHeight;
      if (maxScroll <= 0) return;

      const rawProgress = (scrollTop - trackTop) / maxScroll;
      const p = Math.min(Math.max(rawProgress, 0), 1);

      // GSAP smooth power scrub with fluid weighted momentum
      gsap.to(progressProxy.current, {
        value: p,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          renderUnifiedAnimation(progressProxy.current.value);
        },
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Initial call to set initial invisibility at p = 0
    renderUnifiedAnimation(0);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      gsap.killTweensOf(progressProxy.current);
    };
  }, [scrollContainerRef, renderUnifiedAnimation]);

  const handleOpenReel = (property: ReelProperty) => {
    scifiAudio.playHoloBeep(980, 0.1);
    setSelectedProperty(property);
    setIsPlaying(true);
  };

  const handleCloseModal = () => {
    scifiAudio.playHoloBeep(720, 0.08);
    setSelectedProperty(null);
  };

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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProperty]);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  const fullCardWidth = isMobile ? 240 : isTablet ? 280 : 330;

  return (
    <section
      id="real-estate-reels"
      className="relative z-20 bg-[#FCF8F3] text-[#012169] selection:bg-[#A10728] selection:text-[#FCF8F3] font-['Condor_Medium_Condensed_Italic',sans-serif] italic"
    >
      {/* Subtle Architectural Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,rgba(1,33,105,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(1,33,105,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* ====================================================================
          EXPANSIVE 550vh PINNED SCROLL TRACK
          1. Initial: Reels are NOT visible initially
          2. Scroll starts: Reel 0 smoothly enters from the top, starts small & grows
          3. Stacking: Reels 1..4 slide in, grow, and stack on top of each other
          4. Separation: Reels smoothly separate into aligned horizontal row
          5. Horizontal Gallery: Scroll triggers smooth horizontal movement
          ==================================================================== */}
      <div ref={containerRef} className="relative h-[550vh]">
        <div
          ref={viewportRef}
          className="sticky top-0 h-screen w-full flex flex-col justify-between py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-10 select-none overflow-hidden"
        >
          {/* ------------------------------------------------------------------
              SINGLE UNIFIED ANIMATION STAGE
              Each card is a persistent entity animating through all stages.
              ------------------------------------------------------------------ */}
          <div className="relative w-full flex-1 flex items-center justify-center my-auto overflow-visible z-20">
            {REEL_PROPERTIES.map((property, idx) => (
              <div
                key={property.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => handleOpenReel(property)}
                style={{
                  width: `${fullCardWidth}px`,
                  zIndex: 10 + idx,
                  willChange: "transform, opacity",
                  transformOrigin: "center center",
                }}
                className="absolute flex flex-col items-center cursor-pointer group"
              >
                {/* Main Card Frame */}
                <div className="relative w-full aspect-[9/15] rounded-[22px] sm:rounded-[26px] overflow-hidden border-[2px] border-[#012169]/25 bg-[#0E1B33] shadow-[0_20px_50px_rgba(1,33,105,0.25)] hover:shadow-[0_25px_65px_rgba(161,7,40,0.38)] hover:border-[#A10728] transition-all duration-300 select-none">
                  {/* Background Video Layer */}
                  <div className="absolute inset-0 z-0 bg-[#0A1224] overflow-hidden">
                    <video
                      src={property.videoSrc}
                      poster={property.image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================
          CINEMATIC FULL-SCREEN REEL VIEWER MODAL
          ==================================================================== */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0E1B33]/85 backdrop-blur-md"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.92, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[28px] border-[2px] border-[#012169]/30 bg-[#0E1B33] text-[#FAF9F6] shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-white/20 text-white hover:bg-[#A10728] transition-all cursor-pointer backdrop-blur-md shadow-md"
                title="Close Viewer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Column: High-Res Vertical Video Player */}
              <div className="relative md:w-[50%] aspect-[9/16] md:aspect-auto md:min-h-[580px] bg-black flex items-center justify-center">
                <video
                  ref={modalVideoRef}
                  src={selectedProperty.videoSrc}
                  poster={selectedProperty.image}
                  autoPlay
                  loop
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />

                {/* Video Play/Pause & Sound Toggles */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-30">
                  <button
                    onClick={() => {
                      if (modalVideoRef.current) {
                        if (isPlaying) {
                          modalVideoRef.current.pause();
                        } else {
                          modalVideoRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className="p-3 rounded-full bg-black/60 text-white hover:bg-[#A10728] transition-all cursor-pointer backdrop-blur-md"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 fill-current" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-3 rounded-full bg-black/60 text-white hover:bg-[#A10728] transition-all cursor-pointer backdrop-blur-md"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Property Intelligence & Dossier Information */}
              <div className="md:w-[50%] p-6 sm:p-8 flex flex-col justify-between bg-[#0E1B33] overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-[#A10728] animate-pulse" />
                    <span className="text-xs font-bold text-[#A10728] tracking-[0.2em] uppercase">
                      {selectedProperty.categoryLabel}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black uppercase text-white leading-tight mb-2">
                    {selectedProperty.title}
                  </h3>

                  <p className="text-sm font-medium text-white/80 leading-relaxed mb-6 border-l-2 border-[#A10728] pl-3 py-1">
                    {selectedProperty.description}
                  </p>

                  {/* Telemetry Matrix Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                        Asset Valuation
                      </span>
                      <span className="text-lg font-mono font-bold text-[#A10728]">
                        {selectedProperty.price}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                        Gross Leasable Area
                      </span>
                      <span className="text-lg font-mono font-bold text-white">
                        {selectedProperty.sqft}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                        Building Floors
                      </span>
                      <span className="text-lg font-mono font-bold text-white">
                        {selectedProperty.floors} Levels
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                        Tenancy Status
                      </span>
                      <span className="text-sm font-bold text-white truncate">
                        {selectedProperty.tenancy}
                      </span>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                      Key Highlights:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/15 text-white"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Consultation Action */}
                <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <MapPin className="h-3.5 w-3.5 text-[#A10728]" />
                    <span className="truncate max-w-[180px]">
                      {selectedProperty.location}
                    </span>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-full bg-[#A10728] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#720808] transition-all cursor-pointer shadow-md"
                  >
                    Return to Reels
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

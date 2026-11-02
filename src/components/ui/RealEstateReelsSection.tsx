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

export function RealEstateReelsSection({
  scrollContainerRef,
}: RealEstateReelsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // References for all persistent card elements
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Automatic entrance progress proxy (runs on section mount without scrolling)
  const autoEntranceProxy = useRef<{ value: number }>({ value: 0 });
  const autoEntranceDoneRef = useRef<boolean>(false);

  // Scroll progress proxy (controls horizontal navigation after entrance)
  const scrollProxy = useRef<{ value: number }>({ value: 0 });
  const viewportWidthRef = useRef<number>(1200);
  const [, setViewportWidth] = useState<number>(1200);

  // Audio milestone tracker
  const lastSoundMilestoneRef = useRef<number>(-1);

  // Modal Video Viewer State
  const [selectedProperty, setSelectedProperty] = useState<ReelProperty | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // Stacking deck geometry (organic rotations and subtle offsets)
  const stackRotations = [-2.8, 2.4, -1.8, 2.0, -1.2, 1.4];
  const stackOffsetsX = [-14, 14, -10, 10, -6, 6];
  const stackOffsetsY = [8, -6, 6, -4, 4, 0];

  // Measure viewport width on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const width =
        viewportRef.current?.clientWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1200);
      viewportWidthRef.current = width;
      setViewportWidth(width);
      renderCompositeScene(
        autoEntranceProxy.current.value,
        scrollProxy.current.value
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --------------------------------------------------------------------------
  // COMPOSITE SCENE RENDERER
  // 1. autoP (0.00 -> 1.00): Automatic entrance triggered on section entry
  //    - Starts small in the center
  //    - Additional reels emerge, stack over one another, and gradually expand
  //    - Once expanded, stack separates smoothly into aligned horizontal row
  // 2. scrollP (0.00 -> 1.00): User scrolling purely drives horizontal movement
  // --------------------------------------------------------------------------
  const renderCompositeScene = useCallback((autoP: number, scrollP: number) => {
    const width = viewportWidthRef.current;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const isLarge = width >= 1440;
    const numCards = REEL_PROPERTIES.length;

    // Sized comfortably to fit vertically within the viewport without cropping
    const fullCardWidth = isMobile
      ? 205
      : isTablet
      ? 245
      : isLarge
      ? 295
      : 265;

    const fullGap = isMobile ? 16 : isTablet ? 22 : 28;
    const leftMargin = isMobile ? 20 : isTablet ? 40 : 64;
    const galleryStartCenter = -(width / 2) + leftMargin + fullCardWidth / 2;

    const baseGalleryTargetsX = REEL_PROPERTIES.map((_, i) => {
      return galleryStartCenter + i * (fullCardWidth + fullGap);
    });

    const maxGalleryScroll = Math.max(
      0,
      baseGalleryTargetsX[numCards - 1] +
        fullCardWidth / 2 -
        (width / 2 - leftMargin)
    );

    // Initial scale when entering
    const initialScale = isMobile ? 0.42 : 0.36;

    // Phase 1 of auto entrance: Stacking & expansion (autoP: 0.00 -> 0.68)
    const deckProgress = Math.min(1.0, Math.max(0, autoP / 0.68));
    const easeDeck = 1 - Math.pow(1 - deckProgress, 2.2);
    const currentDeckScale = initialScale + (1.0 - initialScale) * easeDeck;

    // Sound milestones during emergence
    const currentMilestone = Math.floor(autoP / 0.12);
    if (
      currentMilestone !== lastSoundMilestoneRef.current &&
      currentMilestone >= 1 &&
      currentMilestone <= numCards
    ) {
      lastSoundMilestoneRef.current = currentMilestone;
      scifiAudio.playHoloBeep(840 + currentMilestone * 35, 0.04);
    }

    // Animate every persistent card
    for (let idx = 0; idx < numCards; idx++) {
      const cardEl = cardRefs.current[idx];
      if (!cardEl) continue;

      let cardX = 0;
      let cardY = 0;
      let cardScale = 1;
      let cardRotate = 0;
      let cardOpacity = 0;

      const stackX = stackOffsetsX[idx % stackOffsetsX.length];
      const stackY = stackOffsetsY[idx % stackOffsetsY.length];
      const stackRot = stackRotations[idx % stackRotations.length];
      const galleryX = baseGalleryTargetsX[idx];

      if (autoP <= 0.68) {
        // ====================================================================
        // AUTOMATIC PHASE 1: EMERGENCE, STACKING & SIZE EXPANSION
        // ====================================================================
        if (idx === 0) {
          cardOpacity = 1.0;
          cardScale = currentDeckScale;
          cardX = stackX * easeDeck;
          cardY = stackY * easeDeck;
          cardRotate = stackRot * easeDeck;
        } else {
          const entryStart = 0.05 + (idx - 1) * (0.55 / (numCards - 1));
          const entryEnd = entryStart + 0.12;

          if (autoP < entryStart) {
            cardOpacity = 0;
            cardScale = initialScale;
            cardX = 0;
            cardY = 80;
            cardRotate = 0;
          } else if (autoP <= entryEnd) {
            const rawT = (autoP - entryStart) / (entryEnd - entryStart);
            const easeEntry = 1 - Math.pow(1 - rawT, 3);

            cardOpacity = Math.min(1.0, rawT * 2.2);
            cardScale = currentDeckScale * (0.90 + 0.10 * easeEntry);
            cardX = stackX * easeEntry;
            cardY = stackY * easeEntry + (1 - easeEntry) * 65;
            cardRotate = stackRot * easeEntry;
          } else {
            cardOpacity = 1.0;
            cardScale = currentDeckScale;
            cardX = stackX;
            cardY = stackY;
            cardRotate = stackRot;
          }
        }
      } else if (autoP < 1.00) {
        // ====================================================================
        // AUTOMATIC PHASE 2: SPREAD FROM STACK INTO HORIZONTAL ROW
        // ====================================================================
        const spreadT = (autoP - 0.68) / (1.00 - 0.68);
        const easeSpread = spreadT * spreadT * (3 - 2 * spreadT);

        cardOpacity = 1.0;
        cardScale = 1.00;
        cardX = stackX * (1 - easeSpread) + galleryX * easeSpread;
        cardY = stackY * (1 - easeSpread);
        cardRotate = stackRot * (1 - easeSpread);
      } else {
        // ====================================================================
        // PHASE 3: SCROLL-CONTROLLED HORIZONTAL MOVEMENT
        // Automatic animation is complete. Scrolling purely drives horizontal motion.
        // ====================================================================
        cardOpacity = 1.0;
        cardScale = 1.00;
        cardX = galleryX - scrollP * maxGalleryScroll;
        cardY = 0;
        cardRotate = 0;
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
  // AUTOMATIC ENTRANCE ANIMATION (TRIGGERS UPON SECTION ENTRY WITHOUT SCROLLING)
  // --------------------------------------------------------------------------
  useEffect(() => {
    scifiAudio.playHoloBeep(850, 0.08);

    // Initial render at autoP = 0, scrollP = 0
    renderCompositeScene(0, 0);

    const autoTween = gsap.to(autoEntranceProxy.current, {
      value: 1,
      duration: 2.5,
      ease: "power2.inOut",
      delay: 0.1,
      onUpdate: () => {
        renderCompositeScene(
          autoEntranceProxy.current.value,
          scrollProxy.current.value
        );
      },
      onComplete: () => {
        autoEntranceDoneRef.current = true;
      },
    });

    return () => {
      autoTween.kill();
    };
  }, [renderCompositeScene]);

  // --------------------------------------------------------------------------
  // USER SCROLLING: CONTROLS ONLY HORIZONTAL MOVEMENT AFTER ENTRANCE
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = scrollContainerRef?.current;
    const target =
      container || (typeof window !== "undefined" ? window : null);
    if (!target) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const track = containerRef.current;

      let scrollTop = 0;
      let clientHeight = 0;
      let trackTop = 0;
      const trackHeight = track.offsetHeight;

      if (container) {
        scrollTop = container.scrollTop;
        clientHeight = container.clientHeight;
        trackTop = track.offsetTop;
      } else {
        scrollTop = window.scrollY || window.pageYOffset;
        clientHeight = window.innerHeight;
        const rect = track.getBoundingClientRect();
        trackTop = rect.top + scrollTop;
      }

      const maxScroll = trackHeight - clientHeight;
      if (maxScroll <= 0) return;

      const rawProgress = (scrollTop - trackTop) / maxScroll;
      const p = Math.min(Math.max(rawProgress, 0), 1);

      // If user scrolls before auto-entrance completes, fast-forward auto-entrance
      if (p > 0.01 && !autoEntranceDoneRef.current) {
        autoEntranceDoneRef.current = true;
        gsap.to(autoEntranceProxy.current, {
          value: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      // Smooth horizontal scrubbing
      gsap.to(scrollProxy.current, {
        value: p,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          renderCompositeScene(
            autoEntranceProxy.current.value,
            scrollProxy.current.value
          );
        },
      });
    };

    target.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      target.removeEventListener("scroll", handleScroll);
      gsap.killTweensOf(scrollProxy.current);
    };
  }, [scrollContainerRef, renderCompositeScene]);

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

  const isMobile = viewportWidthRef.current < 640;
  const isTablet =
    viewportWidthRef.current >= 640 && viewportWidthRef.current < 1024;
  const isLarge = viewportWidthRef.current >= 1440;
  const fullCardWidth = isMobile
    ? 205
    : isTablet
    ? 245
    : isLarge
    ? 295
    : 265;

  return (
    <section
      id="real-estate-reels"
      className="relative z-20 bg-[#FCF8F3] text-[#012169] selection:bg-[#A10728] selection:text-[#FCF8F3] font-['Condor_Medium_Condensed_Italic',sans-serif] italic"
    >
      {/* Subtle Architectural Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,rgba(1,33,105,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(1,33,105,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* ====================================================================
          PINNED SCROLL TRACK
          1. Automatic on entrance: Small reel emerges, stacks and expands,
             then separates into an aligned horizontal row
          2. Scrolling: Purely controls horizontal navigation of the reels
          ==================================================================== */}
      <div ref={containerRef} className="relative h-[380vh]">
        <div
          ref={viewportRef}
          className="sticky top-0 h-screen w-full flex flex-col justify-center items-center py-6 px-3 sm:px-6 lg:px-10 select-none overflow-hidden"
        >
          {/* ------------------------------------------------------------------
              SINGLE UNIFIED ANIMATION STAGE
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
                className="absolute flex flex-col items-center cursor-pointer group select-none"
              >
                {/* Main Card Frame (Pure, Clean, High-Res Video Reel without overlays) */}
                <div className="relative w-full aspect-[9/15] rounded-[20px] sm:rounded-[26px] overflow-hidden border-[2px] border-[#012169]/20 bg-[#0E1B33] shadow-[0_15px_45px_rgba(1,33,105,0.20)] group-hover:shadow-[0_20px_55px_rgba(161,7,40,0.32)] group-hover:border-[#A10728] transition-all duration-300">
                  {/* Ambient Looping Video */}
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
                      <span className="text-lg font-bold text-[#A10728]">
                        {selectedProperty.price}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                        Gross Leasable Area
                      </span>
                      <span className="text-lg font-bold text-white">
                        {selectedProperty.sqft}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                      <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                        Building Floors
                      </span>
                      <span className="text-lg font-bold text-white">
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

// src/components/ui/WebsiteDetailsSection.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  X,
} from "lucide-react";
import { scifiAudio } from "@/lib/audio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// Commercial Property Portfolio Data (6 Featured Institutional Assets)
// ============================================================================
export interface PropertyDossier {
  id: string;
  index: string; // "01", "02", ...
  name: string;
  title: string;
  category: string;
  eyebrow: string;
  valuation: string;
  sqft: string;
  location: string;
  tenancy: string;
  leadText: string;
  description: string;
  features: string[];
  image: string;
  specs: { label: string; value: string }[];
}

export const FEATURED_PROPERTIES: PropertyDossier[] = [
  {
    id: "sovereign-tower",
    index: "01",
    name: "Sovereign Tower",
    title: "The Sovereign Financial Tower",
    category: "Trophy Office Tower",
    eyebrow: "PRIME CBD ASSET",
    valuation: "$280,000,000",
    sqft: "850,000 SQ.FT",
    location: "Metropolis Financial Core",
    tenancy: "99.4% Leased Institutional Tenancy",
    leadText:
      "A landmark Class-A commercial office skyscraper featuring 48 storeys of column-free floor plates, LEED Platinum certification, and high-speed destination elevators.",
    description:
      "Exclusive acquisition representation and institutional placement for prime commercial towers across central business districts. Characterized by destination-dispatch vertical transit, column-free floor plates, and long-term Fortune 100 enterprise leases.",
    features: [
      "Prime Central Business District Core",
      "50+ Storeys with 850,000 RSF Footprint",
      "LEED Platinum Environmental Certification",
      "Fortune 100 Anchor Tenancy",
    ],
    image: "/commercial_office_tower.jpg",
    specs: [
      { label: "Asset Valuation", value: "$280,000,000" },
      { label: "Gross Leasable Area", value: "850,000 SQ.FT" },
      { label: "Occupancy Rate", value: "99.4% Leased" },
      { label: "Classification", value: "Class-A Prime Trophy Core" },
    ],
  },
  {
    id: "pacific-campus",
    index: "02",
    name: "Pacific Campus",
    title: "Pacific Commerce Business Campus",
    category: "Corporate Campus",
    eyebrow: "INNOVATION CORRIDOR",
    valuation: "$124,500,000",
    sqft: "640,000 SQ.FT",
    location: "Silicon Basin Innovation Corridor",
    tenancy: "Single-Tenant Tech HQ",
    leadText:
      "State-of-the-art multi-building commercial corporate campus with expansive glass atriums, biophilic collaborative plazas, and fiber-redundant infrastructure.",
    description:
      "Turnkey enterprise business parks and master-planned corporate facilities situated along high-growth economic corridors. Incorporates sustainable architectural glass facades, dedicated electrical substations, and dual-fiber communications infrastructure.",
    features: [
      "Master-Planned Multi-Building Campus",
      "Fiber-Redundant Infrastructure",
      "Biophilic Central Atrium",
      "Electric Fleet Charging Hub",
    ],
    image: "/commercial_business_campus.jpg",
    specs: [
      { label: "Total Footprint", value: "640,000 SQ.FT" },
      { label: "Valuation Size", value: "$124.5M Institutional" },
      { label: "Campus Buildings", value: "4 Linked Modern Pavilions" },
      { label: "Parking Allocation", value: "4.2 Per 1,000 SQ.FT" },
    ],
  },
  {
    id: "aero-logistics",
    index: "03",
    name: "Aero-Logistics",
    title: "Aero-Logistics Distribution Center",
    category: "Logistics Hub",
    eyebrow: "SUPPLY CHAIN ARTERY",
    valuation: "$96,000,000",
    sqft: "650,000 SQ.FT",
    location: "Continental Freight & Port Hub",
    tenancy: "100% Logistics Leased",
    leadText:
      "Next-generation high-throughput logistics facility with 40-foot clear ceiling heights, 120 cross-dock loading bays, and full rooftop solar array.",
    description:
      "Engineered to satisfy 24/7 high-throughput automated fulfillment operations. Featuring 40-foot clear ceiling heights, ESFR fire suppression systems, high-capacity dock levelers, extensive trailer staging aprons, and long-term triple-net (NNN) covenants.",
    features: [
      "120 Cross-Dock Bays",
      "40' Clear Structural Height",
      "100% Rooftop Solar Array",
      "Triple-Net (NNN) Cash Flows",
    ],
    image: "/commercial_logistics_center.jpg",
    specs: [
      { label: "Surface Under Mgmt", value: "650,000 SQ.FT" },
      { label: "Clear Ceiling Height", value: "40-Foot Clear Structural" },
      { label: "Loading Docks", value: "120 Cross-Dock Positions" },
      { label: "Target Portfolio IRR", value: "15.4% Net to Partners" },
    ],
  },
  {
    id: "consortium-suites",
    index: "04",
    name: "Consortium Suites",
    title: "Consortium Executive Commercial Suites",
    category: "Executive Suites",
    eyebrow: "PRIVATE WEALTH OFFICES",
    valuation: "$78,000,000",
    sqft: "195,000 SQ.FT",
    location: "Financial Core Financial Center",
    tenancy: "Private Equity Partners",
    leadText:
      "Bespoke turnkey executive commercial suites and boardroom levels designed for private equity firms, asset management partnerships, and sovereign wealth offices.",
    description:
      "Ultra-prime commercial executive environments engineered for premier corporate transactions and private equity headquarters. Features dedicated high-speed elevators, biometric security access, panoramic boardroom views, and acoustically isolated meeting chambers.",
    features: [
      "Panoramic Skyline Boardrooms",
      "Private Concierge Lift Access",
      "Encrypted Fiber Infrastructure",
      "Turnkey Executive Design",
    ],
    image: "/commercial_boardroom.jpg",
    specs: [
      { label: "Asset Valuation", value: "$78,000,000" },
      { label: "Gross Leasable Area", value: "195,000 SQ.FT" },
      { label: "Occupancy Rate", value: "100% Committed LP" },
      { label: "Floors Dedicated", value: "12 Executive Levels" },
    ],
  },
  {
    id: "regent-galleria",
    index: "05",
    name: "Regent Galleria",
    title: "The Regent Commercial Galleria",
    category: "Retail Complex",
    eyebrow: "FLAGSHIP PROMENADE",
    valuation: "$142,000,000",
    sqft: "280,000 SQ.FT",
    location: "Central Avenue Flagship Promenade",
    tenancy: "Luxury Flagship Retail",
    leadText:
      "Iconic multi-tier luxury commercial retail pavilion and pedestrian promenade housing premier international flagship brands and gourmet restaurants.",
    description:
      "A vibrant commercial flagship destination catering to high-net-worth pedestrian traffic and world-class retail tenants. Includes climate-controlled skylit gallerias, outdoor dining terraces, and automated subterranean parking facilities.",
    features: [
      "Flagship Anchor Tenants",
      "High-Footfall Promenade",
      "Curated Gourmet Dining",
      "Architectural Glass Canopy",
    ],
    image: "/commercial_retail_pavilion.jpg",
    specs: [
      { label: "Asset Valuation", value: "$142,000,000" },
      { label: "Gross Leasable Area", value: "280,000 SQ.FT" },
      { label: "Levels", value: "4 Retail & Dining Tiers" },
      { label: "Tenancy Type", value: "Luxury Global Flagships" },
    ],
  },
  {
    id: "master-territory",
    index: "06",
    name: "Master Territory",
    title: "Metropolitan Commercial Territory",
    category: "Master Franchise",
    eyebrow: "GLOBAL TERRITORY MANDATE",
    valuation: "$350,000,000",
    sqft: "2,400,000 SQ.FT",
    location: "Transcontinental Network Nodes",
    tenancy: "Regional Master Franchisees",
    leadText:
      "Regional master territory commercial licensing, institutional real estate syndication, and sovereign capital expansion across premier metropolitan markets.",
    description:
      "The flagship commercial property franchise model empowering institutional partners to operate certified regional brokerage, property management, and asset development territories with full proprietary brand support.",
    features: [
      "Regional Territory Exclusivity",
      "Proprietary Deal Pipeline Access",
      "Audited Capital Governance",
      "Global Institutional Syndication",
    ],
    image: "/real_estate_exterior.jpg",
    specs: [
      { label: "Total Asset Reach", value: "$350,000,000+" },
      { label: "Territory Footprint", value: "2,400,000 SQ.FT" },
      { label: "Network Operators", value: "Tier-1 Master Franchisees" },
      { label: "Governance Model", value: "Bilateral Co-Investment" },
    ],
  },
];

interface WebsiteDetailsSectionProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onClose?: () => void;
}

export function WebsiteDetailsSection({
  scrollContainerRef,
  onClose,
}: WebsiteDetailsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Full-screen 3-image entrance banner container
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const bannerCol1Ref = useRef<HTMLDivElement>(null);
  const bannerCol2Ref = useRef<HTMLDivElement>(null);
  const bannerCol3Ref = useRef<HTMLDivElement>(null);

  // Split layout elements
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const rightColumnContainerRef = useRef<HTMLDivElement>(null);

  // Progress and state
  const progressProxy = useRef<{ value: number }>({ value: 0 });
  const [activePropertyIndex, setActivePropertyIndex] = useState<number>(0);
  const [selectedDossier, setSelectedDossier] = useState<PropertyDossier | null>(null);

  // --------------------------------------------------------------------------
  // UNIFIED STICKY SCROLL ANIMATION CORE
  // 1. (p = 0.00 -> 0.18): 3 images animate UPWARD from the bottom while section is pinned.
  // 2. (p = 0.18 -> 0.24): 3 images hold in place filling 100% of the screen width.
  // 3. (p = 0.24 -> 0.38): 3 images slide rightward into right column; Left panel reveals.
  // 4. (p = 0.38 -> 0.90): Right column vertically scrubs through the 6 properties.
  // 5. (p = 0.90 -> 1.00): Animation finishes cleanly.
  // Past p = 1.00: Section naturally unpins and scrolls forward into the next section (Footer).
  // --------------------------------------------------------------------------
  const renderUnifiedAnimation = useCallback((p: number) => {
    const numCards = FEATURED_PROPERTIES.length;

    if (p <= 0.18) {
      // PHASE 1: 3 IMAGES ANIMATE UPWARD FROM THE BOTTOM WHILE SECTION IS FIXED
      const tEnter = Math.min(1.0, Math.max(0, p / 0.18));
      const easeEnter = 1 - Math.pow(1 - tEnter, 3); // Cubic ease-out
      const translateY = (1 - easeEnter) * 100;

      if (bannerContainerRef.current) {
        bannerContainerRef.current.style.opacity = Math.min(1.0, tEnter * 3.5).toFixed(3);
        bannerContainerRef.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0)`;
        bannerContainerRef.current.style.pointerEvents = tEnter > 0.4 ? "auto" : "none";
      }

      if (leftPanelRef.current) {
        leftPanelRef.current.style.opacity = "0";
        leftPanelRef.current.style.transform = "translate3d(-60px, 0, 0)";
        leftPanelRef.current.style.pointerEvents = "none";
      }

      if (rightColumnContainerRef.current) {
        rightColumnContainerRef.current.style.opacity = "0";
        rightColumnContainerRef.current.style.pointerEvents = "none";
      }

      setActivePropertyIndex(0);
      if (galleryTrackRef.current) {
        galleryTrackRef.current.style.transform = "translate3d(0, 0, 0)";
      }
    } else if (p <= 0.38) {
      // PHASE 2: HOLD & TRANSITION FROM 3 FULL-WIDTH IMAGES TO SPLIT LAYOUT
      if (p <= 0.24) {
        // Hold 3 images fully displayed edge-to-edge
        if (bannerContainerRef.current) {
          bannerContainerRef.current.style.opacity = "1";
          bannerContainerRef.current.style.transform = "translate3d(0, 0, 0)";
          bannerContainerRef.current.style.pointerEvents = "auto";
        }
        if (leftPanelRef.current) {
          leftPanelRef.current.style.opacity = "0";
          leftPanelRef.current.style.transform = "translate3d(-60px, 0, 0)";
          leftPanelRef.current.style.pointerEvents = "none";
        }
        if (rightColumnContainerRef.current) {
          rightColumnContainerRef.current.style.opacity = "0";
          rightColumnContainerRef.current.style.pointerEvents = "none";
        }
        setActivePropertyIndex(0);
      } else {
        // Shift rightward and reveal left editorial panel
        const tShift = (p - 0.24) / 0.14;
        const easeShift = tShift * tShift * (3 - 2 * tShift);

        if (bannerContainerRef.current) {
          bannerContainerRef.current.style.opacity = (1 - easeShift * 0.95).toFixed(3);
          bannerContainerRef.current.style.transform = `translate3d(${(easeShift * 48).toFixed(2)}vw, 0, 0)`;
          bannerContainerRef.current.style.pointerEvents = easeShift > 0.8 ? "none" : "auto";
        }

        if (leftPanelRef.current) {
          leftPanelRef.current.style.opacity = easeShift.toFixed(3);
          leftPanelRef.current.style.transform = `translate3d(${((-1 + easeShift) * 60).toFixed(2)}px, 0, 0)`;
          leftPanelRef.current.style.pointerEvents = easeShift > 0.5 ? "auto" : "none";
        }

        if (rightColumnContainerRef.current) {
          rightColumnContainerRef.current.style.opacity = easeShift.toFixed(3);
          rightColumnContainerRef.current.style.pointerEvents = easeShift > 0.5 ? "auto" : "none";
        }

        setActivePropertyIndex(0);
        if (galleryTrackRef.current) {
          galleryTrackRef.current.style.transform = "translate3d(0, 0, 0)";
        }
      }
    } else {
      // PHASE 3: RIGHT-SIDE VERTICAL SCRUB & LIVE DATA MATRIX (p: 0.38 -> 1.00)
      if (bannerContainerRef.current) {
        bannerContainerRef.current.style.opacity = "0";
        bannerContainerRef.current.style.pointerEvents = "none";
      }

      if (leftPanelRef.current) {
        leftPanelRef.current.style.opacity = "1";
        leftPanelRef.current.style.transform = "translate3d(0, 0, 0)";
        leftPanelRef.current.style.pointerEvents = "auto";
      }

      if (rightColumnContainerRef.current) {
        rightColumnContainerRef.current.style.opacity = "1";
        rightColumnContainerRef.current.style.pointerEvents = "auto";
      }

      // Normalized scrub progress across the 6 vertical cards
      const scrubT = Math.min(1.0, Math.max(0, (p - 0.38) / (0.90 - 0.38)));
      const currentIdx = Math.min(
        numCards - 1,
        Math.max(0, Math.floor(scrubT * numCards))
      );
      setActivePropertyIndex(currentIdx);

      // Smooth vertical scrub translation
      if (galleryTrackRef.current) {
        const totalTravelPercentage = (numCards - 1) * 100;
        const currentYPercentage = scrubT * totalTravelPercentage;
        galleryTrackRef.current.style.transform = `translate3d(0, -${currentYPercentage.toFixed(2)}%, 0)`;
      }
    }
  }, []);

  // --------------------------------------------------------------------------
  // GSAP VELOCITY-DAMPED SMOOTH SCROLL SCRUBBER
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

      const rawProgress = Math.min(
        Math.max((scrollTop - trackTop) / maxScroll, 0),
        1
      );

      // GSAP power2.out interpolation delivers butter-smooth momentum
      gsap.to(progressProxy.current, {
        value: rawProgress,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          renderUnifiedAnimation(progressProxy.current.value);
        },
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize immediately at current scroll position
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      gsap.killTweensOf(progressProxy.current);
    };
  }, [scrollContainerRef, renderUnifiedAnimation]);

  // Jump directly to a property when clicking its name in the list
  const handleJumpToProperty = (index: number) => {
    const container = scrollContainerRef?.current;
    const track = containerRef.current;
    if (!container || !track) return;

    scifiAudio.playHoloBeep(880, 0.08);

    const clientHeight = container.clientHeight;
    const trackHeight = track.offsetHeight;
    const maxScroll = trackHeight - clientHeight;
    if (maxScroll <= 0) return;

    // Convert property index to target scroll progress (sits within Phase 3 range: 0.38 -> 0.90)
    const startP = 0.38;
    const endP = 0.88;
    const targetP = startP + (index / (FEATURED_PROPERTIES.length - 1)) * (endP - startP);
    const targetScrollTop = track.offsetTop + targetP * maxScroll;

    container.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  };

  const activeProperty = FEATURED_PROPERTIES[activePropertyIndex];

  return (
    <section className="relative w-full bg-[#FCF8F3] text-[#012169] select-none font-['Condor_Medium_Condensed_Italic',sans-serif] italic">
      {/* Scroll track height: keeps section pinned in viewport while animations execute */}
      <div ref={containerRef} className="relative h-[600vh]">
        <div
          ref={viewportRef}
          className="sticky top-0 h-[calc(100vh-53px)] w-full overflow-hidden flex flex-col justify-between bg-[#FCF8F3]"
        >
          {/* ==================================================================
              STAGE 1: 3 MASSIVE FULL-SCREEN IMAGES FILLING ENTIRE SCREEN WIDTH
              Animates UPWARD from the bottom while section remains fixed in viewport
              ================================================================== */}
          <div
            ref={bannerContainerRef}
            style={{
              transform: "translate3d(0, 100%, 0)",
              opacity: 0,
            }}
            className="absolute inset-0 z-30 w-full h-full flex flex-row items-stretch overflow-hidden pointer-events-auto select-none"
          >
            {/* Panel 1: Left Third of the Screen */}
            <div
              ref={bannerCol1Ref}
              onClick={() => {
                scifiAudio.playHoloBeep(920, 0.1);
                setSelectedDossier(FEATURED_PROPERTIES[0]);
              }}
              className="relative w-1/3 h-full overflow-hidden border-r border-white/20 cursor-pointer group select-none bg-[#0E1B33]"
            >
              <img
                src={FEATURED_PROPERTIES[0].image}
                alt={FEATURED_PROPERTIES[0].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#012169]/85 via-black/20 to-transparent flex flex-col justify-between p-6 sm:p-10 text-white">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-[#012169]/80 backdrop-blur-md border border-white/25">
                    {FEATURED_PROPERTIES[0].category}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/15">
                    {FEATURED_PROPERTIES[0].valuation}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black uppercase leading-tight tracking-tight text-white">
                    {FEATURED_PROPERTIES[0].name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Panel 2: Center Third of the Screen */}
            <div
              ref={bannerCol2Ref}
              onClick={() => {
                scifiAudio.playHoloBeep(920, 0.1);
                setSelectedDossier(FEATURED_PROPERTIES[1]);
              }}
              className="relative w-1/3 h-full overflow-hidden border-r border-white/20 cursor-pointer group select-none bg-[#0E1B33]"
            >
              <img
                src={FEATURED_PROPERTIES[1].image}
                alt={FEATURED_PROPERTIES[1].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#012169]/85 via-black/20 to-transparent flex flex-col justify-between p-6 sm:p-10 text-white">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-[#012169]/80 backdrop-blur-md border border-white/25">
                    {FEATURED_PROPERTIES[1].category}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/15">
                    {FEATURED_PROPERTIES[1].valuation}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black uppercase leading-tight tracking-tight text-white">
                    {FEATURED_PROPERTIES[1].name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Panel 3: Right Third of the Screen */}
            <div
              ref={bannerCol3Ref}
              onClick={() => {
                scifiAudio.playHoloBeep(920, 0.1);
                setSelectedDossier(FEATURED_PROPERTIES[2]);
              }}
              className="relative w-1/3 h-full overflow-hidden cursor-pointer group select-none bg-[#0E1B33]"
            >
              <img
                src={FEATURED_PROPERTIES[2].image}
                alt={FEATURED_PROPERTIES[2].title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#012169]/85 via-black/20 to-transparent flex flex-col justify-between p-6 sm:p-10 text-white">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-[#012169]/80 backdrop-blur-md border border-white/25">
                    {FEATURED_PROPERTIES[2].category}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/15">
                    {FEATURED_PROPERTIES[2].valuation}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black uppercase leading-tight tracking-tight text-white">
                    {FEATURED_PROPERTIES[2].name}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================================
              STAGE 2 & 3: EDITORIAL SPLIT VIEW (Kharkiv Modernism Architecture)
              ================================================================== */}
          <div className="relative w-full h-full flex flex-col justify-between px-4 sm:px-8 lg:px-14 py-4 sm:py-6 z-20">
            {/* Center Stage: Two-Column Editorial Layout */}
            <div className="relative w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 my-auto">
              {/* ----------------------------------------------------------------
                  LEFT COLUMN: EDITORIAL IDENTITY & NAVIGATION MATRIX
                  ---------------------------------------------------------------- */}
              <div
                ref={leftPanelRef}
                style={{ opacity: 0 }}
                className="w-full lg:w-[48%] flex flex-col justify-between h-full py-4 sm:py-8 lg:pr-8"
              >
                {/* Top Section: Title & Dynamic Counter */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tight text-[#012169] leading-[0.92]">
                        Commercial <br />
                        <span className="text-[#A10728]">Archives.</span>
                      </h1>
                    </div>
                  </div>

                  {/* Action CTA: Explore Dossier */}
                  <div className="mt-6 sm:mt-10">
                    <button
                      onClick={() => {
                        scifiAudio.playHoloBeep(920, 0.1);
                        setSelectedDossier(activeProperty);
                      }}
                      className="group inline-flex items-center gap-3 text-sm sm:text-base font-black uppercase tracking-[0.16em] text-[#012169] hover:text-[#A10728] transition-colors cursor-pointer border-b-2 border-[#012169]/20 hover:border-[#A10728] pb-1.5"
                    >
                      <span>Explore Dossier</span>
                      <ArrowRight className="h-4 w-4 text-[#A10728] transition-transform duration-300 group-hover:translate-x-1.5" />
                    </button>
                  </div>
                </div>

                {/* Middle Section: [06] Featured & Name Matrix (Reference Layout) */}
                <div className="mt-6 sm:mt-12 pt-6 sm:pt-8 border-t border-[#012169]/15">
                  <div className="grid grid-cols-2 gap-4 sm:gap-8">
                    <div>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#012169]/50 block mb-2">
                        [{FEATURED_PROPERTIES.length.toString().padStart(2, "0")}] Featured:
                      </span>
                      <p className="text-xs sm:text-sm font-medium text-[#012169]/70 leading-relaxed max-w-[200px]">
                        Prime trophy towers, enterprise tech campuses, and intermodal distribution nodes.
                      </p>
                    </div>

                    <div>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#012169]/50 block mb-2">
                        Name:
                      </span>
                      <ul className="space-y-1.5">
                        {FEATURED_PROPERTIES.map((item, idx) => {
                          const isActive = idx === activePropertyIndex;
                          return (
                            <li
                              key={item.id}
                              onClick={() => handleJumpToProperty(idx)}
                              className={`text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition-all duration-300 flex items-center gap-2 ${
                                isActive
                                  ? "font-black text-[#012169] translate-x-1"
                                  : "font-semibold text-[#012169]/40 hover:text-[#012169]/80"
                              }`}
                            >
                              {isActive && (
                                <span className="h-1.5 w-1.5 rounded-full bg-[#A10728] animate-pulse" />
                              )}
                              <span>{item.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------
                  RIGHT COLUMN: VERTICAL GALLERY SCRUB (Reference: Vertical Swapping)
                  ---------------------------------------------------------------- */}
              <div
                ref={rightColumnContainerRef}
                style={{ opacity: 0 }}
                className="w-full lg:w-[50%] h-[68vh] sm:h-[76vh] lg:h-[84vh] relative overflow-hidden rounded-[24px] sm:rounded-[32px]"
              >
                {/* Scroll Track moving vertically inside the window */}
                <div
                  ref={galleryTrackRef}
                  className="w-full h-full relative transition-transform duration-75 ease-out will-change-transform"
                >
                  {FEATURED_PROPERTIES.map((prop, idx) => (
                    <div
                      key={prop.id}
                      onClick={() => {
                        scifiAudio.playHoloBeep(920, 0.1);
                        setSelectedDossier(prop);
                      }}
                      style={{
                        top: `${idx * 100}%`,
                      }}
                      className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-2 sm:p-4 cursor-pointer group"
                    >
                      {/* Main Card Media Container */}
                      <div className="relative w-full h-full max-w-lg aspect-[3/4] sm:aspect-[4/5] rounded-[22px] sm:rounded-[28px] overflow-hidden border-[2px] border-[#012169]/20 bg-[#0E1B33] shadow-[0_25px_60px_rgba(1,33,105,0.22)] group-hover:shadow-[0_30px_75px_rgba(161,7,40,0.35)] group-hover:border-[#A10728] transition-all duration-500">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Top Overlay Badge */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.18em] bg-[#012169]/85 text-[#FCF8F3] backdrop-blur-md border border-white/20">
                            {prop.category}
                          </span>

                          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white bg-black/60 backdrop-blur-md border border-white/15">
                            {prop.valuation}
                          </span>
                        </div>

                        {/* Bottom Overlay Info Banner */}
                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 bg-gradient-to-t from-[#012169]/90 via-[#012169]/60 to-transparent flex items-end justify-between z-10 text-white">
                          <div className="max-w-[80%]">
                            <h3 className="text-xl sm:text-2xl font-black uppercase text-white leading-tight">
                              {prop.title}
                            </h3>
                          </div>

                          <div className="h-9 w-9 rounded-full bg-white/20 group-hover:bg-[#A10728] text-white flex items-center justify-center transition-colors shadow-md">
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          DETAILED COMMERCIAL PROPERTY DOSSIER MODAL
          Opens when user clicks "Explore Dossier" or any image card
          ==================================================================== */}
      <AnimatePresence>
        {selectedDossier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0E1B33]/85 backdrop-blur-md"
            onClick={() => setSelectedDossier(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[28px] border-[2px] border-[#012169]/30 bg-[#0E1B33] text-[#FCF8F3] shadow-2xl flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDossier(null)}
                className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-white/20 text-white hover:bg-[#A10728] transition-all cursor-pointer backdrop-blur-md shadow-md"
                title="Close Dossier"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Column: Image Showcase */}
              <div className="relative md:w-[48%] aspect-[4/3] md:aspect-auto md:min-h-[540px] bg-black overflow-hidden">
                <img
                  src={selectedDossier.image}
                  alt={selectedDossier.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white leading-tight">
                      {selectedDossier.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Right Column: Asset Specifications & Details */}
              <div className="md:w-[52%] p-6 sm:p-8 flex flex-col justify-between bg-[#0E1B33] overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-[#A10728] animate-pulse" />
                    <span className="text-xs font-bold text-[#A10728] tracking-[0.2em] uppercase">
                      {selectedDossier.category}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight mb-2">
                    {selectedDossier.title}
                  </h3>

                  <p className="text-sm font-medium text-white/80 leading-relaxed mb-6 border-l-2 border-[#A10728] pl-3 py-1">
                    {selectedDossier.leadText}
                  </p>

                  {/* Telemetry Matrix Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {selectedDossier.specs.map((spec, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col"
                      >
                        <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider">
                          {spec.label}
                        </span>
                        <span className="text-base font-mono font-bold text-[#FCF8F3] truncate">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Key Highlights */}
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                      Key Highlights:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDossier.features.map((feat, fIdx) => (
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
                <div className="pt-4 border-t border-white/15 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedDossier(null)}
                    className="px-5 py-2.5 rounded-full bg-[#A10728] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#720808] transition-all cursor-pointer shadow-md"
                  >
                    Return to Portfolio
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

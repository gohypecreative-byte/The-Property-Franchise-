// src/components/ui/WebsiteDetailsSection.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  MapPin,
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
  const verticalCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightColumnContainerRef = useRef<HTMLDivElement>(null);

  // Progress and state
  const progressProxy = useRef<{ value: number }>({ value: 0 });
  const [activePropertyIndex, setActivePropertyIndex] = useState<number>(0);
  const [selectedDossier, setSelectedDossier] = useState<PropertyDossier | null>(null);

  // Automatic entrance animation tracking (triggers automatically on section entry without scrolling)
  const autoEntranceProxy = useRef<{ value: number }>({ value: 0 });
  const autoEntranceDone = useRef<boolean>(false);
  const hasUserScrolled = useRef<boolean>(false);

  // --------------------------------------------------------------------------
  // UNIFIED STICKY SCROLL ANIMATION CORE
  // 1. Entrance: 3 images animate UPWARD from the bottom automatically without requiring scrolling.
  // 2. (p = 0.00 -> 0.16): 3 images hold in place filling 100% of the screen width.
  // 3. (p = 0.16 -> 0.36): 3 images slide rightward into right column; Left panel reveals.
  // 4. (p = 0.36 -> 0.90): Right column vertically scrubs through the 6 properties.
  // 5. (p = 0.90 -> 1.00): Animation finishes cleanly.
  // Past p = 1.00: Section naturally unpins and scrolls forward into the next section (Footer).
  // --------------------------------------------------------------------------
  const renderUnifiedAnimation = useCallback((p: number) => {
    const numCards = FEATURED_PROPERTIES.length;

    if (p <= 0.16) {
      // PHASE 1: 3 FULL-WIDTH IMAGES IN PLACE (Entered automatically on section visit)
      if (bannerContainerRef.current) {
        if (autoEntranceDone.current || hasUserScrolled.current) {
          bannerContainerRef.current.style.opacity = "1";
          bannerContainerRef.current.style.transform = "translate3d(0, 0, 0)";
          bannerContainerRef.current.style.pointerEvents = "auto";
        }
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
      for (let idx = 0; idx < numCards; idx++) {
        const cardEl = verticalCardRefs.current[idx];
        if (!cardEl) continue;
        if (idx === 0) {
          cardEl.style.transform = "translate3d(0, 0, 0)";
          cardEl.style.opacity = "1";
          cardEl.style.pointerEvents = "auto";
        } else {
          cardEl.style.transform = "translate3d(0, 102%, 0)";
          cardEl.style.opacity = "0";
          cardEl.style.pointerEvents = "none";
        }
      }
    } else if (p <= 0.36) {
      // PHASE 2: SMOOTH SHIFT RIGHTWARD AND REVEAL LEFT EDITORIAL PANEL
      const tShift = (p - 0.16) / 0.20;
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
      for (let idx = 0; idx < numCards; idx++) {
        const cardEl = verticalCardRefs.current[idx];
        if (!cardEl) continue;
        if (idx === 0) {
          cardEl.style.transform = "translate3d(0, 0, 0)";
          cardEl.style.opacity = "1";
          cardEl.style.pointerEvents = "auto";
        } else {
          cardEl.style.transform = "translate3d(0, 102%, 0)";
          cardEl.style.opacity = "0";
          cardEl.style.pointerEvents = "none";
        }
      }
    } else {
      // PHASE 3: RIGHT-SIDE VERTICAL SCRUB & LIVE DATA MATRIX (p: 0.36 -> 1.00)
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
      const scrubT = Math.min(1.0, Math.max(0, (p - 0.36) / (0.90 - 0.36)));
      const floatIndex = scrubT * (numCards - 1);
      const currentIdx = Math.min(
        numCards - 1,
        Math.max(0, Math.round(floatIndex))
      );
      setActivePropertyIndex(currentIdx);

      // Seamless stacked image transition: each new image smoothly transitions directly over the previous one
      for (let idx = 0; idx < numCards; idx++) {
        const cardEl = verticalCardRefs.current[idx];
        if (!cardEl) continue;

        if (idx === 0) {
          // Base card stays in place
          cardEl.style.transform = "translate3d(0, 0, 0)";
          cardEl.style.opacity = "1";
          cardEl.style.pointerEvents = "auto";
        } else {
          if (floatIndex < idx - 1) {
            // Waiting below
            cardEl.style.transform = "translate3d(0, 102%, 0)";
            cardEl.style.opacity = "0";
            cardEl.style.pointerEvents = "none";
          } else if (floatIndex <= idx) {
            // Actively sliding up from bottom directly OVER previous card
            const t = floatIndex - (idx - 1);
            const easeT = t * t * (3 - 2 * t);
            const translateY = (1 - easeT) * 100;
            cardEl.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0)`;
            cardEl.style.opacity = "1";
            cardEl.style.pointerEvents = "auto";
          } else {
            // Fully in place
            cardEl.style.transform = "translate3d(0, 0, 0)";
            cardEl.style.opacity = "1";
            cardEl.style.pointerEvents = "auto";
          }
        }
      }
    }
  }, []);

  // --------------------------------------------------------------------------
  // AUTOMATIC UPWARD ENTRANCE ANIMATION (TRIGGERED UPON ENTERING SECTION)
  // --------------------------------------------------------------------------
  useEffect(() => {
    scifiAudio.playHoloBeep(850, 0.08);

    const autoTween = gsap.fromTo(
      autoEntranceProxy.current,
      { value: 0 },
      {
        value: 1,
        duration: 1.15,
        ease: "power3.out",
        delay: 0.05,
        onUpdate: () => {
          if (!hasUserScrolled.current && bannerContainerRef.current) {
            const t = autoEntranceProxy.current.value;
            const translateY = (1 - t) * 100;
            bannerContainerRef.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0)`;
            bannerContainerRef.current.style.opacity = Math.min(1.0, t * 1.8).toFixed(3);
            bannerContainerRef.current.style.pointerEvents = t > 0.4 ? "auto" : "none";
          }
        },
        onComplete: () => {
          autoEntranceDone.current = true;
          if (!hasUserScrolled.current && bannerContainerRef.current) {
            bannerContainerRef.current.style.transform = "translate3d(0, 0, 0)";
            bannerContainerRef.current.style.opacity = "1";
            bannerContainerRef.current.style.pointerEvents = "auto";
          }
        },
      }
    );

    return () => {
      autoTween.kill();
    };
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

      if (rawProgress > 0.005) {
        hasUserScrolled.current = true;
        autoEntranceDone.current = true;
      }

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

    // Convert property index to target scroll progress (sits within Phase 3 range: 0.36 -> 0.90)
    const startP = 0.36;
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#012169]/85 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#012169]/85 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#012169]/85 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
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
          <div className="relative w-full h-full flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-2 sm:py-3 z-20">
            {/* Center Stage: Two-Column Editorial Layout */}
            <div className="relative w-full flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 my-auto">
              {/* ----------------------------------------------------------------
                  LEFT COLUMN: EDITORIAL IDENTITY & PROPERTY DOSSIER DETAILS
                  ---------------------------------------------------------------- */}
              <div
                ref={leftPanelRef}
                style={{ opacity: 0 }}
                className="w-full lg:w-[46%] flex flex-col justify-center h-auto py-2 sm:py-3 lg:pr-6 select-none"
              >
                {/* Header: Section Title & Active Property Index */}
                <div className="flex items-end justify-between border-b border-[#012169]/15 pb-2.5 mb-3">
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black uppercase tracking-tight text-[#012169] leading-[0.92]">
                      Commercial <br />
                      <span className="text-[#A10728]">Archives.</span>
                    </h1>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#A10728] uppercase block">
                      [{activeProperty.index} / 06]
                    </span>
                    <span className="text-[10px] font-semibold text-[#012169]/50 uppercase tracking-widest">
                      Commercial Assets
                    </span>
                  </div>
                </div>

                {/* Synchronized Property Details Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProperty.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-3"
                  >
                    {/* Property Title & Location */}
                    <div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-[#012169] leading-tight">
                        {activeProperty.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-[13px] font-bold text-[#A10728] uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{activeProperty.location}</span>
                        <span className="text-[#012169]/30">•</span>
                        <span className="text-[#012169]/70">{activeProperty.tenancy}</span>
                      </div>
                    </div>

                    {/* Property Detailed Description */}
                    <p className="text-xs sm:text-[13px] text-[#012169]/80 leading-relaxed font-medium">
                      {activeProperty.description}
                    </p>

                    {/* Property Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 pt-0.5">
                      {activeProperty.specs.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2 sm:p-2.5 rounded-xl border border-[#012169]/10 bg-[#012169]/[0.03] flex flex-col justify-center"
                        >
                          <span className="text-[10px] text-[#012169]/55 uppercase font-bold tracking-wider truncate">
                            {spec.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#012169] truncate">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Key Architectural Highlights */}
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#012169]/50 block mb-1">
                        Key Architectural Highlights:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeProperty.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#012169]/5 text-[#012169] border border-[#012169]/10"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action CTA: Explore Full Dossier */}
                    <div className="pt-1.5">
                      <button
                        onClick={() => {
                          scifiAudio.playHoloBeep(920, 0.1);
                          setSelectedDossier(activeProperty);
                        }}
                        className="group inline-flex items-center gap-2.5 text-xs sm:text-[13px] font-black uppercase tracking-[0.16em] text-[#012169] hover:text-[#A10728] transition-colors cursor-pointer border-b-2 border-[#012169]/20 hover:border-[#A10728] pb-1"
                      >
                        <span>Explore Full Dossier</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#A10728] transition-transform duration-300 group-hover:translate-x-1.5" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* ----------------------------------------------------------------
                  RIGHT COLUMN: SEAMLESS STACKED CARD GALLERY (Zero Gaps, Prominent Size)
                  Each new image smoothly transitions directly over the previous one
                  ---------------------------------------------------------------- */}
              <div
                ref={rightColumnContainerRef}
                style={{ opacity: 0 }}
                className="w-full lg:w-[53%] h-[68vh] sm:h-[74vh] lg:h-[78vh] xl:h-[80vh] relative overflow-hidden rounded-[26px] sm:rounded-[34px] border-[2px] border-[#012169]/20 bg-[#0E1B33] shadow-[0_25px_65px_rgba(1,33,105,0.25)] select-none"
              >
                {FEATURED_PROPERTIES.map((prop, idx) => (
                  <div
                    key={prop.id}
                    ref={(el) => {
                      verticalCardRefs.current[idx] = el;
                    }}
                    onClick={() => {
                      scifiAudio.playHoloBeep(920, 0.1);
                      setSelectedDossier(prop);
                    }}
                    style={{
                      zIndex: 10 + idx,
                      willChange: "transform, opacity",
                    }}
                    className="absolute inset-0 w-full h-full overflow-hidden cursor-pointer group shadow-[0_-25px_50px_rgba(1,33,105,0.35)]"
                  >
                    {/* Main Image Frame (Full Size, Edge-to-Edge Without Gaps) */}
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Bottom Overlay Info Banner */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 bg-gradient-to-t from-[#012169]/95 via-[#012169]/55 to-transparent z-10 text-white">
                      <h3 className="text-xl sm:text-3xl font-black uppercase text-white leading-tight">
                        {prop.title}
                      </h3>
                    </div>
                  </div>
                ))}
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
                        <span className="text-base font-bold text-[#FCF8F3] truncate">
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

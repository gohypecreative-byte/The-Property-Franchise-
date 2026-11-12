// src/components/ui/WebsiteDetailsSection.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ArrowRight, MapPin, X } from "lucide-react";
import { scifiAudio } from "@/lib/audio";

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

interface StageLayout {
  vw: number;
  vh: number;
  isMobile: boolean;
  colW: number; // width of one strip column
  panelW: number; // final width of the light editorial canvas
  panelH: number; // final height of the light canvas (mobile stacks vertically)
  stackLeft: number;
  stackTop: number;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Vertical scroll distance per property swap (fraction of the stage height)
const SCROLL_PER_ITEM = 0.75;

export function WebsiteDetailsSection({
  scrollContainerRef,
}: WebsiteDetailsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Intro choreography
  const stripRef = useRef<HTMLDivElement>(null);
  const stripColRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const titleLineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const metaRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll-driven image stack (right column)
  const stackRef = useRef<HTMLDivElement>(null);
  const stackItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stackImgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  const layoutRef = useRef<StageLayout | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const introDoneRef = useRef(false);
  const targetFloatRef = useRef(0);
  const currentFloatRef = useRef(0);

  const [stage, setStage] = useState({
    top: 0,
    height: 0,
    isMobile: false,
    panelW: 0,
    panelH: 0,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDossier, setSelectedDossier] =
    useState<PropertyDossier | null>(null);

  const total = FEATURED_PROPERTIES.length;

  // --------------------------------------------------------------------------
  // LAYOUT
  // Stage sits below the modal's sticky header. Desktop: light canvas takes
  // the left two thirds, images the right third. Mobile: canvas on top,
  // images below.
  // --------------------------------------------------------------------------
  const measure = useCallback(() => {
    const container = scrollContainerRef?.current;
    const header = container?.querySelector<HTMLElement>("[data-modal-header]");
    const headerH = header ? header.offsetHeight : 0;
    const vw = container ? container.clientWidth : window.innerWidth;
    const vh =
      (container ? container.clientHeight : window.innerHeight) - headerH;
    const isMobile = vw < 768;

    const colW = isMobile ? vw / 2 : vw / 3;
    const panelW = isMobile ? vw : Math.round(vw * (vw < 1100 ? 0.58 : 2 / 3));
    const panelH = isMobile ? Math.round(vh * 0.56) : vh;

    layoutRef.current = {
      vw,
      vh,
      isMobile,
      colW,
      panelW,
      panelH,
      stackLeft: isMobile ? 0 : panelW,
      stackTop: isMobile ? panelH : 0,
    };

    if (trackRef.current) {
      trackRef.current.style.height = `${vh + (total - 1) * vh * SCROLL_PER_ITEM + headerH}px`;
    }
    setStage((prev) =>
      prev.top === headerH &&
      prev.height === vh &&
      prev.isMobile === isMobile &&
      prev.panelW === panelW &&
      prev.panelH === panelH
        ? prev
        : { top: headerH, height: vh, isMobile, panelW, panelH },
    );
  }, [scrollContainerRef, total]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // --------------------------------------------------------------------------
  // AUTOMATIC INTRO (plays on open, no scrolling needed)
  // 1. Strip columns rise from the bottom, staggered, on navy
  // 2. Light canvas sweeps in from the left, pushing the strip right
  // 3. Title lines rise in, then meta, list and details fade up
  // --------------------------------------------------------------------------
  useEffect(() => {
    const L = layoutRef.current;
    if (!L || !stage.height) return;
    if (timelineRef.current) return; // build once; resizes snap to the end state

    scifiAudio.playHoloBeep(850, 0.08);
    const cols = stripColRefs.current.filter(Boolean);
    const lines = titleLineRefs.current.filter(Boolean);
    const metas = metaRefs.current.filter(Boolean);

    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        introDoneRef.current = true;
      },
    });

    // Start states applied immediately so nothing flashes before the timeline runs
    gsap.set(cols, { yPercent: 100 });
    gsap.set(lines, { yPercent: 110 });
    gsap.set(metas, { opacity: 0, y: 14 });
    gsap.set(stackRef.current, { opacity: 0 });
    gsap.set(stripRef.current, { x: 0, y: 0, opacity: 1 });

    tl.fromTo(
        cols,
        { yPercent: 100 },
        { yPercent: 0, duration: 1.4, ease: "power3.out", stagger: 0.16 },
      )
      .addLabel("push", "+=0.45");

    if (L.isMobile) {
      tl.fromTo(
        panelRef.current,
        { height: 0 },
        { height: L.panelH, duration: 1.5, ease: "power3.inOut" },
        "push",
      ).to(
        stripRef.current,
        { y: L.panelH, duration: 1.5, ease: "power3.inOut" },
        "push",
      );
    } else {
      tl.fromTo(
        panelRef.current,
        { width: 0 },
        { width: L.panelW, duration: 1.6, ease: "power3.inOut" },
        "push",
      ).to(
        stripRef.current,
        { x: L.panelW, duration: 1.6, ease: "power3.inOut" },
        "push",
      );
    }

    tl.call(() => scifiAudio.playHoloBeep(920, 0.05), [], "push+=0.2")
      .set(stackRef.current, { opacity: 1 }, "push+=1.6")
      .set(stripRef.current, { opacity: 0 }, "push+=1.65")
      .to(
        lines,
        { yPercent: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 },
        "push+=0.95",
      )
      .to(
        metas,
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", stagger: 0.07 },
        "push+=1.35",
      );

    timelineRef.current = tl;
    return () => {
      tl.kill();
      timelineRef.current = null;
    };
  }, [stage.height]);

  // Snap to the end layout after a resize once the intro has finished
  useEffect(() => {
    const L = layoutRef.current;
    if (!L || !introDoneRef.current) return;
    if (panelRef.current) {
      panelRef.current.style.width = L.isMobile ? "100%" : `${L.panelW}px`;
      panelRef.current.style.height = L.isMobile ? `${L.panelH}px` : "100%";
    }
  }, [stage]);

  // --------------------------------------------------------------------------
  // SCROLL: each next property wipes up from the bottom over the last
  // --------------------------------------------------------------------------
  useEffect(() => {
    const container = scrollContainerRef?.current;
    const target: HTMLElement | Window = container || window;

    const handleScroll = () => {
      const track = trackRef.current;
      const L = layoutRef.current;
      if (!track || !L) return;
      const rootTop = container ? container.getBoundingClientRect().top : 0;
      const scrolled = Math.max(0, rootTop - track.getBoundingClientRect().top);
      targetFloatRef.current = Math.min(
        total - 1,
        scrolled / (L.vh * SCROLL_PER_ITEM),
      );

      // Scrolling during the intro fast-forwards it
      const tl = timelineRef.current;
      if (scrolled > 4 && tl && !introDoneRef.current && tl.timeScale() === 1) {
        tl.timeScale(4);
      }
    };

    let rafId = 0;
    let lastIdx = -1;
    const tick = () => {
      const diff = targetFloatRef.current - currentFloatRef.current;
      currentFloatRef.current += Math.abs(diff) < 0.0005 ? diff : diff * 0.1;
      const f = currentFloatRef.current;

      for (let idx = 1; idx < total; idx++) {
        const item = stackItemRefs.current[idx];
        if (!item) continue;
        const t = smoothstep(clamp01(f - (idx - 1)));
        item.style.clipPath = `inset(${((1 - t) * 100).toFixed(2)}% 0% 0% 0%)`;
        const img = stackImgRefs.current[idx];
        if (img) img.style.transform = `scale(${(1.18 - 0.18 * t).toFixed(4)})`;
      }

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${(f / (total - 1)).toFixed(4)})`;
      }

      const idx = Math.round(f);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setActiveIndex(idx);
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
  }, [scrollContainerRef, total]);

  // Jump to a property when its name is clicked
  const handleJumpToProperty = (index: number) => {
    const container = scrollContainerRef?.current;
    const track = trackRef.current;
    const L = layoutRef.current;
    if (!container || !track || !L) return;
    scifiAudio.playHoloBeep(880, 0.06);
    const trackTop =
      track.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;
    container.scrollTo({
      top: trackTop + index * L.vh * SCROLL_PER_ITEM + 1,
      behavior: "smooth",
    });
  };

  const openDossier = (dossier: PropertyDossier) => {
    scifiAudio.playHoloBeep(920, 0.1);
    setSelectedDossier(dossier);
  };

  useEffect(() => {
    if (!selectedDossier) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDossier(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedDossier]);

  const active = FEATURED_PROPERTIES[activeIndex];
  const stackStyle: React.CSSProperties = stage.isMobile
    ? { left: 0, right: 0, top: stage.panelH, bottom: 0 }
    : { left: stage.panelW, right: 0, top: 0, bottom: 0 };

  return (
    <section className="relative w-full bg-[#0A1633] text-[#012169] select-none">
      <div ref={trackRef} className="relative" style={{ height: "500vh" }}>
        <div
          ref={stageRef}
          className="sticky w-full overflow-hidden bg-[#0A1633]"
          style={{ top: stage.top, height: stage.height || "100vh" }}
        >
          {/* ==================================================================
              IMAGE STRIP (intro): columns rise, then get pushed right
              ================================================================== */}
          <div
            ref={stripRef}
            className="absolute inset-0 z-10 will-change-transform"
            style={{ opacity: 0 }}
          >
            {FEATURED_PROPERTIES.map((prop, idx) => (
              <div
                key={prop.id}
                ref={(el) => {
                  stripColRefs.current[idx] = el;
                }}
                className="absolute top-0 h-full overflow-hidden"
                style={{
                  left: stage.isMobile ? `${idx * 50}%` : `${(idx * 100) / 3}%`,
                  width: stage.isMobile ? "50%" : "33.3334%",
                }}
              >
                <img
                  src={prop.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* ==================================================================
              IMAGE STACK (after intro): scroll wipes each property up
              ================================================================== */}
          <div
            ref={stackRef}
            className="absolute z-10 overflow-hidden"
            style={{ ...stackStyle, opacity: 0 }}
          >
            {FEATURED_PROPERTIES.map((prop, idx) => (
              <div
                key={prop.id}
                ref={(el) => {
                  stackItemRefs.current[idx] = el;
                }}
                onClick={() => openDossier(prop)}
                className="group absolute inset-0 cursor-pointer overflow-hidden"
                style={{
                  zIndex: idx,
                  clipPath: idx === 0 ? undefined : "inset(100% 0% 0% 0%)",
                }}
              >
                <img
                  ref={(el) => {
                    stackImgRefs.current[idx] = el;
                  }}
                  src={prop.image}
                  alt={prop.title}
                  className="h-full w-full object-cover will-change-transform"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-6 bg-gradient-to-t from-[#012169]/70 to-transparent text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="text-[11px] uppercase tracking-[0.14em]">
                    {prop.category}
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]">
                    View Dossier <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ==================================================================
              LIGHT EDITORIAL CANVAS (sweeps in from the left / top)
              ================================================================== */}
          <div
            ref={panelRef}
            className="absolute left-0 top-0 z-20 overflow-hidden bg-[#F7F9FC]"
            style={
              stage.isMobile
                ? { width: "100%", height: 0 }
                : { width: 0, height: "100%" }
            }
          >
            <div
              ref={panelInnerRef}
              className="absolute left-0 top-0 flex flex-col px-4 sm:px-8 pt-5 sm:pt-7 pb-4 sm:pb-6"
              style={{
                width: stage.isMobile ? "100vw" : stage.panelW,
                height: stage.isMobile ? stage.panelH : "100%",
              }}
            >
              {/* Hairline + scroll progress */}
              <div className="absolute inset-x-0 top-0 h-px bg-[#012169]/15">
                <div
                  ref={progressRef}
                  className="h-full w-full origin-left bg-[#E4002B]"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>

              {/* Row 1: title + counter */}
              <div className="flex items-start justify-between gap-6">
                <h2 className="font-medium leading-[0.9] tracking-[-0.01em] text-[#012169] text-[min(13vw,8vh)] md:text-[min(7.4vw,14vh)]">
                  <span className="-mx-[0.15em] block overflow-hidden px-[0.15em] pb-[0.06em]">
                    <span
                      ref={(el) => {
                        titleLineRefs.current[0] = el;
                      }}
                      className="block"
                    >
                      Commercial
                    </span>
                  </span>
                  <span className="-mx-[0.15em] block overflow-hidden px-[0.15em] pb-[0.06em]">
                    <span
                      ref={(el) => {
                        titleLineRefs.current[1] = el;
                      }}
                      className="block"
                    >
                      Archives<span className="text-[#E4002B]">.</span>
                    </span>
                  </span>
                </h2>
                <div
                  ref={(el) => {
                    metaRefs.current[0] = el;
                  }}
                  className="pt-2 text-sm sm:text-base tabular-nums tracking-[0.08em] text-[#012169]"
                >
                  {activeIndex + 1}—{total}
                </div>
              </div>

              {/* Row 2: details (left) + featured list (right) */}
              <div className="mt-[min(40px,4vh)] grid flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 md:gap-12 min-h-0 overflow-hidden">
                <div
                  ref={(el) => {
                    metaRefs.current[1] = el;
                  }}
                  className="flex min-h-0 flex-col"
                >
                  {/* Learn more rule */}
                  <button
                    onClick={() => openDossier(active)}
                    className="group flex w-full max-w-[360px] items-center justify-between border-b border-[#012169]/40 pb-2 text-sm sm:text-base uppercase tracking-[0.1em] text-[#012169] hover:border-[#E4002B] hover:text-[#E4002B] transition-colors cursor-pointer"
                  >
                    Learn More
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  {/* Active property details */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="mt-[min(28px,3vh)] max-w-[560px]"
                    >
                      <h3 className="text-[clamp(24px,3.8vh,40px)] font-semibold leading-tight tracking-[-0.02em] text-[#012169]">
                        {active.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-[clamp(16px,2.4vh,21px)] leading-relaxed text-[#012169]/70">
                        {active.leadText}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Featured list */}
                <div
                  ref={(el) => {
                    metaRefs.current[2] = el;
                  }}
                  className="hidden md:flex gap-8 text-sm lg:text-base tracking-[0.04em]"
                >
                  <span className="text-[#012169]">
                    [{String(total).padStart(2, "0")}] Featured:
                  </span>
                  <div>
                    <span className="block text-[#012169]">Name:</span>
                    <ul className="mt-2 space-y-[min(4px,0.5vh)]">
                      {FEATURED_PROPERTIES.map((prop, idx) => (
                        <li key={prop.id}>
                          <button
                            onClick={() => handleJumpToProperty(idx)}
                            className={`flex items-center gap-2 transition-colors duration-300 cursor-pointer ${
                              idx === activeIndex
                                ? "text-[#012169] font-semibold"
                                : "text-[#012169]/40 hover:text-[#012169]/80"
                            }`}
                          >
                            <span
                              className={`h-1 w-1 rounded-full bg-[#E4002B] transition-opacity duration-300 ${
                                idx === activeIndex
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {prop.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Row 3: footer line */}
              <div
                ref={(el) => {
                  metaRefs.current[3] = el;
                }}
                className="mt-4 flex items-end justify-between text-xs sm:text-sm tracking-[0.06em] text-[#012169]"
              >
                <span>The Property Franchise + Commercial Network</span>
                <span>©2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          DOSSIER VIEWER (portalled so it always centres on screen)
          ==================================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selectedDossier && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                data-lenis-prevent
                onClick={() => setSelectedDossier(null)}
                className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto overscroll-contain bg-[#010B24]/90 p-4 sm:p-8 backdrop-blur-xl"
                role="dialog"
                aria-modal="true"
                aria-label={selectedDossier.title}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative flex w-full max-w-[1000px] max-h-[calc(100vh-48px)] flex-col md:flex-row overflow-hidden bg-white text-[#012169] shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
                >
                  <button
                    onClick={() => setSelectedDossier(null)}
                    className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#012169] shadow-md hover:bg-[#E4002B] hover:text-white transition-colors cursor-pointer"
                    aria-label="Close dossier"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="relative h-56 sm:h-72 md:h-auto md:w-[44%] flex-shrink-0 bg-[#0A1633]">
                    <img
                      src={selectedDossier.image}
                      alt={selectedDossier.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#012169]">
                      {selectedDossier.index} / {String(total).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between overflow-y-auto p-5 sm:p-10">
                    <div>
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#E4002B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" />
                        {selectedDossier.category}
                      </span>
                      <h3 className="mt-4 text-2xl sm:text-[38px] font-bold leading-[1.05] tracking-[-0.01em]">
                        {selectedDossier.title}
                      </h3>
                      <p className="mt-3 flex items-center gap-1.5 text-sm text-[#012169]/60">
                        <MapPin className="h-4 w-4 text-[#E4002B]" />
                        {selectedDossier.location}
                      </p>
                      <p className="mt-6 text-[15px] leading-relaxed text-[#012169]/80">
                        {selectedDossier.description}
                      </p>

                      <dl className="mt-8 grid grid-cols-2 border-t border-[#012169]/10">
                        {selectedDossier.specs.map((spec, i) => (
                          <div
                            key={spec.label}
                            className={`py-4 border-b border-[#012169]/10 ${i % 2 === 0 ? "pr-4 border-r" : "pl-4"}`}
                          >
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#012169]/50">
                              {spec.label}
                            </dt>
                            <dd
                              className={`mt-1 text-lg font-semibold ${i === 0 ? "text-[#E4002B]" : ""}`}
                            >
                              {spec.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {selectedDossier.features.map((feat) => (
                          <span
                            key={feat}
                            className="rounded-full border border-[#012169]/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em]"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                      <button
                        onClick={() => setSelectedDossier(null)}
                        className="rounded-full bg-[#012169] px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-[#E4002B] transition-colors cursor-pointer"
                      >
                        Back to Archives
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

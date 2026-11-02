"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * Real Estate Portfolio & Core Services
 * Directly aligned with The Property Franchise's institutional operations:
 * Commercial brokerage, luxury residential, capital syndication, property management, & franchise licensing
 */
const ITEMS = [
  {
    id: 1,
    number: "01",
    label: "Metropolitan Commercial Tower",
    category: "COMMERCIAL BROKERAGE & ACQUISITIONS",
    color: "#38BDF8", // Cyan
    image: "/commercial_office_tower.jpg",
    valuation: "$185,000,000",
    location: "Metropolis Financial Core",
    service: "Class-A Office Towers & Institutional Brokerage",
    description:
      "Exclusive transaction advisory and institutional placement for a 48-storey column-free commercial skyscraper featuring LEED Platinum infrastructure and 98% leased tenancy.",
    highlight: "98% Tenancy",
  },
  {
    id: 2,
    number: "02",
    label: "Commonwealth Financial Center",
    category: "COMMERCIAL CAPITAL & SYNDICATION",
    color: "#E4002B", // Crimson
    image: "/commercial_business_campus.jpg",
    valuation: "$138,000,000",
    location: "Central Financial Core",
    service: "Institutional Asset Advisory & Private Placements",
    description:
      "Turnkey commercial headquarters brokered for institutional syndicate co-investors, featuring column-free floor plates, redundant power grids, and enterprise fiber infrastructure.",
    highlight: "Private Syndicate",
  },
  {
    id: 3,
    number: "03",
    label: "Pacific Commerce Corporate Campus",
    category: "FRANCHISE OPPORTUNITIES & TERRITORIES",
    color: "#10B981", // Emerald
    image: "/commercial_business_campus.jpg",
    valuation: "$124,500,000",
    location: "Silicon Innovation Corridor",
    service: "Turnkey Commercial Franchise Licensing",
    description:
      "Turnkey franchise opportunity providing accredited partners with exclusive metropolitan territory rights, proprietary commercial valuation technology, and institutional deal flow.",
    highlight: "24 National Hubs",
  },
  {
    id: 4,
    number: "04",
    label: "Continental Freight & Trade Gateway",
    category: "INDUSTRIAL & LOGISTICS ASSETS",
    color: "#8B5CF6", // Electric Purple
    image: "/commercial_logistics_center.jpg",
    valuation: "$96,000,000",
    location: "Intermodal Freight Corridor",
    service: "Supply Chain & Industrial Property Management",
    description:
      "Next-generation intermodal freight facility with 120 cross-dock loading bays, 40-foot clear clearance, and 100% rooftop solar array integration for national distribution.",
    highlight: "12M+ Sq.Ft Managed",
  },
  {
    id: 5,
    number: "05",
    label: "The Regent Luxury Commercial Galleria",
    category: "PROPERTY MANAGEMENT & LEASING",
    color: "#EC4899", // Rose Pink
    image: "/commercial_retail_pavilion.jpg",
    valuation: "$142,000,000",
    location: "Central Flagship Promenade",
    service: "Commercial Asset Stewardship & Operations",
    description:
      "Full-lifecycle commercial property management maximizing net operating income, green-building efficiencies, and premier tenant retention across high-footfall retail promenades.",
    highlight: "99.4% Occupancy",
  },
  {
    id: 6,
    number: "06",
    label: "Sovereign Capital Commercial Fund",
    category: "PROPERTY INVESTMENT & SYNDICATION",
    color: "#06B6D4", // Cyan
    image: "/commercial_office_tower.jpg",
    valuation: "$210,000,000",
    location: "Sovereign Financial District",
    service: "Private Equity Real Estate Syndications",
    description:
      "Structured co-investment vehicles and bilateral syndicate placements offering inflation-hedged commercial yields and long-term capital appreciation for institutional capital.",
    highlight: "15.4% Target IRR",
  },
];

const GAP = 32;

interface ScrollHorizontalGalleryProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ScrollHorizontalGallery({ scrollContainerRef }: ScrollHorizontalGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(440);

  // Responsive item width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setItemWidth(Math.min(300, window.innerWidth - 40));
      } else if (window.innerWidth < 640) {
        setItemWidth(320);
      } else if (window.innerWidth < 768) {
        setItemWidth(380);
      } else {
        setItemWidth(440);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Motion.dev / Framer Motion Scroll Tracking
  // As the user scrolls vertically through containerRef, scrollYProgress advances from 0 to 1
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Translate from first item centered to last item centered (exact motion.dev calculation)
  const totalDistance = (ITEMS.length - 1) * (itemWidth + GAP);
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalDistance]);

  return (
    <section id="horizontal-gallery" className="relative z-20 bg-[#F7F9FC] text-[#012169]">
      {/* 300vh Scroll Container (Exact reference structure: sticks in view, translates horizontally as you scroll) */}
      <div ref={containerRef} className="relative h-[270vh]">
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-4 sm:py-8 md:py-12 overflow-hidden select-none">
          {/* 1. Header Section */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex-shrink-0 z-20">
            {/* Section Title */}
            <div className="text-center pt-1 sm:pt-2 pb-1 sm:pb-2">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
                <span className="text-[#012169]">REAL ESTATE SERVICES</span> <span className="text-[#E4002B]">&</span> <span className="text-[#012169]">SHOWCASE</span>
              </h2>
            </div>
          </div>

          {/* 2. Sticky Horizontal Gallery (Exact motion.dev structure) */}
          <div className="w-full flex-1 flex items-center justify-start overflow-visible my-auto">
            <div
              className="overflow-visible flex items-center justify-start"
              style={{
                width: `${itemWidth}px`,
                margin: "0 auto",
              }}
            >
              <motion.div
                className="flex will-change-transform"
                style={{
                  x,
                  gap: `${GAP}px`,
                }}
              >
                {ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex-shrink-0 h-[370px] sm:h-[460px] md:h-[530px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#0A1633]/15 bg-[#0A1633] shadow-[0_20px_50px_rgba(14,27,51,0.22)] transition-all duration-300 hover:border-[#E4002B] hover:shadow-[0_24px_60px_rgba(228,0,43,0.25)] select-none"
                    style={
                      {
                        width: `${itemWidth}px`,
                        "--item-color": item.color,
                        "--item-image": `url(${item.image})`,
                      } as React.CSSProperties
                    }
                  >
                    {/* High Quality Commercial Real Estate Image */}
                    <img
                      src={item.image}
                      alt={item.label}
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 brightness-[0.98] contrast-[1.03] pointer-events-none"
                    />

                    {/* Gradient Color Overlay */}
                    <div
                      className="absolute inset-0 opacity-80 transition-opacity duration-500 group-hover:opacity-95 pointer-events-none"
                      style={{
                        background: `linear-gradient(to bottom, transparent 35%, rgba(14, 27, 51, 0.65) 60%, #0A1633 130%)`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1633]/95 via-[#0A1633]/40 to-transparent pointer-events-none" />

                    {/* Bottom Content Container */}
                    <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-7 right-4 sm:right-7 z-10 text-[#FFFFFF]">
                      {/* Title */}
                      <h3 className=" text-lg sm:text-2xl md:text-3xl font-bold text-[#FFFFFF] leading-snug group-hover:text-white transition-colors drop-shadow-md">
                        {item.label}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 text-xs sm:text-sm text-[#FFFFFF]/85 line-clamp-2 font-sans leading-relaxed">
                        {item.description}
                      </p>

                      {/* Service & Action Prompt */}
                      <div className="mt-3.5 pt-3 border-t border-[#FFFFFF]/20 flex items-center justify-between">
                        <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-[#F7F9FC] tracking-wider uppercase truncate max-w-[70%] bg-[#012169]/80 px-2 py-0.5 rounded border border-[#012169]/50">
                          {item.service}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform text-[#E4002B] group-hover:text-white">
                          <span>Details</span>
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced Motion Accessibility Fallback */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          #horizontal-gallery .will-change-transform {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

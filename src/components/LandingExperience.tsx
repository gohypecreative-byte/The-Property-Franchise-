// src/components/LandingExperience.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "./ui/Navigation";
import { RealEstateIntroVideo } from "./ui/RealEstateIntroVideo";
import { RealEstateReelsSection } from "./ui/RealEstateReelsSection";
import { WebsiteDetailsSection } from "./ui/WebsiteDetailsSection";
import { ContactSection } from "./ui/ContactSection";
import { Footer } from "./ui/Footer";
import { scifiAudio } from "@/lib/audio";
import { X, Sparkles, Film, Building2, Play, Mail, Undo2 } from "lucide-react";
import Lenis from "lenis";

// Dynamically import SceneCanvas with SSR disabled for safe WebGL initialization
const SceneCanvas = dynamic(
  () => import("./3d/SceneCanvas").then((mod) => mod.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#0E1B33] text-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#A10728] border-t-transparent" />
          <span className="font-mono text-xs tracking-widest uppercase text-[#FAF9F6]/80">
            Initializing Spaceship Flight & Control Bridge...
          </span>
        </div>
      </div>
    ),
  }
);

type ActiveModal = "none" | "reels" | "details" | "contact";

export function LandingExperience() {
  const [activeModal, setActiveModal] = useState<ActiveModal>("none");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Lenis Smooth Scroll Initialization for active modal scroll containers
  useEffect(() => {
    if (activeModal === "none") return;

    let lenisInstance: Lenis | null = null;
    let rafId: number | null = null;

    const timer = setTimeout(() => {
      const container = modalScrollRef.current;
      if (!container) return;

      lenisInstance = new Lenis({
        wrapper: container,
        content: (container.firstElementChild as HTMLElement) || container,
        smoothWheel: true,
        lerp: 0.1,
      });

      function raf(time: number) {
        lenisInstance?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    }, 60);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, [activeModal]);

  // Character 1 (Sue Storm) click -> Commercial Archives & Reels
  const handleReelsClick = () => {
    scifiAudio.playHoloBeep(920, 0.12);
    setActiveModal("reels");
  };

  // Character 2 (Reed Richards) click -> Website Introduction Video
  const handleMainCharacterClick = () => {
    scifiAudio.playHoloBeep(920, 0.12);
    setIsVideoOpen(true);
  };

  // Character 3 (Johnny Storm) click -> Commercial Showcase & Details
  const handlePlanetsClick = () => {
    scifiAudio.playHoloBeep(1000, 0.12);
    setActiveModal("details");
  };

  // Character 4 (Ben Grimm) click -> Contact & Franchise Consultations
  const handleThirdCharacterClick = () => {
    scifiAudio.playHoloBeep(1050, 0.12);
    setActiveModal("contact");
  };

  const handleCloseModal = () => {
    scifiAudio.playHoloBeep(750, 0.08);
    setActiveModal("none");
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#FCF8F3] text-[#012169] selection:bg-[#A10728] selection:text-[#FCF8F3]">
      {/* Global Navigation Bar */}
      <Navigation
        onOpenVideo={() => setIsVideoOpen(true)}
        onReset={handleCloseModal}
      />

      {/* 3D Scene Background (Fixed full-screen Control Bridge view with cinematic depth-of-field) */}
      <SceneCanvas
        scrollProgress={1.0}
        onMainCharacterClick={handleMainCharacterClick}
        onReelsClick={handleReelsClick}
        onPlanetsClick={handlePlanetsClick}
        onThirdCharacterClick={handleThirdCharacterClick}
        isDimmed={activeModal !== "none" || isVideoOpen}
      />

      {/* Cinematic Modal Transition for Character Sections */}
      <AnimatePresence mode="wait">
        {activeModal !== "none" && (
          <motion.div
            key={activeModal}
            ref={modalScrollRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#012169]/50 backdrop-blur-md selection:bg-[#A10728] selection:text-[#FAF9F6]"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Card with Natural Floating Entrance */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative min-h-screen bg-[#FCF8F3] text-[#012169] shadow-2xl flex flex-col justify-between"
            >
              {/* Sticky Top Header Bar (Website Logo & U-turn Return Arrow) */}
              <div
                className="sticky top-0 z-50 flex items-center justify-between border-b border-[#012169]/10 bg-[#FCF8F3]/95 px-3 sm:px-8 py-2.5 sm:py-3.5 backdrop-blur-md shadow-sm gap-2"
              >
                {/* Active Section Identity: Clickable Website Logo (Redirects to Homepage) */}
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCloseModal();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                  title="The Property Franchise - Return to Homepage"
                  aria-label="The Property Franchise - Return to Homepage"
                >
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full overflow-hidden border border-[#012169]/20 shadow-xs flex-shrink-0 group-hover:border-[#A10728] transition-colors">
                    <img
                      src="/tpf_logo.jpg"
                      alt="The Property Franchise Emblem"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Condor_Medium_Condensed_Italic',sans-serif] italic text-xs sm:text-sm font-black tracking-widest text-[#012169] group-hover:text-[#A10728] uppercase leading-tight transition-colors">
                      THE PROPERTY FRANCHISE
                    </span>
                    <span className="font-['Condor_Medium_Condensed_Italic',sans-serif] italic text-[9px] tracking-widest text-[#A10728] uppercase font-bold">
                      COMMERCIAL NETWORK
                    </span>
                  </div>
                </a>

                {/* Return Button with U-turn Arrow (↩) Icon */}
                <button
                  onClick={handleCloseModal}
                  className="flex-shrink-0 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-[#012169]/20 bg-[#012169] text-[#FAF9F6] shadow-md transition-all hover:bg-[#A10728] hover:border-[#A10728] hover:scale-105 active:scale-95 cursor-pointer group"
                  title="Return to Bridge"
                  aria-label="Return to Bridge"
                >
                  <Undo2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                </button>
              </div>

              {/* Dynamic Content Views */}
              <div className="flex-1">
                {/* 1. Reels View (Sue Storm) */}
                {activeModal === "reels" && (
                  <RealEstateReelsSection scrollContainerRef={modalScrollRef} />
                )}

                {/* 2. Details & Showcase View (Johnny Storm) */}
                {activeModal === "details" && (
                  <WebsiteDetailsSection
                    scrollContainerRef={modalScrollRef}
                    onClose={handleCloseModal}
                  />
                )}

                {/* 3. Contact View (Ben Grimm) */}
                {activeModal === "contact" && (
                  <ContactSection
                    scrollContainerRef={modalScrollRef}
                    onOpenVideo={() => setIsVideoOpen(true)}
                  />
                )}
              </div>

              {/* Corporate Footer */}
              <Footer />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Website Intro Video Modal (Triggered by Reed Richards) */}
      <RealEstateIntroVideo
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />

      {/* Mobile Quick-Action Command Dock (Bridge Touch Controls) */}
      {activeModal === "none" && !isVideoOpen && (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none animate-in fade-in duration-300">
          <div className="pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full border border-[#012169]/20 bg-[#FCF8F3]/95 backdrop-blur-lg shadow-[0_10px_30px_rgba(1,33,105,0.15)]">
            <button
              onClick={handleReelsClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full font-['Condor_Med_Cond',sans-serif] text-xs font-bold uppercase tracking-wider text-[#012169] hover:bg-[#012169] hover:text-[#FAF9F6] active:bg-[#A10728] active:text-[#FAF9F6] transition-all cursor-pointer"
            >
              <Film className="h-3.5 w-3.5 text-[#A10728]" />
              <span>Reels</span>
            </button>

            <button
              onClick={handlePlanetsClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full font-['Condor_Med_Cond',sans-serif] text-xs font-bold uppercase tracking-wider text-[#012169] hover:bg-[#012169] hover:text-[#FAF9F6] active:bg-[#A10728] active:text-[#FAF9F6] transition-all cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-[#012169]" />
              <span>Details</span>
            </button>

            <button
              onClick={handleMainCharacterClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-['Condor_Med_Cond',sans-serif] text-xs font-bold uppercase tracking-wider bg-[#A10728] text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current text-white" />
              <span>Intro</span>
            </button>

            <button
              onClick={handleThirdCharacterClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full font-['Condor_Med_Cond',sans-serif] text-xs font-bold uppercase tracking-wider text-[#012169] hover:bg-[#012169] hover:text-[#FAF9F6] active:bg-[#A10728] active:text-[#FAF9F6] transition-all cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5 text-[#012169]" />
              <span>Contact</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

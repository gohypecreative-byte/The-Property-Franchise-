// src/components/ui/Navigation.tsx
"use client";

import React from "react";

interface NavigationProps {
  onOpenVideo?: () => void;
  onReset?: () => void;
}

export function Navigation({ onReset }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
      {/* Brand Monogram: The Property Franchise */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          onReset?.();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="pointer-events-auto flex items-center gap-3 group cursor-pointer rounded-full border border-[#012169]/20 bg-[#FCF8F3]/95 px-3.5 py-1.5 backdrop-blur-md shadow-md transition-all duration-300 hover:border-[#A10728] hover:shadow-[0_4px_20px_rgba(161,7,40,0.2)] hover:scale-[1.02]"
        title="The Property Franchise - Return to Homepage"
        aria-label="The Property Franchise - Return to Homepage"
      >
        <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full overflow-hidden border border-[#012169]/20 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:border-[#A10728]">
          <img
            src="/tpf_logo.jpg"
            alt="The Property Franchise Emblem"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col pr-1">
          <span className="font-['Condor_Medium_Condensed_Italic',sans-serif] italic text-xs sm:text-sm font-black tracking-widest text-[#012169] uppercase transition-colors group-hover:text-[#A10728] leading-tight">
            THE PROPERTY FRANCHISE
          </span>
          <span className="font-['Condor_Medium_Condensed_Italic',sans-serif] italic text-[8px] sm:text-[9px] font-bold tracking-[0.2em] text-[#A10728] uppercase">
            COMMERCIAL NETWORK
          </span>
        </div>
      </a>
    </nav>
  );
}

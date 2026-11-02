// src/components/ui/Navigation.tsx
"use client";

import React from "react";
import { BrandMark } from "./BrandMark";

interface NavigationProps {
  onOpenVideo?: () => void;
  onReset?: () => void;
}

export function Navigation({ onReset }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 pointer-events-none">
      {/* Brand lockup: glass pill sitting over the 3D scene */}
      <button
        onClick={() => {
          onReset?.();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="pointer-events-auto group flex items-center gap-3 sm:gap-3.5 rounded-full border border-white/15 bg-[#012169]/35 py-1.5 pl-1.5 pr-5 sm:pr-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:border-white/35 hover:bg-[#012169]/55 cursor-pointer"
        title="The Property Franchise - Return to Homepage"
        aria-label="The Property Franchise - Return to Homepage"
      >
        <BrandMark className="h-10 w-10 sm:h-11 sm:w-11 transition-transform duration-300 group-hover:scale-105" />
        <span className="h-7 w-px bg-white/20" />
        <span className="flex flex-col items-start leading-none">
          <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.14em] text-white uppercase">
            The Property Franchise
          </span>
          <span className="mt-1.5 flex items-center gap-1.5 text-[8px] sm:text-[9px] font-semibold tracking-[0.24em] text-white/60 uppercase">
            <span className="h-1 w-1 rounded-full bg-[#E4002B]" />
            Commercial Network
          </span>
        </span>
      </button>
    </nav>
  );
}

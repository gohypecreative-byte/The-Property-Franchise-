// src/components/ui/BrandMark.tsx
"use client";

import React from "react";

interface BrandMarkProps {
  /** Tailwind size classes for the badge, e.g. "h-10 w-10" */
  className?: string;
}

// The logo artwork carries wide white margins; scaling it inside a clipped
// white badge lets the globe emblem fill the circle at small sizes.
export function BrandMark({ className = "h-10 w-10" }: BrandMarkProps) {
  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#012169]/15 shadow-[0_2px_10px_rgba(1,33,105,0.18)] ${className}`}
    >
      <img
        src="/tpf_logo.jpg"
        alt="The Property Franchise emblem"
        className="h-full w-full scale-[1.32] object-cover"
        draggable={false}
      />
    </span>
  );
}

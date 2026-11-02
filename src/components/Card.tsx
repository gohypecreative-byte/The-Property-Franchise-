import React from "react";

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  tag?: string;
  badgeColor?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  tag,
  badgeColor = "bg-[#A63D35]",
}: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#D9C8AD] bg-[#354F70] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#A63D35] shadow-md selection:bg-[#A63D35] selection:text-[#F3E8D2]">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {tag && (
          <span
            className={`inline-flex items-center rounded-full ${badgeColor} px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider text-[#F3E8D2] shadow-sm`}
          >
            {tag}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg font-['Condor_Medium_Condensed_Italic',sans-serif] italic font-bold text-[#F3E8D2] transition-colors group-hover:text-[#F3E8D2]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#F3E8D2]/80 font-sans">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-mono font-bold text-[#A63D35] opacity-0 transition-opacity duration-200 group-hover:opacity-100 uppercase tracking-wider">
        <span>Explore Dossier</span>
        <svg
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}

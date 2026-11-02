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
  badgeColor = "bg-[#E4002B]",
}: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[#C9D4E5] bg-[#354F70] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E4002B] shadow-md selection:bg-[#E4002B] selection:text-[#EAF0F8]">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {tag && (
          <span
            className={`inline-flex items-center rounded-full ${badgeColor} px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider text-[#EAF0F8] shadow-sm`}
          >
            {tag}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-lg  font-bold text-[#EAF0F8] transition-colors group-hover:text-[#EAF0F8]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#EAF0F8]/80 font-sans">
        {description}
      </p>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-mono font-bold text-[#E4002B] opacity-0 transition-opacity duration-200 group-hover:opacity-100 uppercase tracking-wider">
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

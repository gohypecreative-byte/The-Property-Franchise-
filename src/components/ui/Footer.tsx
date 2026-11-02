// src/components/ui/Footer.tsx
"use client";

import React, { useState } from "react";
import {
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Globe,
  ShieldCheck,
  Send,
} from "lucide-react";
import { scifiAudio } from "@/lib/audio";

export function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const scrollTo = (id: string) => {
    scifiAudio.playHoloBeep(800, 0.05);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    scifiAudio.playHoloBeep(980, 0.08);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    scifiAudio.playHoloBeep(1200, 0.12);
    setSubscribed(true);
  };

  return (
    <footer className="relative z-20 bg-[#0E1B33] text-[#FAF9F6] px-6 sm:px-12 lg:px-20 pt-16 sm:pt-20 pb-12 selection:bg-[#A10728] selection:text-[#FCF8F3] overflow-hidden">
      {/* Signature Dual Gradient Top Accent Rule (Australian Flag Blue & Crimson Red) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#012169] via-[#A10728] to-[#012169] shadow-[0_0_12px_rgba(161,7,40,0.5)]" />

      {/* Subtle Architectural Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,#FCF8F3_1px,transparent_1px),linear-gradient(to_bottom,#FCF8F3_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

      {/* Soft Ambient Radial Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#012169]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#A10728]/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* ========================================================
            1. TOP ROW: Brand Identity, Nav Columns & Telemetry Dispatch
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pb-12 border-b border-[#FAF9F6]/15">
          {/* Brand Mission Statement */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border-2 border-[#A10728] bg-[#FCF8F3] shadow-md">
                <img
                  src="/tpf_logo.jpg"
                  alt="The Property Franchise"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="font-['Condor_Med_Cond',sans-serif] text-base font-bold tracking-widest text-[#FAF9F6] uppercase block leading-none">
                  THE PROPERTY FRANCHISE
                </span>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-[15px] text-[#FAF9F6]/85 leading-relaxed max-w-md">
              The Property Franchise is an exclusive institutional commercial real estate network built for premier territory franchisees, REIT managers, and sovereign capital leaders.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Column 1: Network Navigation */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A10728]" />
                <h4 className="font-['Condor_Med_Cond',sans-serif] font-bold text-sm tracking-wider uppercase text-[#FAF9F6]">
                  Navigation
                </h4>
              </div>
              <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#FAF9F6]/80">
                <li>
                  <button
                    onClick={scrollToTop}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Bridge Command (Hero)
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("real-estate-reels")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Archive & Reels
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("horizontal-gallery")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Commercial Showcase
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("franchise-game")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Territory Simulator
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("contact-us")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Contact Directorate
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Portfolios */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A10728]" />
                <h4 className="font-['Condor_Med_Cond',sans-serif] font-bold text-sm tracking-wider uppercase text-[#FAF9F6]">
                  Portfolios
                </h4>
              </div>
              <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#FAF9F6]/80">
                <li>
                  <button
                    onClick={() => scrollTo("horizontal-gallery")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Trophy Office Core
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("horizontal-gallery")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Business Campuses
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("horizontal-gallery")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Logistics Hubs
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("contact-us")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#A10728] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Licensing Mandates
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Confidential Investor Dispatch (In Australian Flag Blue Elevated Card) */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div className="rounded-2xl border border-[#012169] bg-[#012169]/40 p-4 sm:p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A10728]" />
                <h4 className="font-['Condor_Med_Cond',sans-serif] font-bold text-sm tracking-wider uppercase text-[#FCF8F3]">
                  Investor Dispatch
                </h4>
              </div>
              <p className="font-sans text-xs text-[#FCF8F3]/80 leading-relaxed mb-3.5">
                Receive confidential quarterly asset telemetry, yield reports, and off-market mandates.
              </p>

              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="investor@sovereign.com"
                      className="w-full rounded-xl border border-white/20 bg-[#0E1B33]/80 px-3.5 py-2 font-sans text-xs text-[#FCF8F3] placeholder-[#FCF8F3]/40 focus:border-[#A10728] focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A10728] hover:bg-[#720808] text-[#FCF8F3] py-2 px-3 font-['Condor_Med_Cond',sans-serif] text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span>Request Telemetry</span>
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/10 border border-[#A10728]/50 flex items-center gap-2 text-xs font-sans text-[#FCF8F3]">
                  <CheckCircle2 className="h-4 w-4 text-[#A10728] shrink-0" />
                  <span>Dossier subscription registered.</span>
                </div>
              )}
            </div>

            {/* Quick Action: Back to Top */}
            <div className="mt-5 pt-3 border-t border-[#FAF9F6]/10 flex items-center justify-between">
              <button
                onClick={scrollToTop}
                className="group inline-flex items-center gap-2 text-xs font-['Condor_Med_Cond',sans-serif] font-bold tracking-wider uppercase text-[#FAF9F6]/80 hover:text-[#A10728] transition-colors cursor-pointer"
              >
                <span>Return to Bridge Command</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#012169] bg-[#012169]/80 group-hover:bg-[#A10728] group-hover:border-[#A10728] group-hover:text-white transition-all">
                  <ArrowUp className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. MASSIVE BRAND LOGOTYPE (The Signature Visual)
           ======================================================== */}
        <div className="mt-10 sm:mt-12 pt-4">
          <h1 className="sr-only">The Property Franchise</h1>
          <div className="w-full select-none group cursor-pointer" onClick={scrollToTop} title="The Property Franchise">
            <svg
              viewBox="0 0 1440 140"
              className="w-full h-auto block overflow-visible"
              preserveAspectRatio="xMinYMid meet"
              role="img"
              aria-label="The Property Franchise"
            >
              <text
                x="0"
                y="110"
                fill="#FAF9F6"
                className="transition-colors duration-500 ease-out group-hover:fill-[#A10728]"
                style={{
                  fontFamily: "'Condor Medium Condensed Italic', 'Condor Med Cond', 'Condor', sans-serif",
                  fontWeight: 500,
                  fontStyle: "italic",
                }}
                fontSize="128"
                letterSpacing="-0.02em"
                textLength="1420"
                lengthAdjust="spacing"
              >
                The Property Franchise
              </text>
            </svg>
          </div>
        </div>

        {/* ========================================================
            3. BOTTOM ROW: Copyright, Regional Identity & Legal Links
           ======================================================== */}
        <div className="mt-6 pt-6 border-t border-[#FAF9F6]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#FAF9F6]/70">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A10728]" />
            <p>
              &copy; 2026 The Property Franchise Network Pty Ltd. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6 text-xs">
            <button
              onClick={() => scrollTo("contact-us")}
              className="hover:text-[#A10728] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => scrollTo("contact-us")}
              className="hover:text-[#A10728] transition-colors cursor-pointer"
            >
              Terms of Mandate
            </button>
            <button
              onClick={() => scrollTo("contact-us")}
              className="hover:text-[#A10728] transition-colors cursor-pointer"
            >
              Territory Disclosures
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// src/components/ui/Footer.tsx
"use client";

import React, { useState } from "react";
import { BrandMark } from "./BrandMark";
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
    <footer className="relative z-20 bg-[#0A1633] text-[#FFFFFF] px-6 sm:px-12 lg:px-20 pt-16 sm:pt-20 pb-12 selection:bg-[#E4002B] selection:text-[#F7F9FC] overflow-hidden">
      {/* Signature Dual Gradient Top Accent Rule (Australian Flag Blue & Crimson Red) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#012169] via-[#E4002B] to-[#012169] shadow-[0_0_12px_rgba(228,0,43,0.5)]" />

      {/* Subtle Architectural Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,#F7F9FC_1px,transparent_1px),linear-gradient(to_bottom,#F7F9FC_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />

      {/* Soft Ambient Radial Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#012169]/40 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#E4002B]/15 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* ========================================================
            1. TOP ROW: Brand Identity, Nav Columns & Telemetry Dispatch
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pb-12 border-b border-[#FFFFFF]/15">
          {/* Brand Mission Statement */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3.5">
              <BrandMark className="h-12 w-12" />
              <div>
                <span className=" text-base font-bold tracking-widest text-[#FFFFFF] uppercase block leading-none">
                  THE PROPERTY FRANCHISE
                </span>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-[15px] text-[#FFFFFF]/85 leading-relaxed max-w-md">
              The Property Franchise is an exclusive institutional commercial real estate network built for premier territory franchisees, REIT managers, and sovereign capital leaders.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Column 1: Network Navigation */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" />
                <h4 className=" font-bold text-sm tracking-wider uppercase text-[#FFFFFF]">
                  Navigation
                </h4>
              </div>
              <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#FFFFFF]/80">
                <li>
                  <button
                    onClick={scrollToTop}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" />
                <h4 className=" font-bold text-sm tracking-wider uppercase text-[#FFFFFF]">
                  Portfolios
                </h4>
              </div>
              <ul className="space-y-3 font-sans text-xs sm:text-sm text-[#FFFFFF]/80">
                <li>
                  <button
                    onClick={() => scrollTo("horizontal-gallery")}
                    className="group flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                    <ArrowRight className="h-3 w-3 text-[#E4002B] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
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
                <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" />
                <h4 className=" font-bold text-sm tracking-wider uppercase text-[#F7F9FC]">
                  Investor Dispatch
                </h4>
              </div>
              <p className="font-sans text-xs text-[#F7F9FC]/80 leading-relaxed mb-3.5">
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
                      className="w-full rounded-xl border border-white/20 bg-[#0A1633]/80 px-3.5 py-2 font-sans text-xs text-[#F7F9FC] placeholder-[#F7F9FC]/40 focus:border-[#E4002B] focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E4002B] hover:bg-[#B8001F] text-[#F7F9FC] py-2 px-3 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <span>Request Telemetry</span>
                    <Send className="h-3 w-3" />
                  </button>
                </form>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/10 border border-[#E4002B]/50 flex items-center gap-2 text-xs font-sans text-[#F7F9FC]">
                  <CheckCircle2 className="h-4 w-4 text-[#E4002B] shrink-0" />
                  <span>Dossier subscription registered.</span>
                </div>
              )}
            </div>

            {/* Quick Action: Back to Top */}
            <div className="mt-5 pt-3 border-t border-[#FFFFFF]/10 flex items-center justify-between">
              <button
                onClick={scrollToTop}
                className="group inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#FFFFFF]/80 hover:text-[#E4002B] transition-colors cursor-pointer"
              >
                <span>Return to Bridge Command</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#012169] bg-[#012169]/80 group-hover:bg-[#E4002B] group-hover:border-[#E4002B] group-hover:text-white transition-all">
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
                fill="#FFFFFF"
                className="transition-colors duration-500 ease-out group-hover:fill-[#E4002B]"
                style={{
                  fontFamily: "var(--font-site)",
                  fontWeight: 500,
                  fontStyle: "",
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
        <div className="mt-6 pt-6 border-t border-[#FFFFFF]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#FFFFFF]/70">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" />
            <p>
              &copy; 2026 The Property Franchise Network Pty Ltd. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-6 text-xs">
            <button
              onClick={() => scrollTo("contact-us")}
              className="hover:text-[#E4002B] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => scrollTo("contact-us")}
              className="hover:text-[#E4002B] transition-colors cursor-pointer"
            >
              Terms of Mandate
            </button>
            <button
              onClick={() => scrollTo("contact-us")}
              className="hover:text-[#E4002B] transition-colors cursor-pointer"
            >
              Territory Disclosures
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// src/components/ui/ContactSection.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Send,
  Radio,
  Building2,
  ShieldCheck,
  ChevronDown,
  Globe,
} from "lucide-react";
import { scifiAudio } from "@/lib/audio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ContactSectionProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onOpenVideo?: () => void;
}

export function ContactSection({ scrollContainerRef }: ContactSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Form input state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    projectType: "Trophy Office Tower Acquisition ($100M+)",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  // Mouse tracking for subtle ambient spotlight & magnetic button
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  // Handle ambient mouse glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }

    // Magnetic Submit Button physics
    if (submitBtnRef.current) {
      const btnRect = submitBtnRef.current.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      if (dist < 120) {
        const pull = 0.18;
        setBtnOffset({
          x: (e.clientX - btnCenterX) * pull,
          y: (e.clientY - btnCenterY) * pull,
        });
      } else {
        setBtnOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  // GSAP Entrance & Parallax Animations
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scroller = scrollContainerRef?.current || window;

    // Staggered reveal timeline
    const ctx = gsap.context(() => {
      // 1. Left Column Stagger
      if (leftColRef.current) {
        const elements = leftColRef.current.children;
        gsap.fromTo(
          elements,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              scroller: scroller,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 2. Right Column Form Panel Slide-In
      if (formPanelRef.current) {
        gsap.fromTo(
          formPanelRef.current,
          { x: 45, opacity: 0, scale: 0.96 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              scroller: scroller,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Subtle background telemetry parallax
      const telemetryElements = section.querySelectorAll(".telemetry-parallax");
      if (telemetryElements.length > 0) {
        gsap.to(telemetryElements, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scroller: scroller,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, section);

    return () => ctx.revert();
  }, [scrollContainerRef]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scifiAudio.playHoloBeep(980, 0.1);
    setIsSubmitting(true);

    // Generate confidential mandate reference docket
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const docket = `TPF-MANDATE-2026-${randNum}`;
    setReferenceId(docket);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      scifiAudio.playHoloBeep(1350, 0.16);
    }, 1100);
  };

  const handleResetForm = () => {
    scifiAudio.playHoloBeep(850, 0.08);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      projectType: "Trophy Office Tower Acquisition ($100M+)",
    });
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact-us"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-20 bg-[#FCF8F3] text-[#012169] selection:bg-[#A10728] selection:text-[#FCF8F3] font-['Condor_Medium_Condensed_Italic',sans-serif] italic min-h-[calc(100vh-52px)] w-full flex items-center justify-center py-10 sm:py-16 lg:py-20 px-4 sm:px-8 lg:px-14 select-none overflow-hidden"
    >
      {/* --------------------------------------------------------------------
          1. FUTURISTIC CONTROL ROOM BACKGROUND & HUD TELEMETRY
          -------------------------------------------------------------------- */}
      {/* Mouse Ambient Red/Navy Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(161, 7, 40, 0.06), transparent 75%)`,
        }}
      />

      {/* Subtle Architectural Grid Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,rgba(1,33,105,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(1,33,105,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Rotating Control Room Radar Overlay (Low Opacity Ambient) */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full border border-[#012169]/8 opacity-40 animate-[spin_60s_linear_infinite]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full border border-dashed border-[#A10728]/15 opacity-40 animate-[spin_30s_linear_infinite_reverse]" />


      {/* Main Two-Column Layout */}
      <div className="mx-auto w-full max-w-7xl relative z-10 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-14 items-center">
          {/* ==================================================================
              LEFT COLUMN: CONTACT INFORMATION & SYNDICATE IDENTITY
              ================================================================== */}
          <div
            ref={leftColRef}
            className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8"
          >
            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#012169] leading-[0.98]">
                Let&apos;s Build <br />
                <span className="text-[#A10728] font-normal italic">
                  Something Extraordinary.
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[#012169]/80 leading-relaxed font-medium max-w-xl">
                The Property Franchise orchestrates confidential off-market commercial property transactions, regional master territory franchise licensing, and direct capital syndication with leading institutional partners worldwide.
              </p>
            </div>
          </div>

          {/* ==================================================================
              RIGHT COLUMN: FUTURISTIC INTERACTIVE CONTACT FORM PANEL
              ================================================================== */}
          <div ref={formPanelRef} className="lg:col-span-6">
            <div className="relative rounded-[28px] sm:rounded-[32px] border-[2px] border-[#012169]/20 bg-white/80 backdrop-blur-xl shadow-[0_25px_60px_rgba(1,33,105,0.18)] p-6 sm:p-8 lg:p-10 select-none overflow-hidden">
              {/* Form Panel Header */}
              <div className="border-b border-[#012169]/15 pb-4 mb-6">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#012169]">
                  Register Capital Mandate
                </h3>
              </div>

              {/* Form Content / Success Message Switch */}
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  /* Success Confirmation Dossier */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="py-6 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-600 text-emerald-600 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold text-[#A10728] tracking-widest uppercase block mb-1">
                        DOCKET: {referenceId}
                      </span>
                      <h4 className="text-2xl sm:text-3xl font-black uppercase text-[#012169]">
                        Transmission Received
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-[#012169]/75 max-w-md mx-auto">
                        Your commercial property mandate enquiry has been routed directly to our Managing Partner Desk. A senior partner will initiate private advisory contact within 2 hours.
                      </p>
                    </div>

                    <div className="w-full p-4 rounded-xl border border-[#012169]/15 bg-[#FCF8F3] text-left text-xs font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[#012169]/60">MANDATE TYPE:</span>
                        <span className="font-bold text-[#012169] truncate max-w-[220px]">
                          {formData.projectType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#012169]/60">REPRESENTATIVE:</span>
                        <span className="font-bold text-[#012169]">
                          {formData.fullName || "Accredited Investor"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#012169]/60">STATUS:</span>
                        <span className="font-bold text-emerald-600">
                          LOGGED &amp; ALLOCATED
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleResetForm}
                      className="mt-2 px-6 py-2.5 rounded-full bg-[#012169] text-[#FAF9F6] text-xs font-bold uppercase tracking-wider hover:bg-[#A10728] transition-colors cursor-pointer shadow-md"
                    >
                      Submit Another Mandate
                    </button>
                  </motion.div>
                ) : (
                  /* Interactive Input Form */
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                  >
                    {/* Row 1: Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="relative">
                        <label
                          htmlFor="fullName"
                          className={`block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 mb-1 ${
                            focusedField === "fullName"
                              ? "text-[#A10728]"
                              : "text-[#012169]/70"
                          }`}
                        >
                          Full Name *
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          required
                          placeholder="e.g. Lord Alistair Vance"
                          value={formData.fullName}
                          onFocus={() => {
                            setFocusedField("fullName");
                            scifiAudio.playHoloBeep(850, 0.04);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="w-full bg-transparent border-b-2 border-[#012169]/20 focus:border-[#A10728] pb-2 pt-1 text-xs sm:text-sm text-[#012169] placeholder-[#012169]/35 focus:outline-none transition-all duration-300"
                        />
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <label
                          htmlFor="email"
                          className={`block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 mb-1 ${
                            focusedField === "email"
                              ? "text-[#A10728]"
                              : "text-[#012169]/70"
                          }`}
                        >
                          Corporate Email *
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="e.g. vance@sovereigncapital.com"
                          value={formData.email}
                          onFocus={() => {
                            setFocusedField("email");
                            scifiAudio.playHoloBeep(850, 0.04);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-transparent border-b-2 border-[#012169]/20 focus:border-[#A10728] pb-2 pt-1 text-xs sm:text-sm text-[#012169] placeholder-[#012169]/35 focus:outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone Number & Company Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone Number */}
                      <div className="relative">
                        <label
                          htmlFor="phone"
                          className={`block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 mb-1 ${
                            focusedField === "phone"
                              ? "text-[#A10728]"
                              : "text-[#012169]/70"
                          }`}
                        >
                          Phone Number *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          placeholder="e.g. +44 20 7946 0912"
                          value={formData.phone}
                          onFocus={() => {
                            setFocusedField("phone");
                            scifiAudio.playHoloBeep(850, 0.04);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-transparent border-b-2 border-[#012169]/20 focus:border-[#A10728] pb-2 pt-1 text-xs sm:text-sm text-[#012169] placeholder-[#012169]/35 focus:outline-none transition-all duration-300"
                        />
                      </div>

                      {/* Company Name */}
                      <div className="relative">
                        <label
                          htmlFor="company"
                          className={`block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 mb-1 ${
                            focusedField === "company"
                              ? "text-[#A10728]"
                              : "text-[#012169]/70"
                          }`}
                        >
                          Syndicate / Fund Entity
                        </label>
                        <input
                          id="company"
                          type="text"
                          placeholder="e.g. Vance Global Capital REIT"
                          value={formData.company}
                          onFocus={() => {
                            setFocusedField("company");
                            scifiAudio.playHoloBeep(850, 0.04);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          className="w-full bg-transparent border-b-2 border-[#012169]/20 focus:border-[#A10728] pb-2 pt-1 text-xs sm:text-sm text-[#012169] placeholder-[#012169]/35 focus:outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Row 3: Project Type Dropdown */}
                    <div className="relative">
                      <label
                        htmlFor="projectType"
                        className={`block text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 mb-1 ${
                          focusedField === "projectType"
                            ? "text-[#A10728]"
                            : "text-[#012169]/70"
                        }`}
                      >
                        Project / Mandate Category *
                      </label>
                      <div className="relative">
                        <select
                          id="projectType"
                          value={formData.projectType}
                          onFocus={() => {
                            setFocusedField("projectType");
                            scifiAudio.playHoloBeep(850, 0.04);
                          }}
                          onBlur={() => setFocusedField(null)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              projectType: e.target.value,
                            })
                          }
                          className="w-full appearance-none bg-transparent border-b-2 border-[#012169]/20 focus:border-[#A10728] pb-2 pt-1 text-xs sm:text-sm text-[#012169] focus:outline-none cursor-pointer pr-8 font-bold transition-all duration-300"
                        >
                          <option className="bg-white text-[#012169]">
                            Trophy Office Tower Acquisition ($100M+)
                          </option>
                          <option className="bg-white text-[#012169]">
                            Master Franchise Territory License
                          </option>
                          <option className="bg-white text-[#012169]">
                            Commercial Corporate Business Campus
                          </option>
                          <option className="bg-white text-[#012169]">
                            Industrial &amp; Logistics Hub Syndicate
                          </option>
                          <option className="bg-white text-[#012169]">
                            Off-Market Private Equity Mandate
                          </option>
                          <option className="bg-white text-[#012169]">
                            General Executive Consultation
                          </option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-[#A10728]">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Submission Action Bar */}
                    <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#012169]/10">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#012169]/60 font-mono">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Confidential Non-Disclosure Protected</span>
                      </div>

                      {/* Magnetic Submit Button */}
                      <button
                        ref={submitBtnRef}
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          transform: `translate3d(${btnOffset.x}px, ${btnOffset.y}px, 0)`,
                          transition: "transform 0.15s ease-out, background-color 0.25s, box-shadow 0.25s",
                        }}
                        className="w-full sm:w-auto relative group overflow-hidden px-8 py-3.5 rounded-full bg-[#012169] hover:bg-[#A10728] text-[#FAF9F6] text-xs font-black uppercase tracking-[0.18em] shadow-[0_10px_25px_rgba(1,33,105,0.25)] hover:shadow-[0_15px_35px_rgba(161,7,40,0.4)] active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>TRANSMITTING MANDATE...</span>
                          </span>
                        ) : (
                          <>
                            <span>Send Enquiry</span>
                            <ArrowUpRight className="h-4 w-4 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

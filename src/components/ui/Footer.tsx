// src/components/ui/Footer.tsx
"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { scifiAudio } from "@/lib/audio";

export type FooterTarget = "intro" | "reels" | "details" | "contact";

interface FooterProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onNavigate?: (target: FooterTarget) => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STATIONS: { id: FooterTarget; index: string; label: string; station: string }[] = [
  { id: "intro", index: "01", label: "Introduction", station: "Command" },
  { id: "reels", index: "02", label: "Memory reels", station: "Archive" },
  { id: "details", index: "03", label: "Property details", station: "Navigation" },
  { id: "contact", index: "04", label: "Contact", station: "Comms" },
];

export function Footer({ scrollContainerRef, onNavigate }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Parallax: content settles into place and the wordmark rises as the footer enters
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [-60, 0]);
  const wordY = useTransform(scrollYProgress, [0.3, 1], ["45%", "0%"]);
  const ruleScale = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const viewport = { once: true, margin: "-5% 0px", root: scrollContainerRef as React.RefObject<Element> };

  const scrollToTop = () => {
    scifiAudio.playHoloBeep(980, 0.08);
    scrollContainerRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    scifiAudio.playHoloBeep(1200, 0.12);
    setSubscribed(true);
  };

  return (
    <footer
      ref={footerRef}
      className="relative z-20 overflow-hidden bg-[#F7F9FC] text-[#012169] selection:bg-[#E4002B] selection:text-white"
    >
      <motion.div style={{ scaleX: ruleScale }} className="h-px w-full origin-left bg-[#012169]/20" />

      <motion.div style={{ y: contentY }} className="mx-auto max-w-[1600px] px-5 pt-8 md:px-8 md:pt-10">
        {/* Editorial header row */}
        <div className="grid grid-cols-2 gap-4 text-[11px] uppercase leading-[1.4] tracking-[0.12em] md:grid-cols-4">
          <span className="flex items-center gap-3 font-semibold">
            <BrandMark className="h-8 w-8" />
            <span>
              The Property
              <br />
              Franchise
            </span>
          </span>
          <span className="hidden text-[#012169]/55 md:block">
            Commercial
            <br />
            Network
          </span>
          <span className="hidden text-[#012169]/55 md:block">
            Bridge
            <br />
            Index
          </span>
          <button
            onClick={scrollToTop}
            className="group flex items-start justify-end gap-2 text-right hover:text-[#E4002B] transition-colors cursor-pointer"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          {/* Stations index */}
          <nav aria-label="Stations">
            <ul className="border-b border-[#012169]/20">
              {STATIONS.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
                >
                  <button
                    onClick={() => {
                      scifiAudio.playHoloBeep(920, 0.06);
                      onNavigate?.(s.id);
                    }}
                    className="group grid w-full grid-cols-[48px_1fr_auto] items-baseline gap-4 border-t border-[#012169]/20 py-4 text-left md:grid-cols-[64px_1fr_160px_auto] md:py-5 cursor-pointer"
                  >
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#012169]/55">{s.index}</span>
                    <span className="flex items-center gap-3 text-[clamp(26px,3.6vw,52px)] font-medium leading-none tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#E4002B] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      {s.label}
                    </span>
                    <span className="hidden text-[11px] uppercase tracking-[0.14em] text-[#012169]/55 md:block">
                      {s.station}
                    </span>
                    <ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </button>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Updates */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="flex flex-col justify-between gap-10"
          >
            <div>
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#012169]/55">Updates</span>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-[#012169]/75">
                New listings and network news, now and then.
              </p>
              {subscribed ? (
                <p className="mt-6 border-b border-[#012169]/20 pb-3 text-lg">
                  You&apos;re on the list<span className="text-[#E4002B]">.</span>
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="group mt-6 flex items-center gap-3 border-b border-[#012169]/30 pb-3 focus-within:border-[#E4002B] transition-colors">
                  <label htmlFor="footer-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    autoComplete="email"
                    className="w-full bg-transparent text-lg outline-none placeholder:text-[#012169]/35"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#012169] text-white transition-colors hover:bg-[#E4002B] cursor-pointer"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => {
                scifiAudio.playHoloBeep(920, 0.06);
                onNavigate?.("contact");
              }}
              className="group flex items-center justify-between border-t border-[#012169]/20 pt-5 text-left cursor-pointer"
            >
              <span>
                <span className="block text-[11px] uppercase tracking-[0.14em] text-[#012169]/55">Start a conversation</span>
                <span className="mt-1 block text-2xl font-medium tracking-[-0.03em] group-hover:text-[#E4002B] transition-colors">
                  Let&apos;s talk
                </span>
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#012169]/25 transition-all duration-300 group-hover:border-[#E4002B] group-hover:bg-[#E4002B] group-hover:text-white">
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Giant wordmark rising out of the bottom edge */}
      <div className="mt-16 overflow-hidden px-5 md:mt-24 md:px-8">
        <motion.svg
          style={{ y: wordY }}
          viewBox="0 0 1440 150"
          className="block h-auto w-full overflow-visible"
          preserveAspectRatio="xMinYMid meet"
          role="img"
          aria-label="The Property Franchise"
        >
          <text
            x="0"
            y="118"
            fill="#012169"
            style={{ fontFamily: "var(--font-site)", fontWeight: 500 }}
            fontSize="140"
            letterSpacing="-0.04em"
            textLength="1410"
            lengthAdjust="spacingAndGlyphs"
          >
            The Property Franchise
          </text>
          <circle cx="1428" cy="110" r="10" fill="#E4002B" />
        </motion.svg>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 border-t border-[#012169]/20 px-5 py-5 text-[11px] uppercase tracking-[0.12em] text-[#012169]/60 md:px-8">
        <span>© 2026 The Property Franchise</span>
        <span>Commercial network</span>
      </div>
    </footer>
  );
}

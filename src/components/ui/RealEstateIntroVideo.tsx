// src/components/ui/RealEstateIntroVideo.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { scifiAudio } from "@/lib/audio";
import { BrandMark } from "./BrandMark";

export interface RealEstateIntroVideoProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  companyName?: string;
  tagline?: string;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function RealEstateIntroVideo({
  isOpen,
  onClose,
  videoSrc = "/real-estate-intro.mp4",
  companyName = "THE PROPERTY FRANCHISE",
  tagline = "COMMERCIAL PROPERTY FRANCHISE NETWORK & GLOBAL TERRITORIES",
}: RealEstateIntroVideoProps) {
  const [isFilm, setIsFilm] = useState(false); // film has expanded full-bleed
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const titleOverlayRef = useRef<HTMLDivElement>(null);
  const plusLeftRef = useRef<HTMLSpanElement>(null);
  const plusRightRef = useRef<HTMLSpanElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  // Slit-open reveal on mount (0 -> 1), independent of scroll
  const openProxy = useRef<{ value: number }>({ value: 0 });

  // --------------------------------------------------------------------------
  // SCENE RENDERER
  // openP: frame opens from a thin slit beneath the title
  // p:     scroll progress; the frame grows from an inset panel to full-bleed
  //        while the title page lifts away
  // --------------------------------------------------------------------------
  const renderScene = useCallback(() => {
    const scroller = scrollRef.current;
    const frame = frameRef.current;
    const title = titleRef.current;
    if (!scroller || !frame || !title) return 0;

    const vw = scroller.clientWidth;
    const vh = scroller.clientHeight;
    const pad = vw < 640 ? 16 : 32;
    const maxScroll = scroller.scrollHeight - vh;
    const p = easeInOut(
      maxScroll > 0 ? clamp01(scroller.scrollTop / maxScroll) : 0,
    );
    const openP = 1 - Math.pow(1 - openProxy.current.value, 3);

    // Frame insets: start just under the title block, end at the screen edges
    const top0 = title.offsetTop + title.offsetHeight + 20;
    const top = top0 * (1 - p);
    const side = pad * (1 - p);
    const bottom = pad * (1 - p);

    // Slit reveal collapses the frame to its vertical centre
    const mid = (top + (vh - bottom)) / 2;
    const clipTop = mid + (top - mid) * openP;
    const clipBottom = vh - mid + (bottom - (vh - mid)) * openP;
    frame.style.clipPath = `inset(${clipTop.toFixed(1)}px ${side.toFixed(1)}px ${clipBottom.toFixed(
      1,
    )}px ${side.toFixed(1)}px)`;

    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${(1.12 - 0.12 * p).toFixed(4)})`;
    }

    // Title page lifts and fades as the film takes over
    title.style.transform = `translate3d(0, ${(-p * 90).toFixed(1)}px, 0)`;
    title.style.opacity = clamp01(1 - p * 1.8).toFixed(3);
    if (topBarRef.current) {
      topBarRef.current.style.opacity = clamp01(1 - p * 2.2).toFixed(3);
      topBarRef.current.style.pointerEvents = p > 0.4 ? "none" : "auto";
    }

    // White fade + overlay sit inside the visible frame
    const frameH = vh - top - bottom;
    if (fadeRef.current) {
      fadeRef.current.style.top = `${top.toFixed(1)}px`;
      fadeRef.current.style.height = `${(frameH * 0.5).toFixed(1)}px`;
      fadeRef.current.style.opacity = (1 - p).toFixed(3);
    }
    if (titleOverlayRef.current) {
      titleOverlayRef.current.style.opacity = (
        clamp01((openP - 0.6) / 0.4) * clamp01(1 - p * 2.5)
      ).toFixed(3);
      titleOverlayRef.current.style.bottom = `${(bottom + 24).toFixed(1)}px`;
      titleOverlayRef.current.style.pointerEvents = p > 0.3 ? "none" : "auto";
    }
    const plusY = `${(top + frameH * 0.38).toFixed(1)}px`;
    [plusLeftRef.current, plusRightRef.current].forEach((el) => {
      if (!el) return;
      el.style.top = plusY;
      el.style.opacity = (openP * clamp01(1 - p * 3)).toFixed(3);
    });
    if (plusLeftRef.current)
      plusLeftRef.current.style.left = `${(side + 10).toFixed(1)}px`;
    if (plusRightRef.current)
      plusRightRef.current.style.right = `${(side + 10).toFixed(1)}px`;

    return p;
  }, []);

  // Open: lock body scroll, start the slit reveal and the render loop
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    scifiAudio.playHoloBeep(980, 0.1);

    openProxy.current.value = 0;
    const tween = gsap.to(openProxy.current, {
      value: 1,
      duration: 1.4,
      delay: 1.5,
      ease: "power2.inOut",
    });

    let rafId = 0;
    let filmShown = false;
    const tick = () => {
      const p = renderScene();
      const nowFilm = p > 0.94;
      if (nowFilm !== filmShown) {
        filmShown = nowFilm;
        setIsFilm(nowFilm);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      tween.kill();
      cancelAnimationFrame(rafId);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, renderScene]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    } else {
      video.pause();
    }
  }, [isPlaying, isOpen]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const scrollToFilm = () => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scifiAudio.playHoloBeep(900, 0.06);
    if (videoRef.current) videoRef.current.currentTime = 0;
    setIsMuted(false);
    setIsPlaying(true);
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  };

  const scrollToTitle = () => {
    scifiAudio.playHoloBeep(720, 0.06);
    setIsMuted(true);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClose = () => {
    scifiAudio.playHoloBeep(750, 0.08);
    // Reset so the next open starts on the title page again
    setIsFilm(false);
    setIsPlaying(true);
    setIsMuted(true);
    setCurrentTime(0);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (isFilm && (e.key === " " || e.key === "k")) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((m) => !m);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFilm]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const progress = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    videoRef.current.currentTime = progress * duration;
    setCurrentTime(progress * duration);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-0 z-[120] bg-white text-[#012169] select-none selection:bg-[#E4002B] selection:text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${companyName} intro film`}
        >
          {/* Scrollable stage: scrolling expands the film to full-bleed */}
          <div
            ref={scrollRef}
            data-lenis-prevent
            className="absolute inset-0 overflow-y-auto overflow-x-hidden overscroll-contain no-scrollbar"
          >
            <div className="relative h-[260vh]">
              <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* ==========================================================
                    TOP BAR (logo + nav + close)
                    ========================================================== */}
                <div
                  ref={topBarRef}
                  className="absolute inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[#012169]/10 bg-white/90 backdrop-blur-md px-4 sm:px-8 h-14 sm:h-16 text-[10px] sm:text-[11px] uppercase tracking-[0.12em]"
                >
                  <button
                    onClick={() => {
                      handleClose();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-3 cursor-pointer"
                    aria-label="The Property Franchise - Return to Homepage"
                  >
                    <BrandMark className="h-10 w-10 sm:h-11 sm:w-11" />
                    <span className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="text-[12px] font-bold tracking-[0.08em] text-[#012169]">
                        The Property Franchise
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="group flex items-center gap-2 rounded-full border border-[#012169]/20 pl-4 pr-1.5 py-1.5 hover:border-[#012169] transition-colors cursor-pointer"
                    aria-label="Close intro"
                  >
                    Close
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#012169] text-white transition-transform duration-300 group-hover:rotate-90">
                      <X className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </div>

                {/* ==========================================================
                    TITLE PAGE: rule draws -> title rises -> credits & meta
                    ========================================================== */}
                <div
                  ref={titleRef}
                  className="absolute inset-x-0 top-[84px] sm:top-[104px] z-10 px-4 sm:px-8 will-change-transform"
                >
                  <div className="overflow-hidden text-center">
                    <motion.h1
                      initial={{ y: "105%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
                      className="whitespace-nowrap text-[clamp(26px,6.4vw,124px)] font-semibold uppercase leading-[0.95] tracking-[-0.045em] text-[#012169]"
                    >
                      {companyName}
                    </motion.h1>
                  </div>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
                    className="mt-3 h-px w-full origin-center bg-[#012169]"
                  />

                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 1.3, ease: EASE }}
                    className="mt-2 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-[#012169]/70"
                  >
                    Presented by{" "}
                    <span className="font-semibold text-[#012169]">
                      The Property Franchise
                    </span>
                    <span className="mx-2 text-[#E4002B]">•</span>
                    <span className="hidden sm:inline">{tagline}</span>
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 1.5, ease: EASE }}
                    className="mt-5 sm:mt-7 flex items-start justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.12em] leading-[1.6]"
                  >
                    <dl className="grid grid-cols-[auto_auto] gap-x-4 sm:gap-x-6">
                      <dt className="text-[#012169]/50">Year</dt>
                      <dd>2026</dd>
                      <dt className="text-[#012169]/50">Format</dt>
                      <dd>Brand Film</dd>
                      <dt className="text-[#012169]/50">Region</dt>
                      <dd>Australia</dd>
                    </dl>
                    <dl className="grid grid-cols-[auto_auto] gap-x-4 sm:gap-x-6 text-right">
                      <dt className="text-[#012169]/50">Sector</dt>
                      <dd>Commercial</dd>
                      <dt className="text-[#012169]/50">Language</dt>
                      <dd>English</dd>
                      <dt className="text-[#012169]/50">Runtime</dt>
                      <dd className="tabular-nums">{formatTime(duration)}</dd>
                    </dl>
                  </motion.div>
                </div>

                {/* ==========================================================
                    FILM FRAME (full-screen layer, clipped by renderScene)
                    ========================================================== */}
                <div
                  ref={frameRef}
                  className="absolute inset-0 z-20 overflow-hidden bg-[#0A1633]"
                  style={{ clipPath: "inset(50% 32px 50% 32px)" }}
                >
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    poster="/commercial_office_tower.jpg"
                    muted={isMuted}
                    playsInline
                    autoPlay
                    loop
                    onTimeUpdate={(e) =>
                      setCurrentTime(e.currentTarget.currentTime)
                    }
                    onLoadedMetadata={(e) =>
                      setDuration(e.currentTarget.duration)
                    }
                    onClick={() =>
                      isFilm ? setIsPlaying((p) => !p) : scrollToFilm()
                    }
                    className="absolute inset-0 h-full w-full object-cover cursor-pointer will-change-transform"
                  />

                  {/* White fade from the title page into the footage */}
                  <div
                    ref={fadeRef}
                    className="pointer-events-none absolute inset-x-0 bg-gradient-to-b from-white via-white/60 to-transparent"
                  />

                  <span
                    ref={plusLeftRef}
                    className="absolute text-lg leading-none text-[#012169]"
                    style={{ opacity: 0 }}
                  >
                    +
                  </span>
                  <span
                    ref={plusRightRef}
                    className="absolute text-lg leading-none text-[#012169]"
                    style={{ opacity: 0 }}
                  >
                    +
                  </span>

                  {/* Title-page actions + scroll cue */}
                  <div
                    ref={titleOverlayRef}
                    style={{ opacity: 0 }}
                    className="absolute inset-x-0 flex flex-col items-center gap-4"
                  >
                    <div className="flex items-stretch border border-white/80 bg-white/10 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em]">
                      <button
                        onClick={scrollToFilm}
                        className="flex items-center gap-2 px-5 sm:px-7 py-3 hover:bg-white hover:text-[#012169] transition-colors cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Watch the Film
                      </button>
                      <span className="w-px bg-white/80" />
                      <button
                        onClick={handleClose}
                        className="px-5 sm:px-7 py-3 hover:bg-[#E4002B] transition-colors cursor-pointer"
                      >
                        Explore Network
                      </button>
                    </div>
                    <span className="shiny-text-light text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.32em]">
                      Scroll to Play
                    </span>
                  </div>

                  {/* Film controls (shown once fully expanded) */}
                  <AnimatePresence>
                    {isFilm && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="pointer-events-none absolute inset-0 flex flex-col justify-between text-white"
                      >
                        <div className="pointer-events-auto flex items-center justify-between p-4 sm:p-8 bg-gradient-to-b from-black/60 to-transparent text-[10px] sm:text-[11px] uppercase tracking-[0.14em]">
                          <span className="flex items-center gap-3">
                            <BrandMark className="h-9 w-9" />
                            {companyName}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={scrollToTitle}
                              className="rounded-full border border-white/30 px-4 py-1.5 hover:border-white transition-colors cursor-pointer"
                            >
                              Back to Top
                            </button>
                            <button
                              onClick={handleClose}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#012169] hover:bg-[#E4002B] hover:text-white transition-colors cursor-pointer"
                              aria-label="Close intro"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="pointer-events-auto p-4 sm:p-8 bg-gradient-to-t from-black/70 to-transparent">
                          <div
                            onClick={handleSeek}
                            className="relative h-[3px] w-full cursor-pointer bg-white/25 hover:h-[5px] transition-all"
                          >
                            <div
                              className="h-full bg-[#E4002B]"
                              style={{
                                width: duration
                                  ? `${(currentTime / duration) * 100}%`
                                  : "0%",
                              }}
                            />
                          </div>
                          <div className="mt-4 flex items-center gap-3 text-[11px] tracking-[0.12em]">
                            <button
                              onClick={() => setIsPlaying((p) => !p)}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#012169] hover:bg-[#E4002B] hover:text-white transition-colors cursor-pointer"
                              aria-label={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4 ml-0.5 fill-current" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (videoRef.current)
                                  videoRef.current.currentTime = 0;
                                setIsPlaying(true);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 hover:border-white transition-colors cursor-pointer"
                              aria-label="Restart"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setIsMuted((m) => !m)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 hover:border-white transition-colors cursor-pointer"
                              aria-label={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </button>
                            <span className="ml-auto tabular-nums text-white/80">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

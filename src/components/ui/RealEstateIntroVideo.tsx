// src/components/ui/RealEstateIntroVideo.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { scifiAudio } from "@/lib/audio";

export interface RealEstateIntroVideoProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  companyName?: string;
  tagline?: string;
}

export function RealEstateIntroVideo({
  isOpen,
  onClose,
  videoSrc = "/real-estate-intro.mp4",
  companyName = "THE PROPERTY FRANCHISE",
  tagline = "COMMERCIAL PROPERTY FRANCHISE NETWORK & GLOBAL TERRITORIES",
}: RealEstateIntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Lock body scroll and trigger autoplay when opened
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsPlaying(true);
      setCurrentTime(0);
      scifiAudio.playHoloBeep(980, 0.1);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => { });
            }
          });
        }
      }, 100);
    } else {
      document.body.style.overflow = "auto";
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => { });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPlaying, isMuted]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    scifiAudio.playHoloBeep(850, 0.05);
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    scifiAudio.playHoloBeep(700, 0.05);
    setIsMuted((prev) => !prev);
  };

  const handleReplay = () => {
    scifiAudio.playHoloBeep(900, 0.05);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = progress * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#081220] text-white select-none overflow-hidden animate-in fade-in duration-300 selection:bg-[#A10728] selection:text-[#FCF8F3]"
    >
      <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center">
        {/* Full-bleed HTML5 Video */}
        <video
          ref={videoRef}
          src={videoSrc}
          poster="/commercial_office_tower.jpg"
          muted={isMuted}
          playsInline
          autoPlay
          loop
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onClick={togglePlay}
          className="absolute inset-0 h-full w-full object-cover z-10 cursor-pointer"
        />

        {/* Ambient Dark Vignette overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#081220]/95 via-transparent to-[#081220]/80" />

        {/* Center Play Indicator */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#081220]/50 backdrop-blur-[2px] cursor-pointer"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#A10728]/40 bg-[#A10728] text-white shadow-2xl transition-transform hover:scale-110">
              <Play className="h-12 w-12 ml-2 fill-current" />
            </div>
          </div>
        )}

        {/* Top Header Bar */}
        <div
          className={`absolute top-0 left-0 right-0 z-40 flex items-center justify-between p-4 sm:p-6 md:p-10 transition-opacity duration-300 bg-gradient-to-b from-[#081220]/95 via-[#081220]/60 to-transparent gap-3 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Clickable Website Logo: Return to Homepage */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              scifiAudio.playHoloBeep(650, 0.08);
              onClose();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center cursor-pointer transition-transform duration-300 hover:scale-105 select-none"
            title="The Property Franchise - Return to Homepage"
            aria-label="The Property Franchise - Return to Homepage"
          >
            <div className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full overflow-hidden border border-white/20 shadow-md backdrop-blur-md flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:border-[#A10728]">
              <img
                src="/tpf_logo.jpg"
                alt="The Property Franchise"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </a>

          {/* Right Action: Close Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                scifiAudio.playHoloBeep(750, 0.08);
                onClose();
              }}
              className="group flex items-center gap-1.5 sm:gap-2 rounded-lg border border-[#FAF9F6]/20 bg-[#012169]/90 px-3 sm:px-5 py-2 sm:py-2.5 text-xs font-mono font-bold tracking-wider uppercase text-[#FAF9F6] backdrop-blur-md transition-all duration-200 hover:border-[#A10728] hover:bg-[#A10728] shadow-lg cursor-pointer"
              title="Close Video"
            >
              <span>Close</span>
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Bottom Video Controls HUD */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-40 p-4 sm:p-6 md:p-10 bg-gradient-to-t from-[#081220] via-[#081220]/85 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
          {/* Timeline Progress Scrubber */}
          <div
            onClick={handleSeek}
            className="group relative h-2 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-3 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-[#A10728] shadow-[0_0_10px_#A10728] transition-all duration-75"
              style={{
                width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              }}
            />
          </div>

          {/* Controls Bar Row */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#FAF9F6]/20 bg-[#012169] text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-[#A10728] cursor-pointer"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5 fill-current" />}
              </button>

              <button
                onClick={handleReplay}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#FAF9F6]/20 bg-[#012169]/70 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-[#A10728] cursor-pointer"
                title="Restart Video"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={toggleMute}
                className="flex items-center gap-2 rounded-lg border border-[#FAF9F6]/20 bg-[#012169]/70 px-4 py-2.5 text-xs font-mono backdrop-blur-md transition-all text-white hover:bg-[#A10728] cursor-pointer"
                title="Mute / Unmute (M)"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="h-4 w-4 text-[#A10728]" />
                    <span className="hidden sm:inline">MUTED</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-white" />
                    <span className="hidden sm:inline">AUDIO ON</span>
                  </>
                )}
              </button>

              <span className="font-mono text-xs text-[#FAF9F6]/80 ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Center Status Tag */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#FAF9F6]/80 bg-[#012169] px-4 py-2 rounded-full border border-[#FAF9F6]/20 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#A10728] animate-pulse" />
              <span>THE PROPERTY FRANCHISE // COMMERCIAL ARCHITECTURAL CINEMATICS</span>
            </div>

            {/* Right Controls: Fullscreen Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#38BDF8]/30 bg-[#0B254A]/70 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-[#0D7CD6] cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

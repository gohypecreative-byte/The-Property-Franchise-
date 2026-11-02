"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Rocket,
  Trophy,
  ArrowRight,
  RotateCcw,
  Play,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { scifiAudio } from "@/lib/audio";

interface Item {
  id: number;
  lane: number; // 0, 1, or 2
  y: number; // 0 to 100%
  type: "tower" | "logistics" | "retail" | "obstacle";
  value: number;
}

export function FranchiseMiniGame() {
  const [gameState, setGameState] = useState<"start" | "playing" | "won">("start");
  const [playerLane, setPlayerLane] = useState(1); // 0 (left), 1 (center), 2 (right)
  const [score, setScore] = useState(0);
  const targetScore = 800; // Target capital to unlock accreditation
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const [items, setItems] = useState<Item[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const startGame = () => {
    scifiAudio.playHoloBeep(920, 0.1);
    setScore(0);
    setPlayerLane(1);
    setItems([
      { id: 1, lane: 0, y: 15, type: "tower", value: 150 },
      { id: 2, lane: 1, y: 45, type: "logistics", value: 150 },
      { id: 3, lane: 2, y: 75, type: "retail", value: 150 },
    ]);
    nextId.current = 4;
    setGameState("playing");
  };

  const moveLeft = useCallback(() => {
    scifiAudio.playHoloBeep(800, 0.04);
    setPlayerLane((prev) => Math.max(0, prev - 1));
  }, []);

  const moveRight = useCallback(() => {
    scifiAudio.playHoloBeep(800, 0.04);
    setPlayerLane((prev) => Math.min(2, prev + 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        moveLeft();
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        moveRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, moveLeft, moveRight]);

  // Main game tick loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setItems((prevItems) => {
        const speed = 2.4;
        let newScore = score;
        let hitAccreditation = false;

        const updated = prevItems
          .map((item) => {
            const nextY = item.y + speed;

            // Check collision with player shuttle (around y: 80-92%)
            if (nextY >= 80 && nextY <= 92 && item.lane === playerLane) {
              if (item.type !== "obstacle") {
                scifiAudio.playHoloBeep(1100 + item.value, 0.08);
                newScore += item.value;
                if (newScore >= targetScore) {
                  hitAccreditation = true;
                }
              }
              return null;
            }

            if (nextY > 105) return null;
            return { ...item, y: nextY };
          })
          .filter(Boolean) as Item[];

        if (hitAccreditation) {
          scifiAudio.playHoloBeep(1400, 0.25);
          setScore(newScore);
          setGameState("won");
          return [];
        }

        if (newScore !== score) {
          setScore(newScore);
        }

        // Periodically spawn new commercial property opportunities
        if (Math.random() < 0.12 && updated.length < 5) {
          const lane = Math.floor(Math.random() * 3);
          const types: Array<"tower" | "logistics" | "retail"> = [
            "tower",
            "logistics",
            "retail",
          ];
          const chosenType = types[Math.floor(Math.random() * types.length)];
          updated.push({
            id: nextId.current++,
            lane,
            y: -5,
            type: chosenType,
            value: chosenType === "tower" ? 200 : 150,
          });
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, playerLane, score, targetScore]);

  const handleScrollToContact = () => {
    scifiAudio.playHoloBeep(980, 0.08);
    const elem = document.getElementById("contact-us");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToPlanets = () => {
    scifiAudio.playHoloBeep(980, 0.08);
    const elem = document.getElementById("horizontal-gallery") || document.getElementById("franchise-planets");
    if (elem) elem.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="franchise-game"
      className="relative z-20 bg-[#F7F9FC] px-6 py-20 sm:py-24 text-[#012169] selection:bg-[#E4002B] selection:text-[#F7F9FC] overflow-hidden"
    >
      <div className="mx-auto max-w-4xl">
        {/* Title Header with smooth reveal */}
        <div
          style={{
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            opacity: isVisible ? 1 : 0,
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out",
          }}
          className="flex flex-col items-center text-center mb-8 will-change-transform"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider text-center max-w-2xl mx-auto px-4">
            <span className="text-[#012169]">COMMERCIAL PORTFOLIO</span> <span className="text-[#E4002B]">&</span> <span className="text-[#012169]">TERRITORY SIMULATOR</span>
          </h2>
        </div>

        {/* Game Console Frame in Clean Off-White Elevated Card */}
        <div
          style={{
            transform: isVisible ? "scale(1) translateY(0)" : "scale(0.96) translateY(24px)",
            opacity: isVisible ? 1 : 0,
            transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 150ms, opacity 0.8s ease-out 150ms",
          }}
          className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#012169]/15 bg-[#F7F9FC] p-5 sm:p-9 shadow-[0_16px_50px_rgba(1,33,105,0.08)] text-[#012169] will-change-transform"
        >
          {/* ========================================================
              SCREEN 1: START SCREEN
             ======================================================== */}
          {gameState === "start" && (
            <div className="py-10 sm:py-14 flex flex-col items-center text-center animate-in fade-in duration-300">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 border-[#012169]/15 bg-white text-[#E4002B] shadow-md">
                <Rocket className="h-7 w-7 sm:h-8 sm:w-8 text-[#E4002B]" />
              </div>
              <h3 className="mt-5 text-xl sm:text-2xl font-black text-[#012169]">
                READY FOR FRANCHISE FLIGHT?
              </h3>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-[#012169]/80 font-sans leading-relaxed">
                Use your keyboard arrow keys or touch buttons to collect commercial office towers and logistics parks. Reach $800,000 in portfolio assets to qualify.
              </p>
              <button
                onClick={startGame}
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#E4002B] hover:bg-[#B8001F] text-[#FFFFFF] px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(228,0,43,0.3)] transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current text-[#FFFFFF]" />
                <span>Launch Franchise Flight</span>
              </button>
            </div>
          )}

          {/* ========================================================
              SCREEN 2: ACTIVE GAMEPLAY CANVAS
             ======================================================== */}
          {gameState === "playing" && (
            <div className="relative h-[340px] sm:h-[380px] w-full overflow-hidden rounded-2xl bg-[#0A1633] mt-2 border-2 border-[#0A1633]/20 select-none shadow-inner">
              {/* In-Game HUD: Score & Target */}
              <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-30 font-mono text-xs pointer-events-none">
                <div className="flex items-center gap-2 bg-[#0A1633]/85 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-[#E4002B] animate-pulse" />
                  <span className="font-bold text-white text-[10px] tracking-wide">CAPITAL:</span>
                  <span className="font-black text-[#FFFFFF] bg-[#E4002B] px-2 py-0.5 rounded text-[10px]">
                    ${score.toLocaleString()},000
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-white/80 bg-[#0A1633]/85 backdrop-blur px-2.5 py-1 rounded-lg border border-white/10">
                  TARGET: ${targetScore.toLocaleString()},000
                </div>
              </div>

              {/* Star Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

              {/* 3 Corridor Lanes */}
              <div className="absolute inset-0 grid grid-cols-3 divide-x divide-[#FFFFFF]/10 pointer-events-none" />

              {/* Falling Commercial Assets */}
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    left: `${item.lane * 33.33 + 16.66}%`,
                    top: `${item.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="absolute z-10 flex flex-col items-center transition-all duration-75"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-white/20 bg-[#14243E] text-white shadow-md">
                    <Building2 className="h-5 w-5 text-[#E4002B]" />
                  </div>
                  <span className="mt-1 rounded bg-[#E4002B] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#FFFFFF] shadow-sm">
                    +${item.value}K
                  </span>
                </div>
              ))}

              {/* Player Commercial Shuttle */}
              <div
                style={{
                  left: `${playerLane * 33.33 + 16.66}%`,
                  bottom: "16px",
                  transform: "translateX(-50%)",
                }}
                className="absolute z-20 flex flex-col items-center transition-all duration-150"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border-2 border-[#FFFFFF] bg-[#E4002B] text-white shadow-[0_0_20px_rgba(228,0,43,0.5)]">
                  <Rocket className="h-6 w-6 text-white -rotate-45" />
                </div>
                <div className="h-2 w-4 bg-[#E4002B] rounded-full blur-[2px] animate-pulse mt-0.5" />
              </div>

              {/* On-screen Mobile / Click Navigation Controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-auto">
                <button
                  onClick={moveLeft}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/20 bg-[#FFFFFF] text-[#0A1633] active:scale-95 cursor-pointer hover:bg-[#E4002B] hover:text-white transition-colors shadow-sm"
                  aria-label="Move Left"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="font-mono text-[10px] text-[#FFFFFF]/70 hidden sm:inline">
                  USE [ ← ] [ → ] KEYS OR BUTTONS TO STEER
                </span>
                <button
                  onClick={moveRight}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white/20 bg-[#FFFFFF] text-[#0A1633] active:scale-95 cursor-pointer hover:bg-[#E4002B] hover:text-white transition-colors shadow-sm"
                  aria-label="Move Right"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              SCREEN 3: VICTORY / COMPLETION STATE WITH CALL TO ACTION
             ======================================================== */}
          {gameState === "won" && (
            <div className="py-10 sm:py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-[#E4002B] text-white shadow-[0_4px_25px_rgba(228,0,43,0.35)]">
                <Trophy className="h-8 w-8 text-[#FFD700]" />
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#012169]/15 bg-white px-4 py-1 font-mono text-[10px] font-bold text-[#012169] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#E4002B]" />
                <span>FRANCHISE ACCREDITATION UNLOCKED</span>
              </div>
              <h3 className="mt-3 text-2xl sm:text-3xl font-black text-[#012169]">
                CONGRATULATIONS, CAPTAIN
              </h3>
              <p className="mt-2 max-w-md text-xs sm:text-sm text-[#012169]/80 font-sans leading-relaxed">
                You have demonstrated the strategic acumen to navigate and scale commercial real estate assets. Your territory accreditation is verified.
              </p>

              {/* Action Buttons to Connect to Business Objectives */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                <button
                  onClick={handleScrollToContact}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E4002B] hover:bg-[#B8001F] text-[#FFFFFF] py-3.5 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(228,0,43,0.25)] transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Enquire About Joining</span>
                  <ArrowRight className="h-4 w-4 text-[#FFFFFF]" />
                </button>
                <button
                  onClick={handleScrollToPlanets}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#012169] hover:bg-[#002B7F] text-[#FFFFFF] py-3.5 font-mono text-xs font-bold uppercase tracking-wider border border-[#012169]/30 shadow-md transition-colors cursor-pointer"
                >
                  <span>Explore Showcase</span>
                  <Sparkles className="h-4 w-4 text-[#E4002B]" />
                </button>
              </div>

              <button
                onClick={startGame}
                className="mt-4 flex items-center gap-1.5 font-mono text-[11px] font-medium text-[#012169]/70 hover:text-[#E4002B] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Replay Simulator Flight</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [phase, setPhase] = useState<"static" | "tracking" | "content">("static");
  const [contentVisible, setContentVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Canvas Static Effect & Orchestration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const drawStatic = () => {
      const idata = ctx.createImageData(canvas.width, canvas.height);
      const buffer = new Uint32Array(idata.data.buffer);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.random() > 0.5 ? 0xffffffff : 0xff000000;
      }
      ctx.putImageData(idata, 0, 0);
      animationFrame = requestAnimationFrame(drawStatic);
    };

    drawStatic();

    // Orchestration timers
    const trackingTimer = setTimeout(() => {
      setPhase("tracking");
      
      const contentTimer = setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        setPhase("content");
        setContentVisible(true);
      }, 800); // Duration of tracking roll

      return () => clearTimeout(contentTimer);
    }, 1200);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
      clearTimeout(trackingTimer);
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    const timerEl = timerRef.current;
    if (!timerEl) return;
    
    let timerFrame: number;
    const startTime = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const diff = now - startTime;
      const h = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      const f = Math.floor((diff % 1000) / 33).toString().padStart(2, "0");
      if (timerRef.current) {
        timerRef.current.textContent = `${h}:${m}:${s}:${f}`;
      }
      timerFrame = requestAnimationFrame(updateTimer);
    };

    updateTimer();
    return () => cancelAnimationFrame(timerFrame);
  }, []);

  const handlePlayClick = () => {
    setIsTransitioning(true);
    // Add the flash effect via body class or state
    document.body.style.filter = "brightness(2) contrast(2)";
    setTimeout(() => {
      document.body.style.filter = "";
      router.push("/library");
    }, 150);
  };

  return (
    <>
      {/* Phase 1 & 2: Static and Tracking */}
      <canvas
        ref={canvasRef}
        className={`static-canvas ${phase === "content" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        style={{ transition: "opacity 0.5s ease-out" }}
      />
      
      <div className={`tracking-band ${phase === "tracking" ? "tracking-active" : "hidden"}`} />

      {/* Navigation Shell */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-page py-gutter font-technical-data text-technical-data text-static-gray mix-blend-screen opacity-60 pointer-events-none">
        <div>TRACKING... AUTO</div>
        <div ref={timerRef}>00:00:00:00</div>
      </nav>

      {/* Phase 3: Content Canvas */}
      <main
        className={`relative z-20 flex-1 flex flex-col items-center justify-center text-center px-margin-page transition-opacity duration-1000 ease-in ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header / Logo Area */}
        <div className="mb-12">
          <h1 className="font-logo text-logo text-tape-cream crt-glow mb-2">
            REWOUND
          </h1>
          <p className="font-label-handwritten text-label-handwritten text-static-gray pulse-text italic">
            press play to remember
          </p>
        </div>

        {/* Play Button Component */}
        <button
          onClick={handlePlayClick}
          className="group relative flex flex-col items-center justify-center space-y-4 hover:scale-105 transition-transform duration-300"
          disabled={isTransitioning}
        >
          <div className="w-32 h-32 flex items-center justify-center bg-surface-container-low border-4 border-tape-cream/20 rounded-lg group-hover:border-primary transition-colors">
            <span
              className="material-symbols-outlined text-7xl text-tape-cream group-hover:text-primary transition-colors"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
          </div>
          <span className="font-vcr text-vcr text-static-gray group-hover:text-primary tracking-widest">
            PLAY
          </span>
        </button>

        {/* Secondary Link */}
        <div className="mt-16">
          <Link
            href="/library"
            className="font-vcr text-vcr text-static-gray hover:text-tape-cream flex items-center gap-2 transition-colors border-b border-transparent hover:border-static-gray pb-1"
          >
            Browse the Library 📼
          </Link>
        </div>
      </main>

      {/* UI Overlay Elements */}
      <div className="fixed bottom-margin-page right-margin-page z-50 flex items-center gap-2 font-vcr text-[12px] text-tape-cream">
        <span className="tracking-widest">REC</span>
        <div className="w-2.5 h-2.5 rounded-full bg-vhs-red blinking-rec shadow-[0_0_8px_rgba(255,77,77,0.8)]"></div>
      </div>
    </>
  );
}

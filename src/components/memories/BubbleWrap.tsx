"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_BUBBLES = 120;

export default function BubbleWrap() {
  const [poppedBubbles, setPoppedBubbles] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const showSuccess = poppedBubbles.size === TOTAL_BUBBLES;

  useEffect(() => {
    // Initialize AudioContext on first interaction to comply with browser policies
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener("mousedown", initAudio, { once: true });
    window.addEventListener("touchstart", initAudio, { once: true });
    
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        resetBubbles();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const playPopSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sine";
    const baseFreq = 400 + Math.random() * 600;
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const handlePop = (index: number) => {
    if (!poppedBubbles.has(index)) {
      playPopSound();
      setPoppedBubbles((prev) => new Set(prev).add(index));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.hasAttribute('data-index')) {
      const index = parseInt(target.getAttribute('data-index')!);
      handlePop(index);
    }
  };

  const resetBubbles = () => {
    setPoppedBubbles(new Set());
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-surface-container-lowest">
      <style>{`
        .bubble {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(253, 186, 89, 0.2), rgba(253, 186, 89, 0.05));
          box-shadow: 
              inset -2px -2px 6px rgba(0, 0, 0, 0.3),
              inset 2px 2px 6px rgba(255, 255, 255, 0.1),
              2px 4px 8px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        .bubble::after {
          content: '';
          position: absolute;
          top: 15%;
          left: 15%;
          width: 30%;
          height: 30%;
          background: rgba(255, 255, 255, 0.2);
          filter: blur(2px);
          border-radius: 50%;
        }
        .bubble.popped {
          background: rgba(30, 27, 24, 0.6);
          box-shadow: 
              inset 2px 2px 4px rgba(0, 0, 0, 0.6),
              inset -1px -1px 2px rgba(255, 255, 255, 0.05);
          transform: scale(0.95);
        }
        .bubble.popped::after {
          display: none;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Floating VHS Label Style Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
        <div className="inline-block bg-primary text-surface-container-lowest px-4 py-1 font-technical-data text-sm tracking-tighter transform -rotate-1 shadow-lg">
          MEM_STRESS_RELIEF_V1.0
        </div>
      </div>

      <div 
        className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-3 p-8 bg-surface-container/30 backdrop-blur-sm rounded-xl border border-outline-variant/20 shadow-2xl max-h-[85%] overflow-y-auto no-scrollbar"
        onTouchMove={handleTouchMove}
      >
        {Array.from({ length: TOTAL_BUBBLES }).map((_, i) => (
          <div
            key={i}
            data-index={i}
            className={`bubble ${poppedBubbles.has(i) ? "popped" : ""}`}
            onMouseDown={() => {
              setIsDragging(true);
              handlePop(i);
            }}
            onMouseEnter={() => {
              if (isDragging) handlePop(i);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handlePop(i);
            }}
            onMouseUp={() => setIsDragging(false)}
          />
        ))}
      </div>

      {showSuccess && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20">
          <span className="font-display-vhs text-primary text-6xl opacity-80 animate-pulse drop-shadow-md">ALL GONE.</span>
          <p className="font-technical-data text-on-surface-variant mt-4">RESETTING SYSTEM...</p>
        </div>
      )}

      {/* Footer Controls within the CRT */}
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end z-10 pointer-events-none">
        <button 
          onClick={resetBubbles}
          className="pointer-events-auto bg-surface-container border border-outline-variant/30 text-on-surface-variant px-4 py-2 font-technical-data hover:text-primary hover:border-primary transition-all active:scale-95"
        >
          [ CLEAR ]
        </button>
        <div className="text-right">
          <div className="text-primary/40 font-vt323 text-2xl mb-1">TRACKING...</div>
          <div className="font-vt323 text-5xl text-primary drop-shadow-[0_0_8px_rgba(253,186,89,0.4)]">
            POPPED: {poppedBubbles.size} / {TOTAL_BUBBLES}
          </div>
        </div>
      </div>
    </div>
  );
}

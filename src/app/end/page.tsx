"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function EndCardPage() {
  const [staticOpacity, setStaticOpacity] = useState(1);

  useEffect(() => {
    // Fade out the heavy static after 1 second
    const timer = setTimeout(() => {
      setStaticOpacity(0.1);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-primary overflow-hidden flex flex-col items-center justify-center p-4">
      <style>{`
        .static-noise {
          background: repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 0/2500px 2500px,
                      repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 50%/2500px 2500px;
          background-blend-mode: difference;
          animation: shift 0.2s infinite;
          width: 100%;
          height: 100%;
        }
        @keyframes shift {
          100% { background-position: 50% 0, 50% 50%; }
        }
        .vhs-text-glow {
          text-shadow: 2px 0 4px rgba(253,186,89,0.8), -2px 0 4px rgba(0,255,255,0.4);
        }
      `}</style>
      
      {/* Background Static */}
      <div 
        className="absolute inset-0 pointer-events-none static-noise transition-opacity duration-1000"
        style={{ opacity: staticOpacity }}
      />
      <div className="absolute inset-0 bg-blue-900/10 pointer-events-none mix-blend-screen" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-12 text-center max-w-2xl w-full">
        <h1 className="font-display-vhs text-6xl md:text-8xl tracking-tighter vhs-text-glow">
          BE KIND,
          <br />
          REWIND.
        </h1>
        
        <p className="font-body-md text-on-surface-variant text-sm md:text-base opacity-80 max-w-md">
          You've reached the end of the tape. What memory will you record next?
        </p>

        <div className="flex flex-col w-full gap-4 mt-8">
          <Link 
            href="/library"
            className="w-full bg-primary text-on-primary py-4 px-6 font-technical-data uppercase tracking-widest text-sm hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(253,186,89,0.3)]"
          >
            Browse the Library
          </Link>
          <Link 
            href="/player/steamy-window"
            className="w-full border border-primary text-primary py-4 px-6 font-technical-data uppercase tracking-widest text-sm hover:bg-primary/10 transition-all active:scale-95"
          >
            Play Again
          </Link>
          <Link 
            href="/record"
            className="w-full border border-outline-variant/30 text-on-surface-variant py-4 px-6 font-technical-data uppercase tracking-widest text-sm hover:text-on-surface hover:border-outline-variant/60 transition-all active:scale-95"
          >
            Record Your Own
          </Link>
        </div>
      </div>
      
      {/* Tape HUD elements */}
      <div className="absolute top-8 right-8 font-vcr text-2xl text-white/50 tracking-widest animate-pulse">
        END
      </div>
      <div className="absolute bottom-8 left-8 font-vcr text-xl text-white/50 tracking-widest">
        02:47:11
      </div>
    </div>
  );
}

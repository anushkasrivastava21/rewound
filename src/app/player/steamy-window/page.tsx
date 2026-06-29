"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TAPES } from "@/data/tapes";

const SteamyWindow = dynamic(
  () => import("@/components/memories/SteamyWindow"),
  { ssr: false }
);

function SteamyWindowContent() {
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500 pointer-events-none ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="static-noise absolute inset-0" />
        <div className="absolute font-vcr text-primary text-4xl tracking-widest animate-pulse">
          SEARCHING...
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
        <div className="w-full flex justify-between items-center">
          <Link
            className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors group"
            href="/library"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            <span className="text-xs uppercase tracking-widest">
              Eject Tape
            </span>
          </Link>
          <div className="font-vcr text-sm text-primary tracking-widest uppercase text-center flex-1">
            STEAMY WINDOW
          </div>
          <Link
            className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors group justify-end flex-1"
            href="/player/bubble-wrap"
          >
            <span className="text-xs uppercase tracking-widest">FF</span>
            <span className="material-symbols-outlined text-sm">fast_forward</span>
          </Link>
        </div>

        <div className="relative w-full aspect-video rounded-[32px] overflow-hidden crt-bezel bg-black group">
          <SteamyWindow />
        </div>

        <div className="flex gap-3 items-center">
          <div className="w-2 h-2 rounded-full bg-primary drop-shadow-[0_0_8px_rgba(253,186,89,1)]" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
          <div className="w-2 h-2 rounded-full bg-primary/20" />
        </div>
      </div>
    </>
  );
}

export default function SteamyWindowPage() {
  return (
    <div className="bg-surface-container-lowest text-on-surface overflow-hidden min-h-screen w-full flex items-center justify-center p-4">
      <style>{`
        .crt-bezel {
          box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 0 0 12px #221f1c;
          border: 2px solid #383431;
        }
        .static-noise {
          background: repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 0/2500px 2500px,
                      repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 50%/2500px 2500px;
          background-blend-mode: difference;
          animation: shift 0.2s infinite;
          width: 100%;
          height: 100%;
          opacity: 0.3;
        }
        @keyframes shift {
          100% { background-position: 50% 0, 50% 50%; }
        }
      `}</style>
      <Suspense fallback={<div className="font-vcr text-primary text-xl">LOADING TAPE...</div>}>
        <SteamyWindowContent />
      </Suspense>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { TAPES, type TapeData } from "@/data/tapes";

// ── Helper: route for a tape ──
function getMemoryRoute(tape: TapeData): string {
  return `/player/${tape.memoryType}`;
}

// ── TapeSpine sub-component ──
function TapeSpine({
  tape,
  onClick,
}: {
  tape: TapeData;
  onClick: () => void;
}) {
  return (
    <div
      className="relative flex-shrink-0 group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-10"
      onClick={onClick}
    >
      {/* Tooltip */}
      {tape.tooltip && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 bg-surface-container-high/90 backdrop-blur-md p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] border border-outline-variant/50">
          <p className="text-[10px] text-primary uppercase font-technical-data truncate">
            {tape.tooltip.title}
          </p>
          <p className="text-[9px] text-on-surface-variant font-technical-data">
            Plays: {tape.tooltip.plays} | {tape.tooltip.creator}
          </p>
          {tape.tooltip.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {tape.tooltip.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1 py-0.5 bg-secondary-container text-[8px] text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {/* The Tape */}
      <div
        className="w-14 h-80 border-x border-t border-white/5 flex flex-col items-center justify-between py-6 relative overflow-hidden"
        style={{ backgroundColor: tape.color }}
      >
        {/* Subtle highlight gradient */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 20%, white 0%, transparent 80%)",
          }}
        />
        {/* Label */}
        <div className="w-10 h-64 bg-[#fdf8e1] flex items-center justify-center border-l-2 border-black/10 overflow-hidden">
          <span
            className="font-label-handwritten text-lg text-zinc-800 tracking-tight whitespace-nowrap"
            style={{
              writingMode: "vertical-lr",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
            }}
          >
            {tape.label}
          </span>
        </div>
        {/* Format badge */}
        <div className="flex flex-col gap-1 items-center">
          <div className="w-1 h-1 bg-primary rounded-full" />
          <span className="text-[8px] font-technical-data text-white/40 uppercase">
            {tape.format}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Spacer tape (empty slot) ──
function TapeSpacer({ color = "#111" }: { color?: string }) {
  return (
    <div
      className="w-14 h-80 flex flex-shrink-0 border-t border-white/5"
      style={{ backgroundColor: color }}
    />
  );
}

// ── Main Library Page ──
export default function LibraryPage() {
  const shelfRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isVhsActive, setIsVhsActive] = useState(false);

  // Filter state (default to null to show all tapes)
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const regions = ["India", "Japan", "Brazil", "Global"];

  const filteredTapes = TAPES.filter((tape) => {
    return activeRegion ? tape.region === activeRegion : true;
  });

  // Horizontal scroll with mouse wheel
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        shelf.scrollLeft += e.deltaY;
      }
    };
    shelf.addEventListener("wheel", handleWheel, { passive: false });
    return () => shelf.removeEventListener("wheel", handleWheel);
  }, []);

  const handleTapeClick = (tape: TapeData) => {
    setIsVhsActive(true);
    const route = getMemoryRoute(tape);
    setTimeout(() => {
      setIsVhsActive(false);
      router.push(route);
    }, 1200);
  };

  const handleRandomMemory = () => {
    if (filteredTapes.length === 0) return;
    const randomTape = filteredTapes[Math.floor(Math.random() * filteredTapes.length)];
    handleTapeClick(randomTape);
  };

  return (
    <>
      <style>{`
        .vhs-transition-overlay {
          position: fixed;
          inset: 0;
          background: black;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .vhs-active .vhs-transition-overlay {
          animation: vhs-static 0.4s steps(4) forwards;
        }
        @keyframes vhs-static {
          0% { opacity: 0.8; transform: translateY(0); }
          25% { opacity: 0.9; transform: translateY(10px) scaleY(1.2); filter: contrast(200%) brightness(150%); }
          50% { opacity: 0.7; transform: translateY(-5px) scaleY(0.8); }
          75% { opacity: 1; transform: translateY(20px); filter: hue-rotate(90deg); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .shelf-wood {
          background: linear-gradient(to bottom, #3d2b1f 0%, #2a1a0f 100%);
          box-shadow: inset 0 10px 20px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5);
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className={isVhsActive ? "vhs-active" : ""}>
        <div className="vhs-transition-overlay" />

        {/* Navigation Header */}
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-page py-6">
          <Link
            className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors group"
            href="/"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs uppercase tracking-widest">back</span>
          </Link>
          <h1 className="font-display-vhs text-primary text-2xl tracking-tighter drop-shadow-[0_0_8px_rgba(253,186,89,0.3)]">
            LIBRARY
          </h1>
          <Link 
            href="/record"
            className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="text-xs uppercase tracking-widest">record (coming soon)</span>
            <span className="material-symbols-outlined text-sm group-hover:animate-pulse text-error">
              radio_button_checked
            </span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="w-full flex-grow pt-32 pb-48 flex flex-col items-center">
          {/* Filters */}
          <section className="w-full max-w-5xl px-gutter mb-12 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                {/* Region filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-technical-data text-outline uppercase">
                    Region:
                  </span>
                  <div className="flex gap-2">
                    {regions.map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          setActiveRegion(activeRegion === r ? null : r)
                        }
                        className={`px-3 py-1 text-xs font-technical-data border transition-all ${
                          activeRegion === r
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-surface-variant text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
              </div>
            </div>
            {/* Randomizer */}
            <button
              onClick={handleRandomMemory}
              className="group relative flex items-center gap-4 bg-primary text-on-primary px-8 py-4 font-technical-data text-sm uppercase tracking-widest overflow-hidden hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_20px_rgba(253,186,89,0.3)]"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
              <span className="material-symbols-outlined">shuffle</span>
              Jump to Random Memory
            </button>
          </section>

          {/* The Shelf */}
          <div className="relative w-full max-w-[1800px] group/shelf">
            <div className="absolute bottom-0 left-0 w-full h-8 shelf-wood z-10" />
            <div
              ref={shelfRef}
              className="flex items-end px-12 gap-1 overflow-x-auto no-scrollbar pb-8 pt-32"
            >
              {filteredTapes.map((tape, i) => (
                <div key={tape.id} className="contents">
                  <TapeSpine tape={tape} onClick={() => handleTapeClick(tape)} />
                </div>
              ))}
            </div>
            <div className="w-full h-12 bg-black/40 blur-xl" />
          </div>

          {/* Footer Stats */}
          <section className="mt-20 w-full max-w-5xl px-gutter grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-2">
              <span className="text-[10px] font-technical-data text-outline uppercase">
                Total Vault Size
              </span>
              <span className="text-2xl font-display-vhs text-primary">
                1,204 GB
              </span>
              <p className="text-xs text-on-surface-variant font-body-md opacity-60">
                Memories archived in analog-first digital containers.
              </p>
            </div>
            <div className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-2">
              <span className="text-[10px] font-technical-data text-outline uppercase">
                Active Tracking
              </span>
              <span className="text-2xl font-display-vhs text-primary">
                82 REELS
              </span>
              <p className="text-xs text-on-surface-variant font-body-md opacity-60">
                Community members currently browsing the stacks.
              </p>
            </div>
            <div className="p-6 border border-outline-variant/20 bg-surface-container-lowest flex flex-col gap-2">
              <span className="text-[10px] font-technical-data text-outline uppercase">
                System Status
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-error animate-pulse rounded-full" />
                <span className="text-2xl font-display-vhs text-on-surface">
                  READY
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-body-md opacity-60">
                High-fidelity playback enabled for all tape formats.
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

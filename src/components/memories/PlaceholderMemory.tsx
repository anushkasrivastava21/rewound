"use client";

export default function PlaceholderMemory({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
      <style>{`
        .scanline-placeholder {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.2) 50%,
            rgba(0,0,0,0.2)
          );
          background-size: 100% 4px;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
      `}</style>
      <div className="scanline-placeholder z-10" />
      
      {/* Test card pattern */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-[#BFBFBF]" />
        <div className="flex-1 bg-[#BFBF00]" />
        <div className="flex-1 bg-[#00BFBF]" />
        <div className="flex-1 bg-[#00BF00]" />
        <div className="flex-1 bg-[#BF00BF]" />
        <div className="flex-1 bg-[#BF0000]" />
        <div className="flex-1 bg-[#0000BF]" />
      </div>

      <div className="z-20 bg-black/80 px-8 py-6 border-2 border-tape-cream/30 backdrop-blur-sm flex flex-col items-center gap-4 max-w-md text-center">
        <span className="material-symbols-outlined text-5xl text-primary animate-pulse">
          videocam_off
        </span>
        <h2 className="font-display-vhs text-2xl text-tape-cream tracking-widest uppercase">
          {title}
        </h2>
        <p className="font-vcr text-sm text-static-gray">
          This tape is currently unspooled. Memory reconstruction is scheduled for Phase 3.
        </p>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-2" />
        <p className="font-technical-data text-xs text-error animate-blink mt-2">
          NO SIGNAL
        </p>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const ShadowPuppets = dynamic(
  () => import("@/components/memories/ShadowPuppets"),
  { ssr: false }
);

export default function ShadowPuppetsPage() {
  return (
    <div className="bg-surface-container-lowest text-on-surface overflow-hidden min-h-screen w-full flex items-center justify-center p-4">
      <style>{`
        .crt-bezel {
          box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 0 0 12px #221f1c;
          border: 2px solid #383431;
        }
      `}</style>

      <div className="flex flex-col items-center gap-6 w-full max-w-5xl">
        {/* Back Link */}
        <div className="w-full flex justify-start">
          <Link
            className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors group"
            href="/library"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs uppercase tracking-widest">Eject Tape</span>
          </Link>
        </div>

        {/* CRT Screen */}
        <div className="relative w-full aspect-video rounded-[32px] overflow-hidden crt-bezel bg-black group">
          <ShadowPuppets />
        </div>
      </div>
    </div>
  );
}

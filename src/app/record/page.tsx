"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecordMockupPage() {
  const [staticOpacity, setStaticOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStaticOpacity(0.05);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-surface-container-lowest text-on-surface flex flex-col p-8">
      <style>{`
        .static-noise {
          background: repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 0/2500px 2500px,
                      repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 50%/2500px 2500px;
          background-blend-mode: difference;
          animation: shift 0.2s infinite;
        }
        @keyframes shift {
          100% { background-position: 50% 0, 50% 50%; }
        }
      `}</style>
      
      <div 
        className="absolute inset-0 pointer-events-none static-noise transition-opacity duration-1000 z-50"
        style={{ opacity: staticOpacity }}
      />

      <header className="w-full flex justify-between items-center mb-12">
        <Link
          href="/library"
          className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors group"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span className="text-xs uppercase tracking-widest">Back to Library</span>
        </Link>
        <div className="flex items-center gap-2 font-technical-data text-error">
          <span className="material-symbols-outlined text-sm animate-pulse">radio_button_checked</span>
          <span className="text-xs uppercase tracking-widest">CREATOR STUDIO (BETA)</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-12">
        <div className="text-center">
          <h1 className="font-display-vhs text-4xl text-primary tracking-tighter mb-4">
            RECORD YOUR MEMORY
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
            Our creator tools are currently in closed beta. Soon, you will be able to synthesize your own tactile memories using our 5-step ML pipeline.
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: "01", title: "Select Source", icon: "folder_open", desc: "Upload raw footage or select a template." },
            { step: "02", title: "Connect ML", icon: "model_training", desc: "Map MediaPipe models to interactions." },
            { step: "03", title: "Add Physics", icon: "speed", desc: "Tune gravity, friction, and tactile response." },
            { step: "04", title: "VHS Filter", icon: "filter_b_and_w", desc: "Apply CRT distortion and color grading." },
            { step: "05", title: "Publish Tape", icon: "publish", desc: "Print the label and share globally." }
          ].map((item, idx) => (
            <div key={idx} className="bg-surface-container border border-outline-variant/30 p-6 flex flex-col items-center text-center gap-4 opacity-50 grayscale">
              <div className="font-vcr text-primary text-xs opacity-50">STEP {item.step}</div>
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">{item.icon}</span>
              <h3 className="font-technical-data text-sm uppercase tracking-widest">{item.title}</h3>
              <p className="font-body-md text-xs text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 border border-primary/30 bg-primary/5 text-center max-w-md w-full">
          <h2 className="font-vcr text-primary mb-2">COMING SOON</h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-6">
            Join the waitlist to be notified when the open innovation platform launches.
          </p>
          <button className="bg-primary text-on-primary font-technical-data text-xs uppercase tracking-widest px-6 py-3 w-full hover:brightness-110 transition-all active:scale-95">
            Join Waitlist
          </button>
        </div>
      </main>
    </div>
  );
}

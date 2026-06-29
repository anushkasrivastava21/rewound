"use client";

import { useEffect, useState } from "react";

export default function GlobalTimer() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // 2 minutes = 120000 ms
    const timer = setTimeout(() => {
      setShowToast(true);
      // Hide the toast after 10 seconds
      setTimeout(() => setShowToast(false), 10000);
    }, 120000);

    return () => clearTimeout(timer);
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-surface-container-high/90 backdrop-blur-md border border-primary/30 px-6 py-4 flex items-center gap-4 text-primary shadow-[0_0_15px_rgba(253,186,89,0.2)] animate-pulse">
      <span className="material-symbols-outlined text-xl">timer</span>
      <span className="font-technical-data text-xs uppercase tracking-widest text-on-surface">
        You've been rewinding for <span className="text-primary font-bold">2 minutes</span>.
      </span>
    </div>
  );
}

"use client";

import React from "react";

interface PermissionPromptProps {
  title: string;
  description: string;
  icon?: string; // material icon name
  onAllow: () => void;
  onSkip: () => void;
}

export default function PermissionPrompt({
  title,
  description,
  icon = "videocam",
  onAllow,
  onSkip,
}: PermissionPromptProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Static noise background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/stardust.png")',
        }}
      />
      <div className="relative max-w-md w-full mx-4 border border-outline-variant/30 bg-surface-container p-8 flex flex-col items-center gap-6">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Icon */}
        <div className="w-16 h-16 flex items-center justify-center border border-primary/30 bg-primary/10">
          <span className="material-symbols-outlined text-3xl text-primary">
            {icon}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display-vhs text-primary text-xl tracking-tight text-center">
          {title}
        </h2>

        {/* Description */}
        <p className="font-body-md text-on-surface-variant text-sm text-center leading-relaxed">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 w-full">
          <button
            onClick={onAllow}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary font-technical-data text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Allow
          </button>
          <button
            onClick={onSkip}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-surface-variant text-on-surface-variant border border-outline-variant/30 font-technical-data text-xs uppercase tracking-widest hover:border-primary/50 transition-all active:scale-95"
          >
            Skip
          </button>
        </div>

        {/* Footer hint */}
        <p className="text-[10px] font-technical-data text-outline text-center">
          You can always change this in your browser settings
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [name, setName] = useState("");
  const { login, isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
      router.push("/library");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <style>{`
        .login-static {
          background: repeating-radial-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 0/2500px 2500px,
                      repeating-conic-gradient(#000 0 0.0001%,#fff 0 0.0002%) 50% 50%/2500px 2500px;
          background-blend-mode: difference;
          animation: login-shift 0.5s infinite;
          opacity: 0.03;
        }
        @keyframes login-shift {
          100% { background-position: 50% 0, 50% 50%; }
        }
      `}</style>

      {/* Background static */}
      <div className="login-static fixed inset-0 pointer-events-none" />

      <div className="relative max-w-md w-full flex flex-col items-center gap-8">
        {/* Back link */}
        <div className="w-full flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 font-technical-data text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs uppercase tracking-widest">back</span>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="font-display-vhs text-primary text-3xl tracking-tight drop-shadow-[0_0_8px_rgba(253,186,89,0.3)]">
            {isLoggedIn ? "YOUR PROFILE" : "SIGN IN"}
          </h1>
          <p className="font-label-handwritten text-on-surface-variant text-lg mt-2">
            {isLoggedIn
              ? "Welcome back to the stacks"
              : "optional \u2014 only needed to publish or save favorites"}
          </p>
        </div>

        {isLoggedIn ? (
          /* ── Logged in state ── */
          <div className="w-full border border-outline-variant/20 bg-surface-container p-8 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary">
                person
              </span>
            </div>
            <div className="text-center">
              <p className="font-display-vhs text-on-surface text-xl">
                {user?.name}
              </p>
              <p className="font-technical-data text-outline text-xs mt-1 uppercase">
                Tape Collector
              </p>
            </div>
            <div className="w-full border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
              <Link
                href="/library"
                className="flex items-center gap-3 px-4 py-3 bg-surface-variant/50 hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-sm text-primary">
                  video_library
                </span>
                <span className="font-technical-data text-xs text-on-surface-variant uppercase tracking-widest">
                  Browse Library
                </span>
              </Link>
              <button className="flex items-center gap-3 px-4 py-3 bg-surface-variant/50 hover:bg-surface-variant transition-colors w-full text-left">
                <span className="material-symbols-outlined text-sm text-primary">
                  favorite
                </span>
                <span className="font-technical-data text-xs text-on-surface-variant uppercase tracking-widest">
                  My Favorites VHS Box
                </span>
              </button>
            </div>
            <button
              onClick={logout}
              className="mt-4 px-6 py-2 border border-error/30 text-error font-technical-data text-xs uppercase tracking-widest hover:bg-error/10 transition-all"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* ── Login form ── */
          <form
            onSubmit={handleSubmit}
            className="w-full border border-outline-variant/20 bg-surface-container p-8 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="font-technical-data text-[10px] text-outline uppercase tracking-widest"
              >
                Tape Label Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who does this tape belong to?"
                className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 font-body-md text-on-surface text-sm placeholder:text-outline/40 focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-on-primary font-technical-data text-sm uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(253,186,89,0.3)]"
            >
              <span className="material-symbols-outlined text-sm">
                play_arrow
              </span>
              Press Record
            </button>

            <p className="text-center text-[10px] font-technical-data text-outline">
              No email or password needed. Just a name for your tapes.
            </p>
          </form>
        )}

        {/* Skip link */}
        {!isLoggedIn && (
          <Link
            href="/library"
            className="font-technical-data text-xs text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            Skip — just browsing
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

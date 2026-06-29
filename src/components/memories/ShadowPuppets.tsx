"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import PermissionPrompt from "@/components/shared/PermissionPrompt";
import {
  classifyGesture,
  PUPPET_PATHS,
  type HandLandmark,
  type GestureResult,
  type PuppetType,
} from "@/lib/shadowGestures";
import * as MP from "@mediapipe/hands";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17] // Palm bottom
];

function drawHandShadows(
  ctx: CanvasRenderingContext2D,
  multiHandLandmarks: HandLandmark[][],
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);
  if (!multiHandLandmarks || multiHandLandmarks.length === 0) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  const thickness = Math.min(width, height) * 0.08;
  ctx.lineWidth = thickness;

  for (const landmarks of multiHandLandmarks) {
    ctx.beginPath();
    const palmIndices = [0, 1, 5, 9, 13, 17];
    ctx.moveTo(landmarks[0].x * width, landmarks[0].y * height);
    for (const i of palmIndices) {
      ctx.lineTo(landmarks[i].x * width, landmarks[i].y * height);
    }
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    for (const [start, end] of HAND_CONNECTIONS) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
    }
    ctx.stroke();
  }
}

const PROMPTS: Exclude<PuppetType, "none">[] = ["dog", "bird", "bunny", "alligator", "peace"];

const PROMPT_HINTS: Record<Exclude<PuppetType, "none">, string> = {
  dog: "Index & Middle straight, Thumb out for ear",
  bird: "Palms facing you, Thumbs crossed, Fingers out",
  bunny: "Index & Middle in V-shape, Thumb holds others",
  alligator: "Hand flat, drop your Thumb to make a mouth",
  peace: "Index & Middle up, Thumb holds others down",
};

export default function ShadowPuppets() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gesture, setGesture] = useState<GestureResult | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Minigame State
  const [completedPrompts, setCompletedPrompts] = useState<Set<Exclude<PuppetType, "none">>>(new Set());
  const [successAnimPuppet, setSuccessAnimPuppet] = useState<Exclude<PuppetType, "none"> | null>(null);
  const stateRef = useRef({ holdStart: 0, currentTarget: "none" as PuppetType });

  const handleSuccess = useCallback((puppet: Exclude<PuppetType, "none">) => {
    setSuccessAnimPuppet(puppet);
    setCompletedPrompts(prev => {
      const next = new Set(prev);
      next.add(puppet);
      return next;
    });
    
    setTimeout(() => {
      setSuccessAnimPuppet(null);
    }, 2000);
  }, []);

  const { requestCamera, stopCamera } = useCamera(videoRef, {
    width: 320,
    height: 240,
  });

  const handleAllow = useCallback(async () => {
    setShowPermissionPrompt(false);
    setIsLoading(true);

    const stream = await requestCamera();
    if (!stream) {
      setFallbackMode(true);
      setIsLoading(false);
      return;
    }

    try {
      const HandsClass = MP.Hands || (MP as any).default?.Hands || (window as any).Hands;
      if (!HandsClass) throw new Error("MediaPipe Hands not found");

      const hands = new HandsClass({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        const canvas = canvasRef.current;
        if (canvas) {
          if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
          }
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Mirror X for shadows
            const mirroredLandmarks = results.multiHandLandmarks?.map(hand => 
              hand.map(l => ({ ...l, x: 1 - l.x }))
            ) || [];
            drawHandShadows(ctx, mirroredLandmarks, canvas.width, canvas.height);
          }
        }

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks: HandLandmark[] = results.multiHandLandmarks[0].map(
            (l) => ({ x: 1 - l.x, y: l.y, z: l.z })
          );
          const result = classifyGesture(landmarks);
          setGesture(result);

          // Minigame Logic: Check if currently held puppet is matching and confident
          if (result.puppet !== "none" && result.confidence >= 0.6) {
            if (stateRef.current.currentTarget !== result.puppet) {
              stateRef.current.currentTarget = result.puppet;
              stateRef.current.holdStart = performance.now();
            } else if (performance.now() - stateRef.current.holdStart > 1000) {
              setCompletedPrompts(prev => {
                if (!prev.has(result.puppet as any)) {
                  handleSuccess(result.puppet as any);
                }
                return prev;
              });
            }
          } else {
            stateRef.current.currentTarget = "none";
            stateRef.current.holdStart = 0;
          }
        } else {
          setGesture(null);
          stateRef.current.currentTarget = "none";
          stateRef.current.holdStart = 0;
        }
      });

      // Frame loop
      const video = videoRef.current!;
      const sendFrame = async () => {
        if (video.readyState >= 2) {
          await hands.send({ image: video });
        }
        requestAnimationFrame(sendFrame);
      };

      if (video.readyState >= 2) {
        setIsLoading(false);
        sendFrame();
      } else {
        video.addEventListener("loadeddata", () => {
          setIsLoading(false);
          sendFrame();
        });
      }
    } catch (err) {
      console.error("Failed to load MediaPipe:", err);
      setFallbackMode(true);
      setIsLoading(false);
    }
  }, [requestCamera, handleSuccess]);

  const handleSkip = useCallback(() => {
    setShowPermissionPrompt(false);
    setFallbackMode(true);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const isCompleted = completedPrompts.size === PROMPTS.length;

  return (
    <>
      {showPermissionPrompt && (
        <PermissionPrompt
          icon="front_hand"
          title="ENABLE CAMERA?"
          description="Make shadow puppets with your hands! The camera tracks your hand shape and projects shadows on the wall."
          onAllow={handleAllow}
          onSkip={handleSkip}
        />
      )}

      <div ref={containerRef} className="absolute inset-0 overflow-hidden font-body-md">
        {/* Hidden video */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />

        {/* Wall background with warm amber light */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 95%, rgba(232, 168, 73, 0.3) 0%, transparent 70%),
              linear-gradient(to top, #3d2b1f 0%, #2a1a0f 30%, #1a1208 100%)
            `,
          }}
        >
          {/* Plaster texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'url("https://www.transparenttextures.com/patterns/concrete-wall.png")',
            }}
          />
        </div>

        {/* Canvas for rendering realistic hand shadows */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000"
          style={{
            filter: "blur(6px) drop-shadow(4px 10px 10px rgba(0,0,0,0.6))",
            opacity: 0.85,
            transform: "scaleY(1.05) scaleX(1.02)", 
          }}
        />

        {/* Light source glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 z-20 pointer-events-none">
          <div className="w-full h-full bg-memory-warm/20 rounded-full blur-3xl" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-memory-warm/60 rounded-full blur-md" />
        </div>

        {/* Success Animation Overlay */}
        {successAnimPuppet && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-primary/20 animate-pulse" />
            <div className="font-label-handwritten text-6xl md:text-8xl text-primary drop-shadow-[0_0_20px_rgba(253,186,89,1)] scale-150 animate-bounce text-center">
              IT'S A {successAnimPuppet.toUpperCase()}!
            </div>
          </div>
        )}

        {/* Minigame HUD (Checklist Sidebar) */}
        {!showPermissionPrompt && !isLoading && (
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-black/40 backdrop-blur-sm border-l border-white/10 z-30 p-6 flex flex-col pointer-events-none">
            <h2 className="font-vcr text-primary text-xl mb-6 tracking-widest text-center">SHAPE GUIDE</h2>
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
              {PROMPTS.map(puppet => {
                const isChecked = completedPrompts.has(puppet);
                return (
                  <div key={puppet} className={`flex flex-col gap-2 transition-opacity duration-500 ${isChecked ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-sm ${isChecked ? 'border-primary bg-primary/20 text-primary' : 'border-white/40'}`}>
                        {isChecked && <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>check</span>}
                      </div>
                      <span className="font-label-handwritten text-2xl text-tape-cream capitalize">{puppet}</span>
                    </div>
                    {!isChecked && (
                      <div className="flex gap-2">
                        <svg viewBox="0 0 140 100" className="w-16 h-12 shrink-0 drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]" style={{ fill: "rgba(255,255,255,0.6)" }}>
                          <path d={PUPPET_PATHS[puppet]} />
                        </svg>
                        <p className="font-technical-data text-[10px] leading-tight text-white/60">
                          {PROMPT_HINTS[puppet]}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {isCompleted && (
              <div className="mt-6 text-center animate-in fade-in zoom-in duration-1000">
                <div className="font-label-handwritten text-3xl text-primary drop-shadow-[0_0_10px_rgba(253,186,89,1)]">
                  Master Puppeteer!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="font-vcr text-primary text-2xl tracking-widest animate-pulse">
              TRACKING HANDS...
            </div>
          </div>
        )}

        {/* VHS HUD */}
        <div className="absolute inset-0 z-50 p-8 pointer-events-none font-vcr flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-error flex items-center gap-2 drop-shadow-[0_0_5px_rgba(25,0,0,0.8)]">
              <span className="w-4 h-4 bg-error rounded-full animate-blink" />
              <span className="text-2xl">REC 00:06:12</span>
            </div>
            {/* The right side VHS text is pushed left by the sidebar */}
            <div className="text-right mr-64">
              <div className="text-on-surface-variant/50 font-label-handwritten text-3xl">
                Shadow Puppets
              </div>
            </div>
          </div>
          <div className="text-center text-primary/30 text-xs font-technical-data tracking-[0.2em] mr-64">
            {fallbackMode
              ? "CAMERA REQUIRED FOR FULL EXPERIENCE"
              : "MATCH YOUR HAND SHAPE WITH THE GUIDE"}
          </div>
        </div>
      </div>
    </>
  );
}

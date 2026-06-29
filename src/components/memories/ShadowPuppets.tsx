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

export default function ShadowPuppets() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gesture, setGesture] = useState<GestureResult | null>(null);
  const [recognizedLabel, setRecognizedLabel] = useState<string | null>(null);
  const [labelVisible, setLabelVisible] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [smoothPos, setSmoothPos] = useState({ x: 0.5, y: 0.5 });
  const gestureHoldRef = useRef<{ puppet: PuppetType; startTime: number } | null>(null);

  const { requestCamera, stopCamera } = useCamera(videoRef, {
    width: 320,
    height: 240,
  });

  // Light source at bottom-center
  const LIGHT_X = 0.5;
  const LIGHT_Y = 0.95;

  const handleAllow = useCallback(async () => {
    setShowPermissionPrompt(false);
    setIsLoading(true);

    const stream = await requestCamera();
    if (!stream) {
      setFallbackMode(true);
      setIsLoading(false);
      return;
    }

    // Dynamically import MediaPipe Hands
    try {
      const { Hands } = await import("@mediapipe/hands");

      const hands = new Hands({
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
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks: HandLandmark[] = results.multiHandLandmarks[0].map(
            (l) => ({ x: l.x, y: l.y, z: l.z })
          );
          const result = classifyGesture(landmarks);
          setGesture(result);

          // Track gesture hold time for label display
          if (result.puppet !== "none" && result.confidence > 0.6) {
            if (
              !gestureHoldRef.current ||
              gestureHoldRef.current.puppet !== result.puppet
            ) {
              gestureHoldRef.current = {
                puppet: result.puppet,
                startTime: performance.now(),
              };
            } else if (
              performance.now() - gestureHoldRef.current.startTime >
              500
            ) {
              const labels: Record<Exclude<PuppetType, "none">, string> = {
                dog: "a dog!",
                bird: "a bird!",
                bunny: "a bunny!",
                alligator: "an alligator!",
                peace: "peace ✌️",
              };
              setRecognizedLabel(labels[result.puppet]);
              setLabelVisible(true);
              // Hide label after 2s
              setTimeout(() => setLabelVisible(false), 2000);
            }
          } else {
            gestureHoldRef.current = null;
          }
        } else {
          setGesture(null);
          gestureHoldRef.current = null;
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

      video.addEventListener("loadeddata", () => {
        setIsLoading(false);
        sendFrame();
      });
    } catch (err) {
      console.error("Failed to load MediaPipe:", err);
      setFallbackMode(true);
      setIsLoading(false);
    }
  }, [requestCamera]);

  const handleSkip = useCallback(() => {
    setShowPermissionPrompt(false);
    setFallbackMode(true);
  }, []);

  // ── Fallback: mouse-following shadow ──
  useEffect(() => {
    if (!fallbackMode) return;
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setGesture({
        puppet: "dog",
        confidence: 1,
        centroid: { x, y },
        wristAngle: 0,
        mouthOpen: false,
      });
    };

    const onClick = () => {
      setGesture((prev) =>
        prev ? { ...prev, mouthOpen: !prev.mouthOpen } : prev
      );
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("click", onClick);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("click", onClick);
    };
  }, [fallbackMode]);

  // ── Smooth position interpolation ──
  useEffect(() => {
    if (!gesture) return;
    let raf: number;
    let current = { ...smoothPos };
    const lerp = () => {
      const target = gesture.centroid;
      current = {
        x: current.x + (target.x - current.x) * 0.15,
        y: current.y + (target.y - current.y) * 0.15,
      };
      setSmoothPos({ ...current });
      raf = requestAnimationFrame(lerp);
    };
    raf = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesture]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ── Shadow projection calculations ──
  const distFromLight = Math.sqrt(
    (smoothPos.x - LIGHT_X) ** 2 + (smoothPos.y - LIGHT_Y) ** 2
  );
  const shadowScale = 1 + distFromLight * 1.5;
  const shadowBlur = distFromLight * 8;
  const shadowStretchY = 1 + distFromLight * 0.5;
  const currentPuppet = gesture?.puppet ?? "none";
  const svgPath = currentPuppet !== "none" ? PUPPET_PATHS[currentPuppet] : null;

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

      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        {/* Hidden video */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="hidden" />

        {/* Wall background with warm amber light */}
        <div
          className="absolute inset-0"
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

        {/* Light source glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32">
          <div className="w-full h-full bg-memory-warm/20 rounded-full blur-3xl" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-memory-warm/60 rounded-full blur-md" />
        </div>

        {/* Shadow puppet projection */}
        {svgPath && gesture && (
          <div
            className="absolute transition-all duration-75"
            style={{
              left: `${smoothPos.x * 100}%`,
              top: `${smoothPos.y * 100}%`,
              transform: `
                translate(-50%, -50%)
                scale(${shadowScale})
                scaleY(${shadowStretchY})
                rotate(${(gesture.wristAngle * 180) / Math.PI + 90}deg)
              `,
              filter: `blur(${shadowBlur}px)`,
              opacity: 0.7,
            }}
          >
            <svg
              viewBox="0 0 140 100"
              className="w-48 h-36"
              style={{
                fill: "rgba(0,0,0,0.8)",
                transition: "transform 0.1s ease-out",
                transform: gesture.mouthOpen
                  ? "scaleY(1.1)"
                  : "scaleY(1)",
              }}
            >
              <path d={svgPath} />
            </svg>
          </div>
        )}

        {/* Recognition label */}
        {recognizedLabel && (
          <div
            className={`absolute top-1/4 left-1/2 -translate-x-1/2 font-label-handwritten text-4xl text-tape-cream/70 transition-opacity duration-500 ${
              labelVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {recognizedLabel}
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

        {/* HUD */}
        <div className="absolute inset-0 z-30 p-8 pointer-events-none font-vcr flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-error flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">
              <span className="w-4 h-4 bg-error rounded-full animate-blink" />
              <span className="text-2xl">REC 00:06:12</span>
            </div>
            <div className="text-on-surface-variant/50 font-label-handwritten text-3xl">
              Shadow Puppets
            </div>
          </div>
          <div className="text-center text-primary/30 text-xs font-technical-data tracking-[0.2em]">
            {fallbackMode
              ? "MOVE YOUR MOUSE · CLICK TO ANIMATE"
              : "MAKE HAND SHAPES IN FRONT OF THE CAMERA"}
          </div>
        </div>
      </div>
    </>
  );
}

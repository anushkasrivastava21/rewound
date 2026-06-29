"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import { useBlowDetection } from "@/hooks/useBlowDetection";
import PermissionPrompt from "@/components/shared/PermissionPrompt";

interface SteamyWindowProps {
  onReset?: () => void;
}

export default function SteamyWindow({ onReset }: SteamyWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement>(null);

  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // Fog density grid (lower resolution for performance)
  const fogGridRef = useRef<Float32Array | null>(null);
  const gridColsRef = useRef(0);
  const gridRowsRef = useRef(0);
  const GRID_SCALE = 4; // each grid cell = 4x4 pixels

  const { requestCamera, stopCamera } = useCamera(videoRef);
  const { isBlowing, intensity, startListening, stopListening } =
    useBlowDetection();

  // ── Permission flow ──
  const handleAllow = useCallback(async () => {
    setShowPermissionPrompt(false);
    const stream = await requestCamera();
    if (stream) {
      setHasCameraAccess(true);
      await startListening();
    }
  }, [requestCamera, startListening]);

  const handleSkip = useCallback(() => {
    setShowPermissionPrompt(false);
  }, []);

  // ── Canvas sizing ──
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ w: Math.floor(width), h: Math.floor(height) });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // ── Initialize fog grid when canvas resizes ──
  useEffect(() => {
    if (canvasSize.w === 0 || canvasSize.h === 0) return;

    const cols = Math.ceil(canvasSize.w / GRID_SCALE);
    const rows = Math.ceil(canvasSize.h / GRID_SCALE);
    gridColsRef.current = cols;
    gridRowsRef.current = rows;

    const grid = new Float32Array(cols * rows);
    grid.fill(1.0); // full fog
    fogGridRef.current = grid;

    // Set canvas dimensions
    [fogCanvasRef, cameraCanvasRef].forEach((ref) => {
      if (ref.current) {
        ref.current.width = canvasSize.w;
        ref.current.height = canvasSize.h;
      }
    });
  }, [canvasSize]);

  // ── Camera feed → canvas (mirrored, subtle reflection) ──
  useEffect(() => {
    if (!hasCameraAccess) return;
    const video = videoRef.current;
    const canvas = cameraCanvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const drawFrame = () => {
      if (video.readyState >= 2) {
        ctx.save();
        // Mirror the camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.globalAlpha = 0.15; // subtle ghostly reflection
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      raf = requestAnimationFrame(drawFrame);
    };
    drawFrame();
    return () => cancelAnimationFrame(raf);
  }, [hasCameraAccess, canvasSize]);

  // ── Fog rendering + physics loop ──
  useEffect(() => {
    const fogCanvas = fogCanvasRef.current;
    if (!fogCanvas || canvasSize.w === 0) return;
    const ctx = fogCanvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap dt
      lastTime = time;

      const grid = fogGridRef.current;
      if (!grid) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const cols = gridColsRef.current;
      const rows = gridRowsRef.current;

      // ── Re-fog physics ──
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          if (grid[idx] < 1.0) {
            // Position-dependent recovery: edges are colder → faster re-fog
            const nx = col / cols; // 0-1
            const ny = row / rows;
            const edgeDist = Math.min(nx, 1 - nx, ny, 1 - ny); // 0 at edge, 0.5 at center
            const recoveryRate = 0.02 + (0.5 - edgeDist) * 0.12; // 0.02 center, ~0.08 edges
            grid[idx] = Math.min(1.0, grid[idx] + recoveryRate * dt);
          }
        }
      }

      // ── Blow clearing ──
      if (isBlowing && intensity > 0) {
        const centerCol = Math.floor(cols / 2);
        const centerRow = Math.floor(rows / 2);
        const radius = Math.floor((intensity * cols) / 2.5);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const dx = col - centerCol;
            const dy = row - centerRow;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
              const falloff = 1 - dist / radius;
              const clearAmount = falloff * intensity * 3 * dt;
              const idx = row * cols + col;
              grid[idx] = Math.max(0, grid[idx] - clearAmount);
            }
          }
        }
      }

      // ── Render fog to canvas ──
      const imgData = ctx.createImageData(canvasSize.w, canvasSize.h);
      const pixels = imgData.data;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const density = grid[row * cols + col];
          const alpha = Math.floor(density * 230); // max ~90% opacity

          // Fill the GRID_SCALE x GRID_SCALE pixel block
          for (let py = 0; py < GRID_SCALE; py++) {
            for (let px = 0; px < GRID_SCALE; px++) {
              const pixelX = col * GRID_SCALE + px;
              const pixelY = row * GRID_SCALE + py;
              if (pixelX >= canvasSize.w || pixelY >= canvasSize.h) continue;
              const i = (pixelY * canvasSize.w + pixelX) * 4;
              pixels[i] = 220;     // R (warm fog)
              pixels[i + 1] = 215; // G
              pixels[i + 2] = 205; // B
              pixels[i + 3] = alpha;
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [canvasSize, isBlowing, intensity]);

  // ── Touch/mouse wipe interaction ──
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;

    let isDrawing = false;

    const wipeAt = (clientX: number, clientY: number) => {
      const grid = fogGridRef.current;
      if (!grid) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const cols = gridColsRef.current;
      const rows = gridRowsRef.current;
      const gridX = Math.floor(x / GRID_SCALE);
      const gridY = Math.floor(y / GRID_SCALE);
      const brushRadius = 8; // grid cells

      for (let dy = -brushRadius; dy <= brushRadius; dy++) {
        for (let dx = -brushRadius; dx <= brushRadius; dx++) {
          const gx = gridX + dx;
          const gy = gridY + dy;
          if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > brushRadius) continue;
          // Gaussian-like falloff
          const falloff = Math.exp((-dist * dist) / (brushRadius * 0.6) ** 2);
          const idx = gy * cols + gx;
          grid[idx] = Math.max(0, grid[idx] - falloff * 0.8);
        }
      }
    };

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      const { clientX, clientY } =
        "touches" in e ? e.touches[0] : e;
      wipeAt(clientX, clientY);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { clientX, clientY } =
        "touches" in e ? e.touches[0] : e;
      wipeAt(clientX, clientY);
    };

    const onUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onUp);

    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onUp);
      canvas.removeEventListener("touchstart", onDown);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onUp);
    };
  }, [canvasSize]);

  // ── Reset handler ──
  const handleReset = useCallback(() => {
    const grid = fogGridRef.current;
    if (grid) grid.fill(1.0);
    onReset?.();
  }, [onReset]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      stopCamera();
      stopListening();
    };
  }, [stopCamera, stopListening]);

  return (
    <>
      {showPermissionPrompt && (
        <PermissionPrompt
          icon="videocam"
          title="ENABLE CAMERA + MIC?"
          description="Wipe the fog to see your reflection — like a real steamy window. Blow into your mic to clear the fog away."
          onAllow={handleAllow}
          onSkip={handleSkip}
        />
      )}

      <div ref={containerRef} className="absolute inset-0">
        {/* Hidden video element for camera feed */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
          autoPlay
        />

        {/* Layer 0: Bokeh background (always shown) */}
        <div
          className="absolute inset-0 bg-[#0a0a20]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(253, 186, 89, 0.15) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(130, 85, 255, 0.1) 0%, transparent 50%)",
          }}
        >
          <div className="absolute inset-0 backdrop-blur-[12px]" />
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        {/* Layer 1: Camera canvas (subtle reflection) */}
        <canvas
          ref={cameraCanvasRef}
          className="absolute inset-0 z-[1]"
        />

        {/* Layer 2: Fog canvas (interactive) */}
        <canvas
          ref={fogCanvasRef}
          className="absolute inset-0 z-10 cursor-crosshair"
          style={{ touchAction: "none" }}
        />

        {/* Layer 3: Rain overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* HUD Layer */}
      <div className="absolute inset-0 z-30 p-8 pointer-events-none font-vcr flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="text-error flex items-center gap-2 drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">
            <span className="w-4 h-4 bg-error rounded-full animate-blink" />
            <span className="text-2xl">REC 00:03:42</span>
          </div>
          <div className="text-on-surface-variant/50 font-label-handwritten text-3xl">
            Steamy Window
          </div>
        </div>

        {/* Interaction Hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 text-primary text-sm font-technical-data tracking-[0.2em] transition-opacity duration-1000">
          {hasCameraAccess ? "WIPE OR BLOW TO REMEMBER" : "WIPE TO REMEMBER"}
        </div>

        {/* Bottom bar */}
        <div className="w-full flex justify-between items-end">
          {/* Blow indicator */}
          {isBlowing && (
            <div className="pointer-events-none flex items-center gap-2 text-primary animate-pulse">
              <span className="material-symbols-outlined text-sm">air</span>
              <span className="text-xs font-technical-data uppercase tracking-widest">
                Detecting Blow...
              </span>
            </div>
          )}
          <div className="flex-1" />

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/30 text-on-surface-variant hover:text-primary font-technical-data text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">eject</span>
            RESET
          </button>
        </div>
      </div>
    </>
  );
}

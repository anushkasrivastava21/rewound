"use client";

import { useEffect, useRef, useState } from "react";
import { useBlowDetection } from "@/hooks/useBlowDetection";
import { useFaceBlowDetection } from "@/hooks/useFaceBlowDetection";

class Seed {
  originX: number;
  originY: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  isAttached: boolean;
  vx: number;
  vy: number;
  friction: number;
  gravity: number;
  windX: number;
  wobbleFreq: number;
  wobbleAmp: number;
  phase: number;
  life: number;
  size: number;
  stem: { x: number; y: number; h: number };

  constructor(x: number, y: number, angle: number, stem: { x: number; y: number; h: number }, isAttached = true) {
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = 80 + Math.random() * 20;
    this.isAttached = isAttached;
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.98;
    this.gravity = 0.02;
    this.windX = 0.1 + Math.random() * 0.3;
    this.wobbleFreq = Math.random() * 0.1;
    this.wobbleAmp = Math.random() * 2;
    this.phase = Math.random() * Math.PI * 2;
    this.life = 1.0;
    this.size = 1 + Math.random() * 2;
    this.stem = stem;

    if (this.isAttached) {
      this.updatePosition();
    }
  }

  updatePosition() {
    if (this.isAttached) {
      this.x = this.stem.x + Math.cos(this.angle) * (this.radius * 0.3);
      this.y = this.stem.y - this.stem.h + Math.sin(this.angle) * (this.radius * 0.3);
    } else {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.vx += this.windX;
      this.x += this.vx + Math.sin(this.phase + Date.now() * 0.005) * this.wobbleAmp;
      this.y += this.vy;
      this.life -= 0.002;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.life * 0.8;
    ctx.strokeStyle = '#e9e1dc';
    ctx.lineWidth = 0.5;

    if (this.isAttached) {
      ctx.beginPath();
      ctx.moveTo(this.stem.x, this.stem.y - this.stem.h);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2 + (Date.now() * 0.01);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(ang) * 4, this.y + Math.sin(ang) * 4);
      ctx.stroke();
    }

    ctx.restore();
  }
}

export default function Dandelion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiPromptRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inputMode, setInputMode] = useState<'prompt' | 'mic' | 'camera' | 'none'>('prompt');
  
  const { isBlowing: micBlowing, intensity: micIntensity, startListening: startMic } = useBlowDetection();
  const { isBlowing: camBlowing, intensity: camIntensity, startListening: startCam } = useFaceBlowDetection(videoRef);

  const blowingRef = useRef(false);
  const intensityRef = useRef(0);

  useEffect(() => {
    blowingRef.current = micBlowing || camBlowing;
    intensityRef.current = Math.max(micIntensity, camIntensity);
  }, [micBlowing, camBlowing, micIntensity, camIntensity]);

  const handleSelectMode = (mode: 'mic' | 'camera' | 'none') => {
    setInputMode(mode);
    if (mode === 'mic') startMic();
    if (mode === 'camera') startCam();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Seed[] = [];
    let headParticles: Seed[] = [];
    let stem = { x: 0, y: 0, h: 0 };
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };
    let regrowthTimer: NodeJS.Timeout | null = null;

    const resize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      stem.x = width / 2;
      stem.y = height;
      stem.h = height * 0.45;
    };

    const createDandelion = () => {
      particles = [];
      headParticles = [];
      const count = 120;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const seed = new Seed(0, 0, angle, stem, true);
        headParticles.push(seed);
      }
      if (uiPromptRef.current) {
        uiPromptRef.current.classList.remove('opacity-100');
        uiPromptRef.current.classList.add('opacity-0');
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Stem
      ctx.beginPath();
      ctx.strokeStyle = '#2d4a2d';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.moveTo(stem.x, stem.y);
      ctx.quadraticCurveTo(stem.x + 10, stem.y - stem.h / 2, stem.x, stem.y - stem.h);
      ctx.stroke();

      // Draw Base of Head
      ctx.fillStyle = '#3a2b1a';
      ctx.beginPath();
      ctx.arc(stem.x, stem.y - stem.h, 6, 0, Math.PI * 2);
      ctx.fill();

      // Handle blowing from mic/camera
      if (blowingRef.current && intensityRef.current > 0) {
        for (let i = headParticles.length - 1; i >= 0; i--) {
          if (Math.random() < intensityRef.current * 0.15) {
            const p = headParticles[i];
            p.isAttached = false;
            p.vx = (Math.random() + 0.5) * intensityRef.current * 10;
            p.vy = (Math.random() - 0.5) * 5 - 2;
            particles.push(p);
            headParticles.splice(i, 1);
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.updatePosition();
        p.draw(ctx);
        if (p.x > width + 100 || p.y > height + 100 || p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      headParticles.forEach(p => {
        p.updatePosition();
        p.draw(ctx);
      });

      if (headParticles.length < 10 && particles.length > 0) {
        if (uiPromptRef.current) {
          uiPromptRef.current.classList.remove('opacity-0');
          uiPromptRef.current.classList.add('opacity-100');
        }
      }

      if (headParticles.length === 0 && !regrowthTimer) {
        regrowthTimer = setTimeout(() => {
          createDandelion();
          regrowthTimer = null;
        }, 5000);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    const handleBlowDrag = (ex: number, ey: number) => {
      const dx = ex - lastMouse.x;
      const dy = ey - lastMouse.y;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 5) {
        for (let i = headParticles.length - 1; i >= 0; i--) {
          const p = headParticles[i];
          const dist = Math.sqrt(Math.pow(ex - p.x, 2) + Math.pow(ey - p.y, 2));

          if (dist < 100) {
            p.isAttached = false;
            p.vx = dx * 0.2 + (Math.random() - 0.5) * 5;
            p.vy = dy * 0.2 + (Math.random() - 0.5) * 5;
            particles.push(p);
            headParticles.splice(i, 1);
          }
        }
      }
      lastMouse.x = ex;
      lastMouse.y = ey;
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      lastMouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        handleBlowDrag(e.clientX - rect.left, e.clientY - rect.top);
      }
    };

    const onMouseUp = () => isDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      lastMouse = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        handleBlowDrag(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      }
    };

    const onTouchEnd = () => isDragging = false;

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', resize);

    resize();
    createDandelion();
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (regrowthTimer) clearTimeout(regrowthTimer);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {inputMode === 'prompt' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          <div className="relative max-w-md w-full mx-4 border border-outline-variant/30 bg-surface-container p-8 flex flex-col items-center gap-6">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h2 className="font-display-vhs text-primary text-xl tracking-tight text-center">
              MAKE A WISH
            </h2>
            <p className="font-body-md text-on-surface-variant text-sm text-center leading-relaxed">
              How do you want to blow away the dandelion seeds? You can use your microphone or your camera to detect blowing.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => handleSelectMode('mic')}
                className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-2xl">mic</span>
                <span className="font-technical-data text-xs uppercase tracking-widest">Sound (Mic)</span>
              </button>
              <button
                onClick={() => handleSelectMode('camera')}
                className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-4 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-2xl">videocam</span>
                <span className="font-technical-data text-xs uppercase tracking-widest">Face (Camera)</span>
              </button>
            </div>
            <button
              onClick={() => handleSelectMode('none')}
              className="mt-2 text-[10px] font-technical-data text-outline text-center hover:text-primary transition-colors uppercase tracking-widest"
            >
              Skip (Use Mouse/Touch only)
            </button>
          </div>
        </div>
      )}

      <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#4a2e15] via-[#a86524] to-[#161310] font-body-md text-on-surface">
        {/* Hidden video element for camera feed */}
        <video ref={videoRef} className="hidden" playsInline muted autoPlay />

        {/* Golden Hour Glow Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
          <div className="w-[800px] h-[800px] bg-primary rounded-full blur-[160px] transform -translate-y-1/4"></div>
        </div>
        
        {/* Grass Line Mask */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0a1a0a] to-transparent z-10 opacity-60 pointer-events-none"></div>

        {/* Interaction Instructions / Wish Prompt */}
        <div 
          ref={uiPromptRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[100px] z-20 text-center transition-all duration-1000 opacity-0 pointer-events-none"
        >
          <p className="font-label-handwritten text-4xl text-primary-fixed-dim drop-shadow-md">wish granted</p>
          <div className="mt-2 h-px w-24 bg-primary/30 mx-auto"></div>
        </div>

        {/* Feedback visual for blowing */}
        {blowingRef.current && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 text-primary animate-pulse">
            <span className="material-symbols-outlined text-sm">air</span>
            <span className="text-xs font-technical-data uppercase tracking-widest">
              Detecting Blow...
            </span>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full cursor-crosshair z-10 block"
        />
      </div>
    </>
  );
}

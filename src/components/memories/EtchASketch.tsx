"use client";

import { useEffect, useRef, useState } from "react";

export default function EtchASketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotationH, setRotationH] = useState(0);
  const [rotationV, setRotationV] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const stateRef = useRef({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    isDrawing: false,
    step: 2
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      stateRef.current.x = canvas.width / 2;
      stateRef.current.y = canvas.height / 2;
      stateRef.current.lastX = stateRef.current.x;
      stateRef.current.lastY = stateRef.current.y;
      
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      drawDot(stateRef.current.x, stateRef.current.y);
    };

    const drawDot = (px: number, py: number) => {
      ctx.beginPath();
      ctx.moveTo(stateRef.current.lastX, stateRef.current.lastY);
      ctx.lineTo(px, py);
      ctx.stroke();
      stateRef.current.lastX = px;
      stateRef.current.lastY = py;
    };

    const move = (dir: 'left' | 'right' | 'up' | 'down') => {
      const state = stateRef.current;
      if (dir === 'left') {
        state.x = Math.max(0, state.x - state.step);
        setRotationH(prev => prev - 15);
      } else if (dir === 'right') {
        state.x = Math.min(canvas.width, state.x + state.step);
        setRotationH(prev => prev + 15);
      } else if (dir === 'up') {
        state.y = Math.max(0, state.y - state.step);
        setRotationV(prev => prev - 15);
      } else if (dir === 'down') {
        state.y = Math.min(canvas.height, state.y + state.step);
        setRotationV(prev => prev + 15);
      }
      drawDot(state.x, state.y);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
    };

    const handleMouseDown = () => { stateRef.current.isDrawing = true; };
    const handleMouseUp = () => { stateRef.current.isDrawing = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const diffX = Math.abs(mouseX - stateRef.current.x);
      const diffY = Math.abs(mouseY - stateRef.current.y);
      
      if (diffX > diffY) {
        if (mouseX > stateRef.current.x) move('right');
        else move('left');
      } else {
        if (mouseY > stateRef.current.y) move('down');
        else move('up');
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      const diffX = Math.abs(touchX - stateRef.current.x);
      const diffY = Math.abs(touchY - stateRef.current.y);
      
      if (diffX > diffY) {
        if (touchX > stateRef.current.x) move('right');
        else move('left');
      } else {
        if (touchY > stateRef.current.y) move('down');
        else move('up');
      }
    };

    window.addEventListener('resize', initCanvas);
    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Delay init slightly to ensure container is fully sized
    setTimeout(initCanvas, 100);

    return () => {
      window.removeEventListener('resize', initCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleShake = () => {
    setIsShaking(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stateRef.current.x = canvas.width / 2;
        stateRef.current.y = canvas.height / 2;
        stateRef.current.lastX = stateRef.current.x;
        stateRef.current.lastY = stateRef.current.y;
        ctx.beginPath();
        ctx.moveTo(stateRef.current.lastX, stateRef.current.lastY);
        ctx.lineTo(stateRef.current.x, stateRef.current.y);
        ctx.stroke();
      }
      setIsShaking(false);
    }, 500);
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1614] overflow-hidden carpet-texture font-body-md">
      <style>{`
        .shake-animation {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-2px, 0, 0) rotate(-1deg); }
            20%, 80% { transform: translate3d(4px, 0, 0) rotate(2deg); }
            30%, 50%, 70% { transform: translate3d(-8px, 0, 0) rotate(-3deg); }
            40%, 60% { transform: translate3d(8px, 0, 0) rotate(3deg); }
        }
        .dial-turn {
            transition: transform 0.1s linear;
        }
        .crt-overlay {
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
            background-size: 100% 3px, 3px 100%;
            pointer-events: none;
        }
        .carpet-texture {
            background-image: radial-gradient(#2a2522 1px, transparent 0);
            background-size: 8px 8px;
        }
      `}</style>
      
      <div 
        ref={containerRef}
        className={`relative transition-transform duration-300 ${isShaking ? 'shake-animation' : ''}`}
      >
        <div className="bg-[#c41e1e] p-8 md:p-12 rounded-[2rem] shadow-[inset_0_4px_10px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.8)] border-b-8 border-r-8 border-black/30 relative w-[90vw] max-w-[800px]">
          
          {/* Gold Branding Labels */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex justify-between w-full px-12 items-center pointer-events-none">
            <span className="font-label-handwritten text-primary text-[24px] rotate-[-2deg]">magic screen</span>
            <span className="font-technical-data font-bold text-primary text-[18px] opacity-80 tracking-widest">REWOUND</span>
          </div>
          
          {/* Drawing Surface */}
          <div className="relative bg-[#a8a8a8] rounded-xl overflow-hidden shadow-[inset_4px_4px_12px_rgba(0,0,0,0.4)] border-4 border-[#8c161d]">
            <div className="crt-overlay absolute inset-0 z-10 opacity-40"></div>
            <canvas 
              ref={canvasRef}
              className="w-full h-[300px] md:h-[450px] cursor-crosshair mix-blend-multiply opacity-70 block" 
            />
          </div>
          
          {/* Controls Area */}
          <div className="mt-8 flex justify-between items-center px-4">
            {/* Left Dial */}
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-20 h-20 md:w-28 md:h-28 bg-[#f5f5f5] rounded-full shadow-[0_10px_0_#d1d1d1,0_15px_20px_rgba(0,0,0,0.4)] flex items-center justify-center dial-turn border-2 border-black/5 cursor-pointer active:scale-95" 
                style={{ transform: `rotate(${rotationH}deg)` }}
              >
                <div className="w-1 h-8 bg-[#d1d1d1] rounded-full"></div>
              </div>
              <span className="font-technical-data text-[10px] text-white/50 uppercase tracking-tighter">Horizontal</span>
            </div>
            
            {/* Shake Button */}
            <div className="flex flex-col items-center gap-4">
              <div className="hidden md:block text-center space-y-1">
                <p className="font-technical-data text-[12px] text-white/40">Use Arrow Keys to Draw</p>
              </div>
              <button 
                onClick={handleShake}
                className="bg-black/20 hover:bg-black/40 text-white/80 font-technical-data text-[14px] px-6 py-2 rounded-full border border-white/10 transition-all active:scale-90"
              >
                SHAKE TO ERASE
              </button>
            </div>
            
            {/* Right Dial */}
            <div className="flex flex-col items-center gap-2">
              <div 
                className="w-20 h-20 md:w-28 md:h-28 bg-[#f5f5f5] rounded-full shadow-[0_10px_0_#d1d1d1,0_15px_20px_rgba(0,0,0,0.4)] flex items-center justify-center dial-turn border-2 border-black/5 cursor-pointer active:scale-95" 
                style={{ transform: `rotate(${rotationV}deg)` }}
              >
                <div className="w-8 h-1 bg-[#d1d1d1] rounded-full"></div>
              </div>
              <span className="font-technical-data text-[10px] text-white/50 uppercase tracking-tighter">Vertical</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

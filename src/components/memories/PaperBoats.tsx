"use client";

import { useEffect, useRef, useState } from "react";

function FoldStepSvg({ step }: { step: number }) {
  const stroke = "#cbbbb0";
  const paper = "#e9e1dc";
  const shadow = "#d5c4b1";
  const deepShadow = "#b9a694";

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl transition-all duration-500 pointer-events-none">
      {step === 0 && (
        <path d="M25 10 L75 10 L75 90 L25 90 Z" fill={paper} stroke={stroke} strokeWidth="0.5" />
      )}
      {step === 1 && (
        <>
          <path d="M25 50 L75 50 L75 90 L25 90 Z" fill={paper} stroke={stroke} strokeWidth="0.5" />
          <line x1="25" y1="50" x2="75" y2="50" stroke={stroke} strokeWidth="1" strokeDasharray="2,2" />
        </>
      )}
      {step === 2 && (
        <>
          <path d="M25 50 L75 50 L75 80 L25 80 Z" fill={paper} stroke={stroke} strokeWidth="0.5" />
          <path d="M25 50 L50 75 L50 50 Z" fill={shadow} stroke={stroke} strokeWidth="0.5" />
          <path d="M75 50 L50 75 L50 50 Z" fill={shadow} stroke={stroke} strokeWidth="0.5" />
        </>
      )}
      {step === 3 && (
        <>
          <path d="M50 25 L80 55 L20 55 Z" fill={paper} stroke={stroke} strokeWidth="0.5" />
          <path d="M10 55 L90 55 L85 70 L15 70 Z" fill={shadow} stroke={stroke} strokeWidth="0.5" />
        </>
      )}
      {step === 4 && (
        <>
          <path d="M10 70 L50 70 L90 70 L75 85 L25 85 Z" fill={paper}></path>
          <path d="M50 70 L50 20 L80 70 Z" fill={shadow}></path>
          <path d="M50 70 L50 35 L25 70 Z" fill={deepShadow}></path>
        </>
      )}
    </svg>
  );
}

export default function PaperBoats() {
  type Mode = "folding" | "launching" | "sailing";
  const [mode, setMode] = useState<Mode>("folding");
  const [foldStep, setFoldStep] = useState(0);
  
  // Launch state
  const [launchPos, setLaunchPos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Sailing state
  const [boatPos, setBoatPos] = useState({ x: 50, y: 70, rot: 0 });
  const [velocity, setVelocity] = useState(0);
  const [stability, setStability] = useState("98.2%");
  const [debrisList, setDebrisList] = useState<{ id: number; top: number; left: number; speed: number; rot: number; type: string }[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const boatRef = useRef<HTMLDivElement>(null);
  const pavementRef = useRef<HTMLDivElement>(null);

  // Initialize debris when sailing starts
  useEffect(() => {
    if (mode !== "sailing") return;
    const initialDebris = [
      { id: 1, top: -20, left: 20, speed: 0.3, rot: 0, type: "eco" },
      { id: 2, top: -50, left: 65, speed: 0.4, rot: 0, type: "log" },
      { id: 3, top: -80, left: 40, speed: 0.5, rot: 45, type: "eco" }
    ];
    setDebrisList(initialDebris);
  }, [mode]);

  // Sailing Physics Loop
  useEffect(() => {
    if (mode !== "sailing") return;
    
    let animationFrame: number;
    let bX = boatPos.x;
    let bY = boatPos.y;
    let bRot = boatPos.rot;
    
    const update = () => {
      // Stream flows down, so we push the boat down slightly, but ripples/user keep it afloat
      // The boat bobs around a central y-axis instead of constantly sinking.
      // We apply a gentle drift back towards the center (y=70, x=50)
      
      const targetY = 70;
      const targetX = 50;
      
      bY += (targetY - bY) * 0.02 + Math.sin(Date.now() / 1500) * 0.1;
      bX += (targetX - bX) * 0.01 + Math.sin(Date.now() / 1000) * 0.05;
      
      // Clamp bounds
      if (bX < 15) bX = 15;
      if (bX > 85) bX = 85;
      if (bY > 90) bY = 90;
      if (bY < 10) bY = 10;
      
      bRot *= 0.95; // dampening
      
      setBoatPos({ x: bX, y: bY, rot: bRot });
      
      // Update Debris (they flow endlessly)
      setDebrisList(prev => prev.map(d => {
        let newTop = d.top + d.speed * 60 * 0.016;
        let newLeft = d.left + Math.sin(Date.now() / 2000 + d.id) * 0.1;
        if (newTop > 120) {
          newTop = -20;
          newLeft = 10 + Math.random() * 80;
        }
        return { ...d, top: newTop, left: newLeft };
      }));
      
      setVelocity(Math.abs((targetY - bY) * 0.02) + Math.abs(bRot / 50));
      animationFrame = requestAnimationFrame(update);
    };
    
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [mode]);

  const handleFoldClick = (step: number) => {
    setFoldStep(step);
    if (step === 4) {
      setTimeout(() => {
        // Prepare for launching
        setMode("launching");
        // Place boat on pavement
        if (pavementRef.current) {
          const rect = pavementRef.current.getBoundingClientRect();
          setLaunchPos({
            x: rect.width / 2,
            y: rect.height / 2
          });
        }
      }, 1000);
    }
  };

  const handleViewportClick = (e: React.MouseEvent) => {
    if (mode !== "sailing" || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);
    
    if (boatRef.current) {
      const bRect = boatRef.current.getBoundingClientRect();
      const bX = bRect.left + bRect.width / 2;
      const bY = bRect.top + bRect.height / 2;
      
      const dx = bX - e.clientX;
      const dy = bY - e.clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < 250) {
        // Push boat away from ripple
        const pushForce = (250 - dist) * 0.05;
        setBoatPos(prev => ({
          ...prev,
          x: prev.x + (dx / dist) * pushForce * (100 / rect.width),
          y: prev.y + (dy / dist) * pushForce * (100 / rect.height),
          rot: prev.rot + (dx / dist) * pushForce * 3
        }));
      }
    }
  };

  // Launch dragging events
  const onLaunchDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== "launching") return;
    isDraggingRef.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragOffsetRef.current = {
      x: clientX - launchPos.x,
      y: clientY - launchPos.y
    };
  };

  const onLaunchMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || mode !== "launching") return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragOffsetRef.current.x;
    const newY = clientY - dragOffsetRef.current.y;
    
    setLaunchPos({ x: newX, y: newY });
  };

  const onLaunchUp = () => {
    if (!isDraggingRef.current || mode !== "launching") return;
    isDraggingRef.current = false;
    
    // Check if dragged past pavement into water
    // Pavement is w-1/4, which is 25% of window width
    if (launchPos.x > window.innerWidth * 0.25) {
      // Launch!
      setMode("sailing");
      
      // Calculate relative position for water
      if (viewportRef.current) {
        const waterRect = viewportRef.current.getBoundingClientRect();
        const relativeX = ((launchPos.x - waterRect.left) / waterRect.width) * 100;
        const relativeY = ((launchPos.y - waterRect.top) / waterRect.height) * 100;
        setBoatPos({ x: relativeX, y: relativeY, rot: -15 });
      }
    } else {
      // Snap back
      if (pavementRef.current) {
        const rect = pavementRef.current.getBoundingClientRect();
        setLaunchPos({ x: rect.width / 2, y: rect.height / 2 });
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', onLaunchMove);
    window.addEventListener('mouseup', onLaunchUp);
    window.addEventListener('touchmove', onLaunchMove, { passive: false });
    window.addEventListener('touchend', onLaunchUp);
    return () => {
      window.removeEventListener('mousemove', onLaunchMove);
      window.removeEventListener('mouseup', onLaunchUp);
      window.removeEventListener('touchmove', onLaunchMove);
      window.removeEventListener('touchend', onLaunchUp);
    };
  });

  return (
    <div className="relative w-full h-full flex font-body-md overflow-hidden">
      <style>{`
        .water-surface {
            background: #161310;
            position: relative;
            overflow: hidden;
        }
        .water-surface::before {
            content: "";
            position: absolute;
            inset: -100%;
            background: 
                radial-gradient(circle at 50% 50%, rgba(2, 76, 127, 0.1) 0%, transparent 50%),
                repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(253, 186, 89, 0.03) 41px, transparent 42px);
            animation: water-move 10s linear infinite;
        }
        @keyframes water-move {
            0% { transform: translateY(0); }
            100% { transform: translateY(40px); }
        }
        .ripple {
            position: absolute;
            border: 2px solid rgba(253, 186, 89, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-effect 2s cubic-bezier(0, 0.5, 0.5, 1);
            pointer-events: none;
        }
        @keyframes ripple-effect {
            0% { transform: scale(0); opacity: 0.8; }
            100% { transform: scale(6); opacity: 0; }
        }
        .fold-marker {
            position: absolute;
            width: 32px;
            height: 32px;
            border: 2px dashed #9d8e7d;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 30;
            animation: pulse-marker 2s infinite;
        }
        @keyframes pulse-marker {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
        }
        .pavement-texture {
            background-color: #100e0b;
            background-image: radial-gradient(#1e1b18 1px, transparent 0);
            background-size: 20px 20px;
        }
      `}</style>
      
      {/* Left Sidebar (Pavement) */}
      <div ref={pavementRef} className="hidden md:block w-1/4 h-full pavement-texture border-r border-outline-variant/30 relative shadow-[inset_-20px_0_40px_rgba(0,0,0,0.5)] z-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 rotate-12 opacity-40 whitespace-nowrap">
          {mode === "launching" ? (
            <p className="font-label-handwritten text-2xl text-primary animate-pulse">Push it in.</p>
          ) : mode === "sailing" ? (
            <p className="font-label-handwritten text-2xl text-on-surface-variant">Bon voyage.</p>
          ) : (
            <p className="font-label-handwritten text-2xl text-on-surface-variant">Fold the boat.</p>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={viewportRef}
        className="flex-1 h-full relative overflow-hidden water-surface cursor-crosshair z-10"
        onMouseDown={handleViewportClick}
      >
        {/* Phase 1: Folding */}
        {mode === "folding" && (
          <div className="absolute inset-0 flex items-center justify-center z-30 transition-opacity duration-1000">
            <div className="absolute top-12 left-8 pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="font-technical-data text-xs text-primary uppercase tracking-widest">Initialization...</span>
              </div>
              <p className="font-technical-data text-[10px] text-on-surface-variant/70">SEQUENCE: 01_ORIGAMI</p>
            </div>

            <div className="relative w-96 h-96">
              <FoldStepSvg step={foldStep} />
              
              {foldStep === 0 && (
                <div className="fold-marker" style={{ top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }} onClick={(e) => { e.stopPropagation(); handleFoldClick(1); }}>
                  <span className="material-symbols-outlined text-xs">touch_app</span>
                </div>
              )}
              {foldStep === 1 && (
                <div className="fold-marker" style={{ top: '50%', left: '25%', transform: 'translate(-50%, -50%)' }} onClick={(e) => { e.stopPropagation(); handleFoldClick(2); }}>
                  <span className="material-symbols-outlined text-xs">touch_app</span>
                </div>
              )}
              {foldStep === 2 && (
                <div className="fold-marker" style={{ bottom: '20%', left: '50%', transform: 'translate(-50%, 50%)' }} onClick={(e) => { e.stopPropagation(); handleFoldClick(3); }}>
                  <span className="material-symbols-outlined text-xs">touch_app</span>
                </div>
              )}
              {foldStep === 3 && (
                <div className="fold-marker" style={{ top: '55%', left: '50%', transform: 'translate(-50%, -50%)' }} onClick={(e) => { e.stopPropagation(); handleFoldClick(4); }}>
                  <span className="material-symbols-outlined text-xs">open_with</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phase 3: Sailing */}
        {mode === "sailing" && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute top-12 left-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></div>
                <span className="font-technical-data text-xs text-blue-300 uppercase tracking-widest">Tracking...</span>
              </div>
              <p className="font-technical-data text-[10px] text-on-surface-variant/50">MEM_SEGMENT: 004_RIVER</p>
            </div>

            {/* Ripples */}
            {ripples.map(r => (
              <div key={r.id} className="ripple" style={{ left: r.x - 20, top: r.y - 20, width: 40, height: 40 }} />
            ))}

            {/* Debris */}
            {debrisList.map(d => (
              <div 
                key={d.id} 
                className={`absolute ${d.type === 'log' ? 'w-12 h-2 bg-outline-variant/40 rounded-full' : 'w-8 h-8'}`}
                style={{ top: `${d.top}%`, left: `${d.left}%`, opacity: 0.4, transform: `rotate(${d.rot}deg)` }}
              >
                {d.type === 'eco' && <span className="material-symbols-outlined text-outline">eco</span>}
              </div>
            ))}

            {/* Sailing Boat */}
            <div 
              ref={boatRef}
              className="absolute w-24 h-24 transition-transform duration-100 ease-linear"
              style={{
                left: `${boatPos.x}%`,
                top: `${boatPos.y}%`,
                transform: `translate(-50%, -50%) rotate(${boatPos.rot}deg)`
              }}
            >
              <FoldStepSvg step={4} />
            </div>
          </div>
        )}
      </div>

      {/* Launching Boat Overlay */}
      {mode === "launching" && (
        <div 
          className="fixed w-32 h-32 z-50 cursor-grab active:cursor-grabbing transition-transform duration-75"
          style={{
            left: `${launchPos.x}px`,
            top: `${launchPos.y}px`,
            transform: 'translate(-50%, -50%) rotate(-10deg)',
            touchAction: 'none'
          }}
          onMouseDown={onLaunchDown}
          onTouchStart={onLaunchDown}
        >
          <FoldStepSvg step={4} />
        </div>
      )}

      {/* Right Sidebar */}
      <div className="hidden md:block w-1/4 h-full pavement-texture border-l border-outline-variant/30 shadow-[inset_20px_0_40px_rgba(0,0,0,0.5)] z-20">
        <div className="p-8 mt-12">
          <div className="bg-surface-container p-4 border border-outline-variant/20 rounded-lg">
            <h3 className="font-technical-data text-primary text-sm mb-4">MEMORY_LOG</h3>
            <div className="space-y-3 font-technical-data text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>VELOCITY</span>
                <span>{mode === "sailing" ? velocity.toFixed(2) : "0.00"} m/s</span>
              </div>
              <div className="flex justify-between">
                <span>STABILITY</span>
                <span>{mode === "sailing" ? stability : "---"}</span>
              </div>
              <div className="w-full bg-surface-dim h-1 mt-2">
                <div 
                  className="h-full bg-primary shadow-[0_0_8px_#ffc676] transition-all duration-500" 
                  style={{ width: mode === "sailing" ? '85%' : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

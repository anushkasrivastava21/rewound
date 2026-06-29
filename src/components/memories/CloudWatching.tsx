"use client";

import { useEffect, useState } from "react";

const cloudShapes = {
  default: "M25,60 Q15,60 15,50 Q15,40 25,40 Q25,30 35,30 Q45,30 45,40 Q55,40 55,50 Q55,60 45,60 Z",
  dog: "M20,60 Q10,50 15,30 Q20,10 30,20 Q35,15 40,20 Q50,10 55,30 Q60,50 50,60 Q40,65 30,60 Q25,65 20,60 Z",
  bunny: "M20,60 Q15,60 15,50 Q10,20 20,20 Q25,20 25,40 Q30,20 35,20 Q45,20 40,50 Q40,60 30,60 Z",
  whale: "M10,50 Q10,30 40,30 Q70,30 80,50 Q85,60 70,60 Q50,65 30,60 Q10,60 10,50 Z M75,45 Q85,40 90,45 Q90,55 75,50 Z"
};

const animals = [
  { name: "bunny", path: cloudShapes.bunny, phrase: "I see a bunny" },
  { name: "dog", path: cloudShapes.dog, phrase: "That looks like a puppy" },
  { name: "whale", path: cloudShapes.whale, phrase: "A giant whale!" }
];

interface CloudConfig {
  id: number;
  size: number;
  top: number;
  duration: number;
  delay: number;
}

function Cloud({ config, onIdentify }: { config: CloudConfig; onIdentify: (phrase: string) => void }) {
  const [currentPath, setCurrentPath] = useState(cloudShapes.default);
  const [isMorphed, setIsMorphed] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMorphed) return;
    setShowOptions(!showOptions);
  };

  const handleSelectAnimal = (e: React.MouseEvent, animalName: string) => {
    e.stopPropagation();
    setShowOptions(false);
    setIsMorphed(true);

    const animal = animals.find(a => a.name === animalName) || animals[0];
    setCurrentPath(animal.path);
    onIdentify(animal.phrase);

    setTimeout(() => {
      setCurrentPath(cloudShapes.default);
      onIdentify("");
      setTimeout(() => setIsMorphed(false), 2000);
    }, 4000);
  };

  return (
    <div 
      className="absolute z-10"
      style={{
        width: `${config.size}px`,
        height: `${config.size * 0.6}px`,
        top: `${config.top}%`,
        left: `-200px`,
        animation: `drift ${config.duration}s linear ${config.delay}s infinite`
      }}
    >
      <div className="relative w-full h-full">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl cursor-pointer">
          <path 
            d={currentPath}
            onClick={handleClick}
            className={`cloud-path ${isMorphed ? 'fill-white/90' : 'fill-white opacity-80'}`}
          />
        </svg>

        {showOptions && !isMorphed && (
          <div 
            className="absolute top-[80%] left-1/2 -translate-x-1/2 bg-surface-container/90 backdrop-blur-md border border-outline-variant/30 rounded-lg shadow-xl p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] font-technical-data text-outline mb-1 text-center uppercase tracking-widest whitespace-nowrap">What do you see?</p>
            {animals.map(a => (
              <button
                key={a.name}
                onClick={(e) => handleSelectAnimal(e, a.name)}
                className="px-3 py-1.5 text-xs font-technical-data text-on-surface hover:bg-primary/20 hover:text-primary rounded transition-colors capitalize text-left whitespace-nowrap"
              >
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CloudWatching() {
  const [clouds, setClouds] = useState<CloudConfig[]>([]);
  const [currentLabel, setCurrentLabel] = useState("");
  const [vhsClock, setVhsClock] = useState("00:00:00:00");

  useEffect(() => {
    // Generate 7 initial clouds
    const initialClouds = Array.from({ length: 7 }).map((_, i) => ({
      id: i,
      size: Math.random() * 150 + 100,
      top: Math.random() * 50 + 10,
      duration: Math.random() * 30 + 40,
      delay: Math.random() * -60
    }));
    setClouds(initialClouds);

    const interval = setInterval(() => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const f = String(Math.floor(Math.random() * 30)).padStart(2, '0');
      setVhsClock(`${h}:${m}:${s}:${f}`);
    }, 33);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex flex-col font-body-md text-on-surface">
      <style>{`
        @keyframes drift {
            from { transform: translateX(-200px); }
            to { transform: translateX(calc(100vw + 200px)); }
        }
        .cloud-path {
            transition: d 2s cubic-bezier(0.4, 0, 0.2, 1), fill 2s;
        }
        .chromatic-aberration {
            text-shadow: 2px 0 1px rgba(255,0,0,0.3), -2px 0 1px rgba(0,0,255,0.3);
        }
      `}</style>

      {/* Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#87CEEB] to-[#E0F7FA] opacity-80"></div>
      
      {/* Clouds */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-auto">
        {clouds.map(c => (
          <Cloud key={c.id} config={c} onIdentify={setCurrentLabel} />
        ))}
      </div>

      {/* Foreground Grass Silhouette */}
      <div className="absolute bottom-0 w-full h-32 z-20 pointer-events-none opacity-40">
        <svg className="w-full h-full fill-surface-container-lowest" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,120 L1200,120 L1200,40 C1150,60 1100,20 1050,50 C1000,80 950,30 900,60 C850,90 800,40 750,70 C700,100 650,50 600,80 C550,110 500,60 450,90 C400,120 350,70 300,100 C250,130 200,80 150,110 C100,140 50,90 0,120 Z"></path>
        </svg>
      </div>

      {/* VHS HUD Header */}
      <header className="absolute top-0 left-0 w-full z-50 flex justify-between items-start p-6 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-error rounded-full animate-pulse"></span>
            <span className="font-technical-data text-technical-data text-error tracking-widest uppercase">REC</span>
          </div>
        </div>
        <div className="text-right font-technical-data text-technical-data text-primary">
          <p>MEMORY_MODE: RELAX</p>
          <p>{vhsClock}</p>
          <p className="mt-2 text-on-surface-variant opacity-60">TRACKING...</p>
        </div>
      </header>

      {/* Dynamic Label */}
      <div 
        className={`absolute bottom-40 w-full text-center z-30 transition-opacity duration-1000 pointer-events-none ${currentLabel ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="font-label-handwritten text-[48px] text-surface-container-lowest drop-shadow-md">
          {currentLabel}
        </span>
      </div>

    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [stage, setStage] = useState(0);
  const [isFastMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('samstudios_splash_seen') === 'true';
    }
    return false;
  });

  // 4x faster if the user has already seen it this session
  const speed = isFastMode ? 0.25 : 1;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('samstudios_splash_seen', 'true');
    }

    // Stage 0: Black screen
    // Stage 1: Ignition spark
    // Stage 2: Text reveal & glow
    // Stage 3: The Dive / Zoom out
    // Finish: Unmount
    
    const t1 = setTimeout(() => setStage(1), 400 * speed);
    const t2 = setTimeout(() => setStage(2), 1000 * speed);
    const t3 = setTimeout(() => setStage(3), 3500 * speed);
    const t4 = setTimeout(() => onFinish(), 4800 * speed);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish, speed]);

  const text = "SAM STUDIOS";
  const letters = text.split("");

  return (
    <div className="fixed inset-0 z-[200] bg-[#020202] flex items-center justify-center overflow-hidden perspective-[1000px]">
      
      {/* Cinematic Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-50" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Ambient Deep Glow */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(229,9,20,0.15)_0%,_transparent_60%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 2 ? 1 : 0 }}
        transition={{ duration: 2 * speed }}
      />

      <AnimatePresence>
        {stage < 3 && (
          <motion.div
            key="logo-container"
            className="relative flex flex-col items-center justify-center z-20"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 3.5 * speed, ease: "easeOut" }}
            exit={{ 
              scale: 40, 
              opacity: 0, 
              filter: "blur(20px)"
            }}
            // Using a custom cubic-bezier for a dramatic "swoosh" dive into the screen
            style={{ transformOrigin: "center center" }}
          >
            {/* The Ignition Spark */}
            {stage === 1 && (
              <motion.div
                className="absolute h-[2px] bg-white shadow-[0_0_20px_2px_#E50914,0_0_40px_4px_#E50914]"
                initial={{ width: "0%", opacity: 0 }}
                animate={{ width: "150%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.6 * speed, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
              />
            )}

            {/* The Text */}
            <div className="flex space-x-1 sm:space-x-2 overflow-visible px-4 relative">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter relative"
                  initial={{ 
                    opacity: 0, 
                    y: 20, 
                    scale: 1.1,
                    filter: "blur(10px)" 
                  }}
                  animate={stage >= 2 ? { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    filter: "blur(0px)" 
                  } : {}}
                  transition={{ 
                    duration: 0.8 * speed, 
                    delay: (i * 0.06) * speed, 
                    ease: [0.2, 0.65, 0.3, 0.9] 
                  }}
                >
                  {/* Base Text */}
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 relative z-10">
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                  
                  {/* Glowing Outline / Shadow */}
                  <motion.span 
                    className="absolute inset-0 text-[#E50914] blur-[16px] z-0"
                    initial={{ opacity: 0 }}
                    animate={stage >= 2 ? { opacity: [0, 0.8, 0.3] } : {}}
                    transition={{ duration: 2 * speed, delay: (i * 0.06 + 0.2) * speed }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                </motion.span>
              ))}
              
              {/* Lens Flare Sweep */}
              {stage >= 2 && (
                <motion.div
                  className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 blur-[10px] skew-x-[-25deg] z-20 mix-blend-overlay"
                  initial={{ left: "-30%" }}
                  animate={{ left: "130%" }}
                  transition={{ duration: 1.8 * speed, delay: 0.4 * speed, ease: "easeInOut" }}
                />
              )}
            </div>

            {/* Subtitle */}
            <motion.div
              className="absolute -bottom-10 sm:-bottom-14 text-white/50 text-[9px] sm:text-[11px] font-bold tracking-[1em] uppercase"
              initial={{ opacity: 0, y: -10, filter: "blur(5px)" }}
              animate={stage >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 1.2 * speed, delay: 1.2 * speed, ease: "easeOut" }}
            >
              Originals
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

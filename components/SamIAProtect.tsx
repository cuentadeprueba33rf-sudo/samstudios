import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SamIAProtect: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <motion.div 
            animate={{ 
              width: isMinimized ? 'auto' : 'fit-content',
              padding: isMinimized ? '8px 12px' : '12px 24px'
            }}
            className="bg-black/40 backdrop-blur-xl border border-brand-500/30 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.15)] flex items-center gap-3 pointer-events-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-md animate-pulse" />
              <ShieldCheck className={`text-brand-400 transition-all duration-500 ${isMinimized ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </div>

            <AnimatePresence mode="wait">
              {!isMinimized ? (
                <motion.div 
                  key="expanded"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white tracking-widest uppercase italic">
                      SAM <span className="text-brand-500">IA</span> PROTECT
                    </span>
                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-tighter font-medium">
                    Autenticación y protección en tiempo real activada
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="minimized"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest">
                    Protección Activa
                  </span>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </motion.div>
              )}
            </AnimatePresence>

            {!isMinimized && (
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/10">
                <Lock className="h-3 w-3 text-gray-500" />
                <Zap className="h-3 w-3 text-gray-500" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

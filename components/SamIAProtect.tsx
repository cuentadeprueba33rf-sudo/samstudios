import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Zap, CheckCircle2, RefreshCw, AlertTriangle, WifiOff, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ProtectStatus = 'connecting' | 'connected' | 'retrying' | 'disconnected' | 'failed';

export const SamIAProtect: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [status, setStatus] = useState<ProtectStatus>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    simulateConnection();
    return clearTimers;
  }, []);

  const simulateConnection = (isRetry = false) => {
    clearTimers();
    setStatus(isRetry ? 'retrying' : 'connecting');
    setIsMinimized(false);

    timeoutRef.current = setTimeout(() => {
      const rand = Math.random();
      
      if (isRetry) {
        // If retrying, 60% chance of success
        if (rand < 0.6) {
          handleSuccess();
        } else if (retryCount < 3) { // Up to 3 retries now
          setRetryCount(prev => prev + 1);
          simulateConnection(true);
        } else {
          handleFailure();
        }
      } else {
        // Initial connection
        if (rand < 0.60) {
          // 60% success first try
          handleSuccess();
          
          // 25% chance to disconnect later (increased probability)
          if (Math.random() < 0.25) {
            timeoutRef.current = setTimeout(() => {
              handleDisconnect();
            }, 10000 + Math.random() * 20000); // 10-30s later (happens sooner)
          }
        } else if (rand < 0.90) {
          // 30% chance to need a retry
          setRetryCount(1);
          simulateConnection(true);
        } else {
          // 10% chance to fail completely
          handleFailure();
        }
      }
    }, 1500 + Math.random() * 2000); // 1.5-3.5s connection time (slightly faster)
  };

  const handleSuccess = () => {
    setStatus('connected');
    setRetryCount(0);
    timeoutRef.current = setTimeout(() => {
      setIsMinimized(true);
    }, 3000);
  };

  const handleFailure = () => {
    setStatus('failed');
    setIsMinimized(false);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  const handleDisconnect = () => {
    setStatus('disconnected');
    setIsMinimized(false);
    setCountdown(10);
    
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          simulateConnection(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getIcon = () => {
    switch (status) {
      case 'connecting':
        return <ShieldCheck className="text-primary h-5 w-5 animate-pulse" />;
      case 'connected':
        return <ShieldCheck className={`text-primary transition-all duration-500 ${isMinimized ? 'h-4 w-4' : 'h-5 w-5'}`} />;
      case 'retrying':
        return <RefreshCw className="text-secondary h-5 w-5 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="text-error h-5 w-5 animate-pulse" />;
      case 'failed':
        return <XCircle className="text-error h-5 w-5" />;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'connecting': return 'border-primary/30';
      case 'connected': return 'border-primary/30';
      case 'retrying': return 'border-secondary/30';
      case 'disconnected': return 'border-error/30';
      case 'failed': return 'border-error/30';
    }
  };

  const getShadowColor = () => {
    switch (status) {
      case 'connecting': return 'shadow-[0_0_30px_rgba(182,160,255,0.15)]';
      case 'connected': return 'shadow-[0_0_30px_rgba(182,160,255,0.15)]';
      case 'retrying': return 'shadow-[0_0_30px_rgba(0,175,254,0.15)]';
      case 'disconnected': return 'shadow-[0_0_30px_rgba(255,110,132,0.15)]';
      case 'failed': return 'shadow-[0_0_30px_rgba(255,110,132,0.15)]';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <motion.div 
            animate={{ 
              width: isMinimized ? 'auto' : 'fit-content',
              padding: isMinimized ? '8px 12px' : '12px 24px'
            }}
            className={`bg-surface/80 backdrop-blur-xl border ${getBorderColor()} rounded-full ${getShadowColor()} flex items-center gap-3 pointer-events-auto transition-colors duration-500`}
          >
            <div className="relative">
              {status === 'connected' && !isMinimized && <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />}
              {getIcon()}
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
                    <span className="text-[10px] font-headline font-black text-on-surface tracking-widest uppercase italic">
                      AETHER <span className="text-primary">PROTECT</span>
                    </span>
                    {status === 'connected' && <div className="h-1 w-1 rounded-full bg-secondary animate-pulse" />}
                    {status === 'connecting' && <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />}
                    {status === 'retrying' && <div className="h-1 w-1 rounded-full bg-secondary animate-pulse" />}
                    {status === 'disconnected' && <div className="h-1 w-1 rounded-full bg-error animate-pulse" />}
                    {status === 'failed' && <div className="h-1 w-1 rounded-full bg-error" />}
                  </div>
                  
                  <p className={`text-[9px] uppercase tracking-tighter font-label font-medium ${
                    status === 'failed' ? 'text-error' : 
                    status === 'disconnected' ? 'text-error' :
                    status === 'retrying' ? 'text-secondary' :
                    'text-on-surface-variant'
                  }`}>
                    {status === 'connecting' && 'Estableciendo conexión segura...'}
                    {status === 'connected' && 'Autenticación y protección activada'}
                    {status === 'retrying' && `Reconectando... (Intento ${retryCount})`}
                    {status === 'disconnected' && `Conexión perdida. Reconectando en ${countdown}s...`}
                    {status === 'failed' && 'Error crítico. Protección desactivada.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="minimized"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-label">
                    AETHER ACTIVA
                  </span>
                  <CheckCircle2 className="h-3 w-3 text-secondary" />
                </motion.div>
              )}
            </AnimatePresence>

            {!isMinimized && status === 'connected' && (
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-outline/20">
                <Lock className="h-3 w-3 text-on-surface-variant" />
                <Zap className="h-3 w-3 text-on-surface-variant" />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

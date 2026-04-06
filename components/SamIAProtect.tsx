import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, CheckCircle2, X } from 'lucide-react';

interface SamIAProtectProps {
  onClose: () => void;
}

export const SamIAProtect: React.FC<SamIAProtectProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative bg-[#0f1014] border border-brand-500/30 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden">
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.1),_transparent_70%)] pointer-events-none" />
        
        <div className="p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Large Shield Icon with Pulse */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-brand-400 to-brand-600 p-6 rounded-full shadow-2xl transform transition-transform duration-700 hover:scale-110">
              <ShieldCheck className="h-16 w-16 text-white" />
            </div>
            
            {/* Orbiting Elements */}
            <div className="absolute -top-2 -right-2 bg-green-500 p-1.5 rounded-full border-4 border-[#0f1014] animate-bounce">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center justify-center gap-2">
              SAM <span className="text-brand-500">IA</span> PROTECT
            </h2>
            <div className="h-1 w-24 bg-brand-500 mx-auto rounded-full" />
            <p className="text-gray-400 text-sm font-medium">Sistema de Navegación Blindada</p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full mb-8">
            <div className={`flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="bg-brand-500/10 p-2 rounded-lg">
                <Lock className="h-5 w-5 text-brand-400" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-bold text-sm">Escaneo de Enlaces</h4>
                <p className="text-gray-500 text-xs">Algoritmo activo verificando la integridad de cada servidor externo.</p>
              </div>
            </div>

            <div className={`flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="bg-brand-500/10 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-brand-400" />
              </div>
              <div className="text-left">
                <h4 className="text-white font-bold text-sm">Bloqueo de Intrusiones</h4>
                <p className="text-gray-500 text-xs">Protección contra scripts maliciosos y ventanas emergentes invasivas.</p>
              </div>
            </div>
          </div>

          <div className={`space-y-6 transition-all duration-700 ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto italic">
              "Navega con total tranquilidad. Nuestro algoritmo asegura que cada clic sea seguro, privado y libre de amenazas."
            </p>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 active:scale-95 uppercase tracking-widest text-sm"
            >
              Activar Protección y Entrar
            </button>
          </div>
        </div>

        {/* Close button (optional, but good for UX) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors p-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

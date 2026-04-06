import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';

interface ConstructionNotificationProps {
  onRequestClick: () => void;
}

export const ConstructionNotification: React.FC<ConstructionNotificationProps> = ({ onRequestClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (isClosed) return;
    
    // Show notification 3 seconds after mounting
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isClosed]);

  if (!isVisible || isClosed) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 animate-fade-in-up max-w-sm w-full">
      <div className="glass-panel shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group border border-white/10">
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
        
        <div className="flex items-start gap-4">
          <div className="bg-brand-500/20 p-2.5 rounded-xl text-brand-400 shrink-0 border border-brand-500/30">
            <MessageSquarePlus className="h-6 w-6" />
          </div>
          
          <div className="flex-1 pt-0.5">
            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
              ¿Buscas algo especial?
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Estamos construyendo el catálogo. Si no encuentras tu película favorita, <strong>¡puedes solicitarla!</strong>
            </p>
          </div>
          
          <button 
            onClick={() => setIsClosed(true)}
            className="text-gray-500 hover:text-white transition-colors shrink-0 p-1 rounded-full hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button 
          onClick={() => {
            onRequestClick();
            setIsClosed(true);
          }}
          className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
        >
          Solicitar Película
        </button>
      </div>
    </div>
  );
};
